// src/components/layout/Layout.tsx

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useWeb3 } from '../../context/web3Context';
import LoadingSpinner from '../common/LoadingSpinner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { loading } = useWeb3();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        ) : (
          children
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;