#!/usr/bin/env bash
set -euo pipefail

# Prepare a release commit. Merge its PR before tagging the verified main commit.
# Usage: ./scripts/release.sh VERSION
VERSION="${1:-}"
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Usage: $0 VERSION (for example, 2.0.7)" >&2
  exit 1
fi
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Start from an up-to-date main checkout." >&2
  exit 1
fi
if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "Working tree is not clean. Commit your changes before preparing a release." >&2
  exit 1
fi
if git show-ref --verify --quiet "refs/tags/v$VERSION"; then
  echo "Tag v$VERSION already exists." >&2
  exit 1
fi

# Validate before creating a branch or touching any manifests.
node - "$VERSION" <<'NODE'
const fs = require('node:fs');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const current = read('package.json').version;
const next = process.argv[2].split('.').map(Number);
const previous = current.split('.').map(Number);
const changed = next.findIndex((value, index) => value !== previous[index]);
if (changed < 0 || next[changed] < previous[changed]) throw new Error(`Version must be greater than ${current}`);
read('package-lock.json');
read('.claude-plugin/plugin.json');
read('packages/homepage/package.json');
if (!read('.claude-plugin/marketplace.json').plugins.some(plugin => plugin.name === 'cc4pm')) throw new Error('Marketplace is missing cc4pm');
NODE

git switch -c "codex/release-v$VERSION"
# Structured JSON updates work identically on macOS and Linux.
node - "$VERSION" <<'NODE'
const fs = require('node:fs');
const update = (file, mutate) => {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  mutate(value);
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
const version = process.argv[2];
update('.claude-plugin/plugin.json', plugin => { plugin.version = version; });
update('.claude-plugin/marketplace.json', marketplace => {
  marketplace.plugins.find(plugin => plugin.name === 'cc4pm').version = version;
});
NODE
npm version "$VERSION" --no-git-tag-version --ignore-scripts
npm --prefix packages/homepage version patch --no-git-tag-version --ignore-scripts
npm run build:homepage

git add package.json package-lock.json .claude-plugin/plugin.json .claude-plugin/marketplace.json packages/homepage/package.json packages/homepage/index.html
git commit -m "chore: prepare release v$VERSION"
cat <<NEXT
Prepared codex/release-v$VERSION. Next:
  npm run site:check
  git push -u origin codex/release-v$VERSION
  gh pr create --base main
After merging and verifying the main Pages deployment, tag that merged commit:
  git tag v$VERSION <verified-main-sha>
  git push origin v$VERSION
NEXT
