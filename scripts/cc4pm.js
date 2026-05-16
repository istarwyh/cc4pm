#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const { listAvailableLanguages } = require('./lib/install-executor');

const COMMANDS = {
  install: {
    script: 'install-apply.js',
    description: 'Install cc4pm content into a supported target',
  },
  plan: {
    script: 'install-plan.js',
    description: 'Inspect selective-install manifests and resolved plans',
  },
  'install-plan': {
    script: 'install-plan.js',
    description: 'Alias for plan',
  },
  'list-installed': {
    script: 'list-installed.js',
    description: 'Inspect install-state files for the current context',
  },
  doctor: {
    script: 'doctor.js',
    description: 'Diagnose missing or drifted cc4pm-managed files',
  },
  repair: {
    script: 'repair.js',
    description: 'Restore drifted or missing cc4pm-managed files',
  },
  'session-inspect': {
    script: 'session-inspect.js',
    description: 'Emit canonical cc4pm session snapshots from dmux or Claude history targets',
  },
  uninstall: {
    script: 'uninstall.js',
    description: 'Remove cc4pm-managed files recorded in install-state',
  },
};

const PRIMARY_COMMANDS = [
  'install',
  'plan',
  'list-installed',
  'doctor',
  'repair',
  'session-inspect',
  'uninstall',
];

function showHelp(exitCode = 0) {
  console.log(`
cc4pm — Claude Code 交互式课件安装 CLI

Usage:
  cc4pm <command> [args...]
  cc4pm [install args...]

Commands:
${PRIMARY_COMMANDS.map(command => `  ${command.padEnd(15)} ${COMMANDS[command].description}`).join('\n')}

Compatibility:
  cc4pm [args...]    Without a command, args are routed to "install"
  cc4pm help <command> Show help for a specific command

Examples:
  cc4pm install --modules cc4pm-guide
  cc4pm install --modules cc4pm-guide --dry-run
  cc4pm plan --modules cc4pm-guide --target claude
  cc4pm list-installed --json
  cc4pm doctor --target claude
  cc4pm uninstall --target claude --dry-run
`);

  process.exit(exitCode);
}

function resolveCommand(argv) {
  const args = argv.slice(2);

  if (args.length === 0) {
    return { mode: 'help' };
  }

  const [firstArg, ...restArgs] = args;

  if (firstArg === '--help' || firstArg === '-h') {
    return { mode: 'help' };
  }

  if (firstArg === 'help') {
    return {
      mode: 'help-command',
      command: restArgs[0] || null,
    };
  }

  if (COMMANDS[firstArg]) {
    return {
      mode: 'command',
      command: firstArg,
      args: restArgs,
    };
  }

  const knownLegacyLanguages = listAvailableLanguages();
  const shouldTreatAsImplicitInstall = (
    firstArg.startsWith('-')
    || knownLegacyLanguages.includes(firstArg)
  );

  if (!shouldTreatAsImplicitInstall) {
    throw new Error(`Unknown command: ${firstArg}`);
  }

  return {
    mode: 'command',
    command: 'install',
    args,
  };
}

function runCommand(commandName, args) {
  const command = COMMANDS[commandName];
  if (!command) {
    throw new Error(`Unknown command: ${commandName}`);
  }

  const parentIsTTY = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const spawnOptions = parentIsTTY
    ? {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
      }
    : {
        cwd: process.cwd(),
        env: process.env,
        encoding: 'utf8',
      };

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, command.script), ...args],
    spawnOptions
  );

  if (result.error) {
    throw result.error;
  }

  if (!parentIsTTY) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (typeof result.status === 'number') {
    return result.status;
  }

  if (result.signal) {
    throw new Error(`Command "${commandName}" terminated by signal ${result.signal}`);
  }

  return 1;
}

function main() {
  try {
    const resolution = resolveCommand(process.argv);

    if (resolution.mode === 'help') {
      showHelp(0);
    }

    if (resolution.mode === 'help-command') {
      if (!resolution.command) {
        showHelp(0);
      }

      if (!COMMANDS[resolution.command]) {
        throw new Error(`Unknown command: ${resolution.command}`);
      }

      process.exitCode = runCommand(resolution.command, ['--help']);
      return;
    }

    process.exitCode = runCommand(resolution.command, resolution.args);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
