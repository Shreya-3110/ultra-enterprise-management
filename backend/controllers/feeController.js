const FeeStructure = require('../models/FeeStructure');
const { logAction, ACTIONS } = require('../utils/auditLogger');
const { generateInstallmentSchedule } = require('../utils/billingUtils');

// @desc    Get all fee structures
// @route   GET /api/v1/fees
// @access  Private
exports.getFees = async (req, res) => {
  try {
    const fees = await FeeStructure.find({ schoolId: req.user.schoolId });
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create fee structure
// @route   POST /api/v1/fees
// @access  Private
exports.createFee = async (req, res) => {
  try {
    req.body.schoolId = req.user.schoolId;
    
    // Ensure applicableClasses is an array if sent as comma-separated string
    if (typeof req.body.applicableClasses === 'string') {
      req.body.applicableClasses = req.body.applicableClasses
        .split(',')
        .map(c => c.trim())
        .filter(c => c !== '');
    }

    // Auto-calculate amount if feeHeads are provided
    if (req.body.feeHeads && Array.isArray(req.body.feeHeads)) {
      req.body.amount = req.body.feeHeads.reduce((sum, head) => sum + (Number(head.amount) || 0), 0);
    }

    // Auto-generate installments if requested
    if (req.body.autoGenerate) {
      const { frequency, amount, startDate } = req.body;
      if (!frequency || !amount) {
        return res.status(400).json({ 
          success: false, 
          message: 'Frequency and Amount are required for auto-generation' 
        });
      }
      req.body.installments = generateInstallmentSchedule(amount, frequency, startDate);
      console.log(`[Fee Engine] Automatically generated ${req.body.installments.length} installments`);
    }

    const fee = await FeeStructure.create(req.body);

    // Auto-link this new fee to any existing students that match the criteria
    const { autoLinkFeeToStudents } = require('../utils/feeAutoLinker');
    await autoLinkFeeToStudents(fee);

    // Audit Log
    await logAction({
      schoolId: req.user.schoolId,
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      action: ACTIONS.FEE_STRUCTURE_CREATED,
      resource: 'Fee Structure',
      details: `Created new fee structure: ${fee.name}`
    });

    res.status(201).json({ success: true, data: fee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete fee structure
// @route   DELETE /api/v1/fees/:id
exports.deleteFee = async (req, res) => {
  try {
    const fee = await FeeStructure.findById(req.params.id);

    if (!fee || fee.schoolId.toString() !== req.user.schoolId.toString()) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    const feeName = fee.name;
    await fee.deleteOne();

    // Audit Log
    await logAction({
      schoolId: req.user.schoolId,
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      action: ACTIONS.FEE_STRUCTURE_DELETED,
      resource: 'Fee Structure',
      details: `Deleted fee structure: ${feeName}`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
