// pages/index.js

import { useEffect, useState } from 'react';
import Web3 from 'web3';

export default function Home() {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [balance, setBalance] = useState('');

  // Connect to MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
          setAccount(accounts[0]);
          return web3Instance.eth.getBalance(accounts[0]);
        })
        .then(balance => {
          setBalance(web3Instance.utils.fromWei(balance, 'ether'));
        })
        .catch(err => console.error(err));
    } else {
      console.error("MetaMask is not installed!");
    }
  }, []);

  return (
    <div>
      <h1>ERC-20 Token Web Interface</h1>
      {account ? (
        <div>
          <p>Connected Account: {account}</p>
          <p>Balance: {balance} ETH</p>
        </div>
      ) : (
        <p>Please connect MetaMask</p>
      )}
    </div>
  );
}
