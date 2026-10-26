import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import ModalWrapper from './ModalWrapper';
import { analyzeHealthData } from '../services/healthIntelligence';
import { api } from '../services/api';

const SUGGESTED_PROMPTS = [
  { label: '❓ What questions can you answer?', query: 'What questions can you answer?' },
  { label: '🥗 What should I eat for dinner?', query: 'What should I eat for dinner considering my health history and allergies?' },
  { label: '🏋️ Safe workout for my joints', query: 'What exercises are safe for my knee and joint history?' },
  { label: '🌸 How to relieve period cramps?', query: 'How to relieve period cramps and PMS symptoms in my current phase?' },
  { label: '🩺 How to lower my blood pressure?', query: 'How can I lower my blood pressure and manage sodium intake?' },
  { label: '📅 When is my next period & fertile window?', query: 'When is my next period and what is my fertility status?' },
  { label: '💊 Check my medications & supplements', query: 'What medications and supplements are recommended for my profile?' },
  { label: '💧 My daily calorie & water targets', query: 'How many calories and how much water should I consume today?' },
];

export default function HealthAdvisorModal({ visible, onClose, data, onNavigateTab }) {
  const profile = data?.profile || {};
  const goals = profile.goals || {};
  const history = profile.healthHistory || {};
  const cycle = data?.cycle;
  const vitals = data?.vitals || {};

  const intelligence = analyzeHealthData(data);

  const [activeQuery, setActiveQuery] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState(null);

  // Generate tailored advice dynamically from user's exact inputs
  const getTailoredAdvice = (topic) => {
    switch (topic) {
      case 'nutrition': {
        const allergiesList = (history.allergies || []).map((a) => a.allergen).join(', ');
        const hasHypertension = (history.conditions || []).some((c) => /hypertension|blood pressure/i.test(c.name));
        return {
          title: 'Your Personalized Nutrition Guidance',
          icon: 'restaurant',
          color: THEME.colors.nutrition,
          points: [
            `Daily Target: ${goals.calories || 2100} kcal (${goals.proteinG || 140}g protein, ${goals.carbsG || 200}g carbs, ${goals.fatG || 65}g fat).`,
            allergiesList ? `Active Allergy Shield: Strictly avoid meals containing ${allergiesList}.` : 'No food allergies recorded.',
            hasHypertension
              ? 'DASH Sodium Protocol: Keep sodium below 2,000mg/day. Prioritize potassium-rich foods (spinach, avocado, bananas) to support arterial relaxation.'
              : 'Focus on nutrient-dense whole foods and consistent protein pacing.',
            cycle?.enabled && cycle?.currentPhase === 'Luteal'
              ? 'Luteal Phase Support: Your metabolic rate is ~100-200 kcal higher. Choose complex carbs (oats, sweet potatoes) to regulate serotonin and minimize PMS cravings.'
              : 'Hydrate adequately: Target is ' + (goals.waterMl || 2500) + ' ml of water today.',
          ],
        };
      }
      case 'fitness': {
        const jointIssue = (history.conditions || []).find((c) =>
          /knee|meniscus|back|spine|shoulder|disc/i.test(c.name)
        ) || (history.surgeries || []).find((s) => /knee|meniscus|back|spine/i.test(s.procedure));

        return {
          title: 'Your Personalized Workout & Activity Strategy',
          icon: 'barbell',
          color: THEME.colors.fitness,
          points: [
            `Daily Target: ${(goals.steps || 10000).toLocaleString()} steps and 45 active minutes.`,
            jointIssue
              ? `Joint Protection (${jointIssue.name || jointIssue.procedure}): Favor smooth low-impact cardio (cycling, swimming, elliptical) and avoid uncontrolled plyometric jumping or deep loaded knee bends.`
              : 'No joint limitations recorded; safe for progressive compound resistance training.',
            cycle?.enabled
              ? `Cycle Syncing (${cycle.currentPhase} Phase): ${
                  cycle.currentPhase === 'Follicular' || cycle.currentPhase === 'Ovulation'
                    ? 'High energy & estrogen peak! Excellent window for progressive strength training and challenging personal bests.'
                    : 'Hormones are shifting; focus on moderate endurance, restorative movement, and mindful pacing.'
                }`
              : 'Prioritize 3-4 days of resistance training balanced with zone-2 cardio.',
          ],
        };
      }
      case 'vitals': {
        const latestBp = vitals.bloodPressureLogs?.[0];
        const latestBg = vitals.bloodGlucoseLogs?.[0];
        const hasHypertension = (history.conditions || []).some((c) => /hypertension|blood pressure/i.test(c.name));
        const hasDiabetes = (history.conditions || []).some((c) => /diabetes/i.test(c.name)) ||
          (history.familyHistory || []).some((f) => /diabetes/i.test(f.condition));

        return {
          title: 'Clinical Vitals & Preventive Review',
          icon: 'pulse',
          color: THEME.colors.vitals,
          points: [
            latestBp
              ? `Latest Blood Pressure: ${latestBp.systolic}/${latestBp.diastolic} mmHg (${latestBp.category}). ${
                  hasHypertension ? 'Managed target is < 120/80 mmHg.' : 'Within normal physiological range.'
                }`
              : 'No BP readings logged today.',
            latestBg
              ? `Latest Glucose: ${latestBg.levelMgDl} mg/dL (${latestBg.status}). ${
                  hasDiabetes ? 'Family/personal risk active: aim for fasting levels 70-99 mg/dL.' : 'Normal range.'
                }`
              : 'Glucose tracking is on schedule.',
            (vitals.medications || []).length > 0
              ? `${(vitals.medications || []).filter((m) => m.takenToday).length} of ${(vitals.medications || []).length} medications logged taken today.`
              : 'No medications required.',
          ],
        };
      }
      case 'cycle': {
        if (!cycle?.enabled) {
          return {
            title: 'Cycle Tracking',
            icon: 'flower',
            color: '#EC4899',
            points: ['Menstrual cycle tracking is currently turned off. You can enable it anytime in the Cycle tab.'],
          };
        }
        return {
          title: `Hormone Intelligence: Day ${cycle.currentCycleDay} (${cycle.currentPhase} Phase)`,
          icon: 'flower',
          color: '#EC4899',
          points: [
            `Current Phase: ${cycle.phaseTitle}.`,
            `Estimated next period in ${cycle.daysUntilNextPeriod} days.`,
            `Fertility awareness: ${cycle.chanceOfPregnancy}.`,
            cycle.currentPhase === 'Menstrual'
              ? 'Recommendation: Rest, replenish iron, warm teas, and take magnesium for muscle relaxation.'
              : cycle.currentPhase === 'Follicular'
              ? 'Recommendation: Estrogen is building. Ideal time for muscle growth, creative energy, and high endurance.'
              : cycle.currentPhase === 'Ovulation'
              ? 'Recommendation: Peak confidence and power. Estrogen softens connective tissues, so warmup thoroughly.'
              : 'Recommendation: Progesterone dominant. Metabolism is heightened. Prioritize sleep and low-inflammatory foods.',
          ],
        };
      }
      default:
        return null;
    }
  };

  // Comprehensive Clinical Question Answer Engine
  const generateResponse = (rawQuestion) => {
    const q = (rawQuestion || '').trim().toLowerCase();
    if (!q) return null;

    const allergiesList = (history.allergies || []).map((a) => a.allergen).join(', ');
    const jointIssue = (history.conditions || []).find((c) =>
      /knee|meniscus|back|spine|shoulder|disc|joint/i.test(c.name)
    ) || (history.surgeries || []).find((s) => /knee|meniscus|back|spine|shoulder/i.test(s.procedure));
    const hasHypertension = (history.conditions || []).some((c) => /hypertension|blood pressure|high bp/i.test(c.name));
    const hasDiabetes = (history.conditions || []).some((c) => /diabetes/i.test(c.name)) ||
      (history.familyHistory || []).some((f) => /diabetes/i.test(f.condition));
    const latestBp = vitals.bloodPressureLogs?.[0];
    const latestBg = vitals.bloodGlucoseLogs?.[0];

    // 1. CAPABILITIES & META QUESTIONS
    const isMetaQuestion =
      q.includes('what questions can you answer') ||
      q.includes('what questions can it answer') ||
      q.includes('what questions can i ask') ||
      q.includes('what can you answer') ||
      q.includes('what can it answer') ||
      q.includes('what can you do') ||
      q.includes('what can it do') ||
      q.includes('what do you do') ||
      q.includes('help') ||
      q.includes('capabilities') ||
      q.includes('features') ||
      q.includes('who are you') ||
      q.includes('how can you help') ||
      (q.includes('question') && (q.includes('can') || q.includes('answer') || q.includes('ask') || q.includes('what')));

    if (isMetaQuestion) {
      return {
        category: 'Assistant Capabilities & Guidance',
        title: 'Questions I Can Answer For You',
        icon: 'help-circle-outline',
        color: THEME.colors.primary,
        badge: 'Clinical Engine Active',
        intro: `I am your Personal Health Assistant, customized with your health history (${profile.name || 'Harshita'}, ${profile.age || 28}yo, ${profile.weightKg || 62.5}kg). Here is everything you can ask me:`,
        sections: [
          {
            title: '🥗 1. Nutrition, Meals & Allergies',
            points: [
              '• "What should I eat for dinner / lunch / breakfast?" (Gives balanced meal ideas matching your macros)',
              allergiesList
                ? `• "Is this meal safe with my allergies?" (Actively shields against ${allergiesList})`
                : '• "How do I balance my macros and calorie budget?"',
              hasHypertension
                ? '• "What foods help lower blood pressure?" (Recommends low-sodium DASH diet foods)'
                : '• "What snacks boost my energy without sugar crashes?"',
            ],
          },
          {
            title: '🏋️ 2. Joint-Safe Workouts & Injury Protection',
            points: [
              jointIssue
                ? `• "Can I workout with my ${jointIssue.name || jointIssue.procedure}?" (Recommends joint-safe alternatives)`
                : '• "What exercises should I do today for my fitness goal?"',
              '• "How should I adapt my training to my current cycle phase?"',
              '• "How do I reach my daily step goal without joint strain?"',
            ],
          },
          {
            title: '🌸 3. Menstrual Cycle, Periods & Hormones',
            points: [
              '• "When is my next period?" (Calculates exact remaining days from cycle tracking)',
              '• "How do I relieve period cramps and PMS?" (Phase-specific nutrition & tension relief)',
              '• "What phase am I in and what does it mean for my mood and energy?"',
              '• "What is my fertility window right now?"',
            ],
          },
          {
            title: '🩺 4. Vitals, Blood Pressure & Blood Sugar',
            points: [
              '• "How is my blood pressure reading?" (Analyzes systolic/diastolic vs clinical stages)',
              '• "How to lower blood pressure naturally?" (Sodium < 2,000mg, potassium, zone-2 walks)',
              '• "Is my fasting glucose reading healthy?" (ADA clinical ranges & glycemic balance)',
            ],
          },
          {
            title: '💊 5. Medications, Supplements & Daily Targets',
            points: [
              '• "Did I take all my medications today?" (Checks your daily adherence logs)',
              '• "What supplements support my profile?" (Evidence-backed D3, Magnesium, Omega-3s)',
              '• "What are my daily calorie, protein, and water targets?"',
            ],
          },
        ],
        relevantData: [
          `Profile: ${profile.name || 'Harshita'}`,
          allergiesList ? `Allergies: ${allergiesList}` : 'No Allergies',
          jointIssue ? `Joint: ${jointIssue.name || jointIssue.procedure}` : 'No Joint Limits',
          cycle?.enabled ? `Cycle: Day ${cycle.currentCycleDay} (${cycle.currentPhase})` : 'Cycle: Inactive',
        ],
        followUps: [
          'What should I eat for dinner?',
          'Safe workout for my joints',
          'How to relieve period cramps?',
        ],
      };
    }

    // 2. MENSTRUAL CYCLE, PERIODS, CRAMPS, PMS, HORMONES
    if (
      q.includes('cramp') ||
      q.includes('period') ||
      q.includes('cycle') ||
      q.includes('pms') ||
      q.includes('ovulat') ||
      q.includes('follicular') ||
      q.includes('luteal') ||
      q.includes('menstrua') ||
      q.includes('bleed') ||
      q.includes('flow') ||
      q.includes('pregnan') ||
      q.includes('fertil') ||
      q.includes('hormone')
    ) {
      if (!cycle?.enabled) {
        return {
          category: 'Menstrual Health',
          title: 'Period & Hormone Tracking',
          icon: 'flower',
          color: '#EC4899',
          badge: 'Tracking Currently Off',
          intro: 'Menstrual cycle tracking is currently disabled in your profile.',
          points: [
            'You can turn on Cycle Tracking anytime by tapping the Cycle tab or updating your Health Intake Assessment.',
            'Once enabled, the assistant will predict your next period, calculate fertility windows, and personalize your diet and workout recommendations for every phase.',
          ],
          followUps: ['What questions can you answer?', 'What should I eat for dinner?'],
        };
      }

      const isCrampQuery = q.includes('cramp') || q.includes('pain') || q.includes('pms') || q.includes('ache');
      return {
        category: 'Menstrual & Hormone Intelligence',
        title: isCrampQuery ? 'Period Cramp & Symptom Protocol' : `Cycle Intelligence: Day ${cycle.currentCycleDay} (${cycle.currentPhase} Phase)`,
        icon: 'flower',
        color: '#EC4899',
        badge: `Day ${cycle.currentCycleDay} • ${cycle.currentPhase}`,
        intro: `You are currently on Day ${cycle.currentCycleDay} of your cycle (${cycle.phaseTitle}). Your next period is estimated in ${cycle.daysUntilNextPeriod} days.`,
        points: isCrampQuery
          ? [
              'Magnesium Glycinate (300-400mg): Relaxes uterine smooth muscle and clinically eases cramping tension.',
              'Thermal Therapy: Apply a warm heating pad or take a warm bath for 15-20 minutes to improve pelvic blood circulation.',
              'Anti-inflammatory Hydration: Warm ginger or chamomile tea, plus targeting your full ' + (goals.waterMl || 2500) + 'ml daily water to reduce pelvic fluid retention.',
              'Gentle Movement: Cat-cow poses, child\'s pose, and light walking release natural endorphins without straining abdominal walls.',
            ]
          : [
              `Cycle Status: Day ${cycle.currentCycleDay} (${cycle.currentPhase} Phase). Next period in ${cycle.daysUntilNextPeriod} days.`,
              `Fertility Awareness: ${cycle.chanceOfPregnancy}.`,
              cycle.currentPhase === 'Menstrual'
                ? 'Phase Guidance: Estrogen & progesterone are at their lowest baseline. Prioritize rest, iron-rich meals (lentils, spinach, lean meats), and gentle restorative movement.'
                : cycle.currentPhase === 'Follicular'
                ? 'Phase Guidance: Estrogen is surging! Your energy, cognitive clarity, and physical power are peaking. Ideal window for progressive strength training.'
                : cycle.currentPhase === 'Ovulation'
                ? 'Phase Guidance: Luteinizing Hormone (LH) and estrogen peak. You may feel high confidence and social energy. Connective tissues are slightly more lax, so warm up thoroughly before heavy lifts.'
                : 'Phase Guidance: Progesterone is dominant. Resting metabolic rate is elevated by ~100-200 kcal. Choose complex carbohydrates (oats, brown rice, sweet potatoes) to regulate serotonin and minimize PMS cravings.',
            ],
        relevantData: [
          `Current Phase: ${cycle.currentPhase}`,
          `Cycle Day: ${cycle.currentCycleDay}`,
          `Next Period: In ${cycle.daysUntilNextPeriod} days`,
          `Fertility: ${cycle.chanceOfPregnancy}`,
        ],
        followUps: [
          'What should I eat in this cycle phase?',
          'Safe workouts for today',
          'What questions can you answer?',
        ],
      };
    }

    // 3. NUTRITION, DIET, FOOD, DINNER, LUNCH, ALLERGIES, CALORIES
    if (
      q.includes('eat') ||
      q.includes('food') ||
      q.includes('dinner') ||
      q.includes('lunch') ||
      q.includes('breakfast') ||
      q.includes('snack') ||
      q.includes('diet') ||
      q.includes('recipe') ||
      q.includes('hungry') ||
      q.includes('allerg') ||
      q.includes('protein') ||
      q.includes('carb') ||
      q.includes('fat') ||
      q.includes('calorie') ||
      q.includes('meal')
    ) {
      const allergyPoints = (history.allergies || []).map((a) => `Strictly avoid ${a.allergen} (${a.severity || 'moderate'} reaction risk).`);
      return {
        category: 'Personalized Nutrition Protocol',
        title: 'Allergy-Safe & Target-Aligned Meal Guidance',
        icon: 'restaurant',
        color: THEME.colors.nutrition,
        badge: `${goals.calories || 2100} kcal • ${(history.allergies || []).length} Allergies Shielded`,
        intro: `Tailored for ${profile.name || 'you'} (${profile.age || 28}yo, ${profile.weightKg || 70}kg, daily goal: ${goals.calories || 2100} kcal):`,
        points: [
          `Daily Macro Targets: ${goals.calories || 2100} kcal total — ${goals.proteinG || 140}g Protein (~30%), ${goals.carbsG || 200}g Carbs (~45%), ${goals.fatG || 65}g Healthy Fats (~25%).`,
          allergiesList
            ? `Active Allergy Shield: All recommended meals strictly exclude: ${allergiesList}.`
            : 'No food allergies recorded. Safe for all whole food groups.',
          hasHypertension
            ? 'DASH Sodium Protocol: Keep sodium under 2,000mg. Season meals with lemon juice, garlic, turmeric, and herbs rather than added salt to safeguard blood pressure.'
            : 'Focus on whole, unprocessed foods and high-fiber complex carbohydrates.',
          cycle?.enabled && cycle?.currentPhase === 'Luteal'
            ? 'Luteal Phase Hormone Support: Progesterone increases cravings. Prioritize slow-digesting carbs (quinoa, sweet potatoes) and dark chocolate (70%+) to support serotonin production.'
            : 'Meal Timing: Distribute 30-40g protein across 3-4 meals to optimize muscle protein synthesis and satiety.',
          'Recommended Dinner Idea: Herb-crusted wild salmon or grilled tofu with steamed asparagus, quinoa, and a fresh spinach salad with olive oil dressing (100% free of ' + (allergiesList || 'common allergens') + ').',
        ],
        relevantData: [
          `Calories: ${goals.calories || 2100} kcal`,
          `Protein: ${goals.proteinG || 140}g`,
          allergiesList ? `Allergies: ${allergiesList}` : 'No Allergies',
          hasHypertension ? 'Hypertension DASH Mode' : 'Standard Balanced',
        ],
        followUps: [
          'Safe workout for my joints',
          'How to lower my blood pressure?',
          'What questions can you answer?',
        ],
      };
    }

    // 4. WORKOUTS, EXERCISE, GYM, FITNESS, KNEE, BACK, JOINTS, STEPS
    if (
      q.includes('workout') ||
      q.includes('exercise') ||
      q.includes('gym') ||
      q.includes('fitness') ||
      q.includes('run') ||
      q.includes('cardio') ||
      q.includes('lift') ||
      q.includes('strength') ||
      q.includes('knee') ||
      q.includes('back') ||
      q.includes('joint') ||
      q.includes('spine') ||
      q.includes('injur') ||
      q.includes('walk') ||
      q.includes('step')
    ) {
      return {
        category: 'Personalized Fitness Strategy',
        title: jointIssue ? `Joint-Safe Workout Plan (${jointIssue.name || jointIssue.procedure})` : 'Target Fitness & Strength Routine',
        icon: 'barbell',
        color: THEME.colors.fitness,
        badge: jointIssue ? 'Joint Protection Active' : 'Unrestricted Progression',
        intro: `Based on your biometrics (${profile.weightKg || 70}kg) and medical history:`,
        points: [
          `Daily Target: ${(goals.steps || 10000).toLocaleString()} steps and 45 active minutes.`,
          jointIssue
            ? `Joint Adaptation (${jointIssue.name || jointIssue.procedure}): Replace high-impact pounding (pavement running, box jumps, heavy loaded deep squats) with zero-impact cardiovascular work (indoor stationary cycling, swimming, rowing, elliptical).`
            : 'No orthopedic restrictions recorded. Safe for progressive compound barbell/dumbbell resistance training.',
          cycle?.enabled
            ? `Cycle Phase Syncing (${cycle.currentPhase}): ${
                cycle.currentPhase === 'Follicular' || cycle.currentPhase === 'Ovulation'
                  ? 'Estrogen levels are high; muscle recovery is fast and pain tolerance is elevated. This is your peak window for strength training and personal bests!'
                  : 'Progesterone is higher and body temperature is slightly elevated. Focus on moderate endurance, zone-2 walking, pilates, and mobility work.'
              }`
            : 'Recommended Split: 3-4 days of full-body resistance training paired with daily zone-2 aerobic walking.',
          'Warmup Protocol: Always spend 5-8 minutes on joint mobility (hip openers, ankle circles, glute bridges) before loading resistance.',
        ],
        relevantData: [
          jointIssue ? `Joint History: ${jointIssue.name || jointIssue.procedure}` : 'Joints: Clear',
          `Daily Step Goal: ${(goals.steps || 10000).toLocaleString()}`,
          cycle?.enabled ? `Cycle Phase: ${cycle.currentPhase}` : 'Cycle: Off',
        ],
        followUps: [
          'What should I eat for dinner?',
          'How to relieve period cramps?',
          'What questions can you answer?',
        ],
      };
    }

    // 5. BLOOD PRESSURE, BP, HYPERTENSION, HEART
    if (
      q.includes('bp') ||
      q.includes('blood pressure') ||
      q.includes('hypertens') ||
      q.includes('heart') ||
      q.includes('cardio') ||
      q.includes('pulse') ||
      q.includes('systolic') ||
      q.includes('diastolic') ||
      q.includes('sodium') ||
      q.includes('salt')
    ) {
      return {
        category: 'Cardiovascular & Vitals Intelligence',
        title: 'Blood Pressure Management Protocol',
        icon: 'pulse',
        color: THEME.colors.vitals,
        badge: latestBp ? `Latest: ${latestBp.systolic}/${latestBp.diastolic} mmHg` : 'Clinical Guardrails',
        intro: hasHypertension
          ? 'You have diagnosed mild hypertension in your medical profile. Managing vascular resistance is critical:'
          : 'Cardiovascular wellness protocol for maintaining healthy arterial elasticity:',
        points: [
          latestBp
            ? `Latest Logged Reading: ${latestBp.systolic}/${latestBp.diastolic} mmHg (${latestBp.category}). Target for optimal longevity is < 120/80 mmHg.`
            : 'No BP readings logged today. We recommend logging your BP in the morning before caffeine.',
          'DASH Sodium Protocol: Restrict dietary sodium to < 2,000 mg/day (roughly 1 level teaspoon of table salt across all meals).',
          'Potassium & Magnesium Foods: Eat avocados, spinach, coconut water, and bananas to counteract sodium and promote vascular dilation.',
          'Aerobic Walking: 30 minutes of brisk zone-2 walking daily stimulates nitric oxide production in arterial walls, naturally lowering systolic pressure by 4-9 mmHg.',
          'Hydration: Drink your full ' + (goals.waterMl || 2500) + 'ml water target daily to maintain proper blood plasma volume and reduce vascular strain.',
        ],
        relevantData: [
          hasHypertension ? 'Diagnosed: Mild Hypertension' : 'BP History: Normal',
          latestBp ? `Latest BP: ${latestBp.systolic}/${latestBp.diastolic}` : 'No Logged BP Today',
          `Water Target: ${goals.waterMl || 2500} ml`,
        ],
        followUps: [
          'What should I eat for dinner?',
          'Check my medications & supplements',
          'What questions can you answer?',
        ],
      };
    }

    // 6. BLOOD SUGAR, GLUCOSE, DIABETES, INSULIN
    if (
      q.includes('glucose') ||
      q.includes('sugar') ||
      q.includes('diabet') ||
      q.includes('insulin') ||
      q.includes('fasting') ||
      q.includes('hba1c') ||
      q.includes('glycemic')
    ) {
      return {
        category: 'Metabolic & Glucose Control',
        title: 'Blood Glucose & Glycemic Health',
        icon: 'water-outline',
        color: THEME.colors.vitals,
        badge: latestBg ? `Latest: ${latestBg.levelMgDl} mg/dL` : 'Metabolic Guardrail',
        intro: hasDiabetes
          ? 'Metabolic caution active based on your diabetes personal/family history:'
          : 'Healthy metabolic maintenance and insulin sensitivity protocol:',
        points: [
          latestBg
            ? `Latest Logged Glucose: ${latestBg.levelMgDl} mg/dL (${latestBg.status}). Fasting target is 70-99 mg/dL.`
            : 'Fasting Target: Aim for 70-99 mg/dL in the morning before meals.',
          'Food Pairing: Never consume "naked carbohydrates". Always pair starches or fruits with healthy fats, dietary fiber, or protein to blunt the post-meal glucose spike.',
          'Post-Meal Movement: A simple 10-15 minute walk after lunch and dinner allows skeletal muscles to absorb glucose directly via GLUT-4 transporters without requiring excess insulin.',
          'Fiber Target: Aim for 30-35g of prebiotic soluble fiber (chia seeds, oats, legumes, broccoli) daily.',
        ],
        relevantData: [
          hasDiabetes ? 'Diabetes Risk: Active' : 'Diabetes Risk: Low',
          latestBg ? `Latest Reading: ${latestBg.levelMgDl} mg/dL` : 'Fasting Norm: 70-99 mg/dL',
        ],
        followUps: [
          'What should I eat for dinner?',
          'Safe workout for my joints',
          'What questions can you answer?',
        ],
      };
    }

    // 7. MEDICATIONS & SUPPLEMENTS
    if (
      q.includes('med') ||
      q.includes('pill') ||
      q.includes('supplement') ||
      q.includes('vitamin') ||
      q.includes('prescrib') ||
      q.includes('dosage') ||
      q.includes('dose')
    ) {
      const meds = vitals.medications || [];
      const takenCount = meds.filter((m) => m.takenToday).length;
      return {
        category: 'Medication & Supplement Protocol',
        title: 'Active Regimen & Supplement Guidance',
        icon: 'medkit-outline',
        color: THEME.colors.vitals,
        badge: `${takenCount}/${meds.length} Taken Today`,
        intro: `Here is your current clinical adherence and evidence-based supplement overview:`,
        points: [
          meds.length > 0
            ? `Logged Medications: ${takenCount} of ${meds.length} logged taken today (${meds.map((m) => m.name + ' - ' + m.dosage).join(', ')}).`
            : 'No prescription medications currently logged in your vitals tracker.',
          'Vitamin D3 (2,000 - 5,000 IU): Supports bone mineral density, immune competence, and healthy mood regulation.',
          'Magnesium Glycinate (300 - 400 mg): Highly bioavailable form supporting deep sleep, muscle relaxation, blood pressure regulation, and cycle cramp relief.',
          'Omega-3 EPA/DHA (1,000 - 2,000 mg): Clinically reduces systemic inflammation, lubricates joints (beneficial for your joint history), and supports cardiovascular elasticity.',
          'Clinical Safety Note: Always confirm new supplements with your physician or pharmacist, especially if taking prescription medications.',
        ],
        relevantData: [
          `Medications: ${meds.length} active`,
          `Adherence: ${takenCount}/${meds.length}`,
        ],
        followUps: [
          'How to lower my blood pressure?',
          'What questions can you answer?',
          'My daily targets & hydration',
        ],
      };
    }

    // 8. WATER, HYDRATION, SLEEP, FATIGUE, ENERGY
    if (
      q.includes('water') ||
      q.includes('hydrat') ||
      q.includes('drink') ||
      q.includes('thirst') ||
      q.includes('tired') ||
      q.includes('fatigue') ||
      q.includes('sleep') ||
      q.includes('energy')
    ) {
      return {
        category: 'Hydration & Recovery Optimization',
        title: 'Daily Water & Sleep Restoration',
        icon: 'water',
        color: THEME.colors.habits,
        badge: `${goals.waterMl || 2500} ml Water Target`,
        intro: `Hydration and sleep are the physiological foundation for all your health goals:`,
        points: [
          `Water Target: ${goals.waterMl || 2500} ml per day (calculated from your ${profile.weightKg || 70}kg weight and activity level).`,
          'Cellular Energy: Dehydration of just 1-2% impairs cognitive focus and causes perceived fatigue even after a full night of sleep.',
          'Electrolyte Balance: If exercising or in warm weather, include a pinch of unrefined sea salt or coconut water to maintain sodium-potassium balance.',
          'Sleep Hygiene: Aim for 7.5 - 8.5 hours. Keep your bedroom cool (~19°C/66°F) and discontinue screen exposure 45 minutes before sleep to stimulate natural melatonin production.',
          cycle?.enabled && cycle?.currentPhase === 'Luteal'
            ? 'Hormone Note: In the Luteal phase, body temperature is naturally 0.3-0.5°C higher. Ensure your bedroom is well-ventilated to avoid sleep disruptions.'
            : 'Consistent Wake Time: Waking at the same time each morning anchors your circadian rhythm and boosts daytime energy.',
        ],
        relevantData: [
          `Water Target: ${goals.waterMl || 2500} ml`,
          `Sleep Target: 8 hrs`,
          `Weight: ${profile.weightKg || 70} kg`,
        ],
        followUps: [
          'What should I eat for dinner?',
          'Safe workout for my joints',
          'What questions can you answer?',
        ],
      };
    }

    // 9. WEIGHT LOSS, CALORIE DEFICIT, METABOLISM, BMR, TARGETS
    if (
      q.includes('weight') ||
      q.includes('lose') ||
      q.includes('fat') ||
      q.includes('burn') ||
      q.includes('bmr') ||
      q.includes('tdee') ||
      q.includes('target') ||
      q.includes('goal')
    ) {
      return {
        category: 'Metabolic & Body Composition',
        title: 'BMR, Caloric Budget & Weight Strategy',
        icon: 'flame-outline',
        color: THEME.colors.primary,
        badge: `${goals.calories || 2100} kcal • ${(goals.steps || 10000).toLocaleString()} Steps`,
        intro: `Here is your exact metabolic equation computed via the Mifflin-St Jeor formula:`,
        points: [
          `Basal Metabolic Rate (BMR): ~1,650 kcal (the baseline calories burned at complete rest).`,
          `Total Daily Energy Expenditure (TDEE): ~2,400 kcal based on your light-to-moderate activity.`,
          `Calorie Target: ${goals.calories || 2100} kcal/day (sustainable ~300 kcal deficit for safe fat loss of ~0.5-1 lb per week without metabolic adaptation).`,
          `Protein Anchor: ${goals.proteinG || 140}g protein daily. Adequate protein prevents muscle catabolism while in a caloric deficit.`,
          `Daily Step Target: ${(goals.steps || 10000).toLocaleString()} steps (~400-500 kcal burned through Non-Exercise Activity Thermogenesis).`,
        ],
        relevantData: [
          `Current Weight: ${profile.weightKg || 70} kg`,
          `Calorie Target: ${goals.calories || 2100} kcal`,
          `Protein Target: ${goals.proteinG || 140} g`,
        ],
        followUps: [
          'What should I eat for dinner?',
          'Safe workout for my joints',
          'What questions can you answer?',
        ],
      };
    }

    // 10. DEFAULT / GENERAL QUERY SYNTHESIS
    return {
      category: 'Personal Health Synthesis',
      title: 'Synthesized Health Recommendation',
      icon: 'sparkles',
      color: THEME.colors.primary,
      badge: `${profile.name || 'Harshita'} Profile Active`,
      intro: `Here is your personalized summary based on your profile (${profile.name || 'Harshita'}, ${profile.age || 28}yo, ${profile.weightKg || 62.5}kg):`,
      points: [
        `Daily Nutrition Targets: ${goals.calories || 2100} kcal, ${goals.proteinG || 140}g protein, and ${goals.waterMl || 2500}ml water.`,
        allergiesList
          ? `Allergy Safeguard: Actively shielding against ${allergiesList}.`
          : 'No food allergies recorded.',
        jointIssue
          ? `Joint Precaution: Favor low-impact exercise for your ${jointIssue.name || jointIssue.procedure}.`
          : 'Physical activity: Safe for progressive strength and cardio.',
        cycle?.enabled
          ? `Hormone Status: Day ${cycle.currentCycleDay} (${cycle.currentPhase} Phase). Next period in ${cycle.daysUntilNextPeriod} days.`
          : 'Cycle tracking is currently disabled.',
        hasHypertension
          ? 'Cardiovascular Protocol: DASH low-sodium guidelines active (<2,000mg sodium).'
          : 'Vitals tracking: Blood pressure and heart rate monitoring active.',
      ],
      relevantData: [
        `Calories: ${goals.calories || 2100} kcal`,
        `Water: ${goals.waterMl || 2500} ml`,
        allergiesList ? `Allergies: ${allergiesList}` : 'Allergies: None',
      ],
      followUps: [
        'What questions can you answer?',
        'What should I eat for dinner?',
        'Safe workout for my joints',
        'How to relieve period cramps?',
      ],
    };
  };

  const handleAsk = async (queryText) => {
    const q = queryText || customQuestion;
    if (!q || !q.trim()) return;
    const localAnswer = generateResponse(q);
    setCustomAnswer(localAnswer);

    try {
      const remote = await api.queryAdvisor(q);
      if (remote && remote.answer) {
        setCustomAnswer({
          category: 'Clinical Health Advisor API',
          title: remote.headline || localAnswer?.title || 'Personalized Health Recommendation',
          icon: 'sparkles',
          color: THEME.colors.primary,
          badge: remote.guardrailTriggered || `${profile.name || 'Harshita'} Guardrails Synced`,
          intro: `Clinical AI synthesis for ${profile.name || 'Harshita'}:`,
          points: [remote.answer, ...(localAnswer?.points || []).slice(0, 3)],
          relevantData: localAnswer?.relevantData || [],
          followUps: localAnswer?.followUps || [],
        });
      }
    } catch (e) {
      // Offline fallback is already active
    }
  };

  const handleChipPress = (prompt) => {
    setCustomQuestion(prompt.query);
    handleAsk(prompt.query);
  };

  const adviceData = activeQuery ? getTailoredAdvice(activeQuery) : null;

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Personal Health Advisor"
      subtitle={`Tailored for ${profile.name || 'You'} • Clinical synthesis`}
    >
      {/* Overview Banner */}
      <View style={styles.heroBox}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconBox}>
            <Ionicons name="sparkles" size={20} color={THEME.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Your Health Action Plan is Active</Text>
            <Text style={styles.heroSub}>
              Synthesized from your biometrics, medical history & daily logs.
            </Text>
          </View>
        </View>

        {/* Quick Targets Pill Row */}
        <View style={styles.targetsRow}>
          <Text style={styles.targetPill}>🔥 {goals.calories || 2100} kcal</Text>
          <Text style={styles.targetPill}>💧 {goals.waterMl || 2500} ml</Text>
          <Text style={styles.targetPill}>🥩 {goals.proteinG || 140}g Protein</Text>
          <Text style={styles.targetPill}>👟 {(goals.steps || 10000).toLocaleString()} Steps</Text>
        </View>
      </View>

      {/* Suggested Quick Prompt Chips */}
      <Text style={styles.sectionTitle}>Tap a question to ask instantly:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptScroll}
      >
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.promptChip}
            onPress={() => handleChipPress(prompt)}
            activeOpacity={0.7}
          >
            <Text style={styles.promptChipText}>{prompt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Topics / Action Cards */}
      <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Or explore clinical domains:</Text>
      <View style={styles.queriesGrid}>
        <TouchableOpacity
          style={[styles.queryCard, activeQuery === 'nutrition' && styles.queryCardActive]}
          onPress={() => setActiveQuery(activeQuery === 'nutrition' ? null : 'nutrition')}
        >
          <View style={[styles.queryIcon, { backgroundColor: THEME.colors.nutritionMuted }]}>
            <Ionicons name="restaurant" size={18} color={THEME.colors.nutrition} />
          </View>
          <Text style={styles.queryTitle}>Nutrition & Diet</Text>
          <Text style={styles.queryDesc}>Allergy-safe foods & calories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.queryCard, activeQuery === 'fitness' && styles.queryCardActive]}
          onPress={() => setActiveQuery(activeQuery === 'fitness' ? null : 'fitness')}
        >
          <View style={[styles.queryIcon, { backgroundColor: THEME.colors.fitnessMuted }]}>
            <Ionicons name="barbell" size={18} color={THEME.colors.fitness} />
          </View>
          <Text style={styles.queryTitle}>Safe Workouts</Text>
          <Text style={styles.queryDesc}>Joint protection & routines</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.queryCard, activeQuery === 'vitals' && styles.queryCardActive]}
          onPress={() => setActiveQuery(activeQuery === 'vitals' ? null : 'vitals')}
        >
          <View style={[styles.queryIcon, { backgroundColor: THEME.colors.vitalsMuted }]}>
            <Ionicons name="pulse" size={18} color={THEME.colors.vitals} />
          </View>
          <Text style={styles.queryTitle}>Vitals & BP</Text>
          <Text style={styles.queryDesc}>Clinical target review</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.queryCard, activeQuery === 'cycle' && styles.queryCardActive]}
          onPress={() => setActiveQuery(activeQuery === 'cycle' ? null : 'cycle')}
        >
          <View style={[styles.queryIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
            <Ionicons name="flower" size={18} color="#EC4899" />
          </View>
          <Text style={styles.queryTitle}>Cycle Syncing</Text>
          <Text style={styles.queryDesc}>Hormone energy guidance</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Topic Advice Box */}
      {adviceData && (
        <View style={[styles.adviceBox, { borderColor: adviceData.color }]}>
          <View style={styles.adviceBoxHeader}>
            <Ionicons name={adviceData.icon} size={20} color={adviceData.color} />
            <Text style={[styles.adviceBoxTitle, { color: adviceData.color }]}>
              {adviceData.title}
            </Text>
          </View>
          {adviceData.points.map((pt, idx) => (
            <View key={idx} style={styles.advicePointRow}>
              <Text style={[styles.adviceBullet, { color: adviceData.color }]}>•</Text>
              <Text style={styles.advicePointText}>{pt}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Ask Health Assistant Anything Input */}
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Type your custom question:</Text>
      <View style={styles.askContainer}>
        <TextInput
          style={styles.askInput}
          value={customQuestion}
          onChangeText={setCustomQuestion}
          onSubmitEditing={() => handleAsk(customQuestion)}
          placeholder="e.g. What questions can you answer? Or ask about meals, workouts..."
          placeholderTextColor={THEME.colors.textMuted}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.askBtn}
          onPress={() => handleAsk(customQuestion)}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={16} color={THEME.colors.bgDark} />
        </TouchableOpacity>
      </View>

      {/* Structured Rich Assistant Answer */}
      {customAnswer && (
        <View style={[styles.answerBox, { borderColor: customAnswer.color || THEME.colors.primary }]}>
          {/* Answer Header */}
          <View style={styles.answerHeader}>
            <View style={[styles.answerIconBox, { backgroundColor: (customAnswer.color || THEME.colors.primary) + '22' }]}>
              <Ionicons name={customAnswer.icon || 'bulb-outline'} size={18} color={customAnswer.color || THEME.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.answerBadgeRow}>
                <Text style={[styles.answerCategoryBadge, { color: customAnswer.color || THEME.colors.primary, backgroundColor: (customAnswer.color || THEME.colors.primary) + '20' }]}>
                  {customAnswer.category || 'Health Assistant'}
                </Text>
                {customAnswer.badge && (
                  <Text style={styles.answerSubBadge}>{customAnswer.badge}</Text>
                )}
              </View>
              <Text style={styles.answerTitle}>{customAnswer.title}</Text>
            </View>
          </View>

          {/* Intro Paragraph */}
          {customAnswer.intro ? (
            <Text style={styles.answerIntro}>{customAnswer.intro}</Text>
          ) : null}

          {/* Regular Bullet Points */}
          {customAnswer.points && customAnswer.points.map((pt, idx) => (
            <View key={idx} style={styles.answerPointRow}>
              <Text style={[styles.answerBullet, { color: customAnswer.color || THEME.colors.primary }]}>•</Text>
              <Text style={styles.answerPointText}>{pt}</Text>
            </View>
          ))}

          {/* Structured Sections (Used for capabilities guide) */}
          {customAnswer.sections && customAnswer.sections.map((sec, sIdx) => (
            <View key={sIdx} style={styles.answerSectionBox}>
              <Text style={styles.answerSectionTitle}>{sec.title}</Text>
              {sec.points.map((p, pIdx) => (
                <View key={pIdx} style={styles.answerSectionPointRow}>
                  <Text style={styles.answerSectionPointText}>{p}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Inputs Factored In */}
          {customAnswer.relevantData && (
            <View style={styles.relevantDataContainer}>
              <Text style={styles.relevantDataTitle}>Inputs Factored In:</Text>
              <View style={styles.relevantDataRow}>
                {customAnswer.relevantData.map((d, dIdx) => (
                  <Text key={dIdx} style={styles.relevantDataPill}>{d}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Follow-up Chips */}
          {customAnswer.followUps && customAnswer.followUps.length > 0 && (
            <View style={styles.followUpContainer}>
              <Text style={styles.followUpTitle}>Suggested next questions:</Text>
              <View style={styles.followUpRow}>
                {customAnswer.followUps.map((f, fIdx) => (
                  <TouchableOpacity
                    key={fIdx}
                    style={styles.followUpChip}
                    onPress={() => {
                      setCustomQuestion(f);
                      handleAsk(f);
                    }}
                  >
                    <Text style={styles.followUpChipText}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  heroBox: {
    backgroundColor: THEME.colors.bgCardLight,
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  heroIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  heroSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  targetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  targetPill: {
    backgroundColor: THEME.colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  promptScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 8,
  },
  promptChip: {
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  promptChipText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  queriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  queryCard: {
    width: '48%',
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 4,
  },
  queryCardActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryMuted,
  },
  queryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  queryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  queryDesc: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  adviceBox: {
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    padding: 14,
    borderWidth: 1.5,
    marginTop: 12,
  },
  adviceBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  adviceBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  advicePointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginVertical: 3,
  },
  adviceBullet: {
    fontSize: 16,
    lineHeight: 18,
  },
  advicePointText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 17,
    flex: 1,
  },
  askContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  askInput: {
    flex: 1,
    backgroundColor: THEME.colors.bgInput,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.colors.textPrimary,
    fontSize: 13,
  },
  askBtn: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBox: {
    backgroundColor: THEME.colors.bgInput,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1.5,
    marginTop: 8,
    marginBottom: 16,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  answerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  answerCategoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  answerSubBadge: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  answerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  answerIntro: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    lineHeight: 18,
    marginBottom: 10,
  },
  answerPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginVertical: 3,
  },
  answerBullet: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
  answerPointText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  answerSectionBox: {
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.sm,
    padding: 10,
    marginVertical: 4,
  },
  answerSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  answerSectionPointRow: {
    marginVertical: 2,
  },
  answerSectionPointText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  relevantDataContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  relevantDataTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  relevantDataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  relevantDataPill: {
    backgroundColor: THEME.colors.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    fontSize: 10,
    color: THEME.colors.textSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  followUpContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  followUpTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  followUpRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  followUpChip: {
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primaryMuted,
  },
  followUpChipText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
});
