#!/usr/bin/env node
/**
 * cc4pm Guide QMD Check
 *
 * Detects QMD installation status, indexed collections, and MCP configuration.
 * Called by the cc4pm-guide skill on startup to enable search-enhanced teaching.
 *
 * Output: JSON to stdout
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findQmdPath() {
  // 1. Check if qmd is on the current PATH
  try {
    const check = process.platform === 'win32' ? 'where' : 'which';
    const result = spawnSync(check, ['qmd'], { stdio: 'pipe' });
    if (result.status === 0) return 'qmd';
  } catch { /* not on PATH */ }

  // 2. Search nvm node versions (common case: qmd installed under a different node version)
  const nvmDir = process.env.NVM_DIR || path.join(process.env.HOME || '', '.nvm');
  const versionsDir = path.join(nvmDir, 'versions', 'node');
  try {
    for (const ver of fs.readdirSync(versionsDir)) {
      const candidate = path.join(versionsDir, ver, 'bin', 'qmd');
      if (fs.existsSync(candidate)) return candidate;
    }
  } catch { /* nvm not installed or no versions */ }

  // 3. Check common global install locations
  const globalCandidates = [
    '/usr/local/bin/qmd',
    path.join(process.env.HOME || '', '.local', 'bin', 'qmd'),
  ];
  for (const c of globalCandidates) {
    if (fs.existsSync(c)) return c;
  }

  return null;
}

let qmdBin = null; // resolved path, set by main()

function runQmd(args) {
  // qmd may need its own node version's environment to run correctly.
  // If qmd is an absolute path under nvm, we need to set PATH to include
  // that node version's bin directory so qmd's internal node modules resolve.
  const env = { ...process.env };
  if (qmdBin && qmdBin !== 'qmd' && qmdBin.includes('.nvm')) {
    const binDir = path.dirname(qmdBin);
    env.PATH = binDir + path.delimiter + (env.PATH || '');
  }
  return spawnSync(qmdBin, args, { stdio: 'pipe', timeout: 10000, env });
}

function getCollections() {
  try {
    const result = runQmd(['collection', 'list']);
    if (result.status !== 0) return [];
    const output = result.stdout.toString();
    // Parse collection names from output lines like "  name (qmd://name/)"
    const collections = [];
    for (const line of output.split('\n')) {
      const match = line.match(/^\s*(\S+)\s+\(qmd:\/\//);
      if (match) collections.push(match[1]);
    }
    return collections;
  } catch {
    return [];
  }
}

function checkMcpConfigured() {
  // Check ~/.claude.json (legacy) and ~/.claude/settings.json
  const candidates = [
    path.join(process.env.HOME || '', '.claude.json'),
    path.join(process.env.HOME || '', '.claude', 'settings.json'),
    path.join(process.env.HOME || '', '.claude', 'settings.local.json'),
  ];

  for (const file of candidates) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const json = JSON.parse(content);
      if (json.mcpServers && json.mcpServers.qmd) return true;
    } catch {
      // File doesn't exist or isn't valid JSON
    }
  }

  // Also check project-level .claude/settings.local.json
  try {
    const projectSettings = path.join(process.cwd(), '.claude', 'settings.local.json');
    const content = fs.readFileSync(projectSettings, 'utf-8');
    const json = JSON.parse(content);
    if (json.mcpServers && json.mcpServers.qmd) return true;
  } catch {
    // Not configured at project level
  }

  return false;
}

function main() {
  qmdBin = findQmdPath();

  if (!qmdBin) {
    console.log(JSON.stringify({
      installed: false,
      hasCollections: false,
      mcpConfigured: false,
      collections: [],
      suggestion: 'qmd_not_installed',
    }));
    return;
  }

  const collections = getCollections();
  const mcpConfigured = checkMcpConfigured();

  let suggestion;
  if (mcpConfigured && collections.length > 0) {
    suggestion = 'ready';
  } else if (!mcpConfigured && collections.length > 0) {
    suggestion = 'configure_mcp';
  } else if (mcpConfigured && collections.length === 0) {
    suggestion = 'add_collections';
  } else {
    suggestion = 'setup_needed';
  }

  console.log(JSON.stringify({
    installed: true,
    qmdPath: qmdBin,
    hasCollections: collections.length > 0,
    mcpConfigured,
    collections,
    suggestion,
  }));
}

main();
