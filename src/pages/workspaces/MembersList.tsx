// src/components/workspaces/MembersList.tsx

import React, { useState } from 'react';
import { WorkspaceMember, MemberRole } from '../../types/contracts';
import { formatAddress, formatTimestamp } from '../../utils/formatters';
import { isValidEthereumAddress } from '../../utils/validators';
import Button from '../../components/common/Button';

interface MembersListProps {
  members: WorkspaceMember[];
  onAddMember: (address: string, role: MemberRole) => Promise<void>;
  onRemoveMember: (address: string) => Promise<void>;
  onChangeRole: (address: string, role: MemberRole) => Promise<void>;
  isOwner: boolean;
  isLoading: boolean;
}

const MembersList: React.FC<MembersListProps> = ({
  members,
  onAddMember,
  onRemoveMember,
  onChangeRole,
  isOwner,
  isLoading
}) => {
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<MemberRole>(MemberRole.Viewer);
  const [error, setError] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberAddress.trim()) {
      setError('Please enter an Ethereum address');
      return;
    }
    
    if (!isValidEthereumAddress(newMemberAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    if (members.some(m => m.userAddress.toLowerCase() === newMemberAddress.toLowerCase())) {
      setError('This user is already a member of this workspace');
      return;
    }
    
    setError('');
    
    try {
      await onAddMember(newMemberAddress, newMemberRole);
      setNewMemberAddress('');
      setNewMemberRole(MemberRole.Viewer);
    } catch (err: any) {
      setError(err.message || 'Error adding member');
    }
  };

  const getMemberRoleLabel = (role: MemberRole) => {
    switch (role) {
      case MemberRole.Viewer:
        return 'Viewer';
      case MemberRole.Contributor:
        return 'Contributor';
      case MemberRole.Admin:
        return 'Admin';
      case MemberRole.Owner:
        return 'Owner';
      default:
        return 'Unknown';
    }
  };
  
  const getRoleBadgeClass = (role: MemberRole) => {
    switch (role) {
      case MemberRole.Viewer:
        return 'bg-gray-100 text-gray-800';
      case MemberRole.Contributor:
        return 'bg-blue-100 text-blue-800';
      case MemberRole.Admin:
        return 'bg-purple-100 text-purple-800';
      case MemberRole.Owner:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {isOwner && (
        <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Add New Member</h3>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-3">
                <label htmlFor="newMemberAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Ethereum Address
                </label>
                <input
                  type="text"
                  id="newMemberAddress"
                  value={newMemberAddress}
                  onChange={(e) => setNewMemberAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isLoading}
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="newMemberRole" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="newMemberRole"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(Number(e.target.value) as MemberRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={isLoading}
                >
                  <option value={MemberRole.Viewer}>Viewer</option>
                  <option value={MemberRole.Contributor}>Contributor</option>
                  <option value={MemberRole.Admin}>Admin</option>
                </select>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading || !newMemberAddress}
              >
                Add Member
              </Button>
            </div>
          </form>
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-3">Members</h3>
      
      {members.length === 0 ? (
        <p className="text-gray-600">No members in this workspace yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                {isOwner && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.userAddress}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatAddress(member.userAddress)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.userAddress}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isOwner && member.role !== MemberRole.Owner ? (
                      <select
                        value={member.role}
                        onChange={(e) => onChangeRole(
                          member.userAddress, 
                          Number(e.target.value) as MemberRole
                        )}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                        disabled={isLoading}
                      >
                        <option value={MemberRole.Viewer}>Viewer</option>
                        <option value={MemberRole.Contributor}>Contributor</option>
                        <option value={MemberRole.Admin}>Admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(member.role)}`}>
                        {getMemberRoleLabel(member.role)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(member.joinedAt)}
                  </td>
                  {isOwner && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {member.role !== MemberRole.Owner && (
                        <button
                          onClick={() => onRemoveMember(member.userAddress)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MembersList;