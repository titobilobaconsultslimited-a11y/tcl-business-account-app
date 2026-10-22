const { createHmac, timingSafeEqual } = require('node:crypto');
const { NextResponse } = require('next/server');

const SESSION_COOKIE_NAME = 'tcl_session';

const SESSION_DURATION = 60 * 60 * 12;
const REMEMBERED_SESSION_DURATION = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.APP_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createSession(email, rememberMe = false) {
  const secret = getSecret();
  if (!secret) {
    throw new Error('APP_SESSION_SECRET must contain at least 32 characters.');
  }

  const maxAge = rememberMe ? REMEMBERED_SESSION_DURATION : SESSION_DURATION;
  const payload = Buffer.from(JSON.stringify({
    email: email.toLowerCase(),
    expiresAt: Date.now() + maxAge * 1000,
  })).toString('base64url');

  return { value: `${payload}.${sign(payload, secret)}`, maxAge };
}

function verifySession(request) {
  const secret = getSecret();
  const configuredEmail = process.env.APP_LOGIN_EMAIL?.trim().toLowerCase();
  if (!secret || !configuredEmail) return false;

  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!cookie) return false;

  const value = cookie.slice(SESSION_COOKIE_NAME.length + 1);
  const separator = value.lastIndexOf('.');
  if (separator < 1) return false;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!safeEqual(signature, sign(payload, secret))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.email === configuredEmail && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function credentialsMatch(email, password) {
  const configuredEmail = process.env.APP_LOGIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.APP_LOGIN_PASSWORD;
  if (!configuredEmail || !configuredPassword || configuredPassword.length < 12 || !getSecret()) return false;

  return safeEqual(email.trim().toLowerCase(), configuredEmail) &&
    safeEqual(password, configuredPassword);
}

function setSessionCookie(response, session) {
  response.cookies.set(SESSION_COOKIE_NAME, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: session.maxAge,
  });
}

function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

function requireAuthentication(request) {
  if (verifySession(request)) return null;
  return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
}

module.exports = {
  clearSessionCookie,
  createSession,
  credentialsMatch,
  requireAuthentication,
  setSessionCookie,
  verifySession,
};
