import globals from 'globals';
import daStyle from 'eslint-config-dicodingacademy';


/** @type {import('eslint').Linter.Config[]} */
export default [
  daStyle,
  { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
  { languageOptions: { globals: globals.browser } },
];