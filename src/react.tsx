import React, { createContext, useContext, useState } from 'react';

import { type DeepStringify, getTranslate } from '../index';
import type { Formatter } from './formatters';

type TranslationLoader<T> = (() => Promise<T>) | T;

// Initial translation always should be loaded
export const initReact = <
	Translation,
	Locales extends string,
	ExtraFormattersType extends string = string,
	ExtraFormatters extends Record<ExtraFormattersType, Formatter> = Record<ExtraFormattersType, Formatter>,
	SimplifiedTranslation = DeepStringify<Translation>,
	Translations extends Record<Locales, TranslationLoader<SimplifiedTranslation>> = Record<
		Locales,
		TranslationLoader<SimplifiedTranslation>
	>,
>(
	translations: Translations,
	initialLocale: Locales,
	extraFormatters?: ExtraFormatters,
) => {
	interface TranslationContextType {
		isLoading: boolean;
		locale: Locales;
		setLocale: (locale: Locales) => void;
		t: ReturnType<typeof getTranslate<Translation, ExtraFormattersType>>;
	}

	const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const [locale, setLocale] = useState<Locales>(initialLocale);
		const [translate, setTranslate] = useState(() =>
			getTranslate(translations[locale] as Translation, locale, extraFormatters) as TranslationContextType['t'],
		);
		const [isLoading, setIsLoading] = useState(true);

		const loadTranslation = async (targetLocale: Locales) => {
			try {
				const translationOrLoader = translations[targetLocale];
				let translationData: Translation;

				if (typeof translationOrLoader === 'function') {
					setIsLoading(true);
					translationData = await translationOrLoader();
				} else {
					translationData = translationOrLoader as Translation;
				}

				setTranslate(getTranslate(translationData, targetLocale, extraFormatters) as TranslationContextType['t']);
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

