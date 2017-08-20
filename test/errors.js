const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('./server');

chai.use(chaiHttp);
const API_PREFIX = '/v1';

describe('Errors', () => {
  describe('GET JSON 404 route', () => {
    it('it should return error message', (done) => {
      chai.request(server)
        .get(API_PREFIX + '/404')
        .set('Accept', 'application/json')
        .then((res) => {
          throw new Error();
          done();
        })
        .catch((err) => {
          let res = err.response;
          res.should.have.status(404);
          res.text.should.be.a('string');
          let resData = JSON.parse(res.text);
          resData.should.have.property('status');
          resData.should.have.property('msg');
          done();
        });
    });
  });

  describe('GET HTML 406 route', () => {
    it('it should return error message', (done) => {
      chai.request(server)
        .get(API_PREFIX + '/404')
        .set('Accept', 'text/html')
        .then((res) => {
          throw new Error();
          done();
        })
        .catch((err) => {
          let res = err.response;
          res.should.have.status(406);
          res.text.should.be.a('string');
          res.text.should.be.equals('Page not found');
          done();
        });
    });
  });
});
