---
name: release-publish
description: >
  Commit, push, and publish all npm packages in the cc4pm monorepo.
  Triggers: "release", "publish", "发布", "发包", "发版".
  Publishes root cc4pm and @cc4pm/homepage packages.
---

# Release & Publish

Publish all cc4pm npm packages in one shot.

## Pre-flight

1. Verify on `main` branch: `git branch --show-current`
2. Check working tree: `git status --porcelain`
3. Confirm npm login: `npm whoami`

## Step 1 — Commit & Push

If there are uncommitted changes:

```bash
git add -A
git commit -m "chore: release"
```

Push to origin:

```bash
git push origin main
```

## Step 2 — Publish root `cc4pm`

```bash
npm publish
```

If the version is already published, bump patch version first:

```bash
npm version patch --no-git-tag-version
git add package.json
git commit -m "chore: bump version"
git push origin main
npm publish
```

## Step 3 — Publish `@cc4pm/homepage`

Sync homepage assets and publish:

```bash
npm run build:homepage
cd packages/homepage
npm publish --access public
cd ../..
```

If version already published, bump and retry:

```bash
cd packages/homepage
npm version patch --no-git-tag-version
git add packages/homepage/package.json
git commit -m "chore: bump homepage version"
git push origin main
npm publish --access public
cd ../..
```

## Step 4 — Verify

```bash
npm view cc4pm version
npm view @cc4pm/homepage version
```

## Error Handling

- **Not logged in**: Run `npm login` first
- **Version conflict**: Bump patch and retry (handled above)
- **Network error**: Retry the failed publish command
- **Build failure**: Run `npm run build:homepage` manually and check for errors
