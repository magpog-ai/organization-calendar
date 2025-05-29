import { db, firebase } from './config';
import { ContactWorkEntry } from '../types/contactWork';

// Helper function to convert Firestore timestamp to Date
const convertTimestampToDate = (entry: any): ContactWorkEntry => {
  return {
    ...entry,
    startTime: entry.startTime.toDate(),
    endTime: entry.endTime.toDate(),
    deletedOccurrences: entry.deletedOccurrences ? entry.deletedOccurrences.map((date: any) => date.toDate()) : [],
    createdAt: entry.createdAt.toDate(),
    updatedAt: entry.updatedAt.toDate()
  };
};

// Helper function to convert Date to Firestore timestamp
const convertDateToTimestamp = (entry: ContactWorkEntry) => {
  return {
    ...entry,
    startTime: firebase.firestore.Timestamp.fromDate(entry.startTime),
    endTime: firebase.firestore.Timestamp.fromDate(entry.endTime),
    deletedOccurrences: entry.deletedOccurrences ? entry.deletedOccurrences.map(date => firebase.firestore.Timestamp.fromDate(date)) : [],
    createdAt: firebase.firestore.Timestamp.fromDate(entry.createdAt),
    updatedAt: firebase.firestore.Timestamp.fromDate(entry.updatedAt)
  };
};

// Get all contact work entries
export const getContactWorkEntries = async (): Promise<ContactWorkEntry[]> => {
  try {
    const querySnapshot = await db.collection('contactWork').orderBy('startTime').get();
    
    const entries: ContactWorkEntry[] = [];
    querySnapshot.forEach((doc: any) => {
      const entryData = doc.data();
      entries.push({
        ...convertTimestampToDate(entryData),
        id: doc.id
      });
    });
    
    return entries;
  } catch (error) {
    console.error("Error getting contact work entries: ", error);
    return [];
  }
};

// Add a new contact work entry
export const addContactWorkEntry = async (entry: Omit<ContactWorkEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContactWorkEntry | null> => {
  try {
    console.log('contactWorkService.addContactWorkEntry called with:', entry);
    const now = new Date();
    const fullEntry = {
      ...entry,
      id: '', // Will be set by Firestore
      createdAt: now,
      updatedAt: now
    };
    
    // Remove undefined properties
    Object.keys(fullEntry).forEach(key => {
      if ((fullEntry as any)[key] === undefined) {
        delete (fullEntry as any)[key];
      }
    });
    
    const entryWithTimestamps = convertDateToTimestamp(fullEntry as ContactWorkEntry);
    
    console.log('Entry with timestamps:', entryWithTimestamps);
    const docRef = await db.collection('contactWork').add(entryWithTimestamps);
    console.log('Firebase document added with ID:', docRef.id);
    const resultEntry = {
      ...entry,
      id: docRef.id,
      createdAt: now,
      updatedAt: now
    };
    console.log('Returning entry:', resultEntry);
    return resultEntry;
  } catch (error) {
    console.error("Error adding contact work entry: ", error);
    return null;
  }
};

// Update an existing contact work entry
export const updateContactWorkEntry = async (entry: ContactWorkEntry): Promise<boolean> => {
  try {
    const updatedEntry = {
      ...entry,
      updatedAt: new Date()
    };
    const entryWithTimestamps = convertDateToTimestamp(updatedEntry);
    
    // Remove the id field before updating
    const { id, ...entryWithoutId } = entryWithTimestamps;
    
    await db.collection('contactWork').doc(entry.id).update(entryWithoutId);
    return true;
  } catch (error) {
    console.error("Error updating contact work entry:", error);
    return false;
  }
};

// Delete a single occurrence of a recurring event
export const deleteContactWorkOccurrence = async (entryId: string, occurrenceDate: Date): Promise<boolean> => {
  try {
    const entryDoc = await db.collection('contactWork').doc(entryId).get();
    
    if (!entryDoc.exists) {
      throw new Error('Contact work entry not found');
    }
    
    const existingEntry = convertTimestampToDate(entryDoc.data());
    const deletedOccurrences = existingEntry.deletedOccurrences || [];
    
    // Add this occurrence date to the deleted list (if not already there)
    const occurrenceDateOnly = new Date(occurrenceDate.getFullYear(), occurrenceDate.getMonth(), occurrenceDate.getDate());
    const isAlreadyDeleted = deletedOccurrences.some(date => 
      date.getTime() === occurrenceDateOnly.getTime()
    );
    
    if (!isAlreadyDeleted) {
      deletedOccurrences.push(occurrenceDateOnly);
      
      await db.collection('contactWork').doc(entryId).update({
        deletedOccurrences: deletedOccurrences.map(date => firebase.firestore.Timestamp.fromDate(date)),
        updatedAt: firebase.firestore.Timestamp.now()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting contact work occurrence:', error);
    return false;
  }
};

// Delete a contact work entry (entire series)
export const deleteContactWorkEntry = async (entryId: string): Promise<boolean> => {
  try {
    await db.collection('contactWork').doc(entryId).delete();
    return true;
  } catch (error) {
    console.error("Error deleting contact work entry:", error);
    return false;
  }
}; 