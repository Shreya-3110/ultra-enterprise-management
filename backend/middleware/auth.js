const jwt = require('jsonwebtoken');
const User = require('../models/User');
const School = require('../models/School');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No user found with this id' });
    }

    // Branch Context Switching for Head Office Users
    const requestedBranchId = req.headers['x-branch-id'];
    if (requestedBranchId && req.user.isHeadOffice) {
      if (requestedBranchId !== req.user.schoolId.toString()) {
        const branch = await School.findById(requestedBranchId);
        // Only allow switching if the requested branch's parent is this Head Office
        if (branch && branch.parentSchoolId && branch.parentSchoolId.toString() === req.user.schoolId.toString()) {
          req.user.schoolId = requestedBranchId; // Scope all subsequent DB queries to this branch
        }
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Subscription Plan Guard
exports.checkPlan = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      const school = await School.findById(req.user.schoolId);
      
      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School record not found. Please contact support.'
        });
      }
      
      const plans = ['BASIC', 'STANDARD', 'PREMIUM'];
      const schoolPlanIndex = plans.indexOf(school.subscriptionPlan || 'BASIC');
      const requiredPlanIndex = plans.indexOf(requiredPlan);

      if (schoolPlanIndex < requiredPlanIndex) {
        return res.status(403).json({
          success: false,
          message: `This feature requires a ${requiredPlan} subscription plan. Your current plan is ${school.subscriptionPlan || 'BASIC'}.`
        });
      }
      next();
    } catch (error) {
      console.error('[checkPlan Middleware Error]:', error);
      res.status(500).json({ success: false, message: 'Subscription check failed' });
    }
  };
};
