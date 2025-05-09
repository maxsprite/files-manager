// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.min.js',
      '**/public/**',
      '**/.git/**',
      'scripts/**',
    ],
  },
  eslint.configs.recommended,
  {
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        module: 'writable'
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off' // Отключаем для конфиг-файлов
    }
  },
  {
    files: ['**/scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        require: 'readonly',
        console: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  // tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  
);