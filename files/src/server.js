const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

// Config & Models
const { initDB } = require('./models');
const apiRoutes = require('./routes/api');

// App Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', apiRoutes);

// Socket.io
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Make io accessible globally or pass it to controllers (keeping it simple for now)
app.set('io', io);

// Database Init
initDB();

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

// Prevent crash from node-zklib timeouts/errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Keep server running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Keep server running
});
