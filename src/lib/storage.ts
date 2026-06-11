import type { EncryptedPayload } from './crypto';

const KEY = 'stellarx_wallet_v1';

export interface StoredWallet {
  payload: EncryptedPayload;
  publicKey: string;
  createdAt: string;
}

export function saveWallet(stored: StoredWallet): void {
  localStorage.setItem(KEY, JSON.stringify(stored));
}

export function loadWallet(): StoredWallet | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredWallet;
  } catch {
    return null;
  }
}

export function removeWallet(): void {
  localStorage.removeItem(KEY);
}

export function hasWallet(): boolean {
  return !!loadWallet();
}
