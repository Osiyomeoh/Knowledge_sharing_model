// src/pages/documents/DocumentsPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import ipfsService from '../../services/ipfsService';
import Layout from '../../components/layout/Layout';
import DocumentList from './DocumentList';
import Button from '../../components/common/Button';
import NotificationCard from '../../components/common/NotificationCard';
import { Document } from '../../types/contracts';

const DocumentsPage: React.FC = () => {
  const { isConnected, isRegistered, address } = useWeb3();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<Document[]>([]);
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
      loadDocuments();
    }
  }, [isConnected, isRegistered, navigate, address]);

  const loadDocuments = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const documentIds = await web3Service.getUserDocuments(address);
      
      const documentPromises = documentIds.map(async (id) => {
        try {
          return await web3Service.getDocumentMetadata(id);
        } catch (err) {
          console.error(`Error loading document ${id}:`, err);
          return null;
        }
      });
      
      const fetchedDocuments = (await Promise.all(documentPromises))
        .filter((doc): doc is Document => doc !== null)
        .sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date, newest first
      
      setDocuments(fetchedDocuments);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError(err.message || 'Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  const handleShareDocument = (documentId: number) => {
    navigate(`/documents/${documentId}/share`);
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
          <h1 className="text-2xl font-bold">My Documents</h1>
          <Link to="/documents/create">
            <Button variant="primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload New Document
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
        
        <DocumentList
          documents={documents}
          isLoading={loading}
          emptyMessage="You haven't uploaded any documents yet. Click 'Upload New Document' to get started."
          userAddress={address || undefined}
          onClickShare={handleShareDocument}
        />
      </div>
    </Layout>
  );
};

export default DocumentsPage;