import en from './translations/en';
import es from './translations/es';
import { getTranslate, initZustand, type Formatter } from '..';

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

const translate = getTranslate(es, 'es-ES', customFormatters);

const result = {
	test: translate('test', {
		who: 'mundo', // Only string allowed
	}),
	nested: {
		deep: {
			hello: translate('nested.deep.hello', undefined, {
				fallback: 'fallback',
			}),
		},
	},
	test2_none: translate('test2', { count: 0 }), // Count prop from plurals is always number
	test2_one: translate('test2', { count: 1 }, { fallback: 'fallback' }),
	test2_other: translate('test2', { count: 69 }),
	customFormatter: translate('customFormatter', {
		data: 'custom formatter data',
	}),
};

console.log(result);

const store = initZustand(
	{
		'en-US': () => import('./translations/en'),
		'es-ES': () => import('./translations/es'),
	},
	customFormatters
);

console.log(store.getState().t('nested.deep.hello'));
