/**
 * Crypt Lavender - Crypto Data Feed & Realtime Simulator
 */

const TOKENS = {
  LAV: {
    symbol: 'LAV',
    name: 'Crypt Lavender',
    price: 4.85,
    change24h: 18.42,
    high24h: 5.12,
    low24h: 4.05,
    volume: '14.2M',
    marketCap: '242.5M',
    icon: '🪻',
    color: '#a78bfa',
    history: [4.10, 4.25, 4.35, 4.50, 4.65, 4.78, 4.85]
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    gateSymbol: 'BTC_USDT',
    coingeckoId: 'bitcoin',
    price: 68787.90,
    change24h: 5.84,
    high24h: 69200.00,
    low24h: 67100.00,
    volume: '29.7B',
    marketCap: '1.37T',
    icon: '₿',
    color: '#f7931a',
    history: [66800, 67200, 67900, 68100, 68400, 68650, 68787.90]
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    gateSymbol: 'ETH_USDT',
    coingeckoId: 'ethereum',
    price: 2090.80,
    change24h: 9.13,
    high24h: 2120.00,
    low24h: 1980.00,
    volume: '13.5B',
    marketCap: '252.3B',
    icon: 'Ξ',
    color: '#627eea',
    history: [1980, 2010, 2040, 2030, 2070, 2085, 2090.80]
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    gateSymbol: 'SOL_USDT',
    coingeckoId: 'solana',
    price: 81.85,
    change24h: 6.02,
    high24h: 84.50,
    low24h: 78.20,
    volume: '2.7B',
    marketCap: '47.7B',
    icon: '◎',
    color: '#14f195',
    history: [77.5, 78.9, 79.8, 80.2, 81.1, 81.5, 81.85]
  },
  AVAX: {
    symbol: 'AVAX',
    name: 'Avalanche',
    gateSymbol: 'AVAX_USDT',
    coingeckoId: 'avalanche-2',
    price: 6.57,
    change24h: 3.26,
    high24h: 6.85,
    low24h: 6.30,
    volume: '174.6M',
    marketCap: '2.84B',
    icon: '🔺',
    color: '#e84142',
    history: [6.32, 6.38, 6.45, 6.48, 6.52, 6.55, 6.57]
  }
};

class CryptoDataFeed {
  constructor() {
    this.tokens = { ...TOKENS };
    this.subscribers = [];
    
    // Generate initial historical OHLC candles for all tokens
    this.generateInitialCandles();

    // Fetch real live prices immediately and start periodic API sync
    this.fetchLivePrices();
    this.startSimulation();
  }

  generateInitialCandles() {
    Object.keys(this.tokens).forEach(symbol => {
      const token = this.tokens[symbol];
      token.timeframeCandles = {};
    });
  }

  getCandles(symbol, timeframe = '1H') {
    const token = this.tokens[symbol];
    if (!token) return [];
    if (!token.timeframeCandles) token.timeframeCandles = {};

    if (!token.timeframeCandles[timeframe]) {
      let count = 45;
      let tfSec = 3600;
      if (timeframe === '15M') { tfSec = 900; count = 60; }
      if (timeframe === '4H') { tfSec = 14400; count = 40; }
      if (timeframe === '1D') { tfSec = 86400; count = 30; }

      token.timeframeCandles[timeframe] = this.createCandleHistory(token.price, count, tfSec);
    }
    return token.timeframeCandles[timeframe];
  }

  createCandleHistory(basePrice, count, timeframeSeconds = 3600) {
    const candles = [];
    const now = Math.floor(Date.now() / 1000);
    let currentPrice = basePrice * (timeframeSeconds >= 86400 ? 0.85 : 0.96);

    for (let i = count; i >= 0; i--) {
      const time = now - (i * timeframeSeconds);
      const volatilityRatio = timeframeSeconds >= 86400 ? 0.035 : (timeframeSeconds <= 900 ? 0.008 : 0.015);
      const volatility = currentPrice * volatilityRatio;
      const open = currentPrice;
      const change = (Math.random() - 0.48) * volatility;
      const close = parseFloat((open + change).toFixed(currentPrice < 10 ? 4 : 2));
      const high = parseFloat((Math.max(open, close) + Math.random() * volatility * 0.6).toFixed(currentPrice < 10 ? 4 : 2));
      const low = parseFloat((Math.min(open, close) - Math.random() * volatility * 0.6).toFixed(currentPrice < 10 ? 4 : 2));
      const volume = Math.floor(Math.random() * 50000 + 5000);

      candles.push({ time, open, high, low, close, volume });
      currentPrice = close;
    }

    // Force last candle close to equal exact basePrice
    const last = candles[candles.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, basePrice);
    last.low = Math.min(last.low, basePrice);

    return candles;
  }

