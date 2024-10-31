'use client';
import { useState, useEffect } from 'react';
import Web3 from 'web3';

export default function Home() {
  const [web3, setWeb3] = useState<Web3 | null>(null);           // Web3 instance
  const [account, setAccount] = useState<string | null>(null);    // User's account
  const [ethBalance, setEthBalance] = useState<string>('');       // User's ETH balance

  // Function to connect to MetaMask
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        // Request MetaMask account access
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

        // Initialize Web3 instance and set in state
        const web3Instance = new Web3((window as any).ethereum);
        setWeb3(web3Instance);

        // Get and set the first account from MetaMask
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        // Fetch and set the ETH balance for the connected account
        const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
        const balanceInEth = web3Instance.utils.fromWei(balanceWei, 'ether');
        setEthBalance(parseFloat(balanceInEth).toFixed(4)); // Format balance to 4 decimals

      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
    }
  };

  // Auto-connect on load if MetaMask is available
  useEffect(() => {
    if ((window as any).ethereum && !account) {
      connectWallet();
    }
  }, [account]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Welcome to the MetaMask Connection Page</h1>
      {account ? (
        <>
          <p>Connected Account: {account}</p>
          <p>ETH Balance: {ethBalance} ETH</p>
        </>
      ) : (
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}