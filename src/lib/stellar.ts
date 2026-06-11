import {
  Keypair,
  StrKey,
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
  Account,
  Memo,
} from '@stellar/stellar-sdk';
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export const horizon = new Horizon.Server(HORIZON_URL);

export function generateMnemonicPhrase(): string {
  return generateMnemonic(wordlist, 256); // 24 words
}

export function deriveKeypair(mnemonic: string): Keypair {
  const seed = mnemonicToSeedSync(mnemonic); // 64 bytes Uint8Array
  const rawSeed = seed.slice(0, 32);
  const secret = StrKey.encodeEd25519SecretSeed(rawSeed);
  return Keypair.fromSecret(secret);
}

export async function fundWithFriendbot(publicKey: string): Promise<void> {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Friendbot failed (${res.status}): ${text}`);
  }
}

export async function fetchBalance(publicKey: string): Promise<string> {
  try {
    const account = await horizon.accounts().accountId(publicKey).call();
    const native = account.balances.find(
      (b) => b.asset_type === 'native'
    ) as { balance: string } | undefined;
    return native?.balance ?? '0';
  } catch (e: any) {
    if (e?.response?.status === 404) return '0';
    throw e;
  }
}

export async function sendPayment(
  sourceKeypair: Keypair,
  destination: string,
  amount: string,
  memoText?: string
): Promise<string> {
  const sourcePub = sourceKeypair.publicKey();
  const record = await horizon.accounts().accountId(sourcePub).call();
  const account = new Account(sourcePub, record.sequence);

  const txBuilder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  }).addOperation(
    Operation.payment({
      destination,
      asset: Asset.native(),
      amount,
    })
  );

  if (memoText) {
    txBuilder.addMemo(Memo.text(memoText));
  }

  const tx = txBuilder.setTimeout(30).build();

  tx.sign(sourceKeypair);

  const result = await horizon.submitTransaction(tx);
  return result.hash;
}
