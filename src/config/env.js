require('dotenv').config();

module.exports = {
    PORT:process.env.PORT || 3000,
    BINANCE_WS_URL: 'wss://stream.binance.com:9443/ws/btcusdt@trade'
}

