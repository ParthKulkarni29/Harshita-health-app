const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Helper to categorize blood pressure per AHA criteria
function getBpCategory(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80) return 'Normal';
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) return 'Elevated';
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return 'Stage 1 Hypertension';
  if (systolic >= 140 || diastolic >= 90) return 'Stage 2 Hypertension';
  return 'Hypertensive Crisis';
}

// GET /api/vitals
router.get('/', (req, res) => {
  try {
    const full = db.getFullHealthData(1);
    res.json({ success: true, data: full.vitals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vitals/blood-pressure
router.post('/blood-pressure', (req, res) => {
  try {
    const { systolic, diastolic, pulse, date } = req.body;
    const s = parseInt(systolic, 10);
    const d = parseInt(diastolic, 10);
    const p = parseInt(pulse, 10) || 72;

    if (!s || !d) {
      return res.status(400).json({ success: false, message: 'Valid systolic and diastolic numbers required' });
    }

    const category = getBpCategory(s, d);
    const id = `bp_${Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date || `Today, ${timeStr}`;

    db.run(
      `INSERT INTO blood_pressure_logs (id, user_id, systolic, diastolic, pulse, category, date_str)
       VALUES (?, 1, ?, ?, ?, ?, ?)`,
      [id, s, d, p, category, dateStr]
    );

    res.status(201).json({
      success: true,
      message: 'Blood pressure recorded',
      data: { id, systolic: s, diastolic: d, pulse: p, category, date: dateStr },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vitals/heart-rate
router.post('/heart-rate', (req, res) => {
  try {
    const { bpm, type, date } = req.body;
    const rate = parseInt(bpm, 10);
    if (!rate) {
      return res.status(400).json({ success: false, message: 'Valid heart rate bpm required' });
    }

    const id = `hr_${Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date || `Today, ${timeStr}`;

    db.run(
      `INSERT INTO heart_rate_logs (id, user_id, bpm, type, date_str)
       VALUES (?, 1, ?, ?, ?)`,
      [id, rate, type || 'Resting', dateStr]
    );

    res.status(201).json({
      success: true,
      message: 'Heart rate recorded',
      data: { id, bpm: rate, type: type || 'Resting', date: dateStr },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vitals/blood-glucose
router.post('/blood-glucose', (req, res) => {
  try {
    const { levelMgDl, status, date } = req.body;
    const level = parseInt(levelMgDl, 10);
    if (!level) {
      return res.status(400).json({ success: false, message: 'Valid glucose level required' });
    }

    const id = `bg_${Date.now()}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date || `Today, ${timeStr}`;

    db.run(
      `INSERT INTO blood_glucose_logs (id, user_id, level_mg_dl, status, date_str)
       VALUES (?, 1, ?, ?, ?)`,
      [id, level, status || 'Fasting', dateStr]
    );

    res.status(201).json({
      success: true,
      message: 'Blood glucose recorded',
      data: { id, levelMgDl: level, status: status || 'Fasting', date: dateStr },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/vitals/medications
router.get('/medications', (req, res) => {
  try {
    const medications = db.queryAll('SELECT * FROM medications WHERE user_id = 1').map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      schedule: m.schedule,
      time: m.time_str,
      takenToday: Boolean(m.taken_today),
      streakDays: m.streak_days,
    }));
    res.json({ success: true, data: medications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/vitals/medications
router.post('/medications', (req, res) => {
  try {
    const { name, dosage, schedule, time } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Medication name is required' });
    }

    const id = `med_${Date.now()}`;
    db.run(
      `INSERT INTO medications (id, user_id, name, dosage, schedule, time_str, taken_today, streak_days)
       VALUES (?, 1, ?, ?, ?, ?, 0, 0)`,
      [id, name, dosage || '1 dose', schedule || 'Daily', time || '08:00 AM']
    );

    res.status(201).json({
      success: true,
      message: 'Medication added',
      data: {
        id,
        name,
        dosage: dosage || '1 dose',
        schedule: schedule || 'Daily',
        time: time || '08:00 AM',
        takenToday: false,
        streakDays: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/vitals/medications/:id/toggle
router.put('/medications/:id/toggle', (req, res) => {
  try {
    const med = db.queryOne('SELECT * FROM medications WHERE id = ? AND user_id = 1', [req.params.id]);
    if (!med) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }

    const newTaken = med.taken_today ? 0 : 1;
    const newStreak = newTaken ? med.streak_days + 1 : Math.max(0, med.streak_days - 1);

    db.run('UPDATE medications SET taken_today = ?, streak_days = ? WHERE id = ?', [newTaken, newStreak, med.id]);

    res.json({
      success: true,
      message: 'Medication status toggled',
      data: {
        id: med.id,
        takenToday: Boolean(newTaken),
        streakDays: newStreak,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/vitals/medications/:id
router.delete('/medications/:id', (req, res) => {
  try {
    db.run('DELETE FROM medications WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ success: true, message: 'Medication deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
