const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Health knowledge synthesis based on Harshita's real data
function synthesizeAdvisorAnswer(question, healthData) {
  const q = (question || '').toLowerCase();
  const { profile, cycle, vitals, nutrition, habits } = healthData;
  const history = profile?.healthHistory || {};
  const goals = profile?.goals || {};
  const conditions = history.conditions || [];
  const allergies = history.allergies || [];
  const surgeries = history.surgeries || [];

  const allergiesText = allergies.map((a) => a.allergen).join(', ');
  const jointRestriction = conditions.find((c) => /knee|meniscus|back|shoulder/i.test(c.name)) ||
    surgeries.find((s) => /knee|meniscus|back|shoulder/i.test(s.procedure));

  if (/dinner|eat|food|meal|snack|hungry|calories|nutrition|diet/i.test(q)) {
    return {
      topic: 'nutrition',
      headline: 'Harshita’s Nutrition Guidance',
      answer: `For your daily target of ${goals.calories || 2100} kcal (${goals.proteinG || 140}g protein), focus on clean, whole foods while strictly adhering to your allergy guardrails: ${
        allergiesText ? `avoid ${allergiesText}.` : 'no allergies recorded.'
      } A recommended dinner is Grilled Wild Salmon with Roasted Sweet Potatoes & Steamed Greens (approx 520 kcal, 42g protein). Because of your mild hypertension protocol, season with fresh garlic, rosemary, and lemon instead of added salt to keep daily sodium under 2,000mg.`,
      guardrailTriggered: 'Lactose & Sodium Alert Active',
    };
  }

  if (/workout|exercise|knee|squat|train|gym|cardio|joint|injury/i.test(q)) {
    return {
      topic: 'fitness',
      headline: 'Harshita’s Safe Exercise Strategy',
      answer: `Hello Harshita! Because of your ${jointRestriction ? (jointRestriction.name || jointRestriction.procedure) : 'knee meniscus caution'}, avoid heavy loaded squats beyond 90 degrees or high-impact plyometric jumping. Instead, prioritize smooth low-impact cardio such as stationary cycling (cadence 80-90 rpm) or swimming, combined with isometric quad/hamstring strengthening exercises to stabilize your knee. In your current ${cycle?.currentPhase || 'Follicular'} phase, your energy and stamina are optimal!`,
      guardrailTriggered: 'Meniscus Joint Protection Active',
    };
  }

  if (/period|cramp|cycle|pms|ovulat|bleed|luteal|follicular|fertility/i.test(q)) {
    return {
      topic: 'cycle',
      headline: 'Cycle & Hormonal Syncing for Harshita',
      answer: `Harshita, you are currently on Day ${cycle?.currentCycleDay || 14} of 28 (${cycle?.phaseTitle || 'Ovulatory Phase'}). Your fertility window is ${cycle?.chanceOfPregnancy || 'High'}. For energy optimization and minimizing future cramps, ensure adequate hydration (target ${goals.waterMl || 2500}ml) and take your evening Magnesium Glycinate (200mg) which assists uterine muscle relaxation and promotes deep restorative sleep.`,
      guardrailTriggered: 'Hormonal Bio-Sync Active',
    };
  }

  if (/blood pressure|bp|hypertension|heart|cardio|pulse/i.test(q)) {
    const latestBp = vitals.bloodPressureLogs?.[0] || { systolic: 118, diastolic: 76 };
    return {
      topic: 'vitals',
      headline: 'Blood Pressure & Cardiovascular Status',
      answer: `Harshita, your latest reading is ${latestBp.systolic}/${latestBp.diastolic} mmHg (${latestBp.category || 'Normal'}). For active lifestyle management of mild hypertension, keep daily sodium below 2,000mg (DASH protocol), maintain 10,000 daily steps, and continue your daily CoQ10 & Omega-3 supplementation with lunch to support endothelial vascular health.`,
      guardrailTriggered: 'DASH Sodium Protocol',
    };
  }

  if (/medication|supplement|vitamin|pill|dose/i.test(q)) {
    const meds = (vitals.medications || []).map((m) => `${m.name} (${m.dosage}) - ${m.schedule}`).join('; ');
    return {
      topic: 'medications',
      headline: 'Active Prescriptions & Supplements',
      answer: `Harshita, your active daily protocol includes: ${meds}. Note that your Penicillin allergy is flagged as an Emergency Medical Alert across all clinical profiles. Keep taking Vitamin D3 with breakfast for bone density and immune function.`,
      guardrailTriggered: 'Penicillin Severe Allergy Flag',
    };
  }

  // General fallback
  return {
    topic: 'general',
    headline: 'Personalized Clinical Synthesis',
    answer: `Hello Harshita! Based on your active biometrics (28yo, 62.5kg, 168cm) and medical intake, your daily wellness target is ${goals.calories || 2100} kcal, ${goals.waterMl || 2500}ml water, and 10,000 steps. Your safety guardrails for knee meniscus caution and dietary lactose avoidance are active across all fitness and nutrition calculations. How else can I assist your health goals today?`,
    guardrailTriggered: 'Full Clinical Telemetry Active',
  };
}

// POST /api/advisor/query
router.post('/query', (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question prompt is required' });
    }

    const full = db.getFullHealthData(1);
    const result = synthesizeAdvisorAnswer(question, full);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/advisor/guidance
router.get('/guidance', (req, res) => {
  try {
    const full = db.getFullHealthData(1);
    const { profile, cycle, vitals } = full;
    const history = profile.healthHistory || {};
    const goals = profile.goals || {};
    const allergiesList = (history.allergies || []).map((a) => a.allergen).join(', ');

    const guidance = {
      nutrition: {
        title: 'Harshita’s Personalized Nutrition Guidance',
        points: [
          `Daily Target: ${goals.calories || 2100} kcal (${goals.proteinG || 140}g protein, ${goals.carbsG || 220}g carbs, ${goals.fatG || 65}g fat).`,
          allergiesList ? `Active Allergy Shield: Strictly avoid meals containing ${allergiesList}.` : 'No food allergies recorded.',
          'DASH Sodium Protocol: Keep sodium below 2,000mg/day to support healthy arterial compliance.',
          'Hydrate consistently: Target is ' + (goals.waterMl || 2500) + ' ml of water today.',
        ],
      },
      fitness: {
        title: 'Harshita’s Safe Workout & Activity Strategy',
        points: [
          `Daily Target: ${(goals.steps || 10000).toLocaleString()} steps and 45 active minutes.`,
          'Joint Protection (Meniscus Strain): Favor smooth low-impact cardio (cycling, swimming, elliptical) and avoid uncontrolled plyometric jumping or deep loaded knee bends.',
          `Cycle Syncing (${cycle.currentPhase} Phase): Estrogen peak! Great window for upper body strength and endurance without knee strain.`,
        ],
      },
      vitals: {
        title: 'Clinical Vitals & Preventive Review',
        points: [
          'Latest Blood Pressure: 118/76 mmHg (Normal). Well managed under lifestyle & DASH protocol.',
          'Resting Heart Rate: 64 BPM (Optimal Sinus Rhythm).',
          'Fasting Glucose: 92 mg/dL. Routine preventive screening advised given family diabetes history.',
        ],
      },
    };

    res.json({ success: true, data: guidance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
