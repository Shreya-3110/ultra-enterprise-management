const mongoose = require('mongoose');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');

/**
 * Calculates Risk Score and Defaulter Probability for all students
 */
exports.analyzeRiskProfiles = async (schoolId) => {
    const students = await StudentFee.find({ schoolId }).populate('studentId');
    
    return students.map(sf => {
        let riskValue = 0;
        let reasons = [];

        const overdueCount = sf.installments.filter(i => i.status === 'OVERDUE').length;
        const totalInstallments = sf.installments.length;

        // 1. Calculate Overdue Weight (Heavy)
        if (overdueCount > 0) {
            riskValue += (overdueCount / totalInstallments) * 60;
            reasons.push(`${overdueCount} installment(s) currently overdue`);
        }

        // 2. Partial Payment Weight
        const partialCount = sf.installments.filter(i => i.status === 'PARTIAL').length;
        if (partialCount > 0) {
            riskValue += 10;
            reasons.push('History of staggered/partial payments');
        }

        // 3. Balance vs Total Ratio
        const totalDue = sf.totalAmount;
        const paid = sf.totalPaid;
        const debtRatio = (totalDue - paid) / totalDue;
        if (debtRatio > 0.5) {
            riskValue += 20;
            reasons.push('Significant outstanding debt (>50%)');
        }

        // Final Clamping
        riskValue = Math.min(100, Math.round(riskValue));

        let status = 'Low';
        if (riskValue > 70) status = 'High';
        else if (riskValue > 30) status = 'Medium';

        return {
            studentId: sf.studentId?._id,
            name: `${sf.studentId?.firstName} ${sf.studentId?.lastName}`,
            admissionNumber: sf.studentId?.admissionNumber,
            class: sf.studentId?.currentClass,
            riskScore: riskValue,
            riskStatus: status,
            reasons
        };
    }).sort((a,b) => b.riskScore - a.riskScore);
};

/**
 * Generates a 6-month Revenue Forecast
 */
exports.generateCashFlowForecast = async (schoolId) => {
    const studentFees = await StudentFee.find({ schoolId });
    const now = new Date();
    
    // We want to forecast the next 6 months
    const forecast = [];
    for (let i = 0; i < 6; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthLabel = targetDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        let projectedIncome = 0;
        
        studentFees.forEach(sf => {
            sf.installments.forEach(inst => {
                const instDate = new Date(inst.dueDate);
                if (inst.status !== 'PAID' && 
                    instDate.getMonth() === targetDate.getMonth() && 
                    instDate.getFullYear() === targetDate.getFullYear()) {
                    projectedIncome += inst.amount;
                }
            });
        });
        
        forecast.push({ 
            month: monthLabel, 
            projected: projectedIncome,
            probability: 85 // Static confidence score for now
        });
    }
    
    return forecast;
};
