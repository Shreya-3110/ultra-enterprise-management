const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Student = require('../models/Student');

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const parentEmail = 'johnjeffin78@gmail.com';
    
    const result = await Student.updateMany(
      { firstName: { $in: [/Shreya/i, /Shreshtha/i] } },
      { $set: { 'parentDetails.email': parentEmail } }
    );
    
    console.log(`Matched ${result.matchedCount}, Modified ${result.modifiedCount}`);
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fix();
