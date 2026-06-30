import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import './EventForm.css';

const COLORS = [
  '#4285F4', '#EA4335', '#34A853', '#FBBC04',
  '#FF6D00', '#46BDC6', '#7986CB', '#D81B60',
];

interface Props {
  selectedDate: string | null;
  onSubmit: (event: CalendarEvent) => void;
  onCancel: () => void;
}

export default function EventForm({ selectedDate, onSubmit, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate ?? today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (endTime <= startTime) { setError('End time must be after start time'); return; }
    onSubmit({
      id: crypto.randomUUID(),
      title: title.trim(),
      date,
      startTime,
      endTime,
      color,
      description: description.trim() || undefined,
    });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>New Event</h3>
        <button type="button" className="close-btn" onClick={onCancel}>×</button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <label className="form-label">
        Title
        <input
          className="form-input"
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          placeholder="Add title"
          autoFocus
        />
      </label>

      <label className="form-label">
        Date
        <input
          className="form-input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </label>

      <div className="form-row">
        <label className="form-label">
          Start
          <input
            className="form-input"
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </label>
        <label className="form-label">
          End
          <input
            className="form-input"
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </label>
      </div>

      <label className="form-label">
        Description
        <textarea
          className="form-input form-textarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Add description (optional)"
          rows={2}
        />
      </label>

      <div className="color-picker">
        <span className="form-label-text">Color</span>
        <div className="color-options">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-save">Save</button>
      </div>
    </form>
  );
}
