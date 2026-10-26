const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'vitalis.sqlite');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

let dbInstance = null;
let SQL = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('✅ Connected to existing SQLite database at', DB_FILE);
    } catch (err) {
      console.error('⚠️ Could not open existing DB file, creating a fresh one:', err.message);
      dbInstance = new SQL.Database();
    }
  } else {
    console.log('🆕 Creating fresh SQLite database file...');
    dbInstance = new SQL.Database();
  }

  // Ensure tables exist
  const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
  dbInstance.run(schemaSql);

  // Check if primary user Harshita exists; if not, seed!
  const userCheck = queryOne('SELECT id, name FROM users WHERE id = 1');
  if (!userCheck || userCheck.name !== 'Harshita') {
    const { seedData } = require('./seed');
    seedData(dbInstance);
    saveDB();
  }

  return dbInstance;
}

function saveDB() {
  if (!dbInstance) return;
  try {
    const binaryArray = dbInstance.export();
    const buffer = Buffer.from(binaryArray);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('❌ Error saving SQLite database to disk:', err);
  }
}

function sanitizeParams(params) {
  if (!Array.isArray(params)) return [];
  return params.map((p) => (p === undefined ? null : p));
}

function queryAll(sql, params = []) {
  if (!dbInstance) throw new Error('Database not initialized');
  const clean = sanitizeParams(params);
  const stmt = dbInstance.prepare(sql);
  stmt.bind(clean);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
  if (!dbInstance) throw new Error('Database not initialized');
  const clean = sanitizeParams(params);
  dbInstance.run(sql, clean);
  saveDB();
}

/**
 * Returns full composite health payload matching the frontend schema
 * for seamless integration with Vitalis frontend.
 */
