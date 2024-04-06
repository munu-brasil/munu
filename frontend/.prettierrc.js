// @ts-check

const {
  getPrettierConfig,
} = require('./packages/eslint-config-bases/src/helpers');

const { overrides = [], ...prettierConfig } = getPrettierConfig();

/**
 * @type {import('prettier').Config}
 */
const config = {
  ...prettierConfig,
  overrides: [
    ...overrides,
    ...[
      {
        files: '*.md',
        options: {
          singleQuote: false,
        },
      },
    ],
  ],
};

module.exports = config;
