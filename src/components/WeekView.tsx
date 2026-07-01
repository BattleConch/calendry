import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CalendarEvent, Tag, Task } from '../types';
import './WeekView.css';

const HOUR_HEIGHT = 64;
const START_HOUR = 0;
const TOTAL_HOURS = 24;
const SNAP_MINUTES = 15;

interface DragState {
  dateStr: string;
  startMinutes: number;
  endMinutes: number;
  moved: boolean;
}

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  tags: Tag[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onToday: () => void;
  onQuickCreate: (date: string, startTime: string, endTime: string) => void;
}

export default function WeekView({ currentDate, events, tasks, tags, selectedDate, onSelectDate, onToday, onQuickCreate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  useEffect(() => {
    if (scrollRef.current) {
      const offset = Math.max(0, (now.getHours() - 1) * HOUR_HEIGHT);
      scrollRef.current.scrollTop = offset;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekStart = getWeekStart(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i);

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  const timedTasksByDate: Record<string, Task[]> = {};
  const allDayTasksByDate: Record<string, Task[]> = {};
  for (const e of events) (eventsByDate[e.date] ??= []).push(e);
  for (const t of tasks) {
    if (!t.date) continue;
    if (t.time) (timedTasksByDate[t.date] ??= []).push(t);
    else (allDayTasksByDate[t.date] ??= []).push(t);
  }

  /* ── Drag handling ── */
  const getMinutesFromEvent = useCallback((e: MouseEvent | React.MouseEvent): number => {
    const grid = scrollRef.current;
    if (!grid) return 0;
    const rect = grid.getBoundingClientRect();
    const y = e.clientY - rect.top + grid.scrollTop;
    const rawMinutes = (y / HOUR_HEIGHT) * 60;
    return Math.max(0, Math.min(23 * 60 + 45, Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES));
  }, []);

  const handleColMouseDown = useCallback((e: React.MouseEvent, dateStr: string) => {
    // Only trigger on left click on empty area (not on event chips)
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.week-event, .week-task-timed')) return;
    e.preventDefault();
    const startMinutes = getMinutesFromEvent(e);
    setDrag({ dateStr, startMinutes, endMinutes: startMinutes + 60, moved: false });
  }, [getMinutesFromEvent]);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: MouseEvent) => {
      const endMinutes = getMinutesFromEvent(e);
      setDrag(d => d ? { ...d, endMinutes: Math.max(endMinutes, d.startMinutes + SNAP_MINUTES), moved: true } : null);
    };
    const onUp = () => {
      if (drag) {
        const start = minutesToTime(drag.startMinutes);
        const end = minutesToTime(Math.max(drag.endMinutes, drag.startMinutes + 30));
        onQuickCreate(drag.dateStr, start, end);
      }
      setDrag(null);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [drag, getMinutesFromEvent, onQuickCreate]);

  const nowTop = ((now.getHours() + now.getMinutes() / 60) - START_HOUR) * HOUR_HEIGHT;
  const todayInWeek = days.some(d => toDateStr(d) === today);

  return (
    <div className="week-view">
      {/* Header row */}
      <div className="week-header">
        {/* Today button in the corner */}
        <div className="week-corner">
          <button className="corner-today-btn" onClick={onToday}>Today</button>
        </div>
        {days.map(day => {
          const dateStr = toDateStr(day);
          const isToday    = dateStr === today;
          const isSelected = dateStr === selectedDate;
          return (
            <div
              key={dateStr}
              className={`week-day-header ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
            >
              <span className="week-day-name">{day.toLocaleString('default', { weekday: 'short' })}</span>
              <span className={`week-day-number ${isToday ? 'today-circle' : ''}`}>{day.getDate()}</span>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      <div className="week-allday-row">
        <div className="time-gutter-allday">all&#8209;day</div>
        {days.map(day => {
          const dateStr = toDateStr(day);
          return (
            <div key={dateStr} className="week-allday-cell">
              {(allDayTasksByDate[dateStr] ?? []).map(task => (
                <div key={task.id} className={`week-task-chip ${task.completed ? 'completed' : ''}`} title={task.title}>
                  <span className="week-task-icon">&#10003;</span>
                  <span>{task.title}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="week-scroll" ref={scrollRef} style={{ userSelect: drag ? 'none' : undefined }}>
        <div className="week-grid" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Hour labels */}
          <div className="time-gutter">
            {hours.map(h => (
              <div key={h} className="hour-label" style={{ top: h * HOUR_HEIGHT }}>
                {h === 0 ? '' : formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
            const dateStr    = toDateStr(day);
            const isToday    = dateStr === today;
            const dayEvents  = eventsByDate[dateStr]    ?? [];
            const dayTTasks  = timedTasksByDate[dateStr] ?? [];
            const isDragging = drag?.dateStr === dateStr;

            return (
              <div
                key={dateStr}
                className={`week-col ${isToday ? 'today-col' : ''}`}
                onMouseDown={e => handleColMouseDown(e, dateStr)}
              >
                {hours.map(h => (
                  <div key={h} className="hour-line" style={{ top: h * HOUR_HEIGHT }} />
                ))}

                {isToday && todayInWeek && (
                  <div className="now-line" style={{ top: nowTop }}>
                    <div className="now-dot" />
                  </div>
                )}

                {/* Drag ghost */}
                {isDragging && drag && (
                  <div
                    className="drag-ghost"
                    style={{
                      top: drag.startMinutes * (HOUR_HEIGHT / 60),
                      height: Math.max((drag.endMinutes - drag.startMinutes) * (HOUR_HEIGHT / 60), HOUR_HEIGHT / 4),
                    }}
                  >
                    <span className="drag-ghost-time">
                      {minutesToTime(drag.startMinutes)} – {minutesToTime(drag.endMinutes)}
                    </span>
                  </div>
                )}

                {dayEvents.map(event => {
                  const { top, height } = timeToPos(event.startTime, event.endTime);
                  const tag = tags.find(t => t.id === event.tagId);
                  return (
                    <div
                      key={event.id}
                      className="week-event"
                      style={{ top, height, background: event.color }}
                      title={`${event.title}\n${event.startTime}–${event.endTime}`}
                    >
                      {tag && <span className="week-event-tag">{tag.name}</span>}
                      <div className="week-event-title">{event.title}</div>
                      <div className="week-event-time">{event.startTime}–{event.endTime}</div>
                    </div>
                  );
                })}

                {dayTTasks.map(task => (
                  <div
                    key={task.id}
                    className={`week-task-timed ${task.completed ? 'completed' : ''}`}
                    style={{ top: timeToTop(task.time!), height: 24 }}
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
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatHour(h: number) {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h-12} PM`;
}
function minutesToTime(m: number) {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
}
function timeToTop(time: string) {
  const [h, m] = time.split(':').map(Number);
  return (h + m/60) * HOUR_HEIGHT;
}
function timeToPos(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const top = (sh + sm/60) * HOUR_HEIGHT;
  return { top, height: Math.max((eh + em/60) * HOUR_HEIGHT - top, 20) };
}
