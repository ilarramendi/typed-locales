import en from './translations/en';
import es from './translations/es';
import { getTranslate } from '..';

const customFormatters = {
	myCustomFormatter: () => 'Hello im custom',
} as const;

declare module '../../src/index' {
	interface Overrides {
		shape: typeof en;
		locales: 'en' | 'es';
		extraFormatters: typeof customFormatters
	}
}

const translate = getTranslate(es, 'en', customFormatters);

const result = {
	test: translate('test'),
	nested: {
		test: translate('nested.test'),
		deep: {
			again: translate('nested.deep.again'),
		},
	},
	test2_none: translate('test2', {count: 0, value: 'test'}),
	test2_one: translate('test2', { count: 1, value: 'test' }),
	test2_other: translate('test2', { count: 69, value: 'test' }),
}

console.log(result);