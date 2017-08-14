const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('./server');

chai.use(chaiHttp);
const API_PREFIX = '/v1';

describe('Tokens', () => {
  describe('GET /tokens', () => {
    it('should not be available', (done) => {
      chai.request(server)
        .get(API_PREFIX + '/tokens')
        .end((err, res) => {
          res.should.have.status(404);
          res.text.should.be.a('string');
          let resData = JSON.parse(res.text);
          resData.should.have.property('status');
          resData.should.have.property('msg');
          done();
        });
    });
  });
});
