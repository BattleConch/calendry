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
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  completed: boolean;
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'month' | 'week';
export type PageTab = 'calendar' | 'tasks' | 'notes';
