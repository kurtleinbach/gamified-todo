import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('gamified-todo.db');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDb();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT DEFAULT '',
      due_date TEXT DEFAULT NULL,
      is_recurring INTEGER DEFAULT 0,
      recur_pattern TEXT DEFAULT NULL,
      is_archived INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      completed_at TEXT DEFAULT NULL,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      coins INTEGER DEFAULT 0,
      total_coins_earned INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_active_date TEXT DEFAULT NULL,
      tasks_completed INTEGER DEFAULT 0,
      epic_tasks_completed INTEGER DEFAULT 0,
      quests_completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      unlocked_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      target INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      xp_reward INTEGER NOT NULL,
      coins_reward INTEGER NOT NULL,
      is_completed INTEGER DEFAULT 0,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dev_log (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);

  // Ensure profile row exists
  await database.runAsync(
    `INSERT OR IGNORE INTO profile (id) VALUES (1)`
  );
}
