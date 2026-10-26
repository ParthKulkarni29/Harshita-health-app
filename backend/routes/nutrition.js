const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Helper to calculate totals
function calculateNutritionTotals(userId = 1) {
  const meals = db.queryAll(
    `SELECT id, type, name, time_str as time, calories, protein_g as proteinG, carbs_g as carbsG, fat_g as fatG, created_at as createdAt
     FROM meals
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  const goals = db.queryOne('SELECT * FROM user_goals WHERE user_id = ?', [userId]) || {
    calories: 2100,
    protein_g: 140,
    carbs_g: 220,
    fat_g: 65,
  };

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbsG || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fatG || 0), 0);

  const calGoal = goals.calories || 2100;
  const calRemaining = Math.max(0, calGoal - totalCalories);
  const calProgress = calGoal > 0 ? totalCalories / calGoal : 0;

  return {
    meals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    goals: {
      calories: calGoal,
      proteinG: goals.protein_g,
      carbsG: goals.carbs_g,
      fatG: goals.fat_g,
    },
    calRemaining,
    calProgress,
  };
}

// GET /api/nutrition
router.get('/', (req, res) => {
  try {
    const data = calculateNutritionTotals(1);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/nutrition/meals (and /api/foods)
router.get('/meals', (req, res) => {
  try {
    const data = calculateNutritionTotals(1);
    res.json({ success: true, data: data.meals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/nutrition/stats
router.get('/stats', (req, res) => {
  try {
    const data = calculateNutritionTotals(1);
    res.json({
      success: true,
      data: {
        totalCalories: data.totalCalories,
        totalProtein: data.totalProtein,
        totalCarbs: data.totalCarbs,
        totalFat: data.totalFat,
        calGoal: data.goals.calories,
        calRemaining: data.calRemaining,
        calProgress: data.calProgress,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/nutrition/meals (and /api/foods)
router.post('/meals', (req, res) => {
  try {
    const { name, type, calories, proteinG, carbsG, fatG, time } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Meal or food name is required' });
    }

    const id = `m_${Date.now()}`;
    const now = new Date();
    const timeStr = time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.run(
      `INSERT INTO meals (id, user_id, type, name, time_str, calories, protein_g, carbs_g, fat_g)
       VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        type || 'Lunch',
        name,
        timeStr,
        parseInt(calories, 10) || 0,
        parseInt(proteinG, 10) || 0,
        parseInt(carbsG, 10) || 0,
        parseInt(fatG, 10) || 0,
      ]
    );

    const created = {
      id,
      name,
      type: type || 'Lunch',
      time: timeStr,
      calories: parseInt(calories, 10) || 0,
      proteinG: parseInt(proteinG, 10) || 0,
      carbsG: parseInt(carbsG, 10) || 0,
      fatG: parseInt(fatG, 10) || 0,
    };

    res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      data: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/nutrition/meals/:id
router.delete('/meals/:id', (req, res) => {
  try {
    db.run('DELETE FROM meals WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
