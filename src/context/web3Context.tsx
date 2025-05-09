// src/context/Web3Context.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import web3Service from '../services/web3Service';
import { UserProfile } from '../types/contracts';

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  isRegistered: boolean;
  userProfile: UserProfile | null;
  connectWallet: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  loading: boolean;
  networkName: string | null;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
  error: string | null;
}

// Define the expected network details
const EXPECTED_NETWORK = {
  chainId: '0xaa36a7', // Sepolia testnet in hex
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  isRegistered: false,
  userProfile: null,
  connectWallet: async () => {},
  refreshUserProfile: async () => {},
  loading: false,
  networkName: null,
  isCorrectNetwork: false,
  switchNetwork: async () => {},
  error: null
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for browser/device compatibility
 // Update this useEffect in your Web3Context.tsx

// useEffect(() => {
//     const checkBrowserCompatibility = () => {
//       // First check if ethereum provider exists
//       const hasProvider = typeof window.ethereum !== 'undefined';
      
//       if (!hasProvider) {
//         // No provider available - display helpful message
//         // Make this message more visually appealing
//         document.body.innerHTML = `
//           <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif; line-height: 1.6;">
//             <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Web3 Wallet Required</h2>
//             <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
//               This application requires a Web3 wallet like MetaMask to function properly.
//             </p>
//             <div style="max-width: 500px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
//               <p style="font-weight: bold; margin-bottom: 10px;">To use this application:</p>
//               <ul style="text-align: left; margin-bottom: 20px;">
//                 <li style="margin-bottom: 8px;">Install MetaMask or another Ethereum wallet</li>
//                 <li style="margin-bottom: 8px;">Connect your wallet to the Sepolia testnet</li>
//                 <li>Refresh this page after installation</li>
//               </ul>
//               <div>
//                 <a href="https://metamask.io/download/" 
//                    target="_blank" 
//                    style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; 
//                           text-decoration: none; border-radius: 4px; font-weight: bold; margin-bottom: 15px;">
//                   Download MetaMask
//                 </a>
//               </div>
//               <button onclick="window.location.reload()" 
//                       style="border: none; background-color: #eee; padding: 10px 20px; 
//                              border-radius: 4px; cursor: pointer; font-weight: bold;">
//                 Refresh Page
//               </button>
//             </div>
//           </div>
//         `;
        
//         // Detect if it's a mobile device to provide more specific instructions
//         const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
//         if (isMobile) {
//           // Add mobile-specific instructions
//           const instructionsElement = document.createElement('div');
//           instructionsElement.style.marginTop = '20px';
//           instructionsElement.style.padding = '15px';
//           instructionsElement.style.border = '1px solid #e0c3c3';
//           instructionsElement.style.backgroundColor = '#fff8f8';
//           instructionsElement.style.borderRadius = '8px';
//           instructionsElement.style.color = '#d63939';
//           instructionsElement.innerHTML = `
//             <p style="font-weight: bold;">For Mobile Users:</p>
//             <p>You can access this application by using:</p>
//             <ul style="text-align: left; margin-top: 10px;">
//               <li style="margin-bottom: 8px;">MetaMask Mobile Browser</li>
//               <li style="margin-bottom: 8px;">Trust Wallet Browser</li>
//               <li>Coinbase Wallet Browser</li>
//             </ul>
//           `;
          
//           // Get the container we created earlier
//           const container = document.querySelector('div[style*="padding: 40px"]');
//           if (container) {
//             container.appendChild(instructionsElement);
//           }
//         }
//       }
//     };
    
//     checkBrowserCompatibility();
//   }, []);

  // Check current network
  const checkNetwork = async () => {
    try {
      if (!window.ethereum) return;
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      // Check if we're on the expected network
      setIsCorrectNetwork(chainId === EXPECTED_NETWORK.chainId);
      
      // Get network name (this is simple, in a real app you might use a mapping)
      switch (chainId) {
        case '0x1':
          setNetworkName('Ethereum Mainnet');
          break;
        case '0xaa36a7':
          setNetworkName('Sepolia');
          break;
        case '0x5':
          setNetworkName('Goerli');
          break;
        case '0x89':
          setNetworkName('Polygon');
          break;
        default:
          setNetworkName(`Chain ID: ${chainId}`);
      }
    } catch (err) {
      console.error('Error checking network:', err);
    }
  };

  // Switch to the expected network
  const switchNetwork = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EXPECTED_NETWORK.chainId }]
      });
      
      // The network switch will trigger a chainChanged event which handles state updates
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [EXPECTED_NETWORK]
          });
        } catch (addError) {
          console.error('Error adding network to MetaMask:', addError);
          setError('Could not add network to MetaMask');
        }
      } else {
        console.error('Error switching network:', switchError);
        setError(switchError.message || 'Error switching network');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
        try {
          setLoading(true);
          setError(null);
          
          if (typeof window.ethereum === 'undefined') {
            // Just set isConnected to false and continue loading the app
            setIsConnected(false);
            return; // Don't set an error - allow app to load normally
          }
          
          // Rest of your function stays the same
          await checkNetwork();
          
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            
            if (isCorrectNetwork) {
              await checkUserRegistration(accounts[0]);
            }
          }
        } catch (err: any) {
          console.error('Error checking connection:', err);
          // Don't set error for missing provider
          if (window.ethereum) {
            setError('Failed to connect to wallet: ' + err.message);
          }
        } finally {
          setLoading(false);
        }
      };

    checkConnection();

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        setAddress(null);
        setIsConnected(false);
        setIsRegistered(false);
        setUserProfile(null);
      } else {
        // Connected with a different account
        setAddress(accounts[0]);
        setIsConnected(true);
        if (isCorrectNetwork) {
          await checkUserRegistration(accounts[0]);
        }
      }
    };

    const handleChainChanged = async (chainId: string) => {
      setChainId(chainId);
      await checkNetwork();
      
      if (isCorrectNetwork && address) {
        await checkUserRegistration(address);
      } else {
        // If we're not on the correct network, reset user data
        setIsRegistered(false);
        setUserProfile(null);
      }
      
      // We don't force reload the page anymore, instead we handle it gracefully
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
    
    return undefined;
  }, [isCorrectNetwork]);

  const checkUserRegistration = async (address: string) => {
    if (!isCorrectNetwork) return;
    
    try {
      setError(null);
      const userExists = await web3Service.userExists(address);
      setIsRegistered(userExists);
      if (userExists) {
        const profile = await web3Service.getUserProfile(address);
        setUserProfile(profile);
      }
    } catch (err: any) {
      console.error('Error checking user registration:', err);
      setError('Failed to get user profile: ' + err.message);
    }
  };

  const connectWallet = async () => {
    if (!web3Service.isProviderAvailable()) {
      web3Service.showWalletRequiredMessage();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // First check/set the network
      await checkNetwork();
      
      // Connect wallet
      const address = await web3Service.connectWallet();
      setAddress(address);
      setIsConnected(true);
      
      // Only try to get user data if on correct network
      if (isCorrectNetwork) {
        await checkUserRegistration(address);
      } else {
        setError(`Please switch to ${EXPECTED_NETWORK.chainName} network`);
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (!address || !isCorrectNetwork) return;
    try {
      setLoading(true);
      setError(null);
      await checkUserRegistration(address);
    } catch (err: any) {
      console.error('Error refreshing user profile:', err);
      setError('Failed to refresh user profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        isRegistered,
        userProfile,
        connectWallet,
        refreshUserProfile,
        loading,
        networkName,
        isCorrectNetwork,
        switchNetwork,
        error
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};