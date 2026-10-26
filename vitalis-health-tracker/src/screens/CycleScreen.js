import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import ModalWrapper from '../components/ModalWrapper';

const FLOW_LEVELS = ['None', 'Spotting', 'Light', 'Medium', 'Heavy'];

const SYMPTOM_OPTIONS = [
  'Cramps',
  'Headache',
  'Bloating',
  'Fatigue',
  'Breast Tenderness',
  'Acne',
  'Lower Back Pain',
  'Cravings',
  'High Energy',
  'Mood Swings',
];

const MOOD_OPTIONS = ['Confident', 'Calm', 'Sensitive', 'Irritable', 'Low Energy', 'Happy'];

export default function CycleScreen({ data, onUpdate }) {
  const cycle = data?.cycle || {
    averageCycleDays: 28,
    averagePeriodDays: 5,
    currentCycleDay: 14,
    currentPhase: 'Ovulation',
    phaseTitle: 'Ovulatory Phase (Peak Fertility)',
    daysUntilNextPeriod: 14,
    chanceOfPregnancy: 'High (Peak Fertility Window)',
    symptomLogs: [],
    pastCycles: [],
  };

  const [logModalVisible, setLogModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Form states
  const [selectedFlow, setSelectedFlow] = useState('None');
  const [selectedSymptoms, setSelectedSymptoms] = useState(['High Energy']);
  const [selectedMood, setSelectedMood] = useState('Confident');
  const [notes, setNotes] = useState('');

  // Settings form
  const [avgCycleDaysInput, setAvgCycleDaysInput] = useState(String(cycle.averageCycleDays || 28));
  const [avgPeriodDaysInput, setAvgPeriodDaysInput] = useState(String(cycle.averagePeriodDays || 5));

  const cycleDay = cycle.currentCycleDay || 14;
  const totalDays = cycle.averageCycleDays || 28;
  const cycleProgress = cycleDay / totalDays;

  // Color theme according to phase
  const getPhaseThemeColor = (phase) => {
    switch (phase) {
      case 'Menstrual':
        return '#F43F5E'; // Rose/Red
      case 'Follicular':
        return '#10B981'; // Mint Green
      case 'Ovulation':
        return '#EC4899'; // Vibrant Pink
      case 'Luteal':
        return '#8B5CF6'; // Purple
      default:
        return '#EC4899';
    }
  };

  const themeColor = getPhaseThemeColor(cycle.currentPhase);

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSaveSymptomLog = () => {
    onUpdate.logCycleSymptom({
      flow: selectedFlow,
      symptoms: selectedSymptoms,
      mood: selectedMood,
      notes: notes.trim(),
    });
    setNotes('');
    setLogModalVisible(false);
  };

  const handlePeriodStartToday = () => {
    Alert.alert(
      'Log Period Start',
      'Mark today as Day 1 of your new menstrual cycle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Day 1',
          onPress: () => {
            const todayStr = new Date().toISOString().split('T')[0];
            onUpdate.logPeriodStart(todayStr);
          },
        },
      ]
    );
  };

  const handleSaveSettings = () => {
    onUpdate.updateCycleSettings(
      parseInt(avgCycleDaysInput, 10) || 28,
      parseInt(avgPeriodDaysInput, 10) || 5
    );
    setSettingsModalVisible(false);
  };

  // Phase Guidance Content
  const getPhaseGuidance = (phase) => {
    switch (phase) {
      case 'Menstrual':
        return {
          workout: 'Gentle walking, stretching, or yin yoga. Estrogen and progesterone are at baseline.',
          nutrition: 'Replenish iron with dark leafy greens, lentils, and lean proteins. Take magnesium for muscle relaxation.',
        };
      case 'Follicular':
        return {
          workout: 'Prime time for high energy! Progressive weightlifting, HIIT, and challenging cardio.',
          nutrition: 'Higher carb tolerance and stamina. Incorporate fermented foods, lean proteins, and colorful vegetables.',
        };
      case 'Ovulation':
        return {
          workout: 'Peak strength & endurance PR window. High energy levels, but remember warmups as estrogen softens ligaments.',
          nutrition: 'Fiber-rich foods, antioxidant berries, and healthy fats (avocado, seeds) to support estrogen metabolism.',
        };
      case 'Luteal':
        return {
          workout: 'Progesterone rises, increasing heart rate & core temperature. Moderate resistance and brisk walks.',
          nutrition: 'Metabolism increases (+100-200 kcal). Complex carbs (sweet potato, oats) stabilize serotonin and curb cravings.',
        };
      default:
        return {
          workout: 'Maintain balanced aerobic and strength workouts aligned with how your body feels.',
          nutrition: 'Focus on balanced macros, whole foods, and consistent hydration.',
        };
    }
  };

  const guidance = getPhaseGuidance(cycle.currentPhase);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Period & Cycle Tracking"
        subtitle="Hormone intelligence & fertility"
        rightIcon="settings-outline"
        onRightPress={() => setSettingsModalVisible(true)}
      />

      {/* HERO CYCLE PHASE CARD */}
      <View style={[styles.heroCard, { borderColor: `${themeColor}40` }]}>
        <View style={styles.heroTopRow}>
          <View style={[styles.phaseIconBox, { backgroundColor: `${themeColor}20` }]}>
            <Ionicons name="flower" size={24} color={themeColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.phaseCategoryLabel, { color: themeColor }]}>
              {cycle.currentPhase?.toUpperCase()} PHASE
            </Text>
            <Text style={styles.phaseMainTitle}>{cycle.phaseTitle}</Text>
          </View>
          <View style={styles.cycleDayBadge}>
            <Text style={styles.cycleDayNum}>Day {cycleDay}</Text>
            <Text style={styles.cycleDayTotal}>of {totalDays}</Text>
          </View>
        </View>

        {/* Phase Circular Visualizer / Progress */}
        <View style={styles.progressContainer}>
          <ProgressBar progress={cycleProgress} color={themeColor} height={10} />
          <View style={styles.phaseStepsRow}>
            <View style={styles.phaseStep}>
              <View
                style={[
                  styles.phaseDot,
                  cycle.currentPhase === 'Menstrual' && { backgroundColor: '#F43F5E' },
                ]}
              />
              <Text style={styles.phaseStepLabel}>Menstrual (1-5)</Text>
            </View>
            <View style={styles.phaseStep}>
              <View
                style={[
                  styles.phaseDot,
                  cycle.currentPhase === 'Follicular' && { backgroundColor: '#10B981' },
                ]}
              />
              <Text style={styles.phaseStepLabel}>Follicular (6-13)</Text>
            </View>
            <View style={styles.phaseStep}>
              <View
                style={[
                  styles.phaseDot,
                  cycle.currentPhase === 'Ovulation' && { backgroundColor: '#EC4899' },
                ]}
              />
              <Text style={styles.phaseStepLabel}>Ovulation (14-16)</Text>
            </View>
            <View style={styles.phaseStep}>
              <View
                style={[
                  styles.phaseDot,
                  cycle.currentPhase === 'Luteal' && { backgroundColor: '#8B5CF6' },
                ]}
              />
              <Text style={styles.phaseStepLabel}>Luteal (17-28)</Text>
            </View>
          </View>
        </View>

        {/* Status Callout Box */}
        <View style={styles.statusCallout}>
          <View style={styles.calloutItem}>
            <Text style={styles.calloutLabel}>NEXT PERIOD IN</Text>
            <Text style={styles.calloutVal}>{cycle.daysUntilNextPeriod} days</Text>
          </View>
          <View style={styles.calloutDivider} />
          <View style={styles.calloutItem}>
            <Text style={styles.calloutLabel}>PREGNANCY CHANCE</Text>
            <Text style={[styles.calloutVal, { color: themeColor }]}>
              {cycle.chanceOfPregnancy?.split(' ')[0]}
            </Text>
          </View>
        </View>

        {/* Quick Log Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: themeColor }]}
            onPress={() => setLogModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={18} color={THEME.colors.bgDark} />
            <Text style={styles.primaryActionBtnText}>Log Flow & Symptoms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={handlePeriodStartToday}
            activeOpacity={0.8}
          >
            <Ionicons name="water" size={16} color="#F43F5E" />
            <Text style={styles.secondaryActionBtnText}>Period Started Today</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CYCLE SYNCING BIO-GUIDANCE */}
      <Text style={styles.sectionTitle}>Hormone & Cycle Syncing</Text>
      <View style={styles.guidanceCard}>
        <View style={styles.guidanceRow}>
          <View style={[styles.guidanceIconBox, { backgroundColor: THEME.colors.fitnessMuted }]}>
            <Ionicons name="barbell" size={18} color={THEME.colors.fitness} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guidanceHeader}>Workout Guidance for this Phase</Text>
            <Text style={styles.guidanceBody}>{guidance.workout}</Text>
          </View>
        </View>

        <View style={styles.guidanceDivider} />

        <View style={styles.guidanceRow}>
          <View style={[styles.guidanceIconBox, { backgroundColor: THEME.colors.nutritionMuted }]}>
            <Ionicons name="restaurant" size={18} color={THEME.colors.nutrition} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guidanceHeader}>Nutrition & Hormone Support</Text>
            <Text style={styles.guidanceBody}>{guidance.nutrition}</Text>
          </View>
        </View>
      </View>

      {/* SYMPTOM & LOG HISTORY */}
      <Text style={styles.sectionTitle}>Recent Cycle Logs</Text>
      {(cycle.symptomLogs || []).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={36} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>No symptom logs recorded yet</Text>
          <Text style={styles.emptyDesc}>Tap 'Log Flow & Symptoms' to record daily observations.</Text>
        </View>
      ) : (
        (cycle.symptomLogs || []).map((log) => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <View style={styles.logDateRow}>
                <Text style={styles.logDate}>{log.date}</Text>
                <View style={styles.dayTag}>
                  <Text style={styles.dayTagText}>Cycle Day {log.cycleDay}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onUpdate.deleteCycleLog(log.id)}
                style={styles.trashBtn}
              >
                <Ionicons name="trash-outline" size={16} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.logDetailsRow}>
              {log.flow && log.flow !== 'None' ? (
                <View style={styles.flowBadge}>
                  <Ionicons name="water" size={12} color="#F43F5E" />
                  <Text style={styles.flowBadgeText}>{log.flow} Flow</Text>
                </View>
              ) : null}

              {log.mood ? (
                <View style={styles.moodPill}>
                  <Text style={styles.moodPillText}>Mood: {log.mood}</Text>
                </View>
              ) : null}
            </View>

            {/* Symptoms Tags */}
            {log.symptoms && log.symptoms.length > 0 && (
              <View style={styles.symptomsListRow}>
                {log.symptoms.map((s, idx) => (
                  <View key={idx} style={styles.symChip}>
                    <Text style={styles.symChipText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {log.notes ? <Text style={styles.logNotes}>"{log.notes}"</Text> : null}
          </View>
        ))
      )}

      {/* PAST CYCLES */}
      <Text style={styles.sectionTitle}>Cycle Regularity & Past Cycles</Text>
      <View style={styles.pastCyclesCard}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{cycle.averageCycleDays} days</Text>
            <Text style={styles.statLabel}>Avg Cycle Length</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{cycle.averagePeriodDays} days</Text>
            <Text style={styles.statLabel}>Avg Period Duration</Text>
          </View>
        </View>

        <View style={styles.pastCyclesDivider} />

        {(cycle.pastCycles || []).map((c) => (
          <View key={c.id} style={styles.pastCycleRow}>
            <View>
              <Text style={styles.cycleDates}>
                {c.startDate} — {c.endDate}
              </Text>
              <Text style={styles.cycleSubDetails}>
                Period: {c.periodDays} days
              </Text>
            </View>
            <View style={styles.cycleLengthBadge}>
              <Text style={styles.cycleLengthText}>{c.cycleLength} Days</Text>
            </View>
          </View>
        ))}
      </View>

      {/* MODAL 1: LOG FLOW & SYMPTOMS */}
      <ModalWrapper
        visible={logModalVisible}
        onClose={() => setLogModalVisible(false)}
        title="Log Cycle Symptoms & Flow"
        subtitle={`Recording for Day ${cycleDay} of cycle`}
      >
        <Text style={styles.inputLabel}>Period Flow</Text>
        <View style={styles.flowSelectorRow}>
          {FLOW_LEVELS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.flowBtn, selectedFlow === f && styles.flowBtnActive]}
              onPress={() => setSelectedFlow(f)}
            >
              <Text style={[styles.flowBtnText, selectedFlow === f && styles.flowBtnTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Symptoms & Sensations (Select all that apply)</Text>
        <View style={styles.symptomsGrid}>
          {SYMPTOM_OPTIONS.map((sym) => {
            const isSelected = selectedSymptoms.includes(sym);
            return (
              <TouchableOpacity
                key={sym}
                style={[styles.symptomChipBtn, isSelected && styles.symptomChipBtnActive]}
                onPress={() => toggleSymptom(sym)}
              >
                <Text
                  style={[
                    styles.symptomChipBtnText,
                    isSelected && styles.symptomChipBtnTextActive,
                  ]}
                >
                  {sym}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>Mood</Text>
        <View style={styles.flowSelectorRow}>
          {MOOD_OPTIONS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.flowBtn, selectedMood === m && styles.flowBtnActive]}
              onPress={() => setSelectedMood(m)}
            >
              <Text style={[styles.flowBtnText, selectedMood === m && styles.flowBtnTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Personal Notes (optional)</Text>
        <TextInput
          style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Mild cramping, high workout motivation"
          placeholderTextColor={THEME.colors.textMuted}
          multiline
        />

        <TouchableOpacity
          style={[styles.modalSubmitBtn, { backgroundColor: themeColor }]}
          onPress={handleSaveSymptomLog}
        >
          <Text style={styles.modalSubmitBtnText}>Save Cycle Log</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* MODAL 2: CYCLE PREFERENCES */}
      <ModalWrapper
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        title="Cycle Settings"
        subtitle="Configure your typical cycle length & period duration"
      >
        <Text style={styles.inputLabel}>Average Cycle Length (Days)</Text>
        <TextInput
          style={styles.textInput}
          value={avgCycleDaysInput}
          onChangeText={setAvgCycleDaysInput}
          keyboardType="numeric"
          placeholder="28"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Average Period Bleeding Duration (Days)</Text>
        <TextInput
          style={styles.textInput}
          value={avgPeriodDaysInput}
          onChangeText={setAvgPeriodDaysInput}
          keyboardType="numeric"
          placeholder="5"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <TouchableOpacity
          style={[styles.modalSubmitBtn, { backgroundColor: themeColor }]}
          onPress={handleSaveSettings}
        >
          <Text style={styles.modalSubmitBtnText}>Save Preferences</Text>
        </TouchableOpacity>
      </ModalWrapper>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1.5,
    marginBottom: THEME.spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phaseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseCategoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  phaseMainTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  cycleDayBadge: {
    alignItems: 'center',
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
  },
  cycleDayNum: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  cycleDayTotal: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    marginTop: -2,
  },
  progressContainer: {
    marginVertical: 14,
  },
  phaseStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  phaseStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.borderLight,
  },
  phaseStepLabel: {
    fontSize: 9,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  statusCallout: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: THEME.colors.bgCardLight,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 14,
  },
  calloutItem: {
    alignItems: 'center',
  },
  calloutLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  calloutVal: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  calloutDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.border,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
  },
  primaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.bgDark,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    gap: 4,
  },
  secondaryActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F43F5E',
  },
  sectionTitle: {
    fontSize: THEME.typography.md,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  guidanceCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  guidanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guidanceIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  guidanceBody: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  guidanceDivider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 12,
  },
  logCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logDate: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  dayTag: {
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
  dayTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  trashBtn: {
    padding: 4,
  },
  logDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  flowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  flowBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F43F5E',
  },
  moodPill: {
    backgroundColor: THEME.colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  moodPillText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  symptomsListRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  symChip: {
    backgroundColor: THEME.colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  symChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  logNotes: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: THEME.spacing.lg,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  pastCyclesCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  statBoxDivider: {
    width: 1,
    height: 30,
    backgroundColor: THEME.colors.border,
  },
  pastCyclesDivider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 12,
  },
  pastCycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  cycleDates: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  cycleSubDetails: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  cycleLengthBadge: {
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  cycleLengthText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: THEME.colors.bgInput,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  flowSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  flowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  flowBtnActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: '#EC4899',
  },
  flowBtnText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  flowBtnTextActive: {
    color: '#EC4899',
    fontWeight: '700',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  symptomChipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  symptomChipBtnActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderColor: '#EC4899',
  },
  symptomChipBtnText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  symptomChipBtnTextActive: {
    color: '#EC4899',
    fontWeight: '700',
  },
  modalSubmitBtn: {
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSubmitBtnText: {
    color: THEME.colors.bgDark,
    fontSize: 15,
    fontWeight: '700',
  },
});
