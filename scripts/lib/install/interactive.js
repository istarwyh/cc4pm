'use strict';

const readline = require('readline');

const {
  listInstallProfiles,
  listInstallModules,
} = require('../install-manifests');

function isInteractiveStream(stream) {
  return Boolean(stream && stream.isTTY);
}

function isInteractiveSession({ stdin = process.stdin, stdout = process.stdout } = {}) {
  return isInteractiveStream(stdin) && isInteractiveStream(stdout);
}

function formatModuleLine(module, index) {
  const tags = [];
  if (module.defaultInstall) tags.push('default');
  if (module.cost) tags.push(`cost=${module.cost}`);
  if (module.stability) tags.push(`stability=${module.stability}`);
  const tagSuffix = tags.length > 0 ? ` (${tags.join(', ')})` : '';
  const description = module.description ? `\n     ${module.description}` : '';
  return `  ${index + 1}) ${module.id}${tagSuffix}${description}`;
}

function formatProfileLine(profile, index) {
  const description = profile.description ? `\n     ${profile.description}` : '';
  return `  ${index + 1}) ${profile.id} (${profile.moduleCount} modules)${description}`;
}

function parseSelection(input, max) {
  const trimmed = String(input == null ? '' : input).trim().toLowerCase();
  if (!trimmed) {
    return { type: 'empty' };
  }
  if (trimmed === 'a' || trimmed === 'all' || trimmed === '*') {
    return { type: 'indices', indices: Array.from({ length: max }, (_, i) => i) };
  }
  if (trimmed === 'q' || trimmed === 'quit' || trimmed === 'cancel' || trimmed === 'exit') {
    return { type: 'cancel' };
  }

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  const indices = [];
  for (const token of tokens) {
    const value = Number.parseInt(token, 10);
    if (!Number.isFinite(value) || value < 1 || value > max) {
      return { type: 'invalid', token };
    }
    if (!indices.includes(value - 1)) {
      indices.push(value - 1);
    }
  }
  if (indices.length === 0) {
    return { type: 'invalid', token: trimmed };
  }
  return { type: 'indices', indices };
}

function parseYesNo(input, defaultYes = true) {
  const trimmed = String(input == null ? '' : input).trim().toLowerCase();
  if (!trimmed) return defaultYes;
  if (['y', 'yes'].includes(trimmed)) return true;
  if (['n', 'no'].includes(trimmed)) return false;
  return defaultYes;
}

function createPrompter({ stdin, stdout } = {}) {
  const rl = readline.createInterface({
    input: stdin || process.stdin,
    output: stdout || process.stdout,
    terminal: true,
  });
  function ask(question) {
    return new Promise(resolve => {
      rl.question(question, answer => resolve(answer));
    });
  }
  return {
    ask,
    close: () => rl.close(),
  };
}

async function runInteractiveSelection({
  stdin = process.stdin,
  stdout = process.stdout,
  manifestOptions = {},
} = {}) {
  if (!isInteractiveSession({ stdin, stdout })) {
    return { type: 'non-interactive' };
  }

  const profiles = listInstallProfiles(manifestOptions);
  const modules = listInstallModules(manifestOptions);

  if (profiles.length === 0 && modules.length === 0) {
    return { type: 'empty-catalog' };
  }

  const write = line => stdout.write(`${line}\n`);
  const { ask, close } = createPrompter({ stdin, stdout });

  try {
    write('');
    write('cc4pm interactive install');
    write('-------------------------');

    if (profiles.length > 0) {
      write('\nAvailable profiles:');
      profiles.forEach((profile, index) => write(formatProfileLine(profile, index)));
    }

    if (modules.length > 0) {
      write(`\nAvailable modules${profiles.length > 0 ? '' : ' (pick by number, comma-separated)'}:`);
      modules.forEach((module, index) => write(formatModuleLine(module, index)));
    }

    write('');
    let pickHint;
    if (profiles.length > 0 && modules.length > 0) {
      pickHint = 'Enter "p<num>" for a profile, numbers for modules ("1,2" or "all"), or "q" to cancel';
    } else if (profiles.length > 0) {
      pickHint = 'Enter a profile number (e.g. "1") or "q" to cancel';
    } else {
      pickHint = 'Enter module number(s) (e.g. "1", "1,2", "all") or "q" to cancel';
    }

    const defaultModules = modules.filter(m => m.defaultInstall).map(m => m.id);
    const defaultLabel = defaultModules.length > 0 ? ` [default: ${defaultModules.join(', ')}]` : '';

    while (true) {
      const answer = await ask(`${pickHint}${defaultLabel}: `);
      const trimmed = String(answer || '').trim();

      if (!trimmed && defaultModules.length > 0) {
        const confirmed = await confirmSelection({
          ask,
          stdout,
          summary: `Install module(s): ${defaultModules.join(', ')}`,
        });
        if (!confirmed) {
          write('Cancelled.');
          return { type: 'cancel' };
        }
        return {
          type: 'selection',
          profileId: null,
          moduleIds: defaultModules,
          includeComponentIds: [],
        };
      }

      if (/^p\d+$/i.test(trimmed) && profiles.length > 0) {
        const profileIndex = Number.parseInt(trimmed.slice(1), 10) - 1;
        if (profileIndex < 0 || profileIndex >= profiles.length) {
          write(`Invalid profile number: ${trimmed}`);
          continue;
        }
        const profile = profiles[profileIndex];
        const confirmed = await confirmSelection({
          ask,
          stdout,
          summary: `Install profile: ${profile.id} (${profile.moduleCount} modules)`,
        });
        if (!confirmed) {
          write('Cancelled.');
          return { type: 'cancel' };
        }
        return {
          type: 'selection',
          profileId: profile.id,
          moduleIds: [],
          includeComponentIds: [],
        };
      }

      const parsed = parseSelection(trimmed, modules.length);
      if (parsed.type === 'cancel') {
        write('Cancelled.');
        return { type: 'cancel' };
      }
      if (parsed.type === 'empty') {
        write('Please enter a selection.');
        continue;
      }
      if (parsed.type === 'invalid') {
        write(`Invalid selection: ${parsed.token}. Use numbers in 1-${modules.length}, "all", or "q".`);
        continue;
      }
      const moduleIds = parsed.indices.map(i => modules[i].id);
      const confirmed = await confirmSelection({
        ask,
        stdout,
        summary: `Install module(s): ${moduleIds.join(', ')}`,
      });
      if (!confirmed) {
        write('Cancelled.');
        return { type: 'cancel' };
      }
      return {
        type: 'selection',
        profileId: null,
        moduleIds,
        includeComponentIds: [],
      };
    }
  } finally {
    close();
  }
}

async function confirmSelection({ ask, stdout, summary }) {
  stdout.write(`\n${summary}\n`);
  const answer = await ask('Proceed? [Y/n]: ');
  return parseYesNo(answer, true);
}

module.exports = {
  isInteractiveSession,
  formatModuleLine,
  formatProfileLine,
  parseSelection,
  parseYesNo,
  runInteractiveSelection,
};
