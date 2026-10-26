import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from './src/constants/theme';
import { storageService } from './src/services/storage';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import CycleScreen from './src/screens/CycleScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import FitnessScreen from './src/screens/FitnessScreen';
import VitalsScreen from './src/screens/VitalsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Modals
import HealthIntakeModal from './src/components/HealthIntakeModal';
import HealthAdvisorModal from './src/components/HealthAdvisorModal';

const TABS = [
  { id: 'dashboard', label: 'Today', icon: 'grid-outline', activeIcon: 'grid' },
  { id: 'cycle', label: 'Cycle', icon: 'flower-outline', activeIcon: 'flower' },
  { id: 'habits', label: 'Habits', icon: 'water-outline', activeIcon: 'water' },
  { id: 'nutrition', label: 'Nutrition', icon: 'restaurant-outline', activeIcon: 'restaurant' },
  { id: 'fitness', label: 'Fitness', icon: 'barbell-outline', activeIcon: 'barbell' },
  { id: 'vitals', label: 'Vitals', icon: 'pulse-outline', activeIcon: 'pulse' },
  { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intakeModalVisible, setIntakeModalVisible] = useState(false);
  const [advisorModalVisible, setAdvisorModalVisible] = useState(false);

  // Initialize and load persisted data
  useEffect(() => {
    async function init() {
      try {
        const data = await storageService.loadData();
        setHealthData(data);
      } catch (err) {
        console.error('Error during data initialization:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Update handlers
  const onUpdate = {
    addWater: async (amountMl) => {
      const updated = await storageService.addWater(amountMl);
      setHealthData({ ...updated });
    },
    logSleep: async (hours, qualityScore, qualityLabel, bedTime, wakeTime) => {
      const updated = await storageService.logSleep(hours, qualityScore, qualityLabel, bedTime, wakeTime);
      setHealthData({ ...updated });
    },
    updateSteps: async (steps) => {
      const updated = await storageService.updateSteps(steps);
      setHealthData({ ...updated });
    },
    logMood: async (name, emoji, score, note) => {
      const updated = await storageService.logMood(name, emoji, score, note);
      setHealthData({ ...updated });
    },
    addMeal: async (meal) => {
      const updated = await storageService.addMeal(meal);
      setHealthData({ ...updated });
    },
    deleteMeal: async (mealId) => {
      const updated = await storageService.deleteMeal(mealId);
      setHealthData({ ...updated });
    },
    addWorkout: async (workout) => {
      const updated = await storageService.addWorkout(workout);
      setHealthData({ ...updated });
    },
    deleteWorkout: async (workoutId) => {
      const updated = await storageService.deleteWorkout(workoutId);
      setHealthData({ ...updated });
    },
    addBloodPressure: async (systolic, diastolic, pulse) => {
      const updated = await storageService.addBloodPressure(systolic, diastolic, pulse);
      setHealthData({ ...updated });
    },
    addHeartRate: async (bpm, type) => {
      const updated = await storageService.addHeartRate(bpm, type);
      setHealthData({ ...updated });
    },
    addBloodGlucose: async (levelMgDl, status) => {
      const updated = await storageService.addBloodGlucose(levelMgDl, status);
      setHealthData({ ...updated });
    },
    toggleMedication: async (medId) => {
      const updated = await storageService.toggleMedication(medId);
      setHealthData({ ...updated });
    },
    addMedication: async (med) => {
      const updated = await storageService.addMedication(med);
      setHealthData({ ...updated });
    },
    deleteMedication: async (medId) => {
      const updated = await storageService.deleteMedication(medId);
      setHealthData({ ...updated });
    },
    updateGoals: async (goals) => {
      const updated = await storageService.updateGoals(goals);
      setHealthData({ ...updated });
    },
    addCondition: async (condition) => {
      const updated = await storageService.addCondition(condition);
      setHealthData({ ...updated });
    },
    deleteCondition: async (id) => {
      const updated = await storageService.deleteCondition(id);
      setHealthData({ ...updated });
    },
    addAllergy: async (allergy) => {
      const updated = await storageService.addAllergy(allergy);
      setHealthData({ ...updated });
    },
    deleteAllergy: async (id) => {
      const updated = await storageService.deleteAllergy(id);
      setHealthData({ ...updated });
    },
    addFamilyHistory: async (item) => {
      const updated = await storageService.addFamilyHistory(item);
      setHealthData({ ...updated });
    },
    deleteFamilyHistory: async (id) => {
      const updated = await storageService.deleteFamilyHistory(id);
      setHealthData({ ...updated });
    },
    addSurgery: async (surgery) => {
      const updated = await storageService.addSurgery(surgery);
      setHealthData({ ...updated });
    },
    deleteSurgery: async (id) => {
      const updated = await storageService.deleteSurgery(id);
      setHealthData({ ...updated });
    },
    logPeriodStart: async (startDate) => {
      const updated = await storageService.logPeriodStart(startDate);
      setHealthData({ ...updated });
    },
    logCycleSymptom: async (entry) => {
      const updated = await storageService.logCycleSymptom(entry);
      setHealthData({ ...updated });
    },
    deleteCycleLog: async (id) => {
      const updated = await storageService.deleteCycleLog(id);
      setHealthData({ ...updated });
    },
    updateCycleSettings: async (avgCycleDays, avgPeriodDays) => {
      const updated = await storageService.updateCycleSettings(avgCycleDays, avgPeriodDays);
      setHealthData({ ...updated });
    },
    resetToDefaults: async () => {
      const updated = await storageService.resetToDefaults();
      setHealthData({ ...updated });
    },
  };

  if (loading || !healthData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading Health Tracker...</Text>
      </View>
    );
  }

  const handleCompleteIntake = async (updatedData) => {
    await storageService.saveData(updatedData);
    setHealthData({ ...updatedData });
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            data={healthData}
            onUpdate={onUpdate}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenIntake={() => setIntakeModalVisible(true)}
            onOpenAdvisor={() => setAdvisorModalVisible(true)}
          />
        );
      case 'cycle':
        return <CycleScreen data={healthData} onUpdate={onUpdate} />;
      case 'habits':
        return <HabitsScreen data={healthData} onUpdate={onUpdate} />;
      case 'nutrition':
        return <NutritionScreen data={healthData} onUpdate={onUpdate} />;
      case 'fitness':
        return <FitnessScreen data={healthData} onUpdate={onUpdate} />;
      case 'vitals':
        return <VitalsScreen data={healthData} onUpdate={onUpdate} />;
      case 'profile':
        return <ProfileScreen data={healthData} onUpdate={onUpdate} />;
      default:
        return (
          <DashboardScreen
            data={healthData}
            onUpdate={onUpdate}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenIntake={() => setIntakeModalVisible(true)}
            onOpenAdvisor={() => setAdvisorModalVisible(true)}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.bgDark} />
      
      {/* Top Brand Bar */}
      <View style={styles.brandBar}>
        <View style={styles.brandLeft}>
          <View style={styles.brandIconBox}>
            <Ionicons name="pulse" size={18} color={THEME.colors.primary} />
          </View>
          <Text style={styles.brandTitle}>VITALIS <Text style={styles.brandSub}>HEALTH</Text></Text>
        </View>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.intakeHeaderBtn}
            onPress={() => setIntakeModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="clipboard-outline" size={14} color={THEME.colors.primary} />
            <Text style={styles.intakeHeaderBtnText}>Health Intake</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.screenWrapper}>
        {renderActiveScreen()}
      </View>

      {/* Health Intake & Assessment Modal */}
      <HealthIntakeModal
        visible={intakeModalVisible}
        onClose={() => setIntakeModalVisible(false)}
        onComplete={handleCompleteIntake}
        initialData={healthData}
      />

      {/* Personalized Health Advisor Modal */}
      <HealthAdvisorModal
        visible={advisorModalVisible}
        onClose={() => setAdvisorModalVisible(false)}
        data={healthData}
        onNavigateTab={(tab) => {
          setAdvisorModalVisible(false);
          setActiveTab(tab);
        }}
      />

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? THEME.colors.primary : THEME.colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  brandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 10,
    backgroundColor: THEME.colors.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 1,
  },
  brandSub: {
    fontWeight: '400',
    color: THEME.colors.primary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intakeHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  intakeHeaderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  screenWrapper: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 2,
    backgroundColor: THEME.colors.primary,
    borderRadius: 1,
  },
});
