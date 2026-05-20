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

function buildInvocation({ provider, model, prompt, systemPrompt, promptMode, systemPromptPath }) {
  const renderedPrompt = systemPromptPath
    ? prompt
    : withInlineSystemPrompt(prompt, systemPrompt);
  const args = providerBaseArgs(provider, model);
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

function providerBaseArgs(provider, model) {
  if (provider === 'claude') {
    const args = [
      '--print',
      '--dangerously-skip-permissions',
      '--permission-mode',
      'bypassPermissions',
    ];
    if (model) args.push('--model', model);
    return args;
  }
  if (provider === 'codex') {
    const args = [
      'exec',
      '--dangerously-bypass-approvals-and-sandbox',
      '--skip-git-repo-check',
    ];
    if (model) args.push('-m', model);
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
