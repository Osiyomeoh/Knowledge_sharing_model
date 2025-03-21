// src/components/profile/ProfileForm.tsx

import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import FileUploader from '../common/FileUploader';
import { isValidUsername } from '../../utils/validators';
import pinataService from '../../services/ipfsService';
import { UserProfile } from '../../types/contracts';

interface ProfileFormProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (username: string, profileIpfsHash: string, bio: string) => Promise<void>;
  isUpdating: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  userProfile, 
  onUpdateProfile,
  isUpdating
}) => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [errors, setErrors] = useState({
    username: '',
    bio: '',
    profileImage: ''
  });

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
      setBio(userProfile.bio);
      
      if (userProfile.profileIpfsHash) {
        setProfileImageUrl(pinataService.getIPFSUrl(userProfile.profileIpfsHash));

      }
    }
  }, [userProfile]);

  const validateForm = (): boolean => {
    const newErrors = {
      username: '',
      bio: '',
      profileImage: ''
    };
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!isValidUsername(username)) {
      newErrors.username = 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens';
    }
    
    if (bio.trim().length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let profileIpfsHash = userProfile?.profileIpfsHash || '';
      
      if (profileImage) {
        profileIpfsHash = await pinataService.uploadFile(profileImage);
      }
      
      await onUpdateProfile(username, profileIpfsHash, bio);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFileSelected = (file: File) => {
    setProfileImage(file);
    setProfileImageUrl(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Profile Image
            </label>
            {profileImageUrl ? (
              <div className="mb-2">
                <img 
                  src={profileImageUrl} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                />
              </div>
            ) : (
              <div className="mb-2 w-32 h-32 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              </div>
            )}
            <FileUploader
              onFileSelected={handleFileSelected}
              accept="image/*"
              maxSizeMB={5}
              label="Change profile image"
              error={errors.profileImage}
            />
          </div>
        </div>
        
        <div className="md:w-2/3">
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
              Username *
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your username"
              disabled={isUpdating}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="bio" className="block mb-2 text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.bio ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Tell us about yourself"
              disabled={isUpdating}
            ></textarea>
            <p className="mt-1 text-sm text-gray-500">
              {bio.length}/500 characters
            </p>
            {errors.bio && (
              <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isUpdating}
          disabled={isUpdating}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;