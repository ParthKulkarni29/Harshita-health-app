import { Platform } from 'react-native';

// Dynamically determine backend base URL
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname || 'localhost';
      return `http://${hostname}:5000/api`;
    }
    return 'http://localhost:5000/api';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  } else {
    return 'http://localhost:5000/api';
  }
};

export const API_BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    config.signal = controller.signal;

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[API] Request to ${endpoint} timed out.`);
    } else {
      console.warn(`[API] Error on ${endpoint}:`, err.message);
    }
    throw err;
  }
}

export const api = {
  // Health check
  async checkHealth() {
    return request('/health');
  },

  // Full composite sync
  async getFullSync() {
    const res = await request('/sync');
    return res.data;
  },

  async saveFullSync(data) {
    const res = await request('/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async resetToDefaults() {
    const res = await request('/sync/reset', { method: 'POST' });
    return res.data;
  },

  // Dashboard
  async getDashboard() {
    const res = await request('/dashboard');
    return res.data;
  },

  // User Profile & Goals
  async getProfile() {
    const res = await request('/user/profile');
    return res.data;
  },

  async updateProfile(profile) {
    const res = await request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    return res.data;
  },

  async getGoals() {
    const res = await request('/user/goals');
    return res.data;
  },

  async updateGoals(goals) {
    const res = await request('/user/goals', {
      method: 'PUT',
      body: JSON.stringify(goals),
    });
    return res.data;
  },

  async addCondition(condition) {
    const res = await request('/user/conditions', {
      method: 'POST',
      body: JSON.stringify(condition),
    });
    return res.data;
  },

  async deleteCondition(id) {
    return request(`/user/conditions/${id}`, { method: 'DELETE' });
  },

  async addAllergy(allergy) {
    const res = await request('/user/allergies', {
      method: 'POST',
      body: JSON.stringify(allergy),
    });
    return res.data;
  },

  async deleteAllergy(id) {
    return request(`/user/allergies/${id}`, { method: 'DELETE' });
  },

  async addFamilyHistory(item) {
    const res = await request('/user/family', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return res.data;
  },

  async deleteFamilyHistory(id) {
    return request(`/user/family/${id}`, { method: 'DELETE' });
  },

  async addSurgery(surgery) {
    const res = await request('/user/surgeries', {
      method: 'POST',
      body: JSON.stringify(surgery),
    });
    return res.data;
  },

  async deleteSurgery(id) {
    return request(`/user/surgeries/${id}`, { method: 'DELETE' });
  },

  async submitIntake(intakeData) {
    const res = await request('/user/intake', {
      method: 'POST',
      body: JSON.stringify(intakeData),
    });
    return res.data;
  },

  // Workouts
  async getWorkouts() {
    const res = await request('/workouts');
    return res.data;
  },

  async addWorkout(workout) {
    const res = await request('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
    return res.data;
  },

  async deleteWorkout(id) {
    return request(`/workouts/${id}`, { method: 'DELETE' });
  },

  // Nutrition
  async getNutrition() {
    const res = await request('/nutrition');
    return res.data;
  },

  async addMeal(meal) {
    const res = await request('/nutrition/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    });
    return res.data;
  },

  async deleteMeal(id) {
    return request(`/nutrition/meals/${id}`, { method: 'DELETE' });
  },

  // Habits
  async getHabits() {
    const res = await request('/habits');
    return res.data;
  },

  async addWater(amountMl) {
    const res = await request('/habits/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl }),
    });
    return res.data;
  },

  async logSleep(hours, qualityScore, qualityLabel, bedTime, wakeTime) {
    const res = await request('/habits/sleep', {
      method: 'POST',
      body: JSON.stringify({ hours, qualityScore, qualityLabel, bedTime, wakeTime }),
    });
    return res.data;
  },

  async updateSteps(steps, distanceKm, caloriesBurned) {
    const res = await request('/habits/steps', {
      method: 'POST',
      body: JSON.stringify({ steps, distanceKm, caloriesBurned }),
    });
    return res.data;
  },

  async logMood(name, emoji, score, note) {
    const res = await request('/habits/mood', {
      method: 'POST',
      body: JSON.stringify({ name, emoji, score, note }),
    });
    return res.data;
  },

  // Vitals
  async getVitals() {
    const res = await request('/vitals');
    return res.data;
  },

  async addBloodPressure(systolic, diastolic, pulse) {
    const res = await request('/vitals/blood-pressure', {
      method: 'POST',
      body: JSON.stringify({ systolic, diastolic, pulse }),
    });
    return res.data;
  },

  async addHeartRate(bpm, type) {
    const res = await request('/vitals/heart-rate', {
      method: 'POST',
      body: JSON.stringify({ bpm, type }),
    });
    return res.data;
  },

  async addBloodGlucose(levelMgDl, status) {
    const res = await request('/vitals/blood-glucose', {
      method: 'POST',
      body: JSON.stringify({ levelMgDl, status }),
    });
    return res.data;
  },

  async getMedications() {
    const res = await request('/vitals/medications');
    return res.data;
  },

  async addMedication(med) {
    const res = await request('/vitals/medications', {
      method: 'POST',
      body: JSON.stringify(med),
    });
    return res.data;
  },

  async toggleMedication(id) {
    const res = await request(`/vitals/medications/${id}/toggle`, {
      method: 'PUT',
    });
    return res.data;
  },

  async deleteMedication(id) {
    return request(`/vitals/medications/${id}`, { method: 'DELETE' });
  },

  // Cycle
  async getCycle() {
    const res = await request('/cycle');
    return res.data;
  },

  async logPeriodStart(startDate) {
    const res = await request('/cycle/period-start', {
      method: 'POST',
      body: JSON.stringify({ startDate }),
    });
    return res.data;
  },

  async logCycleSymptom(entry) {
    const res = await request('/cycle/symptoms', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return res.data;
  },

  async deleteCycleLog(id) {
    return request(`/cycle/symptoms/${id}`, { method: 'DELETE' });
  },

  async updateCycleSettings(averageCycleDays, averagePeriodDays) {
    const res = await request('/cycle/settings', {
      method: 'PUT',
      body: JSON.stringify({ averageCycleDays, averagePeriodDays }),
    });
    return res.data;
  },

  // AI Health Advisor
  async queryAdvisor(question) {
    const res = await request('/advisor/query', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
    return res.data;
  },

  async getAdvisorGuidance() {
    const res = await request('/advisor/guidance');
    return res.data;
  },
};
