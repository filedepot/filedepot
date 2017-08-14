const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('./server');

chai.use(chaiHttp);
const API_PREFIX = '/v1';

describe('Errors', () => {
  describe('/GET JSON 404 route', () => {
    it('it should return error message', (done) => {
      chai.request(server)
        .get(API_PREFIX + '/404')
        .set('Accept', 'application/json')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error');
          done();
        });
    });
  });

  describe('/GET HTML 406 route', () => {
    it('it should return error message', (done) => {
      chai.request(server)
        .get(API_PREFIX + '/404')
        .set('Accept', 'text/html')
        .end((err, res) => {
          res.should.have.status(406);
          done();
        });
    });
  });
});
