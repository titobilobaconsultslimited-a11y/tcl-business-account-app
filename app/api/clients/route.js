import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
  try {
    const clients = await db.getClients();
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }
    const newClient = await db.addClient({
      name: body.name,
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      registration_type: body.registration_type || null,
      registration_date: body.registration_date || null,
      annual_returns_due_date: body.annual_returns_due_date || null,
      annual_returns_status: body.annual_returns_status || 'pending'
    });
    return NextResponse.json(newClient);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }
    const updatedClient = await db.updateClient(body.id, {
      name: body.name,
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      registration_type: body.registration_type || null,
      registration_date: body.registration_date || null,
      annual_returns_due_date: body.annual_returns_due_date || null,
      annual_returns_status: body.annual_returns_status || 'pending'
    });
    return NextResponse.json(updatedClient);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ error: 'Client ID(s) required' }, { status: 400 });
    }
    const ids = idStr.split(',');
    for (const id of ids) {
      await db.deleteClient(id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
