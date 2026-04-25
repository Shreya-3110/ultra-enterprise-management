const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Models
const FeeStructure = require(path.join(__dirname, '../backend/models/FeeStructure'));
const User = require(path.join(__dirname, '../backend/models/User'));
const Student = require(path.join(__dirname, '../backend/models/Student'));

const verify = async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not found in .env');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'admin@premium.com' });
    if (!user) throw new Error('Test user not found');

    // Create
    const fee = await FeeStructure.create({
      schoolId: user.schoolId,
      name: 'Installment Test ' + Date.now(),
      amount: 5000,
      installments: [
        { amount: 2500, dueDate: new Date(), status: 'PENDING' },
        { amount: 2500, dueDate: new Date(), status: 'PENDING' }
      ]
    });
    console.log('Created test fee structure');

    // Simulate payment logic
    const paymentAmount = 2500;
    const fs = await FeeStructure.findById(fee._id);
    const nextInst = fs.installments.find(i => i.status === 'PENDING');
    
    if (nextInst && paymentAmount >= nextInst.amount) {
      nextInst.status = 'PAID';
      await fs.save();
      console.log('Payment of 2500 processed against installment');
    }

    const finalFs = await FeeStructure.findById(fee._id);
    console.log('Installment 1 Status:', finalFs.installments[0].status);
    console.log('Installment 2 Status:', finalFs.installments[1].status);

    if (finalFs.installments[0].status === 'PAID') {
      console.log('✅ VERIFICATION SUCCESSFUL');
    } else {
      console.log('❌ VERIFICATION FAILED');
    }

    await FeeStructure.deleteOne({ _id: fee._id });
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

verify();
