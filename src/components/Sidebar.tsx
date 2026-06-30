import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import EventForm from './EventForm';
import './Sidebar.css';

interface Props {
  events: CalendarEvent[];
  selectedDate: string | null;
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onSelectDate: (date: string | null) => void;
}

export default function Sidebar({ events, selectedDate, onAddEvent, onDeleteEvent, onSelectDate }: Props) {
  const [showForm, setShowForm] = useState(false);

  const today = new Date();
  const miniMonth = today;

  const upcomingEvents = [...events]
    .filter(e => e.date >= today.toISOString().slice(0, 10))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 10);

  const handleAdd = (event: CalendarEvent) => {
    onAddEvent(event);
    setShowForm(false);
  };

  return (
    <aside className="sidebar">
      <button className="create-btn" onClick={() => setShowForm(true)}>
        <span className="create-icon">+</span> Create
      </button>

      <MiniCalendar
        date={miniMonth}
        selectedDate={selectedDate}
        events={events}
        onSelectDate={onSelectDate}
      />

      <div className="upcoming-section">
        <h3 className="upcoming-title">Upcoming</h3>
        {upcomingEvents.length === 0 && (
          <p className="no-events">No upcoming events</p>
        )}
        {upcomingEvents.map(event => (
          <div key={event.id} className="upcoming-event" style={{ borderLeft: `3px solid ${event.color}` }}>
            <div className="upcoming-event-title">{event.title}</div>
            <div className="upcoming-event-time">
              {formatDate(event.date)} · {event.startTime}–{event.endTime}
            </div>
            <button
              className="delete-btn"
              onClick={() => onDeleteEvent(event.id)}
              aria-label="Delete event"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <EventForm
              selectedDate={selectedDate}
              onSubmit={handleAdd}
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
  onSelectDate: (date: string | null) => void;
}

function MiniCalendar({ date, selectedDate, events, onSelectDate }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(date.getFullYear(), date.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const eventDates = new Set(events.map(e => e.date));

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="mini-calendar">
      <div className="mini-cal-header">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
        <span>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
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
          const hasEvent = eventDates.has(dateStr);
          return (
            <button
              key={i}
              className={`mini-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
            >
              {day}
              {hasEvent && <span className="mini-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
