import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
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

// Helper function to detect mobile devices
const isMobileDevice = () => {
  return window.innerWidth <= 768;
};

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onEventAdd, 
  onEventUpdate, 
  onEventDelete,
  isMobile 
}) => {
  const { t, i18n } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>(() => {
    // Set default view based on isMobile prop
    return isMobile ? Views.AGENDA : Views.MONTH;
  });
  const [date, setDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
  const [selectedFilters, setSelectedFilters] = useState<GroupType[]>(['YoungLife', 'WyldLife', 'YLUni', 'Inne']);
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  // Get current locale for date-fns
  const currentLocale = i18n.language === 'en' ? enUS : pl;

  // Debug authentication state
  useEffect(() => {
    console.log('Calendar auth state - isAdmin:', isAdmin, 'isAuthenticated:', isAuthenticated);
  }, [isAdmin, isAuthenticated]);

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
    console.log('handleAddEvent called - isAdmin:', isAdmin, 'isAuthenticated:', isAuthenticated);
    setEditingEvent(undefined);
    setShowEventForm(true);
    console.log('showEventForm set to true');
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
    console.log('Calendar handleFormSubmit called with:', event);
    if (editingEvent) {
      // Update existing event
      console.log('Updating existing event');
      if (onEventUpdate) {
        onEventUpdate(event);
      }
    } else {
      // Add new event
      console.log('Adding new event');
      if (onEventAdd) {
        onEventAdd(event);
      } else {
        console.error('onEventAdd is not provided');
      }
    }
    setShowEventForm(false);
  };

  const handleFormClose = () => {
    setShowEventForm(false);
  };

  const eventStyleGetter = (event: Event) => {
    // Don't apply background colors in agenda view - only for month/week views
    if (view === Views.AGENDA) {
      return {
        style: {
          backgroundColor: 'transparent',
          color: 'inherit',
          border: 'none',
          display: 'block'
        }
      };
    }

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

  // Custom Event component for agenda view
  const AgendaEvent = ({ event }: { event: Event }) => {
    const getGroupDisplayName = (group: string) => {
      switch (group) {
        case 'YoungLife': return 'YL';
        case 'WyldLife': return 'WyLd';
        case 'YLUni': return 'Uni';
        case 'Inne': return i18n.language === 'en' ? 'Other' : 'Inne';
        case 'Joint': return i18n.language === 'en' ? 'Joint' : 'Wspólne';
        default: return group;
      }
    };

    const getGroupClass = (group: string) => {
      return group.toLowerCase();
    };

    return (
      <div 
        className="rbc-event" 
        onClick={() => handleSelectEvent(event)}
      >
        <div className="event-title">
          {event.title}
          <span className={`group-badge ${getGroupClass(event.group)}`}>
            {event.group === 'Joint' && event.groups 
              ? event.groups.map(g => getGroupDisplayName(g)).join('+')
              : getGroupDisplayName(event.group)
            }
          </span>
        </div>
        {event.location && (
          <div className="event-location">
            📍 {event.location}
          </div>
        )}
      </div>
    );
  };

  const formats = {
    eventTimeRangeFormat: () => '',
    timeGutterFormat: 'HH:mm',
    dayHeaderFormat: (date: Date) => format(date, 'EEEE d/M', { locale: currentLocale }),
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
      `${format(start, 'HH:mm', { locale: currentLocale })} - ${format(end, 'HH:mm', { locale: currentLocale })}`,
    agendaDateFormat: (date: Date) => {
      // Shorter format for mobile
      if (isMobileDevice()) {
        return format(date, 'EEE, d MMM yyyy', { locale: currentLocale });
      }
      return format(date, 'EEEE, d MMMM yyyy', { locale: currentLocale });
    },
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      // For agenda view, always show the full month
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      return `${format(monthStart, 'd', { locale: currentLocale })} - ${format(monthEnd, 'd MMMM yyyy', { locale: currentLocale })}`;
    },
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

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
    // First filter by group
    let groupMatch = false;
    if (event.group === 'Joint' && event.groups) {
      // For joint events, show if any of the individual groups in the joint event are selected
      groupMatch = event.groups.some(group => 
        group !== 'Joint' && selectedFilters.includes(group)
      );
    } else {
      groupMatch = selectedFilters.includes(event.group);
    }

    // If group doesn't match, exclude the event
    if (!groupMatch) return false;

    // Don't filter by month in agenda view - let react-big-calendar handle it
    // This ensures all events are available for the agenda view to display
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
        <h3>{t('Wybierz grupę')}</h3>
        <div className="filter-checkboxes">
          {['YoungLife', 'WyldLife', 'YLUni', 'Inne'].map((group) => (
            <label key={group} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFilters.includes(group as GroupType)}
                onChange={() => handleFilterChange(group as GroupType)}
              />
              <span className={`filter-label ${group.toLowerCase()}-filter`}>
                {group === 'Inne' ? (i18n.language === 'en' ? 'Other' : 'Inne') : group}
              </span>
            </label>
          ))}
        </div>
      </div>

      <BigCalendar
        localizer={localizer}
        events={events}
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
          agenda: true
        }}
        defaultView={isMobile ? Views.AGENDA : Views.MONTH}
        components={{
          toolbar: (props) => <CustomToolbar {...props} isMobile={isMobile} />,
          agenda: {
            event: AgendaEvent
          }
        }}
        messages={{
          next: t('calendar.next'),
          previous: t('calendar.previous'),
          today: t('calendar.today'),
          month: t('calendar.month'),
          week: t('calendar.week'),
          day: t('calendar.day'),
          agenda: t('calendar.list'),
          date: t('calendar.date'),
          time: t('calendar.time'),
          event: t('calendar.event'),
          noEventsInRange: t('calendar.noEventsInRange'),
          showMore: (count) => t('calendar.showMore', { count })
        }}
      />

      {selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-button" onClick={closeModal}>×</button>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <span className={`group-badge ${selectedEvent.group.toLowerCase()}`}>
                {selectedEvent.group === 'Inne' ? (i18n.language === 'en' ? 'Other' : 'Inne') : selectedEvent.group}
              </span>
            </div>
            <div className="modal-body">
              <div className="event-details">
                <div className="detail-item">
                  <strong>Data:</strong> {format(new Date(selectedEvent.start), 'PPP', { locale: currentLocale })}
                </div>
                <div className="detail-item">
                  <strong>Czas:</strong> {format(new Date(selectedEvent.start), 'p', { locale: currentLocale })} - {format(new Date(selectedEvent.end), 'p', { locale: currentLocale })}
                </div>
                {selectedEvent.location && (
                  <div className="detail-item">
                    <strong>Miejsce:</strong> {selectedEvent.location}
                  </div>
                )}
                {selectedEvent.url && (
                  <div className="detail-item">
                    <strong>Link:</strong>{' '}
                    <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer" className="event-link">
                      {selectedEvent.url}
                    </a>
                  </div>
                )}
              </div>
              {selectedEvent.description && (
                <div className="event-description">
                  <h3>Opis</h3>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
              {isAuthenticated && isAdmin && (
                <div className="admin-modal-controls">
                  <button className="edit-button" onClick={handleEditEvent}>
                    Edytuj
                  </button>
                  <button className="delete-button" onClick={handleDeleteEvent}>
                    Usuń
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEventForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Calendar; 