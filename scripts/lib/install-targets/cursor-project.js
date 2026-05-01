const { createInstallTargetAdapter } = require('./helpers');

module.exports = createInstallTargetAdapter({
  id: 'cursor-project',
  target: 'cursor',
  kind: 'project',
  rootSegments: ['.cursor'],
  installStatePathSegments: ['cc4pm-install-state.json'],
  nativeRootRelativePath: '.cursor',
});
