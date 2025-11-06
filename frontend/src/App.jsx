import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './redux/slice/user.slice';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            
            {/* Auth Routes - only accessible when not logged in */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/password/reset/:token" 
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/create-post" 
              element={
                <ProtectedRoute>
                  <CreatePostPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;