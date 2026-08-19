# 🪻 Crypt Lavender | Ethereal Crypto Terminal & Yield Analytics

> **Ethereal Intelligence & Decentralized Yield Platform**  
> Real-time market analytics, TradingView Candlestick charts, zero-impact token swaps, and automated liquid staking vaults tuned for high-yield decentralized finance.

---

## ✨ Features

- **🎨 Ethereal Midnight & Lavender Dark Theme**: Glassmorphic UI architecture with backdrop blur, custom CSS design tokens, and animated lavender canvas visualizer.
- **📊 Real-Time TradingView Candlestick Chart (OHLC)**: Live 60fps candlestick chart with volume histogram, OHLC price readout bar, and timeframe switchers (`15M`, `1H`, `4H`, `1D`).
- **⚡ Live Exchange API Feed**: Real-time price tracking synchronized directly with Gate.io Futures API and CoinGecko fallback.
- **🔄 Instant Lavender Swap Terminal**: Interactive token exchange simulator with slippage controls, gas estimation, price impact meter, and swap notifications.
- **🌾 Staking & Yield Vault Calculator**: Interactive deposit sliders, lock period pills (30d, 90d, 180d, 365d), compound APY calculations, and live stream of network transactions.
- **🦊 Web3 Wallet Connector Simulator**: Interactive modal supporting MetaMask, Phantom, WalletConnect, and Coinbase Wallet with live state management.

---

## 📁 Project Structure

```
crypt-lavender/
├── index.html              # Main terminal layout & modal dialogs
├── css/
│   ├── design-system.css   # CSS Variables, resets, glassmorphism utilities
│   ├── components.css      # Header, cards, swap widget, tables, modals
│   └── responsive.css      # Responsive styles for mobile & tablet
├── js/
│   ├── crypto-data.js      # Live market data feed & simulation engine
│   ├── visualizer.js       # HTML5 Canvas lavender mesh particle animation
│   ├── swap-engine.js      # Token swap & exchange rate math
│   ├── yield-calculator.js # Staking APY & compounding interest formulas
│   ├── wallet.js           # Web3 wallet connector state manager
│   ├── candlestick-chart.js# TradingView Lightweight Charts integration
│   └── app.js              # Application orchestrator & DOM events
└── README.md
```

---

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/icannn13/crypt-lavender.git
   cd crypt-lavender
   ```

2. Serve locally with any static web server:
   ```bash
   # Using Python
   python -m http.server 3000

   # Or using Node serve
   npx serve .
   ```

3. Open `http://localhost:3000` in your browser.

---

## 🛠️ Built With

- **HTML5 & Vanilla CSS3** (Custom Glassmorphism Design System)
- **Vanilla JavaScript (ES6 Modules)**
- **[TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts)**
- **[Chart.js](https://www.chartjs.org/)**
- **[Lucide Icons](https://lucide.dev/)**
- **[Gate.io Futures API](https://www.gate.io/docs/developers/apiv4)** & **[CoinGecko API](https://www.coingecko.com/en/api)**

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
