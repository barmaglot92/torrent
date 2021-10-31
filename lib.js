const RutrackerApi = require("rutracker-api");
const rutracker = new RutrackerApi();

const searchTorrent = (query) =>
  rutracker.search({ query }).catch((err) => {
    if (err.name === "NotAuthorizedError") {
      console.log("not authorized, try login");
      return rutracker
        .login({ username: process.env.RLOGIN, password: process.env.RPASS })
        .then(() => searchTorrent(query));
    } else {
      throw err;
    }
  });

const downloadTorrent = (id) =>
  rutracker.download(id).catch((err) => {
    if (err.name === "NotAuthorizedError") {
      console.log("not authorized, try login");
      return rutracker
        .login({ username: process.env.RLOGIN, password: process.env.RPASS })
        .then(() => downloadTorrent(id));
    } else {
      throw err;
    }
  });

module.exports = {
  searchTorrent,
  downloadTorrent,
};
