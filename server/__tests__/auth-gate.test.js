import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const forged = `e30.${Buffer.from(JSON.stringify({ id: 'forged', email: 'fake@example.com', role: 'admin', exp: 1 })).toString('base64url')}.invalid`;

test('wiki authorizes only the current authenticated Pay profile', { timeout: 15000 }, async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wiki-auth-gate-'));
  let role = 'admin';
  let revoked = false;
  const requests = [];
  const pay = http.createServer((req, res) => {
    requests.push(req.url);
    res.setHeader('content-type', 'application/json');
    if (req.url === '/auth/ping') return res.end(JSON.stringify({ message: 'pong' }));
    if (req.url !== '/auth/me' || req.headers.authorization !== 'Bearer real-session' || revoked) {
      res.writeHead(401); return res.end(JSON.stringify({ success: false }));
    }
    res.end(JSON.stringify({ success: true, data: { id: 'user-1', email: 'owner@example.com', role, roles: [role], permissions: [] } }));
  });
  let child;
  try {
    await fs.mkdir(path.join(dir, 'server'));
    await fs.mkdir(path.join(dir, 'dist'));
    await fs.writeFile(path.join(dir, 'package.json'), '{"type":"module"}');
    await fs.copyFile(path.join(root, 'index.js'), path.join(dir, 'server/index.js'));
    await fs.writeFile(path.join(dir, 'dist/index.html'), 'private wiki fixture');
    await fs.symlink(path.resolve(root, '../node_modules'), path.join(dir, 'node_modules'));
    pay.listen(0, '127.0.0.1'); await once(pay, 'listening');
    // Reserve a free port, then release it for the subprocess.
    const reservation = http.createServer();
    reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
    const port = reservation.address().port;
    await new Promise(resolve => reservation.close(resolve));
    child = spawn(process.execPath, [path.join(dir, 'server/index.js')], { env: {
      ...process.env, PORT: String(port), PUBLIC_ORIGIN: `http://127.0.0.1:${port}`,
      PAY_AUTH_BASE_URL: `http://127.0.0.1:${pay.address().port}`,
    }, stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((resolve, reject) => {
      child.stdout.on('data', data => { if (String(data).includes('front-server listening')) resolve(); });
      child.stderr.on('data', data => reject(new Error(String(data))));
      child.once('exit', code => reject(new Error(`wiki exited: ${code}`)));
    });
    const request = token => fetch(`http://127.0.0.1:${port}/`, {
      redirect: 'manual', headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    assert.equal((await request()).status, 302);
    assert.equal((await request(forged)).status, 302);
    let response = await request('real-session');
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'private wiki fixture');
    role = 'user';
    assert.equal((await request('real-session')).status, 403);
    role = 'admin'; revoked = true;
    assert.equal((await request('real-session')).status, 302);
    assert.deepEqual(requests, Array(4).fill('/auth/me'));
  } finally {
    if (child && child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); }
    await new Promise(resolve => pay.close(resolve));
    await fs.rm(dir, { recursive: true, force: true });
  }
});
