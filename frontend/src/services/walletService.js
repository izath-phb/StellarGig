import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules,
  FREIGHTER_ID,
  ALBEDO_ID,
  XBULL_ID
} from "@creit.tech/stellar-wallets-kit";
import * as StellarSdk from "@stellar/stellar-sdk";

// Export standard wallet IDs
export const SUPPORTED_WALLETS = [
  { id: FREIGHTER_ID, name: "Freighter" },
  { id: ALBEDO_ID, name: "Albedo" },
  { id: XBULL_ID, name: "xBull" }
];

export const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export const connectKitWallet = async (walletId) => {
  try {
    kit.setWallet(walletId);
    
    const { address } = await kit.getAddress();
    return { publicKey: address, walletId };
  } catch (error) {
    console.error("Connection failed", error);
    
    // Explicit Error Handling Level 2
    if (error.message?.toLowerCase().includes("installed") || error.message?.toLowerCase().includes("not found")) {
      throw new Error(`WALLET_NOT_INSTALLED: ${walletId} Wallet tidak ditemukan di browser Anda.`);
    }
    
    throw new Error(error.message || "Gagal menghubungkan wallet");
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
    throw error;
  }
};

export const sendXlmWithKit = async (sourcePublicKey, destinationAddress, amount, memo, walletId) => {
  try {
    const account = await server.loadAccount(sourcePublicKey);
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

    // Sign using Kit
    kit.setWallet(walletId);
    const { signedTxXdr } = await kit.signTransaction(transaction.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE
    });
    
    // Submit
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const response = await server.submitTransaction(signedTx);
    
    return response;
  } catch (error) {
    // Explicit Error Handling Level 2
    if (error.message?.toLowerCase().includes("reject") || error.message?.toLowerCase().includes("decline") || error.message?.toLowerCase().includes("cancel")) {
      throw new Error("TRANSACTION_REJECTED: Transaksi dibatalkan oleh pengguna.");
    }
    
    if (error?.response?.data?.extras?.result_codes?.operations?.includes("op_underfunded")) {
       throw new Error("INSUFFICIENT_BALANCE: Saldo XLM tidak mencukupi untuk transaksi ini.");
    }
    
    throw error;
  }
};
