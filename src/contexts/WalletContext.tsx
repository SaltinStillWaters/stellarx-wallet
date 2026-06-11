import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Keypair } from '@stellar/stellar-sdk';
import { encryptMnemonic, decryptMnemonic } from '../lib/crypto';
import { saveWallet, loadWallet, removeWallet, hasWallet as checkHasWallet } from '../lib/storage';
import { generateMnemonicPhrase, deriveKeypair } from '../lib/stellar';

interface WalletContextValue {
  keypair: Keypair | null;
  publicKey: string | null;
  hasWallet: boolean;
  isLoggedIn: boolean;
  createWallet: (password: string) => Promise<{ mnemonic: string; publicKey: string }>;
  confirmWalletSaved: () => void;
  login: (password: string) => Promise<void>;
  logout: () => void;
  deleteWallet: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [hasWalletState, setHasWalletState] = useState(false);

  useEffect(() => {
    setHasWalletState(checkHasWallet());
  }, []);

  const createWallet = useCallback(async (password: string) => {
    const mnemonic = generateMnemonicPhrase();
    const kp = deriveKeypair(mnemonic);
    const publicKey = kp.publicKey();
    const payload = await encryptMnemonic(mnemonic, password);
    saveWallet({ payload, publicKey, createdAt: new Date().toISOString() });
    setHasWalletState(true);
    return { mnemonic, publicKey };
  }, []);

  const confirmWalletSaved = useCallback(() => {
    // Called after user confirms they saved the mnemonic
    // We don't auto-login here; user must log in
  }, []);

  const login = useCallback(async (password: string) => {
    const stored = loadWallet();
    if (!stored) throw new Error('No wallet found');
    const mnemonic = await decryptMnemonic(stored.payload, password);
    const kp = deriveKeypair(mnemonic);
    if (kp.publicKey() !== stored.publicKey) {
      throw new Error('Invalid password');
    }
    setKeypair(kp);
  }, []);

  const logout = useCallback(() => {
    setKeypair(null);
  }, []);

  const deleteWallet = useCallback(() => {
    removeWallet();
    setKeypair(null);
    setHasWalletState(false);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        keypair,
        publicKey: keypair?.publicKey() ?? null,
        hasWallet: hasWalletState,
        isLoggedIn: !!keypair,
        createWallet,
        confirmWalletSaved,
        login,
        logout,
        deleteWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
