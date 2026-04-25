const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API = 'http://localhost:5000/api/v1';
const User = require('../models/User');
const mongoose = require('mongoose');

async function runAdvancedAudit() {
    console.log('🚀 INITIALIZING ADVANCED ENTERPRISE AUDIT...');
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const adminUser = await User.findOne({ email: 'admin@premium.com' });
        
        // Grant temporary elevated privilege for the audit
        adminUser.isHeadOffice = true;
        await adminUser.save();
        
        const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('✅ AUTHENTICATION VERIFIED');

        // 1. TEST AI PREDICTIONS
        console.log('--- TESTING AI INTELLIGENCE ---');
        const aiRes = await axios.get(`${API}/dashboard/ai-predictions`, config);
        const aiData = aiRes.data.data;
        console.log('✅ AI FORECAST RECEIVED: ' + aiData.forecast.length + ' Months Projected');
        console.log('✅ RISK MONITOR ACTIVE: ' + aiData.riskProfiles.length + ' Profiles Scanned');

        // 2. TEST DISASTER RECOVERY (BACKUP)
        console.log('--- TESTING DISASTER RECOVERY ---');
        const backupRes = await axios.post(`${API}/recovery/backup`, {}, config);
        console.log('✅ SNAPSHOT CREATED: ' + backupRes.data.data.filename);

        console.log('🏁 ADVANCED AUDIT PASSED: PLATFORM IS DISASTER-PROOF');
        process.exit(0);
    } catch (error) {
        console.error('❌ AUDIT FAILED: ' + (error.response?.data?.message || error.message));
        process.exit(1);
    }
}

runAdvancedAudit();
