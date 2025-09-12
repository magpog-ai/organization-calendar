import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/NavBar.css';

interface NavBarProps {
  activeTab: 'events' | 'contactWork';
  onTabChange: (tab: 'events' | 'contactWork') => void;
  isMobile: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange, isMobile }) => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, user, logout, authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setShowLoginModal(false);
  }, [isAuthenticated]);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    setShowLoginModal(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="navbar-title">YoungLife Poznań</span>
        </div>
        
        {isMobile ? (
          <button 
            className="mobile-menu-button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
          </button>
        ) : (
          <>
            <div className="navbar-center">
              <div className="calendar-tabs">
                <button 
                  className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
                  onClick={() => onTabChange('events')}
                >
                  {t('navigation.events')}
                </button>
                <button 
                  className={`tab-button ${activeTab === 'contactWork' ? 'active' : ''}`}
                  onClick={() => onTabChange('contactWork')}
                >
                  {t('navigation.contactWork')}
                </button>
              </div>
            </div>
            
            <div className="navbar-actions">
              <LanguageSwitcher />
              {authLoading ? (
                <span className="auth-loading">{t('navigation.loading')}</span>
              ) : isAuthenticated ? (
                <>
                  <span className="user-welcome">
                    {t('navigation.welcome')}, {user?.username} {isAdmin && <span className="admin-badge">{t('navigation.admin')}</span>}
                  </span>
                  <button className="logout-button" onClick={handleLogout}>
                    {t('navigation.logout')}
                  </button>
                </>
              ) : (
                <button 
                  className="login-nav-button" 
                  onClick={() => setShowLoginModal(true)}
                >
                  {t('navigation.adminPanel')}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {isMobile && (
        <div className="mobile-center-label" onClick={() => setShowMobileMenu(!showMobileMenu)}>MENU</div>
      )}

      {/* Mobile menu */}
      {isMobile && showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button
                className="mobile-menu-close"
                onClick={() => setShowMobileMenu(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <div className="mobile-tabs">
              <button 
                className={`mobile-tab-button ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => onTabChange('events')}
              >
                {t('navigation.events')}
              </button>
              <button 
                className={`mobile-tab-button ${activeTab === 'contactWork' ? 'active' : ''}`}
                onClick={() => onTabChange('contactWork')}
              >
                {t('navigation.contactWork')}
              </button>
            </div>
            
            <div className="mobile-actions">
              <LanguageSwitcher />
              {authLoading ? (
                <span className="auth-loading">{t('navigation.loading')}</span>
              ) : isAuthenticated ? (
                <>
                  <span className="user-welcome">
                    {t('navigation.welcome')}, {user?.username} {isAdmin && <span className="admin-badge">{t('navigation.admin')}</span>}
                  </span>
                  <button className="logout-button" onClick={handleLogout}>
                    {t('navigation.logout')}
                  </button>
                </>
              ) : (
                <button 
                  className="login-nav-button" 
                  onClick={() => setShowLoginModal(true)}
                >
                  {t('navigation.adminPanel')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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