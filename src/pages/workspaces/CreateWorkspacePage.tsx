// src/pages/workspaces/CreateWorkspacePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import Layout from '../../components/layout/Layout';
import WorkspaceForm from '../../pages/workspaces/WorkspaceForm';
import NotificationCard from '../../components/common/NotificationCard';

const CreateWorkspacePage: React.FC = () => {
  const { isConnected, isRegistered } = useWeb3();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not connected or registered
    if (!isConnected) {
      navigate('/');
    } else if (!isRegistered) {
      navigate('/register');
    }
  }, [isConnected, isRegistered, navigate]);

  const handleCreateWorkspace = async (name: string, description: string, isPrivate: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const workspaceId = await web3Service.createWorkspace(name, description, isPrivate);
      
      // Redirect to workspace details page
      navigate(`/workspaces/${workspaceId}`, { 
        state: { notification: { type: 'success', message: 'Workspace created successfully!' } }
      });
      
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      setError(err.message || 'Error creating workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {error && (
          <div className="mb-6">
            <NotificationCard
              type="error"
              message={error}
              showCloseButton={true}
              onClose={() => setError(null)}
            />
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Workspace</h1>
          
          <WorkspaceForm
            onSubmit={handleCreateWorkspace}
            isLoading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CreateWorkspacePage;