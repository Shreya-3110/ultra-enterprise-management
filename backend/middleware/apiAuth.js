const School = require('../models/School');

// Middleware to authenticate external API requests using a school's API key
exports.apiAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        
        if (!apiKey) {
            return res.status(401).json({ success: false, message: 'API Key is missing. Use X-API-KEY header.' });
        }

        // Find school that owns this key
        const school = await School.findOne({ 'apiKeys.key': apiKey });
        
        if (!school) {
            return res.status(401).json({ success: false, message: 'Invalid API Key' });
        }

        // Update lastUsed timestamp
        await School.updateOne(
            { _id: school._id, 'apiKeys.key': apiKey },
            { $set: { 'apiKeys.$.lastUsed': Date.now() } }
        );

        // Attach school to request
        req.school = school;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
