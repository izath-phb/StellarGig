import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AlertCard = ({ type = 'info', title, message, onClose }) => {
  const styles = {
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)',
      text: '#EF4444',
      icon: <AlertCircle size={24} color="#EF4444" />
    },
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.2)',
      text: '#22C55E',
      icon: <CheckCircle2 size={24} color="#22C55E" />
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
      text: '#F59E0B',
      icon: <Info size={24} color="#F59E0B" />
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.2)',
      text: '#3B82F6',
      icon: <Info size={24} color="#3B82F6" />
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div 
      className="alert-card fade-in"
      style={{
        background: currentStyle.bg,
        border: `1px solid ${currentStyle.border}`
      }}
    >
      <div className="alert-icon">
        {currentStyle.icon}
      </div>
      <div className="alert-content">
        <h4 style={{ color: currentStyle.text }}>{title}</h4>
        <p>{message}</p>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} style={{ color: currentStyle.text }}>
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default AlertCard;
