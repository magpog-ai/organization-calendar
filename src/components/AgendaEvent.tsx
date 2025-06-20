import React from 'react';
import { Event } from '../types/Event';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface AgendaEventProps {
  event: Event;
}

const AgendaEvent: React.FC<AgendaEventProps> = ({ event }) => {
  const { t } = useTranslation();

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'YoungLife':
        return 'var(--yl-green)';
      case 'WyldLife':
        return 'var(--wyldlife-blue)';
      case 'YLUni':
        return 'var(--yluni-orange)';
      case 'Inne':
        return 'var(--inne-darkgreen)';
      case 'Joint':
        return 'var(--yl-light-navy)';
      default:
        return '#666';
    }
  };

  return (
    <div className="agenda-event" style={{ borderLeft: `4px solid ${getGroupColor(event.group)}` }}>
      <div className="agenda-event-time">
        {format(new Date(event.start), 'HH:mm', { locale: pl })} - {format(new Date(event.end), 'HH:mm', { locale: pl })}
      </div>
      <div className="agenda-event-content">
        <h4>{event.title}</h4>
        <div className="agenda-event-details">
          <span className="agenda-event-group">{event.group}</span>
          {event.location && <span className="agenda-event-location">{event.location}</span>}
        </div>
      </div>
    </div>
  );
};

export default AgendaEvent; 