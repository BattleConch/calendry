export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  date?: string; // YYYY-MM-DD, optional
  time?: string; // HH:MM, optional
  completed: boolean;
  description?: string;
}

export type ViewMode = 'month' | 'week';
