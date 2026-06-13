import { NextResponse } from 'next/server';
const nodemailer = require('nodemailer');
const db = require('@/lib/db');

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, htmlBody, filename, pdfBase64 } = body;
    
    if (!to || !subject || !htmlBody || !filename || !pdfBase64) {
      return NextResponse.json({ error: 'Missing required email fields or attachment' }, { status: 400 });
    }

    // Get SMTP configuration from settings
    const settings = await db.getSettings();
    
    if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass) {
      return NextResponse.json({ 
        error: 'SMTP email server is not configured. Please configure your SMTP settings in the Settings page.' 
      }, { status: 400 });
    }

    // Prepare attachment buffer
    // Remove base64 data URL header if present
    const base64Data = pdfBase64.includes('base64,') 
      ? pdfBase64.split('base64,')[1] 
      : pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // Create Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort),
      secure: settings.smtpSecure === 'true', // true for 465, false for other ports
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    // Send Mail
    const mailOptions = {
      from: `"${settings.companyName || 'Titobiloba Consults Limited'}" <${settings.senderEmail || settings.smtpUser}>`,
      to,
      subject,
      html: htmlBody,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: `Failed to send email: ${error.message}` }, { status: 500 });
  }
}
