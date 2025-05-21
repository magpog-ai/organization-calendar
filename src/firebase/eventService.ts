import { db, firebase } from './config';
import { Event } from '../types/events';

// Helper function to convert Firestore timestamp to Date
const convertTimestampToDate = (event: any): Event => {
  return {
    ...event,
    start: event.start.toDate(),
    end: event.end.toDate()
  };
};

// Helper function to convert Date to Firestore timestamp
const convertDateToTimestamp = (event: Event) => {
  return {
    ...event,
    start: firebase.firestore.Timestamp.fromDate(event.start),
    end: firebase.firestore.Timestamp.fromDate(event.end)
  };
};

// Get all events
export const getEvents = async (): Promise<Event[]> => {
  try {
    const querySnapshot = await db.collection('events').get();
    
    const events: Event[] = [];
    querySnapshot.forEach((doc: any) => {
      const eventData = doc.data();
      events.push({
        ...convertTimestampToDate(eventData),
        id: doc.id
      });
    });
    
    return events;
  } catch (error) {
    console.error("Error getting events: ", error);
    return [];
  }
};

// Add a new event
export const addEvent = async (event: Omit<Event, 'id'>): Promise<Event | null> => {
  try {
    const eventWithTimestamps = convertDateToTimestamp(event as Event);
    const docRef = await db.collection('events').add(eventWithTimestamps);
    return {
      ...event,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error adding event: ", error);
    return null;
  }
};

// Update an existing event
export const updateEvent = async (event: Event): Promise<boolean> => {
  try {
    const eventWithTimestamps = convertDateToTimestamp(event);
    
    // Remove the id field before updating
    const { id, ...eventWithoutId } = eventWithTimestamps;
    
    await db.collection('events').doc(event.id).update(eventWithoutId);
    return true;
  } catch (error) {
    console.error("Error updating event:", error);
    return false;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    await db.collection('events').doc(eventId).delete();
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
}; 