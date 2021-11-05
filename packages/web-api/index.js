const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const apiRouter = require('./api');
const MongoClient = require('mongodb').MongoClient;
const { Kafka } = require('kafkajs');
const fs = require('fs');
const path = require('path');

const config = require('shared/config');

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: config.kafka.groupId });

const startQueue = async () => {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topic: config.kafka.topics.downloads,
    fromBeginning: true,
  });

  console.log('Queue consumer ready');
};

const start = async () => {
  startQueue();

  const router = new Router();

  const app = new Koa();
  app.use(bodyParser());

  const client = await MongoClient.connect(config.db.mongodb.url, config.db.mongodb.options);

  const db = client.db(config.db.mongodb.databaseName);

  app.context.db = db;

  Object.assign(app.context, {
    kafka: {
      producer,
      consumer,
    },
  });

  router.use('/api', apiRouter.routes());

  app.use((ctx, next) => {
    return next().catch((err) => {
      const { statusCode, message } = err;

      ctx.type = 'json';
      ctx.status = statusCode || 500;
      ctx.body = {
        status: 'error',
        message: config.isProd ? undefined : message,
      };

      ctx.app.emit('error', err, ctx);
    });
  });

  app.on('error', (err) => {
    console.log('Error:', err.toString());
  });

  app.use(router.routes()).use(router.allowedMethods());

  console.log('web started on port', 3000);

  app.listen(3000);
};

async function exitHandler(options, exitCode) {
  if (options.cleanup) {
    console.log('cleanup');
    await producer.disconnect();
    await consumer.disconnect();
  }
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

start();
