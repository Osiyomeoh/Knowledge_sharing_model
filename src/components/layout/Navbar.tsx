// src/components/layout/Navbar.tsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import { formatAddress } from '../../utils/formatters';
import Button from '../common/Button';

const Navbar: React.FC = () => {
  const { address, isConnected, connectWallet, isRegistered, userProfile } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    // Prevent multiple clicks
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      console.log("Attempting to connect wallet...");
      if (typeof window !== 'undefined' && typeof window.ethereum === 'undefined') {
        console.log("No wallet detected, showing modal");
        setShowWalletModal(true);
        return;
      }
      
      // Call the connect function from context
      await connectWallet();
      console.log("Wallet connected successfully");
    } catch (error) {
      console.error('Connection error:', error);
      // Show the wallet modal if connection fails
      setShowWalletModal(true);
    } finally {
      setIsConnecting(false);
    }
  };

  // Reset connecting state if component unmounts during connection
  useEffect(() => {
    return () => {
      setIsConnecting(false);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Debug logging to check values
  useEffect(() => {
    console.log("Wallet connection state:", { isConnected, isRegistered, address });
  }, [isConnected, isRegistered, address]);

  return (
    <nav className="bg-gray-800 px-4 py-3 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              Web3 Collaboration
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/explore"
              className={`text-sm font-medium ${
                isActive('/explore') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Explore
            </Link>

            {isConnected && isRegistered && (
              <>
                <Link
                  to="/documents"
                  className={`text-sm font-medium ${
                    isActive('/documents') ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Documents
                </Link>
                <Link
                  to="/workspaces"
                  className={`text-sm font-medium ${
                    isActive('/workspaces') ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Workspaces
                </Link>
              </>
            )}

            {isConnected ? (
              <div className="flex items-center space-x-3">
                {isRegistered ? (
                  <Link
                    to="/profile"
                    className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm"
                  >
                    <span className="mr-2">
                      {userProfile?.username || formatAddress(address || '')}
                    </span>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                )}
                <span className="text-green-400 text-xs">
                  {formatAddress(address || '')}
                </span>
              </div>
            ) : (
              <Button 
                onClick={handleConnectWallet}
                variant="primary" 
                size="sm"
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 pt-2 border-t border-gray-700">
            <div className="flex flex-col space-y-2">
              <Link
                to="/explore"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/explore')
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>

              {isConnected && isRegistered && (
                <>
                  <Link
                    to="/documents"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/documents')
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Documents
                  </Link>
                  <Link
                    to="/workspaces"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/workspaces')
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Workspaces
                  </Link>
                </>
              )}

              {isConnected ? (
                <div className="flex flex-col space-y-2">
                  {isRegistered ? (
                    <Link
                      to="/profile"
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile {userProfile?.username && `(${userProfile.username})`}
                    </Link>
                  ) : (
                    <Link
                      to="/register"
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  )}
                  <div className="px-3 py-1 text-green-400 text-xs">
                    {formatAddress(address || '')}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Wallet Connection Required</h2>
            <p className="mb-4">
              You need a Web3 wallet like MetaMask to use this application. Please install a compatible wallet to continue.
            </p>
            <div className="flex justify-between">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Get MetaMask
              </a>
              <button
                onClick={() => setShowWalletModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;