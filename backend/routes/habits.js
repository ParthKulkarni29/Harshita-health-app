const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/habits
router.get('/', (req, res) => {
  try {
    const full = db.getFullHealthData(1);
    res.json({ success: true, data: full.habits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/habits/water
router.post('/water', (req, res) => {
  try {
    const { amountMl } = req.body;
    const amount = parseInt(amountMl, 10);
    if (isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Valid amountMl is required' });
    }

    const id = `w_${Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (amount > 0) {
      db.run(
        `INSERT INTO water_logs (id, user_id, amount_ml, time_str, date_str)
         VALUES (?, 1, ?, ?, 'Today')`,
        [id, amount, timeStr]
      );
    } else if (amount < 0) {
      // Allow decreasing or subtracting if requested
      const latest = db.queryOne('SELECT id FROM water_logs WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1');
      if (latest) {
        db.run('DELETE FROM water_logs WHERE id = ?', [latest.id]);
      }
    }

    const full = db.getFullHealthData(1);
    res.json({
      success: true,
      message: 'Water log updated',
      data: full.habits,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/habits/sleep
router.post('/sleep', (req, res) => {
  try {
    const { hours, qualityScore, qualityLabel, bedTime, wakeTime } = req.body;
    const id = `sl_${Date.now()}`;
    const h = parseFloat(hours) || 8.0;
    const qs = parseInt(qualityScore, 10) || 85;
    const ql = qualityLabel || (qs >= 80 ? 'Rested & Restorative' : qs >= 60 ? 'Moderate Recovery' : 'Fragmented Sleep');

    db.run(
      `INSERT INTO sleep_logs (id, user_id, hours, bed_time, wake_time, quality_score, quality_label, deep_sleep_hours, rem_sleep_hours, date_str)
       VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, 'Today')`,
      [id, h, bedTime || '11:00 PM', wakeTime || '07:00 AM', qs, ql, +(h * 0.25).toFixed(1), +(h * 0.22).toFixed(1)]
    );

    const full = db.getFullHealthData(1);
    res.json({
      success: true,
      message: 'Sleep log saved',
      data: full.habits.sleep,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/habits/steps
router.post('/steps', (req, res) => {
  try {
    const { steps, distanceKm, caloriesBurned } = req.body;
    const s = parseInt(steps, 10) || 0;
    const d = distanceKm !== undefined ? parseFloat(distanceKm) : +(s * 0.00075).toFixed(2);
    const c = caloriesBurned !== undefined ? parseInt(caloriesBurned, 10) : Math.round(s * 0.04);

    const id = `st_${Date.now()}`;
    db.run(
      `INSERT INTO step_logs (id, user_id, current_steps, distance_km, calories_burned, date_str)
       VALUES (?, 1, ?, ?, ?, 'Today')`,
      [id, s, d, c]
    );

    const full = db.getFullHealthData(1);
    res.json({
      success: true,
      message: 'Steps updated',
      data: full.habits.steps,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/habits/mood
router.post('/mood', (req, res) => {
  try {
    const { name, emoji, score, note } = req.body;
    const id = `mo_${Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.run(
      `INSERT INTO mood_logs (id, user_id, current, emoji, score, note, time_str, date_str)
       VALUES (?, 1, ?, ?, ?, ?, ?, 'Today')`,
      [id, name || 'Content', emoji || '😊', parseInt(score, 10) || 4, note || '', timeStr]
    );

    const full = db.getFullHealthData(1);
    res.json({
      success: true,
      message: 'Mood recorded',
      data: full.habits.mood,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
