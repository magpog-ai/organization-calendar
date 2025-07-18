import React from 'react';
import { Views } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';
import '../styles/CustomToolbar.css';

// Helper function to detect mobile devices
const isMobileDevice = () => {
  return window.innerWidth <= 768;
};

const CustomToolbar: React.FC<any> = (props) => {
  const { t, i18n } = useTranslation();
  
  const goToPrevious = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const getViewTitle = () => {
    const date = props.date;
    const locale = i18n.language === 'en' ? 'en-US' : 'pl-PL';
    const month = date.toLocaleString(locale, { month: 'long' });
    const year = date.getFullYear();
    
    switch (props.view) {
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
        {props.view !== Views.AGENDA && (
          <button type="button" className="nav-button prev-button" onClick={goToPrevious}>
            {isMobileDevice() ? '‹' : t('calendar.previous')}
          </button>
        )}
        <span className="rbc-toolbar-label">{viewTitle}</span>
        {props.view !== Views.AGENDA && (
          <button type="button" className="nav-button next-button" onClick={goToNext}>
            {isMobileDevice() ? '›' : t('calendar.next')}
          </button>
        )}
      </div>
      <div className="rbc-btn-group">
        {isMobileDevice() ? (
          <>
            <button 
              type="button" 
              className={props.view === Views.AGENDA ? 'rbc-active' : ''} 
              onClick={() => props.onView(Views.AGENDA)}
            >
              {t('calendar.list')}
            </button>
            <button 
              type="button" 
              className={props.view === Views.MONTH ? 'rbc-active' : ''} 
              onClick={() => props.onView(Views.MONTH)}
            >
              {t('calendar.month')}
            </button>
          </>
        ) : (
          <>
            <button 
              type="button" 
              className={props.view === Views.MONTH ? 'rbc-active' : ''} 
              onClick={() => props.onView(Views.MONTH)}
            >
              {t('calendar.month')}
            </button>
            <button 
              type="button" 
              className={props.view === Views.WEEK ? 'rbc-active' : ''} 
              onClick={() => props.onView(Views.WEEK)}
            >
              {t('calendar.week')}
            </button>
            <button 
              type="button" 
              className={props.view === Views.AGENDA ? 'rbc-active' : ''} 
              onClick={() => props.onView(Views.AGENDA)}
            >
              {t('calendar.list')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomToolbar; 