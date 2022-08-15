const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('eslint',
{
  "plugins": ["simple-import-sort"],
    "rules": {
      'import/no-extraneous-dependencies': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-access-key': 'off',
      'simple-import-sort/imports': [
        'error', {
          groups: [
            // These packages provide polyfills so should always be first
            ['core-js', 'regenerator-runtime'],
            // React packages should come at the top
            ['^react$', '^react-dom$', '^prop-types'],
            // Non-react third-party packages come next
            ['^@?\\w'],
            // Packages from the @edx namespace come after that
            ['^@edx?\\w'],
            // Finally we have internal, relative imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    }
  }
);

