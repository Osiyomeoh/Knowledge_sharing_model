// src/pages/ThreadDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import { formatDate, shortenAddress } from '../../utils/helpers';
import web3Service from '../../services/web3Service';
import { Post, DiscussionThread } from '../../types/contracts';

const ThreadDetail: React.FC = () => {
  const { workspaceId, threadId } = useParams<{ workspaceId: string, threadId: string }>();
  const numWorkspaceId = parseInt(workspaceId || '0');
  const numThreadId = parseInt(threadId || '0');
  
  const { isConnected, connectWallet, address, isCorrectNetwork, switchNetwork, loading } = useWeb3();
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && isCorrectNetwork && numWorkspaceId && numThreadId) {
      fetchThreadData();
    }
  }, [isConnected, isCorrectNetwork, numWorkspaceId, numThreadId]);

  const fetchThreadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all threads in the workspace
      const threads = await web3Service.getWorkspaceThreads(numWorkspaceId);
      
      // Find the specific thread we're looking for
      const foundThread = threads.find(t => t.id === numThreadId);
      
      if (!foundThread) {
        throw new Error("Thread not found");
      }
      
      setThread(foundThread);
      
      // Get posts for this thread
      const threadPosts = await web3Service.getThreadPosts(numThreadId);
      setPosts(threadPosts);
      
    } catch (error: any) {
      console.error("Error fetching thread data:", error);
      setError(error.message || "Failed to load thread data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // This is a placeholder since we don't see an addPost method in your web3Service
      // You might need to add this method to your service
      // For now, let's assume it exists
      await web3Service.addPost(numThreadId, newPostContent);
      
      // Clear form and refresh posts
      setNewPostContent('');
      fetchThreadData();
      
    } catch (error: any) {
      console.error("Error submitting post:", error);
      setError(error.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-md p-8">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-6">Connect to View Thread</h1>
        <button
          onClick={connectWallet}
          className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition duration-300"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-6">Wrong Network</h1>
        <p className="mb-4">Please switch to the Sepolia network to view this thread.</p>
        <button
          onClick={switchNetwork}
          className="bg-yellow-500 text-white py-2 px-6 rounded-md hover:bg-yellow-600 transition duration-300"
        >
          Switch Network
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-md p-8">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Loading Thread...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-md p-8">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <Link
            to={`/workspace/${numWorkspaceId}`}
            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Back to Workspace
          </Link>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-md p-8">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Thread Not Found</h1>
          <Link
            to={`/workspace/${numWorkspaceId}`}
            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Back to Workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Thread Header */}
        <div className="bg-indigo-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
              <div className="flex items-center space-x-4 text-sm">
                <span>Started by: {shortenAddress(thread.creator)}</span>
                <span>Created: {formatDate(thread.createdAt)}</span>
              </div>
            </div>
            <div>
              <Link
                to={`/workspace/${numWorkspaceId}`}
                className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50"
              >
                Back to Workspace
              </Link>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="p-6">
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No posts in this thread yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="font-medium">{shortenAddress(post.author)}</div>
                      {post.author.toLowerCase() === address?.toLowerCase() && (
                        <span className="ml-2 text-xs text-indigo-600">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                      {post.isEdited && (
                        <span className="ml-2 text-xs">(Edited)</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">{post.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply form */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Add Reply</h3>
            <form onSubmit={handleSubmitPost}>
              <div className="mb-4">
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Write your reply..."
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
                  disabled={isSubmitting || !newPostContent.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetail;