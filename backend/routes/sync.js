const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { seedData } = require('../database/seed');

// GET /api/sync
router.get('/', (req, res) => {
  try {
    const full = db.getFullHealthData(1);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: full,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/sync
router.post('/', (req, res) => {
  try {
    const incoming = req.body;
    if (!incoming) {
      return res.status(400).json({ success: false, message: 'Payload is required' });
    }

    if (incoming.profile) {
      const p = incoming.profile;
      db.run(
        `UPDATE users
         SET name = COALESCE(?, name),
             age = COALESCE(?, age),
             weight_kg = COALESCE(?, weight_kg),
             height_cm = COALESCE(?, height_cm),
             blood_type = COALESCE(?, blood_type),
             sex = COALESCE(?, sex),
             activity_level = COALESCE(?, activity_level),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [p.name, p.age, p.weightKg, p.heightCm, p.bloodType, p.sex, p.activityLevel]
      );

      if (p.goals) {
        const g = p.goals;
        db.run(
          `UPDATE user_goals
           SET water_ml = COALESCE(?, water_ml),
               calories = COALESCE(?, calories),
               protein_g = COALESCE(?, protein_g),
               carbs_g = COALESCE(?, carbs_g),
               fat_g = COALESCE(?, fat_g),
               steps = COALESCE(?, steps),
               sleep_hours = COALESCE(?, sleep_hours),
               active_minutes = COALESCE(?, active_minutes)
           WHERE user_id = 1`,
          [g.waterMl, g.calories, g.proteinG, g.carbsG, g.fatG, g.steps, g.sleepHours, g.activeMinutes]
        );
      }
    }

    const updated = db.getFullHealthData(1);
    res.json({
      success: true,
      message: 'Data synchronized with backend SQLite database',
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reset
router.post('/reset', (req, res) => {
  try {
    const dbInstance = db.getDB();
    seedData(dbInstance);
    db.saveDB();

    const fresh = db.getFullHealthData(1);
    res.json({
      success: true,
      message: 'Reset to default Harshita health profile and logs',
      data: fresh,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
