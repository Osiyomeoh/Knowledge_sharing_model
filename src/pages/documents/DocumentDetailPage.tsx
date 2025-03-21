// src/pages/documents/DocumentDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import pinataService from '../../services/ipfsService';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationCard from '../../components/common/NotificationCard';
import { Document, DocumentVersion, AccessControl, Permission, Visibility } from '../../types/contracts';
import { formatTimestamp, formatAddress, formatFileSize } from '../../utils/formatters';

interface LocationState {
  notification?: {
    type: 'success' | 'error';
    message: string;
  };
}

const DocumentDetailsPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const { address } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [contentUrl, setContentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    state?.notification || null
  );
  const [isOwner, setIsOwner] = useState(false);
  
  useEffect(() => {
    if (documentId) {
      loadDocumentDetails(parseInt(documentId));
    }
  }, [documentId, address]);
  
  const loadDocumentDetails = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load document metadata
      const documentData = await web3Service.getDocumentMetadata(id);
      setDocument(documentData);
      
      // Check if current user is the owner
      if (address && documentData.owner.toLowerCase() === address.toLowerCase()) {
        setIsOwner(true);
      }
      
      // Load document versions
      const versionData = await web3Service.getDocumentVersions(id);
      setVersions(versionData);
      
      // TODO: Load access controls when implemented in contract
      // const accessData = await web3Service.getDocumentAccessControls(id);
      // setAccessControls(accessData);
      
      // Set content URL for preview
      if (documentData.ipfsHash) {
        setContentUrl(pinataService.getIPFSUrl(documentData.ipfsHash));
      }
      
    } catch (err: any) {
      console.error('Error loading document details:', err);
      setError(err.message || 'Error loading document details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (document?.ipfsHash) {
      window.open(contentUrl, '_blank');
    }
  };
  
  const handleShare = () => {
    if (documentId) {
      navigate(`/documents/${documentId}/share`);
    }
  };
  
  const handleAddVersion = () => {
    if (documentId) {
      navigate(`/documents/${documentId}/add-version`);
    }
  };
  
  const handleDelete = async () => {
    // This would be implemented when the contract supports document deletion
    // For now, just show an alert
    alert('Document deletion is not yet implemented in the contract.');
  };
  
  const getVisibilityBadge = (visibility: Visibility) => {
    switch (visibility) {
      case Visibility.Private:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            Private
          </span>
        );
      case Visibility.Restricted:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Restricted
          </span>
        );
      case Visibility.Public:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Public
          </span>
        );
      default:
        return null;
    }
  };
  
  const renderDocumentPreview = () => {
    if (!document || !contentUrl) return null;
    
    const documentType = document.documentType.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'image'].includes(documentType)) {
      return (
        <div className="mb-6 text-center">
          <img
            src={contentUrl}
            alt={document.name}
            className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
          />
        </div>
      );
    } else if (documentType === 'pdf') {
      return (
        <div className="mb-6 text-center">
          <iframe
            src={`${contentUrl}#toolbar=0`}
            className="w-full h-96 rounded-lg shadow-md"
            title={document.name}
          />
        </div>
      );
    } else {
      return (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">
            Preview not available for {documentType} files.{' '}
            {document.downloadable && (
              <span>
                Click the Download button below to view the content.
              </span>
            )}
          </p>
        </div>
      );
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" text="Loading document details..." />
        </div>
      </Layout>
    );
  }
  
  if (error || !document) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <NotificationCard
            type="error"
            message={error || 'Document not found'}
            showCloseButton={false}
          />
          <div className="mt-6 text-center">
            <Link to="/documents">
              <Button variant="primary">Back to Documents</Button>
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
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Document Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-grow">
                <div className="flex items-center mb-2">
                  <h1 className="text-2xl font-bold mr-3">{document.name}</h1>
                  {getVisibilityBadge(document.visibility)}
                </div>
                <p className="text-gray-600 mb-2">
                  {formatFileSize(document.size)} • Uploaded on {formatTimestamp(document.createdAt)}
                </p>
                {!isOwner && (
                  <p className="text-gray-600 mb-2">
                    Owner: {formatAddress(document.owner)}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {document.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                {document.downloadable && (
                  <Button variant="primary" onClick={handleDownload}>
                    Download
                  </Button>
                )}
                
                {isOwner && (
                  <>
                    <Button variant="secondary" onClick={handleShare}>
                      Manage Access
                    </Button>
                    <Button variant="success" onClick={handleAddVersion}>
                      Add Version
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Document Preview */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            {renderDocumentPreview()}
          </div>
          
          {/* Document Notes */}
          {document.editorNotes && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-line">{document.editorNotes}</p>
              </div>
            </div>
          )}
          
          {/* Version History */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Version History</h2>
            
            {versions.length === 0 ? (
              <p className="text-gray-600">No version history available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {versions.map((version) => (
                      <tr key={version.versionNumber}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium">v{version.versionNumber}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatTimestamp(version.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatAddress(version.updatedBy)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="truncate max-w-xs">{version.changeNotes || 'No notes'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          
                            <a href={pinataService.getIPFSUrl(version.ipfsHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Access Controls - Only visible to owner */}
          {isOwner && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Access Controls</h2>
              
              <div className="mb-4">
                <Link to={`/documents/${documentId}/share`}>
                  <Button variant="primary" size="sm">
                    Manage Access Controls
                  </Button>
                </Link>
              </div>
              
              {/* This would be populated when access controls are implemented */}
              <p className="text-gray-600">
                Configure who can access this document and what permissions they have.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DocumentDetailsPage;