import React from 'react';
import { SUPPORTED_WALLETS } from '../services/walletService';
import { X } from 'lucide-react';

const WalletSelectionModal = ({ isOpen, onClose, onSelectWallet }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Connect Wallet</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <p className="modal-subtitle">Select your preferred Stellar wallet to continue.</p>
        
        <div className="wallet-options">
          {SUPPORTED_WALLETS.map(wallet => (
            <button 
              key={wallet.id}
              className="wallet-option-btn"
              onClick={() => onSelectWallet(wallet.id)}
            >
              <div className="wallet-info">
                <span className="wallet-name">{wallet.name}</span>
              </div>
              <div className="wallet-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletSelectionModal;
