import React, { useState } from 'react';
import { Task, Tag } from '../types';
import TagPicker from './TagPicker';
import './TaskPanelContent.css';

interface Props {
  tasks: Task[];
  tags: Tag[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onCreateTag: (tag: Tag) => void;
}

export default function TaskPanelContent({ tasks, tags, onAddTask, onToggleTask, onDeleteTask, onCreateTag }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const today = new Date().toISOString().slice(0, 10);
  const pending = tasks.filter(t => !t.completed).length;

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aKey = (a.date ?? '9999') + (a.time ?? '99:99');
    const bKey = (b.date ?? '9999') + (b.time ?? '99:99');
    return aKey.localeCompare(bKey);
  });

  return (
    <div className="task-panel-content">
      <div className="tpc-top">
        <div className="tpc-summary">
          {pending > 0 ? (
            <span className="tpc-pending">{pending} pending</span>
          ) : (
            <span className="tpc-all-done">All done!</span>
          )}
        </div>
        <div className="tpc-filters">
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button className="add-task-btn" onClick={() => setShowForm(v => !v)}>
        <span className="add-task-icon">+</span> Add task
      </button>

      {showForm && (
        <TaskForm
          tags={tags}
          onCreateTag={onCreateTag}
          onSubmit={t => { onAddTask(t); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="task-list">
        {filtered.length === 0 && (
          <p className="no-tasks">No {filter !== 'all' ? filter : ''} tasks</p>
        )}
        {filtered.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            today={today}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TaskItem({ task, today, onToggle, onDelete }: { task: Task; today: string; onToggle: () => void; onDelete: () => void }) {
  const isOverdue = !task.completed && task.date && task.date < today;
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <button className={`task-check ${task.completed ? 'checked' : ''}`} onClick={onToggle}>
        {task.completed && <span>&#10003;</span>}
      </button>
      <div className="task-item-body">
        <div className="task-item-title">{task.title}</div>
        {(task.date || task.description) && (
          <div className="task-item-meta">
            {task.date && (
              <span className={`task-date ${isOverdue ? 'overdue-text' : ''}`}>
                {isOverdue ? '⚠ ' : ''}{formatDate(task.date)}{task.time ? ` · ${task.time}` : ''}
              </span>
            )}
            {task.description && <span className="task-desc">{task.description}</span>}
          </div>
        )}
      </div>
      <button className="task-delete" onClick={onDelete}>&#10005;</button>
    </div>
  );
}

function TaskForm({ tags, onCreateTag, onSubmit, onCancel }: { tags: Tag[]; onCreateTag: (t: Tag) => void; onSubmit: (t: Task) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [tagId, setTagId] = useState<string | undefined>();
  const [error, setError] = useState('');

  return (
    <form
      className="task-form"
      onSubmit={e => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required'); return; }
        onSubmit({ id: crypto.randomUUID(), title: title.trim(), date: date || undefined, time: time || undefined, completed: false, description: description.trim() || undefined, tagId });
      }}
    >
      {error && <div className="task-form-error">{error}</div>}
      <input className="task-input" type="text" placeholder="Task title" value={title}
        onChange={e => { setTitle(e.target.value); setError(''); }} autoFocus />
      <div className="task-form-row">
        <input className="task-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input className="task-input" type="time" value={time} onChange={e => setTime(e.target.value)} disabled={!date} />
      </div>
      <textarea className="task-input task-textarea" placeholder="Description (optional)" value={description}
        onChange={e => setDescription(e.target.value)} rows={2} />
      <TagPicker tags={tags} selectedTagId={tagId} onSelect={setTagId} onCreateTag={onCreateTag} />
      <div className="task-form-actions">
        <button type="button" className="task-form-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="task-form-save">Save</button>
      </div>
    </form>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' });
}
