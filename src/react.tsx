import React, { createContext, useContext, useState } from 'react';

import { getTranslate, type ExtraFormatters, type Locales, type TranslationType } from './index.js';

export interface TranslationContextType {
	isLoading: boolean;
	locale: Locales;
	setLocale: (locale: Locales) => void;
	t: ReturnType<typeof getTranslate>;
}

// Initial translation always should be loaded
export const initReact = (
	initialTranslation: TranslationType,
	initialLocale: Locales,
	allTranslations: Record<Locales, TranslationType | (() => Promise<TranslationType>)>,
	extraFormatters: ExtraFormatters,
) => {
	const TranslationContext = createContext<TranslationContextType | undefined>(undefined);
	const initialTranslate = getTranslate(initialTranslation, initialLocale, extraFormatters)
	
	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const [locale, setLocale] = useState<Locales>(initialLocale);
		const [translate, setTranslate] = useState(() => initialTranslate);
		const [isLoading, setIsLoading] = useState(false);

		const loadTranslation = async (targetLocale: Locales) => {
			try {
				const translationOrLoader = allTranslations[targetLocale];
				let translationData: TranslationType;

				if (typeof translationOrLoader === 'function') {
					setIsLoading(true);
					translationData = await translationOrLoader();
				} else {
					translationData = translationOrLoader;
				}

				setTranslate(getTranslate(translationData, targetLocale, extraFormatters, initialTranslate));
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

