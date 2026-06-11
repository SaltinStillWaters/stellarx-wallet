import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { sendPayment } from '../lib/stellar';

export default function SendPayment({ onSent }: { onSent: () => void }) {
  const { keypair } = useWallet();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!keypair) return;
    setError('');
    setTxHash('');
    setSending(true);
    try {
      const hash = await sendPayment(keypair, to.trim(), amount, memo.trim() || undefined);
      setTxHash(hash);
      setTo('');
      setAmount('');
      setMemo('');
      onSent();
    } catch (err: any) {
      setError(err?.message || 'Payment failed');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card stack" style={{ background: '#0b0f19' }}>
      <h3 style={{ margin: 0 }}>Send XLM</h3>
      <form onSubmit={handleSend} className="stack">
        <input
          placeholder="Destination address (G...)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <input
          placeholder="Amount"
          type="number"
          step="0.0000001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          placeholder="Memo (optional)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        {txHash && (
          <div className="success">
            Sent! Tx:{' '}
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit' }}
            >
              {txHash.slice(0, 12)}…
            </a>
          </div>
        )}
        <button type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
