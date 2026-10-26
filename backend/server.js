require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./database/db');

// Route handlers
const userRoutes = require('./routes/user');
const workoutsRoutes = require('./routes/workouts');
const nutritionRoutes = require('./routes/nutrition');
const habitsRoutes = require('./routes/habits');
const vitalsRoutes = require('./routes/vitals');
const cycleRoutes = require('./routes/cycle');
const dashboardRoutes = require('./routes/dashboard');
const advisorRoutes = require('./routes/advisor');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Static serving for compiled React Native / Expo web app
const appDistDir = path.join(__dirname, '..', 'vitalis-health-tracker', 'dist');
app.use('/_expo', express.static(path.join(appDistDir, '_expo')));
app.use('/assets', express.static(path.join(appDistDir, 'assets')));
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(appDistDir, 'favicon.ico'));
});
app.get('/app', (req, res) => {
  res.sendFile(path.join(appDistDir, 'index.html'));
});
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(appDistDir, 'index.html'));
});

// Static serving for the Stitch UI redesign views
const stitchDir = path.join(__dirname, '..', 'stitch_vitalis_health_ui_redesign');
app.use('/stitch', express.static(stitchDir));

// Friendly web route redirects for Stitch UI pages
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(stitchDir, 'vitalis_health_wellness_dashboard', 'code.html'));
});
app.get('/fitness', (req, res) => {
  res.sendFile(path.join(stitchDir, 'vitalis_fitness_training', 'code.html'));
});
app.get('/nutrition', (req, res) => {
  res.sendFile(path.join(stitchDir, 'vitalis_nutrition_macros', 'code.html'));
});
app.get('/telemetry', (req, res) => {
  res.sendFile(path.join(stitchDir, 'vitalis_vitals_habits_ai_advisor', 'code.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Vitalis Health Tracker',
    primaryUser: 'Harshita',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/user/profile',
      '/api/workouts',
      '/api/nutrition',
      '/api/habits',
      '/api/vitals',
      '/api/cycle',
      '/api/dashboard',
      '/api/advisor/query',
      '/api/sync',
    ],
  });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/foods', nutritionRoutes); // Alias
app.use('/api/habits', habitsRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/sync', syncRoutes);

// Root route
app.get('/', (req, res) => {
  if (req.accepts('html') && !req.accepts('json')) {
    return res.redirect('/dashboard');
  }
  res.json({
    name: 'Vitalis Health Tracker Backend API',
    user: 'Harshita',
    version: '1.0.0',
    frontendViews: {
      reactNativeWebApp: '/app',
      wellnessDashboard: '/dashboard',
      fitnessTraining: '/fitness',
      nutritionMacros: '/nutrition',
      telemetryAndAdvisor: '/telemetry',
    },
    documentation: {
      health: '/api/health',
      profile: '/api/user/profile',
      dashboard: '/api/dashboard',
      workouts: '/api/workouts',
      nutrition: '/api/nutrition',
      habits: '/api/habits',
      vitals: '/api/vitals',
      cycle: '/api/cycle',
      advisor: '/api/advisor/query',
      sync: '/api/sync',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.getDB();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🩺 Vitalis Health Backend API running on port ${PORT}`);
      console.log(`👤 Active Primary User: Harshita`);
      console.log(`📡 Endpoints live at http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start Vitalis Backend Server:', err);
    process.exit(1);
  }
}

startServer();
