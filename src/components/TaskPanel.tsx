import React, { useState } from 'react';
import { Task } from '../types';
import './TaskPanel.css';

interface Props {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClose: () => void;
}

export default function TaskPanel({ tasks, onAddTask, onToggleTask, onDeleteTask, onClose }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const today = new Date().toISOString().slice(0, 10);

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => {
    // Sort: incomplete first, then by date/time
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aKey = (a.date ?? '9999') + (a.time ?? '99:99');
    const bKey = (b.date ?? '9999') + (b.time ?? '99:99');
    return aKey.localeCompare(bKey);
  });

  const pending = tasks.filter(t => !t.completed).length;

  return (
    <aside className="task-panel">
      <div className="task-panel-header">
        <h3 className="task-panel-title">Tasks {pending > 0 && <span className="task-badge">{pending}</span>}</h3>
        <button className="task-panel-close" onClick={onClose} aria-label="Close tasks">&#10005;</button>
      </div>

      <div className="task-filter-row">
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

      <button className="add-task-btn" onClick={() => setShowForm(v => !v)}>
        <span>+</span> Add task
      </button>

      {showForm && (
        <TaskForm
          onSubmit={task => { onAddTask(task); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="task-list">
        {filtered.length === 0 && (
          <p className="no-tasks">No tasks{filter !== 'all' ? ` (${filter})` : ''}</p>
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
    </aside>
  );
}

interface TaskItemProps {
  task: Task;
  today: string;
  onToggle: () => void;
  onDelete: () => void;
}

function TaskItem({ task, today, onToggle, onDelete }: TaskItemProps) {
  const isOverdue = !task.completed && task.date && task.date < today;

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <button
        className={`task-check ${task.completed ? 'checked' : ''}`}
        onClick={onToggle}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
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
      <button className="task-delete" onClick={onDelete} aria-label="Delete task">&#10005;</button>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
}

interface TaskFormProps {
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    onSubmit({
      id: crypto.randomUUID(),
      title: title.trim(),
      date: date || undefined,
      time: time || undefined,
      completed: false,
      description: description.trim() || undefined,
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <div className="task-form-error">{error}</div>}
      <input
        className="task-input"
        type="text"
        placeholder="Task title"
        value={title}
        onChange={e => { setTitle(e.target.value); setError(''); }}
        autoFocus
      />
      <div className="task-form-row">
        <input
          className="task-input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          placeholder="Date (optional)"
        />
        <input
          className="task-input"
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          disabled={!date}
          title={!date ? 'Set a date first' : ''}
        />
      </div>
      <textarea
        className="task-input task-textarea"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={2}
      />
      <div className="task-form-actions">
        <button type="button" className="task-form-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="task-form-save">Save task</button>
      </div>
    </form>
  );
}
