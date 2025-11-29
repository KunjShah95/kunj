import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DesignerPage from './pages/DesignerPage';
import AdminCollectionsPage from './pages/AdminCollectionsPage';
import PermissionDeniedPage from './pages/PermissionDeniedPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAuthenticated = !!user;
  const userRole = user?.role;

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={
        isAuthenticated ? (
          <Navigate to={userRole === 'admin' ? '/admin' : '/water'} />
        ) : (
          <LandingPage />
        )
      } />

      {/* Register Page */}
      <Route path="/register" element={
        isAuthenticated ? (
          <Navigate to={userRole === 'admin' ? '/admin' : '/water'} />
        ) : (
          <RegisterPage />
        )
      } />

      {/* Login Page */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={userRole === 'admin' ? '/admin' : '/water'} />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Water (Designer) Page */}
      <Route
        path="/water"
        element={
          isAuthenticated && userRole === 'water' ? (
            <DesignerPage onLogout={signOut} />
          ) : (
            isAuthenticated && userRole === 'admin' ? (
              <Navigate to="/permission-denied" />
            ) : (
              <Navigate to="/login" />
            )
          )
        }
      />

      {/* Admin Page */}
      <Route
        path="/admin"
        element={
          isAuthenticated && userRole === 'admin' ? (
            <AdminCollectionsPage user={user!} onLogout={signOut} />
          ) : (
            isAuthenticated && userRole === 'water' ? (
              <Navigate to="/permission-denied" />
            ) : (
              <Navigate to="/login" />
            )
          )
        }
      />

      {/* Permission Denied Page */}
      <Route
        path="/permission-denied"
        element={
          isAuthenticated ? (
            <PermissionDeniedPage />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

