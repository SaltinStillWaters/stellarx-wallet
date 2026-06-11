# StellarX Wallet

> **Self-custodial Stellar wallet for the browser. No extensions. No third-party signers. Just you, your password, and your keys.**

---

## Project Name
StellarX Wallet

## One-Line Description
A browser-based, self-custodial Stellar wallet that encrypts your recovery phrase locally and signs transactions in-memory — built for remittance and everyday payments in the Philippines.

## Track
Track 2 Financial Inclusion & Everyday Payments

## Problem It Solves
Millions of Filipinos are underbanked and rely on expensive remittance corridors (7–15% fees) or over-the-counter cash agents. Existing crypto wallets often require browser extensions (Freighter, MetaMask) or centralized custody, creating friction for first-time users. StellarX Wallet removes both barriers: it runs entirely in the browser with no extensions, gives users sole custody of their keys, and is designed for the simplest strong flow — create, fund, check balance, send — so anyone with a phone and a password can participate.

## How It Uses Stellar
- **Classic Stellar keypairs**: 24-word BIP-39 mnemonic → raw Ed25519 seed → `StrKey.encodeEd25519SecretSeed` → `Keypair.fromSecret`. Mnemonic never leaves the device.
- **Horizon Testnet Server**: `@stellar/stellar-sdk` Horizon client for account balance polling (`/accounts/{id}`) and payment transaction submission.
- **Native XLM payments**: `TransactionBuilder` + `Operation.payment` with `Asset.native()`, signed locally and submitted via `horizon.submitTransaction()`.
- **Friendbot funding**: Testnet account creation via `friendbot.stellar.org` so users can experience the full flow immediately.
- **Encryption at rest**: Web Crypto API (PBKDF2, 250k iterations + AES-GCM) encrypts the mnemonic before writing to `localStorage`. Only ciphertext, salt, IV, and public key are persisted.

## GitHub Repository
https://github.com/SaltinStillWaters/stellarx-wallet

## Network & Deployment
- **Network:** testnet
- **Live app URL (if any):** runs locally — see Setup below
- **Contract IDs / asset issuers (if any):** N/A (classic Horizon payments only)

## Setup

```bash
# 1. Clone
git clone https://github.com/SaltinStillWaters/stellarx-wallet.git
cd stellarx-wallet

# 2. Install dependencies (pnpm)
pnpm install

# 3. Start dev server
pnpm dev
# Open http://localhost:5173

# 4. Build for production
pnpm run build
```

## Team
- SaltinStillWaters — @[SaltinStillWaters](https://github.com/SaltinStillWaters)

*(Add additional teammates here if applicable)*

## Novelty Note (optional, for bonus points)
Most Stellar wallets in the ecosystem are either browser-extension based (Freighter, xBull) or centralized custodial apps (anchors/exchanges). StellarX Wallet is deliberately **extension-free** and **self-custodial**, targeting users who may not trust browser extensions or who are onboarding from mobile-first contexts common in the Philippines. The encryption architecture (PBKDF2 + AES-GCM via Web Crypto, zero server contact) is also a stronger security posture than many demo wallets.

## Anything Else
- **Known limitation:** Testnet only. Mainnet migration would require a reliable on/off-ramp (anchor) integration and stricter security audit of the crypto layer.
- **Next steps:** Add SEP-24/SEP-6 anchor deposit/withdraw for PHP/USDC, Soroban SAC support for stablecoin balances, and a PWA wrapper for offline mnemonic backup via QR.
