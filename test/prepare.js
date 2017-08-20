const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const models = require('filedepot-models');

process.env.TEST_BUCKET_ID = 'XvFgDxAD';

before((done) => {
  console.log('Setting up...');
  fs.copy('test/test.sqlite', 'test/test.tmp.sqlite')
    .then(() => {
      // decimal 511 = octal 0777
      fs.chmod('test/test.tmp.sqlite', 511);
      return fs.mkdtemp(path.join(os.tmpdir(), 'filedepot-'));
    })
    .then((pathname) => {
      return models.Bucket
        .update(
          {
            path: pathname
          },
          {
            where: {
              bucketId: process.env.TEST_BUCKET_ID
            }
          }
        );
    })
    .then(() => {
      console.log('Setup done.');
      done();
    });
});

after((done) => {
  console.log('Tearing down...');
  fs.unlink('test/test.tmp.sqlite')
    .then(() => {
      return models.Bucket
        .findOne({
          where: {
            bucketId: process.env.TEST_BUCKET_ID
          }
        });
    })
    .then((bucket) => {
      return fs.remove(bucket.path);
    })
    .then(() => {
      console.log('Teardown done.');
      done();
    });
});
