const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Calculate aggregate wellness matrix score out of 100
function computeWellnessScore(healthData) {
  let score = 50; // baseline

  const { habits, profile, nutrition, fitness, vitals } = healthData;
  const goals = profile?.goals || {};

  // Water score (+10 max)
  const waterProgress = (habits?.waterCurrentMl || 0) / (goals.waterMl || 2500);
  score += Math.min(10, Math.round(waterProgress * 10));

  // Step score (+12 max)
  const stepProgress = (habits?.steps?.current || 0) / (goals.steps || 10000);
  score += Math.min(12, Math.round(stepProgress * 12));

  // Sleep score (+15 max)
  const sleepQuality = habits?.sleep?.qualityScore || 80;
  score += Math.round((sleepQuality / 100) * 15);

  // Nutrition compliance (+8 max)
  const meals = nutrition?.meals || [];
  const totalCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const calGoal = goals.calories || 2100;
  if (totalCal > 0 && totalCal <= calGoal + 200) {
    score += 8;
  }

  // Workouts (+5 max)
  if ((fitness?.workouts || []).length > 0) {
    score += 5;
  }

  return Math.min(100, Math.max(30, score));
}

// GET /api/dashboard
router.get('/', (req, res) => {
  try {
    const full = db.getFullHealthData(1);
    const score = computeWellnessScore(full);

    const goals = full.profile.goals;
    const meals = full.nutrition.meals || [];
    const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
    const calorieGoal = goals.calories || 2100;

    const totalProtein = meals.reduce((s, m) => s + (m.proteinG || 0), 0);
    const totalCarbs = meals.reduce((s, m) => s + (m.carbsG || 0), 0);
    const totalFat = meals.reduce((s, m) => s + (m.fatG || 0), 0);

    const waterCurrent = full.habits.waterCurrentMl || 0;
    const waterGoal = goals.waterMl || 2500;

    const stepsCurrent = full.habits.steps?.current || 0;
    const stepsGoal = goals.steps || 10000;

    const latestBp = full.vitals.bloodPressureLogs?.[0] || {
      systolic: 120,
      diastolic: 80,
      category: 'Normal',
    };
    const latestHr = full.vitals.heartRateLogs?.[0] || { bpm: 72, type: 'Resting' };
    const latestBg = full.vitals.bloodGlucoseLogs?.[0] || { levelMgDl: 95, status: 'Fasting' };

    const pendingMeds = (full.vitals.medications || []).filter((m) => !m.takenToday);

    const dashboardData = {
      user: {
        id: full.profile.id || 1,
        name: full.profile.name || 'Harshita',
        greeting: `Good evening, ${full.profile.name || 'Harshita'} 👋`,
        age: full.profile.age,
        weightKg: full.profile.weightKg,
        heightCm: full.profile.heightCm,
        bloodType: full.profile.bloodType,
        sex: full.profile.sex,
      },
      wellnessMatrix: {
        score,
        status: score >= 85 ? 'Optimal' : score >= 70 ? 'Good' : 'Needs Focus',
        deltaVsYesterday: '+4 pts vs yesterday',
        subtitle: 'Composite Biomarker Score',
      },
      today: {
        calories: {
          current: totalCalories,
          goal: calorieGoal,
          remaining: Math.max(0, calorieGoal - totalCalories),
          progress: calorieGoal > 0 ? +(totalCalories / calorieGoal).toFixed(2) : 0,
          macros: {
            protein: { current: totalProtein, goal: goals.proteinG },
            carbs: { current: totalCarbs, goal: goals.carbsG },
            fat: { current: totalFat, goal: goals.fatG },
          },
        },
        water: {
          currentMl: waterCurrent,
          goalMl: waterGoal,
          remainingMl: Math.max(0, waterGoal - waterCurrent),
          progress: +(waterCurrent / waterGoal).toFixed(2),
        },
        steps: {
          current: stepsCurrent,
          goal: stepsGoal,
          progress: +(stepsCurrent / stepsGoal).toFixed(2),
          distanceKm: full.habits.steps?.distanceKm || 0,
          caloriesBurned: full.habits.steps?.caloriesBurned || 0,
        },
        sleep: full.habits.sleep,
        mood: full.habits.mood,
      },
      vitals: {
        bloodPressure: latestBp,
        heartRate: latestHr,
        bloodGlucose: latestBg,
        pendingMedicationsCount: pendingMeds.length,
      },
      workouts: {
        weeklyStreak: full.fitness.weeklyStreak,
        totalThisWeek: full.fitness.totalWorkoutsThisWeek,
        recent: full.fitness.workouts.slice(0, 3),
      },
      cycle: {
        enabled: full.cycle.enabled,
        currentPhase: full.cycle.currentPhase,
        phaseTitle: full.cycle.phaseTitle,
        currentCycleDay: full.cycle.currentCycleDay,
        daysUntilNextPeriod: full.cycle.daysUntilNextPeriod,
        chanceOfPregnancy: full.cycle.chanceOfPregnancy,
      },
      clinicalGuardrails: [
        {
          id: 'cg1',
          type: 'Blood Pressure Guardrail',
          label: 'DASH Sodium Protocol',
          detail: 'Keep dietary sodium < 2,000mg/d. Regular cardiovascular movement active.',
          status: 'Active',
        },
        {
          id: 'cg2',
          type: 'Joint Precaution',
          label: 'Knee Meniscus Caution',
          detail: 'Low-impact cardio prioritized. Avoid deep weighted squats beyond 90 degrees.',
          status: 'Active',
        },
        {
          id: 'cg3',
          type: 'Allergy Shield',
          label: 'Lactose & Penicillin Allergy',
          detail: 'Strict allergen filtering on recipes, meal recommendations and prescriptions.',
          status: 'Strict',
        },
      ],
    };

    // Compatibility aliases
    dashboardData.todayCalories = {
      consumed: totalCalories,
      remaining: Math.max(0, calorieGoal - totalCalories),
      goal: calorieGoal,
    };
    dashboardData.activeGuardrails = dashboardData.clinicalGuardrails;

    res.json({ success: true, data: dashboardData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
