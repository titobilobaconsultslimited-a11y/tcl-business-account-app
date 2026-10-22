import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/auth';
const db = require('@/lib/db');
const { isIsoDate } = require('@/lib/accounting');

export async function GET(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const receipts = await db.getReceipts();
    const invoices = await db.getInvoices();
    return NextResponse.json(receipts.map(receipt => ({
      ...receipt,
      invoice: invoices.find(invoice => invoice.id === receipt.invoice_id) || null,
    })));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const { invoice_id, payment_date, amount, payment_method } = body;
    
    const paymentAmount = Number(amount);
    if (typeof invoice_id !== 'string' || !invoice_id ||
        !isIsoDate(payment_date) ||
        !Number.isFinite(paymentAmount) || paymentAmount <= 0 ||
        !['Bank Transfer', 'Cash', 'POS', 'Cheque'].includes(payment_method)) {
      return NextResponse.json({ error: 'Missing required receipt fields' }, { status: 400 });
    }
    
    const result = await db.recordInvoicePayment({
      invoiceId: invoice_id,
      amount: paymentAmount,
      paymentDate: payment_date,
      paymentMethod: payment_method,
      account: payment_method === 'Cash' ? 'Cash' : 'Bank',
    });
    return NextResponse.json(result.receipt);
  } catch (error) {
    if (error.code === 'INVOICE_NOT_FOUND') {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    }
    if (error.code === 'INVALID_PAYMENT' || error.code === 'INVOICE_ALREADY_PAID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
