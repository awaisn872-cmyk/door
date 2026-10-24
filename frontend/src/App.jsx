import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell, Loading } from './components/Shared';
import {
  Home,
  TrackPage,
  AuthPage,
  ServicesPage,
  DeliveryChargesPage,
  ContactPage,
  InformationPage
} from './pages/PublicPages';
import { Dashboard, ParcelsPage } from './pages/Dashboard';
import {
  BookParcel,
  UsersPage,
  PricingPage,
  PaymentsPage,
  ReportsPage,
  AddressesPage,
  SettingsPage
} from './pages/FormsPages';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <Loading message="Authenticating session…" />;
  return user ? (
    <AppShell>
      <Outlet />
    </AppShell>
  ) : (
    <Navigate to="/login" replace />
  );
}

function Guest({ mode }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading message="Checking credentials…" />;
  if (user) return <Navigate to="/app" replace />;
  return <AuthPage mode={mode} />;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? children : <Navigate to="/app" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/pricing-info" element={<DeliveryChargesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<InformationPage path="/about" />} />
      <Route path="/terms" element={<InformationPage path="/terms" />} />
      <Route path="/privacy" element={<InformationPage path="/privacy" />} />
      <Route path="/refund" element={<InformationPage path="/refund" />} />

      {/* Guest Authentication Pages */}
      <Route path="/login" element={<Guest mode="login" />} />
      <Route path="/register" element={<Guest mode="register" />} />

      {/* Protected Role Workspaces */}
      <Route element={<Protected />}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/parcels" element={<ParcelsPage />} />
        <Route
          path="/app/book"
          element={
            <RoleRoute roles={['customer']}>
              <BookParcel />
            </RoleRoute>
          }
        />
        <Route
          path="/app/addresses"
          element={
            <RoleRoute roles={['customer']}>
              <AddressesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/app/users"
          element={
            <RoleRoute roles={['admin']}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/app/pricing"
          element={
            <RoleRoute roles={['admin']}>
              <PricingPage />
            </RoleRoute>
          }
        />
        <Route
          path="/app/payments"
          element={
            <RoleRoute roles={['admin']}>
              <PaymentsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/app/reports"
          element={
            <RoleRoute roles={['admin']}>
              <ReportsPage />
            </RoleRoute>
          }
        />
        <Route path="/app/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#12233f',
              color: '#fff',
              fontSize: '13px',
              borderRadius: '9px',
              padding: '12px 16px'
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
