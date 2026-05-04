const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI;

async function makeHeadOffice() {
  if (!MONGO_URI) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    
    // Update all users to be Head Office for testing purposes, or specifically ADMINs
    const result = await User.updateMany({}, { $set: { isHeadOffice: true } });
    
    console.log(`Success! ${result.modifiedCount} accounts have been upgraded to Head Office privileges.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeHeadOffice();
