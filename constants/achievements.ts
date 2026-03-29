export type AchievementId =
  | 'first_task'
  | 'tasks_10'
  | 'tasks_50'
  | 'tasks_100'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'first_epic'
  | 'epic_10'
  | 'level_5'
  | 'level_10'
  | 'level_15'
  | 'first_quest'
  | 'quests_10'
  | 'first_subtask'
  | 'coins_100'
  | 'coins_500';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinsReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_task',    title: 'First Steps',       description: 'Complete your first task',          icon: '⚡', xpReward: 25,  coinsReward: 5  },
  { id: 'tasks_10',      title: 'Getting Started',   description: 'Complete 10 tasks',                 icon: '🔥', xpReward: 50,  coinsReward: 10 },
  { id: 'tasks_50',      title: 'On a Roll',         description: 'Complete 50 tasks',                 icon: '💫', xpReward: 150, coinsReward: 30 },
  { id: 'tasks_100',     title: 'Centurion',         description: 'Complete 100 tasks',                icon: '🏆', xpReward: 500, coinsReward: 100},
  { id: 'streak_3',      title: 'Hat Trick',         description: 'Maintain a 3-day streak',           icon: '🌟', xpReward: 30,  coinsReward: 5  },
  { id: 'streak_7',      title: 'Week Warrior',      description: 'Maintain a 7-day streak',           icon: '⚔️', xpReward: 75,  coinsReward: 15 },
  { id: 'streak_14',     title: 'Fortnight Force',   description: 'Maintain a 14-day streak',          icon: '🛡️', xpReward: 200, coinsReward: 40 },
  { id: 'streak_30',     title: 'Monthly Master',    description: 'Maintain a 30-day streak',          icon: '👑', xpReward: 500, coinsReward: 100},
  { id: 'first_epic',    title: 'Epic Moment',       description: 'Complete your first Epic task',     icon: '💜', xpReward: 50,  coinsReward: 10 },
  { id: 'epic_10',       title: 'Epic Legend',       description: 'Complete 10 Epic tasks',            icon: '🌌', xpReward: 300, coinsReward: 60 },
  { id: 'level_5',       title: 'Rising Star',       description: 'Reach level 5',                     icon: '⭐', xpReward: 0,   coinsReward: 25 },
  { id: 'level_10',      title: 'Veteran Hero',      description: 'Reach level 10',                    icon: '🌠', xpReward: 0,   coinsReward: 100},
  { id: 'level_15',      title: 'Transcendent',      description: 'Reach the maximum level',           icon: '✨', xpReward: 0,   coinsReward: 500},
  { id: 'first_quest',   title: 'Quest Taker',       description: 'Complete your first daily quest',   icon: '📜', xpReward: 30,  coinsReward: 5  },
  { id: 'quests_10',     title: 'Quest Master',      description: 'Complete 10 daily quests',          icon: '🗺️', xpReward: 150, coinsReward: 30 },
  { id: 'first_subtask', title: 'Detail Oriented',   description: 'Complete a task with subtasks',     icon: '📋', xpReward: 20,  coinsReward: 3  },
  { id: 'coins_100',     title: 'Coin Collector',    description: 'Earn 100 total coins',              icon: '🪙', xpReward: 0,   coinsReward: 0  },
  { id: 'coins_500',     title: 'Treasure Hoarder',  description: 'Earn 500 total coins',              icon: '💰', xpReward: 0,   coinsReward: 0  },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.id, a])
) as Record<AchievementId, Achievement>;
