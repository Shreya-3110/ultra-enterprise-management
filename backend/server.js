require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Import routes
const auth = require('./routes/auth');
const students = require('./routes/students');
const fees = require('./routes/fees');
const payments = require('./routes/payments');
const auditRoutes = require('./routes/auditRoutes');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const stripeRoutes = require('./routes/stripe');
const migrationRoutes = require('./routes/migration');
const schoolRoutes = require('./routes/schools');
const franchiseRoutes = require('./routes/franchise');
const adjustmentRoutes = require('./routes/adjustments');
const integrationRoutes = require('./routes/integration');
const recoveryRoutes = require('./routes/recovery');
const { initReminderScheduler } = require('./scripts/reminderScheduler');
const { runReminderEngine } = require('./scripts/reminderScheduler');

// Initialize scheduler
initReminderScheduler();

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/students', students);
app.use('/api/v1/fees', fees);
app.use('/api/v1/payments', payments);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/stripe', stripeRoutes);
app.use('/api/v1/migration', migrationRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/franchise', franchiseRoutes);
app.use('/api/v1/adjustments', adjustmentRoutes);
app.use('/api/v1/integration', integrationRoutes);
app.use('/api/v1/recovery', recoveryRoutes);

app.get('/', (req, res) => {

  res.send('Ultra Enterprise Fee Management API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
