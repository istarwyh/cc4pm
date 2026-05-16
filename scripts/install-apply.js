#!/usr/bin/env node
/**
 * Refactored cc4pm installer runtime.
 *
 * Keeps the legacy language-based install entrypoint intact while moving
 * target-specific mutation logic into testable Node code.
 */

const {
  SUPPORTED_INSTALL_TARGETS,
  listAvailableLanguages,
} = require('./lib/install-executor');
const {
  LEGACY_INSTALL_TARGETS,
  normalizeInstallRequest,
  parseInstallArgs,
} = require('./lib/install/request');
const { loadInstallConfig } = require('./lib/install/config');
const { applyInstallPlan } = require('./lib/install/apply');
const { createInstallPlanFromRequest } = require('./lib/install/runtime');
const {
  isInteractiveSession,
  runInteractiveSelection,
} = require('./lib/install/interactive');

function showHelp(exitCode = 0) {
  const languages = listAvailableLanguages();

  console.log(`
Usage: cc4pm install                                  # interactive selection (TTY required)
       cc4pm install [--target <${SUPPORTED_INSTALL_TARGETS.join('|')}>] [--dry-run] [--json] --modules <id,id,...> [--with <component>]... [--without <component>]...
       cc4pm install [--target <${SUPPORTED_INSTALL_TARGETS.join('|')}>] [--dry-run] [--json] --profile <name> [--with <component>]... [--without <component>]...
       cc4pm install [--dry-run] [--json] --config <path>
       cc4pm install [--target <${LEGACY_INSTALL_TARGETS.join('|')}>] [--dry-run] [--json] <language> [<language> ...]    # legacy

Targets:
  claude       (default) - Install rules to ~/.claude/rules/
  cursor       - Install rules, hooks, and bundled Cursor configs to ./.cursor/
  antigravity  - Install rules, workflows, skills, and agents to ./.agent/

Options:
  --profile <name>    Resolve and install a manifest profile
  --modules <ids>     Resolve and install explicit module IDs
  --with <component>  Include a user-facing install component
  --without <component>
                      Exclude a user-facing install component
  --config <path>     Load install intent from cc4pm-install.json
  --dry-run    Show the install plan without copying files
  --json       Emit machine-readable plan/result JSON
  --help       Show this help text

Available languages:
${languages.map(language => `  - ${language}`).join('\n')}
`);

  process.exit(exitCode);
}

function printHumanPlan(plan, dryRun) {
  console.log(`${dryRun ? 'Dry-run install plan' : 'Applying install plan'}:\n`);
  console.log(`Mode: ${plan.mode}`);
  console.log(`Target: ${plan.target}`);
  console.log(`Adapter: ${plan.adapter.id}`);
  console.log(`Install root: ${plan.installRoot}`);
  console.log(`Install-state: ${plan.installStatePath}`);
  if (plan.mode === 'legacy') {
    console.log(`Languages: ${plan.languages.join(', ')}`);
  } else {
    console.log(`Profile: ${plan.profileId || '(custom modules)'}`);
    console.log(`Included components: ${plan.includedComponentIds.join(', ') || '(none)'}`);
    console.log(`Excluded components: ${plan.excludedComponentIds.join(', ') || '(none)'}`);
    console.log(`Requested modules: ${plan.requestedModuleIds.join(', ') || '(none)'}`);
    console.log(`Selected modules: ${plan.selectedModuleIds.join(', ') || '(none)'}`);
    if (plan.skippedModuleIds.length > 0) {
      console.log(`Skipped modules: ${plan.skippedModuleIds.join(', ')}`);
    }
    if (plan.excludedModuleIds.length > 0) {
      console.log(`Excluded modules: ${plan.excludedModuleIds.join(', ')}`);
    }
  }
  console.log(`Operations: ${plan.operations.length}`);

  if (plan.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of plan.warnings) {
      console.log(`- ${warning}`);
    }
  }

  console.log('\nPlanned file operations:');
  for (const operation of plan.operations) {
    console.log(`- ${operation.sourceRelativePath} -> ${operation.destinationPath}`);
  }

  if (!dryRun) {
    console.log(`\nDone. Install-state written to ${plan.installStatePath}`);
  }
}

function hasExplicitSelection(options, config) {
  if (options.profileId || (options.moduleIds && options.moduleIds.length > 0)) return true;
  if (options.includeComponentIds && options.includeComponentIds.length > 0) return true;
  if (options.languages && options.languages.length > 0) return true;
  if (config && (config.profileId || (config.moduleIds && config.moduleIds.length > 0)
    || (config.includeComponentIds && config.includeComponentIds.length > 0))) return true;
  return false;
}

async function main() {
  try {
    const options = parseInstallArgs(process.argv);

    if (options.help) {
      showHelp(0);
    }

    const config = options.configPath
      ? loadInstallConfig(options.configPath, { cwd: process.cwd() })
      : null;

    if (!hasExplicitSelection(options, config) && !options.json && isInteractiveSession()) {
      const selection = await runInteractiveSelection();
      if (selection.type === 'cancel') {
        return;
      }
      if (selection.type === 'selection') {
        options.profileId = options.profileId || selection.profileId;
        options.moduleIds = [...(options.moduleIds || []), ...selection.moduleIds];
        options.includeComponentIds = [
          ...(options.includeComponentIds || []),
          ...selection.includeComponentIds,
        ];
      }
    }

    const request = normalizeInstallRequest({
      ...options,
      config,
    });
    const plan = createInstallPlanFromRequest(request, {
      projectRoot: process.cwd(),
      homeDir: process.env.HOME,
      claudeRulesDir: process.env.CLAUDE_RULES_DIR || null,
    });

    if (options.dryRun) {
      if (options.json) {
        console.log(JSON.stringify({ dryRun: true, plan }, null, 2));
      } else {
        printHumanPlan(plan, true);
      }
      return;
    }

    const result = applyInstallPlan(plan);
    if (options.json) {
      console.log(JSON.stringify({ dryRun: false, result }, null, 2));
    } else {
      printHumanPlan(result, false);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
