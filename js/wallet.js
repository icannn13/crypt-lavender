/**
 * Crypt Lavender - Web3 Wallet Connector Simulator
 */

class WalletConnector {
  constructor() {
    this.isConnected = false;
    this.walletType = null;
    this.address = null;
    this.balances = {
      ETH: '4.285',
      LAV: '1250.00',
      USDC: '3500.00',
      SOL: '18.50'
    };
    this.subscribers = [];

    // Load persisted state from localStorage
    this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem('crypt_lavender_wallet');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.isConnected) {
          this.isConnected = true;
          this.walletType = data.walletType;
          this.address = data.address;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  saveState() {
    localStorage.setItem('crypt_lavender_wallet', JSON.stringify({
      isConnected: this.isConnected,
      walletType: this.walletType,
      address: this.address
    }));
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.getState());
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.getState()));
  }

  getState() {
    return {
      isConnected: this.isConnected,
      walletType: this.walletType,
      address: this.address,
      shortAddress: this.address ? `${this.address.substring(0,6)}...${this.address.substring(38)}` : '',
      balances: this.balances
    };
  }

  connect(walletType, callback) {
    // Simulate web3 popup handshake delay
    setTimeout(() => {
      this.isConnected = true;
      this.walletType = walletType;
      this.address = '0x71C' + Array.from({length: 36}, () => Math.floor(Math.random()*16).toString(16)).join('');
      this.saveState();
      this.notify();
      if (callback) callback({ success: true, address: this.address, walletType });
    }, 800);
  }

  disconnect() {
    this.isConnected = false;
    this.walletType = null;
    this.address = null;
    localStorage.removeItem('crypt_lavender_wallet');
    this.notify();
  }
}

window.walletConnector = new WalletConnector();
