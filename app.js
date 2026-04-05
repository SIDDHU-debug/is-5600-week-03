const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;

const app = express();
const chatEmitter = new EventEmitter();

// allow browser to load files from /public
app.use(express.static(__dirname + '/public'));

// ---------- JSON ROUTE ----------
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3]
  });
}

// ---------- ECHO ROUTE ----------
function respondEcho(req, res) {
  const input = req.query.input || '';

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join('')
  });
}

// ---------- CHAT PAGE ----------
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
}

// ---------- RECEIVE MESSAGE ----------
function respondChat(req, res) {
  const message = req.query.message;

  chatEmitter.emit('message', message);
  res.end();
}

// ---------- SSE (LIVE UPDATES) ----------
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  const onMessage = (message) => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', onMessage);

  req.on('close', () => {
    chatEmitter.removeListener('message', onMessage);
  });
}

// ---------- ROUTES ----------
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// ---------- START SERVER ----------
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});