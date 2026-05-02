const nodemailer = require('nodemailer');

// Mock SMTP Transporter (Uses Ethereal for testing or real SMTP if configured)
const createTransporter = async () => {
  // If real SMTP credentials are provided in .env, use them
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT) || 587;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: port,
      secure: port === 465, // true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal for development/testing
  let testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

exports.createTransporter = createTransporter;

const Notification = require('../models/Notification');
const MessageTemplate = require('../models/MessageTemplate');

/**
 * Helper to parse templates with placeholders
 */
const parseTemplate = (text, data) => {
  let result = text;
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, data[key]);
  });
  return result;
};

/**
 * Sends a payment reminder email
 */
exports.sendEmailReminder = async (schoolId, studentId, recipient, studentName, feeName, dueDate, amount, isOverdue = false) => {
  try {
    const transporter = await createTransporter();
    
    // Check for custom template
    const template = await MessageTemplate.findOne({ schoolId, category: 'DUE_REMINDER', type: 'EMAIL', isActive: true });
    
    let subject = isOverdue 
      ? `⚠️ OVERDUE ALERT: ${feeName} for ${studentName}`
      : `Payment Reminder: ${feeName} for ${studentName}`;
      
    let text = isOverdue
      ? `Dear Parent, This is an urgent notice that an installment of ₹${amount} for ${feeName} was due on ${dueDate.toDateString()} and is now OVERDUE. Please clear this balance immediately to avoid further late fees.`
      : `Dear Parent, This is a reminder that an installment of ₹${amount} for ${feeName} is due on ${dueDate.toDateString()}.`;
    
    if (template) {
        const data = { STUDENT_NAME: studentName, FEE_NAME: feeName, DUE_DATE: dueDate.toDateString(), AMOUNT: amount, STATUS: isOverdue ? 'OVERDUE' : 'DUE' };
        if (template.subject) subject = parseTemplate(template.subject, data);
        text = parseTemplate(template.body, data);
    }

    const mailOptions = {
      from: '"Ultra Enterprise Billing" <billing@ultra.edu>',
      to: recipient,
      subject,
      text,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid ${isOverdue ? '#ef4444' : '#eee'}; border-radius: 10px;">
          <h2 style="color: ${isOverdue ? '#ef4444' : '#3b82f6'};">${isOverdue ? 'Overdue Payment Notice' : 'Payment Reminder'}</h2>
          <p>${text.replace(/\n/g, '<br>')}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 5px 0;"><b>Student:</b> ${studentName}</p>
              <p style="margin: 5px 0;"><b>Fee Component:</b> ${feeName}</p>
              <p style="margin: 5px 0;"><b>Amount:</b> ₹${amount}</p>
              <p style="margin: 5px 0;"><b>Due Date:</b> ${dueDate.toDateString()}</p>
          </div>
          <p style="font-size: 12px; color: #64748b;">Please login to the portal to make a payment.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log to DB
    await Notification.create({
      schoolId,
      studentId,
      type: 'EMAIL',
      category: isOverdue ? 'OVERDUE_ALERT' : 'FEE_DUE',
      recipient,
      subject: mailOptions.subject,
      message: mailOptions.text,
      status: 'SENT'
    });

    console.log(`[Email] ${isOverdue ? 'Overdue' : 'Reminder'} sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Error]', error);
    return false;
  }
};

/**
 * Sends a payment confirmation alert
 */
exports.sendPaymentConfirmation = async (schoolId, studentId, recipient, studentName, amount, transactionId) => {
    try {
      const transporter = await createTransporter();
      const subject = `Payment Successful: ₹${amount} [${transactionId}]`;
      const text = `Dear Parent, we have successfully received your payment of ₹${amount} for ${studentName}. Reference ID: ${transactionId}.`;
      
      const mailOptions = {
        from: '"Ultra Enterprise Records" <records@ultra.edu>',
        to: recipient,
        subject,
        text,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">Receipt Confirmation</h2>
            <p>Dear Parent,</p>
            <p>We have successfully recorded your payment for <b>${studentName}</b>.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0;"><b>Amount Paid:</b> ₹${amount}</p>
                <p style="margin: 5px 0;"><b>Transaction ID:</b> ${transactionId}</p>
                <p style="margin: 5px 0;"><b>Date:</b> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>A detailed receipt has been generated in your portal.</p>
            <p style="font-size: 12px; color: #64748b;">Ultra Enterprise Management System</p>
          </div>
        `
      };
  
      await transporter.sendMail(mailOptions);
      
      // Log to DB
      await Notification.create({
        schoolId,
        studentId,
        type: 'EMAIL',
        category: 'PAYMENT_CONFIRMATION',
        recipient,
        subject,
        message: text,
        status: 'SENT'
      });
  
      return true;
    } catch (error) {
      console.error('[Confirmation Error]', error);
      return false;
    }
  };

/**
 * Live WhatsApp / SMS Reminder (Twilio Integration)
 */
exports.sendWhatsAppReminder = async (schoolId, studentId, phone, studentName, amount, dueDate, isOverdue = false) => {
  try {
    const message = isOverdue 
      ? `⚠️ OVERDUE ALERT: Dear parent, the fee for ${studentName} (₹${amount}) was due on ${dueDate.toDateString()}. Please clear this immediately.`
      : `📢 REMINDER: Dear parent, the fee installment for ${studentName} (₹${amount}) is due on ${dueDate.toDateString()}. Thank you!`;

    // 1. Log to DB always
    await Notification.create({
      schoolId,
      studentId,
      type: 'WHATSAPP',
      category: 'FEE_DUE',
      recipient: phone,
      message,
      status: 'SENT'
    });

    // 2. Attempt Real Delivery if Twilio keys exist
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        let formattedPhone = phone.trim();
        if (!formattedPhone.startsWith('+')) {
            if (formattedPhone.startsWith('91') && formattedPhone.length > 10) {
                formattedPhone = '+' + formattedPhone;
            } else {
                formattedPhone = '+91' + formattedPhone;
            }
        }
        
        await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
            body: message,
            to: `whatsapp:${formattedPhone}`
        });
        
        console.log(`[Twilio LIVE] WhatsApp sent to ${phone}`);
    } else {
        console.log(`[WhatsApp API Mock] TO: ${phone} | MSG: ${message}`);
    }
    
    return true;
  } catch (error) {
    console.error('[WhatsApp Error]', error);
    // Even if physical delivery fails, we logged the attempt in the Hub
    return false;
  }
};

