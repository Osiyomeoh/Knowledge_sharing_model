// src/components/common/WalletCheck.tsx

import React, { useEffect, useState } from 'react';

const WalletCheck: React.FC = () => {
  const [noWallet, setNoWallet] = useState(false);
  
  useEffect(() => {
    // Check for wallet availability
    const checkWalletAvailability = () => {
      if (typeof window !== 'undefined') {
        // If on mobile and no ethereum provider
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (!window.ethereum) {
          setNoWallet(true);
        }
      }
    };
    
    checkWalletAvailability();
  }, []);
  
  if (!noWallet) return null;
  
  return (
    <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold mb-4">Web3 Wallet Required</h2>
      <p className="mb-4">
        This application requires a Web3 wallet like MetaMask to function properly.
      </p>
      <div className="mb-6">
        <p className="font-semibold mb-2">To use this application:</p>
        <ul className="text-left list-disc pl-4 mb-4">
          <li>Install MetaMask or another Ethereum wallet</li>
          <li>Connect your wallet to the Sepolia testnet</li>
          <li>Refresh this page</li>
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download MetaMask
        </a>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

export default WalletCheck;