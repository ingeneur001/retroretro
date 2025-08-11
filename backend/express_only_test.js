const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'EXPRESS_ONLY_OK',
    uptime: Math.floor(process.uptime()),
    time: new Date().toISOString()
  });
});

app.listen(3002, () => {
  console.log('🔥 EXPRESS-ONLY Server on port 3002');
});