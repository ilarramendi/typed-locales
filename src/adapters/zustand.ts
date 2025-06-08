import { create } from 'zustand';
import {
	type ExtraFormatters,
	getTranslate,
	type Locales,
	type TranslationType,
} from '../index.js';

interface TranslationState {
	isLoading: boolean;
	locale?: Locales;
	// eslint-disable-next-line no-unused-vars
	setLocale: (locale: Locales) => Promise<void>;
	t: ReturnType<typeof getTranslate>;
}

export const initZustand = (
	allTranslations: Record<Locales, () => Promise<{ default: TranslationType }>>,
	extraFormatters: ExtraFormatters,
	fallbackLocale?: Locales
) => {
	const useTranslation = create<TranslationState>((set, get) => ({
		isLoading: false,
		locale: undefined,
		setLocale: async (targetLocale: Locales) => {
			try {
				if (get().locale === targetLocale) {
					return;
				}
				set({ isLoading: true });

				const translationData = await allTranslations[targetLocale]().then(
					t => t.default
				);

				let fallbackTranslate;
				if (fallbackLocale && fallbackLocale !== targetLocale) {
					const fallbackData = await allTranslations[fallbackLocale]().then(
						t => t.default
					);
					fallbackTranslate = getTranslate(
						fallbackData,
						fallbackLocale,
						extraFormatters
					);
				}

				set({
					isLoading: false,
					locale: targetLocale,
					t: getTranslate(
						translationData,
						targetLocale,
						extraFormatters,
						fallbackTranslate
					),
				});
			} catch (error) {
				console.error(`Failed to load locale ${String(targetLocale)}:`, error);
				set({ isLoading: false });
			}
		},

		t: ((key: string) => key) as any,
	}));

	return useTranslation;
};
