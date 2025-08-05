import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import markdown from '@eslint/markdown';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig([
	// Base JS + React rules
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		plugins: {
			js,
			prettier: prettierPlugin,
			react,
			'react-hooks': reactHooks,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'prettier/prettier': 'error',
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},

	// TypeScript base config
	tseslint.configs.base,

	// Markdown linting
	{
		files: ['**/*.md'],
		plugins: {
			markdown,
		},
		language: 'markdown/gfm',
		extends: ['markdown/recommended'],
	},

	// Prettier last
	prettier,

	// Ignore patterns
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'*.min.js',
			'coverage/**',
		],
	},
]);
