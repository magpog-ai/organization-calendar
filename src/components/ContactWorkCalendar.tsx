import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pl';
import { ContactWorkEntry, OrganizationType } from '../types/contactWork';
import ContactWorkForm from './ContactWorkForm';
import { useAuth } from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/ContactWork.css';

// Set moment locale to Polish
moment.locale('pl');
const localizer = momentLocalizer(moment);

interface ContactWorkCalendarProps {
  entries: ContactWorkEntry[];
  onEntryAdd: (entry: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEntryUpdate: (entry: ContactWorkEntry) => void;
  onEntryDelete: (entryId: string) => void;
  onEntryDeleteOccurrence: (entryId: string, occurrenceTime: Date) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ContactWorkEntry;
}

// Helper function to detect mobile devices
const isMobileDevice = () => {
  return window.innerWidth <= 768;
};

const ContactWorkCalendar: React.FC<ContactWorkCalendarProps> = ({
  entries,
  onEntryAdd,
  onEntryUpdate,
  onEntryDelete,
  onEntryDeleteOccurrence
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<View>(() => {
    // Set default view based on screen size
    return isMobileDevice() ? Views.AGENDA : Views.MONTH;
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ContactWorkEntry | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<OrganizationType[]>(['YL', 'wyld', 'uni']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactWorkEntry | null>(null);

  // Handle window resize to adjust view for mobile
  useEffect(() => {
    const handleResize = () => {
      if (isMobileDevice() && currentView === Views.MONTH) {
        setCurrentView(Views.AGENDA);
      } else if (!isMobileDevice() && currentView === Views.AGENDA) {
        setCurrentView(Views.MONTH);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentView]);

  // Generate recurring events for the specified duration
  const generateRecurringEvents = (entry: ContactWorkEntry): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const baseEvent: CalendarEvent = {
      id: entry.id,
      title: entry.person,
      start: entry.startTime,
      end: entry.endTime,
      resource: entry
    };

    if (!entry.isRecurring || !entry.recurringPattern) {
      return [baseEvent];
    }

    const now = new Date();
    const startDate = new Date(entry.startTime);
    
    // Calculate end date based on duration setting
    let endDate: Date;
    const duration = entry.recurringPattern.duration;
    
    switch (duration) {
      case '3months':
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '6months':
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '1year':
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'custom':
        endDate = new Date(startDate);
        const customDuration = entry.recurringPattern.customDuration || 3;
        const customUnit = entry.recurringPattern.customDurationUnit || 'months';
        
        if (customUnit === 'weeks') {
          endDate.setDate(endDate.getDate() + (customDuration * 7));
        } else { // months
          endDate.setMonth(endDate.getMonth() + customDuration);
        }
        break;
      default:
        // Fallback to 6 months if duration is missing
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 6);
    }

    let currentDate = new Date(entry.startTime);
    const deletedOccurrences = entry.deletedOccurrences || [];

    while (currentDate <= endDate) {
      const eventStart = new Date(currentDate);
      const eventEnd = new Date(currentDate);
      
      // Calculate duration from original event
      const duration = entry.endTime.getTime() - entry.startTime.getTime();
      eventEnd.setTime(eventStart.getTime() + duration);

      // Check if this occurrence is deleted
      const eventDateOnly = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const isDeleted = deletedOccurrences.some(deletedDate => 
        deletedDate.getTime() === eventDateOnly.getTime()
      );

      // Only add if not deleted
      if (!isDeleted) {
        events.push({
          id: `${entry.id}-${eventStart.getTime()}`,
          title: entry.person,
          start: eventStart,
          end: eventEnd,
          resource: { ...entry, startTime: eventStart, endTime: eventEnd } // Include specific occurrence times
        });
      }

      // Calculate next occurrence
      if (entry.recurringPattern.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (entry.recurringPattern.frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14); // Add 14 days for bi-weekly
      } else if (entry.recurringPattern.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Prevent infinite loop
      if (events.length > 500) break;
    }

    return events;
  };

  // Convert entries to calendar events with filtering
  const calendarEvents = useMemo(() => {
    const filteredEntries = entries.filter(entry => 
      selectedFilters.includes(entry.organization)
    );

    return filteredEntries.flatMap(entry => generateRecurringEvents(entry));
  }, [entries, selectedFilters]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (!isAuthenticated || !isAdmin) return;
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (!isAuthenticated || !isAdmin) return;
    setEditingEntry(event.resource);
    setShowForm(true);
  };

  const handleFormSubmit = (entryData: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEntry) {
      onEntryUpdate({ ...editingEntry, ...entryData });
    } else {
      onEntryAdd(entryData);
    }
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = () => {
    if (!editingEntry) return;
    
    // Check if this is a recurring event
    if (editingEntry.isRecurring) {
      // Show custom delete modal for recurring events
      setDeleteTarget(editingEntry);
      setShowDeleteModal(true);
    } else {
      // Single event - normal delete with simple confirmation
      if (window.confirm('Czy na pewno chcesz usunąć to spotkanie?')) {
        onEntryDelete(editingEntry.id);
        setShowForm(false);
        setEditingEntry(null);
      }
    }
  };

  const handleDeleteConfirmation = (action: 'occurrence' | 'series' | 'cancel') => {
    if (!deleteTarget) return;
    
    switch (action) {
      case 'occurrence':
        onEntryDeleteOccurrence(deleteTarget.id, deleteTarget.startTime);
        break;
      case 'series':
        onEntryDelete(deleteTarget.id);
        break;
      case 'cancel':
        // Do nothing - just close modal
        break;
    }
    
    // Close modals and reset state
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleFilterChange = (organizationType: OrganizationType) => {
    setSelectedFilters(prev => {
      if (prev.includes(organizationType)) {
        return prev.filter(org => org !== organizationType);
      } else {
        return [...prev, organizationType];
      }
    });
  };

  const getEventStyle = (event: CalendarEvent) => {
    // Don't apply background colors in agenda view - only for month/week views
    if (currentView === Views.AGENDA) {
      return {
        style: {
          backgroundColor: 'transparent',
          color: 'inherit',
          border: 'none',
          display: 'block'
        }
      };
    }

    const org = event.resource.organization;
    let backgroundColor = '#3174ad';
    
    switch (org) {
      case 'YL':
        backgroundColor = '#9BC643'; // Match YoungLife green from Events calendar
        break;
      case 'wyld':
        backgroundColor = '#6cb5f0'; // Match WyldLife blue from Events calendar
        break;
      case 'uni':
        backgroundColor = '#f0af4d'; // Match YL Uni orange from Events calendar
        break;
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

  // Custom Event component for agenda view
  const AgendaEvent = ({ event }: { event: CalendarEvent }) => {
    const getOrgDisplayName = (org: string) => {
      switch (org) {
        case 'YL': return 'YL';
        case 'wyld': return 'WyLd';
        case 'uni': return 'Uni';
        default: return org;
      }
    };

    const getOrgClass = (org: string) => {
      return org.toLowerCase();
    };

    return (
      <div 
        className="rbc-event" 
        onClick={() => handleSelectEvent(event)}
      >
        <div className="event-title">
          {event.resource.person}
          <span className={`group-badge ${getOrgClass(event.resource.organization)}`}>
            {getOrgDisplayName(event.resource.organization)}
          </span>
        </div>
        {event.resource.location && (
          <div className="event-location">
            📍 {event.resource.location}
          </div>
        )}
      </div>
    );
  };

  const formats = {
    eventTimeRangeFormat: () => '',
    timeGutterFormat: 'HH:mm',
    dayHeaderFormat: (date: Date) => moment(date).format('dddd D/M'),
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
      `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
    agendaDateFormat: (date: Date) => {
      // Shorter format for mobile
      if (isMobileDevice()) {
        return moment(date).format('ddd, D MMM YYYY');
      }
      return moment(date).format('dddd, D MMMM YYYY');
    },
    agendaHeaderFormat: () => '',
  };

  const messages = {
    allDay: 'Cały dzień',
    previous: 'Poprzedni',
    next: 'Następny',
    today: 'Dzisiaj',
    month: 'Miesiąc',
    week: 'Tydzień',
    day: 'Dzień',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Czas',
    event: 'Kto będzie na ciebie czekał?',
    noEventsInRange: 'Brak spotkań w tym okresie.',
    showMore: (total: number) => `+ Zobacz więcej (${total})`
  };

  return (
    <div className="calendar-container contact-work-calendar">
      {/* Admin Controls - matching Events calendar */}
      {isAdmin && (
        <div className="admin-controls">
          <button
            className="add-event-button"
            onClick={() => {
              setEditingEntry(null);
              setShowForm(true);
            }}
          >
            Dodaj contact work
          </button>
        </div>
      )}

      {/* Filter Controls - matching Events calendar style with checkboxes */}
      <div className="filter-controls">
        <h3>Filtruj grupę:</h3>
        <div className="filter-checkboxes">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('YL')}
              onChange={() => handleFilterChange('YL')}
            />
            <span className="filter-label younglife-filter">Young Life</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('wyld')}
              onChange={() => handleFilterChange('wyld')}
            />
            <span className="filter-label wyldlife-filter">WyldLife</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('uni')}
              onChange={() => handleFilterChange('uni')}
            />
            <span className="filter-label yluni-filter">YL Uni</span>
          </label>
        </div>
      </div>

      {/* Legend - matching Events calendar */}
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
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: isMobileDevice() ? 'calc(100vh - 200px)' : 600 }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable={isAuthenticated && isAdmin}
        view={currentView}
        onView={setCurrentView}
        date={selectedDate}
        onNavigate={setSelectedDate}
        eventPropGetter={getEventStyle}
        formats={formats}
        messages={messages}
        views={isMobileDevice() ? [Views.AGENDA, Views.MONTH] : [Views.MONTH, Views.WEEK, Views.AGENDA]}
        popup
        scrollToTime={new Date(1970, 1, 1, 18, 0, 0, 0)}
        tooltipAccessor={(event: CalendarEvent) => `${event.resource.person} (${event.resource.organization})`}
        components={{
          agenda: {
            event: AgendaEvent,
          },
        }}
      />

      {/* Modal Form - matching Events calendar modal structure */}
      {showForm && (
        <div className="modal-overlay" onClick={handleFormCancel}>
          <div className="modal-content contact-work-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal-button" 
              onClick={handleFormCancel}
            >
              ×
            </button>
            
            <ContactWorkForm
              entry={editingEntry}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
            
            {editingEntry && (
              <div className="admin-modal-controls">
                <button
                  className="delete-button"
                  onClick={handleDeleteEntry}
                >
                  Usuń spotkanie
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay" onClick={() => handleDeleteConfirmation('cancel')}>
          <div className="modal-content delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Usuń cykliczne spotkanie</h3>
            <p>To jest cykliczne spotkanie. Co chcesz zrobić?</p>
            
            <div className="delete-options">
              <button
                className="delete-option-button delete-occurrence"
                onClick={() => handleDeleteConfirmation('occurrence')}
              >
                Usuń tylko to wystąpienie
              </button>
              
              <button
                className="delete-option-button delete-series"
                onClick={() => handleDeleteConfirmation('series')}
              >
                Usuń całą serię spotkań
              </button>
              
              <button
                className="delete-option-button cancel-delete"
                onClick={() => handleDeleteConfirmation('cancel')}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactWorkCalendar; 