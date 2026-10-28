const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { PORT } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const { startBinanceStream } = require('./gateways/binanceWebSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// App Configurations
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount Routes
app.use('/', authRoutes);

// Initialize Binance Live Stream & Broadcast to Sockets
startBinanceStream((tick) => {
    io.emit('live-tick', tick);
});

server.listen(PORT, () => {
    console.log(`[CryptoVelo Production] Server active on port ${PORT}`);
});