import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CalendarGrid from './components/CalendarGrid';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import RightPanel from './components/RightPanel';
import TasksPage from './components/TasksPage';
import NotesPage from './components/NotesPage';
import CreateModal, { CreateConfig } from './components/CreateModal';
import { CalendarEvent, Task, Note, Tag, ViewMode, PageTab } from './types';
import './App.css';

const DEFAULT_TAGS: Tag[] = [
  { id: 'personal',  name: 'Personal',  color: '#8B6F47' },
  { id: 'work',      name: 'Work',      color: '#6B8F5E' },
  { id: 'school',    name: 'School',    color: '#B56A4A' },
  { id: 'health',    name: 'Health',    color: '#D4A854' },
];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks,  setTasks]  = useState<Task[]>([]);
  const [notes,  setNotes]  = useState<Note[]>([]);
  const [tags,   setTags]   = useState<Tag[]>(DEFAULT_TAGS);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view,   setView]   = useState<ViewMode>('week');
  const [page,   setPage]   = useState<PageTab>('calendar');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'tasks' | 'notes'>('tasks');
  const [dotsOpen, setDotsOpen] = useState(false);
  const [creating, setCreating] = useState<CreateConfig | null>(null);

  const addEvent    = (e: CalendarEvent) => setEvents(prev => [...prev, e]);
  const updateEvent = (e: CalendarEvent) => setEvents(prev => prev.map(ev => ev.id === e.id ? e : ev));
  const deleteEvent = (id: string)       => setEvents(prev => prev.filter(e => e.id !== id));
  const addTask     = (t: Task)          => setTasks(prev => [...prev, t]);
  const toggleTask  = (id: string)       => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask  = (id: string)       => setTasks(prev => prev.filter(t => t.id !== id));
  const addNote     = (n: Note)          => setNotes(prev => [...prev, n]);
  const updateNote  = (id: string, content: string) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n));
  const deleteNote  = (id: string)       => setNotes(prev => prev.filter(n => n.id !== id));
  const addTag      = (tag: Tag)         => setTags(prev => [...prev, tag]);

  const goToday = () => setCurrentDate(new Date());

  const navPrev = () => {
    if (view === 'month') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    else if (view === 'week') setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    else setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  };
  const navNext = () => {
    if (view === 'month') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    else if (view === 'week') setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
    else setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  };

  const headerLabel = view === 'month'
    ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    : view === 'week'
      ? getWeekLabel(currentDate)
      : currentDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-title">Calendry</span>
          {page === 'calendar' && (
            <div className="date-nav">
              <button className="arrow-btn" onClick={navPrev}>&#8249;</button>
              <button className="arrow-btn" onClick={navNext}>&#8250;</button>
              <span className="month-year">{headerLabel}</span>
            </div>
          )}
        </div>

        <nav className="page-tabs" style={{ '--ti': ['calendar','tasks','notes'].indexOf(page) } as React.CSSProperties}>
          <span className="tab-pill" />
          {(['calendar', 'tasks', 'notes'] as PageTab[]).map(tab => (
            <button key={tab} className={`page-tab ${page === tab ? 'active' : ''}`} onClick={() => setPage(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        <div className="header-right">
          {page === 'calendar' && (
            <div className="view-dropdown-wrapper">
              <select
                className="view-select"
                value={view}
                onChange={e => setView(e.target.value as ViewMode)}
                aria-label="Calendar view"
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
              <span className="view-select-arrow">
                <svg viewBox="0 0 10 6"><polyline points="1,1 5,5 9,1"/></svg>
              </span>
            </div>
          )}
          <div className="dots-wrapper">
            <button className="icon-btn dots-btn" onClick={() => setDotsOpen(o => !o)} aria-label="More options">&#8942;</button>
            {dotsOpen && (
              <>
                <div className="dots-backdrop" onClick={() => setDotsOpen(false)} />
                <div className="dots-menu">
                  <div className="dots-menu-item disabled">Settings</div>
                  <div className="dots-menu-item disabled">Appearance</div>
                  <div className="dots-menu-item disabled">Customize</div>
                </div>
              </>
            )}
          </div>
          <button className="icon-btn account-btn" aria-label="Account">Acc</button>
        </div>
      </header>

      <div className="app-body">
        {page === 'calendar' && (
          <Sidebar
            events={events}
            tasks={tasks}
            selectedDate={selectedDate}
            onDeleteEvent={deleteEvent}
            onSelectDate={setSelectedDate}
            onCreateEvent={() => setCreating({ type: 'event', date: selectedDate ?? undefined })}
            onCreateTask={() => setCreating({ type: 'task',  date: selectedDate ?? undefined })}
            onCreateNote={() => setCreating({ type: 'note' })}
          />
        )}

        <main className="main-content">
          {page === 'calendar' ? (
            view === 'month' ? (
              <CalendarGrid
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                tags={tags}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onToday={goToday}
                onQuickCreate={(date) => setCreating({ type: 'event', date })}
                onEventClick={(ev) => setCreating({ type: 'event', editEvent: ev })}
              />
            ) : view === 'week' ? (
              <WeekView
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                tags={tags}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onToday={goToday}
                onQuickCreate={(date, startTime, endTime) => setCreating({ type: 'event', date, startTime, endTime })}
                onEventClick={(ev) => setCreating({ type: 'event', editEvent: ev })}
              />
            ) : (
              <DayView
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                tags={tags}
                onToday={goToday}
                onQuickCreate={(date, startTime, endTime) => setCreating({ type: 'event', date, startTime, endTime })}
                onEventClick={(ev) => setCreating({ type: 'event', editEvent: ev })}
              />
            )
          ) : page === 'tasks' ? (
            <TasksPage tasks={tasks} tags={tags} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} onCreateTag={addTag} />
          ) : (
            <NotesPage notes={notes} tags={tags} onAddNote={addNote} onUpdateNote={updateNote} onDeleteNote={deleteNote} onCreateTag={addTag} />
          )}
        </main>

        {page === 'calendar' && (
          <RightPanel
            open={rightPanelOpen}
            activeTab={rightTab}
            tasks={tasks}
            notes={notes}
            tags={tags}
            onTabChange={setRightTab}
            onToggle={() => setRightPanelOpen(o => !o)}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
            onCreateTag={addTag}
          />
        )}
      </div>

      {creating && (
        <CreateModal
          config={creating}
          tags={tags}
          onCreateTag={addTag}
          onAddEvent={addEvent}
          onUpdateEvent={updateEvent}
          onDeleteEvent={deleteEvent}
          onAddTask={addTask}
          onAddNote={addNote}
          onClose={() => setCreating(null)}
        />
      )}
    </div>
  );
}

function getWeekLabel(date: Date): string {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth())
    return start.toLocaleString('default', { month: 'long', year: 'numeric' });
  return `${start.toLocaleString('default', { month: 'short' })} – ${end.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default App;
