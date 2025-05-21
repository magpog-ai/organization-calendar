import React from 'react';
import { Views } from 'react-big-calendar';
import { pl } from 'date-fns/locale';
import '../styles/CustomToolbar.css';

const CustomToolbar: React.FC<any> = (props) => {
  const goToPrevious = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const getViewTitle = () => {
    const date = props.date;
    const month = date.toLocaleString('pl-PL', { month: 'long' });
    const year = date.getFullYear();
    
    switch (props.view) {
      case Views.MONTH:
        return `${month} ${year}`;
      case Views.WEEK:
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        weekStart.setDate(weekStart.getDate() - day);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const startMonth = weekStart.toLocaleString('pl-PL', { month: 'short' });
        const endMonth = weekEnd.toLocaleString('pl-PL', { month: 'short' });
        
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
          Poprzedni
        </button>
        <span className="rbc-toolbar-label">{viewTitle}</span>
        <button type="button" className="nav-button next-button" onClick={goToNext}>
          Następny
        </button>
      </div>
      <div className="rbc-btn-group">
        <button 
          type="button" 
          className={props.view === Views.MONTH ? 'rbc-active' : ''} 
          onClick={() => props.onView(Views.MONTH)}
        >
          Miesiąc
        </button>
        <button 
          type="button" 
          className={props.view === Views.WEEK ? 'rbc-active' : ''} 
          onClick={() => props.onView(Views.WEEK)}
        >
          Tydzień
        </button>
      </div>
    </div>
  );
};

export default CustomToolbar; 