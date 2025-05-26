import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslate } from './index';

type TranslationLoader<T> = T | (() => Promise<T>);

// Initial translation always should be loaded
export function initReact<
	const Translations extends Record<string, TranslationLoader<Record<string, any>>>,
	Locales extends keyof Translations = keyof Translations
>(
	translations: Translations,
	initialLocale: Locales,
) {
	type Translation = Awaited<ReturnType<
		Translations[Locales] extends () => Promise<infer T>
		? Translations[Locales]
		: () => Promise<Translations[Locales]>
	>>;

	type TranslationContextType = {
		translate: ReturnType<typeof getTranslate<Translation>>;
		locale: keyof Translations;
		setLocale: (locale: keyof Translations) => void;
		isLoading: boolean;
	};

	const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

	const TranslationProvider = ({
		children,
	}: {
		children: React.ReactNode
	}) => {
		const [locale, setLocale] = useState<keyof Translations>(initialLocale);
		const [translate, setTranslate] = useState(
			() => getTranslate(translations[locale] as Translation)
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
			<TranslationContext.Provider value={{
				translate,
				locale,
				setLocale: async (newLocale) => {
					if (newLocale !== locale) {
						setLocale(newLocale);
						await loadTranslation(newLocale);
					}
				},
				isLoading,
			}}>
				{children}
			</TranslationContext.Provider>
		);
	};

	const useTranslate = () => {
		const context = useContext(TranslationContext);
		if (!context) throw new Error('useTranslate must be used within a TranslationProvider');
		return context;
	};

	return {
		TranslationProvider,
		useTranslate,
	};
}