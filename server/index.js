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
const PUBLIC_ORIGIN_RAW = process.env.PUBLIC_ORIGIN || '';
const TRUST_PROXY = process.env.TRUST_PROXY || '';

if (!PUBLIC_ORIGIN_RAW) {
  console.error(
    'PUBLIC_ORIGIN is required (e.g. https://wiki.jeffreykeyser.net). ' +
      'It is the canonical scheme+host used to build the post-login returnUrl ' +
      'and must be configured to prevent open-redirect via request headers.',
  );
  process.exit(1);
}

let PUBLIC_ORIGIN = '';
try {
  const parsed = new URL(PUBLIC_ORIGIN_RAW);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`unsupported protocol ${parsed.protocol}`);
  }
  PUBLIC_ORIGIN = `${parsed.protocol}//${parsed.host}`;
} catch (err) {
  console.error(
    `PUBLIC_ORIGIN is invalid: ${err instanceof Error ? err.message : err}`,
  );
  process.exit(1);
}

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
  // Build returnUrl from PUBLIC_ORIGIN (required). The path portion is taken
  // from req.originalUrl but normalized to a single leading slash so that a
  // network-path reference like "//evil.example" cannot resolve to a foreign
  // origin when the URL is parsed by the browser or Pay's login UI.
  const rawPath = typeof req.originalUrl === 'string' ? req.originalUrl : '/';
  const normalizedPath = '/' + rawPath.replace(/^\/+/, '');
  const returnUrl = `${PUBLIC_ORIGIN}${normalizedPath}`;
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

// Trust forwarded headers (X-Forwarded-Proto, X-Forwarded-For) only when the
// operator has explicitly opted in via TRUST_PROXY. Accepts the same values
// Express's `trust proxy` setting accepts: a boolean, hop count, IP/CIDR list,
// or a named preset like "loopback". Default is off so request headers cannot
// influence the server's view of the client.
if (TRUST_PROXY) {
  const lowered = TRUST_PROXY.toLowerCase();
  if (lowered === 'true') app.set('trust proxy', true);
  else if (lowered === 'false') app.set('trust proxy', false);
  else if (/^\d+$/.test(TRUST_PROXY)) app.set('trust proxy', Number(TRUST_PROXY));
  else app.set('trust proxy', TRUST_PROXY);
}

const loginPagePaths = new Set(['/login', '/login/', '/login/index.html']);
function serveLoginPage(req, res, next) {
  if (!loginPagePaths.has(req.path)) return next();
  const file = path.join(distDir, 'login', 'index.html');
  fs.access(file, fs.constants.R_OK, (err) => {
    if (err) return next();
    res.sendFile(file);
  });
}

app.post(
  '/api/auth/login',
  express.json({ limit: '4kb' }),
  async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ success: false, message: 'email and password required' });
    }
    let upstream;
    try {
      upstream = await fetch(`${PAY_AUTH_BASE_URL.replace(/\/+$/, '')}/api/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passwordPlainText: password }),
      });
    } catch (err) {
      console.error('[auth] pay login fetch failed:', err instanceof Error ? err.message : err);
      return res.status(502).json({ success: false, message: 'auth service unreachable' });
    }
    const body = await upstream.json().catch(() => ({}));
    if (!upstream.ok || !body?.success || !body?.data?.accessToken) {
      return res
        .status(upstream.status === 200 ? 401 : upstream.status)
        .json({ success: false, message: body?.message || 'invalid credentials' });
    }
    const expiresIn = Number(body.data.expiresIn) || 3600;
    res.cookie(PAY_AUTH_COOKIE_NAME, body.data.accessToken, {
      httpOnly: true,
      secure: PUBLIC_ORIGIN.startsWith('https:'),
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn * 1000,
    });
    return res.json({ success: true, expiresIn });
  },
);

app.use(serveLoginPage);

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
