const express = require('express');
const router = express.Router();
const models = require('filedepot-models');
const errorResponse = require('../libraries/error-res');
const NotFoundError = require('../libraries/notFoundError');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const hashFilename = require('../libraries/hashFilename');

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
  let corsOptions = {
    origin: false,
    credentials: true,
    optionsSuccessStatus: 200
  };

  // check origin against access key's origin
  if (origin === req.key.origin) {
    corsOptions.origin = true;
  }
  callback(null, corsOptions);
};

let objectRoute = router.route('/:bucketId/objects/:objName(*)');

objectRoute.options(require('../middlewares/preflightTokenAuth'), cors(preflightCorsDelegate));

objectRoute.put(require('../middlewares/tokenAuth'), cors(preflightCorsDelegate), upload.single('file'), (req, res, next) => {
  let reqBucketId = req.params.bucketId;
  let objName = req.params.objName;

  req.key.getBucket()
    .then((bucket) => {
      if (!bucket || bucket.bucketId !== reqBucketId) {
        throw new NotFoundError('Bucket not found');
      }

      let pathnameHash = hashFilename(bucket.bucketId, objName);
      let finalPathname = path.join(bucket.path, pathnameHash);

      res
        .json({
          "status": "ok"
        });

      // eslint-disable-next-line no-sync
      if (fs.existsSync(finalPathname)) {
        return fs.unlink(finalPathname)
          .then(() => {
            return fs.rename(req.file.path, finalPathname);
          });
      }
      return fs.rename(req.file.path, finalPathname);
    })
    .catch(errorResponse(res));
});

objectRoute.delete(require('../middlewares/keyAuth'), cors(preflightCorsDelegate), (req, res, next) => {
  let bucketId = req.params.bucketId;
  let objName = req.params.objName;

  req.key.getBucket()
    .then((bucket) => {
      if (!bucket || bucket.bucketId !== bucketId) {
        throw new NotFoundError('Bucket not found');
      }

      res
        .json({
          "status": "ok"
        });

      let pathnameHash = hashFilename(bucket.bucketId, objName);
      let pathnameActual = path.join(bucket.path, pathnameHash);
      try {
        // eslint-disable-next-line no-sync
        fs.unlinkSync(pathnameActual);
      } catch (err) {
        noop();
      }

      return null;
    })
    .catch(errorResponse(res));
});

objectRoute.get((req, res, next) => {
  let bucketId = req.params.bucketId;
  let objName = req.params.objName;

  models.Bucket
    .findOne({ where: { bucketId: { $eq: bucketId } } })
    .then((bucket) => {
      if (!bucket) {
        throw new NotFoundError('Bucket not found');
      }

      let pathnameHash = hashFilename(bucket.bucketId, objName);

      // eslint-disable-next-line no-sync
      if (!fs.existsSync(path.join(bucket.path, pathnameHash))) {
        throw new NotFoundError('File not found');
      }

      res
        .type(path.extname(objName))
        .sendFile(
          pathnameHash,
          {
            root: bucket.path,
            dotfiles: 'deny'
          }
        );
    })
    .catch(errorResponse(res));
});
