import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export default function CreateWallet() {
  const { createWallet, confirmWalletSaved, hasWallet } = useWallet();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [step, setStep] = useState<'form' | 'backup'>('form');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await createWallet(password);
      setMnemonic(result.mnemonic);
      setPublicKey(result.publicKey);
      setStep('backup');
    } catch (err: any) {
      setError(err?.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'backup') {
    return (
      <div className="wrap">
        <div className="card stack">
          <h2>Back up your recovery phrase</h2>
          <p className="small">
            Write these 24 words down in order and store them somewhere safe. This is the only way to recover your wallet. We never store it on a server.
          </p>
          <div className="mnemonic">{mnemonic}</div>
          <div className="small">Public key: {publicKey}</div>
          <button onClick={() => { confirmWalletSaved(); setStep('form'); }}>
            I have written it down
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="card stack">
        <h2>{hasWallet ? 'Create new wallet' : 'Create your wallet'}</h2>
        <p className="small">Choose a strong password to encrypt your wallet locally.</p>
        <form onSubmit={handleCreate} className="stack">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Wallet'}
          </button>
        </form>
      </div>
    </div>
  );
}
