export type GroupType = 'YoungLife' | 'WyldLife' | 'YLUni' | 'Inne' | 'Joint';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  group: GroupType;
  groups?: GroupType[]; // Optional array of groups for joint events
  description: string;
  location: string;
  url?: string; // Optional URL for external links (e.g., Facebook events)
} 