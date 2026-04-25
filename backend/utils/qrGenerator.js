const QRCode = require('qrcode');

/**
 * Generates a dynamic UPI QR Code
 * @param {string} upiId - Merchant VPA (e.g. school@axisbank)
 * @param {string} name - Merchant Name
 * @param {number} amount - Amount in INR
 * @param {string} note - Transaction Note/Reference
 * @returns {Promise<{qrDataURI: string, upiString: string}>}
 */
const generateUPIQR = async (upiId, name, amount, note = 'School Fee Payment') => {
  try {
    if (!upiId) throw new Error('UPI ID is required');

    // Standard UPI Deep Link Format
    // upi://pay?pa=<vpa>&pn=<name>&am=<amount>&tn=<note>&cu=INR
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&tn=${encodeURIComponent(note)}&cu=INR`;

    // Generate Base64 QR Code
    const qrDataURI = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    return {
      qrDataURI,
      upiString
    };
  } catch (err) {
    console.error('[QR Generator Error]', err.message);
    throw err;
  }
};

module.exports = { generateUPIQR };
