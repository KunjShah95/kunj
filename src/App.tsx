
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import WaterPage from './pages/WaterPage';
import EnhancedAdminPage from './pages/EnhancedAdminPage';
import { supabase } from './lib/supabase';

function App() {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    role: 'admin' | 'water' | null;
    userId: string;
  }>({
    isAuthenticated: false,
    role: null,
    userId: ''
  });

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const role = session.user.user_metadata.role as 'admin' | 'water' || 'water';
        setAuthState({
          isAuthenticated: true,
          role: role,
          userId: session.user.email || session.user.id
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const role = session.user.user_metadata.role as 'admin' | 'water' || 'water';
        setAuthState({
          isAuthenticated: true,
          role: role,
          userId: session.user.email || session.user.id
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          role: null,
          userId: ''
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (role: 'admin' | 'water', userId: string) => {
    setAuthState({
      isAuthenticated: true,
      role,
      userId
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthState({
      isAuthenticated: false,
      role: null,
      userId: ''
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={
          authState.isAuthenticated ? (
            <Navigate to={authState.role === 'admin' ? '/admin' : '/water'} />
          ) : (
            <LandingPage />
          )
        } />

        {/* Register Page */}
        <Route path="/register" element={
          authState.isAuthenticated ? (
            <Navigate to={authState.role === 'admin' ? '/admin' : '/water'} />
          ) : (
            <RegisterPage onLogin={handleLogin} />
          )
        } />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            authState.isAuthenticated ? (
              <Navigate to={authState.role === 'admin' ? '/admin' : '/water'} />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Water (Designer) Page */}
        <Route
          path="/water"
          element={
            authState.isAuthenticated && authState.role === 'water' ? (
              <WaterPage userId={authState.userId} onLogout={handleLogout} />
            ) : (
              authState.isAuthenticated && authState.role === 'admin' ? (
                <Navigate to="/admin" />
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
            authState.isAuthenticated && authState.role === 'admin' ? (
              <EnhancedAdminPage adminId={authState.userId} onLogout={handleLogout} />
            ) : (
              authState.isAuthenticated && authState.role === 'water' ? (
                <Navigate to="/water" />
              ) : (
                <Navigate to="/login" />
              )
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
