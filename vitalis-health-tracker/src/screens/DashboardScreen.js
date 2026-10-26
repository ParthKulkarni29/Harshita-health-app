import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import { analyzeHealthData } from '../services/healthIntelligence';

export default function DashboardScreen({
  data,
  onUpdate,
  onNavigateTab,
  onOpenIntake,
  onOpenAdvisor,
}) {
  const profile = data?.profile || {};
  const habits = data?.habits || {};
  const nutrition = data?.nutrition || {};
  const fitness = data?.fitness || {};
  const vitals = data?.vitals || {};

  // Calculations
  const waterCurrent = habits.waterCurrentMl || 0;
  const waterGoal = profile.goals?.waterMl || 2500;
  const waterProgress = waterCurrent / waterGoal;

  const totalCalories = (nutrition.meals || []).reduce(
    (sum, m) => sum + (m.calories || 0),
    0
  );
  const calorieGoal = profile.goals?.calories || 2100;
  const calRemaining = Math.max(0, calorieGoal - totalCalories);
  const calProgress = totalCalories / calorieGoal;

  const steps = habits.steps?.current || 0;
  const stepGoal = profile.goals?.steps || 10000;
  const stepProgress = steps / stepGoal;

  const sleepHours = habits.sleep?.hours || 0;
  const sleepQuality = habits.sleep?.qualityScore || 0;

  const latestBp = vitals.bloodPressureLogs?.[0] || {
    systolic: 120,
    diastolic: 80,
    category: 'Normal',
  };
  const latestHr = vitals.heartRateLogs?.[0] || { bpm: 70 };

  const pendingMeds = (vitals.medications || []).filter((m) => !m.takenToday);

  // Personalized health analysis based on medical history
  const intelligence = analyzeHealthData(data);

  const handleQuickAddWater = async () => {
    try {
      await onUpdate.addWater(250);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title={`Hello, ${profile.name?.split(' ')[0] || 'Harshita'} 👋`}
        subtitle="Today's Health Overview"
      />

      {/* PERSONALIZED HEALTH PROTOCOL & ADVISOR CARD */}
      <View style={styles.advisorHeroCard}>
        <View style={styles.advisorHeroTop}>
          <View style={styles.advisorAvatarCircle}>
            <Ionicons name="sparkles" size={20} color={THEME.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.advisorHeroTitle}>Personalized Protocol Active</Text>
            <Text style={styles.advisorHeroSub}>
              {profile.age || 28}yo {profile.sex || ''} • {profile.weightKg || 65}kg • {intelligence.activeConditionsCount} condition(s) tracked
            </Text>
          </View>
        </View>

        <View style={styles.advisorHeroActionsRow}>
          <TouchableOpacity
            style={styles.openAdvisorBtn}
            onPress={onOpenAdvisor}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles" size={15} color={THEME.colors.bgDark} />
            <Text style={styles.openAdvisorBtnText}>Ask Health Advisor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retakeIntakeBtn}
            onPress={onOpenIntake}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={15} color={THEME.colors.textPrimary} />
            <Text style={styles.retakeIntakeBtnText}>Update Inputs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wellness Score Banner */}
      <View style={styles.scoreBanner}>
        <View style={styles.scoreTextCol}>
          <Text style={styles.scoreEyebrow}>DAILY WELLNESS SCORE</Text>
          <Text style={styles.scoreTitle}>Great Health Day 🌟</Text>
          <Text style={styles.scoreDesc}>
            Hydration & steps are on track. 1 medication remaining for tonight.
          </Text>
        </View>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>88</Text>
          <Text style={styles.scoreOutOf}>/ 100</Text>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={handleQuickAddWater}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: THEME.colors.waterMuted }]}>
            <Ionicons name="water" size={20} color={THEME.colors.water} />
          </View>
          <Text style={styles.actionLabel}>+250ml Water</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => onNavigateTab('nutrition')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: THEME.colors.nutritionMuted }]}>
            <Ionicons name="restaurant" size={20} color={THEME.colors.nutrition} />
          </View>
          <Text style={styles.actionLabel}>Log Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => onNavigateTab('fitness')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: THEME.colors.fitnessMuted }]}>
            <Ionicons name="barbell" size={20} color={THEME.colors.fitness} />
          </View>
          <Text style={styles.actionLabel}>Log Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => onNavigateTab('vitals')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: THEME.colors.vitalsMuted }]}>
            <Ionicons name="pulse" size={20} color={THEME.colors.vitals} />
          </View>
          <Text style={styles.actionLabel}>Check Vitals</Text>
        </TouchableOpacity>
      </View>

      {/* HEALTH HISTORY INTELLIGENCE & GUARDRAILS */}
      <View style={styles.intelCard}>
        <View style={styles.intelHeader}>
          <View style={styles.intelHeaderLeft}>
            <View style={styles.intelIconBox}>
              <Ionicons name="medical" size={18} color="#38BDF8" />
            </View>
            <View>
              <Text style={styles.intelTitle}>Health History Intelligence</Text>
              <Text style={styles.intelSub}>
                {intelligence.activeConditionsCount} condition(s) • {intelligence.activeAllergiesCount} allergy flag(s) active
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onNavigateTab('profile')}
            style={styles.intelManageBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.intelManageText}>History</Text>
            <Ionicons name="chevron-forward" size={13} color="#38BDF8" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Alerts from Medical History Cross-Checks */}
        {intelligence.alerts.map((al) => (
          <View key={al.id} style={[styles.intelAlertBox, { borderColor: al.color }]}>
            <Ionicons name={al.icon || 'warning'} size={20} color={al.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.intelAlertTitle, { color: al.color }]}>{al.title}</Text>
              <Text style={styles.intelAlertMessage}>{al.message}</Text>
            </View>
          </View>
        ))}

        {/* Personalized Guardrails */}
        <View style={styles.guardrailsWrap}>
          {intelligence.guardrails.slice(0, 2).map((g) => (
            <View key={g.id} style={styles.guardrailItem}>
              <Ionicons name={g.icon} size={16} color={g.color || THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guardrailTitle}>{g.title}</Text>
                <Text style={styles.guardrailDesc}>{g.message}</Text>
              </View>
            </View>
          ))}

          {intelligence.recommendations.slice(0, 1).map((r) => (
            <View key={r.id} style={styles.recommendationItem}>
              <Ionicons name={r.icon || 'information-circle-outline'} size={16} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recommendationTitle}>{r.title}</Text>
                <Text style={styles.recommendationDesc}>{r.description}</Text>
                <Text style={styles.recommendationSource}>Source: {r.source}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* MENSTRUAL CYCLE & PERIOD SNAPSHOT */}
      {data?.cycle?.enabled && (
        <TouchableOpacity
          style={styles.cycleCard}
          onPress={() => onNavigateTab('cycle')}
          activeOpacity={0.8}
        >
          <View style={styles.cycleCardLeft}>
            <View style={styles.cycleIconCircle}>
              <Ionicons name="flower" size={22} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.cycleBadgeRow}>
                <Text style={styles.cyclePhaseTag}>
                  {data.cycle.currentPhase?.toUpperCase()} PHASE
                </Text>
                <Text style={styles.cycleDaysTag}>
                  Day {data.cycle.currentCycleDay} of {data.cycle.averageCycleDays}
                </Text>
              </View>
              <Text style={styles.cycleTitle}>{data.cycle.phaseTitle}</Text>
              <Text style={styles.cycleSub}>
                Next period in {data.cycle.daysUntilNextPeriod} days • {data.cycle.chanceOfPregnancy?.split(' ')[0]} fertility
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EC4899" />
        </TouchableOpacity>
      )}

      {/* Key Metrics Grid */}
      <Text style={styles.sectionTitle}>Today's Pillars</Text>
      <View style={styles.gridContainer}>
        {/* Hydration */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onNavigateTab('habits')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconSmall, { backgroundColor: THEME.colors.waterMuted }]}>
              <Ionicons name="water-outline" size={16} color={THEME.colors.water} />
            </View>
            <Text style={styles.cardGoal}>{Math.round(waterProgress * 100)}%</Text>
          </View>
          <Text style={styles.cardVal}>{waterCurrent}</Text>
          <Text style={styles.cardLabel}>Water (ml)</Text>
          <ProgressBar progress={waterProgress} color={THEME.colors.water} height={6} />
        </TouchableOpacity>

        {/* Nutrition */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onNavigateTab('nutrition')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconSmall, { backgroundColor: THEME.colors.nutritionMuted }]}>
              <Ionicons name="flame-outline" size={16} color={THEME.colors.nutrition} />
            </View>
            <Text style={styles.cardGoal}>{calRemaining} left</Text>
          </View>
          <Text style={styles.cardVal}>{totalCalories}</Text>
          <Text style={styles.cardLabel}>Calories (kcal)</Text>
          <ProgressBar progress={calProgress} color={THEME.colors.nutrition} height={6} />
        </TouchableOpacity>

        {/* Steps */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onNavigateTab('habits')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconSmall, { backgroundColor: THEME.colors.primaryMuted }]}>
              <Ionicons name="footsteps-outline" size={16} color={THEME.colors.primary} />
            </View>
            <Text style={styles.cardGoal}>{habits.steps?.distanceKm || 0} km</Text>
          </View>
          <Text style={styles.cardVal}>{steps.toLocaleString()}</Text>
          <Text style={styles.cardLabel}>Steps Today</Text>
          <ProgressBar progress={stepProgress} color={THEME.colors.primary} height={6} />
        </TouchableOpacity>

        {/* Sleep */}
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onNavigateTab('habits')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconSmall, { backgroundColor: THEME.colors.sleepMuted }]}>
              <Ionicons name="moon-outline" size={16} color={THEME.colors.sleep} />
            </View>
            <Text style={styles.cardGoal}>{sleepQuality}% score</Text>
          </View>
          <Text style={styles.cardVal}>{sleepHours} hrs</Text>
          <Text style={styles.cardLabel}>Sleep Duration</Text>
          <ProgressBar
            progress={sleepHours / (profile.goals?.sleepHours || 8)}
            color={THEME.colors.sleep}
            height={6}
          />
        </TouchableOpacity>
      </View>

      {/* Medication Reminder Bar */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Medications & Supplements</Text>
        <TouchableOpacity onPress={() => onNavigateTab('vitals')}>
          <Text style={styles.seeAllText}>Manage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.medsCard}>
        {(vitals.medications || []).map((med) => (
          <TouchableOpacity
            key={med.id}
            style={styles.medRow}
            onPress={() => onUpdate.toggleMedication(med.id)}
            activeOpacity={0.7}
          >
            <View style={styles.medLeft}>
              <Ionicons
                name={med.takenToday ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={med.takenToday ? THEME.colors.primary : THEME.colors.textMuted}
              />
              <View style={styles.medInfo}>
                <Text
                  style={[
                    styles.medName,
                    med.takenToday && styles.medTextTaken,
                  ]}
                >
                  {med.name}
                </Text>
                <Text style={styles.medTime}>
                  {med.dosage} • {med.time}
                </Text>
              </View>
            </View>
            <View style={[styles.streakBadge, med.takenToday && styles.streakBadgeActive]}>
              <Ionicons
                name="flame"
                size={12}
                color={med.takenToday ? THEME.colors.primary : THEME.colors.textMuted}
              />
              <Text
                style={[
                  styles.streakText,
                  med.takenToday && { color: THEME.colors.primary },
                ]}
              >
                {med.streakDays}d
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vitals Snapshot */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Latest Vitals</Text>
        <TouchableOpacity onPress={() => onNavigateTab('vitals')}>
          <Text style={styles.seeAllText}>Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vitalsRow}>
        <View style={styles.vitalCard}>
          <Text style={styles.vitalSub}>BLOOD PRESSURE</Text>
          <Text style={styles.vitalVal}>
            {latestBp.systolic}/{latestBp.diastolic}
          </Text>
          <Text style={styles.vitalUnit}>mmHg • {latestBp.category}</Text>
        </View>

        <View style={styles.vitalCard}>
          <Text style={styles.vitalSub}>RESTING HEART RATE</Text>
          <Text style={styles.vitalVal}>{latestHr.bpm}</Text>
          <Text style={styles.vitalUnit}>BPM • Normal</Text>
        </View>
      </View>

      {/* Fitness Streak Highlight */}
      <View style={styles.streakBanner}>
        <View style={styles.streakLeft}>
          <View style={styles.streakIconCircle}>
            <Ionicons name="flame" size={24} color={THEME.colors.fitness} />
          </View>
          <View>
            <Text style={styles.streakTitle}>
              {fitness.weeklyStreak || 0} Day Workout Streak!
            </Text>
            <Text style={styles.streakDesc}>
              {fitness.totalWorkoutsThisWeek || 0} sessions completed this week
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.streakBtn}
          onPress={() => onNavigateTab('fitness')}
        >
          <Text style={styles.streakBtnText}>View</Text>
        </TouchableOpacity>
      </View>
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
  scoreBanner: {
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreTextCol: {
    flex: 1,
    paddingRight: THEME.spacing.md,
  },
  scoreEyebrow: {
    fontSize: THEME.typography.xs,
    color: THEME.colors.primary,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  scoreTitle: {
    fontSize: THEME.typography.lg,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  scoreDesc: {
    fontSize: THEME.typography.xs,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primaryMuted,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  scoreOutOf: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
    marginTop: -2,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
  quickActionBtn: {
    alignItems: 'center',
    width: '23%',
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: THEME.typography.md,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
  },
  seeAllText: {
    fontSize: THEME.typography.xs,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  gridCard: {
    width: '48%',
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
    marginBottom: 8,
  },
  iconSmall: {
    width: 28,
    height: 28,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGoal: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  cardVal: {
    fontSize: THEME.typography.lg,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  cardLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginBottom: 8,
  },
  medsCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  medRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  medLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medInfo: {},
  medName: {
    fontSize: THEME.typography.sm,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  medTextTaken: {
    color: THEME.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  medTime: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.bgCardLight,
  },
  streakBadgeActive: {
    backgroundColor: THEME.colors.primaryMuted,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  vitalSub: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  vitalVal: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginVertical: 4,
  },
  vitalUnit: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  streakBanner: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.fitnessMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    fontSize: THEME.typography.sm,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  streakDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  streakBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.bgCardLight,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  streakBtnText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  intelCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: THEME.spacing.md,
  },
  intelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  intelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  intelIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intelTitle: {
    fontSize: THEME.typography.sm,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  intelSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  intelManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  intelManageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  intelAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: THEME.colors.bgInput,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 4,
    padding: 10,
    marginBottom: 8,
  },
  intelAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  intelAlertMessage: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  guardrailsWrap: {
    gap: 8,
    marginTop: 4,
  },
  guardrailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: THEME.colors.bgCardLight,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
  },
  guardrailTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  guardrailDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: THEME.colors.bgCardLight,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  recommendationDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  recommendationSource: {
    fontSize: 10,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  cycleCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  cycleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cycleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  cyclePhaseTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EC4899',
    letterSpacing: 0.6,
  },
  cycleDaysTag: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  cycleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  cycleSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  advisorHeroCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: THEME.spacing.md,
  },
  advisorHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  advisorAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisorHeroTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  advisorHeroSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  advisorHeroActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  openAdvisorBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
  },
  openAdvisorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.bgDark,
  },
  retakeIntakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: THEME.colors.bgCardLight,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  retakeIntakeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
});
