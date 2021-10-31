const router = require("koa-router")();
const { searchTorrent } = require("./lib");
const { getNearNumber } = require("./utils");
const { kafka } = require("./config");

router.get("/search", async (ctx) => {
  // const torrents = await searchTorrent(ctx.request.query.q);
  const torrents = [
    {
      author: "dalemake",
      category: "Фильмы 2021",
      id: "6124535",
      leeches: 53,
      seeds: 447,
      size: 1570750854,
      state: "проверено",
      title:
        "Дюна / Dune (Дени Вильнёв / Denis Villeneuve) [2021, США, фантастика, боевик, драма, приключения, WEB-DLRip] Dub",
      downloads: 8883,
      registered: "2021-10-25T07:53:28.000Z",
      host: "http://rutracker.org",
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

router.post("/queue", async (ctx) => {
  if (!ctx.request.body.id) {
    ctx.throw(400, "download id required");
    next();
  }
  await ctx.kafka.producer.send({
    topic: kafka.topics.downloads,
    messages: [{ value: JSON.stringify({ id: ctx.request.body.id }) }],
  });

  ctx.body = { success: true };
});

module.exports = router;
