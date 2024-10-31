// app/Web3Context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

interface Web3ContextProps {
  web3: Web3 | null;
  account: string | null;
  connectWallet: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextProps>({
  web3: null,
  account: null,
  connectWallet: async () => {},
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request MetaMask account access
        await window.ethereum.request?.({ method: 'eth_requestAccounts' });

        // Initialize Web3 and set it in state
        const web3Instance = new Web3(window.ethereum as any);
        setWeb3(web3Instance);

        // Get and set the user's account
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  useEffect(() => {
    connectWallet(); // Automatically connect on load
  }, []);

  return (
    <Web3Context.Provider value={{ web3, account, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);