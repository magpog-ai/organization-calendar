import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="language-switcher">
      <button
        className={`language-btn ${i18n.language === 'pl' ? 'active' : ''}`}
        onClick={() => changeLanguage('pl')}
        title="Polski"
      >
        PL
      </button>
      <button
        className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        ENG
      </button>
    </div>
  );
};

export default LanguageSwitcher; 