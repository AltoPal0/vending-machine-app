// app/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import dynamic from 'next/dynamic';

// Replace these with your actual contract addresses and ABIs
const mockUSDC_ADDRESS = "0x6f183a566C879b06630DB90dC236f600A22130b2";
const SUYT1_ADDRESS = "0xff52a4D0Dd66125Cae78222B5F397531CCB76DE8";
const SUYT2TokenSale_ADDRESS = "0x19fB0271e0F0380645b15C409e43e92F8774b5F1";

const mockUSDC_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "initialSupply",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
  }
];
const SUYT1_ABI = [
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
  }
];
const SUYT2TokenSale_ABI = [
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "_SUYT1Token",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "_USDCcoin",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
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
    "inputs": [],
    "name": "SUYT1Token",
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
    "name": "USDCcoin",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "numFullTokens",
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
        "name": "numFullTokens",
        "type": "uint256"
      }
    ],
    "name": "buyTokensWithUSDCcoin",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "depositFullTokens",
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
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_priceInEth",
        "type": "uint256"
      }
    ],
    "name": "setTokenPriceETH",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_priceInUsdc",
        "type": "uint256"
      }
    ],
    "name": "setTokenPriceUSDC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenPriceETH",
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
    "name": "tokenPriceUSDC",
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
    "inputs": [],
    "name": "withdrawETH",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawUSDCcoins",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Dynamically import MetaMaskConnector with SSR disabled
const MetaMaskConnector = dynamic(() => import('./MetaMaskConnector'), { ssr: false });


