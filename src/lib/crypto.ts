/**
 * Web Crypto API wrapper for encrypting/decrypting the wallet mnemonic.
 * Uses PBKDF2 to derive a key from the password, then AES-GCM for encryption.
 */

const ITERATIONS = 250_000;
const SALT_LEN = 16;
const IV_LEN = 12;

export interface EncryptedPayload {
  salt: string;   // base64
  iv: string;     // base64
  ct: string;     // base64 (ciphertext)
}

function bufToB64(buf: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buf.byteLength; i++) binary += String.fromCharCode(buf[i]);
  return btoa(binary);
}

function b64ToBuf(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const buf = new ArrayBuffer(len);
  const view = new Uint8Array(buf);
  for (let i = 0; i < len; i++) view[i] = binary.charCodeAt(i);
  return view;
}

function randomBytes(len: number): Uint8Array {
  const buf = new ArrayBuffer(len);
  return crypto.getRandomValues(new Uint8Array(buf));
}

async function getKey(password: string, salt: Uint8Array, mode: 'encrypt' | 'decrypt') {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as any, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    [mode]
  );
  return key;
}

export async function encryptMnemonic(mnemonic: string, password: string): Promise<EncryptedPayload> {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = await getKey(password, salt, 'encrypt');
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as any }, key, enc.encode(mnemonic));
  return {
    salt: bufToB64(salt),
    iv: bufToB64(iv),
    ct: bufToB64(new Uint8Array(ct)),
  };
}

export async function decryptMnemonic(payload: EncryptedPayload, password: string): Promise<string> {
  const salt = b64ToBuf(payload.salt);
  const iv = b64ToBuf(payload.iv);
  const ct = b64ToBuf(payload.ct);
  const key = await getKey(password, salt, 'decrypt');
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as any }, key, ct as any);
  return new TextDecoder().decode(pt);
}
