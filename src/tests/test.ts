import en from './translations/en';
import es from './translations/es';
import { getTranslate } from '..';

const customFormatters = {
	myCustomFormatter: () => 'Hello im custom',
} as const;

declare module '../../src/index' {
	interface Overrides {
		shape: typeof en;
		locales: 'en-US' | 'es-ES';
		extraFormatters: typeof customFormatters
	}
}

const defaultTranslate = getTranslate(en, 'en-US', customFormatters);
// @ts-expect-error -- Missing key test...
const translate = getTranslate(es, 'es-ES', customFormatters, defaultTranslate);

const result = {
	test: translate('test', {
		who: 'mundo'
	}),
	nested: {
		test: translate('nested.test'), // Fallbacks to EN
		deep: {
			again: translate('nested.deep.again', {
				value: 100000000 // Only number allowed
			}),
		},
	},
	test2_none: translate('test2', {count: 0 }),
	test2_one: translate('test2', { count: 1 }),
	test2_other: translate('test2', { count: 69 }),
}

console.log(result);