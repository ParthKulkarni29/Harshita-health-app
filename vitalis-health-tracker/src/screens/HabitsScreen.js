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

const MOOD_OPTIONS = [
  { label: 'Energetic', emoji: '⚡', score: 5 },
  { label: 'Happy', emoji: '😊', score: 4 },
  { label: 'Calm', emoji: '🧘', score: 4 },
  { label: 'Neutral', emoji: '😐', score: 3 },
  { label: 'Tired', emoji: '🥱', score: 2 },
  { label: 'Stressed', emoji: '😓', score: 1 },
];

export default function HabitsScreen({ data, onUpdate }) {
  const habits = data?.habits || {};
  const goals = data?.profile?.goals || {};

  // Modals state
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [sleepHoursInput, setSleepHoursInput] = useState(String(habits.sleep?.hours || 8));
  const [sleepQualityInput, setSleepQualityInput] = useState(String(habits.sleep?.qualityScore || 85));
  const [bedTimeInput, setBedTimeInput] = useState(habits.sleep?.bedTime || '11:00 PM');
  const [wakeTimeInput, setWakeTimeInput] = useState(habits.sleep?.wakeTime || '07:00 AM');

  const [stepsModalVisible, setStepsModalVisible] = useState(false);
  const [stepsInput, setStepsInput] = useState(String(habits.steps?.current || 7000));

  const [moodNote, setMoodNote] = useState('');

  // Hydration calculations
  const waterCurrent = habits.waterCurrentMl || 0;
  const waterGoal = goals.waterMl || 2500;
  const waterPercent = Math.min(Math.round((waterCurrent / waterGoal) * 100), 100);

  // Sleep
  const sleep = habits.sleep || {};

  // Steps
  const steps = habits.steps || {};
  const stepGoal = goals.steps || 10000;
  const stepPercent = Math.min(Math.round(((steps.current || 0) / stepGoal) * 100), 100);

  const handleWaterAdd = (amount) => {
    onUpdate.addWater(amount);
  };

  const handleSelectMood = (mood) => {
    onUpdate.logMood(mood.label, mood.emoji, mood.score, moodNote);
  };

  const handleSaveSleep = () => {
    const hours = parseFloat(sleepHoursInput) || 7.5;
    const score = parseInt(sleepQualityInput, 10) || 80;
    let label = 'Good';
    if (score >= 85) label = 'Restorative & Deep';
    else if (score >= 70) label = 'Fair';
    else label = 'Disturbed';

    onUpdate.logSleep(hours, score, label, bedTimeInput, wakeTimeInput);
    setSleepModalVisible(false);
  };

  const handleSaveSteps = () => {
    const count = parseInt(stepsInput, 10) || 0;
    onUpdate.updateSteps(count);
    setStepsModalVisible(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Header title="Daily Habits & Wellness" subtitle="Track your routines" />

      {/* 1. HYDRATION SECTION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: THEME.colors.waterMuted }]}>
              <Ionicons name="water" size={20} color={THEME.colors.water} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Hydration</Text>
              <Text style={styles.cardSubtitle}>Goal: {waterGoal} ml / day</Text>
            </View>
          </View>
          <View style={styles.badgePill}>
            <Text style={[styles.badgeText, { color: THEME.colors.water }]}>
              {waterPercent}%
            </Text>
          </View>
        </View>

        <View style={styles.waterDisplay}>
          <Text style={styles.waterAmount}>{waterCurrent}</Text>
          <Text style={styles.waterUnit}>/ {waterGoal} ml</Text>
        </View>

        <ProgressBar progress={waterCurrent / waterGoal} color={THEME.colors.water} height={8} />

        {/* Quick Add Buttons */}
        <View style={styles.waterBtnRow}>
          <TouchableOpacity
            style={styles.waterActionBtn}
            onPress={() => handleWaterAdd(250)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={THEME.colors.water} />
            <Text style={styles.waterBtnText}>+250 ml</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.waterActionBtn}
            onPress={() => handleWaterAdd(500)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={THEME.colors.water} />
            <Text style={styles.waterBtnText}>+500 ml</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.waterActionBtn}
            onPress={() => handleWaterAdd(750)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={THEME.colors.water} />
            <Text style={styles.waterBtnText}>+750 ml</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.waterActionBtn, styles.waterActionReset]}
            onPress={() => handleWaterAdd(-250)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={16} color={THEME.colors.textMuted} />
            <Text style={[styles.waterBtnText, { color: THEME.colors.textMuted }]}>-250</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Water Logs */}
        {habits.waterLogs && habits.waterLogs.length > 0 && (
          <View style={styles.historyBox}>
            <Text style={styles.historyLabel}>Recent logs today:</Text>
            <View style={styles.logTagsWrap}>
              {habits.waterLogs.slice(0, 5).map((log) => (
                <View key={log.id} style={styles.logTag}>
                  <Text style={styles.logTagText}>
                    +{log.amountMl}ml ({log.time})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 2. SLEEP TRACKER */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: THEME.colors.sleepMuted }]}>
              <Ionicons name="moon" size={20} color={THEME.colors.sleep} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Sleep & Recovery</Text>
              <Text style={styles.cardSubtitle}>
                {sleep.bedTime || '11:15 PM'} → {sleep.wakeTime || '07:00 AM'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setSleepModalVisible(true)}
          >
            <Ionicons name="create-outline" size={16} color={THEME.colors.sleep} />
            <Text style={[styles.editBtnText, { color: THEME.colors.sleep }]}>Log</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sleepStatRow}>
          <View style={styles.sleepStatCol}>
            <Text style={styles.sleepBigVal}>{sleep.hours || 0}</Text>
            <Text style={styles.sleepSubLabel}>Hours Slept</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.sleepStatCol}>
            <Text style={[styles.sleepBigVal, { color: THEME.colors.sleep }]}>
              {sleep.qualityScore || 0}%
            </Text>
            <Text style={styles.sleepSubLabel}>{sleep.qualityLabel || 'Restorative'}</Text>
          </View>
        </View>

        <View style={styles.sleepStagesRow}>
          <View style={styles.stageChip}>
            <Text style={styles.stageTitle}>Deep Sleep</Text>
            <Text style={styles.stageVal}>{sleep.deepSleepHours || 2.0} hrs</Text>
          </View>
          <View style={styles.stageChip}>
            <Text style={styles.stageTitle}>REM Sleep</Text>
            <Text style={styles.stageVal}>{sleep.remSleepHours || 1.8} hrs</Text>
          </View>
        </View>
      </View>

      {/* 3. DAILY STEPS & ACTIVITY */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: THEME.colors.primaryMuted }]}>
              <Ionicons name="footsteps" size={20} color={THEME.colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Daily Movement</Text>
              <Text style={styles.cardSubtitle}>Goal: {stepGoal.toLocaleString()} steps</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setStepsModalVisible(true)}
          >
            <Ionicons name="create-outline" size={16} color={THEME.colors.primary} />
            <Text style={[styles.editBtnText, { color: THEME.colors.primary }]}>Update</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepsMetricsRow}>
          <View>
            <Text style={styles.stepsBigVal}>
              {(steps.current || 0).toLocaleString()}
            </Text>
            <Text style={styles.stepsSubVal}>Steps Walked</Text>
          </View>
          <View style={styles.stepsExtra}>
            <Text style={styles.stepPill}>📍 {steps.distanceKm || 0} km</Text>
            <Text style={styles.stepPill}>🔥 {steps.caloriesBurned || 0} kcal</Text>
          </View>
        </View>

        <ProgressBar progress={(steps.current || 0) / stepGoal} color={THEME.colors.primary} height={8} />
      </View>

      {/* 4. MOOD & MENTAL WELLNESS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <Ionicons name="happy" size={20} color="#EAB308" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Mood & Mind</Text>
              <Text style={styles.cardSubtitle}>
                Current: {habits.mood?.emoji || '😊'} {habits.mood?.current || 'Good'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.promptText}>How are you feeling right now?</Text>
        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((m) => {
            const isSelected = habits.mood?.current === m.label;
            return (
              <TouchableOpacity
                key={m.label}
                style={[styles.moodBtn, isSelected && styles.moodBtnSelected]}
                onPress={() => handleSelectMood(m)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {habits.mood?.note ? (
          <View style={styles.moodNoteBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={THEME.colors.textMuted} />
            <Text style={styles.moodNoteText}>"{habits.mood.note}"</Text>
          </View>
        ) : null}
      </View>

      {/* SLEEP LOGGING MODAL */}
      <ModalWrapper
        visible={sleepModalVisible}
        onClose={() => setSleepModalVisible(false)}
        title="Log Sleep Session"
        subtitle="Record your rest and recovery metrics"
      >
        <Text style={styles.inputLabel}>Hours of Sleep</Text>
        <TextInput
          style={styles.textInput}
          value={sleepHoursInput}
          onChangeText={setSleepHoursInput}
          keyboardType="numeric"
          placeholder="e.g. 7.5"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Quality Score (0 - 100%)</Text>
        <TextInput
          style={styles.textInput}
          value={sleepQualityInput}
          onChangeText={setSleepQualityInput}
          keyboardType="numeric"
          placeholder="e.g. 85"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Bed Time</Text>
            <TextInput
              style={styles.textInput}
              value={bedTimeInput}
              onChangeText={setBedTimeInput}
              placeholder="11:00 PM"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Wake Time</Text>
            <TextInput
              style={styles.textInput}
              value={wakeTimeInput}
              onChangeText={setWakeTimeInput}
              placeholder="07:00 AM"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveSleep}>
          <Text style={styles.submitBtnText}>Save Sleep Log</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* STEPS MODAL */}
      <ModalWrapper
        visible={stepsModalVisible}
        onClose={() => setStepsModalVisible(false)}
        title="Update Step Count"
        subtitle="Manually update steps from your pedometer/smartwatch"
      >
        <Text style={styles.inputLabel}>Total Steps Walked Today</Text>
        <TextInput
          style={styles.textInput}
          value={stepsInput}
          onChangeText={setStepsInput}
          keyboardType="numeric"
          placeholder="e.g. 8500"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveSteps}>
          <Text style={styles.submitBtnText}>Update Steps</Text>
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
  card: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: THEME.typography.md,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  waterDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 8,
  },
  waterAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  waterUnit: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  waterBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 8,
  },
  waterActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.bgCardLight,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 4,
  },
  waterActionReset: {
    flex: 0.8,
  },
  waterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  historyBox: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  historyLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginBottom: 6,
  },
  logTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  logTag: {
    backgroundColor: THEME.colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  logTagText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.full,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sleepStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  sleepStatCol: {
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: THEME.colors.border,
  },
  sleepBigVal: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  sleepSubLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  sleepStagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  stageChip: {
    flex: 1,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    alignItems: 'center',
  },
  stageTitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  stageVal: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  stepsMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  stepsBigVal: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  stepsSubVal: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  stepsExtra: {
    flexDirection: 'row',
    gap: 8,
  },
  stepPill: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  promptText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodBtn: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  moodBtnSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryMuted,
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  moodLabelSelected: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  moodNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: THEME.colors.bgInput,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
  },
  moodNoteText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
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
  rowInputs: {
    flexDirection: 'row',
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: THEME.colors.bgDark,
    fontSize: 15,
    fontWeight: '700',
  },
});
