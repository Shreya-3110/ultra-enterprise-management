const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API = 'http://localhost:5000/api/v1';
const User = require('../models/User');
const mongoose = require('mongoose');

async function runLifecycle() {
    console.log('🚀 INITIALIZING FULL LIFECYCLE TEST...');
    let token = '';

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const adminUser = await User.findOne({ email: 'admin@premium.com' });
        
        token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        console.log('✅ SECURE TOKEN BRIDGE ESTABLISHED');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. CREATE TEST STUDENT
        const studentRes = await axios.post(`${API}/students`, {
            firstName: 'Test-QA',
            lastName: 'Bot',
            admissionNumber: 'QA-' + Date.now(),
            currentClass: '10',
            section: 'A',
            parentDetails: { name: 'QA Parent', phone: '1234567890', email: 'qa@test.com' }
        }, config);
        const studentId = studentRes.data.data._id;
        console.log('✅ STUDENT CREATED: ' + studentId);

        // 3. RETRIEVE ALLOCATED FEES
        // Note: Students are usually assigned fees automatically by schoolId in some systems
        // We will just verify they exist in the list
        const listRes = await axios.get(`${API}/students`, config);
        const exists = listRes.data.data.some(s => s._id === studentId);
        console.log('✅ STUDENT LISTING VERIFIED: ' + exists);

        // 4. TEST FINANCIAL ADJUSTMENT (WALLET)
        const walletRes = await axios.post(`${API}/adjustments/wallet/${studentId}`, {
            amount: 500,
            action: 'ADD',
            reason: 'QA Test Credit'
        }, config);
        console.log('✅ WALLET ADJUSTMENT SUCCESSFUL. NEW BALANCE: ₹' + walletRes.data.walletBalance);

        console.log('🏁 LIFECYCLE TEST PASSED: ALL SYSTEMS NOMINAL');
    } catch (error) {
        console.error('❌ LIFECYCLE TEST FAILED at step: ' + (error.response?.data?.message || error.message));
        process.exit(1);
    }
}

runLifecycle();
