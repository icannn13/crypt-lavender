/**
 * Crypt Lavender - Yield & Staking APY Calculator
 */

class YieldCalculator {
  constructor() {
    this.baseAPY = 24.8; // 24.8% base annual yield
  }

  calculateYield(amountLAV, daysLock, compoundFrequency = 365) {
    const principal = parseFloat(amountLAV) || 0;
    const days = parseInt(daysLock) || 30;
    
    // Duration bonus APY (longer lock = higher APY multiplier)
    let durationMultiplier = 1.0;
    if (days >= 365) durationMultiplier = 1.45;      // 35.96% APY
    else if (days >= 180) durationMultiplier = 1.25; // 31.00% APY
    else if (days >= 90) durationMultiplier = 1.10;  // 27.28% APY

    const effectiveAPY = this.baseAPY * durationMultiplier;
    const r = effectiveAPY / 100;
    const t = days / 365;

    // Compound interest formula: A = P * (1 + r/n)^(n*t)
    const n = compoundFrequency;
    const totalAmount = principal * Math.pow(1 + (r / n), n * t);
    const estimatedProfitLAV = totalAmount - principal;

    const lavPrice = window.cryptoFeed ? window.cryptoFeed.tokens.LAV.price : 4.85;
    const profitUSD = estimatedProfitLAV * lavPrice;
    const totalUSD = totalAmount * lavPrice;

    return {
      effectiveAPY: effectiveAPY.toFixed(2),
      principalLAV: principal.toLocaleString(),
      totalAmountLAV: totalAmount.toFixed(2),
      estimatedProfitLAV: estimatedProfitLAV.toFixed(2),
      profitUSD: profitUSD.toFixed(2),
      totalUSD: totalUSD.toFixed(2),
      dailyRewardLAV: (estimatedProfitLAV / days).toFixed(2)
    };
  }
}

window.yieldCalc = new YieldCalculator();
