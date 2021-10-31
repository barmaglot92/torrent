import path from "path";
import WebTorrent from "webtorrent-hybrid";

const client = new WebTorrent();
const magnetURI = "./files" + "/torrents" + "/123.torrent";

client.add(magnetURI, function (torrent) {
  // Got torrent metadata!
  console.log("Client is downloading:", torrent.infoHash);

  torrent.on("download", function (bytes) {
    console.log("just downloaded: " + bytes);
    console.log("total downloaded: " + torrent.downloaded);
    console.log("download speed: " + torrent.downloadSpeed);
    console.log("progress: " + torrent.progress);
  });

  torrent.on("done", function () {
    console.log("torrent finished downloading");
    torrent.files.forEach(function (file) {
      // do something with file

    });
  });

  console.log(torrent.done)
});
