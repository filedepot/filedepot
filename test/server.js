
require('dotenv').config({ silent: true });
process.env.DB_NAME = 'filedepot'
process.env.DB_CONFIG = '{"storage": "test/test.sqlite", "dialect": "sqlite"}';
process.env.DB_SYNC = false;

const server = require('../src/server');
process.env.LOG_SILENT = true;

let serverInstance = server.start(process.env.PORT || 3000);
module.exports = serverInstance;
