import React from "react";

const WalletCard = ({
  publicKey,
  balance,
  isConnected,
  onConnect,
  onDisconnect,
  onRefresh,
}) => {
  if (!isConnected) {
    return (
      <div className="card wallet-card disconnected-card">
        <div className="wallet-icon-wrapper pulse-animation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5 7.59l-9.71-3.24a1 1 0 0 1-.68-1.05l.5-4" />
            <path d="M22 13v-2" />
            <circle cx="17" cy="11" r="1" />
          </svg>
        </div>
        <h2>Unlock the Stellar Network</h2>
        <p>Connect your Freighter wallet to securely access your balance and send cross-border payments instantly.</p>
        <button className="btn btn-primary btn-glow" onClick={onConnect}>
          Connect Freighter Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="card wallet-card">
      <div className="wallet-header">
        <h2>Your Wallet</h2>
        <span className="badge">Network: Testnet</span>
      </div>
      
      <div className="wallet-info">
        <div className="info-group">
          <label>Public Key</label>
          <div className="public-key">{publicKey}</div>
        </div>
        
        <div className="info-group">
          <label>XLM Balance</label>
          <div className="balance-display">
            <span className="balance-amount">{balance}</span> XLM
          </div>
        </div>
      </div>

      <div className="wallet-actions">
        <button className="btn btn-secondary" onClick={onRefresh}>
          Refresh Balance
        </button>
        <button className="btn btn-danger" onClick={onDisconnect}>
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};

export default WalletCard;
