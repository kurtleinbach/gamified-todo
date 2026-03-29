export type Priority = 'low' | 'medium' | 'high' | 'epic';
export type RecurPattern = 'daily' | 'weekly' | 'monthly' | null;

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string | null;
  isRecurring: boolean;
  recurPattern: RecurPattern;
  isArchived: boolean;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
  notes: string;
  subtasks: Subtask[];
}

export interface Profile {
  xp: number;
  level: number;
  coins: number;
  totalCoinsEarned: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  tasksCompleted: number;
  epicTasksCompleted: number;
  questsCompleted: number;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'complete_tasks' | 'complete_priority' | 'complete_category' | 'streak';
  target: number;
  progress: number;
  xpReward: number;
  coinsReward: number;
  isCompleted: boolean;
  date: string;
}

export type DevLogType = 'feature' | 'bug' | 'improvement' | 'note';

export interface DevLogEntry {
  id: string;
  type: DevLogType;
  title: string;
  description: string;
  createdAt: string;
}
