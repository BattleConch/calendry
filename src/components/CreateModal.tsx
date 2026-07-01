import React, { useState } from 'react';
import { CalendarEvent, Task, Note, Tag } from '../types';
import TagPicker from './TagPicker';
import './CreateModal.css';

const EVENT_COLORS = ['#4285F4','#EA4335','#34A853','#FBBC04','#FF6D00','#46BDC6','#7986CB','#D81B60'];

export interface CreateConfig {
  type: 'event' | 'task' | 'note';
  date?: string;
  startTime?: string;
  endTime?: string;
  editEvent?: CalendarEvent;
}

interface Props {
  config: CreateConfig;
  tags: Tag[];
  onCreateTag: (tag: Tag) => void;
  onAddEvent: (e: CalendarEvent) => void;
  onUpdateEvent?: (e: CalendarEvent) => void;
  onAddTask: (t: Task) => void;
  onAddNote: (n: Note) => void;
  onClose: () => void;
}

export default function CreateModal({ config, tags, onCreateTag, onAddEvent, onUpdateEvent, onAddTask, onAddNote, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {config.type === 'event' && (
          <EventForm
            prefill={config}
            tags={tags}
            onCreateTag={onCreateTag}
            onSubmit={e => { config.editEvent && onUpdateEvent ? onUpdateEvent(e) : onAddEvent(e); onClose(); }}
            onClose={onClose}
          />
        )}
        {config.type === 'task' && (
          <TaskForm
            prefill={config}
            tags={tags}
            onCreateTag={onCreateTag}
            onSubmit={t => { onAddTask(t); onClose(); }}
            onClose={onClose}
          />
        )}
        {config.type === 'note' && (
          <NoteForm
            tags={tags}
            onCreateTag={onCreateTag}
            onSubmit={n => { onAddNote(n); onClose(); }}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

/* ── Event Form ── */
function EventForm({ prefill, tags, onCreateTag, onSubmit, onClose }: {
  prefill: CreateConfig;
  tags: Tag[];
  onCreateTag: (t: Tag) => void;
  onSubmit: (e: CalendarEvent) => void;
  onClose: () => void;
}) {
  const isEditing = !!prefill.editEvent;
  const ev = prefill.editEvent;
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState(ev?.title ?? '');
  const [date, setDate] = useState(ev?.date ?? prefill.date ?? today);
  const [startTime, setStartTime] = useState(ev?.startTime ?? prefill.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(ev?.endTime ?? prefill.endTime ?? '10:00');
  const [color, setColor] = useState(ev?.color ?? EVENT_COLORS[0]);
  const [tagId, setTagId] = useState<string | undefined>(ev?.tagId);
  const [description, setDescription] = useState(ev?.description ?? '');
  const [error, setError] = useState('');

  const handleTagSelect = (id: string | undefined) => {
    setTagId(id);
    if (id) {
      const tag = tags.find(t => t.id === id);
      if (tag) setColor(tag.color);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (endTime <= startTime) { setError('End time must be after start time'); return; }
    onSubmit({ id: ev?.id ?? crypto.randomUUID(), title: title.trim(), date, startTime, endTime, color, tagId, description: description.trim() || undefined });
  };

  return (
    <form className="cm-form" onSubmit={handleSubmit}>
      <div className="cm-header">
        <div className="cm-type-badge event-badge">{isEditing ? 'Edit Event' : 'Event'}</div>
        <button type="button" className="cm-close" onClick={onClose}>&#10005;</button>
      </div>
      {error && <div className="cm-error">{error}</div>}
      <input className="cm-title-input" type="text" placeholder="Add title" value={title}
        onChange={e => { setTitle(e.target.value); setError(''); }} autoFocus />
      <div className="cm-row">
        <label className="cm-label">Date<input className="cm-input" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <label className="cm-label">Start<input className="cm-input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></label>
        <label className="cm-label">End<input className="cm-input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></label>
      </div>
      <label className="cm-label">Description<textarea className="cm-input cm-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" rows={2} /></label>
      <TagPicker tags={tags} selectedTagId={tagId} onSelect={handleTagSelect} onCreateTag={onCreateTag} />
      <div className="cm-color-row">
        <span className="cm-label-text">Color</span>
        <div className="cm-colors">
          {EVENT_COLORS.map(c => (
            <button key={c} type="button" className={`cm-swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>
      </div>
      <div className="cm-actions">
        <button type="button" className="cm-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="cm-save">{isEditing ? 'Update event' : 'Save event'}</button>
      </div>
    </form>
  );
}

/* ── Task Form ── */
function TaskForm({ prefill, tags, onCreateTag, onSubmit, onClose }: {
  prefill: CreateConfig;
  tags: Tag[];
  onCreateTag: (t: Tag) => void;
  onSubmit: (t: Task) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(prefill.date ?? '');
  const [time, setTime] = useState(prefill.startTime ?? '');
  const [tagId, setTagId] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    onSubmit({ id: crypto.randomUUID(), title: title.trim(), date: date || undefined, time: time || undefined, completed: false, tagId, description: description.trim() || undefined });
  };

  return (
    <form className="cm-form" onSubmit={handleSubmit}>
      <div className="cm-header">
        <div className="cm-type-badge task-badge">Task</div>
        <button type="button" className="cm-close" onClick={onClose}>&#10005;</button>
      </div>
      {error && <div className="cm-error">{error}</div>}
      <input className="cm-title-input" type="text" placeholder="Add task title" value={title}
        onChange={e => { setTitle(e.target.value); setError(''); }} autoFocus />
      <div className="cm-row">
        <label className="cm-label">Date<input className="cm-input" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <label className="cm-label">Time<input className="cm-input" type="time" value={time} onChange={e => setTime(e.target.value)} disabled={!date} /></label>
      </div>
      <label className="cm-label">Description<textarea className="cm-input cm-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" rows={2} /></label>
      <TagPicker tags={tags} selectedTagId={tagId} onSelect={setTagId} onCreateTag={onCreateTag} />
      <div className="cm-actions">
        <button type="button" className="cm-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="cm-save">Save task</button>
      </div>
    </form>
  );
}

/* ── Note Form ── */
function NoteForm({ tags, onCreateTag, onSubmit, onClose }: {
  tags: Tag[];
  onCreateTag: (t: Tag) => void;
  onSubmit: (n: Note) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagId, setTagId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    const now = new Date().toISOString();
    onSubmit({ id: crypto.randomUUID(), title: title.trim(), content: content.trim(), tagId, createdAt: now, updatedAt: now });
  };

  return (
    <form className="cm-form" onSubmit={handleSubmit}>
      <div className="cm-header">
        <div className="cm-type-badge note-badge">Note</div>
        <button type="button" className="cm-close" onClick={onClose}>&#10005;</button>
      </div>
      {error && <div className="cm-error">{error}</div>}
      <input className="cm-title-input" type="text" placeholder="Note title" value={title}
        onChange={e => { setTitle(e.target.value); setError(''); }} autoFocus />
      <label className="cm-label">Content<textarea className="cm-input cm-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note..." rows={5} /></label>
      <TagPicker tags={tags} selectedTagId={tagId} onSelect={setTagId} onCreateTag={onCreateTag} />
      <div className="cm-actions">
        <button type="button" className="cm-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="cm-save">Save note</button>
      </div>
    </form>
  );
}
