import { WalletProvider, useWallet } from './contexts/WalletContext';
import CreateWallet from './components/CreateWallet';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function Router() {
  const { hasWallet, isLoggedIn } = useWallet();

  if (!hasWallet) return <CreateWallet />;
  if (!isLoggedIn) return <Login />;
  return <Dashboard />;
}

export default function App() {
  return (
    <WalletProvider>
      <div style={{ minHeight: '100%', paddingBottom: '2rem' }}>
        <header style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>StellarX Wallet</h1>
          <p className="small" style={{ margin: '.25rem 0 0' }}>Self-custodial. Testnet only.</p>
        </header>
        <Router />
      </div>
    </WalletProvider>
  );
}
