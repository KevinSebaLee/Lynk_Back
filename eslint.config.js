import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/**', 'dist/**'],
    rules: {
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
    },
  },
];