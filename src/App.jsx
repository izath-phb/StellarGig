import { useState, useEffect } from "react";
import {
  checkFreighterInstalled,
  connectWallet,
  getAccountBalance,
  sendXlmTransaction
} from "./services/stellar";
import WalletCard from "./components/WalletCard";
import SendPayment from "./components/SendPayment";
import TransactionResult from "./components/TransactionResult";
import "./App.css";

function App() {
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState("0");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Transaction Result State
  const [txStatus, setTxStatus] = useState(null); // 'success' | 'error' | null
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");
  
  // Track successful transactions locally for the session
  const [txHistory, setTxHistory] = useState([]);

  useEffect(() => {
    const checkInstallation = async () => {
      const installed = await checkFreighterInstalled();
      setIsFreighterInstalled(installed);
    };
    checkInstallation();
  }, []);

  const handleConnect = async () => {
    try {
      const pubKey = await connectWallet();
      setPublicKey(pubKey);
      setIsConnected(true);
      await fetchBalance(pubKey);
      setActiveTab("dashboard"); // Auto switch to dashboard on connect
    } catch (error) {
      console.error("Connection failed", error);
    }
  };

  const handleDisconnect = () => {
    setPublicKey("");
    setBalance("0");
    setIsConnected(false);
    clearTransactionResult();
    setActiveTab("home"); // Auto switch to home on disconnect
  };

  const fetchBalance = async (key) => {
    try {
      const bal = await getAccountBalance(key);
      setBalance(bal);
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  };

  const handleSendPayment = async (destination, amount, memo) => {
    setIsSending(true);
    clearTransactionResult();

    try {
      const response = await sendXlmTransaction(publicKey, destination, amount, memo);
      setTxStatus("success");
      setTxHash(response.hash);
      
      // Save to local history
      setTxHistory(prev => [{
        id: response.hash,
        date: new Date().toLocaleString(),
        destination,
        amount
      }, ...prev]);
      
      // Refresh balance after successful payment
      await fetchBalance(publicKey);
    } catch (error) {
      setTxStatus("error");
      setTxError(error?.message || "Transaction failed to execute. Ensure destination exists or you have enough balance.");
    } finally {
      setIsSending(false);
    }
  };

  const clearTransactionResult = () => {
    setTxStatus(null);
    setTxHash("");
    setTxError("");
  };

  const renderContent = () => {
    if (activeTab === "transactions") {
      return (
        <section className="transactions-section fade-in">
          <div className="card">
            <h2>Recent Transactions</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Session history of your testnet transfers.</p>
            
            {txHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.6 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>No transactions made in this session yet.</p>
              </div>
            ) : (
              <div className="tx-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {txHistory.map(tx => (
                  <div key={tx.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#14B8A6', fontWeight: 'bold' }}>Sent {tx.amount} XLM</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{tx.date}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>To: {tx.destination}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>Hash: {tx.id}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <div className="fade-in">
        {activeTab === "home" && (
          <section className="hero-section">
            <h2>StellarGig</h2>
            <h3>Cross-Border Payment Starter dApp for Freelancers</h3>
            <p>
              StellarGig is a decentralized platform empowering freelancers and clients worldwide to seamlessly send and receive cross-border payments with near-zero fees, leveraging the speed and security of the Stellar network.
            </p>
          </section>
        )}

        {!isConnected ? (
          <section className="centered-wallet-container">
            <div className="single-column">
              <WalletCard
                isConnected={isConnected}
                publicKey={publicKey}
                balance={balance}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onRefresh={() => fetchBalance(publicKey)}
              />
            </div>
          </section>
        ) : (
          <section className="dashboard-grid">
            <div className="column">
              <WalletCard
                isConnected={isConnected}
                publicKey={publicKey}
                balance={balance}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onRefresh={() => fetchBalance(publicKey)}
              />
            </div>

            <div className="column">
              <SendPayment
                isConnected={isConnected}
                isSending={isSending}
                onSend={handleSendPayment}
              />

              <TransactionResult
                status={txStatus}
                hash={txHash}
                error={txError}
                onDismiss={clearTransactionResult}
              />
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="app-header full-width">
        <div className="header-content">
          <div className="header-logo">
            <h1>StellarGig</h1>
            <span className="badge testnet-badge">Testnet Mode</span>
          </div>
          
          <nav className="header-nav">
            <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>Home</a>
            <a href="#" className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>Dashboard</a>
            <a href="#" className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('transactions'); }}>Transactions</a>
          </nav>

          <div className="header-actions">
            {!isConnected ? (
              <button
                className="btn btn-outline"
                onClick={handleConnect}
                disabled={!isFreighterInstalled}
              >
                {isFreighterInstalled ? "Connect Wallet" : "Install Freighter"}
              </button>
            ) : (
              <button className="btn btn-outline-danger" onClick={handleDisconnect}>
                Disconnect
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="app-container">

        <main className="main-content">
          {renderContent()}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">StellarGig</div>
              <p className="footer-description">Cross-border payments made seamless, secure, and fast. Built on the Stellar Network.</p>
              <div className="social-links">
                <a href="#" className="social-icon" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="social-icon" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="link-column">
                <h4>Platform</h4>
                <a href="#">Network Stats</a>
                <a href="#">Security</a>
                <a href="#">Fees</a>
              </div>
              <div className="link-column">
                <h4>Hackathon</h4>
                <a href="#">White Belt</a>
                <a href="#">Documentation</a>
                <a href="#">Submission</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} StellarGig. All rights reserved.</p>
            <p className="footer-badge">
              🚀 Built for the <span>Stellar Hackathon</span>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
