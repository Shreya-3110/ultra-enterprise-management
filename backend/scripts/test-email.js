const { sendEmailReminder } = require('../utils/notificationService');
const mongoose = require('mongoose');
require('dotenv').config();

const testEmail = async () => {
    console.log('--- STARTING REAL EMAIL TEST ---');
    
    // Connect to DB for logging
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fee_management');
    } catch (e) {
        console.error('DB Connection Failed');
    }

    const recipient = 'johnjeffin78@gmail.com';
    const studentName = 'Jeffin John';
    const feeName = 'Annual Tuition Fee 2026';
    const dueDate = new Date();
    const amount = 5000;
    
    const schoolId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();

    console.log(`Sending professional email alert to ${recipient}...`);
    
    const success = await sendEmailReminder(
        schoolId,
        studentId,
        recipient,
        studentName,
        feeName,
        dueDate,
        amount
    );

    if (success) {
        console.log('✅ EMAIL SENT! Check the inbox at johnjeffin76@gmail.com.');
    } else {
        console.log('❌ FAILED. Check your Gmail App Password / SMTP settings.');
    }

    await mongoose.disconnect();
};

testEmail();
