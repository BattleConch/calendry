import React, { useState } from 'react';
import { CalendarEvent, Task } from '../types';
import EventForm from './EventForm';
import './Sidebar.css';

interface Props {
  events: CalendarEvent[];
  tasks: Task[];
  selectedDate: string | null;
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onSelectDate: (date: string | null) => void;
}

export default function Sidebar({ events, tasks, selectedDate, onAddEvent, onDeleteEvent, onSelectDate }: Props) {
  const [showForm, setShowForm] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const upcomingEvents = [...events]
    .filter(e => e.date >= todayStr)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 8);

  const upcomingTasks = [...tasks]
    .filter(t => !t.completed && t.date && t.date >= todayStr)
    .sort((a, b) => {
      const aKey = (a.date ?? '') + (a.time ?? '');
      const bKey = (b.date ?? '') + (b.time ?? '');
      return aKey.localeCompare(bKey);
    })
    .slice(0, 5);

  return (
    <aside className="sidebar">
      <button className="create-btn" onClick={() => setShowForm(true)}>
        <span className="create-icon">+</span> Create
      </button>

      <MiniCalendar
        date={today}
        selectedDate={selectedDate}
        events={events}
        tasks={tasks}
        onSelectDate={onSelectDate}
      />

      {upcomingTasks.length > 0 && (
        <div className="upcoming-section">
          <h3 className="upcoming-title">Tasks</h3>
          {upcomingTasks.map(task => (
            <div key={task.id} className="upcoming-task">
              <span className="task-dot" />
              <span className="upcoming-task-title">{task.title}</span>
              {task.date && (
                <span className="upcoming-task-date">{formatDate(task.date)}{task.time ? ` · ${task.time}` : ''}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="upcoming-section">
        <h3 className="upcoming-title">Upcoming</h3>
        {upcomingEvents.length === 0 && <p className="no-events">No upcoming events</p>}
        {upcomingEvents.map(event => (
          <div key={event.id} className="upcoming-event" style={{ borderLeft: `3px solid ${event.color}` }}>
            <div className="upcoming-event-title">{event.title}</div>
            <div className="upcoming-event-time">
              {formatDate(event.date)} &middot; {event.startTime}&ndash;{event.endTime}
            </div>
            <button className="delete-btn" onClick={() => onDeleteEvent(event.id)} aria-label="Delete event">
              &times;
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <EventForm
              selectedDate={selectedDate}
              onSubmit={ev => { onAddEvent(ev); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </aside>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
}

interface MiniCalendarProps {
  date: Date;
  selectedDate: string | null;
  events: CalendarEvent[];
  tasks: Task[];
  onSelectDate: (date: string | null) => void;
}

function MiniCalendar({ date, selectedDate, events, tasks, onSelectDate }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(date.getFullYear(), date.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const markedDates = new Set([
    ...events.map(e => e.date),
    ...tasks.filter(t => t.date).map(t => t.date as string),
  ]);

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="mini-calendar">
      <div className="mini-cal-header">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}>&#8249;</button>
        <span>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}>&#8250;</button>
      </div>
      <div className="mini-cal-grid">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <span key={i} className="mini-day-name">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasMarker = markedDates.has(dateStr);
          return (
            <button
              key={i}
              className={`mini-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
            >
              {day}
              {hasMarker && <span className="mini-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
