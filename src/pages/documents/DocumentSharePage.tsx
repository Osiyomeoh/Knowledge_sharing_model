// src/pages/documents/DocumentSharePage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NotificationCard from '../../components/common/NotificationCard';
import { Document, Permission } from '../../types/contracts';
import { formatAddress } from '../../utils/formatters';
import { isValidEthereumAddress } from '../../utils/validators';

interface AccessControlItem {
  userAddress: string;
  permission: Permission;
}

const DocumentSharePage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const { address } = useWeb3();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [accessControls, setAccessControls] = useState<AccessControlItem[]>([]);
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newPermission, setNewPermission] = useState<Permission>(Permission.ReadOnly);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  useEffect(() => {
    if (documentId) {
      loadDocument(parseInt(documentId));
      // In a real implementation, also load access controls here
    }
  }, [documentId]);
  
  const loadDocument = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const doc = await web3Service.getDocumentMetadata(id);
      setDocument(doc);
      
      // Check if current user is the owner
      if (address && doc.owner.toLowerCase() !== address.toLowerCase()) {
        navigate(`/documents/${id}`);
        return;
      }
      
      // TODO: Load access controls from contract
      // This is a placeholder - replace with actual contract call when available
      // setAccessControls(await web3Service.getDocumentAccessControls(id));
      setAccessControls([]);
      
    } catch (err: any) {
      console.error('Error loading document:', err);
      setError(err.message || 'Error loading document');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEthereumAddress(newUserAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    if (address && newUserAddress.toLowerCase() === address.toLowerCase()) {
      setError('You cannot add yourself as you already own this document');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await web3Service.setUserAccess(parseInt(documentId!), newUserAddress, newPermission);
      
      // Add to local state for UI update
      setAccessControls([
        ...accessControls,
        { userAddress: newUserAddress, permission: newPermission }
      ]);
      
      setNewUserAddress('');
      setNewPermission(Permission.ReadOnly);
      
      setNotification({
        type: 'success',
        message: 'Access granted successfully'
      });
      
    } catch (err: any) {
      console.error('Error adding access:', err);
      setError(err.message || 'Error adding access');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleUpdateAccess = async (userAddress: string, newPermission: Permission) => {
    try {
      setSubmitting(true);
      
      await web3Service.setUserAccess(parseInt(documentId!), userAddress, newPermission);
      
      // Update local state
      const updatedControls = accessControls.map(item => 
        item.userAddress === userAddress 
          ? { ...item, permission: newPermission } 
          : item
      );
      
      setAccessControls(updatedControls);
      
      setNotification({
        type: 'success',
        message: 'Access updated successfully'
      });
      
    } catch (err: any) {
      console.error('Error updating access:', err);
      setError(err.message || 'Error updating access');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRemoveAccess = async (userAddress: string) => {
    try {
      setSubmitting(true);
      
      await web3Service.removeUserAccess(parseInt(documentId!), userAddress);
      
      // Update local state
      setAccessControls(accessControls.filter(item => item.userAddress !== userAddress));
      
      setNotification({
        type: 'success',
        message: 'Access removed successfully'
      });
      
    } catch (err: any) {
      console.error('Error removing access:', err);
      setError(err.message || 'Error removing access');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getPermissionLabel = (permission: Permission) => {
    switch (permission) {
      case Permission.ReadOnly:
        return 'Read Only';
      case Permission.Comment:
        return 'Comment';
      case Permission.Edit:
        return 'Edit';
      default:
        return 'Unknown';
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" text="Loading document..." />
        </div>
      </Layout>
    );
  }
  
  if (!document) {
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Manage Access to Document</h1>
              <Link to={`/documents/${documentId}`}>
                <Button variant="secondary" size="sm">
                  Back to Document
                </Button>
              </Link>
            </div>
            <p className="text-gray-600 mt-2">{document.name}</p>
          </div>
          
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Add New Access</h2>
            
            {error && (
              <div className="mb-4">
                <NotificationCard
                  type="error"
                  message={error}
                  showCloseButton={true}
                  onClose={() => setError(null)}
                />
              </div>
            )}
            
            <form onSubmit={handleAddAccess} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="userAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    User Address
                  </label>
                  <input
                    type="text"
                    id="userAddress"
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="permission" className="block text-sm font-medium text-gray-700 mb-1">
                    Permission
                  </label>
                  <select
                    id="permission"
                    value={newPermission}
                    onChange={(e) => setNewPermission(Number(e.target.value) as Permission)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={submitting}
                  >
                    <option value={Permission.ReadOnly}>Read Only</option>
                    <option value={Permission.Comment}>Comment</option>
                    <option value={Permission.Edit}>Edit</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                  disabled={submitting || !newUserAddress}
                >
                  Add Access
                </Button>
              </div>
            </form>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Access</h2>
            
            {accessControls.length === 0 ? (
              <p className="text-gray-600">No users have been granted access to this document yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accessControls.map((item) => (
                      <tr key={item.userAddress}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatAddress(item.userAddress)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.userAddress}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.permission}
                            onChange={(e) => handleUpdateAccess(
                              item.userAddress, 
                              Number(e.target.value) as Permission
                            )}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                            disabled={submitting}
                          >
                            <option value={Permission.ReadOnly}>Read Only</option>
                            <option value={Permission.Comment}>Comment</option>
                            <option value={Permission.Edit}>Edit</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveAccess(item.userAddress)}
                            className="text-red-600 hover:text-red-900"
                            disabled={submitting}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentSharePage;