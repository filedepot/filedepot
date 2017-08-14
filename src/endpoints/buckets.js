const express = require('express');
const router = express.Router();
const models = require('../models');
const errorResponse = require('../libraries/error-res');
const NotFoundError = require('../libraries/notFoundError');
const crypto = require('crypto');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: process.env.TEMP_UPLOAD_PATH });

module.exports = router;

let preflightCorsDelegate = (req, callback) => {
  let origin = req.header('origin');
  var corsOptions = { origin: false };
  if (origin === req.key.origin) {
    corsOptions.origin = true;
  }
  callback(null, corsOptions);
};

router.options('/:bucketId', require('../middlewares/preflightTokenAuth'), cors(preflightCorsDelegate));
router.put('/:bucketId', require('../middlewares/tokenAuth'), cors(preflightCorsDelegate), upload.single('file'), (req, res, next) => {
  let reqBucketId = req.params.bucketId;
  let filename = req.body.filename;

  req.key.getBucket()
    .then((bucket) => {
      if (!bucket || bucket.bucketId !== reqBucketId) {
        throw new NotFoundError('Bucket not found');
      }

      var sha256Hash = crypto.createHash('sha256');
      sha256Hash.update(bucket.bucketId + '@@' + filename + '@@' + req.file.originalname);
      let pathnameHash = sha256Hash.digest('hex');

      var existCount = 0;
      let originalExt = path.extname(req.file.originalname);
      var finalFilename = pathnameHash + originalExt;
      var finalPathname = path.join(bucket.path, finalFilename);
      while (fs.existsSync(path)) {
        finalFilename = pathnameHash + '.' + existCount + originalExt;
        finalPathname = path.join(bucket.path, finalFilename);
        ++existCount;
      }
      fs.rename(req.file.path, finalPathname);

      res
        .json({
          "status": "ok",
          "result": finalFilename
        });
    })
    .catch(errorResponse(res));
});

router.get('/:bucketId/:filename', (req, res, next) => {
  let bucketId = req.params.bucketId;
  let filename = req.params.filename;

  models.Bucket
    .findOne({ where: { bucketId: { $eq: bucketId } } })
    .then((bucket) => {
      if (!bucket) {
        throw new NotFoundError('Bucket not found');
      }

      if (!fs.existsSync(path.join(bucket.path, filename))) {
        throw new NotFoundError('File not found');
      }
      
      res.sendfile(filename, { root: bucket.path });
    })
    .catch(errorResponse(res));
});
