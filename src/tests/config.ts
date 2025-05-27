import type { ValidateTranslation as ValidateTranslationInternal } from '../validation';
import { initReact } from '../react';
import en from './translations/en';
import es from './translations/es';
import { type Formatter } from '../formatters';
import type { GenerateTranslationType } from '../..';

const customFormatters = {
	myCustomFormatter: () => 'Hello im custom',
} as const satisfies Record<string, Formatter>;

export const { useTranslation, TranslationProvider } = initReact({
	en,
	es,
}, 'en', customFormatters);

export type NamespaceShape = GenerateTranslationType<typeof en>

declare module '../../index' {
	interface Overrides {
		shape: typeof en;
		extraFormatters: typeof customFormatters;
		locales: 'en' | 'es';
	} 
}


