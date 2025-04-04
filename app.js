const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Text response for the root route
app.get('/', (req, res) => {
    res.send('hi');
});

// JSON response
app.get('/json', (req, res) => {
    res.json({ text: 'hi', numbers: [1, 2, 3] });
});

// Echo endpoint with query parameters
app.get('/echo', (req, res) => {
    const input = req.query.input || '';
    res.json({
        normal: input,
        shouty: input.toUpperCase(),
        charCount: input.length,
        backwards: input.split('').reverse().join(''),
    });
});

// Chat message handler
app.get('/chat', (req, res) => {
    const message = req.query.message;
    if (message) {
        chatEmitter.emit('message', message);
    }
    res.end();
});

// Server-Sent Events (SSE) for real-time chat updates
app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');

    const onMessage = (message) => {
        res.write(`data: ${message}\n\n`);
    };

    chatEmitter.on('message', onMessage);

    res.on('close', () => {
        chatEmitter.off('message', onMessage);
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
