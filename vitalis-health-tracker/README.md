# 🩺 Vitalis Health — React Native & Expo Health Tracker with Medical Intake & Clinical Intelligence

A modern, offline-first health tracking mobile application built with **React Native**, **Expo SDK 58**, and `@react-native-async-storage/async-storage`.

Vitalis Health actively takes **all your real personal health inputs** (biometrics, medical history, goals, cycle, medications, lifestyle) through a comprehensive intake assessment, and uses that data to generate an individualized daily health blueprint, clinical guardrails, cycle syncing bio-guidance, and an interactive **Personal Health Advisor**.

---

## ✨ Core Features & How the App Helps You

### 1. 📋 Comprehensive Health Intake Assessment (`src/components/HealthIntakeModal.js`)
Tap **"Health Intake"** in the top header or **"Update Inputs"** on the Dashboard anytime to walk through a 6-step personalized assessment:
- **Step 1: Baseline Biometrics**: Name, Age, Biological Sex, Height (cm), Weight (kg), and Daily Physical Activity Level (*Sedentary*, *Light*, *Moderate*, *Very Active*).
- **Step 2: Primary Health Goals**: Weight management/fat loss, Blood pressure control, Hormone & cycle harmony, Strength & muscle toning, Energy & restful sleep, Gut health.
- **Step 3: Medical Conditions & Allergies**: Diagnosed conditions (Hypertension, Pre-diabetes, PCOS, Asthma, Thyroid, custom) and allergies/sensitivities (Lactose/Dairy, Peanuts, Gluten, Shellfish, Penicillin, etc.).
- **Step 4: Joint History & Genetics**: Musculoskeletal limitations (Knee, Lower back, Shoulder, Neck) and family medical risks (Heart disease, Type 2 diabetes, Stroke).
- **Step 5: Menstrual Cycle Tracking**: Enable/disable period tracking, typical cycle length (days), bleeding duration, and days since last period.
- **Step 6: Medications & Protocol Synthesis**: Enter current daily prescriptions/supplements and view your dynamically calculated daily targets.

### 2. 🤖 Interactive Personal Health Advisor (`src/components/HealthAdvisorModal.js`)
Tap **"Ask Health Advisor"** on the Dashboard for instant personalized clinical guidance:
- **🥗 Nutrition & Diet Guidance**: Tailored meal guidelines respecting your calorie target, macro distribution, and strictly filtering out your active food allergies.
- **🏋️ Safe Workouts & Joint Strategy**: Phase-synced exercise advice with explicit joint protections (e.g. low-impact cardio for knee/back restrictions).
- **🩺 Vitals & Clinical Target Review**: Evaluations of your latest blood pressure and glucose readings against the specific targets for your diagnosed conditions.
- **🌸 Cycle Syncing Guidance**: Informs you of your current hormone phase (Menstrual, Follicular, Ovulation, Luteal) and how to eat and train for optimal energy.
- **💬 Ask Any Question**: Type custom questions (e.g., *"What should I eat for dinner?"*, *"Can I do squats with knee pain?"*, *"Why do I have cramps?"*) to receive answers synthesized directly from your personal health data!

### 3. 🌸 Menstrual Cycle & Period Tracking (`Cycle` Tab & `CycleScreen.js`)
- **Interactive Cycle Phase Visualizer**:
  - Displays current cycle day (e.g. Day 14 of 28).
  - 4-Phase Timeline Bar:
    - 🩸 **Menstrual Phase (Days 1–5)**: Baseline hormones, recovery focus.
    - 🌱 **Follicular Phase (Days 6–13)**: Estrogen rise, high energy.
    - 🌸 **Ovulatory Phase (Days 14–16)**: Peak estrogen & fertility window.
    - 🌙 **Luteal Phase (Days 17–28)**: Progesterone rise, metabolic shift, PMS support.
  - Next period countdown ("Next period in 14 days").
  - Pregnancy / Fertility chance indicator (*High*, *Moderate*, *Low*).
- **Symptom & Flow Logger**:
  - Period flow intensity (*None*, *Spotting*, *Light*, *Medium*, *Heavy*).
  - Multi-select symptom chips (*Cramps*, *Headache*, *Bloating*, *Fatigue*, *Breast Tenderness*, *Acne*, *Lower Back Pain*, *Cravings*, *High Energy*).
  - Mood selector and reflection notes.
- **"Period Started Today"** quick action button to immediately re-anchor Day 1.

### 4. 🛡️ Health History Intelligence Engine (`src/services/healthIntelligence.js`)
- **Clinical Cross-Checks**: Synthesizes diagnosed conditions, allergies, past surgeries, and family medical risks with your live tracking logs (vitals, meals, workouts).
- **Personalized Guardrails**:
  - **Hypertension Guardrail**: Correlates BP readings with hypertension history; provides sodium limits (<2000mg/d) and DASH guidelines.
  - **Injury & Joint Precautions**: Flags high-impact workouts if joint issues exist; suggests cycling, swimming, and rowers.
  - **Allergy Shield**: Flags potential allergens in meals.
  - **Familial Risk Monitoring**: Recommends preventive screenings (e.g. fasting glucose for family diabetes risk).
  - **PCOS / Endocrine Guidance**: Protects against cortisol spikes and supports blood sugar balance.

### 5. 📊 Today / Dashboard
- **Personalized Protocol Active Card**: Shows active biometrics, condition counts, and quick buttons to **"Ask Health Advisor"** or **"Update Inputs"**.
- **Daily Wellness Score**: Real-time aggregate health score out of 100 with dynamic health insights.
- **Menstrual Cycle Snapshot**: Instant cycle phase, cycle day, and next period countdown.
- **Health History Intelligence Card**: Real-time clinical alerts based on today's logs.
- **Pillars Overview**: At-a-glance status for Hydration, Calorie budget, Daily step count, and Sleep quality.
- **Quick Actions**: One-tap `+250ml Water`, `Log Meal`, `Log Workout`, and `Check Vitals`.
- **Medications Due**: Up-next checklist of daily prescriptions/supplements.

### 6. 💧 Daily Habits, 🥗 Nutrition, 🏋️ Fitness, & 🩺 Vitals
- **Hydration**: Target vs. logged water intake with visual progress bar, quick-log buttons, and timestamped history.
- **Nutrition**: Calorie budget deficit/surplus, macro split (Protein, Carbs, Fats), meal logging with allergen flags.
- **Fitness**: Workout logging (Strength with sets/reps, Cardio with km/pace, Yoga, Cycling) with streak tracking.
- **Vitals**: AHA blood pressure tracker, Resting & active heart rate, Blood glucose (fasting & post-meal), and medication manager.
- **Offline-First Storage**: 100% private local storage via `@react-native-async-storage/async-storage` on device.

---

## 🚀 How to Run the App

Open a terminal in the project directory:

```bash
cd "C:\Users\vipul\.gemini\antigravity\scratch\health-tracker-app"
```

### Option 1: Web Browser Preview (Instant)
```bash
npm run web
```
Live at **[http://localhost:3000](http://localhost:3000)**.

### Option 2: Physical Mobile Phone with Expo Go (iOS & Android)
1. Install **Expo Go** from Google Play Store (Android) or App Store (iOS).
2. Start the Expo server:
   ```bash
   npm start
   ```
3. Scan the QR code in the terminal using the Expo Go app (Android) or Camera app (iOS).
