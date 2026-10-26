-- Vitalis Health SQLite Schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT 'Harshita',
  age INTEGER DEFAULT 28,
  weight_kg REAL DEFAULT 62.5,
  height_cm REAL DEFAULT 168,
  blood_type TEXT DEFAULT 'O+',
  sex TEXT DEFAULT 'Female',
  activity_level TEXT DEFAULT 'Moderate',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_goals (
  user_id INTEGER PRIMARY KEY,
  water_ml INTEGER DEFAULT 2500,
  calories INTEGER DEFAULT 2100,
  protein_g INTEGER DEFAULT 140,
  carbs_g INTEGER DEFAULT 220,
  fat_g INTEGER DEFAULT 65,
  steps INTEGER DEFAULT 10000,
  sleep_hours REAL DEFAULT 8.0,
  active_minutes INTEGER DEFAULT 45,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conditions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  diagnosed_year INTEGER,
  status TEXT,
  severity TEXT,
  physician_notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS allergies (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  allergen TEXT NOT NULL,
  severity TEXT,
  reaction TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_history (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  relation TEXT NOT NULL,
  condition TEXT NOT NULL,
  diagnosed_age INTEGER,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS surgeries (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  procedure TEXT NOT NULL,
  year INTEGER,
  hospital TEXT,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER NOT NULL,
  distance_km REAL,
  notes TEXT,
  date_str TEXT NOT NULL,
  exercises_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  time_str TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein_g INTEGER NOT NULL,
  carbs_g INTEGER NOT NULL,
  fat_g INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS water_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount_ml INTEGER NOT NULL,
  time_str TEXT NOT NULL,
  date_str TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sleep_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  hours REAL NOT NULL,
  bed_time TEXT,
  wake_time TEXT,
  quality_score INTEGER,
  quality_label TEXT,
  deep_sleep_hours REAL,
  rem_sleep_hours REAL,
  date_str TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS step_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  current_steps INTEGER DEFAULT 0,
  distance_km REAL DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  hourly_distribution_json TEXT,
  date_str TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mood_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  current TEXT NOT NULL,
  emoji TEXT,
  score INTEGER,
  note TEXT,
  time_str TEXT NOT NULL,
  date_str TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blood_pressure_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  pulse INTEGER NOT NULL,
  category TEXT NOT NULL,
  date_str TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS heart_rate_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  bpm INTEGER NOT NULL,
  type TEXT NOT NULL,
  date_str TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blood_glucose_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  level_mg_dl INTEGER NOT NULL,
  status TEXT NOT NULL,
  date_str TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  schedule TEXT NOT NULL,
  time_str TEXT NOT NULL,
  taken_today INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cycle_settings (
  user_id INTEGER PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1,
  average_cycle_days INTEGER NOT NULL DEFAULT 28,
  average_period_days INTEGER NOT NULL DEFAULT 5,
  last_period_start_date TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cycle_symptoms (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date_str TEXT NOT NULL,
  cycle_day INTEGER NOT NULL,
  flow TEXT NOT NULL,
  symptoms_json TEXT NOT NULL,
  mood TEXT,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cycle_history (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  cycle_length INTEGER NOT NULL,
  period_days INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
