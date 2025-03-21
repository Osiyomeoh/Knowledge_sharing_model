// src/components/workspaces/ThreadList.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { DiscussionThread } from '../../types/contracts';
import { formatTimestamp, formatAddress } from '../../utils/formatters';
import Button from '../../components/common/Button';

interface ThreadListProps {
  threads: DiscussionThread[];
  workspaceId: number;
  canCreateThreads: boolean;
  onCreateThread: () => void;
}

const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  workspaceId,
  canCreateThreads,
  onCreateThread
}) => {
  // Sort threads: pinned first, then by last updated date
  const sortedThreads = [...threads].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1; // Pinned threads first
    }
    return b.lastUpdated - a.lastUpdated; // Newest updates first
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Discussion Threads</h2>
        {canCreateThreads && (
          <Button variant="primary" onClick={onCreateThread}>
            New Thread
          </Button>
        )}
      </div>
      
      {sortedThreads.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No discussion threads yet.</p>
          {canCreateThreads && (
            <Button variant="primary" onClick={onCreateThread}>
              Start a New Discussion
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedThreads.map(thread => (
            <div 
              key={thread.id} 
              className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                thread.isPinned ? 'border-blue-300 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <Link 
                      to={`/workspaces/${workspaceId}/threads/${thread.id}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {thread.title}
                    </Link>
                    {thread.isPinned && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Pinned
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Created by {formatAddress(thread.creator)} on {formatTimestamp(thread.createdAt)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Last updated: {formatTimestamp(thread.lastUpdated)}
                  </div>
                </div>
                <Link 
                  to={`/workspaces/${workspaceId}/threads/${thread.id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  View Thread
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadList;