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

const defaultTranslate = getTranslate(en, 'en', customFormatters); 
const translate = getTranslate(es, 'es', customFormatters, defaultTranslate);

const result = {
	test: translate('test'),
	nested: {
		test: translate('nested.test'),
		deep: {
			again: translate('nested.deep.again'),
		},
	},
	test2_none: translate('test2', {count: 0 }),
	test2_one: translate('test2', { count: 1 }),
	test2_other: translate('test2', { count: 69 }),
}

console.log(result);