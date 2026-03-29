import { create } from 'zustand';
import { getDb } from '@/lib/database';
import type { Task, Subtask, Priority } from '@/types';

interface ArchiveFilters {
  search: string;
  priority: Priority | 'all';
  category: string;
  dateFrom: string | null;
  dateTo: string | null;
}

interface ArchiveState {
  archivedTasks: Task[];
  filters: ArchiveFilters;
  loading: boolean;
  loadArchive: () => Promise<void>;
  setFilters: (filters: Partial<ArchiveFilters>) => void;
  filteredTasks: () => Task[];
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
    recurPattern: null,
    isArchived: true,
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

const defaultFilters: ArchiveFilters = {
  search: '',
  priority: 'all',
  category: '',
  dateFrom: null,
  dateTo: null,
};

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  archivedTasks: [],
  filters: defaultFilters,
  loading: false,

  loadArchive: async () => {
    set({ loading: true });
    const db = await getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM tasks WHERE is_archived = 1 ORDER BY completed_at DESC'
    ) as Record<string, unknown>[];
    const subtaskRows = await db.getAllAsync('SELECT * FROM subtasks ORDER BY sort_order ASC') as Record<string, unknown>[];
    const subtaskMap: Record<string, Subtask[]> = {};
    for (const s of subtaskRows) {
      const sub = rowToSubtask(s);
      if (!subtaskMap[sub.taskId]) subtaskMap[sub.taskId] = [];
      subtaskMap[sub.taskId].push(sub);
    }
    const archivedTasks = rows.map(r => rowToTask(r, subtaskMap[r.id as string] ?? []));
    set({ archivedTasks, loading: false });
  },

  setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),

  filteredTasks: () => {
    const { archivedTasks, filters } = get();
    return archivedTasks.filter(t => {
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (filters.category && !t.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
      if (filters.dateFrom && t.completedAt && t.completedAt < filters.dateFrom) return false;
      if (filters.dateTo && t.completedAt && t.completedAt > filters.dateTo + 'T23:59:59') return false;
      return true;
    });
  },
}));
