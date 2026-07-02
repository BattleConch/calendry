import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent, Task } from '../types';
import './Sidebar.css';

interface Props {
  events: CalendarEvent[];
  tasks: Task[];
  selectedDate: string | null;
  onDeleteEvent: (id: string) => void;
  onSelectDate: (date: string | null) => void;
  onCreateEvent: () => void;
  onCreateTask: () => void;
  onCreateNote: () => void;
}

export default function Sidebar({ events, tasks, selectedDate, onDeleteEvent, onSelectDate, onCreateEvent, onCreateTask, onCreateNote }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const upcomingEvents = [...events]
    .filter(e => e.date >= todayStr)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 6);

  const upcomingTasks = [...tasks]
    .filter(t => !t.completed && t.date && t.date >= todayStr)
    .sort((a, b) => ((a.date ?? '') + (a.time ?? '')).localeCompare((b.date ?? '') + (b.time ?? '')))
    .slice(0, 4);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!createOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setCreateOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [createOpen]);

  const handleCreate = (action: () => void) => {
    action();
    setCreateOpen(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Create button with floating dropdown */}
        <div className="create-wrapper" ref={wrapperRef}>
          <button
            className={`create-btn ${createOpen ? 'open' : ''}`}
            onClick={() => createOpen ? handleCreate(onCreateEvent) : setCreateOpen(true)}
          >
            <span className="create-btn-icon-wrap">
              <span className={`create-icon-plus ${createOpen ? 'hidden' : ''}`}>+</span>
              <span className={`create-icon-chevron ${createOpen ? '' : 'hidden'}`}>&#8964;</span>
            </span>
            <span className="create-btn-label">{createOpen ? 'Event' : 'Create'}</span>
          </button>

          {createOpen && (
            <div className="create-dropdown">
              <div className="create-drop-divider" />
              <button className="create-drop-item task-item" onClick={() => handleCreate(onCreateTask)}>
                <span className="drop-item-icon">&#10003;</span>
                <span>Task</span>
              </button>
              <div className="create-drop-divider" />
              <button className="create-drop-item note-item" onClick={() => handleCreate(onCreateNote)}>
                <span className="drop-item-icon">&#9998;</span>
                <span>Note</span>
              </button>
            </div>
          )}
        </div>

        {/* Upcoming tasks */}
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

        {/* Upcoming events */}
        <div className="upcoming-section">
          <h3 className="upcoming-title">Upcoming</h3>
          {upcomingEvents.length === 0 && <p className="no-events">No upcoming events</p>}
          {upcomingEvents.map(event => (
            <div key={event.id} className="upcoming-event" style={{ borderLeft: `3px solid ${event.color}` }}>
              <div className="upcoming-event-title">{event.title}</div>
              <div className="upcoming-event-time">
                {formatDate(event.date)} &middot; {event.startTime}&ndash;{event.endTime}
              </div>
              <button className="delete-btn" onClick={() => onDeleteEvent(event.id)} aria-label="Delete">&#10005;</button>
            </div>
          ))}
        </div>
      </div>

      {/* Mini calendar pinned to bottom */}
      <div className="sidebar-bottom">
        <MiniCalendar
          date={today}
          selectedDate={selectedDate}
          events={events}
          tasks={tasks}
          onSelectDate={onSelectDate}
        />
      </div>
    </aside>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' });
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
  const [animKey, setAnimKey] = useState(0);
  const [animDir, setAnimDir] = useState<'left' | 'right'>('left');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const marked = new Set([...events.map(e => e.date), ...tasks.filter(t => t.date).map(t => t.date as string)]);
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  const navigate = (dir: 'prev' | 'next') => {
    setAnimDir(dir === 'next' ? 'left' : 'right');
    setAnimKey(k => k + 1);
    setViewDate(new Date(year, dir === 'next' ? month + 1 : month - 1, 1));
  };

  return (
    <div className="mini-calendar">
      <div className="mini-cal-header">
        <button onClick={() => navigate('prev')}>&#8249;</button>
        <span>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => navigate('next')}>&#8250;</button>
      </div>
      <div className="mini-cal-grid-outer">
        <div key={animKey} className={`mini-cal-grid mini-anim-${animDir}`}>
          {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="mini-day-name">{d}</span>)}
          {cells.map((day, i) => {
            if (!day) return <span key={i} />;
            const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            return (
              <button
                key={i}
                className={`mini-day ${ds === today ? 'today' : ''} ${ds === selectedDate ? 'selected' : ''}`}
                onClick={() => onSelectDate(ds === selectedDate ? null : ds)}
              >
                {day}
                {marked.has(ds) && <span className="mini-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
