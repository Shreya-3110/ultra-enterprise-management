const mongoose = require('mongoose');
const Student = require('../models/Student');

/**
 * Validates a batch of student records without saving them
 * Useful for the "Sandbox Testing" requirement.
 */
exports.simulateMigration = async (schoolId, rawData) => {
    const report = {
        total: rawData.length,
        valid: 0,
        invalid: 0,
        duplicates: 0,
        errors: [],
        readyToImport: []
    };

    const existingStudents = await Student.find({ schoolId }).select('admissionNumber');
    const existingAdmNumbers = new Set(existingStudents.map(s => s.admissionNumber));

    for (const [index, row] of rawData.entries()) {
        const rowNum = index + 1;
        const studentData = {
            firstName: row.firstName || row['First Name'] || row['Name'],
            lastName: row.lastName || row['Last Name'] || '',
            admissionNumber: row.admissionNumber || row['Admission No'] || row['ID'],
            currentClass: row.currentClass || row['Class'] || row['Grade'],
            category: row.category || 'GENERAL',
            parentDetails: {
                fatherName: row.fatherName || row['Father Name'] || '',
                email: row.parentEmail || row['Email'] || ''
            },
            schoolId
        };

        // Validation Logic
        if (!studentData.firstName || !studentData.currentClass) {
            report.invalid++;
            report.errors.push({ rowNum, message: 'Missing First Name or Class' });
            continue;
        }

        if (existingAdmNumbers.has(studentData.admissionNumber)) {
            report.duplicates++;
            report.errors.push({ rowNum, message: `Duplicate Admission Number: ${studentData.admissionNumber}` });
            continue;
        }

        // Check if already in the current batch to prevent intra-file duplicates
        if (report.readyToImport.find(s => s.admissionNumber === studentData.admissionNumber)) {
            report.duplicates++;
            report.errors.push({ rowNum, message: `Intra-file Duplicate: ${studentData.admissionNumber}` });
            continue;
        }

        report.valid++;
        report.readyToImport.push(studentData);
    }

    return report;
};

/**
 * Commits the validated staging data to the database
 */
exports.commitMigration = async (data) => {
    return await Student.insertMany(data, { ordered: false });
};
