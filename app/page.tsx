// app/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './styles/globals.css'; // Importing Tailwind styles from the correct path
import { contracts } from './contracts';
import Image from 'next/image';

export default function Home() {

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
  const [contractETHBalance, setContractETHBalance] = useState<string>('');
  const [autoconnect, setAutoconnect] = useState(false); // Toggle for autoconnect
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [waitingTx, setWaitingTx] = useState<boolean>(false);

  
  const addTokenToMetaMask = async () => {
    if (!provider) {
      alert("Please connect your wallet first.");
      return;
    }
  
    const tokenAddress = contracts.SUYT1.address; // Replace with your token's contract address
    const tokenSymbol = "SUYT1"; // Replace with your token's symbol
    const tokenDecimals = 18; // Replace with your token's decimals
    const tokenImage = "https://example.com/token-logo.png"; // Replace with the token logo URL
  
    try {
      const wasAdded = await (window as any).ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // The token type
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
  
      if (wasAdded) {
        console.log("NEYX Token added to MetaMask!");
      } else {
        console.log("NEYX Token addition declined.");
      }
    } catch (error) {
      console.error("Error adding token to MetaMask:", error);
    }
  };

  // Connect to MetaMask and fetch balances
  const connectWallet = async () => {
    setLoading(true);
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

        const ethBalanceRaw = await newProvider.getBalance(contracts.SUYT2TokenSale.address);
        setContractETHBalance(ethers.formatEther(ethBalanceRaw));

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
    setLoading(false);
  };

  // Disconnect MetaMask
  const disconnectWallet = () => {
    setProvider(null);
    setAccount(null);
    // This will reset the state and prompt for permission on the next connect attempt
  };

  // Function to fetch mockUSDC and SUYT1 token balances
  const fetchTokenBalances = async (signer: ethers.Signer, userAccount: string) => {
    try {
      // mockUSDC (6 decimals)
      const usdcContract = new ethers.Contract(contracts.mockUSDC.address, contracts.mockUSDC.abi, signer);
      const usdcBalanceRaw = await usdcContract.balanceOf(userAccount);
      const usdcBalanceFormatted = ethers.formatUnits(usdcBalanceRaw, 6); // 6 decimals
      setUsdcBalance(parseFloat(usdcBalanceFormatted).toFixed(2)); // Display 2 decimals

      // SUYT1 (18 decimals)
      const suyt1Contract = new ethers.Contract(contracts.SUYT1.address, contracts.SUYT1.abi, signer);
      const suyt1BalanceRaw = await suyt1Contract.balanceOf(userAccount);
      const suyt1BalanceFormatted = ethers.formatUnits(suyt1BalanceRaw, 18); // 18 decimals
      setSuyt1Balance(parseFloat(suyt1BalanceFormatted).toFixed(4)); // Display 4 decimals

    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  const fetchTokenPrices = async (signer: ethers.Signer) => {
    try {
      const tokenSaleContract = new ethers.Contract(contracts.SUYT2TokenSale.address, contracts.SUYT2TokenSale.abi, signer);

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

    const suyt1Contract = new ethers.Contract(contracts.SUYT1.address, contracts.SUYT1.abi, signer);
    const usdcContract = new ethers.Contract(contracts.mockUSDC.address, contracts.mockUSDC.abi, signer);

    try {
      // Fetch the SUYT1 token balance of the SUYT2TokenSale contract
      const suyt1BalanceRaw = await suyt1Contract.balanceOf(contracts.SUYT2TokenSale.address);
      const suyt1BalanceFormatted = ethers.formatUnits(suyt1BalanceRaw, 18); // 18 decimals for SUYT1
      setContractSuyt1Balance(parseFloat(suyt1BalanceFormatted).toFixed(4)); // Display 4 decimals

      // Fetch the USDC balance of the SUYT2TokenSale contract
      const usdcBalanceRaw = await usdcContract.balanceOf(contracts.SUYT2TokenSale.address);
      const usdcBalanceFormatted = ethers.formatUnits(usdcBalanceRaw, 6); // 6 decimals for USDC
      setContractUsdcBalance(parseFloat(usdcBalanceFormatted).toFixed(2)); // Display 2 decimals

    } catch (error) {
      console.error("Error fetching contract balances:", error);
    }
  };

  const buyTokensWithETH = async (numTokens: any) => {
    if (!provider || !account) return;

    const signer = await provider.getSigner();
    const tokenSaleContract = new ethers.Contract(contracts.SUYT2TokenSale.address, contracts.SUYT2TokenSale.abi, signer);
    const priceInWei = ethers.parseEther((numTokens * 0.007).toString());  // Assuming 0.007 ETH per token

    const requiredETH = numTokens * parseFloat(tokenPriceETH);
    if (parseFloat(ethBalance) < requiredETH) {
      setErrorMessage(`Insufficient ETH balance. You need ${requiredETH.toFixed(4)} ETH.`);
      return;
    }
    setErrorMessage(null); // Clear error message if any

    try {
      const tx = await tokenSaleContract.buyTokens(numTokens, { value: priceInWei });
      setWaitingTx(true);
      await tx.wait();
      console.log(`Successfully bought ${numTokens} NEYXT tokens with ETH.`);
      await fetchTokenBalances(signer, account); // Refresh user's USDC and SUYT1 balances
      await fetchContractBalances(signer);       // Refresh contract balances for SUYT1 and USDC
    } catch (error) {
      console.error("Error buying tokens with ETH:", error);
    }
    setWaitingTx(false);
  };

  const buyTokensWithUSDC = async (numTokens: any) => {
    if (!provider || !account) return;

    const signer = await provider.getSigner();
    const usdcContract = new ethers.Contract(
      contracts.mockUSDC.address,
      contracts.mockUSDC.abi,
      signer
    );
    const tokenSaleContract = new ethers.Contract(
      contracts.SUYT2TokenSale.address,
      contracts.SUYT2TokenSale.abi,
      signer
    );

    const usdcAmount = BigInt(numTokens * 30 * 10 ** 6);  // 30 USDC per token

    const requiredUSDC = numTokens * parseFloat(tokenPriceUSDC);
    if (parseFloat(usdcBalance) < requiredUSDC) {
      setErrorMessage(`Insufficient USDC balance. You need ${requiredUSDC.toFixed(4)} ETH.`);
      return;
    }
    setErrorMessage(null); // Clear error message if any

    try {
      // Step 1: Check current allowance
      const currentAllowance = await usdcContract.allowance(account, contracts.SUYT2TokenSale.address);
      console.log(`allowance : ${currentAllowance}`)
      setWaitingTx(true);
      if (currentAllowance < usdcAmount) {
        // Step 2: Request additional approval if needed
        const approvalNeeded = usdcAmount - currentAllowance;
        console.log(`Requesting approval for additional ${ethers.formatUnits(approvalNeeded, 6)} USDC...`);

        // Step 3: Approve the required amount
        const approveTx = await usdcContract.approve(contracts.SUYT2TokenSale.address, approvalNeeded);
        await approveTx.wait();
        console.log(`Approved additional ${ethers.formatUnits(approvalNeeded, 6)} USDC.`);
        console.log(`New allowance : ${currentAllowance}`)

        // Add a short delay to allow MetaMask to reset between transactions
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.log("Sufficient allowance already approved.");
      }


      const tx = await tokenSaleContract.buyTokensWithUSDCcoin(numTokens);
      await tx.wait();
      console.log(`Successfully bought ${numTokens} NEYXT tokens with USDC.`);
      await fetchTokenBalances(signer, account); // Refresh user's USDC and SUYT1 balances
      await fetchContractBalances(signer);       // Refresh contract balances for SUYT1 and USDC
      console.log("Balances refreshed.");
    } catch (error) {
      console.error("Error buying tokens with USDC:", error);
    }
    setWaitingTx(false);
  };


  // Automatically connect to MetaMask if already connected
  useEffect(() => {
    if ((window as any).ethereum && !account) {
      setAutoconnect(true);
      connectWallet();
    }
  }, [account]);

  return (
    <div className="flex flex-col items-center mt-10 space-y-10 bg-gray-900 min-h-screen text-white p-6">
      <div className="flex flex-col items-center space-y-1"> {/* Tighten spacing here */}
        <img
          src="/images/LOGO-TEXT-orange.png"
          alt="Logo"
          className="w-48 h-auto"
        />
        <h3 className="text-xl font-bold">Phase 1</h3>
      </div>

      <button
        onClick={addTokenToMetaMask}
        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-orange-500"
      >
        Add NEYXT Token to MetaMask
      </button>

      {account && autoconnect ? (
        <div className="flex flex-col space-y-6 w-full max-w-xl">
          {/* User Account Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">User Account </h2>
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`w-3 h-3 rounded-full ${account ? "bg-green-500" : "bg-red-500"
                  }`}
              ></span>
              <p><span className="font-medium">Adr:</span> {account || "Not Connected"}</p>
            </div>
            <p><span className="font-medium">Balances:</span> </p>
            <p><span className="font-medium">ETH:</span> <span className="font-bold text-blue-400">{parseFloat(ethBalance).toFixed(4)} ETH</span></p>
            <p><span className="font-medium">USDC:</span> <span className="font-bold text-blue-400">{parseFloat(usdcBalance).toFixed(2)} USDC</span></p>
            <p><span className="font-medium">NEYXT:</span> <span className="font-bold text-blue-400">{parseFloat(suyt1Balance).toFixed(2)} NEYXT</span></p>
          </div>

          {/* Contract Info Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Contract Info</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 bg-gray-700 p-4 rounded-lg">
                <p><span className="font-medium">NEYXT Token Price:</span></p>
                <p><span className="font-medium">in ETH:</span> <span className="font-bold text-orange-400">{parseFloat(tokenPriceETH).toFixed(4)} ETH</span></p>
                <p><span className="font-medium">in UDSC:</span> <span className="font-bold text-orange-400">{parseFloat(tokenPriceUSDC).toFixed(2)} USDC</span></p>
              </div>
              <div className="flex-1 bg-gray-700 p-4 rounded-lg">
                <p><span className="font-medium">Contract Balances</span></p>
                <p><span className="font-medium">NEYXT :</span> <span className="font-bold text-orange-400">{parseFloat(contractSuyt1Balance).toFixed(2)} </span></p>
                <p><span className="font-medium">USDC :</span> <span className="font-bold text-orange-400">{parseFloat(contractUsdcBalance).toFixed(2)} </span></p>
                <p><span className="font-medium">ETH :</span> <span className="font-bold text-orange-400">{parseFloat(contractETHBalance).toFixed(4)} </span></p>
              </div>
            </div>
          </div>

          {/* Buy Tokens Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Buy Tokens</h2>
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="number"
                value={numTokens}
                onChange={(e) => setNumTokens(Number(e.target.value))}
                placeholder="Tokens"
                className="p-2 w-20 border border-gray-600 rounded-lg bg-gray-700 text-white"
              />
              <button
                onClick={() => buyTokensWithETH(numTokens)}
                disabled={waitingTx}
                className={`px-6 py-3 rounded-lg ${waitingTx ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 "
                  } text-white`}
              >
                {waitingTx ? "Wait..." : "Buy with ETH"}

              </button>
              <button
                onClick={() => buyTokensWithUSDC(numTokens)}
                className={`px-6 py-3 rounded-lg ${waitingTx ? "bg-gray-400 cursor-not-allowed" : "px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 "
                  } text-white`}

              >
                {waitingTx ? "Wait ..." : "Buy with USDC"}
              </button>
            </div>
            <div>
              {errorMessage && (
                <p className="text-red-500 mt-4">{errorMessage}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setAutoconnect(true); connectWallet(); }}
          disabled={loading}
          className={`px-6 py-3 rounded-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-500 hover:bg-orange-500"
            } text-white`}
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}