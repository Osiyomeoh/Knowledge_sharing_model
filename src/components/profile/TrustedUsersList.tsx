// src/components/profile/TrustedUsersList.tsx

import React, { useState } from 'react';
import Button from '../common/Button';
import { formatAddress } from '../../utils/formatters';
import { isValidEthereumAddress } from '../../utils/validators';

interface TrustedUsersListProps {
  trustedUsers: string[];
  onAddTrustedUser: (address: string) => Promise<void>;
  onRemoveTrustedUser: (address: string) => Promise<void>;
  isLoading: boolean;
}

const TrustedUsersList: React.FC<TrustedUsersListProps> = ({
  trustedUsers,
  onAddTrustedUser,
  onRemoveTrustedUser,
  isLoading
}) => {
  const [newTrustedUser, setNewTrustedUser] = useState('');
  const [error, setError] = useState('');

  const handleAddTrustedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTrustedUser.trim()) {
      setError('Please enter an Ethereum address');
      return;
    }
    
    if (!isValidEthereumAddress(newTrustedUser)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    if (trustedUsers.includes(newTrustedUser.toLowerCase())) {
      setError('This user is already in your trusted list');
      return;
    }
    
    setError('');
    
    try {
      await onAddTrustedUser(newTrustedUser);
      setNewTrustedUser('');
    } catch (err: any) {
      setError(err.message || 'Error adding trusted user');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Trusted Users</h3>
      
      <form onSubmit={handleAddTrustedUser} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={newTrustedUser}
              onChange={(e) => setNewTrustedUser(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ethereum address (0x...)"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Add User
          </Button>
        </div>
      </form>
      
      {trustedUsers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          You haven't added any trusted users yet
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {trustedUsers.map((address) => (
            <li key={address} className="py-3 flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {address}
                </p>
                <p className="text-xs text-gray-500">{formatAddress(address)}</p>
              </div>
              <Button
                onClick={() => onRemoveTrustedUser(address)}
                variant="danger"
                size="sm"
                disabled={isLoading}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrustedUsersList;