import { Event } from '../types/events';

// Sample events data
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'YoungLife Club Meeting',
    start: new Date(2023, 0, 15, 18, 0), // Jan 15, 2023, 6:00 PM
    end: new Date(2023, 0, 15, 20, 0),   // Jan 15, 2023, 8:00 PM
    group: 'YoungLife',
    groups: ['YoungLife'],
    description: 'Weekly club meeting with games, music, and a short talk.',
    location: 'Main Hall',
    url: 'https://facebook.com/events/younglife-club'
  },
  {
    id: '2',
    title: 'WyldLife Hangout',
    start: new Date(2023, 0, 18, 16, 30), // Jan 18, 2023, 4:30 PM
    end: new Date(2023, 0, 18, 18, 0),    // Jan 18, 2023, 6:00 PM
    group: 'WyldLife',
    groups: ['WyldLife'],
    description: 'Fun afternoon of games and snacks for middle school students.',
    location: 'Youth Room'
  },
  {
    id: '3',
    title: 'YLUni Discussion Group',
    start: new Date(2023, 0, 20, 19, 0), // Jan 20, 2023, 7:00 PM
    end: new Date(2023, 0, 20, 21, 0),   // Jan 20, 2023, 9:00 PM
    group: 'YLUni',
    groups: ['YLUni'],
    description: 'Deep discussions about life, faith, and university challenges.',
    location: 'Coffee Shop Downtown'
  },
  {
    id: '4',
    title: 'Joint Winter Camp',
    start: new Date(2023, 1, 10, 8, 0),  // Feb 10, 2023, 8:00 AM
    end: new Date(2023, 1, 12, 15, 0),   // Feb 12, 2023, 3:00 PM
    group: 'Joint',
    groups: ['YoungLife', 'WyldLife', 'YLUni'],
    description: 'Annual winter camp with all groups. Three days of fun activities, fellowship, and teaching.',
    location: 'Mountain Retreat Center',
    url: 'https://facebook.com/events/123456789'
  },
  {
    id: '5',
    title: 'Spotkanie liderów',
    start: new Date(2023, 1, 5, 10, 0),  // Feb 5, 2023, 10:00 AM
    end: new Date(2023, 1, 5, 12, 0),    // Feb 5, 2023, 12:00 PM
    group: 'Inne',
    groups: ['Inne'],
    description: 'Miesięczne spotkanie liderów wszystkich grup.',
    location: 'Biuro organizacji'
  }
]; 