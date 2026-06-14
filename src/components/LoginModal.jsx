import React, { useState } from "react";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose, onConnect }) => {
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!password) return;
    
    setIsConnecting(true);
    
    setTimeout(async () => {
      if (password.trim() !== "stellar123") {
        setErrorMsg("Invalid password. Authentication failed.");
        setIsConnecting(false);
        return;
      }
      
      try {
        await onConnect();
        onClose();
        setPassword(""); // Reset form on close
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to connect to Freighter. Please unlock your wallet and allow access.");
      } finally {
        setIsConnecting(false);
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-effect">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <div className="secure-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2>Secure Login</h2>
          <p>Please enter the platform password to proceed.</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errorMsg && <div className="modal-error-alert">{errorMsg}</div>}
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="e.g. stellar123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="demo-hint">
            <small>💡 Demo Password: <strong>stellar123</strong></small>
          </div>

          <button 
            type="submit" 
            className="btn-power connect-btn"
            disabled={!password || isConnecting}
          >
            {isConnecting ? (
              <span className="loader-text">Authenticating...</span>
            ) : (
              "Login & Connect Freighter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
