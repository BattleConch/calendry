import React, { useState } from 'react';
import { Note, Tag } from '../types';
import TagPicker from './TagPicker';
import './NotesPanelContent.css';

interface Props {
  notes: Note[];
  tags: Tag[];
  onAddNote: (n: Note) => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onCreateTag: (tag: Tag) => void;
}

export default function NotesPanelContent({ notes, tags, onAddNote, onUpdateNote, onDeleteNote, onCreateTag }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="notes-panel-content">
      <div className="notes-top">
        <button className="add-note-btn" onClick={() => { setShowForm(true); setEditingId(null); }}>
          <span>+</span> New note
        </button>
      </div>

      {showForm && (
        <NoteForm
          tags={tags}
          onCreateTag={onCreateTag}
          onSubmit={n => { onAddNote(n); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="notes-list">
        {sorted.length === 0 && !showForm && (
          <p className="no-notes">No notes yet</p>
        )}
        {sorted.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            editing={editingId === note.id}
            onEdit={() => setEditingId(note.id)}
            onSave={content => { onUpdateNote(note.id, content); setEditingId(null); }}
            onCancel={() => setEditingId(null)}
            onDelete={() => onDeleteNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}

function NoteForm({ tags, onCreateTag, onSubmit, onCancel }: { tags: Tag[]; onCreateTag: (t: Tag) => void; onSubmit: (n: Note) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagId, setTagId] = useState<string | undefined>();
  const [error, setError] = useState('');

  return (
    <form
      className="note-form"
      onSubmit={e => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required'); return; }
        const now = new Date().toISOString();
        onSubmit({ id: crypto.randomUUID(), title: title.trim(), content: content.trim(), tagId, createdAt: now, updatedAt: now });
      }}
    >
      {error && <div className="note-form-error">{error}</div>}
      <input className="note-input" type="text" placeholder="Note title" value={title}
        onChange={e => { setTitle(e.target.value); setError(''); }} autoFocus />
      <textarea className="note-input note-textarea" placeholder="Write your note..." value={content}
        onChange={e => setContent(e.target.value)} rows={4} />
      <TagPicker tags={tags} selectedTagId={tagId} onSelect={setTagId} onCreateTag={onCreateTag} />
      <div className="note-form-actions">
        <button type="button" className="note-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="note-save">Save</button>
      </div>
    </form>
  );
}

function NoteCard({ note, editing, onEdit, onSave, onCancel, onDelete }: {
  note: Note; editing: boolean;
  onEdit: () => void; onSave: (c: string) => void; onCancel: () => void; onDelete: () => void;
}) {
  const [content, setContent] = useState(note.content);

  if (editing) {
    return (
      <div className="note-card editing">
        <div className="note-card-title">{note.title}</div>
        <textarea className="note-input note-textarea" value={content}
          onChange={e => setContent(e.target.value)} rows={4} autoFocus />
        <div className="note-form-actions">
          <button className="note-cancel" onClick={onCancel}>Cancel</button>
          <button className="note-save" onClick={() => onSave(content)}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-card" onClick={onEdit}>
      <div className="note-card-header">
        <span className="note-card-title">{note.title}</span>
        <button className="note-delete" onClick={e => { e.stopPropagation(); onDelete(); }}>&#10005;</button>
      </div>
      {note.content && <p className="note-card-content">{note.content}</p>}
      <div className="note-card-date">{formatRelative(note.updatedAt)}</div>
    </div>
  );
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
}
