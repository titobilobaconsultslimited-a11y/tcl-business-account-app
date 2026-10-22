const nodemailer = require('nodemailer');

async function sendGmailMail({ to, subject, html, attachments = [] }) {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!user || !appPassword) {
    const error = new Error('Gmail is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in the server environment.');
    error.code = 'GMAIL_NOT_CONFIGURED';
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass: appPassword.replace(/\s/g, ''),
    },
  });

  return transporter.sendMail({
    from: `"Titobiloba Consults Limited" <${user}>`,
    to,
    subject,
    html,
    attachments,
  });
}

module.exports = { sendGmailMail };
