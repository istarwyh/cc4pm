#!/usr/bin/env node

const fs = require('fs');
const { spawnSync } = require('child_process');

const ROLE_PROFILES = Object.freeze({
  'gu-yan': Object.freeze({ label: '顾砚', voice: 'Tingting', rate: 175 }),
  'lin-zhi': Object.freeze({ label: '林栀', voice: 'Meijia', rate: 170 }),
  'wen-shu': Object.freeze({ label: '闻殊', voice: 'Sinji', rate: 165 }),
});

const SPEAKABLE_SUMMARY_PATTERN = /台词|反击|无法退出/;
const MESSAGE_BLOCK_PATTERN = /<teammate-message\b([^>]*)>([\s\S]*?)<\/teammate-message>/g;
const MAX_TEXT_LENGTH = 2000;
const CONTROL_ROLES = new Set(['system']);
const SECRET_PATTERNS = Object.freeze([
  { pattern: /\bsk-[A-Za-z0-9_-]{8,}\b/g, replacement: '[REDACTED_SECRET]' },
  { pattern: /\bgh[pousr]_[A-Za-z0-9_]{8,}\b/g, replacement: '[REDACTED_SECRET]' },
  { pattern: /\bAKIA[0-9A-Z]{12,}\b/g, replacement: '[REDACTED_SECRET]' },
  { pattern: /(["']?(?:api[_-]?key|token|password|secret)["']?\s*[:=]\s*)(["'][^"']+["']|[^\s,;}]+)/gi, replacement: '$1[REDACTED_SECRET]' },
]);

function writeStdout(value) {
  process.stdout.write(`${value}\n`);
}

function writeStderr(value) {
  process.stderr.write(`${value}\n`);
}

function showHelp() {
  writeStdout(`Usage:
  node scripts/theater-say.js <role> [text...] [--dry-run]
  node scripts/theater-say.js --from-message [--dry-run]
  node scripts/theater-say.js --list-roles [--json]

Roles:
  ${Object.keys(ROLE_PROFILES).join(', ')}

Options:
  --dry-run              Print the say invocation as JSON without speaking
  --from-message         Read a <teammate-message> block from stdin and speak it
  --voice <name>         Override the role voice
  --rate <number>        Override the role speech rate
  --list-roles           Print built-in role mappings
  --json                 Use JSON output for --list-roles
  --help                 Show this help`);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    fromMessage: false,
    help: false,
    json: false,
    listRoles: false,
    positionals: [],
    rate: null,
    voice: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--from-message') {
      options.fromMessage = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--list-roles') {
      options.listRoles = true;
    } else if (arg === '--voice') {
      index += 1;
      if (!argv[index]) throw new Error('--voice requires a value');
      options.voice = argv[index];
    } else if (arg === '--rate') {
      index += 1;
      if (!argv[index]) throw new Error('--rate requires a value');
      options.rate = parseRate(argv[index]);
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      options.positionals.push(arg);
    }
  }

  return options;
}

function parseRate(value) {
  const rate = Number(value);
  if (!Number.isInteger(rate) || rate < 1 || rate > 500) {
    throw new Error(`Invalid rate: ${value}`);
  }
  return rate;
}

function readStdin() {
  try {
    const input = fs.readFileSync(0, 'utf8');
    if (input.length > MAX_TEXT_LENGTH * 2) {
      throw new Error(`Input exceeds maximum length of ${MAX_TEXT_LENGTH * 2} characters`);
    }
    return input.trim();
  } catch (error) {
    if (error.code === 'EAGAIN') return '';
    throw error;
  }
}

function listRoles(asJson) {
  const roles = Object.entries(ROLE_PROFILES).map(([id, profile]) => ({
    id,
    label: profile.label,
    voice: profile.voice,
    rate: profile.rate,
  }));

  if (asJson) {
    writeStdout(JSON.stringify(roles, null, 2));
    return;
  }

  for (const role of roles) {
    writeStdout(`${role.id}\t${role.label}\t${role.voice}\t${role.rate}`);
  }
}

function parseAttributes(rawAttributes) {
  const attributes = {};
  const pattern = /(\w+)="([^"]*)"/g;
  let match = pattern.exec(rawAttributes);

  while (match) {
    attributes[match[1]] = match[2];
    match = pattern.exec(rawAttributes);
  }

  return attributes;
}

