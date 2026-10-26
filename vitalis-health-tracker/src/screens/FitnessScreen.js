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
import ModalWrapper from '../components/ModalWrapper';

const WORKOUT_CATEGORIES = [
  { label: 'Strength', icon: 'barbell-outline', color: '#EF4444' },
  { label: 'Cardio', icon: 'walk-outline', color: '#F97316' },
  { label: 'HIIT', icon: 'flash-outline', color: '#EAB308' },
  { label: 'Yoga', icon: 'body-outline', color: '#8B5CF6' },
  { label: 'Cycling', icon: 'bicycle-outline', color: '#06B6D4' },
];

export default function FitnessScreen({ data, onUpdate }) {
  const fitness = data?.fitness || {};
  const workouts = fitness.workouts || [];

  // Modal form states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Strength');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('45');
  const [calories, setCalories] = useState('320');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');

  // Weekly stats
  const totalMinsThisWeek = workouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);
  const totalCalBurned = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);

  const handleSaveWorkout = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a workout title or focus area.');
      return;
    }

    onUpdate.addWorkout({
      title: title.trim(),
      category: selectedCategory,
      durationMinutes: parseInt(duration, 10) || 30,
      caloriesBurned: parseInt(calories, 10) || 200,
      distanceKm: distance ? parseFloat(distance) : undefined,
      notes: notes.trim(),
    });

    setTitle('');
    setDuration('45');
    setCalories('320');
    setDistance('');
    setNotes('');
    setModalVisible(false);
  };

  const handleDeleteWorkout = (id) => {
    onUpdate.deleteWorkout(id);
  };

  const history = data?.profile?.healthHistory || {};
  const jointIssue = (history.conditions || []).find((c) =>
    /knee|meniscus|back|spine|shoulder|joint|disc|hip/i.test(c.name)
  ) || (history.surgeries || []).find((s) =>
    /knee|meniscus|back|spine|shoulder|joint/i.test(s.procedure)
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Fitness & Training"
        subtitle="Workouts, cardio & routines"
        rightIcon="add"
        onRightPress={() => setModalVisible(true)}
      />

      {/* INJURY & JOINT PRECAUTION BANNER */}
      {jointIssue && (
        <View style={styles.precautionBanner}>
          <View style={styles.precautionHeader}>
            <Ionicons name="shield-checkmark" size={15} color="#38BDF8" />
            <Text style={styles.precautionTitle}>Medical History Guardrail</Text>
          </View>
          <Text style={styles.precautionText}>
            Active protection for <Text style={{ fontWeight: '700', color: THEME.colors.textPrimary }}>{jointIssue.name || jointIssue.procedure}</Text>. Prioritize smooth low-impact cardio & avoid heavy plyometrics.
          </Text>
        </View>
      )}

      {/* WEEKLY STREAK & SUMMARY HERO */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroLeft}>
            <View style={styles.flameIcon}>
              <Ionicons name="flame" size={26} color={THEME.colors.fitness} />
            </View>
            <View>
              <Text style={styles.streakTitle}>{fitness.weeklyStreak || 0}-Day Streak</Text>
              <Text style={styles.streakSub}>Consistent fitness habit!</Text>
            </View>
          </View>
          <View style={styles.workoutsCountBadge}>
            <Text style={styles.countNumber}>{fitness.totalWorkoutsThisWeek || workouts.length}</Text>
            <Text style={styles.countText}>Sessions</Text>
          </View>
        </View>

        <View style={styles.statsDivider} />

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{totalMinsThisWeek} min</Text>
            <Text style={styles.heroStatLabel}>Total Active Time</Text>
          </View>
          <View style={styles.statVerticalBar} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{totalCalBurned} kcal</Text>
            <Text style={styles.heroStatLabel}>Calories Burned</Text>
          </View>
        </View>
      </View>

      {/* LOG WORKOUT CTA */}
      <TouchableOpacity
        style={styles.logWorkoutBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="barbell" size={20} color={THEME.colors.bgDark} />
        <Text style={styles.logWorkoutBtnText}>Log New Workout</Text>
      </TouchableOpacity>

      {/* RECENT WORKOUTS LIST */}
      <Text style={styles.sectionTitle}>Workout History ({workouts.length})</Text>

      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={40} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>No workouts logged yet</Text>
          <Text style={styles.emptyDesc}>Tap 'Log New Workout' to record your first training session.</Text>
        </View>
      ) : (
        workouts.map((w) => (
          <View key={w.id} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View style={styles.categoryBadge}>
                <Ionicons
                  name={
                    w.category === 'Cardio'
                      ? 'walk-outline'
                      : w.category === 'Yoga'
                      ? 'body-outline'
                      : 'barbell-outline'
                  }
                  size={14}
                  color={THEME.colors.fitness}
                />
                <Text style={styles.categoryBadgeText}>{w.category}</Text>
              </View>
              <Text style={styles.workoutDate}>{w.date}</Text>
            </View>

            <View style={styles.workoutMain}>
              <View style={{ flex: 1 }}>
                <Text style={styles.workoutTitle}>{w.title}</Text>
                <View style={styles.workoutPillsRow}>
                  <Text style={styles.pillText}>⏱️ {w.durationMinutes} mins</Text>
                  <Text style={styles.pillText}>🔥 {w.caloriesBurned} kcal</Text>
                  {w.distanceKm ? <Text style={styles.pillText}>📍 {w.distanceKm} km</Text> : null}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteWorkout(w.id)}
                style={styles.trashBtn}
              >
                <Ionicons name="trash-outline" size={18} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Exercise Breakdown for strength */}
            {w.exercises && w.exercises.length > 0 && (
              <View style={styles.exercisesList}>
                {w.exercises.map((ex, i) => (
                  <View key={i} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>• {ex.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {ex.sets} sets × {ex.reps} {ex.weightKg ? `(@ ${ex.weightKg}kg)` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {w.notes ? (
              <Text style={styles.workoutNotes}>Notes: "{w.notes}"</Text>
            ) : null}
          </View>
        ))
      )}

      {/* LOG WORKOUT MODAL */}
      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Log Workout Session"
        subtitle="Track exercises, duration and energy expenditure"
      >
        <Text style={styles.inputLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {WORKOUT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[
                styles.categoryChip,
                selectedCategory === cat.label && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.label)}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={selectedCategory === cat.label ? THEME.colors.bgDark : THEME.colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.label && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.inputLabel}>Workout Name or Routine</Text>
        <TextInput
          style={styles.textInput}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Leg Day & Core, Morning 5K"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Duration (Minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="e.g. 45"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Calories Burned (kcal)</Text>
            <TextInput
              style={styles.textInput}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="e.g. 350"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        {selectedCategory === 'Cardio' || selectedCategory === 'Cycling' ? (
          <>
            <Text style={styles.inputLabel}>Distance (km, optional)</Text>
            <TextInput
              style={styles.textInput}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              placeholder="e.g. 5.2"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </>
        ) : null}

        <Text style={styles.inputLabel}>Notes / Routine Details (optional)</Text>
        <TextInput
          style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. 4 sets Squats, 3 sets Lunges, felt strong"
          placeholderTextColor={THEME.colors.textMuted}
          multiline
        />

        <TouchableOpacity style={styles.submitWorkoutBtn} onPress={handleSaveWorkout}>
          <Text style={styles.submitWorkoutBtnText}>Save Workout</Text>
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
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.fitnessMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    fontSize: THEME.typography.md,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  streakSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  workoutsCountBadge: {
    alignItems: 'center',
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
  },
  countNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  countText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  statsDivider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  heroStatLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  statVerticalBar: {
    width: 1,
    height: 30,
    backgroundColor: THEME.colors.border,
  },
  logWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.fitness,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
    marginBottom: THEME.spacing.lg,
  },
  logWorkoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.bgDark,
  },
  sectionTitle: {
    fontSize: THEME.typography.md,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  workoutCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.sm,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.fitnessMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.fitness,
    textTransform: 'uppercase',
  },
  workoutDate: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  workoutMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  workoutPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    backgroundColor: THEME.colors.bgInput,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trashBtn: {
    padding: 6,
  },
  exercisesList: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: 4,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseName: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  exerciseDetails: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  workoutNotes: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    marginHorizontal: THEME.spacing.lg,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  categoriesScroll: {
    marginBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: THEME.colors.fitness,
    borderColor: THEME.colors.fitness,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  categoryChipTextActive: {
    color: THEME.colors.bgDark,
    fontWeight: '700',
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
  rowInputs: {
    flexDirection: 'row',
  },
  submitWorkoutBtn: {
    backgroundColor: THEME.colors.fitness,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitWorkoutBtnText: {
    color: THEME.colors.bgDark,
    fontSize: 15,
    fontWeight: '700',
  },
  precautionBanner: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: THEME.spacing.sm,
  },
  precautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  precautionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  precautionText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
});
