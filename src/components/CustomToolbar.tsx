import React from 'react';
import { Views, View } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';
import '../styles/CustomToolbar.css';

interface CustomToolbarProps {
  date: Date;
  view: View;
  onNavigate: (action: 'PREV' | 'NEXT') => void;
  onView: (view: View) => void;
  isMobile: boolean;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ date, view, onNavigate, onView, isMobile }) => {
  const { t, i18n } = useTranslation();
  
  const goToPrevious = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const getViewTitle = () => {
    const locale = i18n.language === 'en' ? 'en-US' : 'pl-PL';
    const month = date.toLocaleString(locale, { month: 'long' });
    const year = date.getFullYear();
    
    switch (view) {
      case Views.MONTH:
        return `${month} ${year}`;
      case Views.WEEK:
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        const daysToSubtract = day === 0 ? 6 : day - 1;
        weekStart.setDate(weekStart.getDate() - daysToSubtract);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const startMonth = weekStart.toLocaleString(locale, { month: 'long' });
        const endMonth = weekEnd.toLocaleString(locale, { month: 'long' });
        
        return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${year}`;
      default:
        return `${month} ${year}`;
    }
  };

  const viewTitle = getViewTitle();

  return (
    <div className="rbc-toolbar custom-toolbar">
      <div className="title-with-navigation">
        <button type="button" className="nav-button prev-button" onClick={goToPrevious}>
          {isMobile ? '‹' : t('calendar.previous')}
        </button>
        <span className="rbc-toolbar-label">{viewTitle}</span>
        <button type="button" className="nav-button next-button" onClick={goToNext}>
          {isMobile ? '›' : t('calendar.next')}
        </button>
      </div>
      <div className="rbc-btn-group">
        <button 
          type="button" 
          className={view === Views.MONTH ? 'rbc-active' : ''} 
          onClick={() => onView(Views.MONTH)}
        >
          {t('calendar.month')}
        </button>
        <button 
          type="button" 
          className={view === Views.WEEK ? 'rbc-active' : ''} 
          onClick={() => onView(Views.WEEK)}
        >
          {t('calendar.week')}
        </button>
      </div>
    </div>
  );
};

export default CustomToolbar; 