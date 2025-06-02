import en from './translations/en';
import es from './translations/es';
import { getTranslate, type Formatter } from '..';

const customFormatters = {
	// Make one char uppercase and one lower interchangebly
	customFormatter: value =>
		value
			?.toString()
			.split('')
			.map((v, i) => (i % 2 ? v.toUpperCase() : v.toLowerCase()))
			.join('') ?? '',
} as const satisfies Record<string, Formatter>;

declare module '../../src/index' {
	interface Overrides {
		shape: typeof en;
		locales: 'en-US' | 'es-ES';
		extraFormatters: typeof customFormatters;
	}
}

const defaultTranslate = getTranslate(en, 'en-US', customFormatters);
const translate = getTranslate(es, 'es-ES', customFormatters, defaultTranslate);

const result = {
	test: translate('test', {
		who: 'mundo', // Only string allowed
	}),
	nested: {
		deep: {
			again: translate('nested.deep.again', {
				value: 100000000, // Only number allowed
			}),
		},
	},
	test2_none: translate('test2', { count: 0 }), // Count prop from plurals is always number
	test2_one: translate('test2', { count: 1 }),
	test2_other: translate('test2', { count: '69' }), // TODO fix
	customFormatter: translate('customFormatter', {
		data: 'custom formatter data',
	}),
};
console.log(result);
