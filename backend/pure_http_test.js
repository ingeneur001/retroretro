const http = require('http');

console.log('🔥 PURE HTTP SERVER - NO EXPRESS, NO SOCKET.IO');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(JSON.stringify({
    status: 'PURE_HTTP_OK',
    time: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    url: req.url
  }));
});

server.listen(3001, () => {
  console.log('🚀 Pure HTTP server on port 3001');
  console.log('📋 NO dependencies - should be bulletproof!');
});