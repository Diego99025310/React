import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login.jsx';
import { AuthProvider, useAuth } from './hooks/useAuth.js';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && user?.role !== role) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Placeholder = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="max-w-2xl text-center space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-base text-neutral-300">
        Esta página ainda está em migração para React. Consulte o frontend legado enquanto finalizamos a
        conversão.
      </p>
    </div>
  </div>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/master"
      element={
        <ProtectedRoute role="master">
          <Placeholder title="Painel Master" />
        </ProtectedRoute>
      }
    />
    <Route
      path="/influencer"
      element={
        <ProtectedRoute role="influencer">
          <Placeholder title="Painel Influencer" />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
