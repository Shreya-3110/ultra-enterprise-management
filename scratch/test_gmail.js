require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const mongoose = require('mongoose');
const { sendWelcomeEmail } = require('../backend/utils/notificationService');

const testGmail = async () => {
    try {
        console.log('Connecting to MongoDB (needed for Notification model logging)...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('Testing Gmail SMTP Connection...');
        // Use an arbitrary mock object ID for schoolId
        const dummySchoolId = new mongoose.Types.ObjectId();
        
        // We will send an email to the SMTP_USER itself to test it
        const recipient = process.env.SMTP_USER;
        
        console.log(`Sending test email to: ${recipient}`);
        
        const success = await sendWelcomeEmail(
            dummySchoolId, 
            recipient, 
            'System Tester', 
            'ADMIN', 
            'Ultra Enterprise', 
            'TestPassword123'
        );

        if (success) {
            console.log('✅ Gmail SMTP is configured and working properly!');
            console.log('Check your inbox to verify the credentials formatting.');
        } else {
            console.log('❌ Failed to send email. Please check your App Password or SMTP settings in backend/.env');
        }

    } catch (err) {
        console.error('Fatal Error during test:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testGmail();
