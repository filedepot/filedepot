const http = require('http');
const debug = require('debug')('server');
const app = require('./app');

module.exports = {
  start: (port) => {
    app.set('port', port);

    var server = http.createServer(app);

    server.on('error', (error) => {
      onError(error, port);
    });

    server.on('listening', () => {
      onListening(server);
    });

    server.listen(port);
    return server;
  }
};

/*
 * Event listener for HTTP server "error" event.
 */
function onError(error, port) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug(bind + ' requires elevated privileges');
      throw new Error('Insufficient privileges');
    case 'EADDRINUSE':
      debug(bind + ' is already in use');
      throw new Error('Port in use');
    default:
      throw error;
  }
}

/*
 * Event listener for HTTP server "listening" event.
 */
function onListening(server) {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
