const Promise = require('bluebird');
const chaiHttp = require('chai-http');
const chai = require('chai');
const server = require('./server');

chai.use(chaiHttp);
const API_PREFIX = '/v1';
const ACCESS_KEY = 'ejAhvOzPP0OL.UbXRkwxDFNCvGRoXOrgOWDJKMv8imJi5CYci78mZJhghAWG9N7ZtWPyWIj1O';

function getToken(method) {
  return new Promise((resolve, reject) => {
    chai.request(server)
      .post(API_PREFIX + '/tokens')
      .set('authorization', KEY_TOKEN)
      .send({ userAgent: 'UserAgent', method: method, ipAddress: '::1' })
      .end((err, res) => {
        if (err) {
          return reject(new Error(err));
        }
        resolve(res.body.token);
      });
  });
};

module.exports = {
  getToken: getToken,
  accessKey: ACCESS_KEY
};
