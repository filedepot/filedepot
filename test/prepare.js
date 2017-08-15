const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const models = require('../src/models');

fs.copy('test/test.sqlite', 'test/test.tmp.sqlite')
  .then(() => {
    fs.chmod('test/test.tmp.sqlite', 0777);
    return fs.mkdtemp(path.join(os.tmpdir(), 'filedepot-'));
  })
  .then((path) => {
    models.Bucket
      .update(
        {
          path: path
        },
        {
          where: {
            bucketId: 'XvFgDxAD'
          }
        }
      )
  });
