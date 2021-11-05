const path = require('path');
const WebTorrent = require('webtorrent');
const { Kafka } = require('kafkajs');
const config = require('shared/config');
const { upload, pipeFile } = require('shared/lib');
const fs = require('fs');
const { paths } = require('./config');

const client = new WebTorrent();

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: config.kafka.groupId });

const startQueue = async () => {
  await consumer.subscribe({
    topic: config.kafka.topics.downloads,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, _partition, message }) => {
      const value = JSON.parse(message.value);
      console.log({
        topic,
        value,
      });

      try {
        const filePipe = fs.createWriteStream(path.resolve(paths.torrents, value.torrentId));

        await pipeFile({
          Bucket: config.storage.buckets.torrentFiles,
          Key: value.torrentId,
          filePipe,
        });

        console.log('torrent file saved');
      } catch (err) {
        console.log(err);
      }
    },
  });

  console.log('Queue consumer ready');
};

startQueue();

// const magnetURI = path.resolve(__dirname, "torrents", "123.torrent");

// client.add(
//   magnetURI,
//   { path: path.resolve(__dirname, "downloads", "123") },
//   function (torrent) {
//     torrent.on("done", function () {
//       console.log("torrent download finished");
//     });
//     torrent.on("download", function (bytes) {
//       console.log("just downloaded: " + bytes);
//       console.log("total downloaded: " + torrent.downloaded);
//       console.log("download speed: " + torrent.downloadSpeed);
//       console.log("progress: " + torrent.progress);
//     });

//     torrent.on("error", function (error) {
//       console.log(magnetURI, error);
//     });
//   }
// );
