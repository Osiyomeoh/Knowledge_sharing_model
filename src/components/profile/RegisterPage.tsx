// src/pages/profile/RegisterPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import ipfsService from '../../services/ipfsService';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import FileUploader from '../../components/common/FileUploader';
import NotificationCard from '../../components/common/NotificationCard';
import { isValidUsername } from '../../utils/validators';

const RegisterPage: React.FC = () => {
  const { isConnected, isRegistered, refreshUserProfile } = useWeb3();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // Redirect if user is already registered
    if (isRegistered) {
      navigate('/profile');
    }
    
    // Redirect if not connected to wallet
    if (!isConnected) {
      navigate('/');
    }
  }, [isRegistered, isConnected, navigate]);

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!isValidUsername(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens');
      return false;
    }
    
    if (bio.trim().length > 500) {
      setError('Bio must be less than 500 characters');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleFileSelected = (file: File) => {
    setProfileImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Upload profile image to IPFS if provided
      let profileIpfsHash = '';
      if (profileImage) {
        profileIpfsHash = await ipfsService.uploadFile(profileImage);
      }
      
      // Register user in the contract
      await web3Service.registerUser(username, profileIpfsHash, bio);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Registration successful! Redirecting to your profile...'
      });
      
      // Refresh user profile in context
      await refreshUserProfile();
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error registering user:', err);
      setError(err.message || 'Error registering user. Please try again.');
      
      setNotification({
        type: 'error',
        message: 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Register Your Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    error && !username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Choose a username (3-20 characters)"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Tell us about yourself (optional)"
                  disabled={loading}
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  {bio.length}/500 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <FileUploader
                  onFileSelected={handleFileSelected}
                  accept="image/*"
                  maxSizeMB={5}
                  label="Upload profile image (optional)"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                disabled={loading}
              >
                Register
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;