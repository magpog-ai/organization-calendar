export type GroupType = 'YoungLife' | 'WyldLife' | 'YLUni' | 'Joint';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  group: GroupType;
  groups?: GroupType[]; // Optional array of groups for joint events
  description: string;
  location: string;
} 