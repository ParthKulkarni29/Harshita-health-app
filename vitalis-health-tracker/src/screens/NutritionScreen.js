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

const PRESET_MEALS = [
  { name: 'Oatmeal & Berries with Whey', type: 'Breakfast', calories: 450, proteinG: 32, carbsG: 60, fatG: 7 },
  { name: 'Grilled Chicken & Quinoa Salad', type: 'Lunch', calories: 580, proteinG: 48, carbsG: 44, fatG: 14 },
  { name: 'Pan-Seared Salmon & Greens', type: 'Dinner', calories: 520, proteinG: 42, carbsG: 15, fatG: 28 },
  { name: 'Greek Yogurt & Mixed Nuts', type: 'Snack', calories: 230, proteinG: 18, carbsG: 14, fatG: 10 },
  { name: 'Whey Protein Shake (1 scoop)', type: 'Snack', calories: 150, proteinG: 28, carbsG: 4, fatG: 2 },
  { name: 'Avocado & Scrambled Eggs Toast', type: 'Breakfast', calories: 420, proteinG: 19, carbsG: 28, fatG: 24 },
];

export default function NutritionScreen({ data, onUpdate }) {
  const nutrition = data?.nutrition || {};
  const goals = data?.profile?.goals || {};

  // Form states
  const [modalVisible, setModalVisible] = useState(false);
  const [mealType, setMealType] = useState('Lunch');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Totals
  const meals = nutrition.meals || [];
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.proteinG || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbsG || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fatG || 0), 0);

  const calGoal = goals.calories || 2100;
  const proteinGoal = goals.proteinG || 140;
  const carbsGoal = goals.carbsG || 220;
  const fatGoal = goals.fatG || 65;

  const calRemaining = Math.max(0, calGoal - totalCalories);
  const allergies = data?.profile?.healthHistory?.allergies || [];

  const handleApplyPreset = (preset) => {
    setName(preset.name);
    setMealType(preset.type);
    setCalories(String(preset.calories));
    setProtein(String(preset.proteinG));
    setCarbs(String(preset.carbsG));
    setFat(String(preset.fatG));
  };

  const handleSaveMeal = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a meal or food item name.');
      return;
    }
    onUpdate.addMeal({
      name: name.trim(),
      type: mealType,
      calories: parseInt(calories, 10) || 0,
      proteinG: parseInt(protein, 10) || 0,
      carbsG: parseInt(carbs, 10) || 0,
      fatG: parseInt(fat, 10) || 0,
    });
    // Reset
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setModalVisible(false);
  };

  const handleDeleteMeal = (id) => {
    onUpdate.deleteMeal(id);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Nutrition & Macros"
        subtitle="Fuel and calorie management"
        rightIcon="add"
        onRightPress={() => setModalVisible(true)}
      />

      {/* ALLERGY GUARDRAIL BANNER */}
      {allergies.length > 0 && (
        <View style={styles.allergyBanner}>
          <View style={styles.allergyHeader}>
            <Ionicons name="shield-checkmark" size={15} color="#F59E0B" />
            <Text style={styles.allergyTitle}>Medical Allergy Guardrail Active</Text>
          </View>
          <View style={styles.allergyChipsRow}>
            {allergies.map((a) => (
              <View key={a.id} style={styles.allergyChip}>
                <Text style={styles.allergyChipText}>⚠️ {a.allergen} ({a.severity})</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* CALORIE BUDGET HERO */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetEyebrow}>DAILY CALORIE BUDGET</Text>
          <Text style={styles.goalTargetText}>Goal: {calGoal} kcal</Text>
        </View>

        <View style={styles.budgetMainRow}>
          <View>
            <Text style={styles.remainingVal}>{calRemaining}</Text>
            <Text style={styles.remainingLabel}>Calories Remaining</Text>
          </View>
          <View style={styles.consumedBox}>
            <Text style={styles.consumedVal}>{totalCalories}</Text>
            <Text style={styles.consumedLabel}>Consumed</Text>
          </View>
        </View>

        <ProgressBar
          progress={totalCalories / calGoal}
          color={THEME.colors.nutrition}
          height={8}
        />

        {/* MACRO BREAKDOWN */}
        <View style={styles.macroRow}>
          {/* Protein */}
          <View style={styles.macroCol}>
            <View style={styles.macroHeader}>
              <View style={[styles.macroDot, { backgroundColor: '#38BDF8' }]} />
              <Text style={styles.macroName}>Protein</Text>
            </View>
            <Text style={styles.macroGrams}>
              {totalProtein} <Text style={styles.macroGoal}>/ {proteinGoal}g</Text>
            </Text>
            <ProgressBar
              progress={totalProtein / proteinGoal}
              color="#38BDF8"
              height={4}
            />
          </View>

          {/* Carbs */}
          <View style={styles.macroCol}>
            <View style={styles.macroHeader}>
              <View style={[styles.macroDot, { backgroundColor: '#FBBF24' }]} />
              <Text style={styles.macroName}>Carbs</Text>
            </View>
            <Text style={styles.macroGrams}>
              {totalCarbs} <Text style={styles.macroGoal}>/ {carbsGoal}g</Text>
            </Text>
            <ProgressBar
              progress={totalCarbs / carbsGoal}
              color="#FBBF24"
              height={4}
            />
          </View>

          {/* Fat */}
          <View style={styles.macroCol}>
            <View style={styles.macroHeader}>
              <View style={[styles.macroDot, { backgroundColor: '#FB7185' }]} />
              <Text style={styles.macroName}>Fat</Text>
            </View>
            <Text style={styles.macroGrams}>
              {totalFat} <Text style={styles.macroGoal}>/ {fatGoal}g</Text>
            </Text>
            <ProgressBar
              progress={totalFat / fatGoal}
              color="#FB7185"
              height={4}
            />
          </View>
        </View>
      </View>

      {/* LOG MEAL CTA BUTTON */}
      <TouchableOpacity
        style={styles.addMealButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={20} color={THEME.colors.bgDark} />
        <Text style={styles.addMealButtonText}>Log Meal or Food Item</Text>
      </TouchableOpacity>

      {/* MEALS LIST */}
      <Text style={styles.sectionTitle}>Today's Logged Meals ({meals.length})</Text>

      {meals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="fast-food-outline" size={40} color={THEME.colors.textMuted} />
          <Text style={styles.emptyText}>No meals logged yet today.</Text>
          <Text style={styles.emptySub}>Tap 'Log Meal' above to record breakfast, lunch, or snacks.</Text>
        </View>
      ) : (
        meals.map((meal) => (
          <View key={meal.id} style={styles.mealCard}>
            <View style={styles.mealTopRow}>
              <View style={styles.mealTypeBadge}>
                <Text style={styles.mealTypeText}>{meal.type}</Text>
              </View>
              <Text style={styles.mealTime}>{meal.time}</Text>
            </View>

            <View style={styles.mealDetailsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.macroTagsRow}>
                  <Text style={styles.macroTag}>P: {meal.proteinG || 0}g</Text>
                  <Text style={styles.macroTag}>C: {meal.carbsG || 0}g</Text>
                  <Text style={styles.macroTag}>F: {meal.fatG || 0}g</Text>
                </View>
              </View>

              <View style={styles.mealCaloriesCol}>
                <Text style={styles.mealCaloriesNum}>{meal.calories}</Text>
                <Text style={styles.mealCaloriesUnit}>kcal</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteMeal(meal.id)}
                  style={styles.deleteIconBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}

      {/* LOG MEAL MODAL */}
      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Log Meal or Snack"
        subtitle="Choose a quick preset or enter custom nutrition info"
      >
        {/* Preset quick-tap chips */}
        <Text style={styles.modalSubheading}>Quick Presets:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {PRESET_MEALS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.presetChip}
              onPress={() => handleApplyPreset(p)}
            >
              <Text style={styles.presetChipText}>{p.name}</Text>
              <Text style={styles.presetChipCal}>{p.calories} kcal</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.inputLabel}>Meal Type</Text>
        <View style={styles.typeSelectorRow}>
          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, mealType === t && styles.typeBtnActive]}
              onPress={() => setMealType(t)}
            >
              <Text style={[styles.typeBtnText, mealType === t && styles.typeBtnTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Food or Dish Name</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Avocado Toast with Eggs"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Total Calories (kcal)</Text>
        <TextInput
          style={styles.textInput}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="e.g. 420"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <View style={styles.macrosInputRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.inputLabel}>Protein (g)</Text>
            <TextInput
              style={styles.textInput}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1, marginHorizontal: 3 }}>
            <Text style={styles.inputLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.textInput}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={styles.inputLabel}>Fat (g)</Text>
            <TextInput
              style={styles.textInput}
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveMealBtn} onPress={handleSaveMeal}>
          <Text style={styles.saveMealBtnText}>Save Meal Log</Text>
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
  budgetCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.nutrition,
    letterSpacing: 0.6,
  },
  goalTargetText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  budgetMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 10,
  },
  remainingVal: {
    fontSize: 34,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -1,
  },
  remainingLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  consumedBox: {
    alignItems: 'flex-end',
  },
  consumedVal: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  consumedLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  macroCol: {
    flex: 1,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroName: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  macroGrams: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  macroGoal: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.nutrition,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
    marginBottom: THEME.spacing.lg,
  },
  addMealButtonText: {
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
  mealCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.sm,
  },
  mealTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeBadge: {
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  mealTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.nutrition,
    textTransform: 'uppercase',
  },
  mealTime: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  mealDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  macroTagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  macroTag: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    backgroundColor: THEME.colors.bgInput,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mealCaloriesCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  mealCaloriesNum: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  mealCaloriesUnit: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: -4,
  },
  deleteIconBtn: {
    marginTop: 4,
    padding: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    marginHorizontal: THEME.spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  modalSubheading: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  presetScroll: {
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginRight: 8,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  presetChipCal: {
    fontSize: 10,
    color: THEME.colors.nutrition,
    marginTop: 2,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  typeBtnActive: {
    backgroundColor: THEME.colors.nutritionMuted,
    borderColor: THEME.colors.nutrition,
  },
  typeBtnText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: THEME.colors.nutrition,
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
  macrosInputRow: {
    flexDirection: 'row',
  },
  saveMealBtn: {
    backgroundColor: THEME.colors.nutrition,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveMealBtnText: {
    color: THEME.colors.bgDark,
    fontSize: 15,
    fontWeight: '700',
  },
  allergyBanner: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: THEME.spacing.sm,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  allergyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  allergyChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  allergyChip: {
    backgroundColor: THEME.colors.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  allergyChipText: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
});
