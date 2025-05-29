export type OrganizationType = 'uni' | 'wyld' | 'YL';

export interface ContactWorkEntry {
  id: string;
  person: string; // Who
  startTime: Date; // When - start time
  endTime: Date; // When - end time  
  location: string; // Where
  organization: OrganizationType; // For who (uni, wyld, YL)
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'weekly' | 'biweekly' | 'monthly'; // How often it repeats
    dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc. (for weekly and biweekly)
    dayOfMonth?: number; // For monthly recurrence
    duration: '3months' | '6months' | '1year' | 'custom'; // How long the series should continue
    customDuration?: number; // Custom duration number (e.g., 2, 8, 15)
    customDurationUnit?: 'weeks' | 'months'; // Custom duration unit
  };
  deletedOccurrences?: Date[]; // Track individual deleted occurrences
  description?: string;
  createdAt: Date;
  updatedAt: Date;
} 