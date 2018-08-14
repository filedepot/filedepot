const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('./server');
const fs = require('fs-extra');

chai.use(chaiHttp);
const API_PREFIX = '/v1';
const getToken = require('./getToken').getToken;
const ACCESS_KEY = require('./getToken').accessKey;

const binaryParser = (res, cb) => {
  res.setEncoding("binary");
  res.data = "";
  res.on("data", (chunk) => {
    res.data += chunk;
  });
  res.on("end", () => {
    cb(null, Buffer.from(res.data, 'binary'));
  });
};

describe('Objects', () => {
  describe('PUT /buckets/:id/objects/:objName', () => {
    describe('using invalid credentials', () => {
      it('should reject the request', function (done) {
        this.slow(500);
        chai.request(server)
          .put(API_PREFIX + '/buckets/' + process.env.TEST_BUCKET_ID + '/objects/path/to/file.js')
          .set('authorization', 'ANY')
          .then((res) => {
            res.should.have.status(403);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('error');
            resData.should.have.property('msg');
            done();
          })
          .catch(done);
      });
    });

    describe('using valid credentials', () => {
      it('should accept the request and upload the file', function (done) {
        this.slow(500);
        getToken('PUT', 'path/to/file.js')
          .then((token) => {
            return chai.request(server)
              .put(API_PREFIX + '/buckets/' + process.env.TEST_BUCKET_ID + '/objects/path/to/file.js')
              // eslint-disable-next-line no-sync
              .attach('file', fs.readFileSync('test/tokens.js'), 'tokens.js')
              .set('authorization', token)
              .set('user-agent', 'UserAgent');
          })
          .then((res) => {
            res.should.have.status(200);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('ok');
            resData.should.not.have.property('msg');
            done();
          })
          .catch(done);
      });
    });
  });

  describe('GET /buckets/:id/objects/:objName', () => {
    describe('using non-existent object name', () => {
      it('should not be available', function (done) {
        this.slow(500);
        chai.request(server)
          .get(API_PREFIX + '/buckets/' + process.env.TEST_BUCKET_ID + '/objects/what-file.js')
          .then((res) => {
            res.should.have.status(404);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('error');
            resData.should.have.property('msg');
            done();
          })
          .catch(done);
      });
    });

    describe('using previously uploaded object name', () => {
      it('should be available', function (done) {
        this.slow(500);
        chai.request(server)
          .get(API_PREFIX + '/buckets/' + process.env.TEST_BUCKET_ID + '/objects/path/to/file.js')
          .buffer()
          .parse(binaryParser)
          .then((res) => {
            res.should.have.status(200);
            res.headers.should.have.property('content-type');
            res.headers['content-type'].should.include('application/javascript');
            fs.readFile('test/tokens.js')
              .then((content) => {
                res.body.equals(content).should.be.equals(true);
                done();
              });
          })
          .catch(done);
      });
    });
  });

  describe('DELETE /buckets/:id/objects/:objName', () => {
    describe('using non-existent object name', () => {
      it('should simply return ok regardless', function (done) {
        this.slow(500);
        chai.request(server)
          .delete(API_PREFIX + '/buckets/' + process.env.TEST_BUCKET_ID + '/objects/what-file.js')
          .set('authorization', ACCESS_KEY)
          .then((res) => {
            res.should.have.status(200);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('ok');
            done();
          })
          .catch(done);
      });
    });

    describe('using invalid access key', () => {
      it('should not be available', function (done) {
        this.slow(500);
        chai.request(server)
          .delete(API_PREFIX + '/buckets/' + process.env.TEST_BUCKET_ID + '/objects/path/to/file.js')
          .set('authorization', 'none')
          .then((res) => {
            res.should.have.status(403);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('error');
            resData.should.have.property('msg');
            done();
          })
          .catch(done);
      });
    });

    describe('using valid access key', () => {
      it('should process the request', function (done) {
        this.slow(500);
        chai.request(server)
          .delete(API_PREFIX + '/buckets/' + process.env.TEST_BUCKET_ID + '/objects/path/to/file.js')
          .set('authorization', ACCESS_KEY)
          .then((res) => {
            res.should.have.status(200);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('ok');
            done();
          })
          .catch(done);
      });

      it('file should no longer be available', function (done) {
        this.slow(500);
        chai.request(server)
          .get(API_PREFIX + '/buckets/' + process.env.TEST_BUCKET_ID + '/objects/path/to/file.js')
          .then((res) => {
            res.should.have.status(404);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('error');
            resData.should.have.property('msg');
            done();
          })
          .catch(done);
      });
    });
  });

});
