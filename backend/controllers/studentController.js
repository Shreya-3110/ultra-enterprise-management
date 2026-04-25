const Student = require('../models/Student');
const fs = require('fs');
const csv = require('csv-parser');
const { logAction, ACTIONS } = require('../utils/auditLogger');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const { autoLinkStudentToFee } = require('../utils/feeAutoLinker');

// @desc    Bulk upload students via CSV
// @route   POST /api/v1/students/bulk
exports.bulkUploadStudents = async (req, res) => {
  try {
    console.log('Bulk upload initiated...');
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    console.log('File received:', req.file.originalname, 'Path:', req.file.path);

    const students = [];
    const results = {
      success: 0,
      errors: 0,
      duplicates: 0,
      details: []
    };

    const existingStudents = await Student.find({ schoolId: req.user.schoolId }).select('admissionNumber');
    const existingNumbers = new Set(existingStudents.map(s => s.admissionNumber));

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        // Log the row to see what we're getting
        console.log('Processing row:', row);
        
        // Trim headers and values in case of spaces
        const firstName = row.firstName?.trim();
        const currentClass = row.currentClass?.trim();
        const admNum = row.admissionNumber?.trim();

        if (!firstName || !currentClass) {
          results.errors++;
          results.details.push(`Row missing required fields: ${JSON.stringify(row)}`);
          return;
        }
        // Auto-generate admission number if missing
        let finalAdmNum = admNum;
        if (!finalAdmNum) {
          const year = new Date().getFullYear();
          const random = Math.floor(1000 + Math.random() * 9000);
          finalAdmNum = `ADM-${year}-${random}`;
        }

        // Check for duplicates
        if (existingNumbers.has(finalAdmNum)) {
          results.duplicates++;
          results.details.push(`Duplicate admission number skipped: ${finalAdmNum}`);
          return;
        }

        students.push({
          schoolId: req.user.schoolId,
          admissionNumber: finalAdmNum,
          firstName: firstName,
          lastName: row.lastName?.trim() || '',
          currentClass: currentClass,
          section: row.section?.trim() || '',
          parentDetails: {
            name: row.parentName?.trim() || '',
            phone: row.parentPhone?.trim() || ''
          }
        });
        
        existingNumbers.add(finalAdmNum);
        results.success++;
      })
      .on('error', (err) => {
        console.error('CSV Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'CSV Parsing Error: ' + err.message });
        }
      })
      .on('end', async () => {
        try {
          if (students.length > 0) {
            await Student.insertMany(students);
            
            // Log the bulk import
            await logAction({
              schoolId: req.user.schoolId,
              user: { id: req.user.id, name: req.user.name, role: req.user.role },
              action: ACTIONS.STUDENT_BULK_IMPORT,
              resource: 'Student',
              details: `Bulk imported ${students.length} students via CSV`
            });
          }
          
          // Cleanup file
          fs.unlinkSync(req.file.path);

          // Auto-link fees for all successfully added students
          const addedStudents = await Student.find({ admissionNumber: { $in: students.map(s => s.admissionNumber) } });
          for (const s of addedStudents) {
            await autoLinkStudentToFee(s._id, req.user.schoolId);
          }

          res.status(200).json({
            success: true,
            message: `Bulk processing complete. ${results.success} students added and fees linked.`,
            results
          });
        } catch (err) {
          res.status(500).json({ success: false, message: 'Database insert failed: ' + err.message });
        }
      });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all students for a school
