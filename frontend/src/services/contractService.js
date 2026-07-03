import * as StellarSdk from "@stellar/stellar-sdk";
import { kit, server } from "./walletService";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

// TODO: Replace with deployed contract ID
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "CDFGTCZ3UGEADUXGVVPCAWFCCI3B3LUB44AXX5OHF6MXEO2DISOCPF5W";

const rpcUrl = "https://soroban-testnet.stellar.org";
export const sorobanServer = new StellarSdk.rpc.Server(rpcUrl);
const networkPassphrase = StellarSdk.Networks.TESTNET;

export const getCounterValue = async () => {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    // We use get_count, which has no arguments
    const tx = new StellarSdk.TransactionBuilder(
      new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"), // dummy account for simulation
      { fee: "100", networkPassphrase }
    )
    .addOperation(contract.call("get_count"))
    .setTimeout(30)
    .build();

    const simResponse = await sorobanServer.simulateTransaction(tx);
    if (simResponse.error) {
      throw new Error("Failed to read from contract");
    }

    if (simResponse.result && simResponse.result.retval) {
      const value = StellarSdk.scValToNative(simResponse.result.retval);
      return value;
    }
    return 0;
  } catch (error) {
    console.error("Error reading contract:", error);
    return 0;
  }
};

export const invokeContractMethod = async (publicKey, methodName, walletId) => {
  try {
    const account = await server.loadAccount(publicKey);
    
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const fee = await sorobanServer.getLatestLedger().then(() => "1000"); // Basic fee estimation

    const tx = new StellarSdk.TransactionBuilder(account, { fee, networkPassphrase })
      .addOperation(contract.call(methodName))
      .setTimeout(30)
      .build();

    // Prepare the transaction (simulates and adds footprint/resources)
    const preparedTx = await sorobanServer.prepareTransaction(tx);

    // Sign the transaction with the wallet
    kit.setWallet(walletId);
    const { signedTxXdr } = await kit.signTransaction(preparedTx.toXDR(), {
      networkPassphrase
    });
    
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
    
    // Submit
    const sendResponse = await sorobanServer.sendTransaction(signedTransaction);
    if (sendResponse.errorResultXdr) {
      throw new Error("Transaction rejected by network");
    }

    // Wait for the transaction to be processed
    let txResponse = await sorobanServer.getTransaction(sendResponse.hash);
    let retries = 0;
    while (txResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND && retries < 15) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      txResponse = await sorobanServer.getTransaction(sendResponse.hash);
      retries++;
    }

    if (txResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
      return sendResponse.hash;
    } else {
      throw new Error(`Transaction failed with status: ${txResponse.status}`);
    }

  } catch (error) {
    // Explicit Error Handling Level 2
    if (error.message?.toLowerCase().includes("reject") || error.message?.toLowerCase().includes("decline") || error.message?.toLowerCase().includes("cancel")) {
      throw new Error("TRANSACTION_REJECTED: Transaksi dibatalkan oleh pengguna.");
    }
    throw error;
  }
};

export const listenToEvents = async (onEvent) => {
  // Simplistic polling for events since testnet streaming can be flaky in browser
  // A production app would use SorobanEventSource or continuous polling
  try {
    const latestLedger = await sorobanServer.getLatestLedger();
    const events = await sorobanServer.getEvents({
      startLedger: latestLedger.sequence - 100,
      filters: [{
        contractIds: [CONTRACT_ID]
      }]
    });
    return events;
  } catch (error) {
    console.error("Error fetching events", error);
    return [];
  }
};