function parseMessageBlock(rawMessage) {
  MESSAGE_BLOCK_PATTERN.lastIndex = 0;
  const match = MESSAGE_BLOCK_PATTERN.exec(rawMessage);
  if (!match) {
    return parseJsonMessage(rawMessage);
  }

  const attributes = parseAttributes(match[1]);
  return {
    role: attributes.teammate_id || attributes.from || '',
    summary: attributes.summary || '',
    text: match[2].trim(),
  };
}

function parseJsonMessage(rawMessage) {
  const trimmed = rawMessage.trim();
  if (!trimmed) return null;

  try {
    const payload = JSON.parse(trimmed);
    return {
      role: payload.teammate_id || payload.from || payload.role || '',
      summary: payload.summary || '',
      text: payload.content || payload.message || payload.text || '',
      type: payload.type || '',
    };
  } catch (_error) {
    return null;
  }
}

function isJsonControlPayload(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) return false;

  try {
    const payload = JSON.parse(trimmed);
    return Boolean(payload.type && payload.type !== 'teammate_message');
  } catch (_error) {
    return false;
  }
}

function normalizeText(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

function redactSensitiveText(text) {
  return SECRET_PATTERNS.reduce(
    (currentText, { pattern, replacement }) => currentText.replace(pattern, replacement),
    text
  );
}

function enforceTextLength(text) {
  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
  }
}

function extractSpeakableMessage(rawMessage) {
  const message = parseMessageBlock(rawMessage);
  if (!message || !message.role || !message.text) {
    return { skipped: true, reason: 'non-speakable-message' };
  }

  if (message.type && message.type !== 'teammate_message') {
    return { skipped: true, reason: 'non-speakable-message' };
  }

  if (CONTROL_ROLES.has(message.role)) {
    return { skipped: true, reason: 'non-speakable-message' };
  }

  if (!ROLE_PROFILES[message.role]) {
    return { skipped: true, reason: 'unknown-role' };
  }

  if (isJsonControlPayload(message.text)) {
    return { skipped: true, reason: 'non-speakable-message' };
  }

  if (!message.summary || !SPEAKABLE_SUMMARY_PATTERN.test(message.summary)) {
    return { skipped: true, reason: 'non-speakable-message' };
  }

  const text = redactSensitiveText(normalizeText(message.text));
  if (!text) {
    return { skipped: true, reason: 'non-speakable-message' };
  }
  enforceTextLength(text);

  return {
    role: message.role,
    text,
  };
}

function buildInvocation(role, text, options) {
  const profile = ROLE_PROFILES[role];
  if (!profile) {
    throw new Error(`Unknown role: ${role}. Available roles: ${Object.keys(ROLE_PROFILES).join(', ')}`);
  }

  const normalizedText = redactSensitiveText(normalizeText(text));
  if (!normalizedText) {
    throw new Error('Text is required');
  }
  enforceTextLength(normalizedText);

  return {
    role,
    label: profile.label,
    voice: options.voice || profile.voice,
    rate: options.rate || profile.rate,
    text: normalizedText,
  };
}

function speak(invocation, dryRun) {
  if (dryRun) {
    writeStdout(JSON.stringify(invocation, null, 2));
    return 0;
  }

  if (process.platform !== 'darwin') {
    throw new Error('macOS say is only available on darwin');
  }

  const result = spawnSync('say', [
    '-v', invocation.voice,
    '-r', String(invocation.rate),
    invocation.text,
  ], {
    stdio: 'inherit',
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      throw new Error('macOS say command not found');
    }
    throw result.error;
  }

  if (typeof result.status === 'number') {
    return result.status;
  }

  if (result.signal) {
    throw new Error(`say terminated by signal ${result.signal}`);
  }

  return 1;
}

function handleDirect(options) {
  const [role, ...textParts] = options.positionals;
  if (!role) {
    throw new Error('Role is required');
  }

  const text = textParts.length > 0 ? textParts.join(' ') : readStdin();
  return speak(buildInvocation(role, text, options), options.dryRun);
}

function handleMessage(options, rawMessage) {
  const extracted = extractSpeakableMessage(rawMessage);
  if (extracted.skipped) {
    if (options.dryRun) writeStdout(JSON.stringify(extracted, null, 2));
    return 0;
  }

  return speak(buildInvocation(extracted.role, extracted.text, options), options.dryRun);
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      showHelp();
      return;
    }

    if (options.listRoles) {
      listRoles(options.json);
      return;
    }

    if (options.fromMessage) {
      process.exitCode = handleMessage(options, readStdin());
      return;
    }

    process.exitCode = handleDirect(options);
  } catch (error) {
    writeStderr(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  ROLE_PROFILES,
  buildInvocation,
  extractSpeakableMessage,
};
