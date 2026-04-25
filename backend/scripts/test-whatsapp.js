const { sendWhatsAppReminder } = require('../utils/notificationService');
const mongoose = require('mongoose');
require('dotenv').config();

const testRealNotification = async () => {
    console.log('--- STARTING REAL WHATSAPP TEST ---');
    
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fee_management');
        console.log('Database Connected Successfully.');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.error('ERROR: You must add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your .env file first!');
        process.exit(1);
    }

    const testPhone = '9179032730'; // Testing the other number
    const studentName = 'Jeffin John (TEST)';
    const amount = 5000;
    const dueDate = new Date();
    
    // We use a dummy ID for the test log
    const dummyId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();

    console.log(`Sending live alert to ${testPhone}...`);
    
    const success = await sendWhatsAppReminder(
        schoolId,
        dummyId,
        testPhone,
        studentName,
        amount,
        dueDate,
        false
    );

    if (success) {
        console.log('✅ SUCCESS! Check your WhatsApp.');
    } else {
        console.log('❌ FAILED. Check the console logs above for the error.');
    }

    await mongoose.disconnect();
};

testRealNotification();
