import React from 'react';
import { CalendarEvent } from '../types';
import './CalendarGrid.css';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function CalendarGrid({ currentDate, events, selectedDate, onSelectDate }: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="calendar-grid">
      <div className="day-names">
        {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
          <div key={d} className="day-name">{d}</div>
        ))}
      </div>
      <div className="days-grid">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} className="day-cell empty" />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dayEvents = (eventsByDate[dateStr] ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={i}
              className={`day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
            >
              <div className={`day-number ${isToday ? 'today-circle' : ''}`}>{day}</div>
              <div className="events-list">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="event-chip"
                    style={{ background: event.color }}
                    title={`${event.title} ${event.startTime}–${event.endTime}${event.description ? '\n' + event.description : ''}`}
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="event-chip-time">{event.startTime}</span>
                    <span className="event-chip-title">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="more-events">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
