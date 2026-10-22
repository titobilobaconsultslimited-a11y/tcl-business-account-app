import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/auth';
const db = require('@/lib/db');

export async function GET(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const settings = await db.getSettings();
    const publicSettings = { ...settings };
    for (const key of ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpSecure']) delete publicSettings[key];
    return NextResponse.json({
      ...publicSettings,
      smtpConfigured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      senderEmail: process.env.GMAIL_USER || settings.senderEmail || '',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = requireAuthentication(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Settings must be provided as an object.' }, { status: 400 });
    }
    const allowedFields = ['theme', 'senderEmail', 'companyName', 'companyAddress', 'companyPhone', 'bankDetails'];
    if (Object.keys(body).some(key => !allowedFields.includes(key))) {
      return NextResponse.json({ error: 'Unsupported settings field.' }, { status: 400 });
    }
    if (Object.values(body).some(value => typeof value !== 'string')) {
      return NextResponse.json({ error: 'Settings values must be strings.' }, { status: 400 });
    }
    const updatedSettings = await db.updateSettings(body);
    const publicSettings = { ...updatedSettings };
    for (const key of ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpSecure']) delete publicSettings[key];
    return NextResponse.json({
      ...publicSettings,
      smtpConfigured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      senderEmail: process.env.GMAIL_USER || updatedSettings.senderEmail || '',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