function getFullHealthData(userId = 1) {
  const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]) || {
    id: 1,
    name: 'Harshita',
    age: 28,
    weight_kg: 62.5,
    height_cm: 168,
    blood_type: 'O+',
    sex: 'Female',
    activity_level: 'Moderate',
  };

  const goals = queryOne('SELECT * FROM user_goals WHERE user_id = ?', [userId]) || {
    water_ml: 2500,
    calories: 2100,
    protein_g: 140,
    carbs_g: 220,
    fat_g: 65,
    steps: 10000,
    sleep_hours: 8,
    active_minutes: 45,
  };

  const conditions = queryAll(
    'SELECT id, name, diagnosed_year as diagnosedYear, status, severity, physician_notes as physicianNotes FROM conditions WHERE user_id = ?',
    [userId]
  );
  const allergies = queryAll('SELECT id, allergen, severity, reaction FROM allergies WHERE user_id = ?', [userId]);
  const familyHistory = queryAll(
    'SELECT id, relation, condition, diagnosed_age as diagnosedAge, notes FROM family_history WHERE user_id = ?',
    [userId]
  );
  const surgeries = queryAll('SELECT id, procedure, year, hospital, notes FROM surgeries WHERE user_id = ?', [userId]);

  // Habits
  const waterLogs = queryAll(
    'SELECT id, time_str as time, amount_ml as amountMl FROM water_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [userId]
  );
  const totalWater = waterLogs.reduce((acc, log) => acc + (log.amountMl || 0), 0);

  const sleepRow = queryOne(
    'SELECT hours, bed_time as bedTime, wake_time as wakeTime, quality_score as qualityScore, quality_label as qualityLabel, deep_sleep_hours as deepSleepHours, rem_sleep_hours as remSleepHours FROM sleep_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [userId]
  ) || {
    hours: 7.75,
    bedTime: '11:15 PM',
    wakeTime: '07:00 AM',
    qualityScore: 88,
    qualityLabel: 'Rested & Restorative',
    deepSleepHours: 2.1,
    remSleepHours: 1.8,
  };

  const stepRow = queryOne(
    'SELECT current_steps as current, distance_km as distanceKm, calories_burned as caloriesBurned, hourly_distribution_json FROM step_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [userId]
  );
  let hourlyDistribution = [
    { hour: '8 AM', steps: 600 },
    { hour: '10 AM', steps: 1800 },
    { hour: '12 PM', steps: 1400 },
    { hour: '2 PM', steps: 900 },
    { hour: '4 PM', steps: 1520 },
    { hour: '6 PM', steps: 1200 },
  ];
  if (stepRow?.hourly_distribution_json) {
    try {
      hourlyDistribution = JSON.parse(stepRow.hourly_distribution_json);
    } catch (e) {}
  }

  const moodRow = queryOne(
    'SELECT current, emoji, score, note, time_str as time FROM mood_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [userId]
  ) || {
    current: 'Energetic',
    emoji: '⚡',
    score: 5,
    note: 'Energized morning with clear focus and high motivation.',
    time: '09:00 AM',
  };

  // Nutrition / Meals
  const meals = queryAll(
    'SELECT id, type, name, time_str as time, calories, protein_g as proteinG, carbs_g as carbsG, fat_g as fatG FROM meals WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  // Workouts
  const rawWorkouts = queryAll(
    'SELECT id, title, category, duration_minutes as durationMinutes, calories_burned as caloriesBurned, distance_km as distanceKm, notes, date_str as date, exercises_json FROM workouts WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  const workouts = rawWorkouts.map((w) => {
    let exercises = [];
    if (w.exercises_json) {
      try {
        exercises = JSON.parse(w.exercises_json);
      } catch (e) {}
    }
    return {
      id: w.id,
      title: w.title,
      category: w.category,
      durationMinutes: w.durationMinutes,
      caloriesBurned: w.caloriesBurned,
      distanceKm: w.distanceKm,
      notes: w.notes,
      date: w.date,
      exercises,
    };
  });

  // Vitals
  const bloodPressureLogs = queryAll(
    'SELECT id, systolic, diastolic, pulse, category, date_str as date FROM blood_pressure_logs WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  const heartRateLogs = queryAll(
    'SELECT id, bpm, type, date_str as date FROM heart_rate_logs WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  const bloodGlucoseLogs = queryAll(
    'SELECT id, level_mg_dl as levelMgDl, status, date_str as date FROM blood_glucose_logs WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  const medications = queryAll(
    'SELECT id, name, dosage, schedule, time_str as time, taken_today as takenToday, streak_days as streakDays FROM medications WHERE user_id = ?',
    [userId]
  ).map((m) => ({ ...m, takenToday: Boolean(m.takenToday) }));

  // Cycle
  const cycleSettings = queryOne('SELECT * FROM cycle_settings WHERE user_id = ?', [userId]) || {
    enabled: 1,
    average_cycle_days: 28,
    average_period_days: 5,
    last_period_start_date: '2026-10-06',
  };

  const symptomRows = queryAll(
    'SELECT id, date_str as date, cycle_day as cycleDay, flow, symptoms_json, mood, notes FROM cycle_symptoms WHERE user_id = ? ORDER BY cycle_day DESC',
    [userId]
  );
  const symptomLogs = symptomRows.map((s) => {
    let symptoms = [];
    if (s.symptoms_json) {
      try {
        symptoms = JSON.parse(s.symptoms_json);
      } catch (e) {}
    }
    return {
      id: s.id,
      date: s.date,
      cycleDay: s.cycleDay,
      flow: s.flow,
      symptoms,
      mood: s.mood,
      notes: s.notes,
    };
  });

  const pastCycles = queryAll(
    'SELECT id, start_date as startDate, end_date as endDate, cycle_length as cycleLength, period_days as periodDays FROM cycle_history WHERE user_id = ? ORDER BY id DESC',
    [userId]
  );

  return {
    profile: {
      name: user.name || 'Harshita',
      age: user.age || 28,
      weightKg: user.weight_kg || 62.5,
      heightCm: user.height_cm || 168,
      bloodType: user.blood_type || 'O+',
      sex: user.sex || 'Female',
      activityLevel: user.activity_level || 'Moderate',
      goals: {
        waterMl: goals.water_ml || 2500,
        calories: goals.calories || 2100,
        proteinG: goals.protein_g || 140,
        carbsG: goals.carbs_g || 220,
        fatG: goals.fat_g || 65,
        steps: goals.steps || 10000,
        sleepHours: goals.sleep_hours || 8,
        activeMinutes: goals.active_minutes || 45,
      },
      healthHistory: {
        conditions,
        allergies,
        familyHistory,
        surgeries,
      },
    },
    habits: {
      waterCurrentMl: totalWater > 0 ? totalWater : 1750,
      waterLogs: waterLogs.length > 0 ? waterLogs : [
        { id: 'w1', time: '08:00 AM', amountMl: 500 },
        { id: 'w2', time: '11:30 AM', amountMl: 500 },
        { id: 'w3', time: '02:15 PM', amountMl: 250 },
        { id: 'w4', time: '04:45 PM', amountMl: 500 },
      ],
      sleep: sleepRow,
      steps: {
        current: stepRow ? stepRow.current : 7420,
        distanceKm: stepRow ? stepRow.distanceKm : 5.6,
        caloriesBurned: stepRow ? stepRow.caloriesBurned : 325,
        hourlyDistribution,
      },
      mood: moodRow,
    },
    nutrition: {
      meals,
    },
    fitness: {
      weeklyStreak: 5,
      totalWorkoutsThisWeek: workouts.length,
      workouts,
    },
    vitals: {
      bloodPressureLogs,
      heartRateLogs,
      bloodGlucoseLogs,
      medications,
    },
    cycle: {
      enabled: Boolean(cycleSettings.enabled),
      averageCycleDays: cycleSettings.average_cycle_days || 28,
      averagePeriodDays: cycleSettings.average_period_days || 5,
      lastPeriodStartDate: cycleSettings.last_period_start_date || '2026-10-06',
      currentCycleDay: 14,
      currentPhase: 'Ovulation',
      phaseTitle: 'Ovulatory Phase (Peak Fertility)',
      daysUntilNextPeriod: 14,
      chanceOfPregnancy: 'High (Peak Fertility Window)',
      symptomLogs,
      pastCycles,
    },
  };
}

module.exports = {
  getDB,
  saveDB,
  queryAll,
  queryOne,
  run,
  getFullHealthData,
};
