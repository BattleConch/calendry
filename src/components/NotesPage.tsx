import React, { useState } from 'react';
import { Note } from '../types';
import './NotesPage.css';

interface Props {
  notes: Note[];
  onAddNote: (n: Note) => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

export default function NotesPage({ notes, onAddNote, onUpdateNote, onDeleteNote }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = [...notes]
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="notes-page">
      <div className="notes-page-header">
        <h2 className="notes-page-title">Notes</h2>
        <div className="notes-search-wrapper">
          <span className="search-icon">&#128269;</span>
          <input
            className="notes-search"
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="notes-add-btn" onClick={() => { setShowForm(true); setEditingId(null); }}>+ New note</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <NoteFormModal
              onSubmit={n => { onAddNote(n); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {filtered.length === 0 && !showForm && (
        <div className="notes-empty">
          <div className="notes-empty-icon">&#128196;</div>
          <p>{search ? 'No notes match your search' : 'No notes yet'}</p>
        </div>
      )}

      <div className="notes-masonry">
        {filtered.map(note => (
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

function NoteCard({ note, editing, onEdit, onSave, onCancel, onDelete }: {
  note: Note; editing: boolean;
  onEdit: () => void; onSave: (c: string) => void; onCancel: () => void; onDelete: () => void;
}) {
  const [content, setContent] = useState(note.content);

  if (editing) {
    return (
      <div className="note-card editing">
        <div className="note-card-title">{note.title}</div>
        <textarea className="note-edit-area" value={content} onChange={e => setContent(e.target.value)} autoFocus rows={6} />
        <div className="note-card-actions">
          <button className="note-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="note-btn-save" onClick={() => onSave(content)}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-card" onClick={onEdit}>
      <div className="note-card-header">
        <span className="note-card-title">{note.title}</span>
        <button className="note-card-delete" onClick={e => { e.stopPropagation(); onDelete(); }}>&#10005;</button>
      </div>
      {note.content && <p className="note-card-content">{note.content}</p>}
      <div className="note-card-date">{formatRelative(note.updatedAt)}</div>
    </div>
  );
}

function NoteFormModal({ onSubmit, onCancel }: { onSubmit: (n: Note) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  return (
    <form className="note-modal-form" onSubmit={e => {
      e.preventDefault();
      if (!title.trim()) { setError('Title is required'); return; }
      const now = new Date().toISOString();
      onSubmit({ id: crypto.randomUUID(), title: title.trim(), content: content.trim(), createdAt: now, updatedAt: now });
    }}>
      <div className="modal-header">
        <h3>New Note</h3>
        <button type="button" className="modal-close" onClick={onCancel}>&#10005;</button>
      </div>
      {error && <div className="modal-error">{error}</div>}
      <label className="modal-label">Title<input className="modal-input" type="text" value={title} onChange={e => { setTitle(e.target.value); setError(''); }} autoFocus placeholder="Note title" /></label>
      <label className="modal-label">Content<textarea className="modal-input modal-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note..." rows={6} /></label>
      <div className="modal-actions">
        <button type="button" className="modal-btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="modal-btn-save">Save note</button>
      </div>
    </form>
  );
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
}
