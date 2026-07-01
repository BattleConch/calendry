import React, { useState } from 'react';
import { Task } from '../types';
import './TasksPage.css';

interface Props {
  tasks: Task[];
  onAddTask: (t: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TasksPage({ tasks, onAddTask, onToggleTask, onDeleteTask }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const today = new Date().toISOString().slice(0, 10);

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return ((a.date ?? '9999') + (a.time ?? '')).localeCompare((b.date ?? '9999') + (b.time ?? ''));
  });

  const pending = tasks.filter(t => !t.completed).length;

  return (
    <div className="tasks-page">
      <div className="tasks-page-header">
        <h2 className="tasks-page-title">Tasks <span className="tasks-count">{pending} pending</span></h2>
        <div className="tasks-page-filters">
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="tasks-add-btn" onClick={() => setShowForm(true)}>+ Add task</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <TaskFormModal
              onSubmit={t => { onAddTask(t); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="tasks-grid">
        {filtered.length === 0 && (
          <div className="tasks-empty">
            <div className="tasks-empty-icon">&#10003;</div>
            <p>No {filter !== 'all' ? filter : ''} tasks</p>
          </div>
        )}
        {filtered.map(task => {
          const isOverdue = !task.completed && task.date && task.date < today;
          return (
            <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
              <button className={`task-check ${task.completed ? 'checked' : ''}`} onClick={() => onToggleTask(task.id)}>
                {task.completed && <span>&#10003;</span>}
              </button>
              <div className="task-card-body">
                <div className="task-card-title">{task.title}</div>
                {(task.date || task.description) && (
                  <div className="task-card-meta">
                    {task.date && (
                      <span className={`task-card-date ${isOverdue ? 'overdue-text' : ''}`}>
                        {isOverdue ? '⚠ ' : ''}{formatDate(task.date)}{task.time ? ` · ${task.time}` : ''}
                      </span>
                    )}
                    {task.description && <span className="task-card-desc">{task.description}</span>}
                  </div>
                )}
              </div>
              <button className="task-card-delete" onClick={() => onDeleteTask(task.id)}>&#10005;</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskFormModal({ onSubmit, onCancel }: { onSubmit: (t: Task) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  return (
    <form className="task-modal-form" onSubmit={e => {
      e.preventDefault();
      if (!title.trim()) { setError('Title is required'); return; }
      onSubmit({ id: crypto.randomUUID(), title: title.trim(), date: date || undefined, time: time || undefined, completed: false, description: description.trim() || undefined });
    }}>
      <div className="modal-header">
        <h3>New Task</h3>
        <button type="button" className="modal-close" onClick={onCancel}>&#10005;</button>
      </div>
      {error && <div className="modal-error">{error}</div>}
      <label className="modal-label">Title<input className="modal-input" type="text" value={title} onChange={e => { setTitle(e.target.value); setError(''); }} autoFocus placeholder="Task title" /></label>
      <div className="modal-row">
        <label className="modal-label">Date<input className="modal-input" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <label className="modal-label">Time<input className="modal-input" type="time" value={time} onChange={e => setTime(e.target.value)} disabled={!date} /></label>
      </div>
      <label className="modal-label">Description<textarea className="modal-input modal-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" rows={3} /></label>
      <div className="modal-actions">
        <button type="button" className="modal-btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="modal-btn-save">Save task</button>
      </div>
    </form>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('default', { month: 'short', day: 'numeric' });
}
