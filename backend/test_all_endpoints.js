// Comprehensive End-to-End Test Suite for Vitalis Backend APIs
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Vitalis Health Tracker End-to-End API Test Suite...');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health & Server Info
  await test('Server Health Check & Harshita User Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (data.primaryUser !== 'Harshita') throw new Error(`Expected Harshita, got ${data.primaryUser}`);
  });

  // 2. Profile
  await test('GET /api/user/profile returns Harshita profile', async () => {
    const res = await fetch(`${BASE_URL}/user/profile`);
    const data = await res.json();
    if (!data.success || data.data.name !== 'Harshita') {
      throw new Error(`Profile name mismatch: ${JSON.stringify(data)}`);
    }
    if (data.data.age !== 28 || data.data.bloodType !== 'O+') {
      throw new Error(`Profile fields mismatch: age=${data.data.age}`);
    }
  });

  // 3. User Goals
  await test('GET & PUT /api/user/goals', async () => {
    const res = await fetch(`${BASE_URL}/user/goals`);
    const data = await res.json();
    if (!data.success || !data.data.calorieGoal) throw new Error('Failed to get goals');

    const updateRes = await fetch(`${BASE_URL}/user/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calorieGoal: 2050, waterMlGoal: 2500 }),
    });
    const updateData = await updateRes.json();
    if (!updateData.success || updateData.data.calorieGoal !== 2050) {
      throw new Error('Failed to update goals');
    }
  });

  // 4. Dashboard
  await test('GET /api/dashboard returns composite wellness matrix for Harshita', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    const data = await res.json();
    if (!data.success) throw new Error('Dashboard call unsuccessful');
    if (data.data.user.name !== 'Harshita') throw new Error(`User not Harshita`);
    if (typeof data.data.todayCalories.consumed !== 'number') throw new Error('Calories missing');
    if (!data.data.activeGuardrails || data.data.activeGuardrails.length === 0) {
      throw new Error('Guardrails missing');
    }
  });

  // 5. Workouts
  let testWorkoutId = null;
  await test('GET, POST, DELETE /api/workouts (Green/Fitness domain)', async () => {
    const listRes = await fetch(`${BASE_URL}/workouts`);
    const listData = await listRes.json();
    const workoutsList = Array.isArray(listData.data) ? listData.data : listData.data?.workouts;
    if (!listData.success || !Array.isArray(workoutsList)) throw new Error('Failed to list workouts');

    const createRes = await fetch(`${BASE_URL}/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Harshita Core & Glutes Stability',
        category: 'Strength',
        durationMinutes: 45,
        caloriesBurned: 320,
        rpe: 7,
        exercises: [{ name: 'Glute Bridges', sets: 3, reps: 15, weightKg: 0 }],
      }),
    });
    const createData = await createRes.json();
    if (!createData.success || !createData.data.id) throw new Error('Failed to create workout');
    testWorkoutId = createData.data.id;

    // Delete workout
    const delRes = await fetch(`${BASE_URL}/workouts/${testWorkoutId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    if (!delData.success) throw new Error('Failed to delete test workout');
  });

  // 6. Nutrition & Meals
  let testMealId = null;
  await test('GET, POST, DELETE /api/nutrition/meals (Orange/Nutrition domain)', async () => {
    const listRes = await fetch(`${BASE_URL}/nutrition/meals`);
    const listData = await listRes.json();
    if (!listData.success || !Array.isArray(listData.data)) throw new Error('Failed to list meals');

    const createRes = await fetch(`${BASE_URL}/nutrition/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Avocado Toast with Poached Eggs',
        mealType: 'Breakfast',
        calories: 380,
        proteinG: 18,
        carbsG: 32,
        fatG: 20,
      }),
    });
    const createData = await createRes.json();
    if (!createData.success || !createData.data.id) throw new Error('Failed to create meal');
    testMealId = createData.data.id;

    // Delete meal
    const delRes = await fetch(`${BASE_URL}/nutrition/meals/${testMealId}`, { method: 'DELETE' });
    const delData = await delRes.json();
    if (!delData.success) throw new Error('Failed to delete test meal');
  });

  // 7. Habits (Water, Sleep, Steps, Mood)
  await test('POST /api/habits (water, sleep, steps, mood)', async () => {
    const waterRes = await fetch(`${BASE_URL}/habits/water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountMl: 250 }),
    });
    if (!waterRes.ok) throw new Error('Water log failed');

    const sleepRes = await fetch(`${BASE_URL}/habits/sleep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationHours: 7.5, qualityScore: 88 }),
    });
    if (!sleepRes.ok) throw new Error('Sleep log failed');

    const stepsRes = await fetch(`${BASE_URL}/habits/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 4200 }),
    });
    if (!stepsRes.ok) throw new Error('Steps log failed');

    const moodRes = await fetch(`${BASE_URL}/habits/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4, label: 'Energized', notes: 'Great recovery' }),
    });
    if (!moodRes.ok) throw new Error('Mood log failed');
  });

  // 8. Vitals (BP, HR, Glucose, Medications)
  await test('POST & GET /api/vitals (BP, HR, Glucose, Medications)', async () => {
    const bpRes = await fetch(`${BASE_URL}/vitals/blood-pressure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systolic: 118, diastolic: 76, pulse: 68 }),
    });
    if (!bpRes.ok) throw new Error('BP log failed');

    const hrRes = await fetch(`${BASE_URL}/vitals/heart-rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bpm: 66, context: 'resting' }),
    });
    if (!hrRes.ok) throw new Error('HR log failed');

    const vitalsRes = await fetch(`${BASE_URL}/vitals`);
    const vitalsData = await vitalsRes.json();
    if (!vitalsData.success || !vitalsData.data.medications) {
      throw new Error('Vitals fetch failed');
    }
  });

  // 9. Cycle Tracking
  await test('GET /api/cycle & POST symptom', async () => {
    const cycleRes = await fetch(`${BASE_URL}/cycle`);
    const cycleData = await cycleRes.json();
    if (!cycleRes.ok || !cycleData.data.settings) throw new Error('Cycle fetch failed');

    const sympRes = await fetch(`${BASE_URL}/cycle/symptoms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptom: 'Mild fatigue', severity: 2 }),
    });
    if (!sympRes.ok) throw new Error('Symptom log failed');
  });

  // 10. AI Health Advisor
  await test('POST /api/advisor/query specifically tailored to Harshita', async () => {
    const advRes = await fetch(`${BASE_URL}/advisor/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What workout should I do with my knee recovery and hypertension?' }),
    });
    const advData = await advRes.json();
    if (!advData.success || !advData.data.answer.includes('Harshita')) {
      throw new Error(`Advisor answer did not mention Harshita: ${JSON.stringify(advData)}`);
    }
  });

  // 11. Sync
  await test('GET /api/sync full composite data snapshot', async () => {
    const syncRes = await fetch(`${BASE_URL}/sync`);
    const syncData = await syncRes.json();
    if (!syncData.success || syncData.data.profile.name !== 'Harshita') {
      throw new Error('Sync failed or profile name mismatch');
    }
  });

  console.log(`\n=======================================================`);
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`=======================================================`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
