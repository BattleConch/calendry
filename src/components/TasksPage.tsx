import React, { useState } from 'react';
import { Task, Tag } from '../types';
import TagPicker from './TagPicker';
import './TasksPage.css';

interface Props {
  tasks: Task[];
  tags: Tag[];
  onAddTask: (t: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onCreateTag: (tag: Tag) => void;
}

export default function TasksPage({ tasks, tags, onAddTask, onToggleTask, onDeleteTask, onCreateTag }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [groupBy, setGroupBy] = useState<'none' | 'tag'>('tag');
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

  // Group tasks by tag
  const grouped: { label: string; color?: string; tasks: Task[] }[] = [];
  if (groupBy === 'tag') {
    const byTag: Record<string, Task[]> = {};
    for (const t of filtered) {
      const key = t.tagId ?? '__none__';
      (byTag[key] ??= []).push(t);
    }
    for (const tag of tags) {
      if (byTag[tag.id]?.length) {
        grouped.push({ label: tag.name, color: tag.color, tasks: byTag[tag.id] });
      }
    }
    if (byTag['__none__']?.length) {
      grouped.push({ label: 'No tag', tasks: byTag['__none__'] });
    }
  } else {
    grouped.push({ label: '', tasks: filtered });
  }

  return (
    <div className="tasks-page">
      <div className="tasks-page-header">
        <button className="tasks-add-btn" onClick={() => setShowForm(true)}>+ Add task</button>
        <h2 className="tasks-page-title">Tasks <span className="tasks-count">{pending} pending</span></h2>
        <div className="tasks-header-right">
          <div className="tasks-page-filters">
            {(['pending', 'completed', 'all'] as const).map(f => (
              <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="group-toggle">
            <span className="group-label">Group by:</span>
            <button className={`group-btn ${groupBy === 'tag' ? 'active' : ''}`} onClick={() => setGroupBy('tag')}>Tag</button>
            <button className={`group-btn ${groupBy === 'none' ? 'active' : ''}`} onClick={() => setGroupBy('none')}>None</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <TaskFormModal
              tags={tags}
              onCreateTag={onCreateTag}
              onSubmit={t => { onAddTask(t); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="tasks-body">
        {filtered.length === 0 && (
          <div className="tasks-empty">
            <div className="tasks-empty-icon">&#10003;</div>
            <p>No {filter !== 'all' ? filter : ''} tasks</p>
          </div>
        )}

        {grouped.map((group, gi) => (
          <div key={gi} className="task-section">
            {groupBy === 'tag' && group.label && (
              <div className="task-section-header">
                {group.color && <span className="section-dot" style={{ background: group.color }} />}
                <span className="section-name">{group.label}</span>
                <span className="section-count">{group.tasks.length}</span>
              </div>
            )}
            <div className="task-section-list">
              {group.tasks.map(task => {
                const isOverdue = !task.completed && task.date && task.date < today;
                const tag = tags.find(tg => tg.id === task.tagId);
                return (
                  <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
                    <button className={`task-check ${task.completed ? 'checked' : ''}`} onClick={() => onToggleTask(task.id)}
                      style={tag ? { borderColor: tag.color } : undefined}>
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
                    {tag && groupBy !== 'tag' && (
                      <span className="task-tag-pill" style={{ background: tag.color + '22', color: tag.color }}>{tag.name}</span>
                    )}
                    <button className="task-card-delete" onClick={() => onDeleteTask(task.id)}>&#10005;</button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskFormModal({ tags, onCreateTag, onSubmit, onCancel }: { tags: Tag[]; onCreateTag: (t: Tag) => void; onSubmit: (t: Task) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [tagId, setTagId] = useState<string | undefined>();
  const [error, setError] = useState('');

  return (
    <form className="task-modal-form" onSubmit={e => {
      e.preventDefault();
      if (!title.trim()) { setError('Title is required'); return; }
      onSubmit({ id: crypto.randomUUID(), title: title.trim(), date: date || undefined, time: time || undefined, completed: false, description: description.trim() || undefined, tagId });
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
      <TagPicker tags={tags} selectedTagId={tagId} onSelect={setTagId} onCreateTag={onCreateTag} />
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
