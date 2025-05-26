import type { ValidateTranslation as ValidateTranslationInternal } from '../validation';
import { initReact } from '../react';
import en from './translations/en';
import { type Formatter } from '../formatters';
import type { GenerateTranslationType } from '..';

const customFormatters = {
	myCustomFormatter: () => 'Hello im custom',
} as const satisfies Record<string, Formatter>;

type Locale = 'en' | 'es';

export const { useTranslation, TranslationProvider } = initReact<typeof en, Locale>({
	en,
	es: () => import('./translations/es').then(m => m.default),
}, 'en', customFormatters);

export type NamespaceShape = GenerateTranslationType<typeof en>

export type ValidateTranslation<T> = ValidateTranslationInternal<T, keyof typeof customFormatters>;
