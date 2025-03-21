// src/pages/profile/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/web3Context';
import web3Service from '../../services/web3Service';
import Layout from '../../components/layout/Layout';
import ProfileForm from '../../components/profile/ProfileForm';
import KYCStatusCard from '../../components/profile/KYCStatusCard';
import TrustedUsersList from '../../components/profile/TrustedUsersList';
import NotificationCard from '../../components/common/NotificationCard';
import { formatTimestamp } from '../../utils/formatters';

const ProfilePage: React.FC = () => {
  const { isConnected, isRegistered, userProfile, address, refreshUserProfile } = useWeb3();
  const navigate = useNavigate();
  
  const [trustedUsers, setTrustedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [submittingKYC, setSubmittingKYC] = useState(false);
  const [addingTrustedUser, setAddingTrustedUser] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // Redirect if not connected or registered
    if (!isConnected) {
      navigate('/');
    } else if (!isRegistered) {
      navigate('/register');
    } else {
      loadTrustedUsers();
    }
  }, [isConnected, isRegistered, navigate, address]);

  const loadTrustedUsers = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      const users = await web3Service.getTrustedUsers(address);
      setTrustedUsers(users);
    } catch (error) {
      console.error('Error loading trusted users:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load trusted users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (username: string, profileIpfsHash: string, bio: string) => {
    try {
      setUpdating(true);
      await web3Service.updateProfile(username, profileIpfsHash, bio);
      await refreshUserProfile();
      
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitKYC = async () => {
    try {
      setSubmittingKYC(true);
      await web3Service.submitKYC();
      await refreshUserProfile();
      
      setNotification({
        type: 'success',
        message: 'KYC submission successful! Your verification is now pending review.'
      });
    } catch (error) {
      console.error('Error submitting KYC:', error);
      setNotification({
        type: 'error',
        message: 'Failed to submit KYC. Please try again.'
      });
    } finally {
      setSubmittingKYC(false);
    }
  };

  const handleAddTrustedUser = async (address: string) => {
    try {
      setAddingTrustedUser(true);
      await web3Service.addTrustedUser(address);
      await loadTrustedUsers();
      
      setNotification({
        type: 'success',
        message: 'User added to your trusted list!'
      });
    } catch (error) {
      console.error('Error adding trusted user:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add trusted user. Please check the address and try again.'
      });
      throw error; // Re-throw so the component can handle it
    } finally {
      setAddingTrustedUser(false);
    }
  };

  const handleRemoveTrustedUser = async (address: string) => {
    try {
      setAddingTrustedUser(true);
      await web3Service.removeTrustedUser(address);
      await loadTrustedUsers();
      
      setNotification({
        type: 'success',
        message: 'User removed from your trusted list!'
      });
    } catch (error) {
      console.error('Error removing trusted user:', error);
      setNotification({
        type: 'error',
        message: 'Failed to remove trusted user. Please try again.'
      });
    } finally {
      setAddingTrustedUser(false);
    }
  };

  if (!userProfile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <div className="text-sm text-gray-500">
              Member since {formatTimestamp(userProfile.createdAt)}
            </div>
          </div>
          
          <ProfileForm
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            isUpdating={updating}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <KYCStatusCard
              kycStatus={userProfile.kycStatus}
              trustScore={userProfile.trustScore}
              onSubmitKYC={handleSubmitKYC}
              isSubmitting={submittingKYC}
            />
          </div>
          
          <div>
            <TrustedUsersList
              trustedUsers={trustedUsers}
              onAddTrustedUser={handleAddTrustedUser}
              onRemoveTrustedUser={handleRemoveTrustedUser}
              isLoading={addingTrustedUser}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;