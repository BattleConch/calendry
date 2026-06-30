import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CalendarGrid from './components/CalendarGrid';
import { CalendarEvent } from './types';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const addEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-title">Calendry</span>
        </div>
        <div className="header-center">
          <button
            className="today-btn"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
          <button
            className="arrow-btn"
            onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          >
            ‹
          </button>
          <button
            className="arrow-btn"
            onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            ›
          </button>
          <h2 className="month-year">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="header-right" />
      </header>

      <div className="app-body">
        <Sidebar
          events={events}
          selectedDate={selectedDate}
          onAddEvent={addEvent}
          onDeleteEvent={deleteEvent}
          onSelectDate={setSelectedDate}
        />
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>
    </div>
  );
}

export default App;
