const config = require('./config');
const path = require('path');

module.exports = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`,

    // TODO Change this to your database name:
    databaseName: process.env.DB_NAME,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout up to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout up to 1 hour
    },
  },

  // The migrations dir can be a relative or absolute path. Only edit this when really necessary.
  migrationsDir: path.resolve(__dirname, 'migrations'),

  // The MongoDB collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog',
};
