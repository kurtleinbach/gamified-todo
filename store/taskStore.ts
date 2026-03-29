import { create } from 'zustand';
import { getDb } from '@/lib/database';
import type { Task, Subtask, Priority, RecurPattern } from '@/types';
import { randomUUID } from 'expo-crypto';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  loadTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'subtasks'>>) => Promise<void>;
  completeTask: (id: string) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<Subtask>;
  updateSubtask: (id: string, updates: Partial<Pick<Subtask, 'title' | 'isCompleted'>>) => Promise<void>;
  deleteSubtask: (id: string) => Promise<void>;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  category?: string;
  dueDate?: string | null;
  isRecurring?: boolean;
  recurPattern?: RecurPattern;
  notes?: string;
}

function rowToTask(row: Record<string, unknown>, subtasks: Subtask[]): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    priority: (row.priority as Priority) ?? 'medium',
    category: (row.category as string) ?? '',
    dueDate: (row.due_date as string) ?? null,
    isRecurring: Boolean(row.is_recurring),
    recurPattern: (row.recur_pattern as RecurPattern) ?? null,
    isArchived: Boolean(row.is_archived),
    isCompleted: Boolean(row.is_completed),
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string) ?? null,
    notes: (row.notes as string) ?? '',
    subtasks,
  };
}

function rowToSubtask(row: Record<string, unknown>): Subtask {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    title: row.title as string,
    isCompleted: Boolean(row.is_completed),
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  loadTasks: async () => {
    set({ loading: true });
    const db = await getDb();
    const rows = await db.getAllAsync('SELECT * FROM tasks WHERE is_archived = 0 ORDER BY created_at DESC') as Record<string, unknown>[];
    const subtaskRows = await db.getAllAsync('SELECT * FROM subtasks ORDER BY sort_order ASC') as Record<string, unknown>[];
    const subtaskMap: Record<string, Subtask[]> = {};
    for (const s of subtaskRows) {
      const sub = rowToSubtask(s);
      if (!subtaskMap[sub.taskId]) subtaskMap[sub.taskId] = [];
      subtaskMap[sub.taskId].push(sub);
    }
    const tasks = rows.map(r => rowToTask(r, subtaskMap[r.id as string] ?? []));
    set({ tasks, loading: false });
  },

  addTask: async (input) => {
    const db = await getDb();
    const id = randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO tasks (id, title, description, priority, category, due_date, is_recurring, recur_pattern, created_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.title, input.description ?? '', input.priority ?? 'medium',
       input.category ?? '', input.dueDate ?? null,
       input.isRecurring ? 1 : 0, input.recurPattern ?? null, now, input.notes ?? '']
    );
    const task: Task = {
      id, title: input.title, description: input.description ?? '',
      priority: input.priority ?? 'medium', category: input.category ?? '',
      dueDate: input.dueDate ?? null, isRecurring: input.isRecurring ?? false,
      recurPattern: input.recurPattern ?? null, isArchived: false,
      isCompleted: false, createdAt: now, completedAt: null,
      notes: input.notes ?? '', subtasks: [],
    };
    set(state => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: async (id, updates) => {
    const db = await getDb();
    const fields = Object.entries({
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      category: updates.category,
      due_date: updates.dueDate,
      is_recurring: updates.isRecurring !== undefined ? (updates.isRecurring ? 1 : 0) : undefined,
      recur_pattern: updates.recurPattern,
      notes: updates.notes,
    }).filter(([, v]) => v !== undefined);

    if (fields.length === 0) return;
    const setClauses = fields.map(([k]) => `${k} = ?`).join(', ');
    const values = fields.map(([, v]) => v as string | number | null);
    await db.runAsync(`UPDATE tasks SET ${setClauses} WHERE id = ?`, [...values, id]);

    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  },

  completeTask: async (id) => {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE tasks SET is_completed = 1, is_archived = 1, completed_at = ? WHERE id = ?',
      [now, id]
    );
    const task = get().tasks.find(t => t.id === id) ?? null;
    if (task) {
      const completed = { ...task, isCompleted: true, isArchived: true, completedAt: now };
      set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
      return completed;
    }
    return null;
  },

  deleteTask: async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
  },

  addSubtask: async (taskId, title) => {
    const db = await getDb();
    const id = randomUUID();
    const existing = get().tasks.find(t => t.id === taskId)?.subtasks ?? [];
    const sortOrder = existing.length;
    await db.runAsync(
      'INSERT INTO subtasks (id, task_id, title, sort_order) VALUES (?, ?, ?, ?)',
      [id, taskId, title, sortOrder]
    );
    const subtask: Subtask = { id, taskId, title, isCompleted: false, sortOrder };
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
      ),
    }));
    return subtask;
  },

  updateSubtask: async (id, updates) => {
    const db = await getDb();
    if (updates.title !== undefined)
      await db.runAsync('UPDATE subtasks SET title = ? WHERE id = ?', [updates.title, id]);
    if (updates.isCompleted !== undefined)
      await db.runAsync('UPDATE subtasks SET is_completed = ? WHERE id = ?', [updates.isCompleted ? 1 : 0, id]);

    set(state => ({
      tasks: state.tasks.map(t => ({
        ...t,
        subtasks: t.subtasks.map(s => s.id === id ? { ...s, ...updates } : s),
      })),
    }));
  },

  deleteSubtask: async (id) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM subtasks WHERE id = ?', [id]);
    set(state => ({
      tasks: state.tasks.map(t => ({
        ...t,
        subtasks: t.subtasks.filter(s => s.id !== id),
      })),
    }));
  },
}));
