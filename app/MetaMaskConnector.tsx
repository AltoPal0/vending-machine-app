"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface MetaMaskConnectorProps {
  onAccountChange: (account: string | null) => void;
}

export default function MetaMaskConnector({ onAccountChange }: MetaMaskConnectorProps) {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const userAccount = await signer.getAddress();
          setAccount(userAccount);
          onAccountChange(userAccount); // Notify parent component
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      }
    };

    connectWallet();
  }, [onAccountChange]);

  return (
    <div>
      {account ? <p>Connected Account: {account}</p> : <p>Not connected</p>}
    </div>
  );
}