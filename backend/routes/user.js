const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/user/profile
router.get('/profile', (req, res) => {
  try {
    const user = db.queryOne('SELECT * FROM users WHERE id = 1');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const goals = db.queryOne('SELECT * FROM user_goals WHERE user_id = 1') || {};
    const conditions = db.queryAll('SELECT * FROM conditions WHERE user_id = 1');
    const allergies = db.queryAll('SELECT * FROM allergies WHERE user_id = 1');
    const familyHistory = db.queryAll('SELECT * FROM family_history WHERE user_id = 1');
    const surgeries = db.queryAll('SELECT * FROM surgeries WHERE user_id = 1');

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        age: user.age,
        weightKg: user.weight_kg,
        heightCm: user.height_cm,
        bloodType: user.blood_type,
        sex: user.sex,
        activityLevel: user.activity_level,
        goals: {
          waterMl: goals.water_ml,
          calories: goals.calories,
          proteinG: goals.protein_g,
          carbsG: goals.carbs_g,
          fatG: goals.fat_g,
          steps: goals.steps,
          sleepHours: goals.sleep_hours,
          activeMinutes: goals.active_minutes,
        },
        healthHistory: {
          conditions: conditions.map((c) => ({
            id: c.id,
            name: c.name,
            diagnosedYear: c.diagnosed_year,
            status: c.status,
            severity: c.severity,
            physicianNotes: c.physician_notes,
          })),
          allergies: allergies.map((a) => ({
            id: a.id,
            allergen: a.allergen,
            severity: a.severity,
            reaction: a.reaction,
          })),
          familyHistory: familyHistory.map((f) => ({
            id: f.id,
            relation: f.relation,
            condition: f.condition,
            diagnosedAge: f.diagnosed_age,
            notes: f.notes,
          })),
          surgeries: surgeries.map((s) => ({
            id: s.id,
            procedure: s.procedure,
            year: s.year,
            hospital: s.hospital,
            notes: s.notes,
          })),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/user/profile
router.put('/profile', (req, res) => {
  try {
    const { name, age, weightKg, heightCm, bloodType, sex, activityLevel } = req.body;
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
      [name, age, weightKg, heightCm, bloodType, sex, activityLevel]
    );

    const updated = db.getFullHealthData(1);
    res.json({ success: true, message: 'Profile updated successfully', data: updated.profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/user/goals
router.get('/goals', (req, res) => {
  try {
    const goals = db.queryOne('SELECT * FROM user_goals WHERE user_id = 1') || {};
    res.json({
      success: true,
      data: {
        waterMl: goals.water_ml,
        waterMlGoal: goals.water_ml,
        calories: goals.calories,
        calorieGoal: goals.calories,
        proteinG: goals.protein_g,
        proteinGoal: goals.protein_g,
        carbsG: goals.carbs_g,
        carbsGoal: goals.carbs_g,
        fatG: goals.fat_g,
        fatGoal: goals.fat_g,
        steps: goals.steps,
        stepsGoal: goals.steps,
        sleepHours: goals.sleep_hours,
        sleepHoursGoal: goals.sleep_hours,
        activeMinutes: goals.active_minutes,
        activeMinutesGoal: goals.active_minutes,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/user/goals
router.put('/goals', (req, res) => {
  try {
    const water = req.body.waterMl ?? req.body.waterMlGoal;
    const cal = req.body.calories ?? req.body.calorieGoal;
    const protein = req.body.proteinG ?? req.body.proteinGoal;
    const carbs = req.body.carbsG ?? req.body.carbsGoal;
    const fat = req.body.fatG ?? req.body.fatGoal;
    const steps = req.body.steps ?? req.body.stepsGoal;
    const sleep = req.body.sleepHours ?? req.body.sleepHoursGoal;
    const active = req.body.activeMinutes ?? req.body.activeMinutesGoal;

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
      [water, cal, protein, carbs, fat, steps, sleep, active]
    );

    const updatedGoals = db.queryOne('SELECT * FROM user_goals WHERE user_id = 1');
    res.json({
      success: true,
      message: 'Goals updated',
      data: {
        waterMl: updatedGoals.water_ml,
        waterMlGoal: updatedGoals.water_ml,
        calories: updatedGoals.calories,
        calorieGoal: updatedGoals.calories,
        proteinG: updatedGoals.protein_g,
        proteinGoal: updatedGoals.protein_g,
        carbsG: updatedGoals.carbs_g,
        carbsGoal: updatedGoals.carbs_g,
        fatG: updatedGoals.fat_g,
        fatGoal: updatedGoals.fat_g,
        steps: updatedGoals.steps,
        stepsGoal: updatedGoals.steps,
        sleepHours: updatedGoals.sleep_hours,
        sleepHoursGoal: updatedGoals.sleep_hours,
        activeMinutes: updatedGoals.active_minutes,
        activeMinutesGoal: updatedGoals.active_minutes,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Conditions
router.post('/conditions', (req, res) => {
  try {
    const { name, diagnosedYear, status, severity, physicianNotes } = req.body;
    const id = `c_${Date.now()}`;
    db.run(
      `INSERT INTO conditions (id, user_id, name, diagnosed_year, status, severity, physician_notes)
       VALUES (?, 1, ?, ?, ?, ?, ?)`,
      [id, name, diagnosedYear || new Date().getFullYear(), status || 'Active', severity || 'Mild', physicianNotes || '']
    );
    res.json({ success: true, message: 'Condition added', data: { id, name, diagnosedYear, status, severity, physicianNotes } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/conditions/:id', (req, res) => {
  try {
    db.run('DELETE FROM conditions WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ success: true, message: 'Condition deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Allergies
router.post('/allergies', (req, res) => {
  try {
    const { allergen, severity, reaction } = req.body;
    const id = `a_${Date.now()}`;
    db.run(
      `INSERT INTO allergies (id, user_id, allergen, severity, reaction)
       VALUES (?, 1, ?, ?, ?)`,
      [id, allergen, severity || 'Moderate', reaction || '']
    );
    res.json({ success: true, message: 'Allergy added', data: { id, allergen, severity, reaction } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/allergies/:id', (req, res) => {
  try {
    db.run('DELETE FROM allergies WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ success: true, message: 'Allergy deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Family History
router.post('/family', (req, res) => {
  try {
    const { relation, condition, diagnosedAge, notes } = req.body;
    const id = `f_${Date.now()}`;
    db.run(
      `INSERT INTO family_history (id, user_id, relation, condition, diagnosed_age, notes)
       VALUES (?, 1, ?, ?, ?, ?)`,
      [id, relation, condition, diagnosedAge || 50, notes || '']
    );
    res.json({ success: true, message: 'Family history item added', data: { id, relation, condition, diagnosedAge, notes } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/family/:id', (req, res) => {
  try {
    db.run('DELETE FROM family_history WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ success: true, message: 'Family history item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Surgeries
router.post('/surgeries', (req, res) => {
  try {
    const { procedure, year, hospital, notes } = req.body;
    const id = `s_${Date.now()}`;
    db.run(
      `INSERT INTO surgeries (id, user_id, procedure, year, hospital, notes)
       VALUES (?, 1, ?, ?, ?, ?)`,
      [id, procedure, year || new Date().getFullYear(), hospital || '', notes || '']
    );
    res.json({ success: true, message: 'Surgery record added', data: { id, procedure, year, hospital, notes } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/surgeries/:id', (req, res) => {
  try {
    db.run('DELETE FROM surgeries WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ success: true, message: 'Surgery record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/user/intake (Full health intake assessment)
router.post('/intake', (req, res) => {
  try {
    const { profile, cycle, habits } = req.body;

    if (profile) {
      db.run(
        `UPDATE users
         SET name = COALESCE(?, name),
             age = COALESCE(?, age),
             weight_kg = COALESCE(?, weight_kg),
             height_cm = COALESCE(?, height_cm),
             sex = COALESCE(?, sex),
             activity_level = COALESCE(?, activity_level),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [profile.name, profile.age, profile.weightKg, profile.heightCm, profile.sex, profile.activityLevel]
      );

      if (profile.goals) {
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
          [
            profile.goals.waterMl,
            profile.goals.calories,
            profile.goals.proteinG,
            profile.goals.carbsG,
            profile.goals.fatG,
            profile.goals.steps,
            profile.goals.sleepHours,
            profile.goals.activeMinutes,
          ]
        );
      }
    }

    if (cycle) {
      db.run(
        `UPDATE cycle_settings
         SET enabled = ?,
             average_cycle_days = COALESCE(?, average_cycle_days),
             average_period_days = COALESCE(?, average_period_days),
             last_period_start_date = COALESCE(?, last_period_start_date)
         WHERE user_id = 1`,
        [cycle.enabled ? 1 : 0, cycle.averageCycleDays, cycle.averagePeriodDays, cycle.lastPeriodStartDate]
      );
    }

    const full = db.getFullHealthData(1);
    res.json({ success: true, message: 'Intake data synthesized successfully', data: full });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
