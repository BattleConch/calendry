import React, { useState } from 'react';
import { Tag } from '../types';
import './TagPicker.css';

const TAG_COLORS = ['#4285F4','#EA4335','#34A853','#FBBC04','#FF6D00','#46BDC6','#7986CB','#D81B60','#8E24AA','#00897B'];

interface Props {
  tags: Tag[];
  selectedTagId?: string;
  onSelect: (tagId: string | undefined) => void;
  onCreateTag: (tag: Tag) => void;
}

export default function TagPicker({ tags, selectedTagId, onSelect, onCreateTag }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const tag: Tag = { id: crypto.randomUUID(), name: newName.trim(), color: newColor };
    onCreateTag(tag);
    onSelect(tag.id);
    setNewName('');
    setNewColor(TAG_COLORS[0]);
    setCreating(false);
  };

  return (
    <div className="tag-picker">
      <div className="tag-picker-label">Tag</div>
      <div className="tag-chips">
        <button
          type="button"
          className={`tag-chip none-chip ${!selectedTagId ? 'active' : ''}`}
          onClick={() => onSelect(undefined)}
        >
          None
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            type="button"
            className={`tag-chip ${selectedTagId === tag.id ? 'active' : ''}`}
            style={{ '--tag-color': tag.color } as React.CSSProperties}
            onClick={() => onSelect(selectedTagId === tag.id ? undefined : tag.id)}
          >
            <span className="tag-dot" style={{ background: tag.color }} />
            {tag.name}
          </button>
        ))}
        {!creating && (
          <button type="button" className="tag-chip new-chip" onClick={() => setCreating(true)}>
            + New tag
          </button>
        )}
      </div>

      {creating && (
        <form className="new-tag-form" onSubmit={handleCreate}>
          <input
            className="new-tag-input"
            type="text"
            placeholder="Tag name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
          />
          <div className="new-tag-colors">
            {TAG_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`color-swatch ${newColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div className="new-tag-actions">
            <button type="button" className="tag-cancel" onClick={() => { setCreating(false); setNewName(''); }}>Cancel</button>
            <button type="submit" className="tag-save" disabled={!newName.trim()}>Create</button>
          </div>
        </form>
      )}
    </div>
  );
}
