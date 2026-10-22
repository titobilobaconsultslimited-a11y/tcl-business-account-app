import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/auth';
const db = require('@/lib/db');
const { toCurrency } = require('@/lib/accounting');

export async function GET(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const services = await db.getServices();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Service name and price are required' }, { status: 400 });
    }
    const price = toCurrency(Number(body.price));
    if (price === null || price < 0) {
      return NextResponse.json({ error: 'Service price must be a non-negative number.' }, { status: 400 });
    }
    const newService = await db.addService({
      name: body.name,
      price,
      description: body.description || ''
    });
    return NextResponse.json(newService);
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
      return NextResponse.json({ error: 'Service ID(s) required' }, { status: 400 });
    }
    const ids = idStr.split(',');
    for (const id of ids) {
      await db.deleteService(id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    if (!body.id || !body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Service ID, name, and price are required' }, { status: 400 });
    }
    const price = toCurrency(Number(body.price));
    if (price === null || price < 0) {
      return NextResponse.json({ error: 'Service price must be a non-negative number.' }, { status: 400 });
    }
    const updatedService = await db.updateService(body.id, {
      name: body.name,
      price,
      description: body.description || ''
    });
    return NextResponse.json(updatedService);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
