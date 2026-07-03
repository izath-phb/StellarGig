import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, RotateCcw, Box, Hash, Loader2 } from 'lucide-react';
import { invokeContractMethod, getCounterValue, CONTRACT_ID, listenToEvents } from '../services/contractService';
import AlertCard from '../components/AlertCard';
import * as StellarSdk from "@stellar/stellar-sdk";

const ContractDashboard = ({ isConnected, publicKey, walletId, addActivity }) => {
  const [count, setCount] = useState("Loading...");
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("-");
  const [error, setError] = useState(null);
  const [successTx, setSuccessTx] = useState(null);
  
  const processedEvents = React.useRef(new Set());

  const fetchCount = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const val = await getCounterValue();
      setCount(val.toString());
      setLastUpdated(new Date().toLocaleTimeString());
      if (isManual) addActivity("Refreshed counter state manually.");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch contract state.");
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  const pollEvents = async () => {
    try {
      const eventsResp = await listenToEvents();
      const records = eventsResp.records || eventsResp || []; // handle if it returns records array or object
      let newEventFound = false;

      (Array.isArray(records) ? records : []).forEach(record => {
        if (!processedEvents.current.has(record.id)) {
          processedEvents.current.add(record.id);
          newEventFound = true;
          
          let eventType = "unknown";
          let val = "";
          try {
            // Soroban events often have the topics as scVals
            if (record.topic && record.topic.length > 1) {
                // Topic 0 is usually the event name 'counter', Topic 1 is the action 'increment' or 'reset'
                eventType = StellarSdk.scValToNative(record.topic[1]);
            }
            if (record.value) {
                val = StellarSdk.scValToNative(record.value);
            }
          } catch (e) {
            console.error("Error parsing event", e);
          }

          addActivity(`Contract Event [${eventType}]: Value changed to ${val}`);
        }
      });

      if (newEventFound) {
        fetchCount();
      }
    } catch (err) {
      console.error("Polling events failed:", err);
    }
  };

  useEffect(() => {
    fetchCount();
    // Poll every 10 seconds for testnet stability
    const interval = setInterval(() => {
      fetchCount();
      pollEvents();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action, actionName) => {
    if (!isConnected) {
      setError("Please connect your wallet first.");
      return;
    }
    
    setError(null);
    setSuccessTx(null);
    
    if (actionName === "increment") setIsIncrementing(true);
    if (actionName === "reset") setIsResetting(true);

    try {
      addActivity(`Invoking ${actionName}() on smart contract...`);
      const hash = await invokeContractMethod(publicKey, actionName, walletId);
      setSuccessTx(hash);
      addActivity(`Transaction success! ${actionName}() executed. Hash: ${hash.substring(0,6)}...`);
      await fetchCount();
    } catch (err) {
      const errMsg = err.message || "Unknown error";
      setError(errMsg);
      addActivity(`Transaction failed: ${errMsg.split(":")[0]}`);
    } finally {
      if (actionName === "increment") setIsIncrementing(true);
      if (actionName === "reset") setIsResetting(true);
      setIsIncrementing(false);
      setIsResetting(false);
    }
  };

  return (
    <div className="contract-dashboard fade-in">
      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <AlertCard 
            type={error.includes("REJECTED") ? "warning" : "error"} 
            title="Contract Interaction Failed" 
            message={error} 
            onClose={() => setError(null)} 
          />
        </div>
      )}

      {successTx && (
        <div style={{ marginBottom: '1rem' }}>
          <AlertCard 
            type="success" 
            title="Transaction Successful" 
            message={`Contract updated! Hash: ${successTx}`} 
            onClose={() => setSuccessTx(null)} 
          />
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <h2><Box size={20} style={{ display: 'inline', marginRight: '0.5rem', color: '#14B8A6' }} /> StellarGigCounter</h2>
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>Soroban Smart Contract</span>
        </div>
        
        <div className="contract-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div className="detail-item">
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Contract Address</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontFamily: 'monospace', color: '#e2e8f0', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.25rem' }}>
              <Hash size={16} color="#64748b" />
              {CONTRACT_ID.substring(0, 8)}...{CONTRACT_ID.substring(CONTRACT_ID.length - 8)}
            </div>
          </div>
          
          <div className="detail-item">
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Last Updated</span>
            <div style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: '#e2e8f0' }}>
              {lastUpdated}
            </div>
          </div>
        </div>

        <div className="counter-display" style={{ textAlign: 'center', margin: '3rem 0' }}>
          <span style={{ color: '#94a3b8', display: 'block', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Current Value</span>
          <div style={{ fontSize: '5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #14B8A6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
            {count}
          </div>
        </div>

        <div className="contract-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => handleAction('increment', 'increment')}
            disabled={!isConnected || isIncrementing || isResetting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isIncrementing ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
            Increment Counter
          </button>
          
          <button 
            className="btn btn-outline" 
            onClick={() => handleAction('reset', 'reset')}
            disabled={!isConnected || isIncrementing || isResetting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
          >
            {isResetting ? <Loader2 className="spin" size={18} /> : <RotateCcw size={18} />}
            Reset Counter
          </button>

          <button 
            className="btn btn-outline" 
            onClick={() => fetchCount(true)}
            disabled={isRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={18} className={isRefreshing ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractDashboard;
