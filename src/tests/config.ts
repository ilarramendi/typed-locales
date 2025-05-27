import { initReact } from '../react';
import en from './translations/en';
import es from './translations/es';
import { type Formatter } from '../formatters';

const customFormatters = {
	myCustomFormatter: () => 'Hello im custom',
} as const satisfies Record<string, Formatter>;

export const { useTranslation, TranslationProvider } = initReact({en, es}, 'en', customFormatters);

declare module '../../index' {
	interface Overrides {
		shape: typeof en;
		extraFormatters: typeof customFormatters;
		locales: 'en' | 'es';
	} 
}


