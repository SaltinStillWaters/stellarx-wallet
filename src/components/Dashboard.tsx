import { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { fetchBalance, fundWithFriendbot } from '../lib/stellar';
import SendPayment from './SendPayment';

export default function Dashboard() {
  const { publicKey, logout, deleteWallet } = useWallet();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function refresh() {
    if (!publicKey) return;
    setLoading(true);
    try {
      const bal = await fetchBalance(publicKey);
      setBalance(bal);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  }

  async function fund() {
    if (!publicKey) return;
    setFunding(true);
    try {
      await fundWithFriendbot(publicKey);
      setSuccess('Account funded with testnet XLM');
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Funding failed');
    } finally {
      setFunding(false);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [publicKey]);

  return (
    <div className="wrap">
      <div className="card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Wallet</h2>
          <button className="secondary" onClick={logout}>Lock</button>
        </div>

        <div>
          <div className="small">Public Key</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
            {publicKey}
          </div>
        </div>

        <div>
          <div className="small">Balance</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {loading ? 'Loading…' : `${balance} XLM`}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="row">
          <button onClick={fund} disabled={funding}>
            {funding ? 'Funding…' : 'Fund with Friendbot'}
          </button>
          <button className="secondary" onClick={refresh} disabled={loading}>
            Refresh
          </button>
        </div>

        <SendPayment onSent={refresh} />

        <button className="danger secondary" onClick={deleteWallet} style={{ marginTop: '2rem' }}>
          Delete wallet from this device
        </button>
      </div>
    </div>
  );
}
