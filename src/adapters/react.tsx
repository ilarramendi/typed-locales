import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
	getTranslate,
	type ExtraFormatters,
	type Locales,
	type TranslationType,
} from '../index.js';

export interface TranslationContextType {
	isLoading: boolean;
	locale?: Locales;
	setLocale: (locale: Locales) => Promise<Locales>;
	t: ReturnType<typeof getTranslate>;
}

// Initial translation always should be loaded
export const initReact = (
	allTranslations: Record<Locales, () => Promise<{ default: TranslationType }>>,
	extraFormatters: ExtraFormatters,
	fallbackLocale?: Locales
) => {
	const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const [state, setState] = useState<{
			isLoading: boolean;
			locale?: Locales;
			translate: ReturnType<typeof getTranslate>;
		}>({
			isLoading: false,
			locale: undefined,
			translate: ((key: string) => key) as any,
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

				let fallbackTranslationData: TranslationType;
				if (fallbackLocale) {
					const fallbackTranslationOrLoader = allTranslations[targetLocale];

					if (typeof fallbackTranslationOrLoader === 'function') {
						fallbackTranslationData = await fallbackTranslationOrLoader().then(t => t.default);
					} else {
						fallbackTranslationData = fallbackTranslationOrLoader;
					}
				}

				setState({
					isLoading: false,
					locale: targetLocale,
					translate: getTranslate(
						translationData,
						targetLocale,
						extraFormatters,
						fallbackLocale === targetLocale || !fallbackLocale ? undefined : getTranslate(
							fallbackTranslationData!,
							fallbackLocale,
							extraFormatters
						),
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

	// Overloaded useTranslation function
	function useTranslation() {
		const context = useContext(TranslationContext);
		if (!context) throw new Error('useTranslation must be used within a TranslationProvider');

		return context;
	}

	return {
		TranslationProvider,
		useTranslation,
	};
};