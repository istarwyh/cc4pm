const { createInstallTargetAdapter } = require('./helpers');

module.exports = createInstallTargetAdapter({
  id: 'opencode-home',
  target: 'opencode',
  kind: 'home',
  rootSegments: ['.opencode'],
  installStatePathSegments: ['cc4pm-install-state.json'],
  nativeRootRelativePath: '.opencode',
});
