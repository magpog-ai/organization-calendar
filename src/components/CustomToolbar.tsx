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
        // Adjust for Monday as first day (0=Sunday, 1=Monday, etc.)
        const daysToSubtract = day === 0 ? 6 : day - 1;
        weekStart.setDate(weekStart.getDate() - daysToSubtract);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const startMonth = weekStart.toLocaleString(locale, { month: 'short' });
        const endMonth = weekEnd.toLocaleString(locale, { month: 'short' });
        
        return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${year}`;
      case Views.AGENDA:
        return t('calendar.eventsList');
      default:
        return `${month} ${year}`;
    }
  };

  const viewTitle = getViewTitle();

  return (
    <div className="rbc-toolbar custom-toolbar">
      <div className="title-with-navigation">
        {view !== Views.AGENDA && (
          <button type="button" className="nav-button prev-button" onClick={goToPrevious}>
            {isMobile ? '‹' : 'Poprzedni'}
          </button>
        )}
        <span className="rbc-toolbar-label">{viewTitle}</span>
        {view !== Views.AGENDA && (
          <button type="button" className="nav-button next-button" onClick={goToNext}>
            {isMobile ? '›' : 'Następny'}
          </button>
        )}
      </div>
      <div className="rbc-btn-group">
        {isMobile ? (
          <>
            <button 
              type="button" 
              className={view === Views.AGENDA ? 'rbc-active' : ''} 
              onClick={() => onView(Views.AGENDA)}
            >
              Lista
            </button>
            <button 
              type="button" 
              className={view === Views.MONTH ? 'rbc-active' : ''} 
              onClick={() => onView(Views.MONTH)}
            >
              Miesiąc
            </button>
          </>
        ) : (
          <>
            <button 
              type="button" 
              className={view === Views.MONTH ? 'rbc-active' : ''} 
              onClick={() => onView(Views.MONTH)}
            >
              Miesiąc
            </button>
            <button 
              type="button" 
              className={view === Views.WEEK ? 'rbc-active' : ''} 
              onClick={() => onView(Views.WEEK)}
            >
              Tydzień
            </button>
            <button 
              type="button" 
              className={view === Views.AGENDA ? 'rbc-active' : ''} 
              onClick={() => onView(Views.AGENDA)}
            >
              Lista
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomToolbar; 