import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Event } from '../types/events';
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
  startOfWeek,
  getDay,
  locales,
});

interface CalendarProps {
  events: Event[];
  onEventAdd?: (event: Event) => void;
  onEventUpdate?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ 
  events, 
  onEventAdd, 
  onEventUpdate, 
  onEventDelete 
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
  const { isAuthenticated, isAdmin, user } = useAuth();
  
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
    let backgroundColor = '#3174ad';
    
    if (event.groups && event.groups.length > 1) {
      backgroundColor = '#00BCD4'; // Turquoise for joint events
    } else {
      switch (event.group) {
        case 'YoungLife':
          backgroundColor = '#4CAF50'; // Green
          break;
        case 'WyldLife':
          backgroundColor = '#2196F3'; // Blue
          break;
        case 'YLUni':
          backgroundColor = '#FF9800'; // Orange
          break;
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  const formats = {
    eventTimeRangeFormat: () => '',
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  return (
    <div className="calendar-container">
      {isAdmin && (
        <div className="admin-controls">
          <button className="add-event-button" onClick={handleAddEvent}>
            Dodaj nowe wydarzenie
          </button>
        </div>
      )}

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
          <div className="legend-color joint-color"></div>
          <span>Wydarzenia wspólne WyLd i YL </span>
        </div>
      </div>
      
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        formats={formats}
        tooltipAccessor={(event: Event) => `${event.title} (${event.group})`}
        view={view}
        onView={handleViewChange}
        views={[Views.MONTH, Views.WEEK]}
        popup
        selectable
        components={{
          toolbar: CustomToolbar as any,
        }}
      />

      {selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={closeModal}>×</button>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <span className="group-badge" data-group={selectedEvent.group}>
                {selectedEvent.group}
              </span>
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