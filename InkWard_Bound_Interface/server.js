const express = require('express');
const http    = require('http');
const path    = require('path');
const { WebSocketServer } = require('ws');

const app     = express();
const PORT    = process.env.PORT    || 3000;
const WS_PORT = process.env.WS_PORT || 9980;

// ── Static files (p5.js interface) ─────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HTTP server: http://localhost:${PORT}`);
});

// ── WebSocket relay server ──────────────────────────────────
// p5.js (browser) and TouchDesigner both connect here.
// Any message received from the browser is broadcast to all
// other connected clients — including TouchDesigner.
//
// TouchDesigner setup:
//   WebSocket DAT → Network Address: localhost (or this machine's IP)
//                 → Port: 9980
//                 → Active: On
//                 → (leave Protocol as "WebSocket" — default)
//   TD acts as a WebSocket CLIENT connecting to this server.

const wss = new WebSocketServer({ port: WS_PORT });

wss.on('listening', () => {
  console.log(`WebSocket relay: ws://localhost:${WS_PORT}`);
  console.log('Waiting for p5.js and TouchDesigner to connect...');
});

wss.on('connection', (socket, req) => {
  const addr = req.socket.remoteAddress;
  console.log(`[WS] client connected: ${addr}  (total: ${wss.clients.size})`);

  socket.on('message', (data) => {
    // Broadcast to every OTHER connected client (i.e., TD gets what p5 sends)
    wss.clients.forEach((client) => {
      if (client !== socket && client.readyState === 1 /* OPEN */) {
        client.send(data);
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
