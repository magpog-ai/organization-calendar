export interface Event {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  group: string;
  groups?: string[];
  location?: string;
  description?: string;
  link?: string;
  url?: string;
  allDay?: boolean;
} 