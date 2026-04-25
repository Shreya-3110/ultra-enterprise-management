const User = require('../models/User');
const School = require('../models/School');
const jwt = require('jsonwebtoken');
const { createTransporter } = require('../utils/notificationService');
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

    // Generate 6 Digit OTP Code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send Email (Either Mock Ethereal or Live SMTP)
    try {
       const transporter = await createTransporter();
       const info = await transporter.sendMail({
          from: '"Ultra Enterprise Security" <security@ultraenterprise.com>',
          to: user.email,
          subject: "Your Two-Factor Authentication Code",
          text: `Your requested login code is: ${otpCode}. Valid for 10 minutes.`,
          html: `<h1>Ultra Enterprise Security</h1><p>Your requested login code is: <b>${otpCode}</b>.</p><p>Valid for 10 minutes.</p>`
       });
       
       console.log('\n\x1b[36m%s\x1b[0m', '🛡️ [2FA SECURITY TRIGGERED]');
       console.log('2FA Code       :', otpCode);
       if (info.messageId && nodemailer.getTestMessageUrl(info)) {
           console.log('Email Preview URL:', nodemailer.getTestMessageUrl(info), '\n');
       }
    } catch(err) {
       console.error("Failed to trigger email", err);
       console.log(`[FALLBACK CODE]: ${otpCode}`);
    }

    // Return the requirement flag without giving out the actual JWT
    res.status(200).json({
      success: true,
      requires2FA: true,
      email: user.email,
      message: '2FA token generated and sent to email'
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
      
      const user = await User.findOne({ 
         email, 
         otpCode,
         otpExpires: { $gt: Date.now() } 
      }).populate('schoolId', 'subscriptionPlan');

      if (!user) {
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
            plan: user.schoolId.subscriptionPlan
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
