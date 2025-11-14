import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using Gmail app password
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});


// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Gmail connection error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

export default transporter;

