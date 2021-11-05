// const { S3Client } = require('@aws-sdk/client-s3');
const aws = require('aws-sdk');

const { storage } = require('./config');

const spacesEndpoint = new aws.Endpoint(storage.spaceEndpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});

const upload = ({ Bucket, Key, Body }) => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  s3.upload({
    Bucket,
    Key,
    Body,
  }).send((err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });

  return promise;
};

const getObject = ({ Bucket, Key }) => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  s3.getObject({ Bucket, Key }, function (err, data) {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });

  return promise;
};

const pipeFile = ({ Bucket, Key, filePipe }) => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  filePipe.on('finish', () => {
    resolve();
  });

  filePipe.on('error', (err) => {
    reject(err);
  });

  s3.getObject({ Bucket, Key }).createReadStream().pipe(filePipe);

  return promise;
};

module.exports = {
  upload,
  getObject,
  pipeFile,
};
