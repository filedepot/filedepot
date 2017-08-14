const server = require('../src/server');
process.env.LOG_SILENT = true;

let serverInstance = server.start(process.env.PORT || 3000);
module.exports = serverInstance;