/**
 * Sends a welcome email upon registration
 */
exports.sendWelcomeEmail = async (schoolId, recipient, name, role, schoolName = 'Ultra Enterprise') => {
  try {
    const transporter = await createTransporter();
    
    const isSchool = role === 'ADMIN';
    const subject = isSchool ? `Welcome to Ultra Enterprise Management, ${name}!` : `Welcome to ${schoolName} Portal!`;
    const roleText = isSchool ? 'School Administrator' : 'Parent';
    
    const text = isSchool 
      ? `Dear ${name},\n\nWelcome to Ultra Enterprise Management! We are thrilled to have your school onboard. Your admin account is now active and ready to use.\n\nBest regards,\nThe Ultra Team`
      : `Dear ${name},\n\nWelcome! Your ${roleText} account has been successfully registered. You can now log in to view your dashboard, check fee ledgers, and receive important updates.\n\nBest regards,\nUltra Enterprise Management`;

    const mailOptions = {
      from: '"Ultra Enterprise" <welcome@ultra.edu>',
      to: recipient,
      subject,
      text,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6;">Welcome to Ultra Enterprise</h2>
          <p>Dear <b>${name}</b>,</p>
          <p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>
          <p style="font-size: 12px; color: #64748b; margin-top: 20px;">Automated message from Ultra Enterprise Management</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    // Log to DB
    await Notification.create({
      schoolId,
      studentId: null,
      type: 'EMAIL',
      category: 'WELCOME',
      recipient,
      subject: mailOptions.subject,
      message: mailOptions.text,
      status: 'SENT'
    });

    console.log(`[Email] Welcome sent to ${recipient}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Error - Welcome]', error);
    return false;
  }
};
