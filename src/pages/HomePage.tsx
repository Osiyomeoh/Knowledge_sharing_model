// src/pages/HomePage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/web3Context';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

const HomePage: React.FC = () => {
  const { isConnected, connectWallet, isRegistered } = useWeb3();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleConnectWallet = async () => {
    // Check if ethereum is available
    if (typeof window.ethereum === 'undefined') {
      setShowWalletModal(true);
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Connection error:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Decentralized Collaboration Platform
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-600">
              Securely create, share, and collaborate on documents with blockchain-powered
              access control and version tracking.
            </p>
            
            {!isConnected ? (
              <Button 
                onClick={handleConnectWallet}
                variant="primary"
                size="lg"
                className="px-8"
              >
                Connect Wallet to Get Started
              </Button>
            ) : !isRegistered ? (
              <Link to="/register">
                <Button 
                  variant="primary"
                  size="lg"
                  className="px-8"
                >
                  Register Your Profile
                </Button>
              </Link>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/documents">
                  <Button 
                    variant="primary"
                    size="lg"
                  >
                    My Documents
                  </Button>
                </Link>
                <Link to="/workspaces">
                  <Button 
                    variant="success"
                    size="lg"
                  >
                    My Workspaces
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-blue-500 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Document Management</h3>
              <p className="text-gray-600 mb-4">
                Upload your documents to IPFS and manage access permissions with blockchain-based security.
                Control who can view, comment, or edit your documents.
              </p>
              <Link to="/documents" className="text-blue-600 hover:text-blue-800 font-medium">
                Learn more →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-green-500 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Collaborative Workspaces</h3>
              <p className="text-gray-600 mb-4">
                Create dedicated spaces for teams to collaborate on projects with granular access controls.
                Discussion threads, document linking, and role-based permissions.
              </p>
              <Link to="/workspaces" className="text-green-600 hover:text-green-800 font-medium">
                Learn more →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-indigo-500 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">User Verification</h3>
              <p className="text-gray-600 mb-4">
                Build trust with KYC verification and manage a network of trusted collaborators.
                Track user reputation and establish trust in a decentralized environment.
              </p>
              <Link to="/profile" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Learn more →
              </Link>
            </div>
          </div>
          
          <div className="bg-blue-600 text-white rounded-lg p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join our decentralized collaboration platform today and experience
                the future of secure document management and team collaboration.
              </p>
            </div>
            
            <div className="flex justify-center">
              {!isConnected ? (
                <Button 
                  onClick={handleConnectWallet}
                  variant="secondary"
                  size="lg"
                  className="px-8 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Connect Wallet
                </Button>
              ) : !isRegistered ? (
                <Link to="/register">
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="px-8 bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Register Now
                  </Button>
                </Link>
              ) : (
                <Link to="/documents">
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="px-8 bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallet Required Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Web3 Wallet Required</h3>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="mb-4">This application requires a Web3 wallet like MetaMask to access blockchain features.</p>
            <div className="mb-4">
              <a 
                href="https://metamask.io/download/" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
              >
                Download MetaMask
              </a>
            </div>
            <button
              onClick={() => setShowWalletModal(false)}
              className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded hover:bg-gray-300"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;