export default function Home() {
  // Step 1: Suppress hydration warning
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Hydration failed')) {
        return;
      }
      originalConsoleError(...args);
    };
    return () => {
      console.error = originalConsoleError; // Restore original error function on cleanup
    };
  }, []);

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('');
  const [usdcBalance, setUsdcBalance] = useState<string>('');
  const [suyt1Balance, setSuyt1Balance] = useState<string>('');
  const [tokenPriceETH, setTokenPriceETH] = useState<string>('');
  const [tokenPriceUSDC, setTokenPriceUSDC] = useState<string>('');
  const [numTokens, setNumTokens] = useState<number>(1);  // Default to 1 token
  const [contractSuyt1Balance, setContractSuyt1Balance] = useState<string>('');
  const [contractUsdcBalance, setContractUsdcBalance] = useState<string>('');
  const [autoconnect, setAutoconnect] = useState(false); // Toggle for autoconnect


  // Connect to MetaMask and fetch balances
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const newProvider = new ethers.BrowserProvider((window as any).ethereum);
        await newProvider.send("eth_requestAccounts", []);
        setProvider(newProvider);

        const signer = await newProvider.getSigner();
        const userAccount = await signer.getAddress();
        setAccount(userAccount);

        // Fetch ETH balance
        const balanceWei = await newProvider.getBalance(userAccount);
        setEthBalance(ethers.formatEther(balanceWei)); // Converts to ETH with 18 decimals

        // Fetch mockUSDC and SUYT1 balances
        await fetchTokenBalances(signer, userAccount);

        // Fetch token prices for SUYT1
        await fetchTokenPrices(signer);

        // Fetch contract balances for SUYT1 and USDC
        await fetchContractBalances(signer);

      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to continue.");
    }
  };

  // Function to fetch mockUSDC and SUYT1 token balances
  const fetchTokenBalances = async (signer: ethers.Signer, userAccount: string) => {
    try {
      // mockUSDC (6 decimals)
      const usdcContract = new ethers.Contract(mockUSDC_ADDRESS, mockUSDC_ABI, signer);
      const usdcBalanceRaw = await usdcContract.balanceOf(userAccount);
      const usdcBalanceFormatted = ethers.formatUnits(usdcBalanceRaw, 6); // 6 decimals
      setUsdcBalance(parseFloat(usdcBalanceFormatted).toFixed(2)); // Display 2 decimals

      // SUYT1 (18 decimals)
      const suyt1Contract = new ethers.Contract(SUYT1_ADDRESS, SUYT1_ABI, signer);
      const suyt1BalanceRaw = await suyt1Contract.balanceOf(userAccount);
      const suyt1BalanceFormatted = ethers.formatUnits(suyt1BalanceRaw, 18); // 18 decimals
      setSuyt1Balance(parseFloat(suyt1BalanceFormatted).toFixed(4)); // Display 4 decimals

    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  const fetchTokenPrices = async (signer: ethers.Signer) => {
    try {
      const tokenSaleContract = new ethers.Contract(SUYT2TokenSale_ADDRESS, SUYT2TokenSale_ABI, signer);

      // Fetch the token prices
      const priceETH = await tokenSaleContract.tokenPriceETH();
      const priceUSDC = await tokenSaleContract.tokenPriceUSDC();

      // Convert prices to display format (ETH: 18 decimals, USDC: 6 decimals)
      setTokenPriceETH(ethers.formatEther(priceETH));
      setTokenPriceUSDC(ethers.formatUnits(priceUSDC, 6));
    } catch (error) {
      console.error("Error fetching token prices:", error);
    }
  };

  const fetchContractBalances = async (signer: ethers.Signer) => {
   
    const suyt1Contract = new ethers.Contract(SUYT1_ADDRESS, SUYT1_ABI, signer);
    const usdcContract = new ethers.Contract(mockUSDC_ADDRESS, mockUSDC_ABI, signer);

    try {
      // Fetch the SUYT1 token balance of the SUYT2TokenSale contract
      const suyt1BalanceRaw = await suyt1Contract.balanceOf(SUYT2TokenSale_ADDRESS);
      const suyt1BalanceFormatted = ethers.formatUnits(suyt1BalanceRaw, 18); // 18 decimals for SUYT1
      setContractSuyt1Balance(parseFloat(suyt1BalanceFormatted).toFixed(4)); // Display 4 decimals

      // Fetch the USDC balance of the SUYT2TokenSale contract
      const usdcBalanceRaw = await usdcContract.balanceOf(SUYT2TokenSale_ADDRESS);
      const usdcBalanceFormatted = ethers.formatUnits(usdcBalanceRaw, 6); // 6 decimals for USDC
      setContractUsdcBalance(parseFloat(usdcBalanceFormatted).toFixed(2)); // Display 2 decimals
    } catch (error) {
      console.error("Error fetching contract balances:", error);
    }
  };

  const buyTokensWithETH = async (numTokens: any) => {
    if (!provider || !account) return;

    const signer = await provider.getSigner();
    const tokenSaleContract = new ethers.Contract(SUYT2TokenSale_ADDRESS, SUYT2TokenSale_ABI, signer);
    const priceInWei = ethers.parseEther((numTokens * 0.007).toString());  // Assuming 0.007 ETH per token

    try {
      const tx = await tokenSaleContract.buyTokens(numTokens, { value: priceInWei });
      await tx.wait();
      console.log(`Successfully bought ${numTokens} SUYT1 tokens with ETH.`);
    } catch (error) {
      console.error("Error buying tokens with ETH:", error);
    }
  };

  const approveUSDC = async (amount: any) => {
    if (!provider || !account) return;

    const signer = await provider.getSigner();
    const usdcContract = new ethers.Contract(mockUSDC_ADDRESS, mockUSDC_ABI, signer);

    try {
      const tx = await usdcContract.approve(SUYT2TokenSale_ADDRESS, amount);
      await tx.wait();
      console.log(`Approved ${amount} USDC for spending by the token sale contract.`);
    } catch (error) {
      console.error("Error approving USDC:", error);
    }
  };

  const buyTokensWithUSDC = async (numTokens: any) => {
    if (!provider || !account) return;

    const signer = await provider.getSigner();
    const tokenSaleContract = new ethers.Contract(SUYT2TokenSale_ADDRESS, SUYT2TokenSale_ABI, signer);
    const usdcAmount = BigInt(numTokens * 30 * 10 ** 6);  // 30 USDC per token

    // Approve the token sale contract to spend USDC on the user's behalf
    await approveUSDC(usdcAmount);

    try {
      const tx = await tokenSaleContract.buyTokensWithUSDCcoin(numTokens);
      await tx.wait();
      console.log(`Successfully bought ${numTokens} SUYT1 tokens with USDC.`);
    } catch (error) {
      console.error("Error buying tokens with USDC:", error);
    }
  };
  

  // Automatically connect to MetaMask if already connected
  // useEffect(() => {
  //   if ((window as any).ethereum && !account) {
  //     connectWallet();
  //   }
  // }, [account]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Welcome to the MetaMask Connection Page</h1>
      {account ? (
        <>
          <p>Connected Account: {account}</p>
          <p>ETH Balance: {ethBalance} ETH</p>
          <p>mockUSDC Balance: {usdcBalance} USDC</p>
          <p>SUYT1 Balance: {suyt1Balance} SUYT1</p>
          <p>SUYT1 Token Price: {tokenPriceETH} ETH</p>
          <p>SUYT1 Token Price: {tokenPriceUSDC} USDC</p>
          <p>SUYT1 Contract Balance: {contractSuyt1Balance} SUYT1</p>
          <p>USDC Contract Balance: {contractUsdcBalance} USDC</p>
          <input
            type="number"
            value={numTokens}
            onChange={(e) => setNumTokens(Number(e.target.value))}
            placeholder="Enter number of SUYT1 tokens"
            style={{ padding: '5px', fontSize: '16px', marginTop: '10px' }}
          />
          <button onClick={() => buyTokensWithETH(numTokens)}>Buy SUYT1 with ETH</button>
          <button onClick={() => buyTokensWithUSDC(numTokens)}>Buy SUYT1 with USDC</button>
        </>
      ) : (
        <button onClick={() => { setAutoconnect(true); connectWallet(); }} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}