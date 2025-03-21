// src/pages/ExplorePage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/web3Context';
import web3Service from '../services/web3Service';
import Layout from '../components/layout/Layout';
import DocumentCard from '../pages/documents/DocumentCard';
import WorkspaceCard from '../pages/workspaces/WorkspaceCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationCard from '../components/common/NotificationCard';
import { Document, Workspace, Visibility } from '../types/contracts';

const ExplorePage: React.FC = () => {
  const { address } = useWeb3();
  
  const [activeTab, setActiveTab] = useState<'documents' | 'workspaces'>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'documents') {
      loadPublicDocuments();
    } else {
      loadPublicWorkspaces();
    }
  }, [activeTab]);

  const loadPublicDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you'd need to add a method to fetch public documents
      // This is a placeholder - you'd need to implement this method in your contract and web3Service
      
      // For now, let's use a placeholder implementation
      const publicDocs: Document[] = [];
      setDocuments(publicDocs);
      
    } catch (err: any) {
      console.error('Error loading public documents:', err);
      setError(err.message || 'Error loading public documents');
    } finally {
      setLoading(false);
    }
  };

  const loadPublicWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you'd need to add a method to fetch public workspaces
      // This is a placeholder - you'd need to implement this method in your contract and web3Service
      
      // For now, let's use a placeholder implementation
      const publicWorkspaces: Workspace[] = [];
      setWorkspaces(publicWorkspaces);
      
    } catch (err: any) {
      console.error('Error loading public workspaces:', err);
      setError(err.message || 'Error loading public workspaces');
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique tags from documents
  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags))
  ).sort();

  // Filter documents based on search term and selected tag
  const filteredDocuments = documents.filter(document => {
    const matchesSearch = searchTerm === '' || 
      document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === null || document.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Filter workspaces based on search term
  const filteredWorkspaces = workspaces.filter(workspace => 
    searchTerm === '' || 
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Deselect if already selected
    } else {
      setSelectedTag(tag); // Select the tag
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Explore</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('workspaces')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'workspaces'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Workspaces
            </button>
          </div>
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
        
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text={`Loading ${activeTab}...`} />
          </div>
        ) : activeTab === 'documents' ? (
          <>
            {allTags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
            
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No public documents available.</p>
                <Link to="/documents/create">
                  <Button variant="primary">Create a Document</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map(document => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    isOwner={address ? document.owner.toLowerCase() === address.toLowerCase() : false}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {filteredWorkspaces.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No public workspaces available.</p>
                <Link to="/workspaces/create">
                  <Button variant="primary">Create a Workspace</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkspaces.map(workspace => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    isOwner={address ? workspace.owner.toLowerCase() === address.toLowerCase() : false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ExplorePage;