import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CalendarGrid from './components/CalendarGrid';
import WeekView from './components/WeekView';
import RightPanel from './components/RightPanel';
import TasksPage from './components/TasksPage';
import NotesPage from './components/NotesPage';
import { CalendarEvent, Task, Note, ViewMode, PageTab } from './types';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('month');
  const [page, setPage] = useState<PageTab>('calendar');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'tasks' | 'notes'>('tasks');
  const [dotsOpen, setDotsOpen] = useState(false);

  const addEvent = (e: CalendarEvent) => setEvents(prev => [...prev, e]);
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const addTask = (t: Task) => setTasks(prev => [...prev, t]);
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const addNote = (n: Note) => setNotes(prev => [...prev, n]);
  const updateNote = (id: string, content: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n));
  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const navPrev = () => {
    if (view === 'month') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    else setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  };
  const navNext = () => {
    if (view === 'month') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    else setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
  };

  const headerLabel = view === 'month'
    ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    : getWeekLabel(currentDate);

  return (
    <div className="app">
      <header className="app-header">
        {/* Left: logo + date nav */}
        <div className="header-left">
          <span className="app-title">Calendry</span>
          {page === 'calendar' && (
            <div className="date-nav">
              <button className="arrow-btn" onClick={navPrev} aria-label="Previous">&#8249;</button>
              <button className="arrow-btn" onClick={navNext} aria-label="Next">&#8250;</button>
              <span className="month-year">{headerLabel}</span>
            </div>
          )}
        </div>

        {/* Center: page tabs */}
        <nav className="page-tabs">
          {(['calendar', 'tasks', 'notes'] as PageTab[]).map(tab => (
            <button
              key={tab}
              className={`page-tab ${page === tab ? 'active' : ''}`}
              onClick={() => setPage(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Right: view toggle + dots + account */}
        <div className="header-right">
          {page === 'calendar' && (
            <div className="view-toggle">
              <button className={`view-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
              <button className={`view-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Week</button>
            </div>
          )}

          <div className="dots-wrapper">
            <button
              className="icon-btn dots-btn"
              onClick={() => setDotsOpen(o => !o)}
              aria-label="More options"
            >
              &#8942;
            </button>
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
            onAddEvent={addEvent}
            onDeleteEvent={deleteEvent}
            onSelectDate={setSelectedDate}
          />
        )}

        <main className="main-content">
          {page === 'calendar' ? (
            view === 'month' ? (
              <CalendarGrid
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )
          ) : page === 'tasks' ? (
            <TasksPage
              tasks={tasks}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
            />
          ) : (
            <NotesPage
              notes={notes}
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />
          )}
        </main>

        {page === 'calendar' && (
          <RightPanel
            open={rightPanelOpen}
            activeTab={rightTab}
            tasks={tasks}
            notes={notes}
            onTabChange={setRightTab}
            onToggle={() => setRightPanelOpen(o => !o)}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        )}
      </div>
    </div>
  );
}

function getWeekLabel(date: Date): string {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth()) {
    return start.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  return `${start.toLocaleString('default', { month: 'short' })} – ${end.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default App;
