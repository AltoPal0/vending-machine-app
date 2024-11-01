// app/layout.tsx
import { Web3Provider } from './Web3Context';

export const metadata = {
  title: 'ETH Balance Checker',
  description: 'Connect to MetaMask and check ETH balance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}