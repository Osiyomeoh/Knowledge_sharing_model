// src/components/workspaces/DiscussionThread.tsx

import React, { useState } from 'react';
import { DiscussionThread, Post } from '../../types/contracts';
import { formatTimestamp, formatAddress } from '../../utils/formatters';
import Button from '../../components/common/Button';

interface DiscussionThreadProps {
  thread: DiscussionThread;
  posts: Post[];
  canPost: boolean;
  onAddPost: (content: string) => Promise<void>;
  isLoading: boolean;
}

const DiscussionThreadComponent: React.FC<DiscussionThreadProps> = ({
  thread,
  posts,
  canPost,
  onAddPost,
  isLoading
}) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    setError('');
    
    try {
      await onAddPost(newPostContent);
      setNewPostContent('');
    } catch (err: any) {
      setError(err.message || 'Error adding post');
    }
  };

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          <div className="text-sm text-gray-600 mt-2">
            Created by {formatAddress(thread.creator)} on {formatTimestamp(thread.createdAt)}
          </div>
        </div>
      </div>
      
      <div className="space-y-6 mb-8">
        {posts.map(post => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between mb-4">
              <div className="text-sm text-gray-600">
                Posted by {formatAddress(post.author)} on {formatTimestamp(post.createdAt)}
                {post.isEdited && <span className="ml-2 italic">(edited)</span>}
              </div>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-line">{post.content}</div>
            </div>
          </div>
        ))}
      </div>
      
      {canPost && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Add Reply</h3>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Write your reply here..."
                disabled={isLoading}
              ></textarea>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || !newPostContent.trim()}
            >
              Post Reply
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DiscussionThreadComponent;