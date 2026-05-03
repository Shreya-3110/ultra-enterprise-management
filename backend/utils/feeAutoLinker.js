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

    let allFeesToLink = [...matchingFees];

    if (student.activeFeeStructures && student.activeFeeStructures.length > 0) {
      const explicitFees = await FeeStructure.find({
        _id: { $in: student.activeFeeStructures },
        schoolId: schoolId
      });
      
      const existingIds = new Set(allFeesToLink.map(f => f._id.toString()));
      for (const fee of explicitFees) {
        if (!existingIds.has(fee._id.toString())) {
          allFeesToLink.push(fee);
          existingIds.add(fee._id.toString());
        }
      }
    }

    if (!allFeesToLink || allFeesToLink.length === 0) {
      console.log(`[Fee Linker] No fees found to link for Student: ${student.firstName}`);
      return [];
    }

    console.log(`[Fee Linker] Found ${allFeesToLink.length} Match(es) for Student: ${student.firstName}`);

    const linkedIds = [];

    for (const matchingFee of allFeesToLink) {
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

    return allFeesToLink;
  } catch (error) {
    console.error('[Fee Linker Error]', error.message);
    return [];
  }
};

/**
 * Automatically find all matching students and link them to a newly created FeeStructure
 */
const autoLinkFeeToStudents = async (feeStructure) => {
  try {
    // 1. Find all students in the applicable classes and category
    const matchingStudents = await Student.find({
      schoolId: feeStructure.schoolId,
      currentClass: { $in: feeStructure.applicableClasses },
      category: feeStructure.category || 'GENERAL',
      status: 'ACTIVE' // Only link active students
    });

    if (!matchingStudents || matchingStudents.length === 0) {
      console.log(`[Fee Linker] No existing students found to link to new Fee: ${feeStructure.name}`);
      return 0;
    }

    console.log(`[Fee Linker] Linking new fee "${feeStructure.name}" to ${matchingStudents.length} student(s)`);

    let linkedCount = 0;

    for (const student of matchingStudents) {
      // 2. Initialize the Ledger (StudentFee) for each student if not exists
      let studentFee = await StudentFee.findOne({
        studentId: student._id,
        feeStructureId: feeStructure._id
      });

      if (!studentFee) {
        await StudentFee.create({
          schoolId: feeStructure.schoolId,
          studentId: student._id,
          feeStructureId: feeStructure._id,
          installments: feeStructure.installments.map(inst => ({
            amount: inst.amount,
            paidAmount: 0,
            dueDate: inst.dueDate,
            status: 'PENDING'
          }))
        });
        linkedCount++;
      }

      // 3. Update Student list of fees
      await Student.findByIdAndUpdate(student._id, {
        $addToSet: { activeFeeStructures: feeStructure._id }
      });
    }

    return linkedCount;
  } catch (error) {
    console.error('[Fee Linker Error]', error.message);
    return 0;
  }
};

module.exports = { autoLinkStudentToFee, autoLinkFeeToStudents };
