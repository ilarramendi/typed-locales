import React, { createContext, useCallback, useContext, useState } from 'react';

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
	allTranslations: Record<Locales, (() => Promise<{default: TranslationType}>) | TranslationType>,
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

		const setLocale = useCallback(async (targetLocale: Locales) => {
			try {
				const translationOrLoader = allTranslations[targetLocale];
				let translationData: TranslationType;

				if (typeof translationOrLoader === 'function') {
					setState(previous => ({ ...previous, isLoading: true }));
					translationData = await translationOrLoader().then(t => t.default);
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

			return targetLocale;
		}, []);

		return (
			<TranslationContext.Provider
				value={{
					isLoading: state.isLoading,
					locale: state.locale,
					setLocale,
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

