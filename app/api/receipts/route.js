import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
  try {
    const receipts = await db.getReceipts();
    return NextResponse.json(receipts);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { receipt_number, invoice_id, payment_date, amount, payment_method } = body;
    
    if (!receipt_number || !invoice_id || !payment_date || !amount || !payment_method) {
      return NextResponse.json({ error: 'Missing required receipt fields' }, { status: 400 });
    }
    
    const newReceipt = await db.addReceipt({
      receipt_number,
      invoice_id,
      payment_date,
      amount: Number(amount),
      payment_method
    });
    
    // Auto mark invoice as paid
    await db.updateInvoiceStatus(invoice_id, 'paid');
    
    return NextResponse.json(newReceipt);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
