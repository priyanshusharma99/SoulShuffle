const http = require('http');
const app = require('./src/app');
const { env } = require('./src/config/env');
const { initSocket } = require('./src/services/socketService');

const PORT = env.PORT || 3000;

// Wraps express with native node http to support websockets
const server = http.createServer(app);

// Initializes socket.io synchronously
initSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});
