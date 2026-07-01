export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color: string;
  tagId?: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  date?: string;
  time?: string;
  completed: boolean;
  tagId?: string;
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tagId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type ViewMode = 'month' | 'week';
export type PageTab = 'calendar' | 'tasks' | 'notes';
