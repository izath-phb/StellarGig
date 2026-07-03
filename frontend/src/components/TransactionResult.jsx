import React from "react";

const TransactionResult = ({ status, hash, error, onDismiss }) => {
  if (!status) return null;

  const isSuccess = status === "success";

  return (
    <div className={`card result-card ${isSuccess ? "result-success" : "result-error"}`}>
      <div className="result-header">
        <h2>{isSuccess ? "Transaction Successful!" : "Transaction Failed"}</h2>
        <button className="close-btn" onClick={onDismiss}>&times;</button>
      </div>
      
      <div className="result-body">
        {isSuccess ? (
          <>
            <p>Your payment was successfully submitted to the Stellar Testnet.</p>
            <div className="hash-container">
              <span>Transaction Hash:</span>
              <div className="hash-value">{hash}</div>
            </div>
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${hash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              View on Stellar Expert
            </a>
          </>
        ) : (
          <>
            <p>There was an error processing your transaction.</p>
            <div className="error-message">{error}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionResult;
