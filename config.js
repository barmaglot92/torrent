const { name } = require("./package.json");

module.exports = {
  isProd: process.env.MODE === "production",
  db: {
    tables: {
      downloads: "downloads",
    },
  },
  kafka: {
    clientId: name,
    brokers: ["localhost:9092"],
    groupId: "torrent",
    topics: {
      downloads: "downloads",
    },
  },
};
