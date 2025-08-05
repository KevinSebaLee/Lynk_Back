import eslintRecommended from '@eslint/js';

export default [
  {
    files: ['**/*.js'], // Apply to all JavaScript files
    languageOptions: {
      ecmaVersion: 2021, // Supports ES2021 features
      sourceType: 'module', // Enables ES modules
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      ...eslintRecommended.rules, // Extend recommended rules
      'no-undef': 'off', // Disable undefined variable errors for `process` and `console`
      'no-unused-vars': ['warn', { args: 'none' }], // Warn for unused variables
      'quotes': ['error', 'single'], // Enforce single quotes
      'semi': ['error', 'always'], // Enforce semicolons
    },
  },
];