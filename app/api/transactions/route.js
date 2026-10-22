import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/auth';
const db = require('@/lib/db');
const { isIsoDate, toCurrency } = require('@/lib/accounting');

export async function GET(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const transactions = await db.getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const { type, category, amount, date, description, account, client_id, service_id } = body;
    
    const numericAmount = toCurrency(Number(amount));
    if (!['income', 'expense'].includes(type) || !category || !date || !account ||
        numericAmount === null || numericAmount <= 0 ||
        !isIsoDate(date)) {
      return NextResponse.json({ error: 'Missing required transaction fields' }, { status: 400 });
    }
    
    const newTx = await db.addTransaction({
      type,
      category,
      amount: numericAmount,
      date,
      description: description || '',
      account,
      client_id: client_id || null,
      service_id: service_id || null
    });
    
    return NextResponse.json(newTx);
  } catch (error) {
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
      return NextResponse.json({ error: 'Transaction ID(s) required' }, { status: 400 });
    }
    const ids = idStr.split(',');
    for (const id of ids) {
      await db.deleteTransaction(id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
