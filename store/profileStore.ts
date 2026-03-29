import { create } from 'zustand';
import { getDb } from '@/lib/database';
import { getLevelFromXP, getStreakMultiplier } from '@/constants/xp';
import { PriorityMeta } from '@/constants/theme';
import { ACHIEVEMENT_MAP, type AchievementId } from '@/constants/achievements';
import type { Profile, UnlockedAchievement, Priority } from '@/types';

interface ProfileState {
  profile: Profile;
  unlockedAchievements: UnlockedAchievement[];
  pendingAchievement: AchievementId | null;
  loadProfile: () => Promise<void>;
  awardXP: (priority: Priority, hasSubtasks: boolean) => Promise<{ xp: number; coins: number; leveledUp: boolean }>;
  checkAndUpdateStreak: () => Promise<void>;
  checkAchievements: () => Promise<void>;
  clearPendingAchievement: () => void;
  incrementQuestsCompleted: () => Promise<void>;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: {
    xp: 0, level: 1, coins: 0, totalCoinsEarned: 0,
    streak: 0, longestStreak: 0, lastActiveDate: null,
    tasksCompleted: 0, epicTasksCompleted: 0, questsCompleted: 0,
  },
  unlockedAchievements: [],
  pendingAchievement: null,

  loadProfile: async () => {
    const db = await getDb();
    const row = await db.getFirstAsync('SELECT * FROM profile WHERE id = 1') as Record<string, unknown> | null;
    const achRows = await db.getAllAsync('SELECT * FROM achievements') as Record<string, unknown>[];
    if (row) {
      set({
        profile: {
          xp: (row.xp as number) ?? 0,
          level: (row.level as number) ?? 1,
          coins: (row.coins as number) ?? 0,
          totalCoinsEarned: (row.total_coins_earned as number) ?? 0,
          streak: (row.streak as number) ?? 0,
          longestStreak: (row.longest_streak as number) ?? 0,
          lastActiveDate: (row.last_active_date as string) ?? null,
          tasksCompleted: (row.tasks_completed as number) ?? 0,
          epicTasksCompleted: (row.epic_tasks_completed as number) ?? 0,
          questsCompleted: (row.quests_completed as number) ?? 0,
        },
        unlockedAchievements: achRows.map(r => ({
          id: r.id as string,
          unlockedAt: r.unlocked_at as string,
        })),
      });
    }
  },

  awardXP: async (priority, hasSubtasks) => {
    const db = await getDb();
    const { profile } = get();
    const meta = PriorityMeta[priority];
    const multiplier = getStreakMultiplier(profile.streak);
    const subtaskBonus = hasSubtasks ? 10 : 0;
    const xpEarned = Math.round((meta.xp + subtaskBonus) * multiplier);
    const coinsEarned = meta.coins;

    const newXP = profile.xp + xpEarned;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > profile.level;
    const newCoins = profile.coins + coinsEarned;
    const newTotalCoins = profile.totalCoinsEarned + coinsEarned;
    const newTasksCompleted = profile.tasksCompleted + 1;
    const newEpicCompleted = priority === 'epic' ? profile.epicTasksCompleted + 1 : profile.epicTasksCompleted;

    await db.runAsync(
      `UPDATE profile SET xp = ?, level = ?, coins = ?, total_coins_earned = ?,
       tasks_completed = ?, epic_tasks_completed = ? WHERE id = 1`,
      [newXP, newLevel, newCoins, newTotalCoins, newTasksCompleted, newEpicCompleted]
    );

    set({
      profile: {
        ...profile,
        xp: newXP, level: newLevel, coins: newCoins,
        totalCoinsEarned: newTotalCoins,
        tasksCompleted: newTasksCompleted,
        epicTasksCompleted: newEpicCompleted,
      },
    });

    await get().checkAchievements();
    return { xp: xpEarned, coins: coinsEarned, leveledUp };
  },

