import { create } from 'zustand';
import { getDb } from '@/lib/database';
import type { DevLogEntry, DevLogType } from '@/types';
import { randomUUID } from 'expo-crypto';

interface DevLogState {
  entries: DevLogEntry[];
  isOpen: boolean;
  loadEntries: () => Promise<void>;
  addEntry: (type: DevLogType, title: string, description: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  openLog: () => void;
  closeLog: () => void;
  formatEntryForClaude: (entry: DevLogEntry) => string;
  formatAllForClaude: () => string;
}

const TYPE_LABELS: Record<DevLogType, string> = {
  feature: 'Feature Request',
  bug: 'Bug Report',
  improvement: 'Improvement',
  note: 'Note',
};

export const useDevLogStore = create<DevLogState>((set, get) => ({
  entries: [],
  isOpen: false,

  loadEntries: async () => {
    const db = await getDb();
    const rows = await db.getAllAsync('SELECT * FROM dev_log ORDER BY created_at DESC') as Record<string, unknown>[];
    set({
      entries: rows.map(r => ({
        id: r.id as string,
        type: r.type as DevLogType,
        title: r.title as string,
        description: r.description as string,
        createdAt: r.created_at as string,
      })),
    });
  },

  addEntry: async (type, title, description) => {
    const db = await getDb();
    const id = randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO dev_log (id, type, title, description, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, type, title, description, now]
    );
    const entry: DevLogEntry = { id, type, title, description, createdAt: now };
    set(state => ({ entries: [entry, ...state.entries] }));
  },

  deleteEntry: async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM dev_log WHERE id = ?', [id]);
    set(state => ({ entries: state.entries.filter(e => e.id !== id) }));
  },

  openLog: () => set({ isOpen: true }),
  closeLog: () => set({ isOpen: false }),

  formatEntryForClaude: (entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString();
    return [
      `[${TYPE_LABELS[entry.type]}] ${entry.title}`,
      `Logged: ${date}`,
      entry.description ? `Description: ${entry.description}` : null,
      ``,
      `Please address this in the gamified-todo app at D:\\Projects\\gamified-todo (GitHub: https://github.com/kurtleinbach/gamified-todo).`,
    ].filter(Boolean).join('\n');
  },

  formatAllForClaude: () => {
    const { entries } = get();
    if (entries.length === 0) return '';
    const header = `Gamified Todo — Dev Log (${entries.length} item${entries.length > 1 ? 's' : ''})\nApp: D:\\Projects\\gamified-todo\nGitHub: https://github.com/kurtleinbach/gamified-todo\n\n`;
    return header + entries.map((e, i) => {
      const date = new Date(e.createdAt).toLocaleDateString();
      return [
        `--- ${i + 1}. [${TYPE_LABELS[e.type]}] ${e.title} (${date}) ---`,
        e.description || '(no description)',
      ].join('\n');
    }).join('\n\n');
  },
}));
