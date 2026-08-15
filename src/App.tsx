// src/App.tsx
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ReactKeycloakProvider, useKeycloak } from "@react-keycloak/web";

// Components
import Dashboard from './Dashboard/dashboard';
import BookDashboard from './BookDashboard/BookDashboard';
import CentreData from './CentreData/CentreData';
import AllocationPage from './AllocationApproval/AllocationApproval';
import ReceiptHistoryTable from './ReceiptHistoryTable/ReceiptHistoryTable';
import CentreManagement from './CentreList';
import UserManagementDashboard from './UserManagement/UserManagementDashboard';

import keycloak from './KeyCloak/KeyCloak';

type ProtectedRouteProps = {
  children: JSX.Element;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { keycloak: kc, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading authentication...</div>;
  }

  // With onLoad: 'login-required', if we are here and NOT authenticated,
  // Keycloak is already in the process of redirecting to login or just came back.
  if (!kc.authenticated) {
    return <div>Redirecting to login...</div>;
  }

  return children;
};

const App: React.FC = () => {
const kcInitOptions = {
  onLoad: 'login-required' as const,
  checkLoginIframe: false,
  // pkceMethod: 'S256' as const,   // ❌ remove this line
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
};


  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={kcInitOptions}

       onTokens={({ token, refreshToken }) => {
    console.log("Access token refreshed");
  }}
      onEvent={(event, error) => {
        console.log('[Keycloak event]', event, error || '');
        if (event === "onTokenExpired") {
      keycloak
        .updateToken(30) // refresh if token expires in next 30 sec
        .catch(() => {
          console.warn("Refresh token expired → logging out");
          keycloak.logout();
        });
    }
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><BookDashboard /></ProtectedRoute>} />
          <Route path="/centre" element={<ProtectedRoute><CentreData /></ProtectedRoute>} />
          <Route path="/approval" element={<ProtectedRoute><AllocationPage /></ProtectedRoute>} />
          <Route path="/historyReceipt" element={<ProtectedRoute><ReceiptHistoryTable /></ProtectedRoute>} />
          <Route path="/centre-list" element={<ProtectedRoute><CentreManagement /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagementDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ReactKeycloakProvider>
  );
};

export default App;
