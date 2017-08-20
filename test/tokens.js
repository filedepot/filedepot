const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('./server');

chai.use(chaiHttp);
const API_PREFIX = '/v1';
const ACCESS_KEY = require('./getToken').accessKey;

describe('Tokens', () => {
  describe('GET /tokens', () => {
    it('should not be available', (done) => {
      chai.request(server)
        .get(API_PREFIX + '/tokens')
        .then((res) => {
          res.should.have.status(404);
          res.text.should.be.a('string');
          let resData = JSON.parse(res.text);
          resData.should.have.property('status');
          resData.status.should.be.equals('error');
          resData.should.have.property('msg');
          done();
        });
    });
  });

  describe('POST /tokens', () => {
    describe('using valid credentials', () => {
      it('should create a one-time token', (done) => {
        chai.request(server)
          .post(API_PREFIX + '/tokens')
          .set('authorization', ACCESS_KEY)
          .send({
            userAgent: 'UserAgent',
            method: 'PUT',
            ipAddress: '::1'
          })
          .then((res) => {
            res.should.have.status(200);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('ok');
            resData.should.have.property('result');
            done();
          });
      });
    });

    describe('using invalid credentials', () => {
      it('should reject the request', (done) => {
        chai.request(server)
          .post(API_PREFIX + '/tokens')
          .set('authorization', 'ANY')
          .send({
            userAgent: 'UserAgent',
            method: 'PUT',
            ipAddress: '::1'
          })
          .then((res) => {
            res.should.have.status(403);
            res.text.should.be.a('string');
            let resData = JSON.parse(res.text);
            resData.should.have.property('status');
            resData.status.should.be.equals('error');
            resData.should.have.property('msg');
            done();
          });
      });
    });
  });
});
