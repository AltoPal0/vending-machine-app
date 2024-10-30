'use client';
import './styles/styles.css';  // Import global CSS
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import Image from 'next/image';
import { ethers } from 'ethers';

// Replace with your own ERC-20 token contract address and ABI
const ERC20_CONTRACT_ADDRESS = '0xF940D4F9CfDE0313Fe7A49401dE23869Dd3D834C'; // Replace with actual token contract address
const ERC20_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialOwner",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "ECDSAInvalidSignature",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "length",
				"type": "uint256"
			}
		],
		"name": "ECDSAInvalidSignatureLength",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "ECDSAInvalidSignatureS",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			}
		],
		"name": "ERC2612ExpiredSignature",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "signer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC2612InvalidSigner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "currentNonce",
				"type": "uint256"
			}
		],
		"name": "InvalidAccountNonce",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidShortString",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "str",
				"type": "string"
			}
		],
		"name": "StringTooLong",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "EIP712DomainChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "permit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DOMAIN_SEPARATOR",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "eip712Domain",
		"outputs": [
			{
				"internalType": "bytes1",
				"name": "fields",
				"type": "bytes1"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "version",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "chainId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "verifyingContract",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "salt",
				"type": "bytes32"
			},
			{
				"internalType": "uint256[]",
				"name": "extensions",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "nonces",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Contract ABI and address for Token Sale (replace with your actual values)
const TOKEN_SALE_ADDRESS = '0x67e00861d929D06297F34f80D637fbfe18aB4dBa'; // Replace with your actual Token Sale contract address
const TOKEN_SALE_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "numTokens",
				"type": "uint256"
			}
		],
		"name": "buyTokens",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "depositTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "setTokenPrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IERC20",
				"name": "_tokenContract",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "DebugLog",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdrawETH",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "supply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tokenContract",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tokenPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


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