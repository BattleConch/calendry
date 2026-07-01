import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CalendarEvent, Tag, Task } from '../types';
import './DayView.css';

const HOUR_HEIGHT = 64;
const TOTAL_HOURS = 24;
const SNAP_MINUTES = 15;

interface DragState { startMinutes: number; endMinutes: number; moved: boolean; }

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  tags: Tag[];
  onToday: () => void;
  onQuickCreate: (date: string, startTime: string, endTime: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function DayView({ currentDate, events, tasks, tags, onToday, onQuickCreate, onEventClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const dateStr = toDateStr(currentDate);
  const isToday = dateStr === today;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, (now.getHours() - 1) * HOUR_HEIGHT);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i);
  const dayEvents = events.filter(e => e.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const timedTasks = tasks.filter(t => t.date === dateStr && t.time);
  const allDayTasks = tasks.filter(t => t.date === dateStr && !t.time);

  const getMinutesFromEvent = useCallback((e: MouseEvent | React.MouseEvent): number => {
    const grid = scrollRef.current;
    if (!grid) return 0;
    const rect = grid.getBoundingClientRect();
    const y = e.clientY - rect.top + grid.scrollTop;
    const raw = (y / HOUR_HEIGHT) * 60;
    return Math.max(0, Math.min(23 * 60 + 45, Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES));
  }, []);

  const handleColMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.day-event, .day-task-timed')) return;
    e.preventDefault();
    const start = getMinutesFromEvent(e);
    setDrag({ startMinutes: start, endMinutes: start + 60, moved: false });
  }, [getMinutesFromEvent]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const end = getMinutesFromEvent(e);
      setDrag(d => d ? { ...d, endMinutes: Math.max(end, d.startMinutes + SNAP_MINUTES), moved: true } : null);
    };
    const onUp = () => {
      if (drag) {
        onQuickCreate(dateStr, minutesToTime(drag.startMinutes), minutesToTime(Math.max(drag.endMinutes, drag.startMinutes + 30)));
      }
      setDrag(null);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [drag, getMinutesFromEvent, onQuickCreate, dateStr]);

  const nowTop = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;

  return (
    <div className="day-view">
      {/* Header */}
      <div className="day-header">
        <div className="day-corner">
          <button className="corner-today-btn" onClick={onToday}>Today</button>
        </div>
        <div className={`day-header-col ${isToday ? 'today' : ''}`}>
          <span className="day-header-weekday">{currentDate.toLocaleString('default', { weekday: 'long' })}</span>
          <span className={`day-header-number ${isToday ? 'today-circle' : ''}`}>{currentDate.getDate()}</span>
          <span className="day-header-month">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* All-day row */}
      {allDayTasks.length > 0 && (
        <div className="day-allday-row">
          <div className="day-time-gutter-allday">all&#8209;day</div>
          <div className="day-allday-cell">
            {allDayTasks.map(task => (
              <div key={task.id} className={`day-task-chip ${task.completed ? 'completed' : ''}`}>
                <span>&#10003;</span> {task.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable grid */}
      <div className="day-scroll" ref={scrollRef} style={{ userSelect: drag ? 'none' : undefined }}>
        <div className="day-grid" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          <div className="day-time-gutter">
            {hours.map(h => (
              <div key={h} className="hour-label" style={{ top: h * HOUR_HEIGHT }}>
                {h === 0 ? '' : formatHour(h)}
              </div>
            ))}
          </div>

          <div
            className={`day-col ${isToday ? 'today-col' : ''}`}
            onMouseDown={handleColMouseDown}
          >
            {hours.map(h => (
              <div key={h} className="hour-line" style={{ top: h * HOUR_HEIGHT }} />
            ))}

            {isToday && (
              <div className="now-line" style={{ top: nowTop }}>
                <div className="now-dot" />
              </div>
            )}

            {drag && (
              <div className="drag-ghost" style={{
                top: drag.startMinutes * (HOUR_HEIGHT / 60),
                height: Math.max((drag.endMinutes - drag.startMinutes) * (HOUR_HEIGHT / 60), HOUR_HEIGHT / 4),
              }}>
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
                  className="day-event"
                  style={{ top, height, background: event.color }}
                  onClick={e => { e.stopPropagation(); onEventClick(event); }}
                  title={`${event.title}\n${event.startTime}–${event.endTime}`}
                >
                  {tag && <span className="day-event-tag">{tag.name}</span>}
                  <div className="day-event-title">{event.title}</div>
                  <div className="day-event-time">{event.startTime}–{event.endTime}</div>
                  {event.description && <div className="day-event-desc">{event.description}</div>}
                </div>
              );
            })}

            {timedTasks.map(task => (
              <div
                key={task.id}
                className={`day-task-timed ${task.completed ? 'completed' : ''}`}
                style={{ top: timeToTop(task.time!), height: 24 }}
                title={task.title}
              >
                <span>&#10003;</span> {task.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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
