import express from 'express';
import transporter from '../config/nodemailer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      age,
      dateOfBirth,
      gender,
      email,
      mobileNumber,
      college,
      department,
      participationType,
      topic,
      description,
      preferredLanguage,
      spokenBefore,
      whyParticipate,
      mediaConsent,
      declaration,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !age ||
      !gender ||
      !email ||
      !mobileNumber ||
      !college ||
      !participationType ||
      !preferredLanguage ||
      !spokenBefore ||
      !whyParticipate ||
      !mediaConsent ||
      !declaration
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Additional validation for speakers
    if (participationType === 'speaker' && (!topic || !description)) {
      return res.status(400).json({
        success: false,
        message: 'Topic and description are required for speakers',
      });
    }

    const preferredLanguageStr = Array.isArray(preferredLanguage)
      ? preferredLanguage.join(', ')
      : preferredLanguage;

    // Email to organization
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.UDAAN_TALK_EMAIL || process.env.GMAIL_USER,
      replyTo: email,
      subject: `Udaan Talk Registration: ${fullName} - ${participationType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066CC;">New Udaan Talk Registration</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Personal Information</h3>
            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Age:</strong> ${age}</p>
            ${dateOfBirth ? `<p><strong>Date of Birth:</strong> ${dateOfBirth}</p>` : ''}
            <p><strong>Gender:</strong> ${gender}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
            
            <h3 style="color: #333; margin-top: 20px;">Academic Information</h3>
            <p><strong>College/School/Organization:</strong> ${college}</p>
            ${department ? `<p><strong>Department/Course/Year:</strong> ${department}</p>` : ''}
            
            <h3 style="color: #333; margin-top: 20px;">Participation Details</h3>
            <p><strong>Participation Type:</strong> ${participationType.charAt(0).toUpperCase() + participationType.slice(1)}</p>
            ${participationType === 'speaker' ? `
              <p><strong>Topic/Title of Talk:</strong> ${topic}</p>
              <p><strong>Description:</strong></p>
              <p style="white-space: pre-wrap;">${description}</p>
            ` : ''}
            <p><strong>Preferred Language:</strong> ${preferredLanguageStr}</p>
            <p><strong>Have you spoken before?</strong> ${spokenBefore}</p>
            <p><strong>Why do you want to participate?</strong></p>
            <p style="white-space: pre-wrap;">${whyParticipate}</p>
            
            <h3 style="color: #333; margin-top: 20px;">Consents</h3>
            <p><strong>Media Consent:</strong> ${mediaConsent ? 'Yes' : 'No'}</p>
            <p><strong>Declaration:</strong> ${declaration ? 'Yes' : 'No'}</p>
          </div>
          <p style="color: #666; font-size: 12px;">This email was sent from the Pankho Ki Udaan Udaan Talk registration form.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Confirmation email to user
    const confirmationMailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Udaan Talk Registration Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066CC;">Registration Confirmed!</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for registering for Udaan Talk as a <strong>${participationType}</strong>!</p>
          <p>We have received your registration and will review it shortly. Our team will contact you soon with further details.</p>
          ${participationType === 'speaker' ? `
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Your Topic:</strong> ${topic}</p>
              <p><strong>Description:</strong></p>
              <p style="white-space: pre-wrap;">${description}</p>
            </div>
          ` : ''}
          <p>Best regards,<br>Pankho Ki Udaan Team</p>
        </div>
      `,
    };

    await transporter.sendMail(confirmationMailOptions);

    res.json({
      success: true,
      message: 'Your registration has been received successfully!',
    });
  } catch (error) {
    console.error('Error sending Udaan Talk registration email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit registration. Please try again later.',
    });
  }
});

export default router;

