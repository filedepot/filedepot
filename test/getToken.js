const Promise = require('bluebird');
const chaiHttp = require('chai-http');
const chai = require('chai');
const server = require('./server');

chai.use(chaiHttp);
const API_PREFIX = '/v1';
const ACCESS_KEY = 'ejAhvOzPP0OL.UbXRkwxDFNCvGRoXOrgOWDJKMv8imJi5CYci78mZJhghAWG9N7ZtWPyWIj1O';

function getToken(method, object) {
  return new Promise((resolve, reject) => {
    chai.request(server)
      .post(API_PREFIX + '/tokens')
      .set('authorization', ACCESS_KEY)
      .send({ userAgent: 'UserAgent', method: method, ipAddress: '::ffff:127.0.0.1', filename: object })
      .end((err, res) => {
        if (err) {
          return reject(new Error(err));
        }
        let resData = JSON.parse(res.text);
        resolve(resData.result);
      });
  });
};

module.exports = {
  getToken: getToken,
  accessKey: ACCESS_KEY
};