// @route   GET /api/v1/students
exports.getStudents = async (req, res) => {
  try {
    const query = { schoolId: req.user.schoolId };

    // Search filter
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { admissionNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).populate('activeFeeStructures', 'name amount');
    const allFees = await StudentFee.find({ schoolId: req.user.schoolId });
    
    // Convert to plain objects so we can inject custom ML properties
    const enhancedStudents = students.map(st => {
       const stdObj = st.toObject();
       stdObj.riskProfile = 'LOW';
       
       const ledgers = allFees.filter(f => f.studentId.toString() === st._id.toString());
       if (ledgers.length > 0) {
          const totalFee = stdObj.activeFeeStructures?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
          const totalPaid = ledgers.reduce((sum, f) => sum + (f.totalPaid || 0), 0);
          
          let overdueCount = 0;
          ledgers.forEach(ledger => {
            ledger.installments.forEach(inst => {
                if (inst.status === 'OVERDUE') overdueCount++;
            });
          });

          // Defaulter Prediction Logic Engine
          if (overdueCount >= 2) {
              stdObj.riskProfile = 'CRITICAL';
          } else if (overdueCount === 1 || (totalFee > 0 && (totalPaid / totalFee) < 0.25)) {
              stdObj.riskProfile = 'HIGH_RISK';
          }
       }
       return stdObj;
    });

    res.status(200).json({ success: true, count: enhancedStudents.length, data: enhancedStudents });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add new student
// @route   POST /api/v1/students
exports.addStudent = async (req, res) => {
  try {
    req.body.schoolId = req.user.schoolId;

    // Auto-generate admission number if not provided
    if (!req.body.admissionNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
      req.body.admissionNumber = `ADM-${year}-${random}`;
    }

    // Ensure parentDetails is structured correctly
    if (req.body.parentName || req.body.parentPhone) {
      req.body.parentDetails = {
        name: req.body.parentName,
        phone: req.body.parentPhone
      };
    }

    const targetFeeId = req.body.activeFeeStructure || req.body.feeStructureId || req.body.activeFeeStructures;
    if (targetFeeId) {
      req.body.activeFeeStructures = Array.isArray(targetFeeId) ? targetFeeId : [targetFeeId];
    }

    const student = await Student.create(req.body);

    // AUTO-LINK FEE (New Requirement 4.2)
    await autoLinkStudentToFee(student._id, req.user.schoolId);

    // Audit Log
    await logAction({
      schoolId: req.user.schoolId,
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      action: ACTIONS.STUDENT_CREATED,
      resource: 'Student',
      details: `Added new student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/v1/students/:id
exports.updateStudent = async (req, res) => {
  console.log('TRACE: Received update request for student:', req.params.id);
  console.log('TRACE: Request Body:', JSON.stringify(req.body, null, 2));
  try {
    let student = await Student.findById(req.params.id);

    if (!student || student.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const targetFeeId = req.body.activeFeeStructure || req.body.feeStructureId || req.body.activeFeeStructures;
    
    // Atomic update to bypass any instance-level blocks
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      currentClass: req.body.currentClass,
      category: req.body.category || student.category,
      parentDetails: req.body.parentDetails || (req.body.parentName ? {
        name: req.body.parentName,
        phone: req.body.parentPhone || ''
      } : student.parentDetails),
      activeFeeStructures: (targetFeeId && targetFeeId !== '') 
        ? (Array.isArray(targetFeeId) ? targetFeeId : [targetFeeId]) 
        : student.activeFeeStructures,
      status: req.body.status || student.status
    };

    console.log(`[Atomic] Updating Student ${student._id} with Plan: ${updateData.activeFeeStructure}`);

    student = await Student.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log(`[Atomic] Update Confirmed. Plan in DB: ${student.activeFeeStructure}`);

    // RE-SYNC FEE (If Class or Category changed)
    if (req.body.currentClass || req.body.category) {
       await autoLinkStudentToFee(student._id, req.user.schoolId);
    }

    // Audit Log
    await logAction({
      schoolId: req.user.schoolId,
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      action: ACTIONS.STUDENT_UPDATED,
      resource: 'Student',
      details: `Updated details for student: ${student.firstName} ${student.lastName} (${student.admissionNumber})`
    });

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || student.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const studentDetails = `${student.firstName} ${student.lastName} (${student.admissionNumber})`;
    await student.deleteOne();

    // Audit Log
    await logAction({
      schoolId: req.user.schoolId,
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      action: ACTIONS.STUDENT_DELETED,
      resource: 'Student',
      details: `Permanently deleted student: ${studentDetails}`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// @desc    Get students linked to a parent user
// @route   GET /api/v1/students/my-children
exports.getMyChildren = async (req, res) => {
    try {
      // Find students using plural field populate
      const students = await Student.find({ 
        schoolId: req.user.schoolId,
        'parentDetails.email': req.user.email 
      }).populate('activeFeeStructures');

      const studentFees = await StudentFee.find({
        schoolId: req.user.schoolId,
        studentId: { $in: students.map(s => s._id) }
      });

      const payments = await Payment.find({
        schoolId: req.user.schoolId,
        studentId: { $in: students.map(s => s._id) }
      }).sort('-datePaid').limit(5);

      const enhancedStudents = students.map(st => {
        const stdObj = st.toObject();
        
        // Find all fee records for this child
        const myLedgers = studentFees.filter(f => f.studentId.toString() === st._id.toString());
        
        // Sum up totals across all plans for the parent view
        stdObj.totalPaid = myLedgers.reduce((sum, f) => sum + (f.totalPaid || 0), 0);
        
        // Combine all installments from all plans
        stdObj.installments = [];
        myLedgers.forEach(ledger => {
           if (ledger.installments) {
             stdObj.installments.push(...ledger.installments);
           }
        });

        // Backward compatibility for frontend
        stdObj.activeFeeStructure = stdObj.activeFeeStructures?.[0] || null;
        
        stdObj.recentPayments = payments.filter(p => p.studentId.toString() === st._id.toString());
        return stdObj;
      });
  
      res.status(200).json({
        success: true,
        count: enhancedStudents.length,
        data: enhancedStudents
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

// @desc    Bulk Import Students
// @route   POST /api/v1/students/bulk
exports.bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of students' });
    }

    // Secure all inbound students to the current tenant bounds
    const secureStudents = students.map(student => ({
      ...student,
      schoolId: req.user.schoolId,
      status: student.status || 'INQUIRY', // Default bulk drops to Inquiry
      walletBalance: 0
    }));

    const imported = await Student.insertMany(secureStudents, { ordered: false });

    // Audit Log for Massive Ingestion
    await logAction({
      schoolId: req.user.schoolId,
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      action: ACTIONS.STUDENT_CREATED,
      resource: 'Student',
      details: `Bulk imported ${imported.length} students`
    });

    // Auto-link all imported students
    for (const s of imported) {
      await autoLinkStudentToFee(s._id, req.user.schoolId);
    }

    res.status(201).json({ 
      success: true, 
      count: imported.length, 
      message: `Successfully imported ${imported.length} students and linked fee plans.` 
    });
  } catch (error) {
    // MongoDB duplicate keys throw specific codes, handle gracefully
    res.status(400).json({ success: false, message: error.message });
  }
};
