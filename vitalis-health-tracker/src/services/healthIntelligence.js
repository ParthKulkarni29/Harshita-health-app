/**
 * Health Intelligence Engine
 * Dynamically synthesizes user medical history (diagnoses, allergies, family risks, past surgeries)
 * with their daily tracking data (vitals, nutrition, workouts, habits) to generate personalized
 * clinical alerts, guardrails, and recommendations.
 */

export function analyzeHealthData(data) {
  if (!data) return { alerts: [], recommendations: [], guardrails: [], statusBadge: 'Optimal' };

  const history = data.profile?.healthHistory || {};
  const conditions = history.conditions || [];
  const allergies = history.allergies || [];
  const familyHistory = history.familyHistory || [];
  const surgeries = history.surgeries || [];

  const vitals = data.vitals || {};
  const meals = data.nutrition?.meals || [];
  const workouts = data.fitness?.workouts || [];
  const habits = data.habits || {};

  const alerts = [];
  const guardrails = [];
  const recommendations = [];

  // 1. HYPERTENSION & CARDIOVASCULAR HISTORY ANALYSIS
  const hasHypertension = conditions.some((c) =>
    /hypertension|blood pressure|high bp/i.test(c.name)
  );
  const familyHeartDisease = familyHistory.some((f) =>
    /heart|cardio|stroke|infarction|cad/i.test(f.condition)
  );

  const latestBp = vitals.bloodPressureLogs?.[0];
  if (hasHypertension) {
    if (latestBp) {
      if (latestBp.systolic >= 135 || latestBp.diastolic >= 85) {
        alerts.push({
          id: 'bp_warning',
          severity: 'high',
          category: 'Vitals & Condition Alert',
          title: 'Elevated BP vs. Hypertension History',
          message: `Your latest reading of ${latestBp.systolic}/${latestBp.diastolic} mmHg is elevated for your diagnosed hypertension history. Maintain sodium < 2,000mg and ensure hydration.`,
          icon: 'alert-circle',
          color: '#EF4444',
        });
      } else {
        guardrails.push({
          id: 'bp_controlled',
          category: 'Condition Controlled',
          title: 'Blood Pressure Target Met',
          message: `Latest BP (${latestBp.systolic}/${latestBp.diastolic} mmHg) is within optimal limits for your hypertension management.`,
          icon: 'shield-checkmark',
          color: '#10B981',
        });
      }
    }

    recommendations.push({
      id: 'dash_diet',
      title: 'Dietary Sodium Guardrail (DASH)',
      description: 'Your medical profile indicates hypertension. Prefer fresh herbs and potassium-rich foods (avocados, leafy greens) over table salt.',
      source: 'Diagnosed: Mild Hypertension',
      icon: 'nutrition-outline',
    });
  }

  if (familyHeartDisease && !hasHypertension) {
    guardrails.push({
      id: 'family_cardio',
      category: 'Family Risk Screening',
      title: 'Cardiovascular Risk Precaution',
      message: 'Family history of heart disease noted. Consistent 30+ mins zone-2 aerobic activity supports vascular elasticity.',
      icon: 'heart-outline',
      color: '#8B5CF6',
    });
  }

  // 2. JOINT / INJURY / SURGICAL RESTRICTIONS
  const jointIssue = conditions.find((c) =>
    /knee|meniscus|back|spine|shoulder|acl|joint|disc/i.test(c.name)
  ) || surgeries.find((s) => /knee|meniscus|shoulder|spine/i.test(s.procedure));

  if (jointIssue) {
    const issueName = jointIssue.name || jointIssue.procedure;
    guardrails.push({
      id: 'joint_guardrail',
      category: 'Injury Precaution',
      title: `Active Protection: ${issueName}`,
      message: 'Prioritize low-impact cross-training (cycling, swimming, rowers) and avoid uncontrolled high-impact plyometrics.',
      icon: 'body-outline',
      color: '#F59E0B',
    });

    // Check if recent workouts have high impact
    const recentHighImpact = workouts.slice(0, 2).find((w) =>
      /sprint|plyo|jump|heavy squat/i.test(w.title || '')
    );
    if (recentHighImpact) {
      alerts.push({
        id: 'workout_impact_warning',
        severity: 'medium',
        category: 'Fitness Caution',
        title: 'High-Impact Workout Detected',
        message: `Your session "${recentHighImpact.title}" involves high impact. Ensure adequate warmup and monitor joint feedback given your ${issueName}.`,
        icon: 'warning-outline',
        color: '#F59E0B',
      });
    }
  }

  // 3. ALLERGIES & FOOD INTOLERANCES CROSS-CHECK
  allergies.forEach((allergy) => {
    const term = allergy.allergen.toLowerCase();
    let keywordRegex;
    if (/lactose|dairy/i.test(term)) {
      keywordRegex = /milk|yogurt|whey|cheese|cream|butter/i;
    } else if (/peanut|nut/i.test(term)) {
      keywordRegex = /peanut|almond|cashew|walnut|hazelnut/i;
    } else if (/gluten|wheat/i.test(term)) {
      keywordRegex = /wheat|bread|pasta|flour|cereal|barley/i;
    } else if (/shellfish|seafood/i.test(term)) {
      keywordRegex = /shrimp|crab|lobster|prawn|shellfish|oyster/i;
    }

    if (keywordRegex) {
      const conflictingMeal = meals.find((m) => keywordRegex.test(m.name || ''));
      if (conflictingMeal) {
        alerts.push({
          id: `allergy_conflict_${allergy.id}`,
          severity: allergy.severity === 'Severe' ? 'high' : 'medium',
          category: 'Allergy Warning',
          title: `Potential Allergen in "${conflictingMeal.name}"`,
          message: `Your medical profile lists "${allergy.allergen}" (${allergy.severity} severity). Please ensure dairy-free / hypoallergenic ingredients are used!`,
          icon: 'warning',
          color: allergy.severity === 'Severe' ? '#EF4444' : '#F59E0B',
        });
      }
    }
  });

  // 4. DIABETES & METABOLIC FAMILY RISK
  const familyDiabetes = familyHistory.some((f) => /diabetes|glucose|insulin/i.test(f.condition));
  const hasDiabetes = conditions.some((c) => /diabetes|insulin/i.test(c.name));

  if (hasDiabetes || familyDiabetes) {
    const latestGlucose = vitals.bloodGlucoseLogs?.[0];
    if (latestGlucose && latestGlucose.levelMgDl > 115 && latestGlucose.status === 'Fasting') {
      alerts.push({
        id: 'glucose_alert',
        severity: 'medium',
        category: 'Metabolic Warning',
        title: 'Fasting Glucose Elevated',
        message: `Fasting blood glucose is ${latestGlucose.levelMgDl} mg/dL. Considering your family diabetes profile, monitor carbohydrate pacing closely.`,
        icon: 'water',
        color: '#F97316',
      });
    } else {
      recommendations.push({
        id: 'metabolic_rec',
        title: 'Post-Meal Walking for Glucose Uptake',
        description: 'A brief 10-15 minute walk after meals activates GLUT-4 transporters, keeping insulin levels regulated.',
        source: 'Familial Diabetes Risk Assessment',
        icon: 'walk-outline',
      });
    }
  }

  // 5. HYDRATION & RECOVERY GUARDRAILS
  if ((habits.waterCurrentMl || 0) < 1000) {
    recommendations.push({
      id: 'hydration_support',
      title: 'Maintain Fluid Balance',
      description: 'Adequate hydration supports kidney function, medication metabolization, and stable blood pressure.',
      source: 'Daily Wellness Protocol',
      icon: 'water-outline',
    });
  }

  // 6. MENSTRUAL & HORMONE CYCLE INTELLIGENCE
  const cycle = data.cycle;
  if (cycle && cycle.enabled) {
    const phase = cycle.currentPhase;
    const cycleDay = cycle.currentCycleDay || 1;

    // Check hormone conditions in medical history
    const hasPCOS = conditions.some((c) => /pcos|polycystic|endometriosis|dysmenorrhea/i.test(c.name));
    if (hasPCOS) {
      guardrails.push({
        id: 'pcos_guardrail',
        category: 'Hormone Health Guardrail',
        title: 'Endocrine & Cycle Precaution',
        message: 'Your history notes PCOS/Endometriosis. Emphasize low-glycemic meals and avoid excessive cortisol spikes from overtraining.',
        icon: 'flower-outline',
        color: '#EC4899',
      });
    }

    if (phase === 'Menstrual') {
      recommendations.push({
        id: 'cycle_menstrual_rec',
        title: 'Cycle Syncing: Menstrual Rest & Replenish',
        description: `Day ${cycleDay} of cycle. Estrogen & progesterone are at baseline. Prioritize iron-rich foods (spinach, lentils), warm fluids, and gentle mobility.`,
        source: 'Menstrual Phase Bio-Guidance',
        icon: 'flower',
      });
    } else if (phase === 'Follicular') {
      recommendations.push({
        id: 'cycle_follicular_rec',
        title: 'Cycle Syncing: Follicular Energy Window',
        description: `Day ${cycleDay} of cycle. Rising estrogen enhances muscle protein synthesis and carbohydrate tolerance. Ideal window for progressive resistance training!`,
        source: 'Follicular Phase Bio-Guidance',
        icon: 'barbell-outline',
      });
    } else if (phase === 'Ovulation') {
      recommendations.push({
        id: 'cycle_ovulation_rec',
        title: 'Cycle Syncing: Peak Power & Ovulation Window',
        description: `Day ${cycleDay} of cycle (Peak fertility & energy). Estrogen peaks—optimal time for high-intensity training, but ensure thorough joint warmups.`,
        source: 'Ovulatory Phase Bio-Guidance',
        icon: 'flash-outline',
      });
    } else if (phase === 'Luteal') {
      recommendations.push({
        id: 'cycle_luteal_rec',
        title: 'Cycle Syncing: Luteal Phase Metabolic Pacing',
        description: `Day ${cycleDay} of cycle. Progesterone rises, increasing basal metabolic rate (~100-200 kcal/d). Prioritize complex carbs and magnesium to curb PMS cravings.`,
        source: 'Luteal Phase Bio-Guidance',
        icon: 'moon-outline',
      });
    }
  }

  return {
    alerts,
    guardrails,
    recommendations,
    activeConditionsCount: conditions.length,
    activeAllergiesCount: allergies.length,
    activeFamilyHistoryCount: familyHistory.length,
  };
}
