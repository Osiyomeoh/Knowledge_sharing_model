// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/web3Context'; // Corrected capitalization
import WalletCheck from './components/common/walletCheck';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/profile/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import DocumentsPage from './pages/documents/DocumentsPage';
import CreateDocumentPage from './pages/documents/CreateDocument'; // Fixed import
import DocumentDetailsPage from './pages/documents/DocumentDetailPage'; // Fixed name
import WorkspacesPage from './pages/workspaces/WorkspacesPage'; // Added full path
import CreateWorkspacePage from './pages/workspaces/CreateWorkspacePage';
import WorkspaceDetailsPage from './pages/workspaces/WorkspaceDetailPage';
import ThreadPage from './pages/workspaces/ThreadDetail'; // Added full path
import ExplorePage from './pages/ExplorePage'; // Added this import
import ErrorPage from './pages/ErrorPage';
import DocumentSharePage from './pages/documents/DocumentSharePage';

const App: React.FC = () => {
  return (
    <Web3Provider>
      
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/create" element={<CreateDocumentPage />} />
          <Route path="/documents/:documentId" element={<DocumentDetailsPage />} />
          <Route path="/documents/:documentId/share" element={<DocumentSharePage />} />
          
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/workspaces/create" element={<CreateWorkspacePage />} />
          <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailsPage />} />
         <Route path="/workspaces/:workspaceId/threads/:threadId" element={<ThreadPage />} />
          
         <Route path="/explore" element={<ExplorePage />} /> 
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </Web3Provider>
  );
};

export default App;