const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const School = require('../models/School');
const User = require('../models/User');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await School.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await FeeStructure.deleteMany({});

    // 1. Create Schools for different tiers
    const basicSchool = await School.create({
      name: 'Basic Academy',
      subscriptionPlan: 'BASIC'
    });

    const premiumSchool = await School.create({
      name: 'Ultra Premium Global School',
      subscriptionPlan: 'PREMIUM',
      branches: [
        { name: 'New Delhi', location: 'South Ex' },
        { name: 'Mumbai', location: 'Bandra' }
      ]
    });

    // 2. Create Admin Users
    const adminBasic = await User.create({
      name: 'Basic Admin',
      email: 'admin@basic.com',
      password: 'password123',
      role: 'ADMIN',
      schoolId: basicSchool._id
    });

    const adminPremium = await User.create({
      name: 'Premium Admin',
      email: 'admin@premium.com',
      password: 'password123',
      role: 'ADMIN',
      schoolId: premiumSchool._id,
      isHeadOffice: true
    });

    const staffPremium = await User.create({
      name: 'Premium Staff',
      email: 'staff@premium.com',
      password: 'password123',
      role: 'STAFF',
      schoolId: premiumSchool._id
    });

    // 3. Create Sample Students for Premium School
    await Student.create([
      {
        schoolId: premiumSchool._id,
        firstName: 'Aryan',
        lastName: 'Sharma',
        admissionNumber: 'ADM-2024-001',
        currentClass: 'X-A',
        section: 'A',
        parentDetails: {
          name: 'Rajesh Sharma',
          phone: '9876543210',
          email: 'shreyaupadhyaysjcs@gmail.com'
        }
      },
      {
        schoolId: premiumSchool._id,
        admissionNumber: 'STUD002',
        firstName: 'Sanya',
        lastName: 'Gupta',
        currentClass: 'IX-B',
        parentDetails: { name: 'Rakesh Gupta', phone: '9876543211' }
      }
    ]);

    // 4. Create Fee Structures
    const tuitionFee = await FeeStructure.create({
      schoolId: premiumSchool._id,
      name: 'Tuition Fee',
      amount: 45000,
      frequency: 'YEARLY',
      applicableClasses: ['X-A', 'IX-B'],
      lateFee: 500,
      installments: [
        { amount: 15000, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'PENDING' }, // Due in 3 days
        { amount: 15000, dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), status: 'PENDING' }, // Overdue (Multiple of 3)
        { amount: 15000, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: 'PENDING' }
      ]
    });

    // 5. Create Individual Student Ledgers (StudentFee)
    const aryan = await Student.findOne({ firstName: 'Aryan' });
    if (aryan) {
      const StudentFee = require('../models/StudentFee');
      await StudentFee.create({
        schoolId: premiumSchool._id,
        studentId: aryan._id,
        feeStructureId: tuitionFee._id,
        installments: tuitionFee.installments
      });
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
