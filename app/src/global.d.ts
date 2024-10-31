// src/global.d.ts
interface EthereumProvider {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: Array<any> }) => Promise<any>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
    removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

interface Window {
    ethereum?: EthereumProvider;
}