const Notification = require('../models/Notification');

// @desc    Get all notifications for the school
// @route   GET /api/v1/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ schoolId: req.user.schoolId })
      .populate('studentId', 'firstName lastName admissionNumber')
      .sort({ sentAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
