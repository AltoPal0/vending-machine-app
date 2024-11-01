// app/Web3Context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

interface Web3ContextProps {
  web3: Web3 | null;
  account: string | null;
  ethBalance: string;
  connectWallet: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextProps>({
  web3: null,
  account: null,
  ethBalance: '',
  connectWallet: async () => {},
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('');

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        // Request account access
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        
        // Initialize Web3 and set it in state
        const web3Instance = new Web3((window as any).ethereum);
        setWeb3(web3Instance);
        
        // Get the user's account and balance
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        
        // Fetch and set the ETH balance
        const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
        const balanceInEth = web3Instance.utils.fromWei(balanceWei, 'ether');
        setEthBalance(parseFloat(balanceInEth).toFixed(4));
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  useEffect(() => {
    if ((window as any).ethereum && !account) {
      connectWallet();
    }
  }, [account]);

  return (
    <Web3Context.Provider value={{ web3, account, ethBalance, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);