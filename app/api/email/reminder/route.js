import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/auth';
const db = require('@/lib/db');
const { sendGmailMail } = require('@/lib/mailer');

export async function POST(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        typeof body.invoiceId !== 'string' || !body.invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required.' }, { status: 400 });
    }

    const invoices = await db.getInvoices();
    const invoice = invoices.find(item => item.id === body.invoiceId);
    if (!invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'A reminder cannot be sent for a paid invoice.' }, { status: 400 });
    }

    const clients = await db.getClients();
    const client = clients.find(item => item.id === invoice.client_id);
    if (!client?.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) {
      return NextResponse.json({ error: 'The invoice client does not have a valid email address.' }, { status: 400 });
    }

    const outstanding = Math.max(0, Number(invoice.total) - Number(invoice.amount_paid || 0));
    const overdue = invoice.due_date < new Date().toISOString().slice(0, 10);
    const money = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 2,
    }).format(outstanding);
    const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
    const subject = `${overdue ? 'Overdue payment reminder' : 'Payment reminder'}: Invoice ${invoice.invoice_number}`;
    const html = `<p>Dear ${escapeHtml(client.name)},</p>
      <p>This is a friendly reminder about invoice <strong>${escapeHtml(invoice.invoice_number)}</strong>.</p>
      <p>Due date: ${escapeHtml(invoice.due_date)}<br>
      Outstanding balance: <strong>${escapeHtml(money)}</strong></p>
      <p>Please contact us if you have already made this payment or have any questions.</p>
      <p>Kind regards,<br>Titobiloba Consults Limited</p>`;

    const result = await sendGmailMail({ to: client.email, subject, html });
    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    if (error.code === 'GMAIL_NOT_CONFIGURED') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error sending payment reminder:', error.message);
    return NextResponse.json({ error: 'Failed to send payment reminder. Verify the Gmail app password and server logs.' }, { status: 500 });
  }
}
