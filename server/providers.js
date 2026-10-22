import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

/**
 * @typedef {'claude' | 'codex' | 'kimi'} Provider
 */

/**
 * @typedef {'agent' | 'generator' | 'reviewer' | 'bulk'} ProviderRole
 */

/**
 * @typedef {'inline' | 'stdin'} PromptMode
 */

/**
 * @typedef {Object} InvokeOpts
 * @property {Provider} provider
 * @property {string} prompt
 * @property {string} [model]
 * @property {string} [thinkingLevel]
 * @property {string} [systemPrompt]
 * @property {PromptMode} [promptMode]
 * @property {string} [cwd]
 * @property {NodeJS.ProcessEnv} [env]
 * @property {{ log?: (line: string) => void }} [logger]
 * @property {string} [purpose]
 */

/**
 * @typedef {Object} InvokeResult
 * @property {Provider} provider
 * @property {string} command
 * @property {string[]} args
 * @property {string} stdout
 * @property {number} exitCode
 * @property {number} durationMs
 */

export const SUPPORTED_PROVIDERS = ['claude', 'codex', 'kimi'];

const PROVIDER_BINARIES = {
  claude: 'claude',
  codex: 'codex',
  kimi: 'kimi',
};

const DEFAULT_PROVIDER_BY_ROLE = {
  agent: 'claude',
  generator: 'claude',
  reviewer: 'claude',
  bulk: 'claude',
};

const ROLE_ENV_KEYS = {
  agent: {
    provider: ['PROJECT_WIKI_AGENT_PROVIDER'],
    model: [],
  },
  generator: {
    provider: [
      'PROJECT_WIKI_GENERATOR_PROVIDER',
      'PROJECT_WIKI_AGENT_PROVIDER',
      'PROJECT_WIKI_SCAFFOLDER_PROVIDER',
    ],
    model: [
      'PROJECT_WIKI_GENERATOR_MODEL',
      'PROJECT_WIKI_SCAFFOLDER_MODEL',
    ],
  },
  reviewer: {
    provider: ['PROJECT_WIKI_REVIEWER_PROVIDER', 'PROJECT_WIKI_AGENT_PROVIDER'],
    model: ['PROJECT_WIKI_REVIEWER_MODEL'],
  },
  bulk: {
    provider: ['PROJECT_WIKI_BULK_PROVIDER', 'PROJECT_WIKI_AGENT_PROVIDER'],
    model: [],
  },
};

export function resolveProviderConfig(role, env = process.env) {
  if (!ROLE_ENV_KEYS[role]) {
    throw new Error(`unknown provider role "${role}"`);
  }
  const provider = firstSet(env, ROLE_ENV_KEYS[role].provider) || DEFAULT_PROVIDER_BY_ROLE[role];
  const model = firstSet(env, ROLE_ENV_KEYS[role].model) || '';
  return {
    role,
    provider: normalizeProvider(provider),
    model,
  };
}

export async function invoke(opts) {
  const {
    provider,
    prompt,
    model = '',
    thinkingLevel = '',
    systemPrompt = '',
    promptMode = 'inline',
    cwd = process.cwd(),
    env = process.env,
    logger = console,
    purpose = 'invoke',
  } = opts || {};

  if (typeof prompt !== 'string' || !prompt) {
    throw new Error('invoke requires a non-empty prompt');
  }

  const normalizedProvider = normalizeProvider(provider);
  const command = PROVIDER_BINARIES[normalizedProvider];
  const systemPromptPath = normalizedProvider === 'claude' && systemPrompt
    ? createSystemPromptFile(systemPrompt)
    : null;

  let invocation;
  try {
    invocation = buildInvocation({
      provider: normalizedProvider,
      model,
      thinkingLevel,
      prompt,
      systemPrompt,
      promptMode,
      systemPromptPath,
    });
    logger.log?.(
      `[providers] purpose=${purpose} provider=${normalizedProvider} binary=${command} mode=${promptMode}` +
        (model ? ` model=${model}` : ''),
    );
    const startedAt = process.hrtime.bigint();
    const stdout = await spawnAndCapture({
      command,
      args: invocation.args,
      stdinInput: invocation.stdinInput,
      closeStdin: invocation.closeStdin,
      cwd,
      env,
      provider: normalizedProvider,
    });
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    return {
      provider: normalizedProvider,
      command,
      args: invocation.args,
      stdout,
      exitCode: 0,
      durationMs,
    };
  } finally {
    if (systemPromptPath) {
      fs.rmSync(systemPromptPath, { force: true });
    }
  }
}

function firstSet(env, keys) {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function normalizeProvider(value) {
  const provider = String(value || '').trim().toLowerCase();
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new Error(
      `unsupported provider "${value}" (supported: ${SUPPORTED_PROVIDERS.join(', ')})`,
    );
  }
  return /** @type {Provider} */ (provider);
}

function createSystemPromptFile(systemPrompt) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-wiki-system-prompt-'));
  const filePath = path.join(dir, 'system-prompt.txt');
  fs.writeFileSync(filePath, systemPrompt, 'utf8');
  return filePath;
}

