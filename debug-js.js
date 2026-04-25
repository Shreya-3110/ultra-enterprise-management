const mongoose = require('mongoose');
const Student = require('./backend/models/Student');
require('dotenv').config({ path: './backend/.env' });

async function checkStudent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fee_management');
        console.log('Connected to DB');
        
        const student = await Student.findOne({ firstName: 'Jeffin', lastName: 'John' });
        if (student) {
            console.log('Found Student:', student.firstName, student.lastName);
            console.log('Active Fee Structure:', student.activeFeeStructure);
            console.log('Raw Student:', JSON.stringify(student, null, 2));
        } else {
            console.log('Student not found');
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkStudent();
