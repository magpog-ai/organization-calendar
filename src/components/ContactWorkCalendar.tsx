import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pl';
import 'moment/locale/en-gb'; // Add English locale
import { useTranslation } from 'react-i18next';
import { ContactWorkEntry, OrganizationType } from '../types/contactWork';
import ContactWorkForm from './ContactWorkForm';
import CustomToolbar from './CustomToolbar';
import { useAuth } from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/ContactWork.css';

// Create localizer - will update locale dynamically
const localizer = momentLocalizer(moment);

interface ContactWorkCalendarProps {
  entries: ContactWorkEntry[];
  onEntryAdd: (entry: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEntryUpdate: (entry: ContactWorkEntry) => void;
  onEntryDelete: (entryId: string) => void;
  onEntryDeleteOccurrence: (entryId: string, occurrenceTime: Date) => void;
  isMobile: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ContactWorkEntry;
}

const ContactWorkCalendar: React.FC<ContactWorkCalendarProps> = ({
  entries,
  onEntryAdd,
  onEntryUpdate,
  onEntryDelete,
  onEntryDeleteOccurrence,
  isMobile
}) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<View>(() => Views.MONTH);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ContactWorkEntry | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<OrganizationType[]>(['YL', 'wyld', 'uni']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactWorkEntry | null>(null);

  // Debug authentication state
  useEffect(() => {
    console.log('ContactWork auth state - isAdmin:', isAdmin, 'isAuthenticated:', isAuthenticated);
  }, [isAdmin, isAuthenticated]);

  // Update moment locale based on current language
  useEffect(() => {
    moment.locale(i18n.language === 'en' ? 'en' : 'pl');
  }, [i18n.language]);

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
      const originalDuration = entry.endTime.getTime() - entry.startTime.getTime();
      eventEnd.setTime(eventStart.getTime() + originalDuration);

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
          resource: { ...entry, startTime: eventStart, endTime: eventEnd }
        });
      }

      // Calculate next occurrence
      if (entry.recurringPattern.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (entry.recurringPattern.frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
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
    if (!isAuthenticated || !isAdmin) {
      setSelectedEvent(event);
      return;
    }
    setEditingEntry(event.resource);
    setShowForm(true);
  };

  const handleFormSubmit = (entryData: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('ContactWork handleFormSubmit called with:', entryData);
    if (editingEntry) {
      console.log('Updating existing entry');
      onEntryUpdate({ ...editingEntry, ...entryData });
    } else {
      console.log('Adding new entry');
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
    
    if (editingEntry.isRecurring) {
      setDeleteTarget(editingEntry);
      setShowDeleteModal(true);
    } else {
      if (window.confirm(t('common.confirm'))) {
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
        break;
    }
    
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
    const org = event.resource.organization;
    let backgroundColor = '#3174ad';
    
    switch (org) {
      case 'YL':
        backgroundColor = '#9BC643';
        break;
      case 'wyld':
        backgroundColor = '#6cb5f0';
        break;
      case 'uni':
        backgroundColor = '#f0af4d';
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

  // Friendly header formats
  const formats = {
    eventTimeRangeFormat: () => '',
    timeGutterFormat: 'HH:mm',
    dayFormat: (d: Date) => moment(d).format('dddd D MMM'),
    weekdayFormat: (d: Date) => moment(d).format('dddd'),
    dayHeaderFormat: (d: Date) => moment(d).format('dddd D MMM'),
  } as const;

  const messages = {
    allDay: t('calendar.allDay'),
    previous: t('calendar.previous'),
    next: t('calendar.next'),
    today: t('calendar.today'),
    month: t('calendar.month'),
    week: t('calendar.week'),
    day: t('calendar.day'),
  };

  return (
    <div className="calendar-container contact-work-calendar">
      {/* Admin Controls - matching Events calendar */}
      {isAdmin && (
        <div className="admin-controls">
          <button
            className="add-event-button"
            onClick={() => {
              console.log('ContactWork add button clicked - isAdmin:', isAdmin, 'isAuthenticated:', isAuthenticated);
              setEditingEntry(null);
              setShowForm(true);
              console.log('showForm set to true');
            }}
          >
            {t('contactWork.add')}
          </button>
        </div>
      )}

      {/* Filter Controls - matching Events calendar style with checkboxes */}
      <div className="filter-controls">
        <h3>{t('contactWork.filter')}</h3>
        <div className="filter-checkboxes">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('YL')}
              onChange={() => handleFilterChange('YL')}
            />
            <span className="filter-label younglife-filter">{t('groups.YL')}</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('wyld')}
              onChange={() => handleFilterChange('wyld')}
            />
            <span className="filter-label wyldlife-filter">{t('groups.wyld')}</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedFilters.includes('uni')}
              onChange={() => handleFilterChange('uni')}
            />
            <span className="filter-label yluni-filter">{t('groups.uni')}</span>
          </label>
        </div>
      </div>

      {/* Legend - matching Events calendar */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color younglife-color"></div>
          <span>{t('groups.YoungLife')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-color wyldlife-color"></div>
          <span>{t('groups.WyldLife')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-color yluni-color"></div>
          <span>{t('groups.YLUni')}</span>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        view={currentView}
        onView={setCurrentView}
        date={selectedDate}
        onNavigate={setSelectedDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable={isAuthenticated && isAdmin}
        eventPropGetter={getEventStyle}
        views={[Views.MONTH, Views.WEEK]}
        components={{
          toolbar: (props) => <CustomToolbar {...props} isMobile={isMobile} />,
        }}
        messages={messages}
        formats={formats}
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
                  {t('contactWork.delete')}
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
            <h3>{t('contactWork.deleteRecurring.title')}</h3>
            <p>{t('contactWork.deleteRecurring.message')}</p>
            
            <div className="delete-options">
              <button
                className="delete-option-button delete-occurrence"
                onClick={() => handleDeleteConfirmation('occurrence')}
              >
                {t('contactWork.deleteRecurring.occurrence')}
              </button>
              
              <button
                className="delete-option-button delete-series"
                onClick={() => handleDeleteConfirmation('series')}
              >
                {t('contactWork.deleteRecurring.series')}
              </button>
              
              <button
                className="delete-option-button cancel-delete"
                onClick={() => handleDeleteConfirmation('cancel')}
              >
                {t('contactWork.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={() => setSelectedEvent(null)}>×</button>
            <div className="modal-header">
              <span className="group-badge" data-group={selectedEvent.resource.organization.toLowerCase()}>
                {t(`groups.${selectedEvent.resource.organization}`)}
              </span>
              <h2>{t('contactDetails.title', { person: selectedEvent.resource.person })}</h2>
            </div>
            <div className="modal-body">
              <div className="event-details">
                <div className="detail-item">
                  <strong>{t('contactDetails.person')}</strong> {selectedEvent.resource.person}
                </div>
                <div className="detail-item">
                  <strong>{t('contactDetails.date')}</strong> {
                    moment(selectedEvent.start).format('dddd, D MMMM YYYY')
                  }
                </div>
                <div className="detail-item">
                  <strong>{t('contactDetails.time')}</strong> {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                </div>
                {selectedEvent.resource.location && (
                  <div className="detail-item">
                    <strong>{t('contactDetails.location')}</strong> {selectedEvent.resource.location}
                  </div>
                )}
                <div className="detail-item">
                  <strong>{t('contactDetails.group')}</strong> {t(`groups.${selectedEvent.resource.organization}`)}
                </div>
                {selectedEvent.resource.isRecurring && selectedEvent.resource.recurringPattern && (
                  <div className="detail-item">
                    <strong>{t('contactDetails.recurring')}</strong> {
                      selectedEvent.resource.recurringPattern.frequency === 'weekly' ? t('contactWork.weekly') :
                      selectedEvent.resource.recurringPattern.frequency === 'biweekly' ? t('contactWork.biweekly') :
                      selectedEvent.resource.recurringPattern.frequency === 'monthly' ? t('contactWork.monthly') : 
                      t('contactWork.recurring')
                    }
                  </div>
                )}
              </div>
              {selectedEvent.resource.description && (
                <div className="event-description">
                  <h3>{t('contactDetails.description')}</h3>
                  <p>{selectedEvent.resource.description}</p>
                </div>
              )}
            </div>
            {isAdmin && (
              <div className="admin-modal-controls">
                <button onClick={() => {
                  if (selectedEvent) {
                    setEditingEntry(selectedEvent.resource);
                    setShowForm(true);
                    setSelectedEvent(null);
                  }
                }} className="edit-button">{t('common.edit')}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactWorkCalendar; 