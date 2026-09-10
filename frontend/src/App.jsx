import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore.js';
import useUIStore from './stores/uiStore.js';
import useSocket from './hooks/useSocket.js';
import useOfflineSync from './hooks/useOfflineSync.js';
import ConnectionStatus from './components/ui/ConnectionStatus.jsx';

const LoginPage   = lazy(() => import('./pages/LoginPage.jsx'));
const JaladorPage = lazy(() => import('./pages/JaladorPage.jsx'));
const ServidorPage = lazy(() => import('./pages/ServidorPage.jsx'));
const CajaPage    = lazy(() => import('./pages/CajaPage.jsx'));
const AdminPage   = lazy(() => import('./pages/AdminPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

const ROLE_HOME = {
  jalador:       '/jalador',
  servidor:      '/servidor',
  caja:          '/caja',
  administrador: '/admin',
};

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
    <div className="text-center space-y-3">
      <div className="spinner text-brand-600 mx-auto" style={{ width: 32, height: 32, borderWidth: 3 }} />
      <p className="text-xs text-surface-400">Cargando...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />;
  return children;
};

const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />;
};

const GlobalServices = () => { useSocket(); useOfflineSync(); return null; };

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const initDarkMode = useUIStore(s => s.initDarkMode);

  useEffect(() => { initDarkMode(); }, [initDarkMode]);

  return (
    <>
      {isAuthenticated && <GlobalServices />}
      <ConnectionStatus />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '13px',
            maxWidth: '340px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgb(0 0 0 / .12)',
          },
        }}
      />

      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/jalador" element={
            <ProtectedRoute allowedRoles={['jalador']}>
              <JaladorPage />
            </ProtectedRoute>
          } />

          <Route path="/servidor" element={
            <ProtectedRoute allowedRoles={['servidor']}>
              <ServidorPage />
            </ProtectedRoute>
          } />

          <Route path="/caja" element={
            <ProtectedRoute allowedRoles={['caja']}>
              <CajaPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <AdminPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
