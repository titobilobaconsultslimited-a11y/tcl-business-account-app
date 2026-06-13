import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
  try {
    const settings = await db.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const updatedSettings = await db.updateSettings(body);
    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
