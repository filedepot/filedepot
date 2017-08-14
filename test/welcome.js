const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('./server');

chai.use(chaiHttp);
const API_PREFIX = '/v1';

describe('Welcome', () => {
  describe('/GET welcome', () => {
    it('it should return welcome message', (done) => {
      chai.request(server)
        .get(API_PREFIX + '/welcome')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          done();
        });
    });
  });
});
