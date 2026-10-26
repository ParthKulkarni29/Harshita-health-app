import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import ModalWrapper from './ModalWrapper';

const COMMON_CONDITIONS = [
  'Mild Hypertension (High BP)',
  'Pre-diabetes / Diabetes',
  'PCOS (Polycystic Ovarian)',
  'Asthma / Respiratory',
  'Thyroid Disorder',
  'High Cholesterol',
  'GERD / Acid Reflux',
  'None / Healthy Baseline',
];

const COMMON_ALLERGIES = [
  'Lactose / Dairy',
  'Peanuts & Tree Nuts',
  'Gluten / Wheat',
  'Shellfish / Seafood',
  'Eggs',
  'Soy',
  'Penicillin / Medication',
  'None',
];

const COMMON_INJURIES = [
  'Knee Meniscus / Ligament',
  'Lower Back / Lumbar Disc',
  'Shoulder Impingement',
  'Neck / Cervical Strain',
  'Plantar Fasciitis',
  'None',
];

const COMMON_FAMILY_RISKS = [
  'Heart Disease / CAD',
  'Type 2 Diabetes',
  'Hypertension',
  'Stroke',
  'Cancer Risk',
  'None',
];

const HEALTH_GOALS = [
  'Cardiovascular & BP Health',
  'Weight Management / Fat Loss',
  'Hormone & Cycle Harmony',
  'Strength & Muscle Toning',
  'Energy & Restful Sleep',
  'Digestive & Gut Health',
];

