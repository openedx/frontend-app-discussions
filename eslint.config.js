// @ts-check

const { createLintConfig } = require('@openedx/frontend-base/config');

module.exports = createLintConfig(
  {
    rules: {
      'no-duplicate-imports': 'warn',
    },
  },
  {
    files: [
      'src/**/*',
      'site.config.*',
    ],
  },
  {
    ignores: [
      'documentation/*',
      'jest.config.js',
      'src/i18n/messages/'
    ],
  },
);
