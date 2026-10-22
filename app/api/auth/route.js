import { NextResponse } from 'next/server';
import {
  clearSessionCookie,
  createSession,
  credentialsMatch,
  setSessionCookie,
  verifySession,
} from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request) {
  return NextResponse.json({ authenticated: verifySession(request) });
}

export async function POST(request) {
  if (!process.env.APP_LOGIN_EMAIL || !process.env.APP_LOGIN_PASSWORD ||
      process.env.APP_LOGIN_PASSWORD.length < 12 ||
      !process.env.APP_SESSION_SECRET || process.env.APP_SESSION_SECRET.length < 32) {
    return NextResponse.json(
      { error: 'Server authentication is not configured. Set APP_LOGIN_EMAIL, an APP_LOGIN_PASSWORD of at least 12 characters, and a 32-character APP_SESSION_SECRET.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      typeof body.email !== 'string' || typeof body.password !== 'string' ||
      !credentialsMatch(body.email, body.password)) {
    return NextResponse.json({ error: 'Invalid email address or password.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  setSessionCookie(response, createSession(body.email, body.rememberMe === true));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
