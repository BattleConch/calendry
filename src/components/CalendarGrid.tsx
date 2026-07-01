import React from 'react';
import { CalendarEvent, Tag, Task } from '../types';
import './CalendarGrid.css';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  tags: Tag[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onToday: () => void;
  onQuickCreate: (date: string) => void;
}

export default function CalendarGrid({ currentDate, events, tasks, tags, selectedDate, onSelectDate, onToday, onQuickCreate }: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (t.date) (acc[t.date] ??= []).push(t);
    return acc;
  }, {});

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="calendar-grid">
      <div className="day-names">
        <div className="day-name corner-cell">
          <button className="corner-today-btn" onClick={onToday}>Today</button>
        </div>
        {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
          <div key={d} className="day-name">{d}</div>
        ))}
      </div>
      <div className="days-grid">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="day-cell empty" />;

          const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dayEvents = (eventsByDate[dateStr] ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime));
          const dayTasks = (tasksByDate[dateStr] ?? []);
          const totalItems = dayEvents.length + dayTasks.length;
          const maxVisible = 3;
          const overflow = totalItems > maxVisible ? totalItems - maxVisible : 0;

          return (
            <div
              key={i}
              className={`day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
            >
              <div className={`day-number ${isToday ? 'today-circle' : ''}`}>{day}</div>
              <div className="events-list">
                {dayEvents.slice(0, maxVisible).map(event => (
                  <div
                    key={event.id}
                    className="event-chip"
                    style={{ background: event.color }}
                    title={`${event.title} ${event.startTime}–${event.endTime}`}
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="event-chip-time">{event.startTime}</span>
                    <span className="event-chip-title">{event.title}</span>
                  </div>
                ))}
                {dayTasks.slice(0, Math.max(0, maxVisible - dayEvents.length)).map(task => (
                  <div
                    key={task.id}
                    className={`task-chip ${task.completed ? 'completed' : ''}`}
                    title={task.title}
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="task-chip-icon">&#10003;</span>
                    <span className="task-chip-title">{task.title}</span>
                  </div>
                ))}
                {overflow > 0 && <div className="more-events">+{overflow} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
