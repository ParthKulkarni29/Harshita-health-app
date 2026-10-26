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

export default function VitalsScreen({ data, onUpdate }) {
  const vitals = data?.vitals || {};

  // Modals
  const [bpModalVisible, setBpModalVisible] = useState(false);
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');

  const [hrModalVisible, setHrModalVisible] = useState(false);
  const [hrBpm, setHrBpm] = useState('72');
  const [hrType, setHrType] = useState('Resting');

  const [bgModalVisible, setBgModalVisible] = useState(false);
  const [bgLevel, setBgLevel] = useState('95');
  const [bgStatus, setBgStatus] = useState('Fasting');

  const [medModalVisible, setMedModalVisible] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medSchedule, setMedSchedule] = useState('Daily with breakfast');
  const [medTime, setMedTime] = useState('08:30 AM');

  const bpLogs = vitals.bloodPressureLogs || [];
  const latestBp = bpLogs[0] || { systolic: 120, diastolic: 80, pulse: 70, category: 'Normal' };

  const hrLogs = vitals.heartRateLogs || [];
  const latestHr = hrLogs[0] || { bpm: 72, type: 'Resting' };

  const bgLogs = vitals.bloodGlucoseLogs || [];
  const latestBg = bgLogs[0] || { levelMgDl: 92, status: 'Fasting' };

  const medications = vitals.medications || [];

  const history = data?.profile?.healthHistory || {};
  const hasHypertension = (history.conditions || []).some(c => /hypertension|blood pressure/i.test(c.name));
  const hasDiabetesRisk = (history.conditions || []).some(c => /diabetes|glucose/i.test(c.name)) || (history.familyHistory || []).some(f => /diabetes|glucose/i.test(f.condition));

  // Handlers
  const handleSaveBp = () => {
    const s = parseInt(systolic, 10);
    const d = parseInt(diastolic, 10);
    const p = parseInt(pulse, 10) || 72;
    if (!s || !d) {
      Alert.alert('Required', 'Please enter valid systolic and diastolic values.');
      return;
    }
    onUpdate.addBloodPressure(s, d, p);
    setBpModalVisible(false);
  };

  const handleSaveHr = () => {
    const b = parseInt(hrBpm, 10);
    if (!b) {
      Alert.alert('Required', 'Please enter a valid BPM value.');
      return;
    }
    onUpdate.addHeartRate(b, hrType);
    setHrModalVisible(false);
  };

  const handleSaveBg = () => {
    const l = parseInt(bgLevel, 10);
    if (!l) {
      Alert.alert('Required', 'Please enter a valid glucose reading.');
      return;
    }
    onUpdate.addBloodGlucose(l, bgStatus);
    setBgModalVisible(false);
  };

  const handleSaveMed = () => {
    if (!medName.trim()) {
      Alert.alert('Required', 'Please enter medication or supplement name.');
      return;
    }
    onUpdate.addMedication({
      name: medName.trim(),
      dosage: medDosage.trim() || '1 pill',
      schedule: medSchedule.trim(),
      time: medTime.trim(),
    });
    setMedName('');
    setMedDosage('');
    setMedModalVisible(false);
  };

  const getBpCategoryColor = (cat) => {
    switch (cat) {
      case 'Normal':
        return THEME.colors.primary;
      case 'Elevated':
        return THEME.colors.warning;
      case 'Stage 1 Hypertension':
        return '#F97316';
      case 'Stage 2 Hypertension':
        return THEME.colors.danger;
      default:
        return THEME.colors.primary;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Vitals & Medications"
        subtitle="Clinical logs & prescription schedule"
      />

      {/* 1. BLOOD PRESSURE SECTION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: THEME.colors.vitalsMuted }]}>
              <Ionicons name="pulse" size={20} color={THEME.colors.vitals} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Blood Pressure</Text>
              <Text style={styles.cardSubtitle}>American Heart Association Standards</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionBtnSmall}
            onPress={() => setBpModalVisible(true)}
          >
            <Ionicons name="add" size={16} color={THEME.colors.vitals} />
            <Text style={[styles.actionBtnSmallText, { color: THEME.colors.vitals }]}>Log BP</Text>
          </TouchableOpacity>
        </View>

        {/* CLINICAL CONTEXT BANNER */}
        {hasHypertension && (
          <View style={styles.clinicalContextBanner}>
            <Ionicons name="shield-checkmark" size={14} color="#38BDF8" />
            <Text style={styles.clinicalContextText}>
              Correlated with Medical History: <Text style={{ fontWeight: '700' }}>Mild Hypertension</Text> (Target: &lt; 120/80 mmHg)
            </Text>
          </View>
        )}

        <View style={styles.bpDisplayRow}>
          <View>
            <View style={styles.bpValRow}>
              <Text style={styles.bpBigVal}>
                {latestBp.systolic} / {latestBp.diastolic}
              </Text>
              <Text style={styles.bpUnit}>mmHg</Text>
            </View>
            <Text style={styles.bpPulseText}>Pulse: {latestBp.pulse} bpm</Text>
          </View>

          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: `${getBpCategoryColor(latestBp.category)}20` },
            ]}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                { color: getBpCategoryColor(latestBp.category) },
              ]}
            >
              {latestBp.category}
            </Text>
          </View>
        </View>

        {/* BP Logs History */}
        <View style={styles.logsList}>
          {bpLogs.slice(0, 3).map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logDate}>{log.date}</Text>
              <Text style={styles.logVal}>
                {log.systolic}/{log.diastolic} mmHg ({log.pulse} bpm)
              </Text>
              <Text
                style={[
                  styles.logCategory,
                  { color: getBpCategoryColor(log.category) },
                ]}
              >
                {log.category}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 2. HEART RATE & BLOOD GLUCOSE 2-COLUMN ROW */}
      <View style={styles.twoColRow}>
        {/* Heart Rate */}
        <View style={styles.halfCard}>
          <View style={styles.halfCardHeader}>
            <View style={[styles.iconSmall, { backgroundColor: THEME.colors.fitnessMuted }]}>
              <Ionicons name="heart" size={16} color={THEME.colors.fitness} />
            </View>
            <TouchableOpacity onPress={() => setHrModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={20} color={THEME.colors.fitness} />
            </TouchableOpacity>
          </View>
          <Text style={styles.halfCardTitle}>Heart Rate</Text>
          <View style={styles.valUnitRow}>
            <Text style={styles.halfCardVal}>{latestHr.bpm}</Text>
            <Text style={styles.halfCardUnit}>BPM</Text>
          </View>
          <Text style={styles.halfCardSub}>{latestHr.type || 'Resting'}</Text>
        </View>

        {/* Blood Glucose */}
        <View style={styles.halfCard}>
          <View style={styles.halfCardHeader}>
            <View style={[styles.iconSmall, { backgroundColor: THEME.colors.nutritionMuted }]}>
              <Ionicons name="water-outline" size={16} color={THEME.colors.nutrition} />
            </View>
            <TouchableOpacity onPress={() => setBgModalVisible(true)}>
              <Ionicons name="add-circle-outline" size={20} color={THEME.colors.nutrition} />
            </TouchableOpacity>
          </View>
          <Text style={styles.halfCardTitle}>Blood Glucose</Text>
          <View style={styles.valUnitRow}>
            <Text style={styles.halfCardVal}>{latestBg.levelMgDl}</Text>
            <Text style={styles.halfCardUnit}>mg/dL</Text>
          </View>
          <Text style={styles.halfCardSub}>
            {latestBg.status || 'Fasting'}
            {hasDiabetesRisk && <Text style={{ color: '#F97316' }}> • Risk Flag</Text>}
          </Text>
        </View>
      </View>

      {/* 3. MEDICATIONS & SUPPLEMENTS MANAGER */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: THEME.colors.primaryMuted }]}>
              <Ionicons name="medkit" size={20} color={THEME.colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Medication Schedule</Text>
              <Text style={styles.cardSubtitle}>
                {medications.filter((m) => m.takenToday).length} of {medications.length} taken today
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionBtnSmall}
            onPress={() => setMedModalVisible(true)}
          >
            <Ionicons name="add" size={16} color={THEME.colors.primary} />
            <Text style={[styles.actionBtnSmallText, { color: THEME.colors.primary }]}>Add</Text>
          </TouchableOpacity>
        </View>

        {medications.length === 0 ? (
          <Text style={styles.noMedsText}>No medications or supplements configured.</Text>
        ) : (
          medications.map((med) => (
            <View key={med.id} style={styles.medicationItem}>
              <TouchableOpacity
                style={styles.medCheckboxRow}
                onPress={() => onUpdate.toggleMedication(med.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={med.takenToday ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={med.takenToday ? THEME.colors.primary : THEME.colors.textMuted}
                />
                <View style={styles.medContent}>
                  <Text
                    style={[
                      styles.medTitle,
                      med.takenToday && styles.medTitleDone,
                    ]}
                  >
                    {med.name}
                  </Text>
                  <Text style={styles.medDetails}>
                    {med.dosage} • {med.schedule} ({med.time})
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.medRightActions}>
                <View style={[styles.medStreak, med.takenToday && styles.medStreakActive]}>
                  <Ionicons
                    name="flame"
                    size={12}
                    color={med.takenToday ? THEME.colors.primary : THEME.colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.medStreakNum,
                      med.takenToday && { color: THEME.colors.primary },
                    ]}
                  >
                    {med.streakDays}d
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onUpdate.deleteMedication(med.id)}
                  style={styles.deleteMedBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* BLOOD PRESSURE MODAL */}
      <ModalWrapper
        visible={bpModalVisible}
        onClose={() => setBpModalVisible(false)}
        title="Log Blood Pressure"
        subtitle="Enter systolic and diastolic blood pressure readings"
      >
        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Systolic (Upper #)</Text>
            <TextInput
              style={styles.textInput}
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="numeric"
              placeholder="120"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Diastolic (Lower #)</Text>
            <TextInput
              style={styles.textInput}
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="numeric"
              placeholder="80"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Pulse (BPM)</Text>
        <TextInput
          style={styles.textInput}
          value={pulse}
          onChangeText={setPulse}
          keyboardType="numeric"
          placeholder="72"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveBp}>
          <Text style={styles.modalSubmitBtnText}>Save Reading</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* HEART RATE MODAL */}
      <ModalWrapper
        visible={hrModalVisible}
        onClose={() => setHrModalVisible(false)}
        title="Log Heart Rate"
        subtitle="Record pulse measurement"
      >
        <Text style={styles.inputLabel}>Heart Rate (BPM)</Text>
        <TextInput
          style={styles.textInput}
          value={hrBpm}
          onChangeText={setHrBpm}
          keyboardType="numeric"
          placeholder="72"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>State</Text>
        <View style={styles.typeSelectorRow}>
          {['Resting', 'Post-Workout', 'Current', 'Walking'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.typeBtn, hrType === st && styles.typeBtnActive]}
              onPress={() => setHrType(st)}
            >
              <Text style={[styles.typeBtnText, hrType === st && styles.typeBtnTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveHr}>
          <Text style={styles.modalSubmitBtnText}>Save Heart Rate</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* GLUCOSE MODAL */}
      <ModalWrapper
        visible={bgModalVisible}
        onClose={() => setBgModalVisible(false)}
        title="Log Blood Glucose"
        subtitle="Record blood sugar level"
      >
        <Text style={styles.inputLabel}>Glucose Level (mg/dL)</Text>
        <TextInput
          style={styles.textInput}
          value={bgLevel}
          onChangeText={setBgLevel}
          keyboardType="numeric"
          placeholder="95"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Measurement Timing</Text>
        <View style={styles.typeSelectorRow}>
          {['Fasting', 'Pre-Meal', '2h Post-Meal', 'Bedtime'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.typeBtn, bgStatus === st && styles.typeBtnActive]}
              onPress={() => setBgStatus(st)}
            >
              <Text style={[styles.typeBtnText, bgStatus === st && styles.typeBtnTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveBg}>
          <Text style={styles.modalSubmitBtnText}>Save Glucose Level</Text>
        </TouchableOpacity>
      </ModalWrapper>

      {/* MEDICATION MODAL */}
      <ModalWrapper
        visible={medModalVisible}
        onClose={() => setMedModalVisible(false)}
        title="Add Medication / Supplement"
        subtitle="Set up recurring reminders and dosage details"
      >
        <Text style={styles.inputLabel}>Medication / Supplement Name</Text>
        <TextInput
          style={styles.textInput}
          value={medName}
          onChangeText={setMedName}
          placeholder="e.g. Vitamin D3, Metformin"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <Text style={styles.inputLabel}>Dosage</Text>
        <TextInput
          style={styles.textInput}
          value={medDosage}
          onChangeText={setMedDosage}
          placeholder="e.g. 500mg, 1000 IU, 1 capsule"
          placeholderTextColor={THEME.colors.textMuted}
        />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Frequency / Instructions</Text>
            <TextInput
              style={styles.textInput}
              value={medSchedule}
              onChangeText={setMedSchedule}
              placeholder="e.g. Daily with breakfast"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Time</Text>
            <TextInput
              style={styles.textInput}
              value={medTime}
              onChangeText={setMedTime}
              placeholder="08:30 AM"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveMed}>
          <Text style={styles.modalSubmitBtnText}>Save Medication</Text>
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
  actionBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  actionBtnSmallText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bpDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  bpValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bpBigVal: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  bpUnit: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  bpPulseText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  logsList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 8,
    gap: 6,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logDate: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    width: 100,
  },
  logVal: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  logCategory: {
    fontSize: 11,
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  halfCard: {
    width: '48%',
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  halfCardHeader: {
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
  halfCardTitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  valUnitRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  halfCardVal: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  halfCardUnit: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  halfCardSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  medCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  medContent: {
    flex: 1,
  },
  medTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  medTitleDone: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textMuted,
  },
  medDetails: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  medRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  medStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: THEME.colors.bgCardLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  medStreakActive: {
    backgroundColor: THEME.colors.primaryMuted,
  },
  medStreakNum: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  deleteMedBtn: {
    padding: 4,
  },
  noMedsText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
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
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: THEME.colors.bgCardLight,
    borderRadius: THEME.borderRadius.sm,
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
  clinicalContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  clinicalContextText: {
    fontSize: 11,
    color: '#38BDF8',
    flex: 1,
  },
});
