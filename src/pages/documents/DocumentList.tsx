// src/components/documents/DocumentList.tsx

import React, { useState } from 'react';
import DocumentCard from './DocumentCard';
import { Document } from '../../types/contracts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  emptyMessage?: string;
  userAddress?: string;
  onClickShare?: (documentId: number) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  emptyMessage = 'No documents found',
  userAddress,
  onClickShare
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Deselect if already selected
    } else {
      setSelectedTag(tag); // Select the tag
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" text="Loading documents..." />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
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
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" 
          />
        </svg>
        <p className="mt-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by name or tag..."
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map(document => (
          <DocumentCard
            key={document.id}
            document={document}
            isOwner={userAddress ? document.owner.toLowerCase() === userAddress.toLowerCase() : false}
            onClickShare={onClickShare}
          />
        ))}
      </div>
      
      {filteredDocuments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No documents match your search criteria.
        </div>
      )}
    </div>
  );
};

export default DocumentList;