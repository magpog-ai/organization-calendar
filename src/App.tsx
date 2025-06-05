import React, { useState, useEffect } from 'react';
import './App.css';
import './i18n'; // Initialize i18n
import { useTranslation } from 'react-i18next';
import Calendar from './components/Calendar';
import ContactWorkCalendar from './components/ContactWorkCalendar';
import NavBar from './components/NavBar';
import { mockEvents } from './data/mockEvents';
import { Event } from './types/events';
import { ContactWorkEntry } from './types/contactWork';
import { AuthProvider } from './context/AuthContext';
import { getEvents, addEvent, updateEvent, deleteEvent } from './firebase/eventService';
import { 
  getContactWorkEntries, 
  addContactWorkEntry, 
  updateContactWorkEntry, 
  deleteContactWorkEntry,
  deleteContactWorkOccurrence
} from './firebase/contactWorkService';

function App() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [contactWorkEntries, setContactWorkEntries] = useState<ContactWorkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'contactWork'>('events');

  // Set HTML lang attribute for CSS :lang selectors
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Load events from Firebase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await getEvents();
        
        if (fetchedEvents.length > 0) {
          setEvents(fetchedEvents);
        } else {
          // If no events in the database, use mock events
          setEvents(mockEvents);
          console.log("No events found in Firebase, using mock data");
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events from Firebase. Using local data instead.");
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Load contact work entries from Firebase
  useEffect(() => {
    const fetchContactWorkEntries = async () => {
      try {
        const fetchedEntries = await getContactWorkEntries();
        setContactWorkEntries(fetchedEntries);
      } catch (err) {
        console.error("Failed to fetch contact work entries:", err);
        setError("Failed to load contact work entries from Firebase.");
      }
    };

    fetchContactWorkEntries();
  }, []);

  // Event CRUD operations with Firebase
  const handleAddEvent = async (newEvent: Event) => {
    try {
      console.log('handleAddEvent called with:', newEvent);
      const addedEvent = await addEvent(newEvent);
      console.log('Firebase addEvent result:', addedEvent);
      if (addedEvent) {
        setEvents([...events, addedEvent]);
        console.log('Event added to state, new events count:', events.length + 1);
      } else {
        console.error('addEvent returned null');
      }
    } catch (err) {
      console.error("Failed to add event:", err);
      setError("Failed to add event. Please try again.");
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      const success = await updateEvent(updatedEvent);
      if (success) {
        setEvents(events.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ));
      }
    } catch (err) {
      console.error("Failed to update event:", err);
      setError("Failed to update event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const success = await deleteEvent(eventId);
      if (success) {
        setEvents(events.filter(event => event.id !== eventId));
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
      setError("Failed to delete event. Please try again.");
    }
  };

  // Contact Work CRUD operations with Firebase
  const handleAddContactWorkEntry = async (newEntry: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('handleAddContactWorkEntry called with:', newEntry);
      const addedEntry = await addContactWorkEntry(newEntry);
      console.log('Firebase addContactWorkEntry result:', addedEntry);
      if (addedEntry) {
        setContactWorkEntries([...contactWorkEntries, addedEntry]);
        console.log('ContactWork entry added to state, new entries count:', contactWorkEntries.length + 1);
      } else {
        console.error('addContactWorkEntry returned null');
      }
    } catch (err) {
      console.error("Failed to add contact work entry:", err);
      setError("Failed to add contact work entry. Please try again.");
    }
  };

  const handleUpdateContactWorkEntry = async (updatedEntry: ContactWorkEntry) => {
    try {
      const success = await updateContactWorkEntry(updatedEntry);
      if (success) {
        setContactWorkEntries(contactWorkEntries.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        ));
      }
    } catch (err) {
      console.error("Failed to update contact work entry:", err);
      setError("Failed to update contact work entry. Please try again.");
    }
  };

  const handleDeleteContactWorkEntry = async (entryId: string) => {
    try {
      const success = await deleteContactWorkEntry(entryId);
      if (success) {
        setContactWorkEntries(contactWorkEntries.filter(entry => entry.id !== entryId));
      }
    } catch (err) {
      console.error("Failed to delete contact work entry:", err);
      setError("Failed to delete contact work entry. Please try again.");
    }
  };

  const handleDeleteContactWorkOccurrence = async (entryId: string, occurrenceDate: Date) => {
    try {
      const success = await deleteContactWorkOccurrence(entryId, occurrenceDate);
      if (success) {
        // Refresh the entries to get updated deletedOccurrences
        const updatedEntries = await getContactWorkEntries();
        setContactWorkEntries(updatedEntries);
      }
    } catch (err) {
      console.error("Failed to delete contact work occurrence:", err);
      setError("Failed to delete contact work occurrence. Please try again.");
    }
  };

  return (
    <AuthProvider>
      <div className="App">
        <NavBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        <main>
          {error && <div className="error-banner">{error}</div>}
          {loading ? (
            <div className="loading-spinner">{t('common.loading')}</div>
          ) : (
            <>
              {activeTab === 'events' && (
                <Calendar 
                  events={events}
                  onEventAdd={handleAddEvent}
                  onEventUpdate={handleUpdateEvent}
                  onEventDelete={handleDeleteEvent}
                />
              )}
              {activeTab === 'contactWork' && (
                <ContactWorkCalendar 
                  entries={contactWorkEntries}
                  onEntryAdd={handleAddContactWorkEntry}
                  onEntryUpdate={handleUpdateContactWorkEntry}
                  onEntryDelete={handleDeleteContactWorkEntry}
                  onEntryDeleteOccurrence={handleDeleteContactWorkOccurrence}
                />
              )}
            </>
          )}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
