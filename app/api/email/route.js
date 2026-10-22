import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/auth';
const { sendGmailMail } = require('@/lib/mailer');

export async function POST(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const { to, subject, htmlBody, filename, pdfBase64 } = body;
    
    if (!to || !subject || !htmlBody || !filename || !pdfBase64 ||
        typeof to !== 'string' || typeof subject !== 'string' ||
        typeof htmlBody !== 'string' || typeof filename !== 'string' ||
        typeof pdfBase64 !== 'string') {
      return NextResponse.json({ error: 'Missing required email fields or attachment' }, { status: 400 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ 
        error: 'Gmail is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in the server environment.'
      }, { status: 400 });
    }

    if (to.length > 254 || subject.length > 200 || /[\r\n]/.test(subject) || filename.length > 180 ||
        htmlBody.length > 20000 || pdfBase64.length > 12_000_000 ||
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return NextResponse.json({ error: 'Email fields exceed allowed limits or the recipient address is invalid.' }, { status: 400 });
    }

    const base64Data = pdfBase64.replace(/^data:application\/pdf(?:;[^,]*)?;base64,/, '');
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
      return NextResponse.json({ error: 'The PDF attachment is invalid.' }, { status: 400 });
    }
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    if (pdfBuffer.length === 0 || pdfBuffer.length > 8_000_000 ||
        pdfBuffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return NextResponse.json({ error: 'The PDF attachment is invalid or too large.' }, { status: 400 });
    }

    const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
    const info = await sendGmailMail({
      to,
      subject,
      html: `<p>${escapeHtml(htmlBody).replace(/\r?\n/g, '<br>')}</p>`,
      attachments: [{
        filename: filename.replace(/[\\/:"*?<>|]/g, '_'),
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    if (error.code === 'GMAIL_NOT_CONFIGURED') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error sending email:', error.message);
    return NextResponse.json({ error: 'Failed to send email. Verify the Gmail app password and server logs.' }, { status: 500 });
  }
}
