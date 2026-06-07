#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const DEFAULT_ROLE_MAP = Object.freeze({
  'live-garcin': 'garcin',
  'live-ines': 'ines',
  'live-estelle': 'estelle',
  garcin: 'garcin',
  ines: 'ines',
  estelle: 'estelle',
});

const DEFAULT_SUMMARY_PATTERN = /台词|反击|无法退出/;
const MAX_INBOX_BYTES = 1024 * 1024;
const MAX_MESSAGES_PER_BATCH = 200;
const MAX_SPEAKABLE_PER_BATCH = 20;
const MAX_INBOX_MESSAGES = 1000;
const MAX_SEEN_FINGERPRINTS = 2000;
const NOFOLLOW_FLAG = fs.constants.O_NOFOLLOW || 0;
const TEAM_NAME_PATTERN = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,63}$/;

function writeStdout(value) {
  process.stdout.write(`${value}\n`);
}

function writeStderr(value) {
  process.stderr.write(`${value}\n`);
}

function showHelp() {
  writeStdout(`Usage:
  node scripts/theater-monitor.js --team <team-name> [--dry-run]
  node scripts/theater-monitor.js --inbox <path> [--dry-run]

Options:
  --team <name>       Read ~/.claude/teams/<name>/inboxes/team-lead.json
  --inbox <path>      Read a specific team-lead inbox JSON file
  --map a=b,c=d       Map teammate names to theater-say roles
  --summaries <csv>   Speak only summaries containing these terms
  --interval <ms>     Poll interval for continuous mode (default: 500)
  --once              Process one batch and exit
  --replay            With --once or continuous mode, include existing messages
  --dry-run           Pass --dry-run to theater-say
  --help              Show this help`);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    help: false,
    inbox: null,
    interval: 500,
    once: false,
    replay: false,
    roleMap: { ...DEFAULT_ROLE_MAP },
    summaryPattern: DEFAULT_SUMMARY_PATTERN,
    team: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--inbox') {
      index += 1;
      if (!argv[index]) throw new Error('--inbox requires a path');
      options.inbox = argv[index];
    } else if (arg === '--interval') {
      index += 1;
      options.interval = parseInterval(argv[index]);
    } else if (arg === '--map') {
      index += 1;
      if (!argv[index]) throw new Error('--map requires value');
      options.roleMap = { ...options.roleMap, ...parseRoleMap(argv[index]) };
    } else if (arg === '--once') {
      options.once = true;
    } else if (arg === '--replay') {
      options.replay = true;
    } else if (arg === '--summaries') {
      index += 1;
      if (!argv[index]) throw new Error('--summaries requires value');
      options.summaryPattern = parseSummaryPattern(argv[index]);
    } else if (arg === '--team') {
      index += 1;
      if (!argv[index]) throw new Error('--team requires a name');
      options.team = validateTeamName(argv[index]);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function validateTeamName(value) {
  if (!TEAM_NAME_PATTERN.test(value) || value.includes('..')) {
    throw new Error(`Invalid team name: ${value}`);
  }
  return value;
}

function parseInterval(value) {
  const interval = Number(value);
  if (!Number.isInteger(interval) || interval < 100) {
    throw new Error(`Invalid interval: ${value}`);
  }
  return interval;
}

function parseRoleMap(value) {
  return value.split(',').filter(Boolean).reduce((roleMap, pair) => {
    const [from, role] = pair.split('=');
    if (!from || !role) {
      throw new Error(`Invalid role map entry: ${pair}`);
    }
    return {
      ...roleMap,
      [from.trim()]: role.trim(),
    };
  }, {});
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseSummaryPattern(value) {
  const terms = value.split(',').map(term => term.trim()).filter(Boolean);
  if (terms.length === 0) {
    throw new Error('--summaries requires at least one term');
  }
  return new RegExp(terms.map(escapeRegExp).join('|'));
}

function resolveInboxPath(options) {
  if (options.inbox) return path.resolve(options.inbox);
  if (!options.team) {
    throw new Error('Either --team or --inbox is required');
  }
  return path.join(os.homedir(), '.claude', 'teams', options.team, 'inboxes', 'team-lead.json');
}

function readInbox(inboxPath) {
  if (!fs.existsSync(inboxPath)) {
    throw new Error(`Inbox not found: ${inboxPath}`);
  }

  let fd;
  try {
    fd = fs.openSync(inboxPath, fs.constants.O_RDONLY | NOFOLLOW_FLAG);
  } catch (error) {
    if (error.code === 'ELOOP') {
      throw new Error(`Inbox must not be a symlink: ${inboxPath}`);
    }
    throw error;
  }

  try {
    const stats = fs.fstatSync(fd);
    if (!stats.isFile()) {
      throw new Error(`Inbox is not a file: ${inboxPath}`);
    }
    if (stats.size > MAX_INBOX_BYTES) {
      throw new Error(`Inbox exceeds maximum size of ${MAX_INBOX_BYTES} bytes`);
    }

    const raw = fs.readFileSync(fd, 'utf8').trim();
    if (!raw) return [];

    const messages = JSON.parse(raw);
    if (!Array.isArray(messages)) {
      throw new Error('Inbox JSON must be an array');
    }
    if (messages.length > MAX_INBOX_MESSAGES) {
      throw new Error(`Inbox exceeds maximum message count of ${MAX_INBOX_MESSAGES}`);
    }
    return messages;
  } finally {
    fs.closeSync(fd);
  }
}

function isControlMessage(message) {
  const text = String(message.text || '').trim();
  if (!text.startsWith('{')) return false;

  try {
    const payload = JSON.parse(text);
    return Boolean(payload.type && payload.type !== 'teammate_message');
  } catch (_error) {
    return false;
  }
}

function toSpeakablePayload(message, options) {
  const type = String(message.type || 'teammate_message');
  if (type !== 'teammate_message') return null;

  const from = String(message.from || '');
  const role = options.roleMap[from];
  if (!role) return null;

  if (isControlMessage(message)) return null;

  const summary = String(message.summary || '');
  if (!summary || !options.summaryPattern.test(summary)) return null;

  const text = String(message.text || '').trim();
  if (!text) return null;

  return {
    type: 'teammate_message',
    role,
    summary,
    text,
  };
}

function speakPayload(payload, options) {
  const args = [path.join(__dirname, 'theater-say.js'), '--from-message'];
  if (options.dryRun) args.push('--dry-run');

  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    input: JSON.stringify(payload),
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`theater-say exited with status ${result.status}`);
  }
}

