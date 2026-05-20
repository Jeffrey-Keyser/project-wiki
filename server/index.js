#!/usr/bin/env node
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// pay-auth-integration's ESM bundle ships unresolvable directory imports, so
// we load the CommonJS build through createRequire. The library is still the
// only source of validateToken/extractToken; this is purely a module-resolution
// workaround.
const require = createRequire(import.meta.url);
const { validateToken, extractToken } = require(
  '@jeffrey-keyser/pay-auth-integration/server',
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');

const PORT = Number(process.env.PORT) || 4321;
const PAY_AUTH_BASE_URL = process.env.PAY_AUTH_BASE_URL;
const PAY_AUTH_LOGIN_URL =
  process.env.PAY_AUTH_LOGIN_URL ||
  (PAY_AUTH_BASE_URL ? `${PAY_AUTH_BASE_URL.replace(/\/+$/, '')}/login` : '');
const PAY_AUTH_COOKIE_NAME = process.env.PAY_AUTH_COOKIE_NAME || 'accessToken';
const PAY_AUTH_RETURN_URL_PARAM = process.env.PAY_AUTH_RETURN_URL_PARAM || 'returnUrl';
const PAY_AUTH_DEBUG = process.env.PAY_AUTH_DEBUG === 'true';

if (!PAY_AUTH_BASE_URL) {
  console.error('PAY_AUTH_BASE_URL is required');
  process.exit(1);
}
if (!PAY_AUTH_LOGIN_URL) {
  console.error('PAY_AUTH_LOGIN_URL is required (or set PAY_AUTH_BASE_URL)');
  process.exit(1);
}
if (!fs.existsSync(distDir)) {
  console.error(`dist/ not found at ${distDir}. Run "npm run build" first.`);
  process.exit(1);
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    const raw = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(raw);
    } catch {
      out[key] = raw;
    }
  }
  return out;
}

function getToken(req) {
  const bearer = extractToken(req);
  if (bearer) return bearer;
  const cookies = parseCookies(req.headers.cookie);
  return cookies[PAY_AUTH_COOKIE_NAME] || null;
}

function buildLoginRedirect(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('host');
  const returnUrl = `${proto}://${host}${req.originalUrl}`;
  const url = new URL(PAY_AUTH_LOGIN_URL);
  url.searchParams.set(PAY_AUTH_RETURN_URL_PARAM, returnUrl);
  return url.toString();
}

function isAdmin(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return Array.isArray(user.roles) && user.roles.includes('admin');
}

async function authGate(req, res, next) {
  const token = getToken(req);
  if (!token) {
    if (PAY_AUTH_DEBUG) console.log(`[auth] no token, redirecting ${req.originalUrl}`);
    return res.redirect(302, buildLoginRedirect(req));
  }
  let user = null;
  try {
    user = await validateToken(token, PAY_AUTH_BASE_URL, undefined, PAY_AUTH_DEBUG);
  } catch (err) {
    console.error('[auth] validateToken threw:', err instanceof Error ? err.message : err);
  }
  if (!user) {
    if (PAY_AUTH_DEBUG) console.log(`[auth] invalid token, redirecting ${req.originalUrl}`);
    return res.redirect(302, buildLoginRedirect(req));
  }
  if (!isAdmin(user)) {
    if (PAY_AUTH_DEBUG) console.log(`[auth] non-admin user ${user.email}, 403`);
    return res.status(403).type('text/plain').send('Forbidden: admin role required');
  }
  req.user = user;
  next();
}

const app = express();
app.disable('x-powered-by');

app.use(authGate);

app.use(
  express.static(distDir, {
    extensions: ['html'],
    index: 'index.html',
    fallthrough: true,
  }),
);

app.use((req, res) => {
  res.status(404).type('text/plain').send('Not Found');
});

app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).type('text/plain').send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Project Wiki front-server listening on port ${PORT}`);
  console.log(`Serving static build from ${distDir}`);
  console.log(`Pay Auth base: ${PAY_AUTH_BASE_URL}`);
});
