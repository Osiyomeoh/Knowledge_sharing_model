// utils/helpers.ts

// Format timestamp to readable date
export const formatDate = (timestamp: number | Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Shorten Ethereum address for display
  export const shortenAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Convert enum values to readable strings
  export const getKYCStatusString = (status: number): string => {
    const statuses = ['Not Submitted', 'Pending', 'Approved', 'Rejected'];
    return statuses[status] || 'Unknown';
  };
  
  export const getMemberRoleString = (role: number): string => {
    const roles = ['Viewer', 'Contributor', 'Admin', 'Owner'];
    return roles[role] || 'Unknown';
  };
  
  export const getDocumentVisibilityString = (visibility: number): string => {
    const visibilities = ['Private', 'Restricted', 'Public'];
    return visibilities[visibility] || 'Unknown';
  };
  
  export const getPermissionString = (permission: number): string => {
    const permissions = ['Read Only', 'Comment', 'Edit'];
    return permissions[permission] || 'Unknown';
  };
  
  // Calculate file size display string
  export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Check if file type is allowed
  export const isAllowedFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  };
  
