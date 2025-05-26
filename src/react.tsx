import React, { createContext, useContext, useState } from 'react';

import { type DeepStringify, getTranslate } from './index';

type TranslationLoader<T> = (() => Promise<T>) | T;

// Initial translation always should be loaded
export const initReact = <
	Translation,
	Locales extends string,
	SimplifiedTranslation = DeepStringify<Translation>,
	Translations extends Record<Locales, TranslationLoader<SimplifiedTranslation>> = Record<
		Locales,
		TranslationLoader<SimplifiedTranslation>
	>,
>(
	translations: Translations,
	initialLocale: Locales,
) => {
	interface TranslationContextType {
		isLoading: boolean;
		locale: keyof Translations;
		setLocale: (locale: keyof Translations) => void;
		t: ReturnType<typeof getTranslate<Translation>>;
	}

	const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const [locale, setLocale] = useState<keyof Translations>(initialLocale);
		const [translate, setTranslate] = useState(() =>
			getTranslate(translations[locale] as Translation),
		);
		const [isLoading, setIsLoading] = useState(true);

		const loadTranslation = async (targetLocale: keyof Translations) => {
			try {
				const translationOrLoader = translations[targetLocale];
				let translationData: Translation;

				if (typeof translationOrLoader === 'function') {
					setIsLoading(true);
					translationData = await translationOrLoader();
				} else {
					translationData = translationOrLoader as Translation;
				}

				setTranslate(() => getTranslate(translationData));
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
		useTranslation,
	};
};
