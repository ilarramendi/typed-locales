import React, { createContext, useContext, useState } from 'react';

import { getTranslate, type Locales, type ExtraFormatters, type OtherTranslations, type Translations } from '../index';

export interface TranslationContextType {
	isLoading: boolean;
	locale: Locales;
	setLocale: (locale: Locales) => void;
	t: ReturnType<typeof getTranslate>;
}

// Initial translation always should be loaded
export const initReact = (
	allTranslations: Record<Locales, OtherTranslations | (() => Promise<OtherTranslations>)>,
	initialLocale: Locales,
	extraFormatters: ExtraFormatters,
) => {
	const TranslationContext = createContext<TranslationContextType | undefined>(undefined);
	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const [locale, setLocale] = useState<Locales>(initialLocale);
		const [translate, setTranslate] = useState(() =>
			getTranslate(allTranslations[locale] as Translations, locale, extraFormatters) as TranslationContextType['t'],
		);
		const [isLoading, setIsLoading] = useState(true);

		const loadTranslation = async (targetLocale: Locales) => {
			try {
				const translationOrLoader = allTranslations[targetLocale];
				let translationData: OtherTranslations;

				if (typeof translationOrLoader === 'function') {
					setIsLoading(true);
					translationData = await translationOrLoader();
				} else {
					translationData = translationOrLoader;
				}

				setTranslate(getTranslate(translationData as Translations, targetLocale, extraFormatters) as TranslationContextType['t']);
			} catch (error) {
				console.error(`Failed to load translations for locale ${String(targetLocale)}:`, error);
			} finally {
				setIsLoading(false);
			}
		};

		return (
			<TranslationContext.Provider
				value={{
					isLoading,
					locale,
					setLocale: async newLocale => {
						if (newLocale !== locale) {
							setLocale(newLocale);
							await loadTranslation(newLocale);
						}
					},
					t: translate,
				}}
			>
				{children}
			</TranslationContext.Provider>
		);
	};

	const useTranslation = () => {
		const context = useContext(TranslationContext);
		if (!context) throw new Error('useTranslation must be used within a TranslationProvider');

		return context;
	};


	return {
		TranslationProvider,
		useTranslation
	};
};

