import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export default function Login() {
  const { login } = useWallet();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <div className="card stack">
        <h2>Unlock your wallet</h2>
        <p className="small">Enter your password to decrypt your keys in memory.</p>
        <form onSubmit={handleLogin} className="stack">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Unlocking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
