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

const HISTORY_TABS = [
  { id: 'conditions', label: 'Conditions', icon: 'fitness-outline' },
  { id: 'allergies', label: 'Allergies', icon: 'warning-outline' },
  { id: 'family', label: 'Family History', icon: 'people-outline' },
  { id: 'surgeries', label: 'Surgeries', icon: 'cut-outline' },
];

export default function ProfileScreen({ data, onUpdate }) {
  const profile = data?.profile || {};
  const goals = profile.goals || {};
  const healthHistory = profile.healthHistory || {
    conditions: [],
    allergies: [],
    familyHistory: [],
    surgeries: [],
  };

  const [activeHistoryTab, setActiveHistoryTab] = useState('conditions');

  // BMI Calculation
  const heightM = (profile.heightCm || 175) / 100;
  const weightKg = profile.weightKg || 70;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  let bmiCategory = 'Normal Weight';
  let bmiColor = THEME.colors.primary;
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = THEME.colors.warning;
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = 'Overweight';
    bmiColor = '#F97316';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = THEME.colors.danger;
  }

  // Goals modal
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [waterGoal, setWaterGoal] = useState(String(goals.waterMl || 2500));
  const [calorieGoal, setCalorieGoal] = useState(String(goals.calories || 2100));
  const [proteinGoal, setProteinGoal] = useState(String(goals.proteinG || 140));
  const [stepGoal, setStepGoal] = useState(String(goals.steps || 10000));
  const [sleepGoal, setSleepGoal] = useState(String(goals.sleepHours || 8));

  // Medical History Modals
  const [condModalVisible, setCondModalVisible] = useState(false);
  const [condName, setCondName] = useState('');
  const [condYear, setCondYear] = useState(String(new Date().getFullYear()));
  const [condStatus, setCondStatus] = useState('Active');
  const [condSeverity, setCondSeverity] = useState('Mild');
  const [condNotes, setCondNotes] = useState('');

  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [allergenName, setAllergenName] = useState('');
  const [allergySeverity, setAllergySeverity] = useState('Moderate');
  const [allergyReaction, setAllergyReaction] = useState('');

  const [familyModalVisible, setFamilyModalVisible] = useState(false);
  const [famRelation, setFamRelation] = useState('Parent');
  const [famCondition, setFamCondition] = useState('');
  const [famAge, setFamAge] = useState('50');
  const [famNotes, setFamNotes] = useState('');

  const [surgeryModalVisible, setSurgeryModalVisible] = useState(false);
  const [surgProcedure, setSurgProcedure] = useState('');
  const [surgYear, setSurgYear] = useState(String(new Date().getFullYear() - 2));
  const [surgHospital, setSurgHospital] = useState('');
  const [surgNotes, setSurgNotes] = useState('');

  // Handlers
  const handleSaveGoals = () => {
    onUpdate.updateGoals({
      waterMl: parseInt(waterGoal, 10) || 2500,
      calories: parseInt(calorieGoal, 10) || 2100,
      proteinG: parseInt(proteinGoal, 10) || 140,
      steps: parseInt(stepGoal, 10) || 10000,
      sleepHours: parseFloat(sleepGoal) || 8,
    });
    setGoalsModalVisible(false);
    Alert.alert('Saved', 'Your daily targets have been updated successfully.');
  };

  const handleSaveCondition = () => {
    if (!condName.trim()) {
      Alert.alert('Required', 'Please enter condition name (e.g. Mild Hypertension, Asthma).');
      return;
    }
    onUpdate.addCondition({
      name: condName.trim(),
      diagnosedYear: parseInt(condYear, 10) || 2024,
      status: condStatus,
      severity: condSeverity,
      physicianNotes: condNotes.trim(),
    });
    setCondName('');
    setCondNotes('');
    setCondModalVisible(false);
  };

  const handleSaveAllergy = () => {
    if (!allergenName.trim()) {
      Alert.alert('Required', 'Please enter allergen (e.g. Dairy, Penicillin, Peanuts).');
      return;
    }
    onUpdate.addAllergy({
      allergen: allergenName.trim(),
      severity: allergySeverity,
      reaction: allergyReaction.trim() || 'Allergic reaction',
    });
    setAllergenName('');
    setAllergyReaction('');
    setAllergyModalVisible(false);
  };

  const handleSaveFamily = () => {
    if (!famCondition.trim()) {
      Alert.alert('Required', 'Please enter family condition (e.g. Type 2 Diabetes, Heart Disease).');
      return;
    }
    onUpdate.addFamilyHistory({
      relation: famRelation,
      condition: famCondition.trim(),
      diagnosedAge: parseInt(famAge, 10) || 50,
      notes: famNotes.trim(),
    });
    setFamCondition('');
    setFamNotes('');
    setFamilyModalVisible(false);
  };

  const handleSaveSurgery = () => {
    if (!surgProcedure.trim()) {
      Alert.alert('Required', 'Please enter surgery or procedure name.');
      return;
    }
    onUpdate.addSurgery({
      procedure: surgProcedure.trim(),
      year: parseInt(surgYear, 10) || 2022,
      hospital: surgHospital.trim(),
      notes: surgNotes.trim(),
    });
    setSurgProcedure('');
    setSurgHospital('');
    setSurgNotes('');
    setSurgeryModalVisible(false);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will reset all metrics, vitals, nutrition, and medical history back to the initial demo dataset.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => onUpdate.resetToDefaults(),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Header title="Profile & Health History" subtitle="Clinical records & targets" />

      {/* USER PROFILE CARD */}
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {profile.name ? profile.name[0] : 'H'}
            </Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.userName}>{profile.name || 'Harshita'}</Text>
            <Text style={styles.userBio}>
              {profile.age || 29} yrs • {profile.heightCm || 178} cm • {profile.weightKg || 72} kg
            </Text>
            <View style={styles.bloodTypePill}>
              <Text style={styles.bloodTypeText}>Blood Type: {profile.bloodType || 'O+'}</Text>
            </View>
          </View>
        </View>

        {/* BMI METRIC */}
        <View style={styles.bmiBox}>
          <View>
            <Text style={styles.bmiLabel}>BODY MASS INDEX (BMI)</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
          </View>
          <View style={[styles.bmiBadge, { backgroundColor: `${bmiColor}20` }]}>
            <Text style={[styles.bmiBadgeText, { color: bmiColor }]}>{bmiCategory}</Text>
          </View>
        </View>
      </View>

      {/* MEDICAL & HEALTH HISTORY HUB */}
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Ionicons name="medical" size={20} color="#38BDF8" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Medical & Health History</Text>
              <Text style={styles.cardSubtitle}>
                Informs safety guardrails, vitals & diets
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addHistoryBtn}
            onPress={() => {
              if (activeHistoryTab === 'conditions') setCondModalVisible(true);
              else if (activeHistoryTab === 'allergies') setAllergyModalVisible(true);
              else if (activeHistoryTab === 'family') setFamilyModalVisible(true);
              else if (activeHistoryTab === 'surgeries') setSurgeryModalVisible(true);
            }}
          >
            <Ionicons name="add" size={16} color="#38BDF8" />
            <Text style={styles.addHistoryBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* History Sub-Tabs */}
        <View style={styles.historyTabsRow}>
          {HISTORY_TABS.map((tab) => {
            const isActive = activeHistoryTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.historyTabBtn, isActive && styles.historyTabBtnActive]}
                onPress={() => setActiveHistoryTab(tab.id)}
              >
                <Text style={[styles.historyTabLabel, isActive && styles.historyTabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TAB 1: CONDITIONS */}
        {activeHistoryTab === 'conditions' && (
          <View style={styles.historyTabContent}>
            {(healthHistory.conditions || []).length === 0 ? (
              <Text style={styles.emptyHistoryText}>No pre-existing conditions recorded.</Text>
            ) : (
              (healthHistory.conditions || []).map((cond) => (
                <View key={cond.id} style={styles.historyItem}>
                  <View style={styles.itemMain}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{cond.name}</Text>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{cond.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemMeta}>
                      Diagnosed {cond.diagnosedYear} • Severity: {cond.severity}
                    </Text>
                    {cond.physicianNotes ? (
                      <Text style={styles.itemNotes}>"{cond.physicianNotes}"</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => onUpdate.deleteCondition(cond.id)}
                    style={styles.itemDeleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: ALLERGIES */}
        {activeHistoryTab === 'allergies' && (
          <View style={styles.historyTabContent}>
            {(healthHistory.allergies || []).length === 0 ? (
              <Text style={styles.emptyHistoryText}>No allergies or sensitivities logged.</Text>
            ) : (
              (healthHistory.allergies || []).map((all) => (
                <View key={all.id} style={styles.historyItem}>
                  <View style={styles.itemMain}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{all.allergen}</Text>
                      <View
                        style={[
                          styles.severityPill,
                          all.severity === 'Severe' && { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.severityPillText,
                            all.severity === 'Severe' && { color: THEME.colors.danger },
                          ]}
                        >
                          {all.severity} Severity
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.itemMeta}>Reaction: {all.reaction}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onUpdate.deleteAllergy(all.id)}
                    style={styles.itemDeleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: FAMILY HISTORY */}
        {activeHistoryTab === 'family' && (
          <View style={styles.historyTabContent}>
            {(healthHistory.familyHistory || []).length === 0 ? (
              <Text style={styles.emptyHistoryText}>No familial medical risks logged.</Text>
            ) : (
              (healthHistory.familyHistory || []).map((fam) => (
                <View key={fam.id} style={styles.historyItem}>
                  <View style={styles.itemMain}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{fam.condition}</Text>
                      <View style={styles.relationPill}>
                        <Text style={styles.relationPillText}>{fam.relation}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemMeta}>Onset age approx. {fam.diagnosedAge} yrs</Text>
                    {fam.notes ? <Text style={styles.itemNotes}>{fam.notes}</Text> : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => onUpdate.deleteFamilyHistory(fam.id)}
                    style={styles.itemDeleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 4: SURGERIES */}
        {activeHistoryTab === 'surgeries' && (
          <View style={styles.historyTabContent}>
            {(healthHistory.surgeries || []).length === 0 ? (
              <Text style={styles.emptyHistoryText}>No past surgeries or major procedures logged.</Text>
            ) : (
              (healthHistory.surgeries || []).map((surg) => (
                <View key={surg.id} style={styles.historyItem}>
                  <View style={styles.itemMain}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{surg.procedure}</Text>
                      <Text style={styles.itemYear}>{surg.year}</Text>
                    </View>
                    {surg.hospital ? <Text style={styles.itemMeta}>{surg.hospital}</Text> : null}
                    {surg.notes ? <Text style={styles.itemNotes}>{surg.notes}</Text> : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => onUpdate.deleteSurgery(surg.id)}
                    style={styles.itemDeleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={THEME.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* DAILY TARGETS CARD */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: THEME.colors.primaryMuted }]}>
              <Ionicons name="flag" size={20} color={THEME.colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Daily Target Goals</Text>
              <Text style={styles.cardSubtitle}>Custom targets for your routine</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setGoalsModalVisible(true)}
          >
            <Ionicons name="create-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goalsGrid}>
          <View style={styles.goalItem}>
            <Text style={styles.goalItemVal}>{(goals.waterMl || 2500)} ml</Text>
            <Text style={styles.goalItemLabel}>💧 Daily Hydration</Text>
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalItemVal}>{(goals.calories || 2100)} kcal</Text>
            <Text style={styles.goalItemLabel}>🥗 Calorie Target</Text>
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalItemVal}>{(goals.steps || 10000).toLocaleString()}</Text>
            <Text style={styles.goalItemLabel}>👟 Step Goal</Text>
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalItemVal}>{goals.sleepHours || 8} hrs</Text>
            <Text style={styles.goalItemLabel}>😴 Sleep Target</Text>
          </View>
        </View>
      </View>

      {/* STORAGE & PRIVACY */}
      <View style={styles.card}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Offline-First Clinical Storage</Text>
            <Text style={styles.cardSubtitle}>
              Your health history & daily logs are encrypted & stored 100% locally on device
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetData}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color={THEME.colors.textSecondary} />
          <Text style={styles.resetButtonText}>Reset Demo Sample Data</Text>
        </TouchableOpacity>
      </View>

      {/* 1. EDIT GOALS MODAL */}
      <ModalWrapper
        visible={goalsModalVisible}
        onClose={() => setGoalsModalVisible(false)}
        title="Edit Health Targets"
        subtitle="Set daily goals aligned with your wellness objectives"
      >
        <Text style={styles.inputLabel}>Water Goal (ml)</Text>
        <TextInput
          style={styles.textInput}
          value={waterGoal}
          onChangeText={setWaterGoal}
          keyboardType="numeric"
          placeholder="2500"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Calorie Target (kcal)</Text>
        <TextInput
          style={styles.textInput}
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          keyboardType="numeric"
          placeholder="2100"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Protein Goal (grams)</Text>
        <TextInput
          style={styles.textInput}
          value={proteinGoal}
          onChangeText={setProteinGoal}
          keyboardType="numeric"
          placeholder="140"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Daily Steps Target</Text>
        <TextInput
          style={styles.textInput}
          value={stepGoal}
          onChangeText={setStepGoal}
          keyboardType="numeric"
          placeholder="10000"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Sleep Goal (hours)</Text>
        <TextInput
          style={styles.textInput}
          value={sleepGoal}
          onChangeText={setSleepGoal}
          keyboardType="numeric"
          placeholder="8"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveGoals}>
          <Text style={styles.modalSubmitBtnText}>Save Targets</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* 2. ADD CONDITION MODAL */}
      <ModalWrapper
        visible={condModalVisible}
        onClose={() => setCondModalVisible(false)}
        title="Add Medical Condition"
        subtitle="Record chronic diagnoses or physical restrictions"
      >
        <Text style={styles.inputLabel}>Condition / Diagnosis Name</Text>
        <TextInput
          style={styles.textInput}
          value={condName}
          onChangeText={setCondName}
          placeholder="e.g. Mild Hypertension, Asthma, Meniscus tear"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Year Diagnosed</Text>
            <TextInput
              style={styles.textInput}
              value={condYear}
              onChangeText={setCondYear}
              keyboardType="numeric"
              placeholder="2023"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Severity</Text>
            <TextInput
              style={styles.textInput}
              value={condSeverity}
              onChangeText={setCondSeverity}
              placeholder="Mild, Moderate, Severe"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Clinical Status</Text>
        <View style={styles.typeSelectorRow}>
          {['Active', 'Managed', 'Recovered'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.typeBtn, condStatus === st && styles.typeBtnActive]}
              onPress={() => setCondStatus(st)}
            >
              <Text style={[styles.typeBtnText, condStatus === st && styles.typeBtnTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Physician Guidance / Dietary Restrictions (optional)</Text>
        <TextInput
          style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
          value={condNotes}
          onChangeText={setCondNotes}
          placeholder="e.g. Keep sodium low, avoid high impact sprints"
          placeholderTextColor={THEME.colors.textMuted}
          multiline
        />

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveCondition}>
          <Text style={styles.modalSubmitBtnText}>Save Condition</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* 3. ADD ALLERGY MODAL */}
      <ModalWrapper
        visible={allergyModalVisible}
        onClose={() => setAllergyModalVisible(false)}
        title="Add Allergy or Sensitivity"
        subtitle="Cross-referenced against nutrition & meal logs"
      >
        <Text style={styles.inputLabel}>Allergen / Substance</Text>
        <TextInput
          style={styles.textInput}
          value={allergenName}
          onChangeText={setAllergenName}
          placeholder="e.g. Dairy / Lactose, Peanuts, Penicillin"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Severity Level</Text>
        <View style={styles.typeSelectorRow}>
          {['Mild', 'Moderate', 'Severe'].map((sev) => (
            <TouchableOpacity
              key={sev}
              style={[styles.typeBtn, allergySeverity === sev && styles.typeBtnActive]}
              onPress={() => setAllergySeverity(sev)}
            >
              <Text style={[styles.typeBtnText, allergySeverity === sev && styles.typeBtnTextActive]}>
                {sev}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Reaction Symptoms</Text>
        <TextInput
          style={styles.textInput}
          value={allergyReaction}
          onChangeText={setAllergyReaction}
          placeholder="e.g. Digestive distress, Hives, Anaphylaxis"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveAllergy}>
          <Text style={styles.modalSubmitBtnText}>Save Allergy</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* 4. ADD FAMILY HISTORY MODAL */}
      <ModalWrapper
        visible={familyModalVisible}
        onClose={() => setFamilyModalVisible(false)}
        title="Add Family Medical Risk"
        subtitle="Used for preventive screening & cardiovascular tips"
      >
        <Text style={styles.inputLabel}>Family Member / Relation</Text>
        <TextInput
          style={styles.textInput}
          value={famRelation}
          onChangeText={setFamRelation}
          placeholder="e.g. Father, Mother, Sibling, Grandparent"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Condition / Disease</Text>
        <TextInput
          style={styles.textInput}
          value={famCondition}
          onChangeText={setFamCondition}
          placeholder="e.g. Type 2 Diabetes, Heart Disease, Hypertension"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Onset Age (approximate)</Text>
        <TextInput
          style={styles.textInput}
          value={famAge}
          onChangeText={setFamAge}
          keyboardType="numeric"
          placeholder="52"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Notes / Prevention Focus</Text>
        <TextInput
          style={styles.textInput}
          value={famNotes}
          onChangeText={setFamNotes}
          placeholder="e.g. Regular annual screening advised"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveFamily}>
          <Text style={styles.modalSubmitBtnText}>Save Family History</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* 5. ADD SURGERY MODAL */}
      <ModalWrapper
        visible={surgeryModalVisible}
        onClose={() => setSurgeryModalVisible(false)}
        title="Add Surgery or Major Procedure"
        subtitle="Informs fitness impact & mobility guidance"
      >
        <Text style={styles.inputLabel}>Procedure / Surgery Name</Text>
        <TextInput
          style={styles.textInput}
          value={surgProcedure}
          onChangeText={setSurgProcedure}
          placeholder="e.g. Knee Arthroscopy, Appendectomy"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Year</Text>
            <TextInput
              style={styles.textInput}
              value={surgYear}
              onChangeText={setSurgYear}
              keyboardType="numeric"
              placeholder="2022"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Hospital / Center</Text>
            <TextInput
              style={styles.textInput}
              value={surgHospital}
              onChangeText={setSurgHospital}
              placeholder="e.g. City Orthopedics"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Post-Recovery Notes</Text>
        <TextInput
          style={styles.textInput}
          value={surgNotes}
          onChangeText={setSurgNotes}
          placeholder="e.g. Fully healed, keep joints warm before lifting"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveSurgery}>
          <Text style={styles.modalSubmitBtnText}>Save Procedure</Text>
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
  historyCard: {
    marginHorizontal: THEME.spacing.lg,
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    marginBottom: THEME.spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  addHistoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  historyTabsRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.bgInput,
    borderRadius: THEME.borderRadius.md,
    padding: 3,
    marginBottom: 12,
  },
  historyTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  historyTabBtnActive: {
    backgroundColor: '#38BDF8',
  },
  historyTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  historyTabLabelActive: {
    color: THEME.colors.bgDark,
    fontWeight: '700',
  },
  historyTabContent: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.bgCardLight,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  itemMain: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  statusPill: {
    backgroundColor: THEME.colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  statusPillText: {
    fontSize: 10,
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  severityPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  severityPillText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
  },
  relationPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  relationPillText: {
    fontSize: 10,
    color: '#A855F7',
    fontWeight: '700',
  },
  itemYear: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  itemNotes: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 3,
  },
  itemDeleteBtn: {
    padding: 4,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '800',
    color: THEME.colors.bgDark,
  },
  profileMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  userBio: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  bloodTypePill: {
    marginTop: 6,
    backgroundColor: THEME.colors.bgCardLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  bloodTypeText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  bmiBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.bgCardLight,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
  },
  bmiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  bmiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  bmiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  bmiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalItem: {
    width: '48%',
    backgroundColor: THEME.colors.bgInput,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
  },
  goalItemVal: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  goalItemLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.bgCardLight,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 14,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
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
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
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
    backgroundColor: THEME.colors.primaryMuted,
    borderColor: THEME.colors.primary,
  },
  typeBtnText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    backgroundColor: THEME.colors.primary,
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
