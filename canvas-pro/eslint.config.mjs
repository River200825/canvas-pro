export default [
  {
    ignores: ['dist', 'node_modules', '.vite', '*.config.*', 'coverage'],
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      vue: await import('eslint-plugin-vue'),
    },
    processor: 'vue/*.vue',
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'error',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: await import('vue-eslint-parser'),
      parserOptions: {
        parser: await import('@typescript-eslint/parser'),
      },
    },
    rules: {
      'vue/script-setup-uses-vars': 'error',
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    },
  },
]