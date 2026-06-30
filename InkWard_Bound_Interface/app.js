const express = require('express');
const http    = require('http');
const path    = require('path');
const { WebSocketServer } = require('ws');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;

// ── Static files (p5.js interface) ─────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── WebSocket relay server ──────────────────────────────────
// p5.js (browser) and TouchDesigner both connect here.
// Any message received from the browser is broadcast to all
// other connected clients — including TouchDesigner.
//
// Render / TouchDesigner setup:
//   WebSocket DAT → Network Address: inkward-bound.onrender.com
//                 → Port: 443 (secure WebSocket)
//                 → Active: On
//   TD acts as a WebSocket CLIENT connecting to this server.

const wss = new WebSocketServer({ server });

server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP and WebSocket server listening on port ${PORT}`);
  console.log('Waiting for p5.js and TouchDesigner to connect...');
});

wss.on('connection', (socket, req) => {
  const addr = req.socket.remoteAddress;
  console.log(`[WS] client connected: ${addr}  (total: ${wss.clients.size})`);

  socket.on('message', (data, isBinary) => {
    // Broadcast to every OTHER connected client (i.e., TD gets what p5 sends)
    wss.clients.forEach((client) => {
      if (client !== socket && client.readyState === 1 /* OPEN */) {
        client.send(data, { binary: isBinary });
      }
    });
  });

  socket.on('close', () => {
    console.log(`[WS] client disconnected: ${addr}  (total: ${wss.clients.size})`);
  });

  socket.on('error', (err) => {
    console.error(`[WS] error from ${addr}:`, err.message);
  });
});
