# Vitalis Health Tracker 🩺✨

Full-stack clinical and wellness health tracking application tailored for **Harshita** (28yo, 62.5kg, 168cm, O+).

---

## 🏗️ Project Architecture

```
vital health/
├── backend/                              # Express.js REST API with persistent SQLite
│   ├── data/vitalis.sqlite               # Persistent SQLite database file
│   ├── database/
│   │   ├── schema.sql                    # 19 normalized clinical & wellness tables
│   │   ├── seed.js                       # Comprehensive Harshita seed dataset
│   │   └── db.js                         # WebAssembly SQLite engine (sql.js) with sync
│   ├── routes/
│   │   ├── user.js                       # Profile, goals, medical history, clinical intake
│   │   ├── workouts.js                   # Workouts, streak, exercises, calories burned (Green theme)
│   │   ├── nutrition.js                  # Meals, macros, calories remaining (Orange theme)
│   │   ├── habits.js                     # Water (+250ml increments), sleep, steps, mood
│   │   ├── vitals.js                     # Blood pressure, heart rate, glucose, medications
│   │   ├── cycle.js                      # Menstrual cycle tracking, phase calculator, symptoms
│   │   ├── dashboard.js                  # Composite biomarker score & daily summary
│   │   ├── advisor.js                    # Guardrail-aware AI Health Advisor for Harshita
│   │   └── sync.js                       # Composite sync & factory reset
│   ├── server.js                         # Express server (serves APIs + Stitch UI + Web App)
│   ├── test_all_endpoints.js             # Automated 11-step end-to-end test suite
│   ├── .env                              # Environment configuration (PORT=5000, DEFAULT_USER=Harshita)
│   └── .env.example                      # Safe template
│
├── vitalis-health-tracker/               # React Native / Expo SDK 58 Frontend
│   ├── src/
│   │   ├── services/api.js               # Dynamic platform-aware REST client SDK
│   │   ├── services/storage.js           # Cloud REST sync with AsyncStorage offline cache
│   │   ├── constants/sampleData.js       # Harshita baseline clinical profile & targets
│   │   ├── screens/                      # Dashboard, Fitness, Nutrition, Vitals, Profile
│   │   └── components/                   # AI Health Advisor, Intake Modal, Ring Charts
│   └── dist/                             # Pre-compiled production React Native Web distribution
│
└── stitch_vitalis_health_ui_redesign/    # Stitch UI Redesign (Desktop/Tablet dashboard views)
    ├── vitalis_health_wellness_dashboard # Live wellness matrix & water logging
    ├── vitalis_fitness_training          # Live workout logging & history
    ├── vitalis_nutrition_macros          # Live meal logging & macro breakdown
    └── vitalis_vitals_habits_ai_advisor  # Live vitals telemetry & AI clinical advisor
```

---

## 🚀 How to Run

### Option 1: All-in-One Backend + Web Launch (Recommended)
The Express backend automatically serves the REST API, the compiled React Native Web App, and the Stitch UI redesign views from a single server:

```powershell
# From the project root
npm start
```

Then open in your browser:
- **Wellness Dashboard**: [http://localhost:5000/dashboard](http://localhost:5000/dashboard)
- **Fitness & Workouts (Green Theme)**: [http://localhost:5000/fitness](http://localhost:5000/fitness)
- **Nutrition & Macros (Orange Theme)**: [http://localhost:5000/nutrition](http://localhost:5000/nutrition)
- **Vitals & AI Advisor**: [http://localhost:5000/telemetry](http://localhost:5000/telemetry)
- **React Native Web App**: [http://localhost:5000/app](http://localhost:5000/app)
- **API Health & Endpoints Status**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Option 2: Running Expo React Native Dev Server Directly
If you want to run the Expo React Native interactive development server:

```powershell
# In terminal 1 (Backend API)
cd backend
npm start

# In terminal 2 (Expo Dev Server)
cd vitalis-health-tracker
npm run web
```
Expo will open on [http://localhost:8081](http://localhost:8081).

---

## 🧪 Automated Test Suite

Run the full end-to-end integration test suite against the live backend:

```powershell
npm test
# OR
cd backend && node test_all_endpoints.js
```

### Test Suite Results:
- ✅ Server Health Check & Harshita Primary User verification
- ✅ `GET /api/user/profile` returns Harshita clinical baseline (28yo, 62.5kg, 168cm, O+)
- ✅ `GET & PUT /api/user/goals` daily hydration, calories, macros, steps targets
- ✅ `GET /api/dashboard` composite wellness matrix, today's calories, active guardrails
- ✅ `GET, POST, DELETE /api/workouts` (Green/Fitness domain)
- ✅ `GET, POST, DELETE /api/nutrition/meals` (Orange/Nutrition domain)
- ✅ `POST /api/habits` (water, sleep, steps, mood)
- ✅ `POST & GET /api/vitals` (blood pressure, heart rate, glucose, medications)
- ✅ `GET /api/cycle & POST symptom` (ovulatory phase, cycle day, fertility window)
- ✅ `POST /api/advisor/query` guardrail-aware personalized clinical AI for Harshita
- ✅ `GET /api/sync` full composite offline/online database snapshot

---

## 👤 Primary User: Harshita

The entire system is calibrated to **Harshita**:
- **Age**: 28 | **Weight**: 62.5 kg | **Height**: 168 cm | **Blood Type**: O+
- **Diagnosed Conditions**: Mild Essential Hypertension (DASH protocol active), Meniscus Strain (Left Knee - joint protection active)
- **Allergies**: Lactose (Moderate), Penicillin (Severe anaphylactic flag)
- **Cycle Sync**: Cycle Day 14 (Ovulatory Phase, Peak energy & stamina)
- **Daily Targets**: 2,100 kcal, 2,500 ml water, 140g protein, 10,000 steps, 8h sleep
