/**
 * Crypt Lavender - TradingView Lightweight Candlestick Chart Engine
 */

class LavenderCandlestickChart {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || !window.LightweightCharts) return;

    this.chart = null;
    this.candleSeries = null;
    this.volumeSeries = null;
    this.activeSymbol = 'LAV';

    this.initChart();
  }

  initChart() {
    // Clear container
    this.container.innerHTML = '';

    const chartOptions = {
      width: this.container.clientWidth,
      height: 340,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#948bb5',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      },
      grid: {
        vertLines: { color: 'rgba(167, 139, 250, 0.05)' },
        horzLines: { color: 'rgba(167, 139, 250, 0.05)' }
      },
      crosshair: {
        mode: window.LightweightCharts.CrosshairMode.Normal,
        vertLine: {
          color: '#a78bfa',
          width: 1,
          style: 3,
          labelBackgroundColor: '#171030'
        },
        horzLine: {
          color: '#a78bfa',
          width: 1,
          style: 3,
          labelBackgroundColor: '#171030'
        }
      },
      rightPriceScale: {
        borderColor: 'rgba(167, 139, 250, 0.15)',
        textColor: '#948bb5'
      },
      timeScale: {
        borderColor: 'rgba(167, 139, 250, 0.15)',
        timeVisible: true,
        secondsVisible: false
      }
    };

    this.chart = window.LightweightCharts.createChart(this.container, chartOptions);

    // Candlestick Series (Bullish: Mint, Bearish: Rose)
    const candleOptions = {
      upColor: '#34d399',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#34d399',
      wickDownColor: '#f87171'
    };

    if (typeof this.chart.addCandlestickSeries === 'function') {
      this.candleSeries = this.chart.addCandlestickSeries(candleOptions);
    } else if (typeof this.chart.addSeries === 'function' && window.LightweightCharts.CandlestickSeries) {
      this.candleSeries = this.chart.addSeries(window.LightweightCharts.CandlestickSeries, candleOptions);
    }

    // Volume Histogram Series
    const volumeOptions = {
      color: 'rgba(167, 139, 250, 0.3)',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    };

    if (typeof this.chart.addHistogramSeries === 'function') {
      this.volumeSeries = this.chart.addHistogramSeries(volumeOptions);
    } else if (typeof this.chart.addSeries === 'function' && window.LightweightCharts.HistogramSeries) {
      this.volumeSeries = this.chart.addSeries(window.LightweightCharts.HistogramSeries, volumeOptions);
    }

    // Crosshair hover update for OHLC readout bar
    this.chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const priceData = param.seriesData.get(this.candleSeries);
        if (priceData) {
          this.updateOHLCReadout(priceData);
        }
      }
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
      if (this.chart && this.container) {
        this.chart.applyOptions({ width: this.container.clientWidth });
      }
    });
  }

  loadSymbolData(symbol, timeframe = '1H') {
    this.activeSymbol = symbol;
    this.activeTimeframe = timeframe;
    
    const candles = window.cryptoFeed.getCandles(symbol, timeframe);
    if (!candles || candles.length === 0) return;

    // Load Candlestick data
    this.candleSeries.setData(candles);

    // Load Volume data
    const volumeData = candles.map(c => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(52, 211, 153, 0.35)' : 'rgba(248, 113, 113, 0.35)'
    }));
    this.volumeSeries.setData(volumeData);

    // Fit content
    this.chart.timeScale().fitContent();

    // Update OHLC readout for the latest candle
    const lastCandle = candles[candles.length - 1];
    if (lastCandle) {
      this.updateOHLCReadout(lastCandle);
    }
  }

  updateRealtimeTick(symbol, updatedToken) {
    if (symbol !== this.activeSymbol || !this.candleSeries) return;
    const candles = window.cryptoFeed.getCandles(symbol, this.activeTimeframe || '1H');
    const lastCandle = candles[candles.length - 1];
    
    if (lastCandle) {
      this.candleSeries.update(lastCandle);
      this.volumeSeries.update({
        time: lastCandle.time,
        value: lastCandle.volume,
        color: lastCandle.close >= lastCandle.open ? 'rgba(52, 211, 153, 0.35)' : 'rgba(248, 113, 113, 0.35)'
      });
      this.updateOHLCReadout(lastCandle);
    }
  }

  updateOHLCReadout(candle) {
    const format = (v) => window.cryptoFeed ? window.cryptoFeed.formatUSD(v) : `$${v}`;
    const openEl = document.getElementById('ohlc-open');
    const highEl = document.getElementById('ohlc-high');
    const lowEl = document.getElementById('ohlc-low');
    const closeEl = document.getElementById('ohlc-close');

    if (openEl) openEl.textContent = format(candle.open);
    if (highEl) highEl.textContent = format(candle.high);
    if (lowEl) lowEl.textContent = format(candle.low);
    if (closeEl) closeEl.textContent = format(candle.close);
  }
}

window.LavenderCandlestickChart = LavenderCandlestickChart;
