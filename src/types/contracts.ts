// src/types/contracts.ts

export enum KYCStatus {
    NotSubmitted,
    Pending,
    Approved,
    Rejected
  }
  
  export enum Visibility {
    Private,
    Restricted,
    Public
  }
  
  export enum Permission {
    ReadOnly,
    Comment,
    Edit
  }
  
  export enum MemberRole {
    Viewer,
    Contributor,
    Admin,
    Owner
  }
  
  export interface UserProfile {
    username: string;
    profileIpfsHash: string;
    bio: string;
    kycStatus: KYCStatus;
    trustScore: number;
    createdAt: number;
    lastUpdated: number;
    trustedUsersCount: number;
  }
  
  export interface Document {
    id: number;
    name: string;
    ipfsHash: string;
    documentType: string;
    size: number;
    visibility: Visibility;
    downloadable: boolean;
    createdAt: number;
    lastUpdated: number;
    tags: string[];
    editorNotes: string;
    owner: string;
  }
  
  export interface DocumentVersion {
    versionNumber: number;
    ipfsHash: string;
    updatedBy: string;
    updatedAt: number;
    changeNotes: string;
  }
  
  export interface AccessControl {
    user: string;
    permission: Permission;
  }
  
  export interface Workspace {
    id: number;
    name: string;
    description: string;
    owner: string;
    isPrivate: boolean;
    createdAt: number;
    lastUpdated: number;
    exists: boolean;
  }
  
  export interface WorkspaceMember {
    userAddress: string;
    role: MemberRole;
    joinedAt: number;
  }
  
  export interface DiscussionThread {
    id: number;
    workspaceId: number;
    title: string;
    creator: string;
    createdAt: number;
    lastUpdated: number;
    isPinned: boolean;
    exists: boolean;
  }
  
  export interface Post {
    id: number;
    threadId: number;
    author: string;
    content: string;
    createdAt: number;
    editedAt: number;
    isEdited: boolean;
    exists: boolean;
  }
  
  export interface WorkspaceDocument {
    documentId: number;
    workspaceId: number;
    notes: string;
    addedAt: number;
    addedBy: string;
  }