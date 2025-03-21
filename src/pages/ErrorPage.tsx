// src/pages/ErrorPage.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="primary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Link to="/">
              <Button variant="secondary">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ErrorPage;