import React, { FC, ReactNode, useMemo, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react'; 
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import db from './firebaseConfig';

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

// App chính
const App: FC = () => {
  return (
    <Context>
      <Content />
    </Context>
  );
};

export default App;

// Cung cấp context cho ví và Firestore
const Context: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = useMemo(() => clusterApiUrl(WalletAdapterNetwork.Mainnet), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Nội dung giao diện chính
const Content: FC = () => {
  const [score, setScore] = useState<number | null>(null);
  const [kills, setKills] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExchange, setSelectedExchange] = useState<{ points: number; sol: number } | null>(null);
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from Firestore...');
        const docRef = doc(db, 'players', 'player123');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('Document data:', docSnap.data());
          const data = docSnap.data();
          setScore(data.score || 0);
          setKills(data.kill || 0);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching Firestore data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExchange = async () => {
    if (selectedExchange && publicKey) {
      const exchangeData = {
        points: selectedExchange.points,
        sol: selectedExchange.sol,
        wallet: publicKey.toBase58(),
        date: new Date().toISOString(),
      };

      try {
        const playerRef = doc(db, 'players', 'player123');
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
          const playerData = playerSnap.data();
          const currentPoints = playerData?.score || 0;

          if (currentPoints >= selectedExchange.points) {
            const updatedPoints = currentPoints - selectedExchange.points;
            
            await setDoc(playerRef, { score: updatedPoints, kill: playerData?.kill || 0 }, { merge: true });
            await setDoc(doc(db, 'doidiem', `exchange_${Date.now()}`), exchangeData);

            setScore(updatedPoints);
            alert('Exchange successful!');
          } else {
            alert('Not enough points for exchange');
          }
        } else {
          console.log('No such player document!');
        }
      } catch (error) {
        console.error('Error saving exchange data:', error);
        alert('Failed to save exchange data');
      }
    }
  };

  return (
    <div className="App">
      <div className="navbar">
        <div className="navbar-inner" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
          <div style={{ color: 'white', fontSize: '16px' }}>
            {loading ? (
              <p>Loading...</p>
            ) : score !== null && kills !== null ? (
              <div className="card">
                <h3>Player Stats</h3>
                <p>Score: <span className="value">{score}</span></p>
                <p>Kills: <span className="value">{kills}</span></p>
              </div>
            ) : (
              <p>No data found</p>
            )}
          </div>

          <ul className="nav pull-right">
            <li>
              <WalletMultiButton />
            </li>
          </ul>
        </div>
      </div>

      <div className="container">
        <h1>Welcome to the Game!</h1>
        <h2>Exchange Points for Sol</h2>

        <div className="exchange-buttons">
          <button className="exchange-btn" onClick={() => setSelectedExchange({ points: 100, sol: 1 })}>
            100 Points = 1 SOL
          </button>
          <button className="exchange-btn" onClick={() => setSelectedExchange({ points: 200, sol: 2 })}>
            200 Points = 2 SOL
          </button>
          <button className="exchange-btn" onClick={() => setSelectedExchange({ points: 500, sol: 6 })}>
            500 Points = 6 SOL
          </button>
          <button className="exchange-btn" onClick={() => setSelectedExchange({ points: 1000, sol: 15 })}>
            1000 Points = 15 SOL
          </button>
        </div>

        {connected ? (
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleExchange} disabled={!selectedExchange} className="confirm-btn">
              Confirm Exchange
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <p>Please connect your wallet to exchange points.</p>
          </div>
        )}
      </div>
    </div>
  );
};
