// XP required to reach each level (cumulative)
export const LEVEL_THRESHOLDS: number[] = [
  0,    // level 1
  100,  // level 2
  250,  // level 3
  500,  // level 4
  900,  // level 5
  1400, // level 6
  2100, // level 7
  3000, // level 8
  4200, // level 9
  5700, // level 10
  7500, // level 11
  9600, // level 12
  12000,// level 13
  14800,// level 14
  18000,// level 15
];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getXPForNextLevel(xp: number): { current: number; required: number; level: number } {
  const level = getLevelFromXP(xp);
  if (level >= MAX_LEVEL) return { current: xp, required: xp, level };
  const base = LEVEL_THRESHOLDS[level - 1];
  const next = LEVEL_THRESHOLDS[level];
  return { current: xp - base, required: next - base, level };
}

export const STREAK_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  3: 1.1,
  7: 1.25,
  14: 1.5,
  30: 2.0,
};

export function getStreakMultiplier(streak: number): number {
  let mult = 1.0;
  for (const [days, m] of Object.entries(STREAK_MULTIPLIERS)) {
    if (streak >= Number(days)) mult = m;
  }
  return mult;
}

export const LEVEL_TITLES: Record<number, string> = {
  1:  'Novice',
  2:  'Apprentice',
  3:  'Journeyman',
  4:  'Adept',
  5:  'Expert',
  6:  'Veteran',
  7:  'Elite',
  8:  'Master',
  9:  'Grandmaster',
  10: 'Legend',
  11: 'Mythic',
  12: 'Ascendant',
  13: 'Immortal',
  14: 'Divine',
  15: 'Transcendent',
};
