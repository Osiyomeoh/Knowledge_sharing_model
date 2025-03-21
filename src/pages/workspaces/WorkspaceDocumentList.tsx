// src/components/workspaces/WorkspaceDocumentList.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { WorkspaceDocument } from '../../types/contracts';
import { formatTimestamp, formatAddress } from '../../utils/formatters';
import Button from '../../components/common/Button';

interface WorkspaceDocumentListProps {
  documents: WorkspaceDocument[];
  documentDetails: Map<number, { name: string; type: string }>;
  canLinkDocuments: boolean;
  onLinkDocument: () => void;
  onUnlinkDocument?: (documentId: number) => Promise<void>;
  isLoading: boolean;
}

const WorkspaceDocumentList: React.FC<WorkspaceDocumentListProps> = ({
  documents,
  documentDetails,
  canLinkDocuments,
  onLinkDocument,
  onUnlinkDocument,
  isLoading
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Linked Documents</h2>
        {canLinkDocuments && (
          <Button variant="primary" onClick={onLinkDocument}>
            Link Document
          </Button>
        )}
      </div>
      
      {documents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No documents linked to this workspace yet.</p>
          {canLinkDocuments && (
            <Button variant="primary" onClick={onLinkDocument}>
              Link a Document
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added On
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
              {documents.map((doc) => (
                <tr key={doc.documentId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/documents/${doc.documentId}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {documentDetails.get(doc.documentId)?.name || `Document #${doc.documentId}`}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatAddress(doc.addedBy)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(doc.addedAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <p className="truncate max-w-xs">{doc.notes || 'No notes'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link 
                        to={`/documents/${doc.documentId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      
                      {canLinkDocuments && onUnlinkDocument && (
                        <button
                          onClick={() => onUnlinkDocument(doc.documentId)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isLoading}
                        >
                          Unlink
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDocumentList;