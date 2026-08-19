/**
 * Crypt Lavender - Main Application Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // State
  let activeTokenSymbol = 'LAV';
  let activeTimeframe = '1H';
  let priceChartInstance = null;
  let candlestickEngineInstance = null;

  // DOM Elements
  const chartCanvas = document.getElementById('price-chart');
  const candlestickContainer = document.getElementById('candlestick-chart-container');
  const viewCandlesBtn = document.getElementById('view-candles-btn');
  const viewLineBtn = document.getElementById('view-line-btn');
  const ohlcReadoutEl = document.getElementById('ohlc-readout');
  const tfBtns = document.querySelectorAll('.tf-btn');

  const tokenNameEl = document.getElementById('active-token-name');
  const tokenSymbolEl = document.getElementById('active-token-symbol');
  const tokenIconEl = document.getElementById('active-token-icon');
  const currentPriceEl = document.getElementById('active-current-price');
  const changeBadgeEl = document.getElementById('active-change-badge');
  const watchlistTableBody = document.getElementById('watchlist-tbody');

  // Chart View Toggle (Candles vs Line)
  if (viewCandlesBtn && viewLineBtn) {
    viewCandlesBtn.addEventListener('click', () => {
      viewCandlesBtn.classList.add('active');
      viewLineBtn.classList.remove('active');
      if (candlestickContainer) candlestickContainer.style.display = 'block';
      if (chartCanvas) chartCanvas.style.display = 'none';
      if (ohlcReadoutEl) ohlcReadoutEl.style.display = 'flex';
    });

    viewLineBtn.addEventListener('click', () => {
      viewLineBtn.classList.add('active');
      viewCandlesBtn.classList.remove('active');
      if (candlestickContainer) candlestickContainer.style.display = 'none';
      if (chartCanvas) chartCanvas.style.display = 'block';
      if (ohlcReadoutEl) ohlcReadoutEl.style.display = 'none';
    });
  }

  // Timeframe Selector Buttons (15M, 1H, 4H, 1D)
  tfBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tfBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTimeframe = btn.textContent.trim();
      updateChart(activeTokenSymbol);
    });
  });
  
  // Swap Elements
  const swapFromInput = document.getElementById('swap-from-amount');
  const swapToInput = document.getElementById('swap-to-amount');
  const swapFromBtn = document.getElementById('swap-from-token-btn');
  const swapToBtn = document.getElementById('swap-to-token-btn');
  const swapRateEl = document.getElementById('swap-rate');
  const swapImpactEl = document.getElementById('swap-price-impact');
  const swapMinRecEl = document.getElementById('swap-min-received');
  const swapActionBtn = document.getElementById('swap-action-btn');
  const swapSwitchBtn = document.getElementById('swap-switch-btn');

  // Staking Elements
  const stakeSlider = document.getElementById('stake-amount-slider');
  const stakeInput = document.getElementById('stake-amount-input');
  const durationPills = document.querySelectorAll('.duration-pill');
  const apyDisplayEl = document.getElementById('calc-apy-val');
  const estProfitLavEl = document.getElementById('calc-profit-lav');
  const estProfitUsdEl = document.getElementById('calc-profit-usd');
  const totalReturnUsdEl = document.getElementById('calc-total-usd');

  // Wallet Modal Elements
  const connectWalletBtns = document.querySelectorAll('.btn-connect-wallet');
  const walletModal = document.getElementById('wallet-modal');
  const closeModalBtn = document.getElementById('close-wallet-modal');
  const walletOptionBtns = document.querySelectorAll('.wallet-option-btn');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // Helper: Toast Notifications
  window.showToast = function(title, message, type = 'lavender') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '✨';
    if (type === 'mint') icon = '✅';
    if (type === 'rose') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-size: 1.2rem;">${icon}</span>
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">${title}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">${message}</div>
      </div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  };

  /* ==========================================================================
     1. CHART.JS INITIALIZATION & UPDATE
     ========================================================================== */
  function initChart() {
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(167, 139, 250, 0.45)');
    gradient.addColorStop(1, 'rgba(167, 139, 250, 0.0)');

    const tokenData = window.cryptoFeed.tokens[activeTokenSymbol];

    priceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
        datasets: [{
          label: tokenData.symbol,
          data: [...tokenData.history],
          borderColor: '#a78bfa',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          backgroundColor: gradient,
          pointBackgroundColor: '#d8b4fe',
          pointBorderColor: '#0b0718',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(23, 16, 48, 0.9)',
            borderColor: 'rgba(167, 139, 250, 0.4)',
            borderWidth: 1,
            titleFont: { family: 'Plus Jakarta Sans', size: 12 },
            bodyFont: { family: 'Space Grotesk', size: 14, weight: 'bold' },
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `$${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(167, 139, 250, 0.05)' },
            ticks: { color: '#948bb5', font: { family: 'Space Grotesk', size: 11 } }
          },
          y: {
            grid: { color: 'rgba(167, 139, 250, 0.05)' },
            ticks: { color: '#948bb5', font: { family: 'Space Grotesk', size: 11 } }
          }
        }
      }
    });

    // Initialize TradingView Candlestick Chart Engine
    if (window.LavenderCandlestickChart) {
      candlestickEngineInstance = new window.LavenderCandlestickChart('candlestick-chart-container');
      candlestickEngineInstance.loadSymbolData(activeTokenSymbol, activeTimeframe);
    }
  }

  function updateChart(symbol) {
    if (priceChartInstance) {
      const token = window.cryptoFeed.tokens[symbol];
      if (token) {
        priceChartInstance.data.datasets[0].label = `${token.symbol} (${activeTimeframe})`;
        priceChartInstance.data.datasets[0].data = [...token.history];
        priceChartInstance.data.datasets[0].borderColor = token.color || '#a78bfa';
        priceChartInstance.update();
      }
    }
    if (candlestickEngineInstance) {
      candlestickEngineInstance.loadSymbolData(symbol, activeTimeframe);
    }
  }

  /* ==========================================================================
     2. WATCHLIST TABLE RENDER
     ========================================================================== */
  function renderWatchlist() {
    if (!watchlistTableBody) return;
    watchlistTableBody.innerHTML = '';

    Object.values(window.cryptoFeed.tokens).forEach(t => {
      const isSelected = t.symbol === activeTokenSymbol;
      const isGain = t.change24h >= 0;

      const tr = document.createElement('tr');
      tr.className = `watchlist-row ${isSelected ? 'selected' : ''}`;
      tr.dataset.symbol = t.symbol;

      tr.innerHTML = `
        <td>
          <div class="token-cell">
            <div class="token-symbol-badge">${t.icon}</div>
            <div>
              <div style="font-weight: 700;">${t.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${t.symbol}</div>
            </div>
          </div>
        </td>
        <td class="font-mono" style="font-weight: 600;">${window.cryptoFeed.formatUSD(t.price)}</td>
        <td>
          <span class="badge ${isGain ? 'badge-mint' : 'badge-rose'}">
            ${isGain ? '▲ +' : '▼ '}${t.change24h}%
          </span>
        </td>
        <td class="font-mono" style="color: var(--text-muted);">${t.volume}</td>
        <td class="font-mono" style="color: var(--text-muted);">${t.marketCap}</td>
      `;

      tr.addEventListener('click', () => {
        selectActiveToken(t.symbol);
      });

      watchlistTableBody.appendChild(tr);
    });
  }

  function selectActiveToken(symbol) {
    activeTokenSymbol = symbol;
    const token = window.cryptoFeed.tokens[symbol];
    
    if (tokenNameEl) tokenNameEl.textContent = token.name;
    if (tokenSymbolEl) tokenSymbolEl.textContent = token.symbol;
    if (tokenIconEl) tokenIconEl.textContent = token.icon;
    if (currentPriceEl) currentPriceEl.textContent = window.cryptoFeed.formatUSD(token.price);
    
    if (changeBadgeEl) {
      const isGain = token.change24h >= 0;
      changeBadgeEl.className = `badge ${isGain ? 'badge-mint' : 'badge-rose'}`;
      changeBadgeEl.textContent = `${isGain ? '▲ +' : '▼ '}${token.change24h}%`;
    }

    renderWatchlist();
    updateChart(symbol);
  }

  // Subscribe to live price ticks
  window.cryptoFeed.subscribe((symbol, updatedToken) => {
    renderWatchlist();
    if (candlestickEngineInstance) {
      candlestickEngineInstance.updateRealtimeTick(symbol, updatedToken);
    }
    if (symbol === activeTokenSymbol) {
      if (currentPriceEl) currentPriceEl.textContent = window.cryptoFeed.formatUSD(updatedToken.price);
      if (priceChartInstance) {
        priceChartInstance.data.datasets[0].data = [...updatedToken.history];
        priceChartInstance.update('none');
      }
    }
    updateSwapQuote();
    updateYieldCalculations();
  });

  /* ==========================================================================
     3. SWAP WIDGET CONTROLLER
     ========================================================================== */
  let fromSymbol = 'ETH';
  let toSymbol = 'LAV';

  function updateSwapQuote() {
    if (!swapFromInput || !swapToInput) return;
    const amount = swapFromInput.value;
    const quote = window.swapEngine.calculateQuote(fromSymbol, toSymbol, amount);

    swapToInput.value = quote.amountTo;
    if (swapRateEl) swapRateEl.textContent = quote.exchangeRate;
    if (swapImpactEl) swapImpactEl.textContent = quote.priceImpact;
    if (swapMinRecEl) swapMinRecEl.textContent = quote.minimumReceived;
  }

  if (swapFromInput) {
    swapFromInput.addEventListener('input', updateSwapQuote);
  }

  if (swapSwitchBtn) {
    swapSwitchBtn.addEventListener('click', () => {
      const temp = fromSymbol;
      fromSymbol = toSymbol;
      toSymbol = temp;

      if (swapFromBtn) swapFromBtn.innerHTML = `${window.cryptoFeed.tokens[fromSymbol].icon} ${fromSymbol}`;
      if (swapToBtn) swapToBtn.innerHTML = `${window.cryptoFeed.tokens[toSymbol].icon} ${toSymbol}`;

      updateSwapQuote();
    });
  }

  if (swapActionBtn) {
    swapActionBtn.addEventListener('click', () => {
      const state = window.walletConnector.getState();
      if (!state.isConnected) {
        openModal();
        return;
      }

      const valFrom = swapFromInput.value;
      const valTo = swapToInput.value;

      if (!valFrom || parseFloat(valFrom) <= 0) {
        showToast('Invalid Amount', 'Please enter a valid swap amount.', 'rose');
        return;
      }

      swapActionBtn.disabled = true;
      swapActionBtn.innerHTML = `<span class="pulse-dot"></span> Processing Swap...`;

      window.swapEngine.executeSwap(fromSymbol, toSymbol, valFrom, valTo, (res) => {
        swapActionBtn.disabled = false;
        swapActionBtn.innerHTML = `Swap Tokens`;
        if (res.success) {
          showToast('Swap Confirmed', res.message, 'mint');
        }
      });
    });
  }

  /* ==========================================================================
     4. STAKING & YIELD CALCULATOR CONTROLLER
     ========================================================================== */
  let currentLockDays = 90;
  const stakeActionBtn = document.getElementById('stake-action-btn');

  function updateYieldCalculations() {
    if (!stakeInput) return;
    const amount = stakeInput.value;
    const calc = window.yieldCalc.calculateYield(amount, currentLockDays);

    if (apyDisplayEl) apyDisplayEl.textContent = `${calc.effectiveAPY}% APY`;
    if (estProfitLavEl) estProfitLavEl.textContent = `+${calc.estimatedProfitLAV} LAV`;
    if (estProfitUsdEl) estProfitUsdEl.textContent = `+$${calc.profitUSD}`;
    if (totalReturnUsdEl) totalReturnUsdEl.textContent = `$${calc.totalUSD}`;
  }

  if (stakeSlider && stakeInput) {
    stakeSlider.addEventListener('input', (e) => {
      stakeInput.value = e.target.value;
      updateYieldCalculations();
    });
    stakeInput.addEventListener('input', (e) => {
      stakeSlider.value = e.target.value;
      updateYieldCalculations();
    });
  }

  durationPills.forEach(pill => {
    pill.addEventListener('click', () => {
      durationPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentLockDays = parseInt(pill.dataset.days);
      updateYieldCalculations();
    });
  });

  if (stakeActionBtn) {
    stakeActionBtn.addEventListener('click', () => {
      const state = window.walletConnector.getState();
      if (!state.isConnected) {
        openModal();
        return;
      }

      const amount = parseFloat(stakeInput.value);
      if (!amount || amount <= 0) {
        showToast('Invalid Amount', 'Please enter a valid stake amount.', 'rose');
        return;
      }

      stakeActionBtn.disabled = true;
      stakeActionBtn.innerHTML = `<span class="pulse-dot"></span> Depositing to Vault...`;

      setTimeout(() => {
        stakeActionBtn.disabled = false;
        stakeActionBtn.innerHTML = `Stake LAV Tokens`;

        showToast('Staking Successful', `Successfully deposited ${amount.toLocaleString()} LAV into ${currentLockDays}-Day Vault!`, 'mint');

        // Append to activity feed
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
          const newItem = document.createElement('div');
          newItem.className = 'activity-item';
          newItem.style.animation = 'slideInToast 0.4s var(--ease-out-expo)';
          newItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="token-symbol-badge" style="background: rgba(52, 211, 153, 0.15); color: var(--accent-mint);">🪻</span>
              <div>
                <div style="font-weight: 600;">Staked ${amount.toLocaleString()} LAV</div>
                <div class="font-mono" style="font-size: 0.75rem; color: var(--text-muted);">${state.shortAddress} • ${currentLockDays} Days Vault</div>
              </div>
            </div>
            <div class="font-mono" style="font-size: 0.85rem; color: var(--accent-mint);">+$${(amount * (window.cryptoFeed ? window.cryptoFeed.tokens.LAV.price : 4.85)).toFixed(2)}</div>
          `;
          activityList.insertBefore(newItem, activityList.firstChild);
        }
      }, 1500);
    });
  }

  /* ==========================================================================
     5. WALLET MODAL & CONNECTIVITY
     ========================================================================== */
  function openModal() {
    if (walletModal) walletModal.classList.add('active');
  }
  function closeModal() {
    if (walletModal) walletModal.classList.remove('active');
  }

  connectWalletBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (walletModal) {
    walletModal.addEventListener('click', (e) => {
      if (e.target === walletModal) closeModal();
    });
  }

  walletOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.wallet;
      btn.innerHTML = `Connecting... <span class="pulse-dot"></span>`;
      
      window.walletConnector.connect(type, (res) => {
        closeModal();
        btn.innerHTML = `${type} <i data-lucide="chevron-right"></i>`;
        if (window.lucide) window.lucide.createIcons();
        showToast('Wallet Connected', `Connected to ${res.shortAddress || 'Wallet'}`, 'mint');
      });
    });
  });

  // Subscribe to wallet state
  window.walletConnector.subscribe((state) => {
    connectWalletBtns.forEach(btn => {
      if (state.isConnected) {
        btn.className = 'btn btn-glass btn-sm font-mono';
        btn.innerHTML = `<span class="pulse-dot"></span> ${state.shortAddress}`;
      } else {
        btn.className = 'btn btn-primary btn-sm btn-connect-wallet';
        btn.innerHTML = `<i data-lucide="wallet"></i> Connect Wallet`;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  });

  /* Initialize All */
  initChart();
  renderWatchlist();
  updateSwapQuote();
  updateYieldCalculations();
});
