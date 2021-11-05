const { name } = require('./package.json');
const dbConfig = require('./migrate-mongo-config.js');

module.exports = {
  isProd: process.env.MODE === 'production',
  storage: {
    spaceEndpoint: 'fra1.digitaloceanspaces.com',
    buckets: {
      torrentFiles: 'torrent-files',
    },
  },
  db: {
    ...dbConfig,
    tables: {
      torrentFiles: 'torrent_files',
    },
  },
  kafka: {
    clientId: 'torrent',
    brokers: ['localhost:9092'],
    groupId: 'torrent',
    topics: {
      downloads: 'downloads',
    },
  },
};
