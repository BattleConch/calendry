import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CalendarGrid from './components/CalendarGrid';
import WeekView from './components/WeekView';
import TaskPanel from './components/TaskPanel';
import { CalendarEvent, Task, ViewMode } from './types';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('month');
  const [taskPanelOpen, setTaskPanelOpen] = useState(true);

  const addEvent = (event: CalendarEvent) => setEvents(prev => [...prev, event]);
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const navPrev = () => {
    if (view === 'month') {
      setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    } else {
      setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    }
  };
  const navNext = () => {
    if (view === 'month') {
      setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    } else {
      setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
    }
  };

  const headerLabel = view === 'month'
    ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    : getWeekLabel(currentDate);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-title">Calendry</span>
        </div>
        <div className="header-center">
          <button className="today-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="arrow-btn" onClick={navPrev}>&#8249;</button>
          <button className="arrow-btn" onClick={navNext}>&#8250;</button>
          <h2 className="month-year">{headerLabel}</h2>
        </div>
        <div className="header-right">
          <div className="view-toggle">
            <button
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >Month</button>
            <button
              className={`view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >Week</button>
          </div>
          <button
            className={`task-panel-toggle ${taskPanelOpen ? 'active' : ''}`}
            onClick={() => setTaskPanelOpen(o => !o)}
            title="Toggle task panel"
          >
            &#10003; Tasks
          </button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar
          events={events}
          tasks={tasks}
          selectedDate={selectedDate}
          onAddEvent={addEvent}
          onDeleteEvent={deleteEvent}
          onSelectDate={setSelectedDate}
        />

        <main className="main-content">
          {view === 'month' ? (
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
          )}
        </main>

        {taskPanelOpen && (
          <TaskPanel
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onClose={() => setTaskPanelOpen(false)}
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
