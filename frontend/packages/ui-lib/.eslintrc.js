/**
 * Specific eslint rules for this app/package, extends the base rules
 * @see https://github.com/belgattitude/nextjs-monorepo-example/blob/main/docs/about-linters.md
 */

// Workaround for https://github.com/eslint/eslint/issues/3458 (re-export of @rushstack/eslint-patch)
require('@munu/eslint-config-bases/patch/modern-module-resolution');

const {
  getDefaultIgnorePatterns,
} = require('@munu/eslint-config-bases/helpers');

module.exports = {
  root: true,
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
  },
  ignorePatterns: [...getDefaultIgnorePatterns(), '/storybook-static'],
  extends: [
    '@munu/eslint-config-bases/typescript',
    '@munu/eslint-config-bases/regexp',
    '@munu/eslint-config-bases/sonar',
    '@munu/eslint-config-bases/jest',
    '@munu/eslint-config-bases/rtl',
    '@munu/eslint-config-bases/storybook',
    '@munu/eslint-config-bases/react',
    // Apply prettier and disable incompatible rules
    '@munu/eslint-config-bases/prettier',
  ],
  rules: {
    // optional overrides per project
  },
  overrides: [
    // optional overrides per project file match
  ],
};
