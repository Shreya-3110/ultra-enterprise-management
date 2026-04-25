const mongoose = require('mongoose');
require('dotenv').config();
const AuditLog = require('./models/AuditLog');
const User = require('./models/User');

async function compareIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const latestLog = await AuditLog.findOne().sort({ timestamp: -1 });
    const allUsers = await User.find({}, 'name email schoolId role');
    
    console.log('--- DEBUG INFO ---');
    if (latestLog) {
      console.log('Latest Log School ID:', latestLog.schoolId);
      console.log('Latest Log User Name:', latestLog.user.name);
    } else {
      console.log('No logs found.');
    }
    
    console.log('\n--- SYSTEM USERS ---');
    allUsers.forEach(u => {
      console.log(`User: ${u.name} | SchoolID: ${u.schoolId} | Role: ${u.role}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

compareIds();
