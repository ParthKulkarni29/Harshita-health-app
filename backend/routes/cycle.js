const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Helper to determine menstrual phase from cycle day
function getPhaseInfo(cycleDay, totalDays = 28) {
  if (cycleDay <= 5) {
    return {
      currentPhase: 'Menstrual',
      phaseTitle: 'Menstrual Phase (Rest & Recovery)',
      chanceOfPregnancy: 'Very Low',
      recommendation: 'Restorative movement, light walking, iron-rich meals, magnesium tea.',
    };
  } else if (cycleDay <= 13) {
    return {
      currentPhase: 'Follicular',
      phaseTitle: 'Follicular Phase (Energy & Strength Building)',
      chanceOfPregnancy: 'Moderate (Fertility Rising)',
      recommendation: 'Estrogen rising. Optimal window for heavy progressive resistance training and high energy.',
    };
  } else if (cycleDay <= 16) {
    return {
      currentPhase: 'Ovulation',
      phaseTitle: 'Ovulatory Phase (Peak Fertility)',
      chanceOfPregnancy: 'High (Peak Fertility Window)',
      recommendation: 'Peak stamina and cellular energy. Ideal for personal bests and compound movements.',
    };
  } else {
    return {
      currentPhase: 'Luteal',
      phaseTitle: 'Luteal Phase (Metabolic Pacing & Recovery)',
      chanceOfPregnancy: 'Low',
      recommendation: 'Progesterone rising. Increase complex carbohydrates (+100-200 kcal), prioritize recovery.',
    };
  }
}

// GET /api/cycle
router.get('/', (req, res) => {
  try {
    const full = db.getFullHealthData(1);
    const cycle = full.cycle;

    // Dynamically calculate day from last period start date
    const startDate = new Date(cycle.lastPeriodStartDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const cycleDay = ((diffDays - 1) % cycle.averageCycleDays) + 1;
    const daysUntilNext = Math.max(0, cycle.averageCycleDays - cycleDay);
    const phaseInfo = getPhaseInfo(cycleDay, cycle.averageCycleDays);

    const enriched = {
      ...cycle,
      settings: {
        enabled: Boolean(cycle.enabled),
        averageCycleDays: cycle.averageCycleDays,
        averagePeriodDays: cycle.averagePeriodDays,
        lastPeriodStartDate: cycle.lastPeriodStartDate,
      },
      currentCycleDay: cycleDay,
      daysUntilNextPeriod: daysUntilNext,
      ...phaseInfo,
    };

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cycle/period-start
router.post('/period-start', (req, res) => {
  try {
    const { startDate } = req.body;
    const dateStr = startDate || new Date().toISOString().split('T')[0];

    db.run(
      'UPDATE cycle_settings SET last_period_start_date = ? WHERE user_id = 1',
      [dateStr]
    );

    const full = db.getFullHealthData(1);
    res.json({
      success: true,
      message: 'Period start date recorded (Day 1 anchored)',
      data: full.cycle,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cycle/symptoms
router.post('/symptoms', (req, res) => {
  try {
    const { flow, symptoms, mood, notes, cycleDay } = req.body;
    const id = `cs_${Date.now()}`;
    const now = new Date();
    const dateStr = `Today, ${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    const day = parseInt(cycleDay, 10) || 14;
    const symptomsJson = JSON.stringify(Array.isArray(symptoms) ? symptoms : [symptoms || 'None']);

    db.run(
      `INSERT INTO cycle_symptoms (id, user_id, date_str, cycle_day, flow, symptoms_json, mood, notes)
       VALUES (?, 1, ?, ?, ?, ?, ?, ?)`,
      [id, dateStr, day, flow || 'None', symptomsJson, mood || 'Confident', notes || '']
    );

    res.status(201).json({
      success: true,
      message: 'Cycle symptoms logged',
      data: {
        id,
        date: dateStr,
        cycleDay: day,
        flow: flow || 'None',
        symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
        mood: mood || 'Confident',
        notes: notes || '',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cycle/symptoms/:id
router.delete('/symptoms/:id', (req, res) => {
  try {
    db.run('DELETE FROM cycle_symptoms WHERE id = ? AND user_id = 1', [req.params.id]);
    res.json({ success: true, message: 'Cycle symptom log deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/cycle/settings
router.put('/settings', (req, res) => {
  try {
    const { averageCycleDays, averagePeriodDays, enabled } = req.body;
    db.run(
      `UPDATE cycle_settings
       SET average_cycle_days = COALESCE(?, average_cycle_days),
           average_period_days = COALESCE(?, average_period_days),
           enabled = COALESCE(?, enabled)
       WHERE user_id = 1`,
      [averageCycleDays, averagePeriodDays, enabled !== undefined ? (enabled ? 1 : 0) : null]
    );

    const full = db.getFullHealthData(1);
    res.json({ success: true, message: 'Cycle settings updated', data: full.cycle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
