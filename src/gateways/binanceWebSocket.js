const WebSocket = require('ws');
const { BINANCE_WS_URL } = require('../config/env');

let latestTicks = [];
const MAX_TICKS = 25;

function startBinanceStream(broadcastCallback) {
    const ws = new WebSocket(BINANCE_WS_URL);

    ws.on('open', () => {
        console.log('[Binance Gateway] Connected successfully to public trade stream.');
    });

    ws.on('message', (data) => {
        try {
            const payload = JSON.parse(data.toString());
            const tick = {
                price: parseFloat(payload.p).toFixed(2),
                quantity: parseFloat(payload.q).toFixed(4),
                timestamp: new Date(payload.T).toLocaleTimeString(),
                isBuyerMaker: payload.m
            };

            latestTicks.unshift(tick);
            if (latestTicks.length > MAX_TICKS) latestTicks.pop();

            if (broadcastCallback) broadcastCallback(tick);
        } catch (error) {
            console.error('[Binance Gateway] Error parsing WebSocket frame:', error);
        }
    });

    ws.on('error', (err) => {
        console.error('[Binance Gateway] WebSocket error encountered:', err);
    });

    ws.on('close', () => {
        console.warn('[Binance Gateway] Connection closed. Reconnecting in 5 seconds...');
        setTimeout(() => startBinanceStream(broadcastCallback), 5000);
    });
}

function getLatestTicks() {
    return latestTicks;
}

module.exports = { startBinanceStream, getLatestTicks };