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

let noop = () => {};

// configure a disk storage location for multer
const upload = multer({
  dest: process.env.TEMP_UPLOAD_PATH,
  storage: multer.diskStorage({
    filename: (req, file, callback) => {
      callback(null, file.fieldname + '-' + Date.now());
    }
  })
});

module.exports = router;

let preflightCorsDelegate = (req, callback) => {
  let origin = req.header('origin');
  var corsOptions = { origin: false };
  // check origin against access key's origin
  if (origin === req.key.origin) {
    corsOptions.origin = true;
  }
  callback(null, corsOptions);
};

router.options('/:bucketId/objects', require('../middlewares/preflightTokenAuth'), cors(preflightCorsDelegate));
router.put('/:bucketId/objects', require('../middlewares/tokenAuth'), cors(preflightCorsDelegate), upload.single('file'), (req, res, next) => {
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
      fs.rename(req.file.path, finalPathname, noop);

      res
        .json({
          "status": "ok",
          "result": finalFilename.toLowerCase()
        });
    })
    .catch(errorResponse(res));
});

router.delete('/:bucketId/objects/:filename', require('../middlewares/tokenAuth'), cors(preflightCorsDelegate), upload.single('file'), (req, res, next) => {
  let bucketId = req.params.bucketId;
  let filename = req.params.filename.toLowerCase();

  // ensure permissions is given for the correct file
  if (req.token.filename.toLowerCase() !== filename) {
    return errorResponse(res)(new Error('File operation invalid'));
  }

  req.key.getBucket()
    .then((bucket) => {
      if (!bucket || bucket.bucketId !== bucketId) {
        throw new NotFoundError('Bucket not found');
      }

      res
        .json({
          "status": "ok"
        });

      let pathnameActual = path.join(bucket.path, filename);
      fs.unlink(pathnameActual, noop);
    })
    .catch(errorResponse(res));
});

router.get('/:bucketId/objects/:filename', (req, res, next) => {
  let bucketId = req.params.bucketId;
  let filename = req.params.filename.toLowerCase();

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
