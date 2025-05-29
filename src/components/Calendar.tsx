import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { pl } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Event, GroupType } from '../types/events';
import CustomToolbar from './CustomToolbar';
import EventForm from './EventForm';
import { useAuth } from '../context/AuthContext';
import '../styles/Calendar.css';

// Date-fns localizer
const locales = {
  'pl': pl,
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
}

// Helper function to detect mobile devices
const isMobileDevice = () => {
  return window.innerWidth <= 768;
};

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onEventAdd, 
  onEventUpdate, 
  onEventDelete 
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>(() => {
    // Set default view based on screen size
    return isMobileDevice() ? Views.AGENDA : Views.MONTH;
  });
  const [date, setDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
  const [selectedFilters, setSelectedFilters] = useState<GroupType[]>(['YoungLife', 'WyldLife', 'YLUni', 'Inne']);
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  // Handle window resize to adjust view for mobile
  useEffect(() => {
    const handleResize = () => {
      if (isMobileDevice() && view === Views.MONTH) {
        setView(Views.AGENDA);
      } else if (!isMobileDevice() && view === Views.AGENDA) {
        setView(Views.MONTH);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  // Console log admin status for debugging
  useEffect(() => {
    console.log("Calendar component admin status:", { 
      isAuthenticated, 
      isAdmin, 
      username: user?.username 
    });
  }, [isAuthenticated, isAdmin, user]);

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
      // Update existing event
      if (onEventUpdate) {
        onEventUpdate(event);
      }
    } else {
      // Add new event
      if (onEventAdd) {
        onEventAdd(event);
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
        case 'Inne': return 'Inne';
        case 'Joint': return 'Wspólne';
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
    dayHeaderFormat: (date: Date) => format(date, 'EEEE d/M', { locale: pl }),
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
      `${format(start, 'HH:mm', { locale: pl })} - ${format(end, 'HH:mm', { locale: pl })}`,
    agendaDateFormat: (date: Date) => {
      // Shorter format for mobile
      if (isMobileDevice()) {
        return format(date, 'EEE, d MMM yyyy', { locale: pl });
      }
      return format(date, 'EEEE, d MMMM yyyy', { locale: pl });
    },
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      // For agenda view, always show the full month
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      return `${format(monthStart, 'd', { locale: pl })} - ${format(monthEnd, 'd MMMM yyyy', { locale: pl })}`;
    },
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleFilterChange = (groupType: GroupType) => {
    setSelectedFilters(prev => {
      if (prev.includes(groupType)) {
        return prev.filter(g => g !== groupType);
      } else {
        return [...prev, groupType];
      }
    });
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
      {isAdmin && (
        <div className="admin-controls">
          <button className="add-event-button" onClick={handleAddEvent}>
            Dodaj nowe wydarzenie
          </button>
        </div>
      )}

      <div className="filter-controls">
        <h3>Filtruj wydarzenia:</h3>
        <div className="filter-checkboxes">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('YoungLife')}
              onChange={() => handleFilterChange('YoungLife')}
            />
            <span className="filter-label younglife-filter">YoungLife (liceum)</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('WyldLife')}
              onChange={() => handleFilterChange('WyldLife')}
            />
            <span className="filter-label wyldlife-filter">WyldLife (klasy 6-8)</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('YLUni')}
              onChange={() => handleFilterChange('YLUni')}
            />
            <span className="filter-label yluni-filter">YLUni (studenci)</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('Inne')}
              onChange={() => handleFilterChange('Inne')}
            />
            <span className="filter-label inne-filter">Inne</span>
          </label>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color younglife-color"></div>
          <span>YoungLife (liceum)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color wyldlife-color"></div>
          <span>WyldLife (klasy 6-8)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color yluni-color"></div>
          <span>YLUni (studenci)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color inne-color"></div>
          <span>Inne</span>
        </div>
        <div className="legend-item">
          <div className="legend-color joint-color"></div>
          <span>Wydarzenia wspólne WyLd i YL </span>
        </div>
      </div>
      
      <BigCalendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: isMobileDevice() ? 'calc(100vh - 200px)' : 600 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        formats={formats}
        tooltipAccessor={(event: Event) => `${event.title} (${event.group === 'Joint' && event.groups ? event.groups.join(', ') : event.group})`}
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        views={isMobileDevice() ? [Views.AGENDA, Views.MONTH] : [Views.MONTH, Views.WEEK, Views.AGENDA]}
        popup
        selectable
        scrollToTime={new Date(1970, 1, 1, 18, 0, 0, 0)}
        components={{
          toolbar: CustomToolbar as any,
          agenda: {
            event: AgendaEvent,
          },
        }}
      />

      {selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={closeModal}>×</button>
            <div className="modal-header">
              <span className="group-badge" data-group={selectedEvent.group}>
                {selectedEvent.group === 'Joint' && selectedEvent.groups 
                  ? selectedEvent.groups.join(', ')
                  : selectedEvent.group}
              </span>
              <h2>{selectedEvent.title}</h2>
            </div>
            <div className="modal-body">
              <div className="event-details">
                <div className="detail-item">
                  <strong>Data:</strong> {
                    format(selectedEvent.start, 'yyyy-MM-dd') === format(selectedEvent.end, 'yyyy-MM-dd')
                      ? format(selectedEvent.start, 'd MMMM yyyy', { locale: pl })
                      : `${format(selectedEvent.start, 'd MMMM yyyy', { locale: pl })} - ${format(selectedEvent.end, 'd MMMM yyyy', { locale: pl })}`
                  }
                </div>
                <div className="detail-item">
                  <strong>Czas:</strong> {format(selectedEvent.start, 'HH:mm', { locale: pl })} - {format(selectedEvent.end, 'HH:mm', { locale: pl })}
                </div>
                <div className="detail-item">
                  <strong>Miejsce:</strong> {selectedEvent.location}
                </div>
                {selectedEvent.url && (
                  <div className="detail-item">
                    <strong>Link:</strong> <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer" className="event-link">{selectedEvent.url}</a>
                  </div>
                )}
              </div>
              <div className="event-description">
                <h3>Opis</h3>
                <p>{selectedEvent.description}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="admin-modal-controls">
                <button onClick={handleEditEvent} className="edit-button">Edytuj</button>
                <button onClick={handleDeleteEvent} className="delete-button">Usuń</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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