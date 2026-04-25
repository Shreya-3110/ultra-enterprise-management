const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { runReminderEngine } = require('./reminderScheduler');

const test = async () => {
  try {
    console.log('--- MANUAL REMINDER TRIGGER STARTED ---');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    await runReminderEngine();

    console.log('--- MANUAL REMINDER TRIGGER FINISHED ---');
    process.exit(0);
  } catch (error) {
    console.error('Error in manual trigger:', error);
    process.exit(1);
  }
};

test();
