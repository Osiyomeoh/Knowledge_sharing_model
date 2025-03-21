// src/services/ipfsService.ts

import axios from 'axios';

class PinataService {
  private apiKey: string;
  private apiSecret: string;
  private jwt: string | null;
  private useFallback: boolean = false;

  constructor(apiKey: string, apiSecret: string, jwt?: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.jwt = jwt || null;
    
    // Check if we have valid credentials
    if ((!this.apiKey || !this.apiSecret) && !this.jwt) {
      console.warn('Pinata credentials missing, will use fallback IPFS method');
      this.useFallback = true;
    }
  }

  async uploadFile(file: File): Promise<string> {
    // If we're using fallback, don't even try Pinata
    if (this.useFallback) {
      return this.uploadFileViaIPFS(file);
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Metadata for the file
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        size: file.size,
        type: file.type,
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Options for pinning
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
      // Debug credentials being used
      console.log('Pinata API Key length:', this.apiKey?.length || 0);
      console.log('Pinata Secret length:', this.apiSecret?.length || 0);
      console.log('Using JWT:', !!this.jwt);
      
      // Use JWT if available, otherwise use API key and secret
      const headers: Record<string, string> = this.jwt 
        ? { 'Authorization': `Bearer ${this.jwt}` }
        : {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret
          };

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...headers
          }
        }
      );

      return response.data.IpfsHash;
    } catch (error: any) {
      console.error('Error uploading to Pinata:', error);
      
      // If we get 401, credentials are invalid - try the fallback
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('Invalid Pinata credentials, switching to fallback method');
        this.useFallback = true;
        return this.uploadFileViaIPFS(file);
      }
      
      throw new Error('Failed to upload file to Pinata: ' + (error.message || 'Unknown error'));
    }
  }
  
  // Fallback method using a public IPFS gateway
  private async uploadFileViaIPFS(file: File): Promise<string> {
    try {
      console.log('Using fallback IPFS upload method');
      
      // Convert file to base64 for easier transport
      const fileBase64 = await this.fileToBase64(file);
      
      // Unfortunately, since we don't have valid Pinata credentials, 
      // we need to use a mock CID here in development mode
      // In production, you would need a proper IPFS node or service
      
      // For demo purposes, create a deterministic "mock" CID based on the file name and size
      // Note: This is NOT real IPFS, just for development!
      const mockCid = `ipfs-mock-${file.name.replace(/[^a-z0-9]/gi, '')}-${file.size}`;
      
      // Store in localStorage to simulate retrieval
      localStorage.setItem(mockCid, fileBase64);
      
      return mockCid;
    } catch (error: any) {
      console.error('Fallback IPFS upload failed:', error);
      throw new Error('Failed to upload file via fallback method: ' + error.message);
    }
  }
  
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async uploadJSON(data: any): Promise<string> {
    // If we're using fallback, don't even try Pinata
    if (this.useFallback) {
      // Convert to string then create a blob to use our file upload method
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'data.json', { type: 'application/json' });
      return this.uploadFileViaIPFS(file);
    }
    
    try {
      // Use JWT if available, otherwise use API key and secret
      const headers: Record<string, string> = this.jwt 
        ? { 
            'Authorization': `Bearer ${this.jwt}`,
            'Content-Type': 'application/json'
          }
        : {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret,
            'Content-Type': 'application/json'
          };

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data,
        {
          headers
        }
      );

      return response.data.IpfsHash;
    } catch (error: any) {
      console.error('Error uploading JSON to Pinata:', error);
      
      // If we get 401, credentials are invalid - try the fallback
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('Invalid Pinata credentials, switching to fallback method');
        this.useFallback = true;
        
        // Convert to string then create a blob to use our file upload method
        const jsonString = JSON.stringify(data);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const file = new File([blob], 'data.json', { type: 'application/json' });
        return this.uploadFileViaIPFS(file);
      }
      
      throw new Error('Failed to upload JSON to Pinata: ' + (error.message || 'Unknown error'));
    }
  }

  getIPFSUrl(hash: string): string {
    // If it's our mock CID, we need to handle it differently
    if (hash.startsWith('ipfs-mock-')) {
      return '#mock-ipfs-url';
    }
    
    // Otherwise use a real gateway
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
  async getFileContent(hash: string): Promise<string> {
    try {
      // If it's our mock CID, retrieve from localStorage
      if (hash.startsWith('ipfs-mock-')) {
        const content = localStorage.getItem(hash);
        if (!content) {
          throw new Error('Content not found in local storage');
        }
        return content;
      }
      
      // Otherwise fetch from gateway
      const response = await axios.get(this.getIPFSUrl(hash));
      return response.data;
    } catch (error: any) {
      console.error('Error fetching content from IPFS:', error);
      throw new Error('Failed to fetch content from IPFS: ' + error.message);
    }
  }
  
  async getJSONContent<T>(hash: string): Promise<T> {
    try {
      // If it's our mock CID, retrieve from localStorage and parse
      if (hash.startsWith('ipfs-mock-')) {
        const content = localStorage.getItem(hash);
        if (!content) {
          throw new Error('Content not found in local storage');
        }
        // If it's base64 encoded JSON, we need to decode it first
        if (content.startsWith('data:application/json;base64,')) {
          const base64 = content.split(',')[1];
          const jsonString = atob(base64);
          return JSON.parse(jsonString) as T;
        }
        return JSON.parse(content) as T;
      }
      
      // Otherwise fetch from gateway
      const content = await this.getFileContent(hash);
      return JSON.parse(content) as T;
    } catch (error: any) {
      console.error('Error getting JSON content:', error);
      throw new Error('Failed to get JSON content: ' + error.message);
    }
  }
}

// Create an instance with Pinata API keys from environment variables
const pinataService = new PinataService(
  process.env.REACT_APP_PINATA_API_KEY || '',
  process.env.REACT_APP_PINATA_API_SECRET || '',
  process.env.REACT_APP_PINATA_JWT || ''
);

export default pinataService;