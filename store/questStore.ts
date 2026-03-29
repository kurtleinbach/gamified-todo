import { create } from 'zustand';
import { getDb } from '@/lib/database';
import type { Quest } from '@/types';
import { randomUUID } from 'expo-crypto';

interface QuestState {
  quests: Quest[];
  loadQuests: () => Promise<void>;
  generateDailyQuests: () => Promise<void>;
  incrementQuestProgress: (type: Quest['type'], amount?: number) => Promise<Quest | null>;
}

const TODAY = () => new Date().toISOString().split('T')[0];

const QUEST_TEMPLATES: Array<Omit<Quest, 'id' | 'progress' | 'isCompleted' | 'date'>> = [
  { title: 'Productive Morning',  description: 'Complete 2 tasks',                type: 'complete_tasks',    target: 2,  xpReward: 50,  coinsReward: 10 },
  { title: 'Task Crusher',        description: 'Complete 5 tasks today',           type: 'complete_tasks',    target: 5,  xpReward: 100, coinsReward: 20 },
  { title: 'High Priority',       description: 'Complete a High priority task',    type: 'complete_priority', target: 1,  xpReward: 75,  coinsReward: 15 },
  { title: 'Epic Slayer',         description: 'Complete an Epic task',            type: 'complete_priority', target: 1,  xpReward: 150, coinsReward: 30 },
  { title: 'Keep Momentum',       description: 'Complete 3 tasks',                 type: 'complete_tasks',    target: 3,  xpReward: 60,  coinsReward: 12 },
  { title: 'Streak Builder',      description: 'Complete at least 1 task today',   type: 'complete_tasks',    target: 1,  xpReward: 30,  coinsReward: 5  },
];

function pickDailyQuests(): Array<Omit<Quest, 'id' | 'progress' | 'isCompleted' | 'date'>> {
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],

  loadQuests: async () => {
    const db = await getDb();
    const today = TODAY();
    const rows = await db.getAllAsync(
      'SELECT * FROM quests WHERE date = ? ORDER BY rowid ASC',
      [today]
    ) as Record<string, unknown>[];

    if (rows.length === 0) {
      await get().generateDailyQuests();
      return;
    }

    set({
      quests: rows.map(r => ({
        id: r.id as string,
        title: r.title as string,
        description: r.description as string,
        type: r.type as Quest['type'],
        target: r.target as number,
        progress: r.progress as number,
        xpReward: r.xp_reward as number,
        coinsReward: r.coins_reward as number,
        isCompleted: Boolean(r.is_completed),
        date: r.date as string,
      })),
    });
  },

  generateDailyQuests: async () => {
    const db = await getDb();
    const today = TODAY();
    const templates = pickDailyQuests();
    const quests: Quest[] = templates.map(t => ({
      ...t,
      id: randomUUID(),
      progress: 0,
      isCompleted: false,
      date: today,
    }));

    for (const q of quests) {
      await db.runAsync(
        `INSERT OR IGNORE INTO quests (id, title, description, type, target, progress, xp_reward, coins_reward, is_completed, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [q.id, q.title, q.description, q.type, q.target, 0, q.xpReward, q.coinsReward, 0, today]
      );
    }
    set({ quests });
  },

  incrementQuestProgress: async (type, amount = 1) => {
    const db = await getDb();
    const { quests } = get();
    const activeQuest = quests.find(q => q.type === type && !q.isCompleted);
    if (!activeQuest) return null;

    const newProgress = Math.min(activeQuest.progress + amount, activeQuest.target);
    const completed = newProgress >= activeQuest.target;

    await db.runAsync(
      'UPDATE quests SET progress = ?, is_completed = ? WHERE id = ?',
      [newProgress, completed ? 1 : 0, activeQuest.id]
    );

    const updated = { ...activeQuest, progress: newProgress, isCompleted: completed };
    set({ quests: quests.map(q => q.id === activeQuest.id ? updated : q) });
    return completed ? updated : null;
  },
}));
