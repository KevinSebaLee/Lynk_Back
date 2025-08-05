import js from '@eslint/js';
import nodePlugin from 'eslint-plugin-node';

export default [
  js.configs.recommended,
  {
    plugins: {
      node: nodePlugin,
    },
    rules: {
      ...nodePlugin.configs['recommended'].rules,
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
    },
    ignores: ['node_modules/**', 'dist/**'],
  },
];