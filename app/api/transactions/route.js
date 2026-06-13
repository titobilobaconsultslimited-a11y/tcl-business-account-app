import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
  try {
    const transactions = await db.getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, category, amount, date, description, account, client_id, service_id } = body;
    
    if (!type || !category || !amount || !date || !account) {
      return NextResponse.json({ error: 'Missing required transaction fields' }, { status: 400 });
    }
    
    const newTx = await db.addTransaction({
      type,
      category,
      amount: Number(amount),
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }
    await db.deleteTransaction(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