  updateCandle(tokenSymbol, newPrice) {
    const token = this.tokens[tokenSymbol];
    if (!token || !token.timeframeCandles) return;

    Object.keys(token.timeframeCandles).forEach(tf => {
      const candles = token.timeframeCandles[tf];
      if (candles && candles.length > 0) {
        const lastCandle = candles[candles.length - 1];
        lastCandle.close = newPrice;
        lastCandle.high = Math.max(lastCandle.high, newPrice);
        lastCandle.low = Math.min(lastCandle.low, newPrice);
        lastCandle.volume += Math.floor(Math.random() * 150 + 10);
      }
    });
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify(tokenSymbol, updatedToken) {
    this.subscribers.forEach(cb => cb(tokenSymbol, updatedToken));
  }

  async fetchLivePrices() {
    // 1. Primary: Try Gate.io Futures API (Same as crypto-futures-analyzer)
    try {
      const symbols = ['BTC_USDT', 'ETH_USDT', 'SOL_USDT', 'AVAX_USDT'];
      for (const gateSym of symbols) {
        const res = await fetch(`https://api.gateio.ws/api/v4/futures/usdt/contracts/${gateSym}`);
        if (res.ok) {
          const data = await res.json();
          const lastPrice = parseFloat(data.last_price);
          
          // Match token
          const tokenKey = Object.keys(this.tokens).find(k => this.tokens[k].gateSymbol === gateSym);
          if (tokenKey && lastPrice > 0) {
            const token = this.tokens[tokenKey];
            token.price = lastPrice;
            token.history.shift();
            token.history.push(lastPrice);
            this.updateCandle(tokenKey, lastPrice);
            this.notify(tokenKey, token);
          }
        }
      }
    } catch (err) {
      console.warn('Gate.io Futures API fetch fallback to CoinGecko:', err);
      this.fetchCoinGeckoFallback();
    }
  }

  async fetchCoinGeckoFallback() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,avalanche-2&vs_currencies=usd&include_24hr_change=true');
      if (res.ok) {
        const data = await res.json();
        const mapping = {
          BTC: data.bitcoin,
          ETH: data.ethereum,
          SOL: data.solana,
          AVAX: data['avalanche-2']
        };

        Object.keys(mapping).forEach(sym => {
          if (mapping[sym] && mapping[sym].usd) {
            const token = this.tokens[sym];
            token.price = mapping[sym].usd;
            if (mapping[sym].usd_24h_change) {
              token.change24h = parseFloat(mapping[sym].usd_24h_change.toFixed(2));
            }
            token.history.shift();
            token.history.push(token.price);
            this.updateCandle(sym, token.price);
            this.notify(sym, token);
          }
        });
      }
    } catch (e) {
      console.error('API fetch error:', e);
    }
  }

  startSimulation() {
    // Sync live prices from exchange API every 8 seconds
    setInterval(() => {
      this.fetchLivePrices();
    }, 8000);

    // Micro-tick simulation between API polls
    setInterval(() => {
      const symbols = Object.keys(this.tokens);
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const token = this.tokens[randomSymbol];
      
      const deltaPercent = (Math.random() - 0.49) * 0.003;
      token.price = parseFloat((token.price * (1 + deltaPercent)).toFixed(token.price < 10 ? 4 : 2));
      token.history[token.history.length - 1] = token.price;
      this.updateCandle(randomSymbol, token.price);

      this.notify(randomSymbol, token);
    }, 2500);
  }

  formatUSD(val) {
    if (val >= 1000) {
      return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '$' + val.toFixed(val < 10 ? 4 : 2);
  }
}

window.cryptoFeed = new CryptoDataFeed();
