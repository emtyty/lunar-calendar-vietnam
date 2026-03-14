import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { UserNote } from '../types';

function loadNotes(): UserNote[] {
  try {
    const raw = localStorage.getItem('userNotes');
    return raw ? (JSON.parse(raw) as UserNote[]) : [];
  } catch {
    return [];
  }
}

/**
 * Manages user notes persisted to localStorage.
 * Scopes selectedDateNotes to the currently selected calendar date.
 */
export function useNotes(selectedDate: Date) {
  const [notes, setNotes] = useState<UserNote[]>(loadNotes);
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('userNotes', JSON.stringify(notes));
    } catch {
      // Storage quota exceeded — silently ignore
    }
  }, [notes]);

  const selectedDateNotes = useMemo(() => {
    const key = format(selectedDate, 'yyyy-MM-dd');
    return notes.filter(n => n.date === key);
  }, [notes, selectedDate]);

  const addNote = () => {
    const content = newNoteContent.trim();
    if (!content) return;
    const note: UserNote = {
      id: crypto.randomUUID(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      content,
      createdAt: Date.now(),
    };
    setNotes(prev => [...prev, note]);
    setNewNoteContent('');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return { notes, selectedDateNotes, newNoteContent, setNewNoteContent, addNote, deleteNote };
}
