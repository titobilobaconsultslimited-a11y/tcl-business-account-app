import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
  try {
    const invoices = await db.getInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { invoice_number, client_id, issue_date, due_date, status, discount, tax, total, bank_details, notes, items } = body;
    
    if (!invoice_number || !issue_date || !due_date || !status || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required invoice fields or items' }, { status: 400 });
    }
    
    const amount_paid = Number(body.amount_paid || 0);
    const cost_price = Number(body.cost_price || 0);

    // Create invoice
    const newInvoice = await db.addInvoice({
      invoice_number,
      client_id: client_id || null,
      issue_date,
      due_date,
      status,
      discount: Number(discount || 0),
      tax: Number(tax || 0),
      total: Number(total),
      bank_details: bank_details || '',
      notes: notes || '',
      amount_paid: amount_paid,
      cost_price: cost_price
    }, items);

    // If marked as paid, automatically log receipt and transaction for full amount
    if (status === 'paid') {
      const receiptNumber = 'RCT-' + invoice_number.substring(4);
      await db.addReceipt({
        receipt_number: receiptNumber,
        invoice_id: newInvoice.id,
        payment_date: issue_date,
        amount: amount_paid || Number(total),
        payment_method: 'Bank Transfer' // Default
      });

      // Log income transaction
      await db.addTransaction({
        type: 'income',
        category: 'Service Revenue',
        amount: amount_paid || Number(total),
        date: issue_date,
        description: `Payment for Invoice ${invoice_number}`,
        account: 'Bank',
        client_id: client_id || null
      });
    } else if (amount_paid > 0) {
      // If unpaid/pending but has partial payment logged
      const receiptNumber = 'RCT-' + invoice_number.substring(4) + '-DEP';
      await db.addReceipt({
        receipt_number: receiptNumber,
        invoice_id: newInvoice.id,
        payment_date: issue_date,
        amount: amount_paid,
        payment_method: 'Bank Transfer'
      });

      // Log partial income transaction
      await db.addTransaction({
        type: 'income',
        category: 'Service Revenue',
        amount: amount_paid,
        date: issue_date,
        description: `Deposit Payment for Invoice ${invoice_number}`,
        account: 'Bank',
        client_id: client_id || null
      });
    }

    // Automatically log expense transaction if cost_price > 0
    if (cost_price > 0) {
      await db.addTransaction({
        type: 'expense',
        category: 'Service Fulfillment',
        amount: cost_price,
        date: issue_date,
        description: `Fulfillment Cost for Invoice ${invoice_number}`,
        account: 'Bank',
        client_id: client_id || null
      });
    }
    
    return NextResponse.json(newInvoice);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, payment_date, payment_method, account } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Invoice ID and Status are required' }, { status: 400 });
    }
    
    // Fetch all invoices to get this invoice's details
    const invoices = await db.getInvoices();
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const previousStatus = invoice.status;
    const previousAmountPaid = Number(invoice.amount_paid || 0);
    const total = Number(invoice.total);
    const remainingBalance = total - previousAmountPaid;

    await db.updateInvoiceStatus(id, status, total); // sets amount_paid to total

    // If transitioned to paid, create receipt and transaction for the remaining balance
    if (status === 'paid' && previousStatus !== 'paid') {
      const receiptNumber = 'RCT-' + invoice.invoice_number.substring(4) + (previousAmountPaid > 0 ? '-BAL' : '');
      const date = payment_date || new Date().toISOString().split('T')[0];
      const method = payment_method || 'Bank Transfer';
      const acc = account || 'Bank';

      if (remainingBalance > 0) {
        await db.addReceipt({
          receipt_number: receiptNumber,
          invoice_id: invoice.id,
          payment_date: date,
          amount: remainingBalance,
          payment_method: method
        });

        // Log income transaction
        await db.addTransaction({
          type: 'income',
          category: 'Service Revenue',
          amount: remainingBalance,
          date: date,
          description: `Final Balance Payment for Invoice ${invoice.invoice_number}`,
          account: acc,
          client_id: invoice.client_id || null
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
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
