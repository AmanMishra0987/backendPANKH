import express from 'express';
import transporter from '../config/nodemailer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { fullName, email, contactNumber, guestName, topic, whyMatters, bioLink } = req.body;

    // Validate required fields
    if (!fullName || !email || !contactNumber || !guestName || !topic || !whyMatters) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Email to organization
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.PODCAST_EMAIL || process.env.GMAIL_USER,
      replyTo: email,
      subject: `Podcast Guest Suggestion: ${guestName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF8C00;">New Podcast Guest Suggestion</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Submitter Information</h3>
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contact Number:</strong> ${contactNumber}</p>
            
            <h3 style="color: #333; margin-top: 20px;">Guest Information</h3>
            <p><strong>Guest Name:</strong> ${guestName}</p>
            <p><strong>Topic or Story Idea:</strong> ${topic}</p>
            <p><strong>Why this story matters:</strong></p>
            <p style="white-space: pre-wrap;">${whyMatters}</p>
            ${bioLink ? `<p><strong>Bio/Link:</strong> <a href="${bioLink}" target="_blank">${bioLink}</a></p>` : ''}
          </div>
          <p style="color: #666; font-size: 12px;">This email was sent from the Pankho Ki Udaan Podcast guest suggestion form.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Confirmation email to user
    const confirmationMailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Podcast Guest Suggestion Received - Pankho Ki Udaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF8C00;">Thank You for Your Suggestion!</h2>
          <p>Dear ${fullName},</p>
          <p>We have received your podcast guest suggestion for <strong>${guestName}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Topic:</strong> ${topic}</p>
            <p><strong>Why this story matters:</strong></p>
            <p style="white-space: pre-wrap;">${whyMatters}</p>
          </div>
          <p>Our team will review your suggestion and get back to you soon. We appreciate your interest in contributing to our podcast!</p>
          <p>Best regards,<br>Pankho Ki Udaan Podcast Team</p>
        </div>
      `,
    };

    await transporter.sendMail(confirmationMailOptions);

    res.json({
      success: true,
      message: 'Your suggestion has been received successfully!',
    });
  } catch (error) {
    console.error('Error sending podcast guest email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit suggestion. Please try again later.',
    });
  }
});

export default router;

