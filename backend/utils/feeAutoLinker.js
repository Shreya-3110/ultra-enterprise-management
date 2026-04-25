const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');

/**
 * Automatically find and link a student to a FeeStructure based on Class/Category
 * Also initializes the individual StudentFee ledger
 */
const autoLinkStudentToFee = async (studentId, schoolId) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) return null;

    // 1. Find ALL matching Fee Structures
    const matchingFees = await FeeStructure.find({
      schoolId: schoolId,
      applicableClasses: student.currentClass,
      category: student.category || 'GENERAL',
      isActive: true
    });

    if (!matchingFees || matchingFees.length === 0) {
      console.log(`[Fee Linker] No matching fees found for Student: ${student.firstName} (Class: ${student.currentClass})`);
      return [];
    }

    console.log(`[Fee Linker] Found ${matchingFees.length} Match(es) for Student: ${student.firstName}`);

    const linkedIds = [];

    for (const matchingFee of matchingFees) {
      linkedIds.push(matchingFee._id);

      // 2. Initialize the Ledger (StudentFee) for each fee if not exists
      let studentFee = await StudentFee.findOne({
        studentId: student._id,
        feeStructureId: matchingFee._id
      });

      if (!studentFee) {
        studentFee = await StudentFee.create({
          schoolId: schoolId,
          studentId: student._id,
          feeStructureId: matchingFee._id,
          installments: matchingFee.installments.map(inst => ({
            amount: inst.amount,
            paidAmount: 0,
            dueDate: inst.dueDate,
            status: 'PENDING'
          }))
        });
        console.log(`[Fee Linker] Initialized Ledger for "${matchingFee.name}"`);
      }
    }

    // 3. Update Student list of fees (using $addToSet to avoid duplicates)
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { activeFeeStructures: { $each: linkedIds } }
    });

    return matchingFees;
  } catch (error) {
    console.error('[Fee Linker Error]', error.message);
    return [];
  }
};

module.exports = { autoLinkStudentToFee };
