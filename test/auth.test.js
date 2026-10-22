const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createSession,
  credentialsMatch,
  verifySession,
} = require('../lib/auth');

const originalEnvironment = {
  email: process.env.APP_LOGIN_EMAIL,
  password: process.env.APP_LOGIN_PASSWORD,
  secret: process.env.APP_SESSION_SECRET,
};

test.before(() => {
  process.env.APP_LOGIN_EMAIL = 'owner@example.com';
  process.env.APP_LOGIN_PASSWORD = 'test-password';
  process.env.APP_SESSION_SECRET = 'test-only-signing-secret-at-least-32-chars';
});

test.after(() => {
  if (originalEnvironment.email === undefined) delete process.env.APP_LOGIN_EMAIL;
  else process.env.APP_LOGIN_EMAIL = originalEnvironment.email;
  if (originalEnvironment.password === undefined) delete process.env.APP_LOGIN_PASSWORD;
  else process.env.APP_LOGIN_PASSWORD = originalEnvironment.password;
  if (originalEnvironment.secret === undefined) delete process.env.APP_SESSION_SECRET;
  else process.env.APP_SESSION_SECRET = originalEnvironment.secret;
});

test('checks configured credentials without accepting case-sensitive email differences', () => {
  assert.equal(credentialsMatch(' OWNER@example.com ', 'test-password'), true);
  assert.equal(credentialsMatch('owner@example.com', 'wrong'), false);
  assert.equal(credentialsMatch('attacker@example.com', 'test-password'), false);
});

test('verifies valid signed sessions and rejects tampered or missing cookies', () => {
  const session = createSession('owner@example.com');
  const request = value => new Request('https://example.test/api/clients', {
    headers: value ? { cookie: `tcl_session=${value}` } : {},
  });

  assert.equal(verifySession(request(session.value)), true);
  assert.equal(verifySession(request(`${session.value}x`)), false);
  assert.equal(verifySession(request(null)), false);
});

test('rejects sessions issued for another account configuration', () => {
  const session = createSession('owner@example.com');
  process.env.APP_LOGIN_EMAIL = 'different@example.com';
  const request = new Request('https://example.test/api/clients', {
    headers: { cookie: `tcl_session=${session.value}` },
  });

  assert.equal(verifySession(request), false);
  process.env.APP_LOGIN_EMAIL = 'owner@example.com';
});
