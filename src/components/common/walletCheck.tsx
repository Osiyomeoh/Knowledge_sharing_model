// src/components/common/WalletCheck.tsx

import React, { useEffect, useState } from 'react';

const WalletCheck: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Check if ethereum provider exists
    const hasProvider = typeof window.ethereum !== 'undefined';
    if (!hasProvider) {
      setHasError(true);
    }
  }, []);
  
  if (!hasError) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      zIndex: 9999,
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6
    }}>
      <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
        Web3 Wallet Required
      </h2>
      <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
        This application requires a Web3 wallet like MetaMask to function properly.
      </p>
      
      <div style={{ 
        maxWidth: '500px', 
        margin: '0 auto', 
        border: '1px solid #ddd', 
        padding: '20px', 
        borderRadius: '8px', 
        backgroundColor: '#f9f9f9' 
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>To use this application:</p>
        <ul style={{ textAlign: 'left', marginBottom: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Install MetaMask or another Ethereum wallet</li>
          <li style={{ marginBottom: '8px' }}>Connect your wallet to the Sepolia testnet</li>
          <li>Refresh this page after installation</li>
        </ul>
        
        <div>
          <a 
            href="https://metamask.io/download/" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#3498db',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}
          >
            Download MetaMask
          </a>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            border: 'none',
            backgroundColor: '#eee',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Refresh Page
        </button>
      </div>
      
      {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          border: '1px solid #e0c3c3',
          backgroundColor: '#fff8f8',
          borderRadius: '8px',
          color: '#d63939'
        }}>
          <p style={{ fontWeight: 'bold' }}>For Mobile Users:</p>
          <p>You can access this application by using:</p>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li style={{ marginBottom: '8px' }}>MetaMask Mobile Browser</li>
            <li style={{ marginBottom: '8px' }}>Trust Wallet Browser</li>
            <li>Coinbase Wallet Browser</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default WalletCheck;