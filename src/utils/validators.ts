// src/utils/validators.ts

/**
 * Validates an Ethereum address
 * @param address The address to validate
 * @returns True if the address is valid
 */
export const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  
  /**
   * Validates a username
   * @param username The username to validate
   * @returns True if the username is valid
   */
  export const isValidUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username);
  };
  
  /**
   * Validates a file size (to ensure it's not too large)
   * @param size File size in bytes
   * @param maxSize Maximum allowed size in bytes
   * @returns True if the file size is valid
   */
  export const isValidFileSize = (size: number, maxSize: number = 10485760): boolean => {
    // Default max size is 10MB
    return size > 0 && size <= maxSize;
  };
  
  /**
   * Checks if a string is empty or only contains whitespace
   * @param str The string to check
   * @returns True if the string is empty or only whitespace
   */
  export const isEmptyString = (str: string): boolean => {
    return str.trim().length === 0;
  };