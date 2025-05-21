import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import '../styles/NavBar.css';

const NavBar: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout, authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Close login modal when auth state changes
  useEffect(() => {
    setShowLoginModal(false);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setShowLoginModal(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          Kalendarz Organizacji
        </div>
        <div className="navbar-actions">
          {authLoading ? (
            <span className="auth-loading">Ładowanie...</span>
          ) : isAuthenticated ? (
            <>
              <span className="user-welcome">
                Witaj, {user?.username} {isAdmin && <span className="admin-badge">Admin</span>}
              </span>
              <button className="logout-button" onClick={handleLogout}>
                Wyloguj
              </button>
            </>
          ) : (
            <button 
              className="login-nav-button" 
              onClick={() => setShowLoginModal(true)}
            >
              Panel administratora
            </button>
          )}
        </div>
      </div>
      {showLoginModal && !isAuthenticated && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal-button" 
              onClick={() => setShowLoginModal(false)}
            >
              ×
            </button>
            <Login onSuccess={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar; 