import React from 'react';
import { Task, Note, Tag } from '../types';
import TaskPanelContent from './TaskPanelContent';
import NotesPanelContent from './NotesPanelContent';
import './RightPanel.css';

interface Props {
  open: boolean;
  activeTab: 'tasks' | 'notes';
  tasks: Task[];
  notes: Note[];
  tags: Tag[];
  onTabChange: (tab: 'tasks' | 'notes') => void;
  onToggle: () => void;
  onAddTask: (t: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddNote: (n: Note) => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onCreateTag: (tag: Tag) => void;
}

export default function RightPanel(props: Props) {
  const { tags, onCreateTag } = props;
  const { open, activeTab, onTabChange, onToggle } = props;

  return (
    <aside className={`right-panel ${open ? 'open' : 'collapsed'}`}>
      {/* Collapse toggle on left edge */}
      <button
        className="panel-toggle-btn"
        onClick={onToggle}
        aria-label={open ? 'Collapse panel' : 'Expand panel'}
        title={open ? 'Collapse' : 'Expand'}
      >
        <span className="toggle-arrow">›</span>
      </button>

      {open && (
        <div className="panel-inner">
          {/* Tab switcher */}
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => onTabChange('tasks')}
            >
              Tasks
            </button>
            <button
              className={`panel-tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => onTabChange('notes')}
            >
              Notes
            </button>
          </div>

          {/* Content */}
          <div className="panel-content">
            {activeTab === 'tasks' ? (
              <TaskPanelContent
                tasks={props.tasks}
                tags={tags}
                onAddTask={props.onAddTask}
                onToggleTask={props.onToggleTask}
                onDeleteTask={props.onDeleteTask}
                onCreateTag={onCreateTag}
              />
            ) : (
              <NotesPanelContent
                notes={props.notes}
                tags={tags}
                onAddNote={props.onAddNote}
                onUpdateNote={props.onUpdateNote}
                onDeleteNote={props.onDeleteNote}
                onCreateTag={onCreateTag}
              />
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
