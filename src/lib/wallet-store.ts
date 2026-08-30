/**
 * Wallet state management using Zustand + raw window.ethereum API.
 * No wagmi — direct EIP-1193 provider access.
 */
import { create } from "zustand";

const BSC_CHAIN_ID = 56;
const BSC_CHAIN_PARAMS = {
  chainId: "0x" + BSC_CHAIN_ID.toString(16),
  chainName: "BNB Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"],
};

export type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (...args: any[]) => void;
  removeListener?: (...args: any[]) => void;
  off?: (...args: any[]) => void;
  isMetaMask?: boolean;
  [key: string]: unknown;
};

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: EIP1193Provider | null;

  connect: () => Promise<string | null>;
  disconnect: () => void;
  switchChain: (targetChainId: number) => Promise<boolean>;
  _listen: () => void;
  _cleanup: () => void;
}

function getProvider(): EIP1193Provider | null {
  if (typeof window === "undefined") return null;
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;
  // If multiple providers (e.g. Coinbase + MetaMask), prefer MetaMask
  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    const meta = ethereum.providers.find(
      (p: any) => p.isMetaMask === true && !p.isBraveWallet
    );
    return (meta ?? ethereum.providers[0]) as EIP1193Provider;
  }
  return ethereum as EIP1193Provider;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  provider: null,

  connect: async function () {
    const provider = getProvider();
    if (!provider) {
      throw new Error(
        "No se encontro una extension de wallet. Instala MetaMask u otra wallet EVM."
      );
    }

    set({ isConnecting: true });
    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        set({ isConnecting: false });
        return null;
      }

      const address = accounts[0];
      const chainIdHex = (await provider.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainIdHex, 16);

      set({
        address,
        chainId,
        isConnected: true,
        isConnecting: false,
        provider,
      });

      // Start listening to events
      get()._listen();

      return address;
    } catch (err: any) {
      set({ isConnecting: false });
      if (err?.code === 4001) {
        throw new Error("Conexion rechazada por el usuario.");
      }
      throw err;
    }
  },

  disconnect: function () {
    const { provider } = get();
    get()._cleanup();
    set({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
    });
  },

  switchChain: async function (targetChainId: number) {
    const provider = getProvider() ?? get().provider;
    if (!provider) return false;

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + targetChainId.toString(16) }],
      });
      set({ chainId: targetChainId });
      return true;
    } catch (err: any) {
      // If chain not added, try to add it (for BSC)
      if (err?.code === 4902 && targetChainId === BSC_CHAIN_ID) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [BSC_CHAIN_PARAMS],
          });
          set({ chainId: BSC_CHAIN_ID });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  },

  _listen: function () {
    const provider = getProvider() ?? get().provider;
    if (!provider) return;

    const handleAccountsChanged = (...args: any[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        get().disconnect();
      } else {
        set({ address: accounts[0] });
      }
    };

    const handleChainChanged = (...args: any[]) => {
      const chainIdHex = args[0] as string;
      const chainId = parseInt(chainIdHex, 16);
      set({ chainId });
      // Reload on chain change to reset all state
      window.location.reload();
    };

    // Safe event binding — avoid proxy issues
    try {
      if (typeof provider.on === "function") {
        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);
      }
    } catch {
      // Some providers don't support event listeners
    }

    // Store references for cleanup
    (get() as any)._handleAccountsChanged = handleAccountsChanged;
    (get() as any)._handleChainChanged = handleChainChanged;
  },

  _cleanup: function () {
    const provider = getProvider() ?? get().provider;
    if (!provider) return;

    const handleAccountsChanged = (get() as any)._handleAccountsChanged;
    const handleChainChanged = (get() as any)._handleChainChanged;

    try {
      if (typeof provider.removeListener === "function") {
        if (handleAccountsChanged)
          provider.removeListener("accountsChanged", handleAccountsChanged);
        if (handleChainChanged)
          provider.removeListener("chainChanged", handleChainChanged);
      } else if (typeof provider.off === "function") {
        if (handleAccountsChanged)
          provider.off("accountsChanged", handleAccountsChanged);
        if (handleChainChanged)
          provider.off("chainChanged", handleChainChanged);
      }
    } catch {
      // Ignore cleanup errors
    }
  },
}));

/**
 * Re-connect if the provider already has authorized accounts
 * (e.g. page reload with a previously connected wallet).
 */
export async function tryReconnect() {
  const provider = getProvider();
  if (!provider) return;

  try {
    const accounts = (await provider.request({
      method: "eth_accounts",
    })) as string[];

    if (accounts && accounts.length > 0) {
      const chainIdHex = (await provider.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainIdHex, 16);

      useWalletStore.setState({
        address: accounts[0],
        chainId,
        isConnected: true,
        provider,
      });
      useWalletStore.getState()._listen();
    }
  } catch {
    // Silently fail — user can connect manually
  }
}
