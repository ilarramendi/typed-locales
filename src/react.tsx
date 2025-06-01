import React, { createContext, useContext, useState } from 'react';

import { getTranslate, type ExtraFormatters, type Locales, type TranslationType } from './index.js';

export interface TranslationContextType {
	isLoading: boolean;
	locale: Locales;
	setLocale: (locale: Locales) => Promise<Locales>;
	t: ReturnType<typeof getTranslate>;
}

// Initial translation always should be loaded
export const initReact = (
	initialTranslation: TranslationType,
	initialLocale: Locales,
	allTranslations: Record<Locales, (() => Promise<TranslationType>) | TranslationType>,
	extraFormatters: ExtraFormatters,
) => {
	const TranslationContext = createContext<TranslationContextType | undefined>(undefined);
	const initialTranslate = getTranslate(initialTranslation, initialLocale, extraFormatters);

	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const [state, setState] = useState<{
			isLoading: boolean;
			locale: Locales;
			translate: typeof initialTranslate;
		}>({
			isLoading: false,
			locale: initialLocale,
			translate: initialTranslate,
		});

		const loadTranslation = async (targetLocale: Locales) => {
			try {
				const translationOrLoader = allTranslations[targetLocale];
				let translationData: TranslationType;

				if (typeof translationOrLoader === 'function') {
					setState(previous => ({ ...previous, isLoading: true }));
					translationData = await translationOrLoader();
				} else {
					translationData = translationOrLoader;
				}

				setState({
					isLoading: false,
					locale: targetLocale,
					translate: getTranslate(
						translationData,
						targetLocale,
						extraFormatters,
						initialLocale === targetLocale ? undefined : initialTranslate,
					),
				});
			} catch (error) {
				console.error(`Failed to load translations for locale ${String(targetLocale)}:`, error);
				setState(previous => ({ ...previous, isLoading: false }));
			}
		};

		return (
			<TranslationContext.Provider
				value={{
					isLoading: state.isLoading,
					locale: state.locale,
					setLocale: async newLocale => {
						if (newLocale !== state.locale) {
							await loadTranslation(newLocale);
						}

						return newLocale;
					},
					t: state.translate,
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

