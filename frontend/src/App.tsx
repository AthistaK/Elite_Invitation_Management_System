import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import { PortalSelection } from './pages/PortalSelection';
import { ChairmanSetup } from './pages/auth/ChairmanSetup';
import { ChairmanLogin } from './pages/auth/ChairmanLogin';
import { ManagementLogin } from './pages/auth/ManagementLogin';
import { ManagementRegister } from './pages/auth/ManagementRegister';

import { ChairmanDashboard } from './pages/chairman/Dashboard';
import { ManagementDashboard } from './pages/management/Dashboard';
import { Invitations } from './pages/chairman/Invitations';
import { UploadInvitation } from './pages/chairman/UploadInvitation';
import { PendingRequests } from './pages/chairman/PendingRequests';
import { UserManagement } from './pages/chairman/UserManagement';
import { Reports } from './pages/chairman/Reports';
import { ActivityLogs } from './pages/chairman/ActivityLogs';
import { NotificationsPage } from './pages/chairman/NotificationsPage';
import { Profile } from './pages/chairman/Profile';
import { Contact } from './pages/chairman/Contact';
import { Settings } from './pages/chairman/Settings';

// Public Route Guard (Auto-restores session & redirects logged-in users to dashboard)
const PublicOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 min-h-screen flex items-center justify-center">Restoring session...</div>;
  if (user) {
    if (user.role === 'CHAIRMAN') {
      return <Navigate to="/chairman/dashboard" replace />;
    }
    if ((user.role === 'OFFICE' || user.role === 'FAMILY') && user.accountStatus === 'APPROVED') {
      return <Navigate to="/management/dashboard" replace />;
    }
  }
  return <>{children}</>;
};

// Chairman Route Guard
const ChairmanGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Validating session...</div>;
  if (!user || user.role !== 'CHAIRMAN') {
    return <Navigate to="/chairman/login" replace />;
  }
  return <>{children}</>;
};

// Management Route Guard
const ManagementGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Validating session...</div>;
  if (!user || (user.role !== 'OFFICE' && user.role !== 'FAMILY')) {
    return <Navigate to="/management/login" replace />;
  }
  if (user.accountStatus !== 'APPROVED') {
    return <Navigate to="/management/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* First Screen / Public Routes wrapped with Session Auto-Redirect */}
            <Route path="/" element={<PublicOnlyGuard><PortalSelection /></PublicOnlyGuard>} />

            {/* Auth Routes */}
            <Route path="/chairman/setup" element={<PublicOnlyGuard><ChairmanSetup /></PublicOnlyGuard>} />
            <Route path="/chairman/login" element={<PublicOnlyGuard><ChairmanLogin /></PublicOnlyGuard>} />
            <Route path="/management/login" element={<PublicOnlyGuard><ManagementLogin /></PublicOnlyGuard>} />
            <Route path="/management/register" element={<PublicOnlyGuard><ManagementRegister /></PublicOnlyGuard>} />

            {/* Chairman Protected Routes */}
            <Route path="/chairman/dashboard" element={<ChairmanGuard><ChairmanDashboard /></ChairmanGuard>} />
            <Route path="/chairman/invitations" element={<ChairmanGuard><Invitations /></ChairmanGuard>} />
            <Route path="/chairman/upload-invitation" element={<ChairmanGuard><UploadInvitation /></ChairmanGuard>} />
            <Route path="/chairman/pending-requests" element={<ChairmanGuard><PendingRequests /></ChairmanGuard>} />
            <Route path="/chairman/users" element={<ChairmanGuard><UserManagement /></ChairmanGuard>} />
            <Route path="/chairman/reports" element={<ChairmanGuard><Reports /></ChairmanGuard>} />
            <Route path="/chairman/notifications" element={<ChairmanGuard><NotificationsPage /></ChairmanGuard>} />
            <Route path="/chairman/logs" element={<ChairmanGuard><ActivityLogs /></ChairmanGuard>} />
            <Route path="/chairman/profile" element={<ChairmanGuard><Profile /></ChairmanGuard>} />
            <Route path="/chairman/contact" element={<ChairmanGuard><Contact /></ChairmanGuard>} />
            <Route path="/chairman/settings" element={<ChairmanGuard><Settings /></ChairmanGuard>} />

            {/* Management Protected Routes */}
            <Route path="/management/dashboard" element={<ManagementGuard><ManagementDashboard /></ManagementGuard>} />
            <Route path="/management/invitations" element={<ManagementGuard><Invitations /></ManagementGuard>} />
            <Route path="/management/upload-invitation" element={<ManagementGuard><UploadInvitation /></ManagementGuard>} />
            <Route path="/management/notifications" element={<ManagementGuard><NotificationsPage /></ManagementGuard>} />
            <Route path="/management/profile" element={<ManagementGuard><Profile /></ManagementGuard>} />
            <Route path="/management/contact" element={<ManagementGuard><Contact /></ManagementGuard>} />
            <Route path="/management/settings" element={<ManagementGuard><Settings /></ManagementGuard>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
