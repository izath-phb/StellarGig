import React, { useState } from "react";

const SendPayment = ({ onSend, isSending, isConnected }) => {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination || !amount || parseFloat(amount) <= 0) return;
    onSend(destination, amount, memo);
  };

  if (!isConnected) return null;

  return (
    <div className="card send-card">
      <h2>Send XLM</h2>
      <form onSubmit={handleSubmit} className="send-form">
        <div className="form-group">
          <label htmlFor="destination">Recipient Address (Public Key)</label>
          <input
            type="text"
            id="destination"
            placeholder="G..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            disabled={isSending}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (XLM)</label>
          <input
            type="number"
            id="amount"
            placeholder="0.00"
            step="0.0000001"
            min="0.0000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={isSending}
          />
        </div>

        <div className="form-group">
          <label htmlFor="memo">Memo (Optional)</label>
          <input
            type="text"
            id="memo"
            placeholder="Text memo up to 28 chars"
            maxLength={28}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={isSending}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary submit-btn" 
          disabled={isSending || !destination || !amount}
        >
          {isSending ? "Sending Transaction..." : "Send XLM"}
        </button>
      </form>
    </div>
  );
};

export default SendPayment;
