# Backend Server Setup

This backend server handles form submissions from the Pankho Ki Udaan website and sends emails using Nodemailer.

## Features

- Contact form submissions
- Udaan Talk registration
- Disability Inclusion support requests
- Podcast guest suggestions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your Gmail credentials:

```env
PORT=5000
NODE_ENV=development

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Email Recipients (optional)
CONTACT_EMAIL=contact@pankhokiudaan.org
UDAAN_TALK_EMAIL=udaan-talk@pankhokiudaan.org
DISABILITY_INCLUSION_EMAIL=inclusion@pankhokiudaan.org
PODCAST_EMAIL=podcast@pankhokiudaan.org
```

### 3. Gmail App Password Setup

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `GMAIL_APP_PASSWORD`

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev:server
```

Production mode:
```bash
npm run server
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### POST `/api/contact`
Submit contact form

### POST `/api/udaan-talk`
Register for Udaan Talk event

### POST `/api/disability-inclusion`
Submit disability inclusion support request

### POST `/api/podcast-guest`
Submit podcast guest suggestion

### GET `/api/health`
Health check endpoint

## Email Configuration

The server sends two emails for each form submission:
1. **Notification email** to the organization (using the specific email from env or defaulting to GMAIL_USER)
2. **Confirmation email** to the user who submitted the form

## Troubleshooting

- **Gmail Connection Error**: Verify your Gmail credentials and ensure you're using an App Password (not your regular Gmail password)
- **Port Already in Use**: Change the PORT in `.env` file
- **CORS Issues**: The server is configured to allow CORS from the frontend

## Production Deployment

For production:
1. Set `NODE_ENV=production` in `.env`
2. Consider using a proper email service (SendGrid, Mailgun, etc.) for higher volume
3. Ensure environment variables are securely stored
4. Keep your Gmail App Password secure and never commit it to version control

