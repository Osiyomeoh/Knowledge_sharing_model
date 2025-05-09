// src/pages/workspaces/WorkspacesPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import Layout from '../../components/layout/Layout';
import WorkspaceCard from './WorkspaceCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationCard from '../../components/common/NotificationCard';
import { Workspace } from '../../types/contracts';

const WorkspacesPage: React.FC = () => {
  const { isConnected, isRegistered, address } = useWeb3();
  const navigate = useNavigate();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // Redirect if not connected or registered
    if (!isConnected) {
      navigate('/');
    } else if (!isRegistered) {
      navigate('/register');
    } else {
      loadWorkspaces();
    }
  }, [isConnected, isRegistered, navigate, address]);

  const loadWorkspaces = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const workspaceIds = await web3Service.getUserWorkspaces(address);
      
      const workspacePromises = workspaceIds.map(async (id) => {
        try {
          return await web3Service.getWorkspace(id);
// src/pages/workspaces/WorkspacesPage.tsx (continued)
return await web3Service.getWorkspace(id);
} catch (err) {
  console.error(`Error loading workspace ${id}:`, err);
  return null;
}
});

const fetchedWorkspaces = (await Promise.all(workspacePromises))
.filter((workspace): workspace is Workspace => workspace !== null)
.sort((a, b) => b.lastUpdated - a.lastUpdated); // Sort by most recently updated

setWorkspaces(fetchedWorkspaces);
} catch (err: any) {
console.error('Error loading workspaces:', err);
setError(err.message || 'Error loading workspaces');
} finally {
setLoading(false);
}
};

const handleManageMembers = (workspaceId: number) => {
navigate(`/workspaces/${workspaceId}/members`);
};

return (
<Layout>
<div className="container mx-auto px-4 py-8">
{notification && (
  <div className="mb-6">
    <NotificationCard
      type={notification.type}
      message={notification.message}
      duration={5000}
      onClose={() => setNotification(null)}
    />
  </div>
)}

<div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">My Workspaces</h1>
  <Link to="/workspaces/create">
    <Button variant="primary">
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Create New Workspace
    </Button>
  </Link>
</div>

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

{loading ? (
  <div className="flex justify-center py-8">
    <LoadingSpinner size="lg" text="Loading workspaces..." />
  </div>
) : workspaces.length === 0 ? (
  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
    <svg 
      className="mx-auto h-12 w-12 text-gray-400" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
      />
    </svg>
    <p className="mt-4 text-gray-600">You haven't created or joined any workspaces yet.</p>
    <div className="mt-6">
      <Link to="/workspaces/create">
        <Button variant="primary">Create Your First Workspace</Button>
      </Link>
    </div>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {workspaces.map(workspace => (
      <WorkspaceCard
        key={workspace.id}
        workspace={workspace}
        isOwner={address ? workspace.owner.toLowerCase() === address.toLowerCase() : false}
        onManageMembers={handleManageMembers}
      />
    ))}
  </div>
)}
</div>
</Layout>
);
};

export default WorkspacesPage;