import React, { useState, useEffect } from 'react';
import './App.css';
import Calendar from './components/Calendar';
import NavBar from './components/NavBar';
import { mockEvents } from './data/mockEvents';
import { Event } from './types/events';
import { AuthProvider } from './context/AuthContext';
import { getEvents, addEvent, updateEvent, deleteEvent } from './firebase/eventService';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Event CRUD operations with Firebase
  const handleAddEvent = async (newEvent: Event) => {
    try {
      const addedEvent = await addEvent(newEvent);
      if (addedEvent) {
        setEvents([...events, addedEvent]);
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

  return (
    <AuthProvider>
      <div className="App">
        <NavBar />
        <main>
          {error && <div className="error-banner">{error}</div>}
          {loading ? (
            <div className="loading-spinner">Ładowanie wydarzeń...</div>
          ) : (
            <Calendar 
              events={events}
              onEventAdd={handleAddEvent}
              onEventUpdate={handleUpdateEvent}
              onEventDelete={handleDeleteEvent}
            />
          )}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
