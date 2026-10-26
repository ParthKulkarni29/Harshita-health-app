const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/workouts
router.get('/', (req, res) => {
  try {
    const rawWorkouts = db.queryAll(
      `SELECT id, title, category, duration_minutes as durationMinutes,
              calories_burned as caloriesBurned, distance_km as distanceKm,
              notes, date_str as date, exercises_json, created_at as createdAt
       FROM workouts
       WHERE user_id = 1
       ORDER BY created_at DESC`
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
        createdAt: w.createdAt,
      };
    });

    const totalMinutes = workouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);
    const totalCalories = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);

    res.json({
      success: true,
      data: {
        weeklyStreak: 5,
        totalWorkoutsThisWeek: workouts.length,
        totalMinutes,
        totalCalories,
        workouts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workouts/history
router.get('/history', (req, res) => {
  try {
    const workouts = db.queryAll(
      `SELECT id, title, category, duration_minutes as durationMinutes,
              calories_burned as caloriesBurned, distance_km as distanceKm,
              notes, date_str as date, created_at as createdAt
       FROM workouts
       WHERE user_id = 1
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: workouts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workouts/stats
router.get('/stats', (req, res) => {
  try {
    const workouts = db.queryAll('SELECT duration_minutes, calories_burned, category FROM workouts WHERE user_id = 1');
    const totalMins = workouts.reduce((s, w) => s + (w.duration_minutes || 0), 0);
    const totalCals = workouts.reduce((s, w) => s + (w.calories_burned || 0), 0);
    const categoryCounts = {};
    workouts.forEach((w) => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalWorkouts: workouts.length,
        totalMinutes: totalMins,
        totalCalories: totalCals,
        weeklyStreak: 5,
        targetCadencePercent: 100,
        categoryBreakdown: categoryCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/workouts
router.post('/', (req, res) => {
  try {
    const title = req.body.title || req.body.name;
    const category = req.body.category || 'Strength';
    const durationMinutes = parseInt(req.body.durationMinutes || req.body.duration, 10) || 30;
    const caloriesBurned = parseInt(req.body.caloriesBurned || req.body.calories, 10) || 200;
    const distanceKm = parseFloat(req.body.distanceKm || req.body.distance) || null;
    const notes = req.body.notes || '';
    const exercises = req.body.exercises || [];
    const date = req.body.date;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Workout title or name is required' });
    }

    const id = `f_${Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date || `Today, ${timeStr}`;
    const exercisesJson = exercises ? JSON.stringify(exercises) : null;

    db.run(
      `INSERT INTO workouts (id, user_id, title, category, duration_minutes, calories_burned, distance_km, notes, date_str, exercises_json)
       VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        category,
        durationMinutes,
        caloriesBurned,
        distanceKm,
        notes,
        dateStr,
        exercisesJson,
      ]
    );

    const created = {
      id,
      title,
      name: title,
      category,
      durationMinutes,
      caloriesBurned,
      distanceKm,
      notes,
      date: dateStr,
      exercises,
    };

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      data: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM workouts WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
