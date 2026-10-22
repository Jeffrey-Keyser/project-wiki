import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { invoke, invokeAiProxy, resolveProviderConfig, SUPPORTED_PROVIDERS } from './providers.js';

export const GENERATOR_ROLE = 'project-wiki-generator';

function validate(row) {
  if (!row || row.role !== GENERATOR_ROLE || !SUPPORTED_PROVIDERS.includes(row.provider) ||
      !(row.model === null || (typeof row.model === 'string' && /^[a-zA-Z0-9._/-]{0,150}$/.test(row.model))) ||
      !(row.thinking_level === null || typeof row.thinking_level === 'string') ||
      typeof row.auto_fallback !== 'boolean' || typeof row.updated_at !== 'string' ||
      !Number.isFinite(Date.parse(row.updated_at))) throw new Error('Invalid Project Wiki model selection');
  const levels = row.provider === 'claude' ? ['', 'low', 'medium', 'high', 'xhigh', 'max']
    : row.provider === 'codex' ? ['', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra'] : [''];
  if (!levels.includes(row.thinking_level || '')) throw new Error('Unsupported Project Wiki reasoning level');
  const model = row.model || '';
  const scoped = row.provider === 'claude' ? /^(?:opus|sonnet|haiku|fable|claude-[a-z0-9.-]+)$/
    : row.provider === 'codex' ? /^(?:gpt-[a-z0-9.-]+|codex-auto-review)$/ : /^kimi-code\/[a-z0-9.-]+$/;
  if (model && !scoped.test(model)) throw new Error('Project Wiki model does not belong to selected provider');
}

/** No cache: every new invocation sees the current row. Invalid saved rows fail closed. */
export async function resolveGeneratorConfig(env = process.env, fetcher = fetch) {
  const legacy = () => ({ ...resolveProviderConfig('generator', env), thinkingLevel: '',
    source: env.PROJECT_WIKI_MODEL_SOURCE === 'env' ? 'operator-override' : 'legacy-default', revision: null });
  if (env.PROJECT_WIKI_MODEL_SOURCE === 'env') return legacy();
  let response;
  try {
    response = await fetcher(`${(env.PROJECT_WIKI_AGENCY_URL || 'http://127.0.0.1:3040').replace(/\/$/, '')}/api/v1/dispatch-config/${GENERATOR_ROLE}`,
      { signal: AbortSignal.timeout(2000), redirect: 'error' });
  } catch { return legacy(); }
  if (response.status === 404 || response.status >= 500) return legacy();
  if (!response.ok) throw new Error(`Project Wiki model registry returned HTTP ${response.status}`);
  const body = await response.json();
  if (body.success !== true) throw new Error('Invalid Project Wiki model registry response');
  validate(body.data);
  const row = body.data;
  return { role: 'generator', provider: row.provider, model: row.model || '',
    thinkingLevel: row.thinking_level || '', source: 'central', revision: new Date(row.updated_at).toISOString() };
}

function statusDir(env) {
  return env.PROJECT_WIKI_MODEL_STATUS_DIR || path.join(os.homedir(), '.local/state/project-wiki/model-status');
}

/** Selector-only evidence shared by the updater and CLI. Never stores prompts or errors. */
async function receipt(selection, state, id, env, logger, transport = 'cli') {
  const dir = statusDir(env);
  const temporary = path.join(dir, `.${id}.json`);
  try {
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    await fs.writeFile(temporary, JSON.stringify({ schema: 'model-consumption/v1', role: GENERATOR_ROLE,
      selection, invocation: { id, state, provider: selection.provider, model: selection.model,
        thinkingLevel: selection.thinkingLevel, transport, at: new Date().toISOString(),
        exitCode: state === 'finished' ? 0 : null } }), { mode: 0o600 });
    await fs.rename(temporary, path.join(dir, `${GENERATOR_ROLE}.json`));
  } catch {
    logger.warn?.('[models] Could not write Project Wiki selector status');
    await fs.rm(temporary, { force: true }).catch(() => {});
  }
}

const RUN_LOG_MAX_BYTES = 5 * 1024 * 1024;

/** Coarse failure class for the run log; error text can quote prompt content, so it is never stored. */
export function errorKind(error) {
  const message = error instanceof Error ? error.message : String(error);
  const http = message.match(/HTTP (\d{3})(?: ([A-Z_]+))?/);
  if (http) return http[2] ? `http-${http[1]}-${http[2]}` : `http-${http[1]}`;
  const exit = message.match(/exited with code (\d+)/);
  if (exit) return `exit-${exit[1]}`;
  if (/timeout|timed out|aborted/i.test(message)) return 'timeout';
  if (/no usable text/.test(message)) return 'no-usable-text';
  return 'error';
}

/**
 * Append one JSON line per generator invocation and per processed update to
 * runs.jsonl beside the selector receipt, so runs can be counted and traced
 * after the fact (the receipt keeps only the latest call). Rotates once past
 * 5 MiB. Best-effort: a logging failure never fails the update.
 */
export async function appendRunLog(record, env = process.env, logger = console) {
  const dir = statusDir(env);
  const file = path.join(dir, 'runs.jsonl');
  try {
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    const size = await fs.stat(file).then((s) => s.size, () => 0);
    if (size > RUN_LOG_MAX_BYTES) await fs.rename(file, `${file}.1`);
    await fs.appendFile(file, `${JSON.stringify({ schema: 'project-wiki-run/v1', at: new Date().toISOString(), ...record })}\n`,
      { mode: 0o600 });
  } catch {
    logger.warn?.('[models] Could not append Project Wiki run log');
  }
}

/**
 * PROJECT_WIKI_AI_PROXY selects how a claude selection is transported:
 * off (default) = claude CLI only; primary = AI Proxy first, claude CLI if the
 * proxy refuses or fails; fallback = CLI first, proxy if the CLI fails.
 */
export function aiProxyMode(env = process.env) {
  const mode = String(env.PROJECT_WIKI_AI_PROXY || 'off').trim().toLowerCase();
  return ['primary', 'fallback'].includes(mode) ? mode : 'off';
}

export async function invokeGenerator(opts, { fetcher = fetch, invokeProvider = invoke, invokeProxy = invokeAiProxy } = {}) {
  const env = opts.env || process.env;
  const selection = await resolveGeneratorConfig(env, fetcher);
  const id = randomUUID();
  const logger = opts.logger || console;
  const meta = { id, purpose: opts.purpose || 'invoke', repo: opts.meta?.repo || null, sha: opts.meta?.sha || null,
    provider: selection.provider, model: selection.model, thinkingLevel: selection.thinkingLevel, source: selection.source };
  const mode = selection.provider === 'claude' ? aiProxyMode(env) : 'off';
  const viaCli = () => invokeProvider({ ...opts, provider: selection.provider, model: selection.model,
    thinkingLevel: selection.thinkingLevel });
  const viaProxy = () => invokeProxy({ ...opts, env, model: selection.model, thinkingLevel: selection.thinkingLevel });
  const order = mode === 'primary' ? [['ai-proxy', viaProxy], ['cli', viaCli]]
    : mode === 'fallback' ? [['cli', viaCli], ['ai-proxy', viaProxy]] : [['cli', viaCli]];

  await receipt(selection, 'running', id, env, logger, order[0][0]);
  let fallbackFrom = null;
  for (const [index, [transport, run]] of order.entries()) {
    const startedAt = Date.now();
    try {
      const result = await run();
      await receipt(selection, 'finished', id, env, logger, transport);
      await appendRunLog({ kind: 'invocation', ...meta, transport, state: 'finished', fallbackFrom,
        durationMs: Date.now() - startedAt, usage: result.usage || null }, env, logger);
      return result;
    } catch (error) {
      const kind = errorKind(error);
      await appendRunLog({ kind: 'invocation', ...meta, transport, state: 'failed', fallbackFrom, errorKind: kind,
        durationMs: Date.now() - startedAt }, env, logger);
      if (index === order.length - 1) {
        await receipt(selection, 'failed', id, env, logger, transport);
        throw error;
      }
      logger.warn?.(`[models] ${transport} failed (${kind}); falling back to ${order[index + 1][0]}`);
      fallbackFrom = transport;
    }
  }
}
