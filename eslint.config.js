import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: {
			js,
			prettier: prettierPlugin,
		},
		extends: ['js/recommended'],
		rules: {
			'prettier/prettier': 'error',
		},
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		languageOptions: {
			globals: globals.node,
		},
	},
	tseslint.configs.base,
	{
		files: ['**/*.md'],
		plugins: {
			markdown,
		},
		language: 'markdown/gfm',
		extends: ['markdown/recommended'],
	},
	prettier,
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
