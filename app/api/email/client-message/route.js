import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/auth';
const db = require('@/lib/db');
const { sendGmailMail } = require('@/lib/mailer');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export async function POST(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        typeof body.clientId !== 'string' || !body.clientId ||
        !['annual-returns', 'birthday'].includes(body.type)) {
      return NextResponse.json({ error: 'A valid client and email type are required.' }, { status: 400 });
    }

    const clients = await db.getClients();
    const client = clients.find(item => item.id === body.clientId);
    if (!client) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    if (!client.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) {
      return NextResponse.json({ error: 'The client does not have a valid email address.' }, { status: 400 });
    }

    let subject;
    let html;
    if (body.type === 'birthday') {
      subject = 'Birthday wishes from Titobiloba Consults Limited';
      html = `<p>Dear ${escapeHtml(client.name)},</p>
        <p>Wishing you a very happy birthday from all of us at <strong>Titobiloba Consults Limited</strong>!</p>
        <p>May this special day bring you joy, prosperity, and continued success. Thank you for being a valued client.</p>
        <p>Kind regards,<br>Titobiloba Consults Limited</p>`;
    } else {
      subject = 'Annual returns filing reminder from Titobiloba Consults Limited';
      html = `<p>Dear ${escapeHtml(client.name)},</p>
        <p>This is a friendly reminder from <strong>Titobiloba Consults Limited</strong> regarding the annual returns filing for your entity${client.registration_type ? ` registered as ${escapeHtml(client.registration_type)}` : ''}.</p>
        ${client.registration_number ? `<p>Registration number: ${escapeHtml(client.registration_number)}</p>` : ''}
        ${client.annual_returns_due_date ? `<p>Next filing due date: <strong>${escapeHtml(client.annual_returns_due_date)}</strong></p>` : ''}
        <p>Please contact us to arrange your filing and avoid any applicable penalties.</p>
        <p>Kind regards,<br>Titobiloba Consults Limited</p>`;
    }

    const result = await sendGmailMail({ to: client.email, subject, html });
    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    if (error.code === 'GMAIL_NOT_CONFIGURED') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error sending client email:', error.message);
    return NextResponse.json({ error: 'Failed to send email. Verify the Gmail app password and server logs.' }, { status: 500 });
  }
}
