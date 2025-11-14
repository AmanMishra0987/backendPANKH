import express from 'express';
import transporter from '../config/nodemailer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { fullName, age, contactNumber, email, supportType, message } = req.body;

    // Validate required fields
    if (!fullName || !age || !contactNumber || !email || !supportType || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Email to organization
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.DISABILITY_INCLUSION_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `Disability Inclusion Support Request: ${supportType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #009966;">New Disability Inclusion Support Request</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Age:</strong> ${age}</p>
            <p><strong>Contact Number:</strong> ${contactNumber}</p>
            <p><strong>Email:</strong> ${email}</p>
            
            <h3 style="color: #333; margin-top: 20px;">Support Request</h3>
            <p><strong>Type of Support Needed:</strong> ${supportType.charAt(0).toUpperCase() + supportType.slice(1)}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">This email was sent from the Pankho Ki Udaan Disability Inclusion support form.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Confirmation email to user
    const confirmationMailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Support Request Received - Pankho Ki Udaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #009966;">Thank You for Reaching Out!</h2>
          <p>Dear ${fullName},</p>
          <p>We have received your support request for <strong>${supportType}</strong>. Our Udaan Inclusion Team will review your request and reach out to you soon.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>We are here to help and support you. Please don't hesitate to contact us if you have any questions.</p>
          <p>Best regards,<br>Pankho Ki Udaan Inclusion Team</p>
        </div>
      `,
    };

    await transporter.sendMail(confirmationMailOptions);

    res.json({
      success: true,
      message: 'Your support request has been received successfully!',
    });
  } catch (error) {
    console.error('Error sending disability inclusion email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit request. Please try again later.',
    });
  }
});

export default router;