export default function HealthIntakeModal({ visible, onClose, onComplete, initialData }) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Step 1: Biometrics
  const [name, setName] = useState(initialData?.profile?.name || 'Harshita');
  const [age, setAge] = useState(String(initialData?.profile?.age || '28'));
  const [sex, setSex] = useState('Female'); // 'Female', 'Male', 'Other'
  const [heightCm, setHeightCm] = useState(String(initialData?.profile?.heightCm || '168'));
  const [weightKg, setWeightKg] = useState(String(initialData?.profile?.weightKg || '65'));
  const [activityLevel, setActivityLevel] = useState('Moderate'); // 'Sedentary', 'Light', 'Moderate', 'Very Active'

  // Step 2: Goals
  const [selectedGoals, setSelectedGoals] = useState(['Cardiovascular & BP Health', 'Hormone & Cycle Harmony']);

  // Step 3: Medical Conditions & Allergies
  const [selectedConditions, setSelectedConditions] = useState(['Mild Hypertension (High BP)']);
  const [selectedAllergies, setSelectedAllergies] = useState(['Lactose / Dairy']);
  const [customCondition, setCustomCondition] = useState('');

  // Step 4: Injuries & Family History
  const [selectedInjuries, setSelectedInjuries] = useState(['Knee Meniscus / Ligament']);
  const [selectedFamilyRisks, setSelectedFamilyRisks] = useState(['Type 2 Diabetes']);

  // Step 5: Menstrual Cycle Tracking (If applicable)
  const [trackCycle, setTrackCycle] = useState(true);
  const [avgCycleDays, setAvgCycleDays] = useState('28');
  const [avgPeriodDays, setAvgPeriodDays] = useState('5');
  const [daysAgoPeriodStarted, setDaysAgoPeriodStarted] = useState('14'); // e.g. 14 days ago = today is day 14

  // Step 6: Medications
  const [medicationsInput, setMedicationsInput] = useState('Vitamin D3 (2000 IU), Magnesium (200mg)');

  // Helper toggle functions
  const toggleItem = (list, setList, item) => {
    if (item === 'None' || item === 'None / Healthy Baseline') {
      setList([item]);
      return;
    }
    const filtered = list.filter((i) => i !== 'None' && i !== 'None / Healthy Baseline');
    if (filtered.includes(item)) {
      setList(filtered.filter((i) => i !== item));
    } else {
      setList([...filtered, item]);
    }
  };

  const calculateCustomProtocol = () => {
    const ageNum = parseInt(age, 10) || 28;
    const heightNum = parseFloat(heightCm) || 168;
    const weightNum = parseFloat(weightKg) || 65;

    // BMR via Mifflin-St Jeor
    let bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum;
    if (sex === 'Male') bmr += 5;
    else bmr -= 161;

    // Activity multiplier
    let mult = 1.35;
    if (activityLevel === 'Sedentary') mult = 1.2;
    else if (activityLevel === 'Light') mult = 1.35;
    else if (activityLevel === 'Moderate') mult = 1.5;
    else if (activityLevel === 'Very Active') mult = 1.7;

    const maintenanceCalories = Math.round(bmr * mult);
    let targetCalories = maintenanceCalories;
    if (selectedGoals.includes('Weight Management / Fat Loss')) {
      targetCalories = Math.round(maintenanceCalories * 0.85); // 15% deficit
    }

    // Hydration: 35ml per kg
    const targetWaterMl = Math.round(weightNum * 35);

    // Macros: Protein ~1.6g/kg, Fat ~25% calories, Carbs remainder
    const targetProteinG = Math.round(weightNum * 1.6);
    const targetFatG = Math.round((targetCalories * 0.28) / 9);
    const targetCarbsG = Math.max(100, Math.round((targetCalories - (targetProteinG * 4 + targetFatG * 9)) / 4));

    // Steps
    let targetSteps = 10000;
    if (activityLevel === 'Sedentary') targetSteps = 8000;
    else if (activityLevel === 'Very Active') targetSteps = 12000;

    return {
      targetCalories,
      targetWaterMl,
      targetProteinG,
      targetFatG,
      targetCarbsG,
      targetSteps,
    };
  };

  const handleFinish = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      setStep(1);
      return;
    }

    const protocol = calculateCustomProtocol();

    // Prepare Health History
    const conditions = selectedConditions
      .filter((c) => !c.includes('None'))
      .map((c, idx) => ({
        id: `c_user_${idx}`,
        name: c,
        diagnosedYear: new Date().getFullYear() - 1,
        status: 'Active Management',
        severity: 'Moderate',
        physicianNotes: 'Monitored under personal health protocol',
      }));

    if (customCondition.trim()) {
      conditions.push({
        id: `c_user_custom`,
        name: customCondition.trim(),
        diagnosedYear: new Date().getFullYear(),
        status: 'Active',
        severity: 'Mild',
        physicianNotes: 'User-specified diagnosis',
      });
    }

    const allergies = selectedAllergies
      .filter((a) => !a.includes('None'))
      .map((a, idx) => ({
        id: `a_user_${idx}`,
        allergen: a,
        severity: 'Moderate',
        reaction: 'Sensitivities and inflammatory response',
      }));

    const surgeries = selectedInjuries
      .filter((i) => !i.includes('None'))
      .map((i, idx) => ({
        id: `i_user_${idx}`,
        procedure: `${i} Protection`,
        year: new Date().getFullYear() - 1,
        notes: 'Avoid high impact plyometrics, prioritize warmups',
      }));

    const familyHistory = selectedFamilyRisks
      .filter((f) => !f.includes('None'))
      .map((f, idx) => ({
        id: `f_user_${idx}`,
        relation: 'Direct Family',
        condition: f,
        diagnosedAge: 50,
        notes: 'Annual screening and lifestyle mitigation recommended',
      }));

    // Prepare Cycle Model if tracking
    let cycleData = initialData?.cycle || {};
    if (trackCycle) {
      const daysAgo = parseInt(daysAgoPeriodStarted, 10) || 1;
      const periodDate = new Date();
      periodDate.setDate(periodDate.getDate() - (daysAgo - 1));
      const avgC = parseInt(avgCycleDays, 10) || 28;
      const avgP = parseInt(avgPeriodDays, 10) || 5;

      let phase = 'Follicular';
      let phaseTitle = 'Follicular Phase (Energy Rising)';
      let chanceOfPregnancy = 'Moderate';
      if (daysAgo <= avgP) {
        phase = 'Menstrual';
        phaseTitle = 'Menstrual Phase';
        chanceOfPregnancy = 'Low (Menstruation)';
      } else if (daysAgo >= 14 && daysAgo <= 16) {
        phase = 'Ovulation';
        phaseTitle = 'Ovulatory Phase (Peak Fertility)';
        chanceOfPregnancy = 'High (Peak Fertility Window)';
      } else if (daysAgo > 16) {
        phase = 'Luteal';
        phaseTitle = 'Luteal Phase (PMS & Rest)';
        chanceOfPregnancy = 'Low (Post-Ovulatory Window)';
      }

      cycleData = {
        enabled: true,
        averageCycleDays: avgC,
        averagePeriodDays: avgP,
        lastPeriodStartDate: periodDate.toISOString().split('T')[0],
        currentCycleDay: daysAgo,
        currentPhase: phase,
        phaseTitle,
        daysUntilNextPeriod: Math.max(0, avgC - daysAgo),
        chanceOfPregnancy,
        symptomLogs: cycleData.symptomLogs || [],
        pastCycles: cycleData.pastCycles || [],
      };
    }

    // Prepare Medications
    const meds = medicationsInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m, idx) => ({
        id: `med_user_${idx}`,
        name: m,
        dosage: 'Daily routine',
        schedule: 'Daily',
        time: '08:30 AM',
        takenToday: false,
        streakDays: 0,
      }));

    const updatedData = {
      ...initialData,
      profile: {
        ...initialData.profile,
        name: name.trim(),
        age: parseInt(age, 10) || 28,
        sex,
        heightCm: parseFloat(heightCm) || 168,
        weightKg: parseFloat(weightKg) || 65,
        activityLevel,
        goals: {
          waterMl: protocol.targetWaterMl,
          calories: protocol.targetCalories,
          proteinG: protocol.targetProteinG,
          carbsG: protocol.targetCarbsG,
          fatG: protocol.targetFatG,
          steps: protocol.targetSteps,
          sleepHours: 8,
          activeMinutes: 45,
        },
        healthHistory: {
          conditions,
          allergies,
          familyHistory,
          surgeries,
        },
      },
      cycle: cycleData,
      vitals: {
        ...initialData.vitals,
        medications: meds.length > 0 ? meds : initialData.vitals?.medications || [],
      },
    };

    onComplete(updatedData);
    onClose();
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Personal Health Assessment"
      subtitle={`Step ${step} of ${totalSteps} • Customizing your health blueprint`}
    >
      {/* Progress Dots */}
      <View style={styles.stepsHeader}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View
            key={s}
            style={[
              styles.stepIndicator,
              s === step && styles.stepIndicatorActive,
              s < step && styles.stepIndicatorDone,
            ]}
          />
        ))}
      </View>

      {/* STEP 1: BIOMETRICS & IDENTITY */}
      {step === 1 && (
        <View>
          <Text style={styles.stepTitle}>Let's start with your baseline biometrics</Text>
          <Text style={styles.stepDesc}>
            Used to calculate your personal basal metabolic rate (BMR), hydration targets, and BMI.
          </Text>

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sarah Connor"
            placeholderTextColor={THEME.colors.textMuted}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="28"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Biological Sex</Text>
              <View style={styles.sexRow}>
                {['Female', 'Male'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sexBtn, sex === s && styles.sexBtnActive]}
                    onPress={() => setSex(s)}
                  >
                    <Text style={[styles.sexBtnText, sex === s && styles.sexBtnTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                placeholder="168"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                placeholder="65"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>
          </View>

          <Text style={styles.label}>Daily Physical Activity Level</Text>
          <View style={styles.chipsWrap}>
            {['Sedentary', 'Light', 'Moderate', 'Very Active'].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.chip, activityLevel === lvl && styles.chipActive]}
                onPress={() => setActivityLevel(lvl)}
              >
                <Text style={[styles.chipText, activityLevel === lvl && styles.chipTextActive]}>
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* STEP 2: HEALTH PRIORITIES & GOALS */}
      {step === 2 && (
        <View>
          <Text style={styles.stepTitle}>What are your top health goals?</Text>
          <Text style={styles.stepDesc}>
            Select the areas you want your daily protocol and advisory engine to prioritize.
          </Text>

          <View style={styles.chipsWrap}>
            {HEALTH_GOALS.map((g) => {
              const isSelected = selectedGoals.includes(g);
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.goalChip, isSelected && styles.goalChipActive]}
                  onPress={() => toggleItem(selectedGoals, setSelectedGoals, g)}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                    size={16}
                    color={isSelected ? THEME.colors.primary : THEME.colors.textMuted}
                  />
                  <Text style={[styles.goalChipText, isSelected && styles.goalChipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* STEP 3: MEDICAL CONDITIONS & ALLERGIES */}
      {step === 3 && (
        <View>
          <Text style={styles.stepTitle}>Medical Background & Sensitivities</Text>
          <Text style={styles.stepDesc}>
            Vitalis cross-checks these against your daily meals, workouts, and vitals to prevent flare-ups.
          </Text>

          <Text style={styles.subLabel}>Pre-existing Diagnoses & Conditions</Text>
          <View style={styles.chipsWrap}>
            {COMMON_CONDITIONS.map((c) => {
              const isSelected = selectedConditions.includes(c);
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.medChip, isSelected && styles.medChipActive]}
                  onPress={() => toggleItem(selectedConditions, setSelectedConditions, c)}
                >
                  <Text style={[styles.medChipText, isSelected && styles.medChipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={customCondition}
            onChangeText={setCustomCondition}
            placeholder="Add any other condition (optional)"
            placeholderTextColor={THEME.colors.textMuted}
          />

          <Text style={[styles.subLabel, { marginTop: 14 }]}>Allergies & Food Intolerances</Text>
          <View style={styles.chipsWrap}>
            {COMMON_ALLERGIES.map((a) => {
              const isSelected = selectedAllergies.includes(a);
              return (
                <TouchableOpacity
                  key={a}
                  style={[styles.allergyChip, isSelected && styles.allergyChipActive]}
                  onPress={() => toggleItem(selectedAllergies, setSelectedAllergies, a)}
                >
                  <Text style={[styles.allergyChipText, isSelected && styles.allergyChipTextActive]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* STEP 4: INJURIES & FAMILY HEALTH */}
      {step === 4 && (
        <View>
          <Text style={styles.stepTitle}>Joint Precautions & Familial Risks</Text>
          <Text style={styles.stepDesc}>
            Informs fitness impact limits and preventive screening alerts.
          </Text>

          <Text style={styles.subLabel}>Joint, Muscle, or Past Injury History</Text>
          <View style={styles.chipsWrap}>
            {COMMON_INJURIES.map((inj) => {
              const isSelected = selectedInjuries.includes(inj);
              return (
                <TouchableOpacity
                  key={inj}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleItem(selectedInjuries, setSelectedInjuries, inj)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {inj}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subLabel, { marginTop: 14 }]}>Family Medical History (Genetics)</Text>
          <View style={styles.chipsWrap}>
            {COMMON_FAMILY_RISKS.map((risk) => {
              const isSelected = selectedFamilyRisks.includes(risk);
              return (
                <TouchableOpacity
                  key={risk}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleItem(selectedFamilyRisks, setSelectedFamilyRisks, risk)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {risk}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* STEP 5: MENSTRUAL CYCLE TRACKING */}
      {step === 5 && (
        <View>
          <Text style={styles.stepTitle}>Menstrual Cycle & Hormone Health</Text>
          <Text style={styles.stepDesc}>
            Enables cycle syncing recommendations for training, nutrition, and PMS support.
          </Text>

          <TouchableOpacity
            style={[styles.toggleCard, trackCycle && styles.toggleCardActive]}
            onPress={() => setTrackCycle(!trackCycle)}
          >
            <Ionicons
              name={trackCycle ? 'checkbox' : 'square-outline'}
              size={22}
              color={trackCycle ? '#EC4899' : THEME.colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Enable Menstrual Cycle Tracking</Text>
              <Text style={styles.toggleDesc}>
                Track phases, fertility windows, and symptoms.
              </Text>
            </View>
          </TouchableOpacity>

          {trackCycle && (
            <View style={{ marginTop: 14 }}>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Typical Cycle (Days)</Text>
                  <TextInput
                    style={styles.input}
                    value={avgCycleDays}
                    onChangeText={setAvgCycleDays}
                    keyboardType="numeric"
                    placeholder="28"
                    placeholderTextColor={THEME.colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Bleeding Duration</Text>
                  <TextInput
                    style={styles.input}
                    value={avgPeriodDays}
                    onChangeText={setAvgPeriodDays}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={THEME.colors.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.label}>How many days ago did your last period start?</Text>
              <TextInput
                style={styles.input}
                value={daysAgoPeriodStarted}
                onChangeText={setDaysAgoPeriodStarted}
                keyboardType="numeric"
                placeholder="e.g. 14 (sets today as Cycle Day 14)"
                placeholderTextColor={THEME.colors.textMuted}
              />
            </View>
          )}
        </View>
      )}

      {/* STEP 6: MEDICATIONS & PROTOCOL REVIEW */}
      {step === 6 && (
        <View>
          <Text style={styles.stepTitle}>Medications & Calculated Protocol</Text>
          <Text style={styles.stepDesc}>
            Review your tailored daily blueprint calculated from your inputs.
          </Text>

          <Text style={styles.label}>Current Daily Medications & Supplements (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={medicationsInput}
            onChangeText={setMedicationsInput}
            placeholder="e.g. Vitamin D3, Omega-3, Metformin"
            placeholderTextColor={THEME.colors.textMuted}
          />

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="sparkles" size={18} color={THEME.colors.primary} />
              <Text style={styles.summaryTitle}>Your Personalized Targets</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>
                🔥 <Text style={styles.summaryVal}>{calculateCustomProtocol().targetCalories}</Text> kcal/day
              </Text>
              <Text style={styles.summaryItem}>
                💧 <Text style={styles.summaryVal}>{calculateCustomProtocol().targetWaterMl}</Text> ml water
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>
                🥩 <Text style={styles.summaryVal}>{calculateCustomProtocol().targetProteinG}g</Text> protein
              </Text>
              <Text style={styles.summaryItem}>
                👟 <Text style={styles.summaryVal}>{calculateCustomProtocol().targetSteps}</Text> steps
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* NAVIGATION BUTTONS */}
      <View style={styles.navButtonsRow}>
        {step > 1 ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep(step - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={THEME.colors.textSecondary} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {step < totalSteps ? (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setStep(step + 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>Continue</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.bgDark} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={18} color={THEME.colors.bgDark} />
            <Text style={styles.finishBtnText}>Activate My Plan</Text>
          </TouchableOpacity>
        )}
      </View>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepIndicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.borderLight,
  },
  stepIndicatorActive: {
    backgroundColor: THEME.colors.primary,
    width: 32,
  },
  stepIndicatorDone: {
    backgroundColor: THEME.colors.primaryDark,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 17,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: THEME.colors.bgInput,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  sexRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sexBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sexBtnActive: {
    backgroundColor: THEME.colors.primaryMuted,
    borderColor: THEME.colors.primary,
  },
  sexBtnText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  sexBtnTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipActive: {
    backgroundColor: THEME.colors.primaryMuted,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  goalChip: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 4,
  },
  goalChipActive: {
    backgroundColor: THEME.colors.primaryMuted,
    borderColor: THEME.colors.primary,
  },
  goalChipText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  goalChipTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  medChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  medChipActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  medChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  medChipTextActive: {
    color: '#EF4444',
    fontWeight: '700',
  },
  allergyChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  allergyChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  allergyChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  allergyChipTextActive: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.bgCardLight,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  toggleCardActive: {
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  toggleDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: THEME.colors.bgCardLight,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryItem: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  navButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.bgDark,
  },
  finishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.bgDark,
  },
});
