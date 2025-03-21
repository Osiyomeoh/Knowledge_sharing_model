// src/services/web3Service.ts

import { ethers } from 'ethers';
import UserRegistryABI from '../abi/UserRegistry.json';
import DocumentManagerABI from '../abi/DocumentManager.json';
import CollaborationSpaceABI from '../abi/CollaborationSpace.json';
import { 
  UserProfile, 
  Document, 
  DocumentVersion, 
  Workspace, 
  WorkspaceMember, 
  DiscussionThread, 
  Post, 
  WorkspaceDocument, 
  Visibility, 
  MemberRole, 
  AccessControl 
} from '../types/contracts';

class Web3Service {
  private provider!: ethers.providers.Web3Provider;
  private signer!: ethers.Signer;
  private userRegistryContract!: ethers.Contract;
  private documentManagerContract!: ethers.Contract;
  private collaborationSpaceContract!: ethers.Contract;
  
  // Modified constructor for src/services/web3Service.ts

constructor(
    private userRegistryAddress: string, 
    private documentManagerAddress: string, 
    private collaborationSpaceAddress: string
  ) {
    try {
      // Check if ethereum is available
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        this.userRegistryContract = new ethers.Contract(userRegistryAddress, UserRegistryABI.abi, this.signer);
        this.documentManagerContract = new ethers.Contract(documentManagerAddress, DocumentManagerABI.abi, this.signer);
        this.collaborationSpaceContract = new ethers.Contract(collaborationSpaceAddress, CollaborationSpaceABI.abi, this.signer);
      } else {
        // Show MetaMask install message
        this.showMetaMaskInstallMessage();
      }
    } catch (error) {
      console.error("Error initializing Web3Service:", error);
      this.showMetaMaskInstallMessage();
    }
  }
  
  // Add this private method to your class
  private showMetaMaskInstallMessage() {
    if (typeof document !== 'undefined') {
      document.body.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Web3 Wallet Required</h2>
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
            This application requires a Web3 wallet like MetaMask to function properly.
          </p>
          <div style="max-width: 500px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
            <p style="font-weight: bold; margin-bottom: 10px;">To use this application:</p>
            <ul style="text-align: left; margin-bottom: 20px;">
              <li style="margin-bottom: 8px;">Install MetaMask or another Ethereum wallet</li>
              <li style="margin-bottom: 8px;">Connect your wallet to the Sepolia testnet</li>
              <li>Refresh this page after installation</li>
            </ul>
            <div>
              <a href="https://metamask.io/download/" 
                 target="_blank" 
                 style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 4px; font-weight: bold; margin-bottom: 15px;">
                Download MetaMask
              </a>
            </div>
            <button onclick="window.location.reload()" 
                    style="border: none; background-color: #eee; padding: 10px 20px; 
                           border-radius: 4px; cursor: pointer; font-weight: bold;">
              Refresh Page
            </button>
          </div>
          ${/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? `
            <div style="margin-top: 20px; padding: 15px; border: 1px solid #e0c3c3; 
                        background-color: #fff8f8; border-radius: 8px; color: #d63939; max-width: 500px; margin: 20px auto;">
              <p style="font-weight: bold;">For Mobile Users:</p>
              <p>You can access this application by using:</p>
              <ul style="text-align: left; margin-top: 10px;">
                <li style="margin-bottom: 8px;">MetaMask Mobile Browser</li>
                <li style="margin-bottom: 8px;">Trust Wallet Browser</li>
                <li>Coinbase Wallet Browser</li>
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    }
  }
  // Connection Methods
  async connectWallet(): Promise<string> {
    await this.provider.send("eth_requestAccounts", []);
    const address = await this.signer.getAddress();
    return address;
  }

  async getCurrentAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  // UserRegistry Methods
  async registerUser(username: string, profileIpfsHash: string, bio: string): Promise<void> {
    const tx = await this.userRegistryContract.registerUser(username, profileIpfsHash, bio);
    await tx.wait();
  }

  async updateProfile(username: string, profileIpfsHash: string, bio: string): Promise<void> {
    const tx = await this.userRegistryContract.updateProfile(username, profileIpfsHash, bio);
    await tx.wait();
  }

  async submitKYC(): Promise<void> {
    const tx = await this.userRegistryContract.submitKYC();
    await tx.wait();
  }

  async addTrustedUser(trustedUserAddress: string): Promise<void> {
    const tx = await this.userRegistryContract.addTrustedUser(trustedUserAddress);
    await tx.wait();
  }

  async removeTrustedUser(trustedUserAddress: string): Promise<void> {
    const tx = await this.userRegistryContract.removeTrustedUser(trustedUserAddress);
    await tx.wait();
  }

  async getUserProfile(address: string): Promise<UserProfile> {
    const profile = await this.userRegistryContract.getUserProfile(address);
    return {
      username: profile.username,
      profileIpfsHash: profile.profileIpfsHash,
      bio: profile.bio,
      kycStatus: profile.kycStatus,
      trustScore: profile.trustScore.toNumber(),
      createdAt: profile.createdAt.toNumber(),
      lastUpdated: profile.lastUpdated.toNumber(),
      trustedUsersCount: profile.trustedUsersCount.toNumber()
    };
  }

  async getTrustedUsers(address: string): Promise<string[]> {
    return await this.userRegistryContract.getTrustedUsers(address);
  }

  async userExists(address: string): Promise<boolean> {
    return await this.userRegistryContract.userExists(address);
  }
  
  async getAllUsers(): Promise<string[]> {
    return await this.userRegistryContract.getAllUsers();
  }

  // DocumentManager Methods
  async createDocument(
    name: string,
    ipfsHash: string,
    documentType: string,
    size: number,
    visibility: Visibility,
    downloadable: boolean,
    tags: string[],
    editorNotes: string
  ): Promise<number> {
    const tx = await this.documentManagerContract.createDocument(
      name, ipfsHash, documentType, size, visibility, downloadable, tags, editorNotes
    );
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: ethers.Event) => e.event === 'DocumentCreated');
    return event ? event.args.documentId.toNumber() : 0;
  }
  
  async updateDocumentMetadata(
    documentId: number,
    name: string,
    tags: string[],
    editorNotes: string
  ): Promise<void> {
    const tx = await this.documentManagerContract.updateDocumentMetadata(
      documentId, name, tags, editorNotes
    );
    await tx.wait();
  }
  
  async addDocumentVersion(
    documentId: number,
    newIpfsHash: string,
    size: number,
    changeNotes: string
  ): Promise<void> {
    const tx = await this.documentManagerContract.addDocumentVersion(
      documentId, newIpfsHash, size, changeNotes
    );
    await tx.wait();
  }

  async getDocumentMetadata(documentId: number): Promise<Document> {
    const data = await this.documentManagerContract.getDocumentMetadata(documentId);
    return {
      id: documentId,
      name: data.name,
      ipfsHash: data.ipfsHash,
      documentType: data.documentType,
      size: data.size.toNumber(),
      visibility: data.visibility,
      downloadable: data.downloadable,
      createdAt: data.createdAt.toNumber(),
      lastUpdated: data.lastUpdated.toNumber(),
      tags: data.tags,
      editorNotes: data.editorNotes,
      owner: data.owner
    };
  }
  
  async getDocumentVersions(documentId: number): Promise<DocumentVersion[]> {
    const versions = await this.documentManagerContract.getDocumentVersions(documentId);
    return versions.map((version: any) => ({
      versionNumber: version.versionNumber.toNumber(),
      ipfsHash: version.ipfsHash,
      updatedBy: version.updatedBy,
      updatedAt: version.updatedAt.toNumber(),
      changeNotes: version.changeNotes
    }));
  }

  async getUserDocuments(address: string): Promise<number[]> {
    const documentIds = await this.documentManagerContract.getUserDocuments(address);
    return documentIds.map((id: ethers.BigNumber) => id.toNumber());
  }

  async getDocumentsByTag(tag: string): Promise<number[]> {
    const documentIds = await this.documentManagerContract.getDocumentsByTag(tag);
    return documentIds.map((id: ethers.BigNumber) => id.toNumber());
  }

  async setUserAccess(documentId: number, userAddress: string, permission: number): Promise<void> {
    const tx = await this.documentManagerContract.setUserAccess(documentId, userAddress, permission);
    await tx.wait();
  }
  
  async removeUserAccess(documentId: number, userAddress: string): Promise<void> {
    const tx = await this.documentManagerContract.removeUserAccess(documentId, userAddress);
    await tx.wait();
  }
  
  async setDocumentVisibility(documentId: number, visibility: Visibility): Promise<void> {
    const tx = await this.documentManagerContract.setDocumentVisibility(documentId, visibility);
    await tx.wait();
  }
  
  async setDownloadPermission(documentId: number, downloadable: boolean): Promise<void> {
    const tx = await this.documentManagerContract.setDownloadPermission(documentId, downloadable);
    await tx.wait();
  }
  
  async checkPermission(documentId: number, userAddress: string, permission: number): Promise<boolean> {
    return await this.documentManagerContract.checkPermission(documentId, userAddress, permission);
  }

  // CollaborationSpace Methods
  async createWorkspace(name: string, description: string, isPrivate: boolean): Promise<number> {
    const tx = await this.collaborationSpaceContract.createWorkspace(name, description, isPrivate);
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: ethers.Event) => e.event === 'WorkspaceCreated');
    return event ? event.args.workspaceId.toNumber() : 0;
  }
  
  async updateWorkspace(workspaceId: number, name: string, description: string, isPrivate: boolean): Promise<void> {
    const tx = await this.collaborationSpaceContract.updateWorkspace(workspaceId, name, description, isPrivate);
    await tx.wait();
  }

  async getWorkspace(workspaceId: number): Promise<Workspace> {
    const workspace = await this.collaborationSpaceContract.getWorkspace(workspaceId);
    return {
      id: workspace.id.toNumber(),
      name: workspace.name,
      description: workspace.description,
      owner: workspace.owner,
      isPrivate: workspace.isPrivate,
      createdAt: workspace.createdAt.toNumber(),
      lastUpdated: workspace.lastUpdated.toNumber(),
      exists: workspace.exists
    };
  }

  async getUserWorkspaces(address: string): Promise<number[]> {
    const workspaceIds = await this.collaborationSpaceContract.getUserWorkspaces(address);
    return workspaceIds.map((id: ethers.BigNumber) => id.toNumber());
  }

  async addWorkspaceMember(workspaceId: number, memberAddress: string, role: MemberRole): Promise<void> {
    const tx = await this.collaborationSpaceContract.addWorkspaceMember(workspaceId, memberAddress, role);
    await tx.wait();
  }
  
  async removeWorkspaceMember(workspaceId: number, memberAddress: string): Promise<void> {
    const tx = await this.collaborationSpaceContract.removeWorkspaceMember(workspaceId, memberAddress);
    await tx.wait();
  }
  
  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    const members = await this.collaborationSpaceContract.getWorkspaceMembers(workspaceId);
    return members.map((member: any) => ({
      userAddress: member.userAddress,
      role: member.role,
      joinedAt: member.joinedAt.toNumber()
    }));
  }

  async createDiscussionThread(workspaceId: number, title: string, initialContent: string): Promise<{ threadId: number, postId: number }> {
    const tx = await this.collaborationSpaceContract.createDiscussionThread(workspaceId, title, initialContent);
    const receipt = await tx.wait();
    
    // Find ThreadCreated and PostAdded events
    const threadEvent = receipt.events?.find((e: ethers.Event) => e.event === 'ThreadCreated');
    const postEvent = receipt.events?.find((e: ethers.Event) => e.event === 'PostAdded');
    
    return { 
      threadId: threadEvent ? threadEvent.args.threadId.toNumber() : 0,
      postId: postEvent ? postEvent.args.postId.toNumber() : 0
    };
  }

  async getWorkspaceThreads(workspaceId: number): Promise<DiscussionThread[]> {
    const threads = await this.collaborationSpaceContract.getWorkspaceThreads(workspaceId);
    return threads.map((thread: any) => ({
      id: thread.id.toNumber(),
      workspaceId: thread.workspaceId.toNumber(),
      title: thread.title,
      creator: thread.creator,
      createdAt: thread.createdAt.toNumber(),
      lastUpdated: thread.lastUpdated.toNumber(),
      isPinned: thread.isPinned,
      exists: thread.exists
    }));
  }

  async getThreadPosts(threadId: number): Promise<Post[]> {
    const posts = await this.collaborationSpaceContract.getThreadPosts(threadId);
    return posts.map((post: any) => ({
      id: post.id.toNumber(),
      threadId: post.threadId.toNumber(),
      author: post.author,
      content: post.content,
      createdAt: post.createdAt.toNumber(),
      editedAt: post.editedAt.toNumber(),
      isEdited: post.isEdited,
      exists: post.exists
    }));
  }

  async linkDocument(workspaceId: number, documentId: number, notes: string): Promise<void> {
    const tx = await this.collaborationSpaceContract.linkDocument(workspaceId, documentId, notes);
    await tx.wait();
  }
  
  async unlinkDocument(workspaceId: number, documentId: number): Promise<void> {
    const tx = await this.collaborationSpaceContract.unlinkDocument(workspaceId, documentId);
    await tx.wait();
  }
  
  async getWorkspaceDocuments(workspaceId: number): Promise<WorkspaceDocument[]> {
    const documents = await this.collaborationSpaceContract.getWorkspaceDocuments(workspaceId);
    return documents.map((doc: any) => ({
      documentId: doc.documentId.toNumber(),
      workspaceId: doc.workspaceId.toNumber(),
      notes: doc.notes,
      addedAt: doc.addedAt.toNumber(),
      addedBy: doc.addedBy
    }));
  }
}

// Create an instance with contract addresses from environment variables
const web3Service = new Web3Service(
  process.env.REACT_APP_USER_REGISTRY_ADDRESS || '',
  process.env.REACT_APP_DOCUMENT_MANAGER_ADDRESS || '',
  process.env.REACT_APP_COLLABORATION_SPACE_ADDRESS || ''
);

export default web3Service;