function messageFingerprint(message) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({
      from: message.from || '',
      summary: message.summary || '',
      text: message.text || '',
      timestamp: message.timestamp || '',
      type: message.type || '',
    }))
    .digest('hex');
}

function rememberSeen(seen, fingerprint) {
  seen.add(fingerprint);
  while (seen.size > MAX_SEEN_FINGERPRINTS) {
    const oldest = seen.values().next().value;
    seen.delete(oldest);
  }
}

function createSeenSet(messages) {
  return messages.reduce((seen, message) => {
    rememberSeen(seen, messageFingerprint(message));
    return seen;
  }, new Set());
}

function processMessages(messages, options, startIndex) {
  let processed = 0;
  const endIndex = Math.min(messages.length, startIndex + MAX_MESSAGES_PER_BATCH);

  for (let index = startIndex; index < endIndex; index += 1) {
    const payload = toSpeakablePayload(messages[index], options);
    if (!payload) continue;
    speakPayload(payload, options);
    processed += 1;

    if (processed >= MAX_SPEAKABLE_PER_BATCH) {
      return {
        nextIndex: index + 1,
        processed,
      };
    }
  }

  return {
    nextIndex: endIndex,
    processed,
  };
}

function processUnseenMessages(messages, options, seen) {
  let processed = 0;
  let scanned = 0;

  for (const message of messages) {
    if (scanned >= MAX_MESSAGES_PER_BATCH) break;

    const fingerprint = messageFingerprint(message);
    if (seen.has(fingerprint)) continue;

    scanned += 1;
    const payload = toSpeakablePayload(message, options);
    if (!payload) {
      rememberSeen(seen, fingerprint);
      continue;
    }

    speakPayload(payload, options);
    rememberSeen(seen, fingerprint);
    processed += 1;

    if (processed >= MAX_SPEAKABLE_PER_BATCH) break;
  }

  return { processed };
}

function runOnce(options, inboxPath) {
  const messages = readInbox(inboxPath);
  const startIndex = options.replay ? 0 : messages.length;
  processMessages(messages, options, startIndex);
}

function runContinuous(options, inboxPath) {
  const seen = options.replay ? new Set() : createSeenSet(readInbox(inboxPath));
  writeStdout(`Watching inbox: ${inboxPath}`);

  setInterval(() => {
    try {
      processUnseenMessages(readInbox(inboxPath), options, seen);
    } catch (error) {
      writeStderr(`Monitor error: ${error.message}`);
    }
  }, options.interval);
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      showHelp();
      return;
    }

    const inboxPath = resolveInboxPath(options);
    if (options.once) {
      runOnce(options, inboxPath);
      return;
    }

    runContinuous(options, inboxPath);
  } catch (error) {
    writeStderr(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createSeenSet,
  messageFingerprint,
  processUnseenMessages,
  readInbox,
  toSpeakablePayload,
};
