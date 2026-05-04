const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ultra_enterprise';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({}, 'name email role isHeadOffice');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
