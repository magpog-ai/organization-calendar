import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';
import { Event, GroupType } from '../types/events';
import CustomToolbar from './CustomToolbar';
import EventForm from './EventForm';
import { useAuth } from '../context/AuthContext';
import '../styles/Calendar.css';

// Date-fns localizer
const locales = {
  'pl': pl,
  'en': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // Monday as first day
  getDay,
  locales,
});

interface CalendarProps {
  events: Event[];
  onEventAdd?: (event: Event) => void;
  onEventUpdate?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
  isMobile: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onEventAdd, 
  onEventUpdate, 
  onEventDelete,
  isMobile 
}) => {
  const { t, i18n } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>(() => Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
  const [selectedFilters, setSelectedFilters] = useState<GroupType[]>(['YoungLife', 'WyldLife', 'YLUni', 'Inne']);
  const { isAuthenticated, isAdmin } = useAuth();

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setShowEventForm(true);
  };

  const handleEditEvent = () => {
    if (selectedEvent) {
      setEditingEvent(selectedEvent);
      setShowEventForm(true);
      setSelectedEvent(null);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent && onEventDelete) {
      onEventDelete(selectedEvent.id);
      setSelectedEvent(null);
    }
  };

  const handleFormSubmit = (event: Event) => {
    if (editingEvent) {
      if (onEventUpdate) {
        onEventUpdate(event);
      }
    } else {
      if (onEventAdd) {
        onEventAdd(event);
      }
    }
    setShowEventForm(false);
    setEditingEvent(undefined);
  };

  const handleFormClose = () => {
    setShowEventForm(false);
    setEditingEvent(undefined);
  };

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#3174ad';
    let textColor = 'white';
    
    if (event.groups && event.groups.length > 1) {
      backgroundColor = '#3d5575';
    } else {
      switch (event.group) {
        case 'YoungLife':
          backgroundColor = '#9BC643';
          break;
        case 'WyldLife':
          backgroundColor = '#6cb5f0';
          break;
        case 'YLUni':
          backgroundColor = '#f0af4d';
          break;
        case 'Inne':
          backgroundColor = '#5a7428';
          break;
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        color: textColor,
        border: 'none',
        display: 'block'
      }
    };
  };

  const localeObj = i18n.language === 'en' ? enUS : pl;
  const formats = {
    eventTimeRangeFormat: () => '',
    timeGutterFormat: 'HH:mm',
    // Week view column headers: Monday 9 Sep
    dayFormat: (d: Date) => format(d, 'EEEE d MMM', { locale: localeObj }),
    // Month view weekday headers: Monday, Tuesday, ...
    weekdayFormat: (d: Date) => format(d, 'EEEE', { locale: localeObj }),
    // Day header (used in some contexts)
    dayHeaderFormat: (d: Date) => format(d, 'EEEE d MMM', { locale: localeObj }),
  } as const;

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (!isAuthenticated || !isAdmin) return;
    setEditingEvent(undefined);
    setShowEventForm(true);
  };

  const handleFilterChange = (groupType: GroupType) => {
    setSelectedFilters(prev => 
      prev.includes(groupType)
        ? prev.filter(g => g !== groupType)
        : [...prev, groupType]
    );
  };

  const filteredEvents = events.filter(event => {
    let groupMatch = false;
    if (event.group === 'Joint' && event.groups) {
      groupMatch = event.groups.some(group => 
        group !== 'Joint' && selectedFilters.includes(group)
      );
    } else {
      groupMatch = selectedFilters.includes(event.group);
    }

    if (!groupMatch) return false;
    return true;
  });

  return (
    <div className="calendar-container">
      {isAuthenticated && isAdmin && (
        <div className="admin-controls">
          <button className="add-event-button" onClick={handleAddEvent}>
            {t('calendar.addEvent')}
          </button>
        </div>
      )}

      <div className="filter-controls">
        <h3>{t('events.filter')}</h3>
        <div className="filter-checkboxes">
          {['YoungLife', 'WyldLife', 'YLUni', 'Inne'].map((group) => (
            <label key={group} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFilters.includes(group as GroupType)}
                onChange={() => handleFilterChange(group as GroupType)}
              />
              <span className={`filter-label ${group.toLowerCase()}-filter`}>
                {group === 'Inne' ? (i18n.language === 'en' ? t('groups.Inne') : 'Inne') : t(`groups.${group}`)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <BigCalendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 650 }}
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable={isAuthenticated && isAdmin}
        eventPropGetter={eventStyleGetter}
        views={{
          month: true,
          week: true,
        }}
        defaultView={Views.MONTH}
        components={{
          toolbar: (props) => <CustomToolbar {...props} isMobile={isMobile} />,
        }}
        messages={{
          next: t('calendar.next'),
          previous: t('calendar.previous'),
          today: t('calendar.today'),
          month: t('calendar.month'),
          week: t('calendar.week'),
          day: t('calendar.day'),
        }}
        formats={formats}
      />

      {selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-button" onClick={closeModal}>×</button>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <span className={`group-badge ${selectedEvent.group.toLowerCase()}`}>
                {selectedEvent.group === 'Inne' ? t('groups.Inne') : t(`groups.${selectedEvent.group}`)}
              </span>
            </div>
            <div className="modal-body">
              <div className="event-details">
                <div className="detail-item">
                  <strong>{t('dateTime.date')}</strong> {format(new Date(selectedEvent.start), 'PPP', { locale: localeObj })}
                </div>
                <div className="detail-item">
                  <strong>{t('dateTime.time')}</strong> {format(new Date(selectedEvent.start), 'p', { locale: localeObj })} - {format(new Date(selectedEvent.end), 'p', { locale: localeObj })}
                </div>
                {selectedEvent.location && (
                  <div className="detail-item">
                    <strong>{t('events.location')}</strong> {selectedEvent.location}
                  </div>
                )}
                {selectedEvent.url && (
                  <div className="detail-item">
                    <strong>{t('events.url')}</strong>{' '}
                    <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer" className="event-link">
                      {selectedEvent.url}
                    </a>
                  </div>
                )}
              </div>
              {selectedEvent.description && (
                <div className="event-description">
                  <h3>{t('events.description')}</h3>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
              {isAuthenticated && isAdmin && (
                <div className="admin-modal-controls">
                  <button className="edit-button" onClick={handleEditEvent}>
                    {t('common.edit')}
                  </button>
                  <button className="delete-button" onClick={handleDeleteEvent}>
                    {t('common.delete')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content event-form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={handleFormClose}>×</button>
            <EventForm
              event={editingEvent}
              onSubmit={handleFormSubmit}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 