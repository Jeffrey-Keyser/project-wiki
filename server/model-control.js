import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { invoke, resolveProviderConfig, SUPPORTED_PROVIDERS } from './providers.js';

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

/** Selector-only evidence shared by the updater and CLI. Never stores prompts or errors. */
async function receipt(selection, state, id, env, logger) {
  const dir = env.PROJECT_WIKI_MODEL_STATUS_DIR || path.join(os.homedir(), '.local/state/project-wiki/model-status');
  const temporary = path.join(dir, `.${id}.json`);
  try {
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    await fs.writeFile(temporary, JSON.stringify({ schema: 'model-consumption/v1', role: GENERATOR_ROLE,
      selection, invocation: { id, state, provider: selection.provider, model: selection.model,
        thinkingLevel: selection.thinkingLevel, at: new Date().toISOString(), exitCode: state === 'finished' ? 0 : null } }), { mode: 0o600 });
    await fs.rename(temporary, path.join(dir, `${GENERATOR_ROLE}.json`));
  } catch {
    logger.warn?.('[models] Could not write Project Wiki selector status');
    await fs.rm(temporary, { force: true }).catch(() => {});
  }
}

export async function invokeGenerator(opts, { fetcher = fetch, invokeProvider = invoke } = {}) {
  const env = opts.env || process.env;
  const selection = await resolveGeneratorConfig(env, fetcher);
  const id = randomUUID();
  const logger = opts.logger || console;
  await receipt(selection, 'running', id, env, logger);
  try {
    const result = await invokeProvider({ ...opts, provider: selection.provider, model: selection.model,
      thinkingLevel: selection.thinkingLevel });
    await receipt(selection, 'finished', id, env, logger);
    return result;
  } catch (error) {
    await receipt(selection, 'failed', id, env, logger);
    throw error;
  }
}
