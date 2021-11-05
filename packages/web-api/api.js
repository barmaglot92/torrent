const router = require('koa-router')();
const { searchTorrent, downloadTorrent } = require('./lib');
const { getNearNumber } = require('./utils');
const { kafka, db, storage } = require('shared/config');
const { upload, getObject } = require('shared/lib');
const { paths } = require('./config');
const path = require('path');

router.get('/search', async (ctx) => {
  // const torrents = await searchTorrent(ctx.request.query.q);
  const torrents = [
    {
      author: 'dalemake',
      category: 'Фильмы 2021',
      id: '6124535',
      leeches: 53,
      seeds: 447,
      size: 1570750854,
      state: 'проверено',
      title:
        'Дюна / Dune (Дени Вильнёв / Denis Villeneuve) [2021, США, фантастика, боевик, драма, приключения, WEB-DLRip] Dub',
      downloads: 8883,
      registered: '2021-10-25T07:53:28.000Z',
      host: 'http://rutracker.org',
    },
  ];

  const resultIndex = getNearNumber(
    torrents.map((item) => item.size),
    Math.pow(1024, 3) * 1.46
  );

  const result = resultIndex !== undefined ? torrents[resultIndex] : [];

  ctx.body = {
    data: result,
  };
});

router.post('/queue', async (ctx) => {
  const torrentId = ctx.request.body.id;
  if (!torrentId) {
    ctx.throw(400, 'download id required');
    next();
  }

  try {
    const res = await getObject({ Bucket: storage.buckets.torrentFiles, Key: torrentId });
    await ctx.kafka.producer.send({
      topic: kafka.topics.downloads,
      messages: [{ value: JSON.stringify({ torrentId }) }],
    });
  } catch (err) {
    if (err.code === 'NoSuchKey') {
      const stream = await downloadTorrent(torrentId);
      console.log('torrent file loaded');

      const res = await upload({
        Bucket: storage.buckets.torrentFiles,
        Key: torrentId,
        Body: stream,
      });

      console.log('torrent file uploaded to storage');
    }

    console.log('send to queue');

    await ctx.kafka.producer.send({
      topic: kafka.topics.downloads,
      messages: [{ value: JSON.stringify({ torrentId }) }],
    });
  }

  // const collection = ctx.db.collection(db.tables.torrentFiles);
  // const insert = await collection.insertOne({
  //   createDate: new Date(),
  // });

  ctx.body = { success: true };
});

module.exports = router;
