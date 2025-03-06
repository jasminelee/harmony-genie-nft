
/**
 * MultiversX Wallet Connection Utilities
 * This is a simplified mock of wallet connection functionality
 */

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string | null;
}

// Initial wallet state
const initialWalletState: WalletState = {
  connected: false,
  address: null,
  balance: null
};

let walletState = { ...initialWalletState };
let walletStateListeners: ((state: WalletState) => void)[] = [];

/**
 * Connect to MultiversX wallet
 */
export const connectWallet = async (): Promise<WalletState> => {
  try {
    console.log("Connecting to MultiversX wallet...");
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful connection
    walletState = {
      connected: true,
      address: "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",
      balance: "1.5"
    };
    
    // Notify listeners
    notifyListeners();
    
    return walletState;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw error;
  }
};

/**
 * Disconnect MultiversX wallet
 */
export const disconnectWallet = async (): Promise<void> => {
  try {
    console.log("Disconnecting wallet...");
    
    // Simulate disconnection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reset wallet state
    walletState = { ...initialWalletState };
    
    // Notify listeners
    notifyListeners();
  } catch (error) {
    console.error("Failed to disconnect wallet:", error);
    throw error;
  }
};

/**
 * Get current wallet state
 */
export const getWalletState = (): WalletState => {
  return { ...walletState };
};

/**
 * Subscribe to wallet state changes
 * @param listener Callback function to be called when wallet state changes
 * @returns Unsubscribe function
 */
export const subscribeToWalletState = (
  listener: (state: WalletState) => void
): (() => void) => {
  walletStateListeners.push(listener);
  
  // Immediately notify with current state
  listener({ ...walletState });
  
  // Return unsubscribe function
  return () => {
    walletStateListeners = walletStateListeners.filter(l => l !== listener);
  };
};

/**
 * Notify all listeners of wallet state changes
 */
const notifyListeners = (): void => {
  const state = { ...walletState };
  walletStateListeners.forEach(listener => {
    try {
      listener(state);
    } catch (error) {
      console.error("Error in wallet state listener:", error);
    }
  });
};
