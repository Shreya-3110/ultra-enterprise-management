const School = require('../models/School');

/**
 * Middleware to check if the school has the required subscription plan
 * @param {string[]} requiredPlans - Array of plans that have access (e.g. ['STANDARD', 'PREMIUM'])
 */
exports.checkPlan = (requiredPlans) => {
  return async (req, res, next) => {
    try {
      // Find the school associated with the user
      const school = await School.findById(req.user.schoolId);

      if (!school) {
        return res.status(404).json({ success: false, message: 'School not found' });
      }

      if (!requiredPlans.includes(school.subscriptionPlan)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This feature requires a ${requiredPlans.join(' or ')} plan. Current plan: ${school.subscriptionPlan}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error during plan validation' });
    }
  };
};
