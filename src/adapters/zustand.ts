import { create } from 'zustand';
import {
	type ExtraFormatters,
	getTranslate,
	type Locales,
	type TranslateFunctionType,
	type TranslationType,
} from '../index.js';

type TranslationLoader = () => Promise<{ default: TranslationType }>;

interface TranslationState {
	isLoading: boolean;
	locale?: Locales;
	// eslint-disable-next-line no-unused-vars
	setLocale: (locale: Locales) => Promise<void>;
	t: TranslateFunctionType;
}

export const initZustand = (
	allTranslations: Record<Locales, TranslationLoader | TranslationType>,
	extraFormatters: ExtraFormatters,
	defaultLocale?: Locales
) => {
	const identityTranslate = ((key: string) => key) as TranslateFunctionType;

	if (defaultLocale && typeof allTranslations[defaultLocale] !== 'object') {
		throw new Error(
			'Default locale in all translations object cant be a promise'
		);
	}

	return create<TranslationState>((set, get) => ({
		isLoading: false,
		locale: defaultLocale,
		setLocale: async (targetLocale: Locales) => {
			if (get().locale === targetLocale) return;

			try {
				set({ isLoading: true });

				let translationData: TranslationType;
				if (typeof allTranslations[targetLocale] === 'function') {
					translationData = await allTranslations[targetLocale]().then(
						module => module.default
					);
				} else {
					translationData = allTranslations[targetLocale];
				}

				set({
					isLoading: false,
					locale: targetLocale,
					t: getTranslate(translationData, targetLocale, extraFormatters),
				});
			} catch (error) {
				console.error(`Failed to load locale ${targetLocale}:`, error);
				set({ isLoading: false });
			}
		},
		t: defaultLocale
			? getTranslate(
					allTranslations[defaultLocale] as TranslationType,
					defaultLocale,
					extraFormatters
				)
			: identityTranslate,
	}));
};