  checkAndUpdateStreak: async () => {
    const db = await getDb();
    const { profile } = get();
    const today = new Date();
    const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;

    let newStreak = profile.streak;
    if (!lastActive || (!isSameDay(lastActive, today) && !isYesterday(lastActive, today))) {
      newStreak = 1;
    } else if (isYesterday(lastActive, today)) {
      newStreak = profile.streak + 1;
    }

    const newLongest = Math.max(newStreak, profile.longestStreak);
    const todayStr = today.toISOString();

    await db.runAsync(
      'UPDATE profile SET streak = ?, longest_streak = ?, last_active_date = ? WHERE id = 1',
      [newStreak, newLongest, todayStr]
    );
    set({ profile: { ...profile, streak: newStreak, longestStreak: newLongest, lastActiveDate: todayStr } });
    await get().checkAchievements();
  },

  checkAchievements: async () => {
    const db = await getDb();
    const { profile, unlockedAchievements } = get();
    const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

    const toCheck: Array<{ id: AchievementId; condition: boolean }> = [
      { id: 'first_task',    condition: profile.tasksCompleted >= 1 },
      { id: 'tasks_10',      condition: profile.tasksCompleted >= 10 },
      { id: 'tasks_50',      condition: profile.tasksCompleted >= 50 },
      { id: 'tasks_100',     condition: profile.tasksCompleted >= 100 },
      { id: 'streak_3',      condition: profile.streak >= 3 },
      { id: 'streak_7',      condition: profile.streak >= 7 },
      { id: 'streak_14',     condition: profile.streak >= 14 },
      { id: 'streak_30',     condition: profile.streak >= 30 },
      { id: 'first_epic',    condition: profile.epicTasksCompleted >= 1 },
      { id: 'epic_10',       condition: profile.epicTasksCompleted >= 10 },
      { id: 'level_5',       condition: profile.level >= 5 },
      { id: 'level_10',      condition: profile.level >= 10 },
      { id: 'level_15',      condition: profile.level >= 15 },
      { id: 'quests_10',     condition: profile.questsCompleted >= 10 },
      { id: 'coins_100',     condition: profile.totalCoinsEarned >= 100 },
      { id: 'coins_500',     condition: profile.totalCoinsEarned >= 500 },
    ];

    for (const { id, condition } of toCheck) {
      if (condition && !unlockedIds.has(id)) {
        const now = new Date().toISOString();
        await db.runAsync('INSERT OR IGNORE INTO achievements (id, unlocked_at) VALUES (?, ?)', [id, now]);
        const reward = ACHIEVEMENT_MAP[id];
        if (reward.xpReward > 0 || reward.coinsReward > 0) {
          const { profile: p } = get();
          const newXP = p.xp + reward.xpReward;
          const newCoins = p.coins + reward.coinsReward;
          await db.runAsync('UPDATE profile SET xp = ?, coins = ? WHERE id = 1', [newXP, newCoins]);
          set(state => ({ profile: { ...state.profile, xp: newXP, coins: newCoins } }));
        }
        set(state => ({
          unlockedAchievements: [...state.unlockedAchievements, { id, unlockedAt: now }],
          pendingAchievement: id,
        }));
        unlockedIds.add(id);
      }
    }
  },

  clearPendingAchievement: () => set({ pendingAchievement: null }),

  incrementQuestsCompleted: async () => {
    const db = await getDb();
    const { profile } = get();
    const newCount = profile.questsCompleted + 1;
    await db.runAsync('UPDATE profile SET quests_completed = ? WHERE id = 1', [newCount]);
    set({ profile: { ...profile, questsCompleted: newCount } });

    if (newCount === 1) {
      const now = new Date().toISOString();
      await db.runAsync('INSERT OR IGNORE INTO achievements (id, unlocked_at) VALUES (?, ?)', ['first_quest', now]);
      set(state => ({
        unlockedAchievements: [...state.unlockedAchievements, { id: 'first_quest', unlockedAt: now }],
        pendingAchievement: 'first_quest',
      }));
    }
  },
}));
