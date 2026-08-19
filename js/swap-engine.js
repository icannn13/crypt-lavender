/**
 * Crypt Lavender - Swap Engine & Transaction Simulator
 */

class SwapEngine {
  constructor() {
    this.slippage = 0.5; // percent
    this.fromToken = 'ETH';
    this.toToken = 'LAV';
    this.amountFrom = 1;
    this.gasFeeUSD = 2.45;
  }

  setSlippage(val) {
    this.slippage = parseFloat(val);
  }

  calculateQuote(fromSymbol, toSymbol, amount) {
    this.fromToken = fromSymbol;
    this.toToken = toSymbol;
    this.amountFrom = parseFloat(amount) || 0;

    const fromData = window.cryptoFeed.tokens[fromSymbol];
    const toData = window.cryptoFeed.tokens[toSymbol];

    if (!fromData || !toData || this.amountFrom <= 0) {
      return {
        amountTo: '0.00',
        exchangeRate: '0.00',
        priceImpact: '0.00%',
        minimumReceived: '0.00'
      };
    }

    // Exchange rate = (From Price / To Price)
    const rate = fromData.price / toData.price;
    const amountToRaw = this.amountFrom * rate;
    
    // Price impact formula based on trade size ratio
    const tradeValueUSD = this.amountFrom * fromData.price;
    const priceImpactVal = Math.min((tradeValueUSD / 500000) * 100, 4.5); // capped at 4.5%
    
    const minimumReceivedVal = amountToRaw * (1 - this.slippage / 100);

    return {
      amountTo: amountToRaw.toFixed(amountToRaw > 100 ? 2 : 4),
      exchangeRate: `1 ${fromSymbol} = ${rate.toFixed(4)} ${toSymbol}`,
      priceImpact: `${priceImpactVal.toFixed(2)}%`,
      minimumReceived: `${minimumReceivedVal.toFixed(4)} ${toSymbol}`,
      tradeValueUSD: tradeValueUSD.toFixed(2)
    };
  }

  executeSwap(fromSymbol, toSymbol, amountFrom, amountTo, callback) {
    // Simulate transaction lifecycle delay (1.8s)
    setTimeout(() => {
      const txHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      callback({
        success: true,
        hash: txHash,
        message: `Successfully swapped ${amountFrom} ${fromSymbol} for ${amountTo} ${toSymbol}`
      });
    }, 1800);
  }
}

window.swapEngine = new SwapEngine();
