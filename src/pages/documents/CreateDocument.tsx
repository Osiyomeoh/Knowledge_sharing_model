// src/pages/documents/CreateDocumentPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import ipfsService from '../../services/ipfsService';
import Layout from '../../components/layout/Layout';
import DocumentForm from './DocumentForm';
import NotificationCard from '../../components/common/NotificationCard';
import { Visibility } from '../../types/contracts';

const CreateDocumentPage: React.FC = () => {
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

  const handleCreateDocument = async (
    name: string,
    file: File,
    documentType: string,
    visibility: Visibility,
    downloadable: boolean,
    tags: string[],
    editorNotes: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Upload file to IPFS
      const ipfsHash = await ipfsService.uploadFile(file);
      
      // Create document in contract
      const documentId = await web3Service.createDocument(
        name,
        ipfsHash,
        documentType,
        file.size,
        visibility,
        downloadable,
        tags,
        editorNotes
      );
      
      // Redirect to document details page
      navigate(`/documents/${documentId}`, { 
        state: { notification: { type: 'success', message: 'Document uploaded successfully!' } }
      });
      
    } catch (err: any) {
      console.error('Error creating document:', err);
      setError(err.message || 'Error creating document. Please try again.');
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
          <h1 className="text-2xl font-bold mb-6">Upload New Document</h1>
          
          <DocumentForm 
            onSubmit={handleCreateDocument}
            isLoading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CreateDocumentPage;