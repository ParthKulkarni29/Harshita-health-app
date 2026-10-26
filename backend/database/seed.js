/**
 * Seed data for Vitalis Health Tracker
 * Primary User: Harshita
 */
function seedData(db) {
  console.log('🌱 Seeding database for primary user: Harshita...');

  // Clear existing records
  const tables = [
    'users', 'user_goals', 'conditions', 'allergies', 'family_history',
    'surgeries', 'workouts', 'meals', 'water_logs', 'sleep_logs',
    'step_logs', 'mood_logs', 'blood_pressure_logs', 'heart_rate_logs',
    'blood_glucose_logs', 'medications', 'cycle_settings', 'cycle_symptoms', 'cycle_history'
  ];

  tables.forEach((table) => {
    try {
      db.run(`DELETE FROM ${table}`);
    } catch (e) {}
  });

  // 1. Primary User: Harshita
  db.run(
    `INSERT INTO users (id, name, age, weight_kg, height_cm, blood_type, sex, activity_level)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 'Harshita', 28, 62.5, 168, 'O+', 'Female', 'Moderate']
  );

  // 2. User Goals
  db.run(
    `INSERT INTO user_goals (user_id, water_ml, calories, protein_g, carbs_g, fat_g, steps, sleep_hours, active_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 2500, 2100, 140, 220, 65, 10000, 8.0, 45]
  );

  // 3. Clinical Conditions
  db.run(
    `INSERT INTO conditions (id, user_id, name, diagnosed_year, status, severity, physician_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'c1', 1, 'Mild Hypertension', 2023, 'Active (Lifestyle & Diet)', 'Mild',
      'Maintain low dietary sodium (<2000mg/d), regular aerobic exercise, and weekly BP tracking.'
    ]
  );
  db.run(
    `INSERT INTO conditions (id, user_id, name, diagnosed_year, status, severity, physician_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'c2', 1, 'Meniscus Strain (Left Knee)', 2022, 'Recovered / Caution', 'Moderate',
      'Avoid high-impact plyometrics or deep loaded squats beyond 90 degrees. Prioritize quad and hamstring stability.'
    ]
  );

  // 4. Allergies
  db.run(
    `INSERT INTO allergies (id, user_id, allergen, severity, reaction)
     VALUES (?, ?, ?, ?, ?)`,
    ['a1', 1, 'Lactose & Dairy', 'Moderate', 'Gastrointestinal bloating and distress']
  );
  db.run(
    `INSERT INTO allergies (id, user_id, allergen, severity, reaction)
     VALUES (?, ?, ?, ?, ?)`,
    ['a2', 1, 'Penicillin', 'Severe', 'Anaphylaxis / Hives (Emergency medical flag)']
  );

  // 5. Family Medical History
  db.run(
    `INSERT INTO family_history (id, user_id, relation, condition, diagnosed_age, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['f1', 1, 'Father', 'Type 2 Diabetes', 52, 'Regular glucose and HbA1c screening advised annually.']
  );
  db.run(
    `INSERT INTO family_history (id, user_id, relation, condition, diagnosed_age, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['f2', 1, 'Maternal Grandfather', 'Cardiovascular Disease / CAD', 64, 'Focus on lipid panel and cardiovascular endurance.']
  );

  // 6. Past Surgeries
  db.run(
    `INSERT INTO surgeries (id, user_id, procedure, year, hospital, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['s1', 1, 'Knee Arthroscopic Debridement', 2022, 'City Orthopedic Specialty Center', 'Followed by 12 weeks of physical therapy.']
  );

  // 7. Workouts
  const exercisesF1 = JSON.stringify([
    { name: 'Barbell Bench Press', sets: 4, reps: '8-10', weightKg: 75 },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', weightKg: 24 },
    { name: 'Seated Cable Rows', sets: 4, reps: '10-12', weightKg: 65 },
    { name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', weightKg: 22 },
  ]);

  db.run(
    `INSERT INTO workouts (id, user_id, title, category, duration_minutes, calories_burned, distance_km, notes, date_str, exercises_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['f1', 1, 'Upper Body Hypertrophy', 'Strength', 48, 340, null, 'Progressive overload chest & back. Smooth cadence.', 'Today, 07:30 AM', exercisesF1]
  );
  db.run(
    `INSERT INTO workouts (id, user_id, title, category, duration_minutes, calories_burned, distance_km, notes, date_str, exercises_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['f2', 1, 'Low-Impact Cycling Endurance', 'Cycling', 35, 290, 12.4, 'Low knee strain, kept cadence smooth at 85 rpm.', 'Yesterday, 06:45 PM', null]
  );
  db.run(
    `INSERT INTO workouts (id, user_id, title, category, duration_minutes, calories_burned, distance_km, notes, date_str, exercises_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['f3', 1, 'Full Body Mobility & Vinyasa Flow', 'Yoga', 25, 95, null, 'Gentle on joints, focused on thoracic spine and hamstring flexibility.', '2 days ago', null]
  );

  // 8. Meals
  db.run(
    `INSERT INTO meals (id, user_id, type, name, time_str, calories, protein_g, carbs_g, fat_g)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['m1', 1, 'Breakfast', 'Oatmeal Bowl with Berries & Plant Protein', '08:30 AM', 460, 34, 62, 8]
  );
  db.run(
    `INSERT INTO meals (id, user_id, type, name, time_str, calories, protein_g, carbs_g, fat_g)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['m2', 1, 'Lunch', 'Grilled Chicken Breast & Quinoa Salad', '01:00 PM', 620, 52, 48, 16]
  );
  db.run(
    `INSERT INTO meals (id, user_id, type, name, time_str, calories, protein_g, carbs_g, fat_g)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['m3', 1, 'Snack', 'Almond Milk Chia Pudding with Walnuts', '04:30 PM', 230, 14, 18, 12]
  );

  // 9. Water Logs
  db.run(
    `INSERT INTO water_logs (id, user_id, amount_ml, time_str, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['w1', 1, 500, '08:00 AM', 'Today']
  );
  db.run(
    `INSERT INTO water_logs (id, user_id, amount_ml, time_str, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['w2', 1, 500, '11:30 AM', 'Today']
  );
  db.run(
    `INSERT INTO water_logs (id, user_id, amount_ml, time_str, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['w3', 1, 250, '02:15 PM', 'Today']
  );
  db.run(
    `INSERT INTO water_logs (id, user_id, amount_ml, time_str, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['w4', 1, 500, '04:45 PM', 'Today']
  );

  // 10. Sleep Logs
  db.run(
    `INSERT INTO sleep_logs (id, user_id, hours, bed_time, wake_time, quality_score, quality_label, deep_sleep_hours, rem_sleep_hours, date_str)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sl1', 1, 7.75, '11:15 PM', '07:00 AM', 88, 'Rested & Restorative', 2.1, 1.8, 'Today']
  );

  // 11. Step Logs
  const hourlySteps = JSON.stringify([
    { hour: '8 AM', steps: 600 },
    { hour: '10 AM', steps: 1800 },
    { hour: '12 PM', steps: 1400 },
    { hour: '2 PM', steps: 900 },
    { hour: '4 PM', steps: 1520 },
    { hour: '6 PM', steps: 1200 },
  ]);
  db.run(
    `INSERT INTO step_logs (id, user_id, current_steps, distance_km, calories_burned, hourly_distribution_json, date_str)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['st1', 1, 7420, 5.6, 325, hourlySteps, 'Today']
  );

  // 12. Mood Logs
  db.run(
    `INSERT INTO mood_logs (id, user_id, current, emoji, score, note, time_str, date_str)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['mo1', 1, 'Energetic', '⚡', 5, 'Energized morning with clear focus and high motivation.', '09:00 AM', 'Today']
  );

  // 13. Blood Pressure
  db.run(
    `INSERT INTO blood_pressure_logs (id, user_id, systolic, diastolic, pulse, category, date_str)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['bp1', 1, 118, 76, 68, 'Normal', 'Today, 08:15 AM']
  );
  db.run(
    `INSERT INTO blood_pressure_logs (id, user_id, systolic, diastolic, pulse, category, date_str)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['bp2', 1, 122, 80, 72, 'Normal', 'Yesterday, 08:30 AM']
  );
  db.run(
    `INSERT INTO blood_pressure_logs (id, user_id, systolic, diastolic, pulse, category, date_str)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['bp3', 1, 120, 78, 70, 'Normal', 'Oct 16, 08:10 AM']
  );

  // 14. Heart Rate
  db.run(
    `INSERT INTO heart_rate_logs (id, user_id, bpm, type, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['hr1', 1, 64, 'Resting', 'Today, 07:15 AM']
  );
  db.run(
    `INSERT INTO heart_rate_logs (id, user_id, bpm, type, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['hr2', 1, 154, 'Peak Cardio', 'Today, 08:05 AM']
  );
  db.run(
    `INSERT INTO heart_rate_logs (id, user_id, bpm, type, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['hr3', 1, 72, 'Current', 'Today, 05:00 PM']
  );

  // 15. Blood Glucose
  db.run(
    `INSERT INTO blood_glucose_logs (id, user_id, level_mg_dl, status, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['bg1', 1, 92, 'Fasting', 'Today, 07:30 AM']
  );
  db.run(
    `INSERT INTO blood_glucose_logs (id, user_id, level_mg_dl, status, date_str)
     VALUES (?, ?, ?, ?, ?)`,
    ['bg2', 1, 126, '2h Post-Lunch', 'Today, 03:00 PM']
  );

  // 16. Medications
  db.run(
    `INSERT INTO medications (id, user_id, name, dosage, schedule, time_str, taken_today, streak_days)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['med1', 1, 'Vitamin D3 + K2', '2,000 IU', 'Daily with breakfast', '08:30 AM', 1, 14]
  );
  db.run(
    `INSERT INTO medications (id, user_id, name, dosage, schedule, time_str, taken_today, streak_days)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['med2', 1, 'CoQ10 & Omega-3', '1,000 mg', 'Daily with lunch (Cardio support)', '01:00 PM', 1, 22]
  );
  db.run(
    `INSERT INTO medications (id, user_id, name, dosage, schedule, time_str, taken_today, streak_days)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['med3', 1, 'Magnesium Glycinate', '200 mg', 'Daily before bed (BP & Sleep relaxant)', '09:45 PM', 0, 9]
  );

  // 17. Menstrual Cycle Settings
  db.run(
    `INSERT INTO cycle_settings (user_id, enabled, average_cycle_days, average_period_days, last_period_start_date)
     VALUES (?, ?, ?, ?, ?)`,
    [1, 1, 28, 5, '2026-10-06']
  );

  // 18. Cycle Symptoms
  const cs1 = JSON.stringify(['Mild Ovulation Cramp', 'High Energy', 'Good Mood']);
  const cs2 = JSON.stringify(['Abdominal Cramps', 'Tiredness']);
  const cs3 = JSON.stringify(['Cramps', 'Headache', 'Backache']);

  db.run(
    `INSERT INTO cycle_symptoms (id, user_id, date_str, cycle_day, flow, symptoms_json, mood, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cs1', 1, 'Today, Oct 19', 14, 'None', cs1, 'Confident & Focused', 'Noticeable energy surge, had a great upper body strength session.']
  );
  db.run(
    `INSERT INTO cycle_symptoms (id, user_id, date_str, cycle_day, flow, symptoms_json, mood, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cs2', 1, 'Oct 08', 3, 'Light', cs2, 'Sensitive', 'Rested well, took magnesium and chamomile tea.']
  );
  db.run(
    `INSERT INTO cycle_symptoms (id, user_id, date_str, cycle_day, flow, symptoms_json, mood, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['cs3', 1, 'Oct 06', 1, 'Heavy', cs3, 'Low Energy', 'First day of period. Kept workout to gentle mobility walking.']
  );

  // 19. Past Cycles
  db.run(
    `INSERT INTO cycle_history (id, user_id, start_date, end_date, cycle_length, period_days)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['pc1', 1, 'Sep 08, 2026', 'Sep 13, 2026', 28, 5]
  );
  db.run(
    `INSERT INTO cycle_history (id, user_id, start_date, end_date, cycle_length, period_days)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['pc2', 1, 'Aug 11, 2026', 'Aug 16, 2026', 28, 5]
  );
  db.run(
    `INSERT INTO cycle_history (id, user_id, start_date, end_date, cycle_length, period_days)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['pc3', 1, 'Jul 14, 2026', 'Jul 19, 2026', 29, 5]
  );

  console.log('✅ Successfully seeded Harshita’s profile and records.');
}

module.exports = { seedData };
