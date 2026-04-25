const mongoose = require('mongoose');
require('dotenv').config();
const AuditLog = require('./models/AuditLog');

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    console.log(`Total Logs in DB: ${logs.length}`);
    console.log('Last 10 Logs:', JSON.stringify(logs.slice(0, 10), null, 2));
    
    // Also check available students to see if they exist
    const Student = require('./models/Student');
    const students = await Student.find().limit(5);
    console.log('Sample Students in DB:', JSON.stringify(students.map(s => ({ name: s.firstName + ' ' + s.lastName, id: s._id, school: s.schoolId })), null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkLogs();
