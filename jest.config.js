const { createConfig } = require('@openedx/frontend-build');

const mergedConfig = createConfig('jest', {
  // setupFilesAfterEnv is used after the jest environment has been loaded.  In general this is what you want.
  // If you want to add config BEFORE jest loads, use setupFiles instead.
  setupFiles: ['<rootDir>/.env.test'],
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.jsx',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.jsx',
    'src/i18n',
  ],
});

// Limit ts-jest diagnostics to test files so type errors in transformed
// dependencies (included via transformIgnorePatterns) don't fail the run.
mergedConfig.transform['^.+\\.[tj]sx?$'] = [
  'ts-jest',
  {
    diagnostics: {
      exclude: ['!**/*.test.*'],
    },
  },
];

module.exports = mergedConfig;
