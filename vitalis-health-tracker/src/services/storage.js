import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_HEALTH_DATA } from '../constants/sampleData';
import { api } from './api';

const STORAGE_KEY = '@vitalis_health_data_v1';

export const storageService = {
  /**
   * Loads health data from the backend SQLite API, with offline AsyncStorage fallback.
   */
  async loadData() {
    try {
      // 1. Try fetching live data from backend SQLite database
      const remoteData = await api.getFullSync();
      if (remoteData && remoteData.profile) {
        // Cache to AsyncStorage for offline resilience
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
        return remoteData;
      }
    } catch (apiErr) {
      console.warn('Backend API unavailable, falling back to local storage cache:', apiErr.message);
    }

    // 2. Fallback to AsyncStorage cache
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json != null) {
        const parsed = JSON.parse(json);
        if (!parsed.profile) parsed.profile = {};
        if (!parsed.profile.name || parsed.profile.name === 'Alex Johnson') {
          parsed.profile.name = 'Harshita';
        }
        if (!parsed.profile.healthHistory) {
          parsed.profile.healthHistory = INITIAL_HEALTH_DATA.profile.healthHistory;
        }
        if (!parsed.cycle) {
          parsed.cycle = INITIAL_HEALTH_DATA.cycle;
        }
        return parsed;
      }

      // 3. First-run fallback
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HEALTH_DATA));
      return INITIAL_HEALTH_DATA;
    } catch (e) {
      console.error('Failed to load health data from local storage:', e);
      return INITIAL_HEALTH_DATA;
    }
  },

  /**
   * Persists entire health data state to backend and local storage.
   */
  async saveData(data) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Try background sync to backend
      api.saveFullSync(data).catch(() => {});
      return true;
    } catch (e) {
      console.error('Failed to save health data to storage:', e);
      return false;
    }
  },

  /**
   * Resets data to default Harshita state.
   */
  async resetToDefaults() {
    try {
      const resetData = await api.resetToDefaults();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
      return resetData;
    } catch (e) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HEALTH_DATA));
      return INITIAL_HEALTH_DATA;
    }
  },

  /**
   * Water tracking helpers
   */
  async addWater(amountMl) {
    try {
      await api.addWater(amountMl);
    } catch (e) {
      console.warn('Backend addWater failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    const current = Math.max(0, (data.habits?.waterCurrentMl || 0) + amountMl);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!data.habits) data.habits = {};
    data.habits.waterCurrentMl = current;
    if (amountMl > 0) {
      data.habits.waterLogs = [
        { id: `w_${Date.now()}`, time: timeStr, amountMl },
        ...(data.habits.waterLogs || []),
      ].slice(0, 20);
    }
    await this.saveData(data);
    return data;
  },

  /**
   * Mood logging helper
   */
  async logMood(moodName, emoji, score, note) {
    try {
      await api.logMood(moodName, emoji, score, note);
    } catch (e) {
      console.warn('Backend logMood failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    data.habits.mood = {
      current: moodName,
      emoji: emoji || '😊',
      score: score || 4,
      note: note || '',
      time: timeStr,
    };
    await this.saveData(data);
    return data;
  },

  /**
   * Sleep logging helper
   */
  async logSleep(hours, qualityScore, qualityLabel, bedTime, wakeTime) {
    try {
      await api.logSleep(hours, qualityScore, qualityLabel, bedTime, wakeTime);
    } catch (e) {
      console.warn('Backend logSleep failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    data.habits.sleep = {
      hours: parseFloat(hours),
      qualityScore: parseInt(qualityScore, 10),
      qualityLabel: qualityLabel || 'Good',
      bedTime: bedTime || '11:00 PM',
      wakeTime: wakeTime || '07:00 AM',
      deepSleepHours: (parseFloat(hours) * 0.25).toFixed(1),
      remSleepHours: (parseFloat(hours) * 0.22).toFixed(1),
    };
    await this.saveData(data);
    return data;
  },

  /**
   * Step logger
   */
  async updateSteps(newSteps) {
    const stepsCount = parseInt(newSteps, 10);
    const distanceKm = parseFloat(((stepsCount * 0.75) / 1000).toFixed(1));
    const caloriesBurned = Math.round(stepsCount * 0.042);

    try {
      await api.updateSteps(stepsCount, distanceKm, caloriesBurned);
    } catch (e) {
      console.warn('Backend updateSteps failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    data.habits.steps = {
      ...data.habits.steps,
      current: stepsCount,
      distanceKm,
      caloriesBurned,
    };
    await this.saveData(data);
    return data;
  },

  /**
   * Nutrition helpers
   */
  async addMeal(meal) {
    try {
      await api.addMeal(meal);
    } catch (e) {
      console.warn('Backend addMeal failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    const newMeal = {
      id: `m_${Date.now()}`,
      time: meal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: meal.type || 'Meal',
      name: meal.name,
      calories: parseInt(meal.calories, 10) || 0,
      proteinG: parseInt(meal.proteinG, 10) || 0,
      carbsG: parseInt(meal.carbsG, 10) || 0,
      fatG: parseInt(meal.fatG, 10) || 0,
    };
    data.nutrition.meals = [newMeal, ...(data.nutrition.meals || [])];
    await this.saveData(data);
    return data;
  },

  async deleteMeal(mealId) {
    try {
      await api.deleteMeal(mealId);
    } catch (e) {
      console.warn('Backend deleteMeal failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    data.nutrition.meals = (data.nutrition.meals || []).filter((m) => m.id !== mealId);
    await this.saveData(data);
    return data;
  },

  /**
   * Fitness helpers
   */
  async addWorkout(workout) {
    try {
      await api.addWorkout(workout);
    } catch (e) {
      console.warn('Backend addWorkout failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    const newWorkout = {
      id: `f_${Date.now()}`,
      title: workout.title,
      category: workout.category || 'Fitness',
      durationMinutes: parseInt(workout.durationMinutes, 10) || 30,
      caloriesBurned: parseInt(workout.caloriesBurned, 10) || 200,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: workout.distanceKm ? parseFloat(workout.distanceKm) : undefined,
      notes: workout.notes || '',
      exercises: workout.exercises || [],
    };
    data.fitness.workouts = [newWorkout, ...(data.fitness.workouts || [])];
    data.fitness.totalWorkoutsThisWeek = (data.fitness.totalWorkoutsThisWeek || 0) + 1;
    await this.saveData(data);
    return data;
  },

  async deleteWorkout(workoutId) {
    try {
      await api.deleteWorkout(workoutId);
    } catch (e) {
      console.warn('Backend deleteWorkout failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    data.fitness.workouts = (data.fitness.workouts || []).filter((w) => w.id !== workoutId);
    await this.saveData(data);
    return data;
  },

  /**
   * Vitals & Medical helpers
   */
  async addBloodPressure(systolic, diastolic, pulse) {
    const s = parseInt(systolic, 10);
    const d = parseInt(diastolic, 10);
    const p = parseInt(pulse, 10) || 70;

    try {
      await api.addBloodPressure(s, d, p);
    } catch (e) {
      console.warn('Backend addBloodPressure failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    let category = 'Normal';
    if (s >= 140 || d >= 90) category = 'Stage 2 Hypertension';
    else if (s >= 130 || d >= 80) category = 'Stage 1 Hypertension';
    else if (s >= 120 && d < 80) category = 'Elevated';

    const newLog = {
      id: `bp_${Date.now()}`,
      systolic: s,
      diastolic: d,
      pulse: p,
      category,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    data.vitals.bloodPressureLogs = [newLog, ...(data.vitals.bloodPressureLogs || [])];
    await this.saveData(data);
    return data;
  },

  async addHeartRate(bpm, type) {
    const rate = parseInt(bpm, 10);
    try {
      await api.addHeartRate(rate, type);
    } catch (e) {
      console.warn('Backend addHeartRate failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    const newLog = {
      id: `hr_${Date.now()}`,
      bpm: rate,
      type: type || 'Current',
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    data.vitals.heartRateLogs = [newLog, ...(data.vitals.heartRateLogs || [])];
    await this.saveData(data);
    return data;
  },

  async addBloodGlucose(levelMgDl, status) {
    const level = parseInt(levelMgDl, 10);
    try {
      await api.addBloodGlucose(level, status);
    } catch (e) {
      console.warn('Backend addBloodGlucose failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    const newLog = {
      id: `bg_${Date.now()}`,
      levelMgDl: level,
      status: status || 'Random',
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    data.vitals.bloodGlucoseLogs = [newLog, ...(data.vitals.bloodGlucoseLogs || [])];
    await this.saveData(data);
    return data;
  },

  async toggleMedication(medId) {
    try {
      await api.toggleMedication(medId);
    } catch (e) {
      console.warn('Backend toggleMedication failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    data.vitals.medications = (data.vitals.medications || []).map((m) => {
      if (m.id === medId) {
        const nextTaken = !m.takenToday;
        return {
          ...m,
          takenToday: nextTaken,
          streakDays: nextTaken ? m.streakDays + 1 : Math.max(0, m.streakDays - 1),
        };
      }
      return m;
    });
    await this.saveData(data);
    return data;
  },

  async addMedication(med) {
    try {
      await api.addMedication(med);
    } catch (e) {
      console.warn('Backend addMedication failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    const newMed = {
      id: `med_${Date.now()}`,
      name: med.name,
      dosage: med.dosage,
      schedule: med.schedule || 'Daily',
      time: med.time || '09:00 AM',
      takenToday: false,
      streakDays: 0,
    };
    data.vitals.medications = [...(data.vitals.medications || []), newMed];
    await this.saveData(data);
    return data;
  },

  async deleteMedication(medId) {
    try {
      await api.deleteMedication(medId);
    } catch (e) {
      console.warn('Backend deleteMedication failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    data.vitals.medications = (data.vitals.medications || []).filter((m) => m.id !== medId);
    await this.saveData(data);
    return data;
  },

  /**
   * Goals updater
   */
  async updateGoals(goals) {
    try {
      await api.updateGoals(goals);
    } catch (e) {
      console.warn('Backend updateGoals failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    data.profile.goals = {
      ...data.profile.goals,
      ...goals,
    };
    await this.saveData(data);
    return data;
  },

  /**
   * Health History & Clinical Profile helpers
   */
  async addCondition(condition) {
    try {
      await api.addCondition(condition);
    } catch (e) {
      console.warn('Backend addCondition failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (!data.profile.healthHistory) data.profile.healthHistory = { conditions: [], allergies: [], familyHistory: [], surgeries: [] };
    if (!data.profile.healthHistory.conditions) data.profile.healthHistory.conditions = [];

    const newCondition = {
      id: `c_${Date.now()}`,
      name: condition.name,
      diagnosedYear: parseInt(condition.diagnosedYear, 10) || new Date().getFullYear(),
      status: condition.status || 'Active',
      severity: condition.severity || 'Mild',
      physicianNotes: condition.physicianNotes || '',
    };
    data.profile.healthHistory.conditions = [newCondition, ...data.profile.healthHistory.conditions];
    await this.saveData(data);
    return data;
  },

  async deleteCondition(conditionId) {
    try {
      await api.deleteCondition(conditionId);
    } catch (e) {
      console.warn('Backend deleteCondition failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (data.profile?.healthHistory?.conditions) {
      data.profile.healthHistory.conditions = data.profile.healthHistory.conditions.filter((c) => c.id !== conditionId);
      await this.saveData(data);
    }
    return data;
  },

  async addAllergy(allergy) {
    try {
      await api.addAllergy(allergy);
    } catch (e) {
      console.warn('Backend addAllergy failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (!data.profile.healthHistory) data.profile.healthHistory = { conditions: [], allergies: [], familyHistory: [], surgeries: [] };
    if (!data.profile.healthHistory.allergies) data.profile.healthHistory.allergies = [];

    const newAllergy = {
      id: `a_${Date.now()}`,
      allergen: allergy.allergen,
      severity: allergy.severity || 'Moderate',
      reaction: allergy.reaction || '',
    };
    data.profile.healthHistory.allergies = [newAllergy, ...data.profile.healthHistory.allergies];
    await this.saveData(data);
    return data;
  },

  async deleteAllergy(allergyId) {
    try {
      await api.deleteAllergy(allergyId);
    } catch (e) {
      console.warn('Backend deleteAllergy failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (data.profile?.healthHistory?.allergies) {
      data.profile.healthHistory.allergies = data.profile.healthHistory.allergies.filter((a) => a.id !== allergyId);
      await this.saveData(data);
    }
    return data;
  },

  async addFamilyHistory(familyItem) {
    try {
      await api.addFamilyHistory(familyItem);
    } catch (e) {
      console.warn('Backend addFamilyHistory failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (!data.profile.healthHistory) data.profile.healthHistory = { conditions: [], allergies: [], familyHistory: [], surgeries: [] };
    if (!data.profile.healthHistory.familyHistory) data.profile.healthHistory.familyHistory = [];

    const newFamily = {
      id: `f_${Date.now()}`,
      relation: familyItem.relation,
      condition: familyItem.condition,
      diagnosedAge: parseInt(familyItem.diagnosedAge, 10) || 50,
      notes: familyItem.notes || '',
    };
    data.profile.healthHistory.familyHistory = [newFamily, ...data.profile.healthHistory.familyHistory];
    await this.saveData(data);
    return data;
  },

  async deleteFamilyHistory(familyId) {
    try {
      await api.deleteFamilyHistory(familyId);
    } catch (e) {
      console.warn('Backend deleteFamilyHistory failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (data.profile?.healthHistory?.familyHistory) {
      data.profile.healthHistory.familyHistory = data.profile.healthHistory.familyHistory.filter((f) => f.id !== familyId);
      await this.saveData(data);
    }
    return data;
  },

  async addSurgery(surgery) {
    try {
      await api.addSurgery(surgery);
    } catch (e) {
      console.warn('Backend addSurgery failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (!data.profile.healthHistory) data.profile.healthHistory = { conditions: [], allergies: [], familyHistory: [], surgeries: [] };
    if (!data.profile.healthHistory.surgeries) data.profile.healthHistory.surgeries = [];

    const newSurgery = {
      id: `s_${Date.now()}`,
      procedure: surgery.procedure,
      year: parseInt(surgery.year, 10) || new Date().getFullYear(),
      hospital: surgery.hospital || '',
      notes: surgery.notes || '',
    };
    data.profile.healthHistory.surgeries = [newSurgery, ...data.profile.healthHistory.surgeries];
    await this.saveData(data);
    return data;
  },

  async deleteSurgery(surgeryId) {
    try {
      await api.deleteSurgery(surgeryId);
    } catch (e) {
      console.warn('Backend deleteSurgery failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (data.profile?.healthHistory?.surgeries) {
      data.profile.healthHistory.surgeries = data.profile.healthHistory.surgeries.filter((s) => s.id !== surgeryId);
      await this.saveData(data);
    }
    return data;
  },

  /**
   * Menstrual & Period Tracking Helpers
   */
  async logPeriodStart(startDate) {
    try {
      await api.logPeriodStart(startDate);
    } catch (e) {
      console.warn('Backend logPeriodStart failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (!data.cycle) data.cycle = { ...INITIAL_HEALTH_DATA.cycle };

    const start = startDate ? new Date(startDate) : new Date();
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const avgCycle = data.cycle.averageCycleDays || 28;
    const avgPeriod = data.cycle.averagePeriodDays || 5;
    const cycleDay = Math.max(1, ((diffDays - 1) % avgCycle) + 1);

    let phase = 'Menstrual';
    let phaseTitle = 'Menstrual Phase';
    let chanceOfPregnancy = 'Low (Menstruation)';

    if (cycleDay > avgPeriod && cycleDay <= 13) {
      phase = 'Follicular';
      phaseTitle = 'Follicular Phase (Energy Rising)';
      chanceOfPregnancy = 'Moderate (Fertility Window Opening)';
    } else if (cycleDay >= 14 && cycleDay <= 16) {
      phase = 'Ovulation';
      phaseTitle = 'Ovulatory Phase (Peak Fertility)';
      chanceOfPregnancy = 'High (Peak Fertility Window)';
    } else if (cycleDay > 16) {
      phase = 'Luteal';
      phaseTitle = 'Luteal Phase (PMS & Rest)';
      chanceOfPregnancy = 'Low (Post-Ovulatory Window)';
    }

    const daysUntilNext = Math.max(0, avgCycle - cycleDay);

    data.cycle.lastPeriodStartDate = start.toISOString().split('T')[0];
    data.cycle.currentCycleDay = cycleDay;
    data.cycle.currentPhase = phase;
    data.cycle.phaseTitle = phaseTitle;
    data.cycle.daysUntilNextPeriod = daysUntilNext;
    data.cycle.chanceOfPregnancy = chanceOfPregnancy;

    const dateStr = 'Today, ' + today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    data.cycle.symptomLogs = [
      {
        id: `cs_${Date.now()}`,
        date: dateStr,
        cycleDay,
        flow: cycleDay <= avgPeriod ? 'Medium' : 'None',
        symptoms: ['Period Started'],
        mood: 'Normal',
        notes: `Period recorded on cycle day ${cycleDay}`,
      },
      ...(data.cycle.symptomLogs || []),
    ];

    await this.saveData(data);
    return data;
  },

  async logCycleSymptom(entry) {
    try {
      await api.logCycleSymptom(entry);
    } catch (e) {
      console.warn('Backend logCycleSymptom failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (!data.cycle) data.cycle = { ...INITIAL_HEALTH_DATA.cycle };

    const newLog = {
      id: `cs_${Date.now()}`,
      date: 'Today, ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cycleDay: data.cycle.currentCycleDay || 14,
      flow: entry.flow || 'None',
      symptoms: entry.symptoms || [],
      mood: entry.mood || 'Calm',
      notes: entry.notes || '',
    };

    data.cycle.symptomLogs = [newLog, ...(data.cycle.symptomLogs || [])];
    await this.saveData(data);
    return data;
  },

  async deleteCycleLog(id) {
    try {
      await api.deleteCycleLog(id);
    } catch (e) {
      console.warn('Backend deleteCycleLog failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (data.cycle?.symptomLogs) {
      data.cycle.symptomLogs = data.cycle.symptomLogs.filter((l) => l.id !== id);
      await this.saveData(data);
    }
    return data;
  },

  async updateCycleSettings(avgCycleDays, avgPeriodDays) {
    try {
      await api.updateCycleSettings(avgCycleDays, avgPeriodDays);
    } catch (e) {
      console.warn('Backend updateCycleSettings failed, applying locally:', e.message);
    }

    const data = await this.loadData();
    if (!data.cycle) data.cycle = { ...INITIAL_HEALTH_DATA.cycle };

    data.cycle.averageCycleDays = parseInt(avgCycleDays, 10) || 28;
    data.cycle.averagePeriodDays = parseInt(avgPeriodDays, 10) || 5;

    const cycleDay = data.cycle.currentCycleDay || 1;
    data.cycle.daysUntilNextPeriod = Math.max(0, data.cycle.averageCycleDays - cycleDay);

    await this.saveData(data);
    return data;
  },
};
