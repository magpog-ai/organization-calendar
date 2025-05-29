import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import '../styles/NavBar.css';

interface NavBarProps {
  activeTab: 'events' | 'contactWork';
  onTabChange: (tab: 'events' | 'contactWork') => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
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
          <span className="navbar-title">YoungLife Poznań</span>
        </div>
        
        <div className="navbar-center">
          <div className="calendar-tabs">
            <button 
              className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => onTabChange('events')}
            >
              Wydarzenia
            </button>
            <button 
              className={`tab-button ${activeTab === 'contactWork' ? 'active' : ''}`}
              onClick={() => onTabChange('contactWork')}
            >
              Gdzie możesz nas znaleźć?
            </button>
          </div>
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
              className="close-modal-button-login" 
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