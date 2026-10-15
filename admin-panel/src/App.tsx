import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages lazy loading or static imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VerificationQueue from './pages/verifications/VerificationQueue';
import VerificationDetail from './pages/verifications/VerificationDetail';
import UserList from './pages/users/UserList';
import UserDetail from './pages/users/UserDetail';
import BookingList from './pages/bookings/BookingList';
import TransactionList from './pages/finance/TransactionList';
import AdminSettings from './pages/settings/AdminSettings';
import ContentModeration from './pages/content/ContentModeration';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/verifications" element={<VerificationQueue />} />
              <Route path="/verifications/:type/:profileId" element={<VerificationDetail />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/:userId" element={<UserDetail />} />
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/finance" element={<TransactionList />} />
              <Route path="/moderation" element={<ContentModeration />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
