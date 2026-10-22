import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/auth';
const db = require('@/lib/db');
const { calculateInvoiceTotals, isIsoDate, toCurrency } = require('@/lib/accounting');

export async function GET(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const invoices = await db.getInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const { invoice_number, client_id, issue_date, due_date, status, discount, tax, bank_details, notes, items } = body;
    
    if (typeof invoice_number !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(invoice_number) ||
        !isIsoDate(issue_date) || !isIsoDate(due_date) ||
        due_date < issue_date ||
        !['paid', 'unpaid'].includes(status) || !Array.isArray(items) || items.length === 0 || items.length > 100) {
      return NextResponse.json({ error: 'Missing required invoice fields or items' }, { status: 400 });
    }
    const normalizedItems = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      const unitPrice = toCurrency(Number(item.unit_price));
      const costPrice = toCurrency(Number(item.cost_price || 0));
      const amount = toCurrency(quantity * (unitPrice ?? 0));
      if (typeof item.description !== 'string' || !item.description.trim() ||
          !Number.isFinite(quantity) || quantity <= 0 ||
          unitPrice === null || unitPrice < 0 ||
          costPrice === null || costPrice < 0 || amount === null) {
        return NextResponse.json({ error: 'Each invoice item needs a description, positive quantity, and valid prices.' }, { status: 400 });
      }
      normalizedItems.push({
        service_id: item.service_id || null,
        subtype: item.subtype || null,
        cost_price: costPrice,
        description: item.description.trim(),
        quantity,
        unit_price: unitPrice,
        amount,
      });
    }

    const discountAmount = toCurrency(Number(discount || 0));
    const taxRate = Number(tax || 0);
    let invoiceTotal;
    try {
      if (discountAmount === null) throw new RangeError('Discount is outside the supported range.');
      invoiceTotal = calculateInvoiceTotals(normalizedItems, discountAmount, taxRate).total;
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const amountPaid = toCurrency(Number(body.amount_paid || 0));
    if (invoiceTotal <= 0 || amountPaid === null || amountPaid < 0 || amountPaid > invoiceTotal ||
        (status === 'paid' && amountPaid !== invoiceTotal) ||
        (status === 'unpaid' && amountPaid === invoiceTotal && invoiceTotal > 0)) {
      return NextResponse.json({ error: 'Amount paid must not exceed the invoice total, and a paid invoice must be fully settled.' }, { status: 400 });
    }

    const costPrice = toCurrency(normalizedItems.reduce((sum, item) => sum + item.cost_price, 0));
    if (costPrice === null) {
      return NextResponse.json({ error: 'Invoice cost price is outside the supported range.' }, { status: 400 });
    }
    const newInvoice = await db.addInvoice({
      invoice_number,
      client_id: client_id || null,
      issue_date,
      due_date,
      status,
      discount: discountAmount,
      tax: taxRate,
      total: invoiceTotal,
      bank_details: bank_details || '',
      notes: notes || '',
      amount_paid: amountPaid,
      cost_price: costPrice,
    }, normalizedItems, {
      paymentDate: issue_date,
      paymentMethod: 'Bank Transfer',
      account: 'Bank',
    });
    
    return NextResponse.json(newInvoice);
  } catch (error) {
    if (error.code === 'INVOICE_NUMBER_TAKEN' || error.code === '23505') {
      return NextResponse.json({ error: 'That invoice number is already in use.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const { id, status, payment_date, payment_method, account, partial_amount, is_partial } = body;
    
    const date = payment_date || new Date().toISOString().split('T')[0];
    const method = payment_method || 'Bank Transfer';
    const acc = account || 'Bank';
    if (typeof id !== 'string' || !id || typeof is_partial !== 'boolean' ||
        !['paid', 'unpaid'].includes(status) ||
        !['Bank Transfer', 'Cash', 'POS', 'Cheque'].includes(method) ||
        !['Bank', 'Cash', 'Mobile Money'].includes(acc) ||
        !isIsoDate(date) ||
        (!is_partial && status !== 'paid')) {
      return NextResponse.json({ error: 'A valid invoice, payment date, method, and payment amount are required.' }, { status: 400 });
    }

    const payment = await db.recordInvoicePayment({
      invoiceId: id,
      amount: is_partial ? Number(partial_amount) : null,
      paymentDate: date,
      paymentMethod: method,
      account: acc,
    });
    return NextResponse.json(payment);
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

export async function DELETE(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ error: 'Invoice ID(s) required' }, { status: 400 });
    }
    const ids = idStr.split(',');
    for (const id of ids) {
      await db.deleteInvoice(id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
