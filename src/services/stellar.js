import {
  isConnected as checkConnected,
  getAddress,
  signTransaction,
  setAllowed
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

// Initialize Stellar Server for Testnet
const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const checkFreighterInstalled = async () => {
  const result = await checkConnected();
  return result.isConnected;
};

export const connectWallet = async () => {
  try {
    const allowed = await setAllowed();
    if (allowed.error) throw new Error(allowed.error);
    
    const addressInfo = await getAddress();
    if (addressInfo.error) throw new Error(addressInfo.error);
    
    return addressInfo.address;
  } catch (error) {
    console.error("Error connecting Freighter", error);
    throw error;
  }
};

export const getAccountBalance = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find((b) => b.asset_type === "native");
    return nativeBalance ? nativeBalance.balance : "0";
  } catch (error) {
    if (error?.response?.status === 404) {
      return "0 (Unfunded)";
    }
    console.error("Error fetching balance:", error);
    throw error;
  }
};

export const sendXlmTransaction = async (sourcePublicKey, destinationAddress, amount, memo) => {
  try {
    // 1. Load account
    const account = await server.loadAccount(sourcePublicKey);

    // 2. Build the transaction
    const fee = await server.fetchBaseFee();
    
    let transactionBuilder = new StellarSdk.TransactionBuilder(account, {
      fee,
      networkPassphrase: NETWORK_PASSPHRASE,
    }).addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      })
    );

    if (memo) {
      transactionBuilder = transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
    }

    const transaction = transactionBuilder.setTimeout(30).build();

    // 4. Sign the transaction using Freighter
    const signResult = await signTransaction(transaction.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    
    if (signResult.error) {
      throw new Error(signResult.error);
    }

    // 5. Submit the transaction
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    const response = await server.submitTransaction(signedTx);
    
    return response;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
};
