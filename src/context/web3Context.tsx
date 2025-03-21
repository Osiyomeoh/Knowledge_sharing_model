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
        
        if (!window.ethereum) {
          setError('MetaMask is not installed');
          return;
        }
        
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
        setError('Failed to connect to wallet: ' + err.message);
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
    if (!window.ethereum) {
      setError('Please install MetaMask to use this application');
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