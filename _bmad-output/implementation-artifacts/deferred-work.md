# Deferred Work

- Security audit surfaced a pre-existing dev dependency advisory: `markdownlint-cli@0.47.0` depends on vulnerable `minimatch` versions. This was not introduced by the theater-say change. Suggested follow-up: upgrade `markdownlint-cli` to a non-vulnerable release and rerun `npm audit --audit-level=high`.
