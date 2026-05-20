import fs from 'node:fs';

// Reads .wiki-config.json, ensures `allowlist` contains `fullName`, writes
// back only when the contents would change. Sort order is preserved on
// insertion (append-only); a missing or malformed config is rewritten to a
// minimal valid shape with just this allowlist entry.

export function updateAllowlist(configPath, fullName) {
  let raw = null;
  try {
    raw = fs.readFileSync(configPath, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  let json;
  if (raw == null) {
    json = { allowlist: [] };
  } else {
    try {
      json = JSON.parse(raw);
    } catch {
      json = { allowlist: [] };
    }
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
      json = { allowlist: [] };
    }
  }

  if (!Array.isArray(json.allowlist)) json.allowlist = [];

  const before = json.allowlist.slice();
  if (!json.allowlist.includes(fullName)) {
    json.allowlist.push(fullName);
  }

  const serialized = JSON.stringify(json, null, 2) + '\n';
  if (raw === serialized) {
    return { changed: false, allowlist: json.allowlist };
  }
  // Byte-equal short-circuit: if list contents are identical but raw differs
  // only in trailing whitespace, leave the file alone to keep reruns no-op.
  if (raw != null && before.length === json.allowlist.length &&
      before.every((v, i) => v === json.allowlist[i])) {
    try {
      const reparsed = JSON.parse(raw);
      if (reparsed && Array.isArray(reparsed.allowlist) &&
          reparsed.allowlist.length === json.allowlist.length &&
          reparsed.allowlist.every((v, i) => v === json.allowlist[i])) {
        return { changed: false, allowlist: json.allowlist };
      }
    } catch {
      // fall through and rewrite
    }
  }

  fs.writeFileSync(configPath, serialized, 'utf8');
  return { changed: true, allowlist: json.allowlist };
}
