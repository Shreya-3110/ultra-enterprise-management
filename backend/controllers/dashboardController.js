const Payment = require('../models/Payment');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const mongoose = require('mongoose');
const { analyzeRiskProfiles, generateCashFlowForecast } = require('../utils/aiPredictor');

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    if (!req.user || !req.user.schoolId) {
      return res.status(401).json({ success: false, message: 'User identity or School ID missing' });
    }

    const schoolId = new mongoose.Types.ObjectId(req.user.schoolId);

    const totalPayments = await Payment.aggregate([
      { $match: { schoolId } },
      { $group: { _id: null, total: { $sum: "$amountPaid" }, lateFees: { $sum: "$lateFeePaid" } } }
    ]);

    const totalWallet = await Student.aggregate([
      { $match: { schoolId } },
      { $group: { _id: null, total: { $sum: "$walletBalance" } } }
    ]);

    const feeStructures = await FeeStructure.find({ schoolId });
    let outstandingDues = 0;
    
    feeStructures.forEach(fee => {
      fee.installments.forEach(inst => {
        if (inst.status === 'PENDING' || inst.status === 'OVERDUE') {
          outstandingDues += inst.amount;
          if (inst.status === 'OVERDUE') {
            outstandingDues += (fee.lateFee || 0);
          }
        }
      });
    });

    const studentCount = await Student.countDocuments({ schoolId });

    res.status(200).json({
      success: true,
      data: {
        totalCollection: totalPayments[0]?.total || 0,
        lateFeesRecovered: totalPayments[0]?.lateFees || 0,
        walletCredits: totalWallet[0]?.total || 0,
        outstandingDues,
        studentCount,
        collectionRate: (totalPayments[0]?.total || 0) + outstandingDues > 0
          ? Math.round(((totalPayments[0]?.total || 0) / ((totalPayments[0]?.total || 0) + outstandingDues)) * 100)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed financial reporting data for charts
// @route   GET /api/v1/dashboard/reports
exports.getFinancialReports = async (req, res) => {
  try {
    const schoolId = new mongoose.Types.ObjectId(req.user.schoolId);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Payment.aggregate([
      { $match: { schoolId, datePaid: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$datePaid" } }, revenue: { $sum: "$amountPaid" } } },
      { $sort: { "_id": 1 } }
    ]);

    const revenueLabels = monthlyRevenue.map(item => item._id);
    const revenueData = monthlyRevenue.map(item => item.revenue);

    let totalPending = 0, totalOverdue = 0, totalPaid = 0;
    const StudentFee = mongoose.models.StudentFee || mongoose.model('StudentFee');
    const studentFees = await StudentFee.find({ schoolId });
    
    studentFees.forEach(sf => {
       sf.installments.forEach(inst => {
          if (inst.status === 'PAID') totalPaid += inst.amount;
          else if (inst.status === 'PENDING') totalPending += inst.amount;
          else if (inst.status === 'OVERDUE') totalOverdue += inst.amount;
          else if (inst.status === 'PARTIAL') {
             totalPaid += inst.paidAmount;
             totalPending += (inst.amount - inst.paidAmount);
          }
       });
    });

    res.status(200).json({
      success: true,
      charts: {
        revenue: {
           labels: revenueLabels.length > 0 ? revenueLabels : [new Date().toISOString().slice(0,7)],
           data: revenueData.length > 0 ? revenueData : [0]
        },
        collectionStatus: {
           labels: ['Paid', 'Pending', 'Overdue'],
           data: [totalPaid, totalPending, totalOverdue]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get raw collection ledger
// @route   GET /api/v1/dashboard/ledger
exports.getCollectionLedger = async (req, res) => {
  try {
    const { startDate, endDate, category, class: studentClass } = req.query;
    const schoolId = new mongoose.Types.ObjectId(req.user.schoolId);
    let query = { schoolId };

    if (startDate || endDate) {
      query.datePaid = {};
      if (startDate) query.datePaid.$gte = new Date(startDate);
      if (endDate) query.datePaid.$lte = new Date(endDate);
    }

    if (category || studentClass) {
        let studentQuery = { schoolId };
        if (category) studentQuery.category = category;
        if (studentClass) studentQuery.currentClass = studentClass;
        const students = await Student.find(studentQuery).select('_id');
        query.studentId = { $in: students.map(s => s._id) };
    }

    const ledger = await Payment.find(query)
      .populate('studentId', 'firstName lastName admissionNumber currentClass category')
      .populate('feeStructureId', 'name')
      .sort('-datePaid');

    const summary = ledger.reduce((acc, curr) => {
        acc.totalCollected += (curr.amountPaid || 0);
        acc.totalLateFees += (curr.lateFeePaid || 0);
        return acc;
    }, { totalCollected: 0, totalLateFees: 0 });

    res.status(200).json({ success: true, count: ledger.length, summary, data: ledger });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI-driven predictions and forecasts
// @route   GET /api/v1/dashboard/ai-predictions
exports.getAiPredictions = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const riskProfiles = await analyzeRiskProfiles(schoolId);
        const forecast = await generateCashFlowForecast(schoolId);
        
        res.status(200).json({
            success: true,
            data: {
                riskProfiles: riskProfiles.slice(0, 5),
                forecast,
                defaulterAlerts: riskProfiles.filter(r => r.riskScore > 75)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
