const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function checkStudent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fee_management');
        console.log('Connected to DB');
        
        const student = await Student.findOne({ firstName: 'Jeffin', lastName: 'John' });
        if (student) {
            console.log('Found Student:', student.firstName, student.lastName);
            console.log('Active Fee Structure ID:', student.activeFeeStructure);
            console.log('Raw Student Data:', JSON.stringify(student, null, 2));
        } else {
            console.log('Student "Jeffin John" not found');
        }
        
    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkStudent();
