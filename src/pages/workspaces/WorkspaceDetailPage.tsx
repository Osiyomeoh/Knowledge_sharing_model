// src/pages/workspaces/WorkspaceDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import Layout from '../../components/layout/Layout';
import ThreadList from './ThreadList';
import WorkspaceDocumentList from './WorkspaceDocumentList';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationCard from '../../components/common/NotificationCard';
import { 
  Workspace, 
  WorkspaceMember, 
  DiscussionThread, 
  WorkspaceDocument,
  MemberRole
} from '../../types/contracts';
import { formatTimestamp, formatAddress } from '../../utils/formatters';

interface LocationState {
  notification?: {
    type: 'success' | 'error';
    message: string;
  };
}

const WorkspaceDetailsPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { address } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [documentDetails, setDocumentDetails] = useState<Map<number, { name: string; type: string }>>(new Map());
  const [userRole, setUserRole] = useState<MemberRole | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    state?.notification || null
  );
  
  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceDetails(parseInt(workspaceId));
    }
  }, [workspaceId, address]);
  
  const loadWorkspaceDetails = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load workspace details
      const workspaceData = await web3Service.getWorkspace(id);
      setWorkspace(workspaceData);
      
      // Check if current user is the owner
      if (address && workspaceData.owner.toLowerCase() === address.toLowerCase()) {
        setIsOwner(true);
        setUserRole(MemberRole.Owner);
      }
      
      // Load workspace members
      const membersData = await web3Service.getWorkspaceMembers(id);
      setMembers(membersData);
      
      // Determine user's role if not owner
      if (address && !isOwner) {
        const userMember = membersData.find(m => 
          m.userAddress.toLowerCase() === address.toLowerCase()
        );
        if (userMember) {
          setUserRole(userMember.role);
        }
      }
      
      // Load threads
      const threadsData = await web3Service.getWorkspaceThreads(id);
      setThreads(threadsData);
      
      // Load linked documents
      const documentsData = await web3Service.getWorkspaceDocuments(id);
      setDocuments(documentsData);
      
      // Load document details for each linked document
      const detailsMap = new Map<number, { name: string; type: string }>();
      
      await Promise.all(documentsData.map(async (doc) => {
        try {
          const documentData = await web3Service.getDocumentMetadata(doc.documentId);
          detailsMap.set(doc.documentId, { 
            name: documentData.name, 
            type: documentData.documentType 
          });
        } catch (err) {
          console.error(`Error loading document ${doc.documentId}:`, err);
        }
      }));
      
      setDocumentDetails(detailsMap);
      
    } catch (err: any) {
      console.error('Error loading workspace details:', err);
      setError(err.message || 'Error loading workspace details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateThread = () => {
    if (workspaceId) {
      navigate(`/workspaces/${workspaceId}/threads/create`);
    }
  };
  
  const handleLinkDocument = () => {
    if (workspaceId) {
      navigate(`/workspaces/${workspaceId}/link-document`);
    }
  };
  
  const handleUnlinkDocument = async (documentId: number) => {
    if (!workspaceId) return;
    
    try {
      await web3Service.unlinkDocument(parseInt(workspaceId), documentId);
      
      // Update local state
      setDocuments(documents.filter(doc => doc.documentId !== documentId));
      
      setNotification({
        type: 'success',
        message: 'Document unlinked successfully!'
      });
      
    } catch (err: any) {
      console.error('Error unlinking document:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Error unlinking document'
      });
    }
  };
  
  const canCreateThreads = userRole !== null && userRole >= MemberRole.Contributor;
  const canLinkDocuments = userRole !== null && userRole >= MemberRole.Contributor;
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" text="Loading workspace details..." />
        </div>
      </Layout>
    );
  }
  
  if (error || !workspace) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <NotificationCard
            type="error"
            message={error || 'Workspace not found'}
            showCloseButton={false}
          />
          <div className="mt-6 text-center">
            <Link to="/workspaces">
              <Button variant="primary">Back to Workspaces</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
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
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold mr-3">{workspace.name}</h1>
                {workspace.isPrivate ? (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Private
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Public
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                Created by {formatAddress(workspace.owner)} on {formatTimestamp(workspace.createdAt)}
              </p>
              {workspace.description && (
                <div className="mt-4">
                  <p className="text-gray-700 whitespace-pre-line">{workspace.description}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Link to={`/workspaces/${workspaceId}/members`}>
                <Button variant="secondary" size="sm" className="w-full">
                  View Members ({members.length + 1})
                </Button>
              </Link>
              
              {isOwner && (
                <Link to={`/workspaces/${workspaceId}/edit`}>
                  <Button variant="primary" size="sm" className="w-full">
                    Edit Workspace
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ThreadList
              threads={threads}
              workspaceId={parseInt(workspaceId!)}
              canCreateThreads={canCreateThreads}
              onCreateThread={handleCreateThread}
            />
          </div>
          
          <div>
            <WorkspaceDocumentList
              documents={documents}
              documentDetails={documentDetails}
              canLinkDocuments={canLinkDocuments}
              onLinkDocument={handleLinkDocument}
              onUnlinkDocument={isOwner || userRole === MemberRole.Admin ? handleUnlinkDocument : undefined}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkspaceDetailsPage;