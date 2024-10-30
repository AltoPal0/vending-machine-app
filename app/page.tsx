'use client';
import './styles/styles.css';  // Import global CSS
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import Image from 'next/image';
import { ethers } from 'ethers';

// Replace with your own ERC-20 token contract address and ABI
const ERC20_CONTRACT_ADDRESS = ''; // Replace with actual token contract address
const ERC20_ABI = []];

// Contract ABI and address for Token Sale (replace with your actual values)
const TOKEN_SALE_ADDRESS = ''; // Replace with your actual Token Sale contract address
const TOKEN_SALE_ABI = []];


export default function Home() {
  const [account, setAccount] = useState<string | null>(null);  // Store MetaMask account
  const [ethBalance, setEthBalance] = useState<string>('');     // Store ETH balance
  const [tokenBalance, setTokenBalance] = useState<string>(''); // Store ERC-20 token balance
  const [tokenSymbol, setTokenSymbol] = useState<string>('');   // Store token symbol
  const [web3, setWeb3] = useState<Web3 | null>(null);          // Store Web3 instance
  const [saleContract, setSaleContract] = useState<any>(null);          // Store token sale contract instance
  const [tokenContract, setTokenContract] = useState<any>(null); // Store ERC-20 token contract instance
  const [tokenPrice, setTokenPrice] = useState<number>(0);      // Store token price in ETH
  const [buyingTokens, setBuyingTokens] = useState(false);      // Handle buying state
  const [numTokens, setNumTokens] = useState<string>('');       // Number of tokens to buy
  const [successMessage, setSuccessMessage] = useState<string>('');  // Success message

  // Function to connect MetaMask and fetch balances
  const connectWallet = async () => {
	if (window.ethereum) {
	  try {
		// Request MetaMask account access
		await window.ethereum.request({ method: 'eth_requestAccounts' });
  
		// Create a Web3 instance
		const web3Instance = new Web3(window.ethereum);
		setWeb3(web3Instance);
  
		// Get user's account
		const accounts = await web3Instance.eth.getAccounts();
		setAccount(accounts[0]);
  
		// Initialize the ERC-20 token contract and store in state
		const tokenContractInstance = new web3Instance.eth.Contract(ERC20_ABI, ERC20_CONTRACT_ADDRESS);
		setTokenContract(tokenContractInstance); // Store token contract in state
  
		// Fetch ETH balance (in Wei) and convert to Ether
		const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
		const balanceInEth = web3Instance.utils.fromWei(balanceWei, 'ether');
		setEthBalance(parseFloat(balanceInEth).toFixed(2));

		// Initialize the Token Sale contract and store it in state
		const saleContractInstance = new web3Instance.eth.Contract(TOKEN_SALE_ABI, TOKEN_SALE_ADDRESS);
		setSaleContract(saleContractInstance); // Store sale contract in state

		// Fetch the token price from the contract (price in Wei)
		const priceInWei = await saleContractInstance.methods.tokenPrice().call();
		const priceInEth = web3Instance.utils.fromWei(priceInWei, 'ether'); // Convert price to ETH for display
		setTokenPrice(parseFloat(priceInEth)); // Store the token price in state
		console.log('Token Price set to:', priceInEth, 'ETH');
  
		// Delay execution to make sure state has updated (React state is asynchronous)
		if (!accounts || accounts.length === 0) {
		  console.error('No accounts found in MetaMask!');
		  return;
		}
  
	  } catch (error) {
		console.error('Error connecting to MetaMask or fetching balances:', error);
	  }
	} else {
	  alert('Please install MetaMask!');
	}
  };

  useEffect(() => {
	console.log('Token price in state:', tokenPrice); // This should display the token price
  }, [tokenPrice]);
  
  // Handle fetching balance once tokenContract is set in state
  useEffect(() => {
	if (tokenContract && account) {
	  const fetchTokenBalance = async () => {
		try {
		  // Fetch token balance using the contract instance stored in state
		  const balance = await tokenContract.methods.balanceOf(account).call();
  
		  // Fetch token decimals and symbol
		  const decimals = await tokenContract.methods.decimals().call();
		  const symbol = await tokenContract.methods.symbol().call();
		  setTokenSymbol(symbol);
  
		  // Adjust token balance based on decimals using BigInt and Web3.js utilities
		  const tokenBalanceFormatted = web3.utils.fromWei(balance, 'ether'); // Assumes 18 decimals like ETH
		  setTokenBalance(parseFloat(tokenBalanceFormatted).toFixed(2));
  
		} catch (error) {
		  console.error('Failed to fetch token balance:', error);
		}
	  };
  
	  // Call the function to fetch the token balance after state updates
	  fetchTokenBalance();
	}
  }, [tokenContract, account]);  // Trigger this effect when `tokenContract` and `account` are set

  const handleBuyTokens = async () => {
	// Check if the token price is available
	if (!tokenPrice) {
		alert('Token price is not initialized! Please wait.');
		return;
	  }
	  
	// Check if `tokenContract` and `account` are properly set
	if (!tokenContract) {
	  alert('Token contract is not initialized! Please connect your wallet.');
	  console.error('Token contract is not initialized.');
	  return;
	}
  
	if (!account) {
	  alert('No account found! Please connect your wallet.');
	  console.error('No account found.');
	  return;
	}
  
	if (!numTokens || isNaN(Number(numTokens)) || Number(numTokens) <= 0) {
	  alert('Please enter a valid number of tokens');
	  return;
	}
  
	try {
		// Step 1: Fetch the token price in Wei from the contract
		const priceInWeiFullToken = await saleContract.methods.tokenPrice().call();
		console.log('priceInWeiFullToken:', priceInWeiFullToken);

		/*// Step 2: Convert the number of tokens to the smallest units (18 decimals)
		const numTokensInSmallestUnit = web3.utils.toWei(numTokens, 'ether'); // 1 token = 10^18 units
		console.log('numTokensInSmallestUnit:', numTokensInSmallestUnit); // For debugging*/
	
		// Step 3: Convert `numTokensInSmallestUnit` and `priceInWei` to BigInt for multiplication
		const numTokensBigInt = BigInt(numTokens);
		const priceInWeiFullTokenBigInt = BigInt(priceInWeiFullToken);
	
		// Step 4: Calculate the total cost in Wei (smallest units * price per smallest unit)
		const totalCostInWei = numTokensBigInt * priceInWeiFullTokenBigInt; 
		console.log('total Cost In Wei:', totalCostInWei.toString());
		console.log('Total cost in ETH:', web3.utils.fromWei(totalCostInWei.toString(), 'ether'));
	
		// Step 5: Send the transaction to buy tokens, passing `numTokensInSmallestUnit`
		try {
			const purchaseTx = await saleContract.methods
			  .buyTokens(numTokens)
			  .send({
				from: account,
				value: totalCostInWei.toString()
			  });
		  
			console.log('Purchase transaction:', purchaseTx);
		  } catch (error) {
			console.error('Error estimating gas or processing transaction:', error);
			alert('Transaction failed or gas estimation failed. See console for details.');
		  }
		// Success message
		setSuccessMessage(`Successfully bought ${numTokens} tokens!`);
		setNumTokens(''); // Clear the input field
		setBuyingTokens(false); // Collapse the section
	
	  } catch (error) {
		console.error('Token purchase failed:', error);
		alert('Token purchase failed. Check the console for more details.');
	  }
	};

  // Automatically connect to MetaMask and fetch balances when the page loads
  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="container">
      {/* Centered Logo Section */}
      <div className="logo">
        <Image src="/images/LOGO-TEXT-orange.png" alt="Logo" width={890} height={150} />
      </div>

      {/* General Text */}
      <div className="text-section">
        <p>Your Wallet Information</p>
      </div>

      {/* Token Balances with Logos */}
      <div className="balances">
        {/* ETH Balance with Logo */}
        <div className="balance-item">
          <Image src="/images/eth-logo.png" alt="ETH Logo" width={30} height={30} />
          <p>{ethBalance} ETH</p>
        </div>

        {/* ERC-20 Token Balance with Logo */}
        <div className="balance-item">
          <Image src="/images/Logo32x32.png" alt="Token Logo" width={30} height={30} />
          <p>{tokenBalance} {tokenSymbol}</p>
        </div>
      </div>

      {/* Buy Token Section */}
      <div className="buy-token-section">
        <button onClick={() => setBuyingTokens(!buyingTokens)}>
          Buy Tokens
        </button>

        {buyingTokens && (
			<div className="buy-form">
				<p>Token Price: {tokenPrice ? tokenPrice : 'Loading...'} ETH per token</p> {/* Display the token price */}
				<input
				type="number"
				placeholder="Enter number of tokens"
				value={numTokens}
				onChange={(e) => setNumTokens(e.target.value)}
				/>
				<button onClick={handleBuyTokens}>Purchase</button>
			</div>
			)}

        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>

      {/* Bottom Text */}
      <div className="bottom-text">
        <p>Powered by NEYX</p>
      </div>
    </div>
  );
}