function buildInvocation({ provider, model, thinkingLevel, prompt, systemPrompt, promptMode, systemPromptPath }) {
  const renderedPrompt = systemPromptPath
    ? prompt
    : withInlineSystemPrompt(prompt, systemPrompt);
  const args = providerBaseArgs(provider, model, thinkingLevel);
  if (systemPromptPath) {
    args.push('--system-prompt-file', systemPromptPath);
  }

  if (promptMode === 'inline') {
    if (provider === 'claude') {
      return {
        args: [...args, renderedPrompt],
        stdinInput: '',
        closeStdin: true,
      };
    }
    if (provider === 'codex') {
      return {
        args: [...args, renderedPrompt],
        stdinInput: '',
        closeStdin: true,
      };
    }
    return {
      args: [...args, '--output-format', 'text', '-p', renderedPrompt],
      stdinInput: '',
      closeStdin: true,
    };
  }

  if (promptMode !== 'stdin') {
    throw new Error(`unsupported promptMode "${promptMode}"`);
  }

  if (provider === 'claude') {
    return {
      args,
      stdinInput: renderedPrompt,
      closeStdin: false,
    };
  }
  if (provider === 'codex') {
    return {
      args: [...args, '-'],
      stdinInput: renderedPrompt,
      closeStdin: false,
    };
  }
  return {
    args: [...args, '--output-format', 'text', '--final-message-only'],
    stdinInput: renderedPrompt,
    closeStdin: false,
  };
}

function withInlineSystemPrompt(prompt, systemPrompt) {
  if (!systemPrompt) return prompt;
  return `System instructions:\n${systemPrompt}\n\nUser request:\n${prompt}`;
}

function providerBaseArgs(provider, model, thinkingLevel) {
  if (provider === 'claude') {
    const args = [
      '--print',
      '--dangerously-skip-permissions',
      '--permission-mode',
      'bypassPermissions',
    ];
    if (model) args.push('--model', model);
    if (thinkingLevel) args.push('--effort', thinkingLevel);
    return args;
  }
  if (provider === 'codex') {
    const args = [
      'exec',
      '--dangerously-bypass-approvals-and-sandbox',
      '--skip-git-repo-check',
    ];
    if (model) args.push('-m', model);
    if (thinkingLevel) args.push('-c', `model_reasoning_effort=${JSON.stringify(thinkingLevel)}`);
    return args;
  }
  const args = ['--print'];
  if (model) args.push('-m', model);
  return args;
}

function spawnAndCapture({ command, args, stdinInput, closeStdin, cwd, env, provider }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (err) => {
      if (err?.code === 'ENOENT') {
        reject(new Error(`provider binary "${command}" not found on PATH for ${provider}`));
        return;
      }
      reject(err);
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `provider "${provider}" exited with code ${code}. stderr tail:\n${stderrTail(stderr)}`,
          ),
        );
        return;
      }
      resolve(stdout);
    });

    if (stdinInput) {
      child.stdin.write(stdinInput);
    }
    child.stdin.end();
    if (closeStdin && child.stdin.destroy) {
      child.stdin.destroy();
    }
  });
}

function stderrTail(stderr) {
  return stderr.trim().split(/\r?\n/).filter(Boolean).slice(-10).join('\n') || '(empty)';
}

const AI_PROXY_ALIASES = { haiku: 'claude-haiku-5-5', sonnet: 'claude-sonnet-5-5', opus: 'claude-opus-5-5' };

/**
 * Run a Claude selection through AI Proxy `/v1/chat` instead of the claude CLI,
 * so it is paid from the plan's monthly API credit (the proxy prices and caps
 * it). Text in, text out: the generator only needs the JSON page reply, and
 * the updater writes and commits pages itself.
 */
export async function invokeAiProxy({
  prompt,
  systemPrompt = '',
  model = '',
  thinkingLevel = '',
  env = process.env,
  logger = console,
  purpose = 'invoke',
  fetcher = fetch,
  timeoutMs = 330_000,
}) {
  const url = (env.PROJECT_WIKI_AI_PROXY_URL || 'http://127.0.0.1:3005').replace(/\/$/, '');
  const keyFile = env.PROJECT_WIKI_AI_PROXY_KEY_FILE ||
    path.join(os.homedir(), '.config/project-wiki/ai-proxy.key');
  const key = fs.readFileSync(keyFile, 'utf8').trim();
  const apiModel = AI_PROXY_ALIASES[model] || model || 'claude-haiku-5-5';
  logger.log?.(`[providers] purpose=${purpose} provider=claude transport=ai-proxy model=${apiModel}`);
  const startedAt = process.hrtime.bigint();
  const response = await fetcher(`${url}/v1/chat`, {
    method: 'POST',
    // The generator's model comes from its Agency row; keep proxy-side preferences out of it.
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', 'x-model-source': 'request' },
    body: JSON.stringify({
      model: apiModel,
      // Full page rewrites for several pages plus thinking overran 16000 and
      // came back as finish_reason length; Haiku and Sonnet 5.5 allow 128K.
      max_tokens: Number(env.PROJECT_WIKI_AI_PROXY_MAX_TOKENS) || 64_000,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      ...(thinkingLevel ? { reasoning_effort: thinkingLevel } : {}),
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`ai-proxy returned HTTP ${response.status}${data?.error?.code ? ` ${data.error.code}` : ''}`);
  }
  const choice = data.choices?.[0];
  const text = choice?.message?.content;
  if (choice?.finish_reason !== 'stop' || typeof text !== 'string' || !text.trim()) {
    throw new Error(`ai-proxy returned no usable text (finish_reason ${choice?.finish_reason})`);
  }
  return {
    provider: 'claude',
    transport: 'ai-proxy',
    command: 'POST /v1/chat',
    args: [],
    stdout: text,
    exitCode: 0,
    durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
    model: data.model || apiModel,
    usage: data.usage || {},
  };
}
