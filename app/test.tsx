"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function Home() {
    const [account, setAccount] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

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

    // Step 2: Handle MetaMask logic as before
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && typeof window !== 'undefined' && (window as any).ethereum) {
            const connectMetaMask = async () => {
                try {
                    const provider = new ethers.BrowserProvider((window as any).ethereum);
                    const accounts = await provider.send("eth_requestAccounts", []);
                    setAccount(accounts[0]);
                } catch (error) {
                    console.error("Error connecting to MetaMask:", error);
                }
            };

            connectMetaMask();
        }
    }, [isClient]);

    if (!isClient) return null;

    return (
        <div>
            <h1>Welcome to the MetaMask Connection Page</h1>
            {account ? (
                <p>Connected Account: {account}</p>
            ) : (
                <p>Not connected</p>
            )}
        </div>
    );
}