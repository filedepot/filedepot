require('dotenv').config({ silent: true });
process.env.DB_NAME = 'filedepot';
process.env.DB_CONFIG = '{"storage": "test/test.tmp.sqlite", "dialect": "sqlite", "logging": false}';
process.env.DB_SYNC = false;
process.env.API_AUTH_SECRET = 'TEST';
process.env.TOKEN_LIFE_MINUTES = 2;

require('./prepare');
const server = require('../src/server');
process.env.LOG_SILENT = true;

let serverInstance = server.start(process.env.PORT || 3000);
module.exports = serverInstance;
