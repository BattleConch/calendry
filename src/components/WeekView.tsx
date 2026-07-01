import React, { useEffect, useRef } from 'react';
import { CalendarEvent, Task } from '../types';
import './WeekView.css';

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 0;
const END_HOUR = 24;
const TOTAL_HOURS = END_HOUR - START_HOUR;

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function WeekView({ currentDate, events, tasks, selectedDate, onSelectDate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const offset = (now.getHours() - 1) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, offset);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekStart = getWeekStart(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

  // Group events and tasks by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  const timedTasksByDate: Record<string, Task[]> = {};
  const allDayTasksByDate: Record<string, Task[]> = {};

  for (const e of events) {
    (eventsByDate[e.date] ??= []).push(e);
  }
  for (const t of tasks) {
    if (!t.date) continue;
    if (t.time) {
      (timedTasksByDate[t.date] ??= []).push(t);
    } else {
      (allDayTasksByDate[t.date] ??= []).push(t);
    }
  }

  const nowTop = ((now.getHours() + now.getMinutes() / 60) - START_HOUR) * HOUR_HEIGHT;
  const todayInWeek = days.some(d => toDateStr(d) === today);

  return (
    <div className="week-view">
      {/* Header row */}
      <div className="week-header">
        <div className="time-gutter-header" />
        {days.map(day => {
          const dateStr = toDateStr(day);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          return (
            <div
              key={dateStr}
              className={`week-day-header ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
            >
              <span className="week-day-name">
                {day.toLocaleString('default', { weekday: 'short' })}
              </span>
              <span className={`week-day-number ${isToday ? 'today-circle' : ''}`}>
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* All-day / tasks row */}
      <div className="week-allday-row">
        <div className="time-gutter-allday">all-day</div>
        {days.map(day => {
          const dateStr = toDateStr(day);
          const dayAllDayTasks = allDayTasksByDate[dateStr] ?? [];
          return (
            <div key={dateStr} className="week-allday-cell">
              {dayAllDayTasks.map(task => (
                <div
                  key={task.id}
                  className={`week-task-chip ${task.completed ? 'completed' : ''}`}
                  title={task.title}
                >
                  <span className="week-task-icon">&#10003;</span>
                  <span>{task.title}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="week-scroll" ref={scrollRef}>
        <div className="week-grid" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Hour labels */}
          <div className="time-gutter">
            {hours.map(h => (
              <div key={h} className="hour-label" style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}>
                {h === 0 ? '' : formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
            const dateStr = toDateStr(day);
            const isToday = dateStr === today;
            const dayEvents = eventsByDate[dateStr] ?? [];
            const dayTimedTasks = timedTasksByDate[dateStr] ?? [];

            return (
              <div key={dateStr} className={`week-col ${isToday ? 'today-col' : ''}`}>
                {/* Hour lines */}
                {hours.map(h => (
                  <div
                    key={h}
                    className="hour-line"
                    style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday && todayInWeek && (
                  <div className="now-line" style={{ top: nowTop }}>
                    <div className="now-dot" />
                  </div>
                )}

                {/* Events */}
                {dayEvents.map(event => {
                  const { top, height } = timeToPosition(event.startTime, event.endTime);
                  return (
                    <div
                      key={event.id}
                      className="week-event"
                      style={{ top, height, background: event.color }}
                      title={`${event.title}\n${event.startTime}–${event.endTime}${event.description ? '\n' + event.description : ''}`}
                    >
                      <div className="week-event-title">{event.title}</div>
                      <div className="week-event-time">{event.startTime}–{event.endTime}</div>
                    </div>
                  );
                })}

                {/* Timed tasks */}
                {dayTimedTasks.map(task => {
                  const topPos = timeToTop(task.time!);
                  return (
                    <div
                      key={task.id}
                      className={`week-task-timed ${task.completed ? 'completed' : ''}`}
                      style={{ top: topPos, height: 24 }}
                      title={task.title}
                    >
                      <span className="week-task-icon">&#10003;</span>
                      <span>{task.title}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatHour(h: number): string {
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function timeToTop(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return ((h + m / 60) - START_HOUR) * HOUR_HEIGHT;
}

function timeToPosition(start: string, end: string): { top: number; height: number } {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const top = ((sh + sm / 60) - START_HOUR) * HOUR_HEIGHT;
  const endPos = ((eh + em / 60) - START_HOUR) * HOUR_HEIGHT;
  return { top, height: Math.max(endPos - top, 20) };
}
