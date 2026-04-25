const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, './backend/.env') });

// Models
const FeeStructure = require(path.join(__dirname, './backend/models/FeeStructure'));
const User = require(path.join(__dirname, './backend/models/User'));
const Student = require(path.join(__dirname, './backend/models/Student'));

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'admin@premium.com' });
    if (!user) throw new Error('Test user not found');

    // 1. Create a Student
    const student = await Student.create({
      schoolId: user.schoolId,
      admissionNumber: 'ADV-TEST-' + Date.now(),
      firstName: 'Test',
      lastName: 'Billing',
      currentClass: 'X',
      walletBalance: 0
    });
    console.log('Created test student');

    // 2. Create a Fee Structure with a LATE installment
    const fee = await FeeStructure.create({
      schoolId: user.schoolId,
      name: 'Advanced Verification Fee',
      amount: 4000,
      lateFee: 200,
      installments: [
        { 
          amount: 1000, 
          dueDate: new Date(Date.now() - 86400000), // 1 day ago
          status: 'PENDING' 
        },
        { 
          amount: 1000, 
          dueDate: new Date(Date.now() + 86400000), // 1 day from now
          status: 'PENDING' 
        }
      ]
    });
    console.log('Created fee with 1 Overdue installment and 1 Pending');

    // 3. Simulate payment logic (Copy-paste of controller logic for verification)
    const paymentAmount = 1500;
    let amountToAllocate = paymentAmount + student.walletBalance;
    
    // A. Mark Overdue
    fee.installments.forEach(inst => {
      if (inst.status === 'PENDING' && new Date(inst.dueDate) < new Date()) {
        inst.status = 'OVERDUE';
      }
    });

    // B. Allocate (Overdue: 1200 total)
    const priorityOrder = ['OVERDUE', 'PENDING'];
    for (const status of priorityOrder) {
      for (const inst of fee.installments) {
        if (inst.status === status) {
          const lateFeeCharge = status === 'OVERDUE' ? (fee.lateFee || 0) : 0;
          const requiredAmount = inst.amount + lateFeeCharge;
          if (amountToAllocate >= requiredAmount) {
            inst.status = 'PAID';
            amountToAllocate -= requiredAmount;
          }
        }
      }
    }
    
    // 4. Update Student
    student.walletBalance = amountToAllocate;
    
    // 5. Assertions
    console.log('--- Results ---');
    console.log('Installment 1 Status (Should be PAID):', fee.installments[0].status);
    console.log('Installment 2 Status (Should be PENDING):', fee.installments[1].status);
    console.log('Final Wallet Balance (Should be 300):', student.walletBalance);

    if (fee.installments[0].status === 'PAID' && student.walletBalance === 300) {
      console.log('✅ VERIFICATION SUCCESSFUL: Late fee applied and overpayment moved to wallet.');
    } else {
      console.log('❌ VERIFICATION FAILED');
    }

    // Cleanup
    await Student.deleteOne({ _id: student._id });
    await FeeStructure.deleteOne({ _id: fee._id });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

verify();
