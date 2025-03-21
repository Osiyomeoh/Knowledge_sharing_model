// src/utils/formatters.ts

/**
 * Formats an Ethereum address to a shorter version
 * @param address Full Ethereum address
 * @returns Shortened address in format 0x1234...5678
 */
export const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  /**
   * Formats a Unix timestamp to a human-readable date and time
   * @param timestamp Unix timestamp in seconds
   * @returns Formatted date string
   */
  export const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };
  
  /**
   * Formats a file size in bytes to a human-readable string
   * @param bytes File size in bytes
   * @returns Formatted file size string (e.g., "1.5 MB")
   */
  export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };