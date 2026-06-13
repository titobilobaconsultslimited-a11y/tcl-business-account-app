import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
  try {
    const services = await db.getServices();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Service name and price are required' }, { status: 400 });
    }
    const newService = await db.addService({
      name: body.name,
      price: Number(body.price),
      description: body.description || ''
    });
    return NextResponse.json(newService);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }
    await db.deleteService(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
