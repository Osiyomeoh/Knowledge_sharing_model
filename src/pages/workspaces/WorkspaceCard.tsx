// src/components/workspaces/WorkspaceCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Workspace } from '../../types/contracts';
import { formatTimestamp, formatAddress } from '../../utils/formatters';
import Button from '../../components/common/Button';

interface WorkspaceCardProps {
  workspace: Workspace;
  isOwner: boolean;
  onManageMembers?: (workspaceId: number) => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ 
  workspace, 
  isOwner,
  onManageMembers 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {workspace.name}
          </h3>
          <div>
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
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {workspace.description}
        </p>
        
        <div className="text-sm text-gray-500 mb-4">
          Created on {formatTimestamp(workspace.createdAt)}
          {!isOwner && (
            <div className="mt-1">
              Owner: {formatAddress(workspace.owner)}
            </div>
          )}
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <Link 
          to={`/workspaces/${workspace.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Workspace
        </Link>
        
        {isOwner && onManageMembers && (
          <Button
            onClick={() => onManageMembers(workspace.id)}
            variant="secondary"
            size="sm"
          >
            Manage Members
          </Button>
        )}
      </div>
    </div>
  );
};

export default WorkspaceCard;