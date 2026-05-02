const User = require('../models/User');
const School = require('../models/School');
const jwt = require('jsonwebtoken');
const { createTransporter, sendWelcomeEmail } = require('../utils/notificationService');
const nodemailer = require('nodemailer'); // Keep for getTestMessageUrl if fallbacks happen

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new school and its admin user
// @route   POST /api/v1/auth/register-school
exports.registerSchool = async (req, res) => {
  try {
    const { schoolName, adminName, email, password, plan } = req.body;

    // Create school
    const school = await School.create({
      name: schoolName,
      subscriptionPlan: plan || 'BASIC'
    });

    // Create admin user
    const user = await User.create({
      name: adminName,
      email,
      password,
      role: 'ADMIN',
      schoolId: school._id
    });

    const token = generateToken(user._id);

    // Send welcome email asynchronously
    sendWelcomeEmail(school._id, user.email, user.name, user.role, school.name);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Register a regular user (Parent/Staff) to an existing school
// @route   POST /api/v1/auth/register-user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, schoolId } = req.body;

    // Ensure user doesn't already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'PARENT',
      schoolId
    });

    const token = generateToken(user._id);

    // Fetch school name for the email
    const school = await School.findById(schoolId);
    // Send welcome email asynchronously
    if (school) {
      sendWelcomeEmail(schoolId, user.email, user.name, user.role, school.name);
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('schoolId', 'subscriptionPlan');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // SKIP 2FA: Return token and user data immediately for demo/simplicity
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId._id,
        plan: user.schoolId.subscriptionPlan,
        hasCompletedTour: user.hasCompletedTour
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Verify 2FA and Login
// @route   POST /api/v1/auth/verify-2fa
exports.verifyTwoFactor = async (req, res) => {
   try {
    const { email, otpCode } = req.body;
    
    // MASTER BYPASS: Allow 999999 for demo purposes
    const isMasterCode = otpCode === '999999';
    
    const user = await User.findOne({ email }).populate('schoolId', 'subscriptionPlan');

    if (!user) {
       return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isValidCode = user.otpCode === otpCode && user.otpExpires > Date.now();

    if (!isMasterCode && !isValidCode) {
       return res.status(401).json({ success: false, message: 'Invalid or expired 2FA code.' });
    }

      // Secure and Wipe Code
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();

      const token = generateToken(user._id);

      res.status(200).json({
         success: true,
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId._id,
            plan: user.schoolId.subscriptionPlan,
            hasCompletedTour: user.hasCompletedTour
         }
      });
   } catch (error) {
      res.status(500).json({ success: false, message: 'Server error during 2FA verification.' });
   }
};

// @desc    Upgrade subscription plan
// @route   POST /api/v1/auth/upgrade
exports.upgradePlan = async (req, res) => {
  try {
    const { newPlan } = req.body;
    
    // Update the school's plan directly
    const school = await School.findById(req.user.schoolId);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    
    school.subscriptionPlan = newPlan || 'PREMIUM';
    await school.save();

    // Log the upgrade action
    const { logAction } = require('../utils/auditLogger');
    await logAction({
       schoolId: req.user.schoolId,
       user: { id: req.user.id, name: req.user.name, role: req.user.role },
       action: 'SUBSCRIPTION_UPGRADED',
       resource: 'School',
       details: `Upgraded SaaS subscription to ${school.subscriptionPlan}`
    });

    res.status(200).json({
       success: true,
       message: `Successfully upgraded to ${school.subscriptionPlan} Plan!`,
       newPlan: school.subscriptionPlan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tour completion status
// @route   POST /api/v1/auth/tour-complete
exports.updateTourStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.hasCompletedTour = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Tour status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
