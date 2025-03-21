// src/components/documents/DocumentCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Document, Visibility } from '../../types/contracts';
import { formatTimestamp, formatFileSize, formatAddress } from '../../utils/formatters';

interface DocumentCardProps {
  document: Document;
  isOwner: boolean;
  onClickShare?: (documentId: number) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  isOwner,
  onClickShare 
}) => {
  const getDocumentTypeIcon = (documentType: string) => {
    switch (documentType.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
      case 'docx':
      case 'txt':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'xls':
      case 'xlsx':
      case 'csv':
        return (
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div className="mr-3">
            {getDocumentTypeIcon(document.documentType)}
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {document.name}
              </h3>
              <div className="ml-2 shrink-0">
                {getVisibilityBadge(document.visibility)}
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-2">
              {formatFileSize(document.size)} • Added on {formatTimestamp(document.createdAt)}
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {document.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            
            {!isOwner && (
              <div className="text-xs text-gray-500 mb-2">
                Owner: {formatAddress(document.owner)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
        <Link 
          to={`/documents/${document.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </Link>
        
        {isOwner && onClickShare && (
          <button
            onClick={() => onClickShare(document.id)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;