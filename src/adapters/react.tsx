import React, {
	createContext,
	useCallback,
	useContext,
	useState,
} from 'react';

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

const TranslationContext = createContext<
	TranslationContextType | undefined
>(undefined);


const addExtraTranslations = (
	translation: TranslationType,
	extraTranslations: Record<string, string>
) => {
	let current: any = translation;
	for (const key in extraTranslations) {
		current = translation;
		const parts = key.split('.');
		const lastPart = parts.pop();
		for (const part of parts) {
			current = current[part] ?? {};
		}
		if (lastPart) {
			current[lastPart] = extraTranslations[key];
		}
	}
	return translation;
};

// Initial translation always should be loaded
export const initReact = (
	allTranslations: Record<
		Locales,
		(() => Promise<{ default: TranslationType }>) | TranslationType
	>,
	extraFormatters: ExtraFormatters,
	defaultLocale: Locales,
	fallbackLocale?: Locales,
	extraTranslations?: Record<Locales, Record<string, string>>
) => {
	const defaultTranslations = allTranslations[defaultLocale];
	if (typeof defaultTranslations === 'function') {
		throw new Error(
			'Default locale in all translations object cant be a promise'
		);
	}

	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const [state, setState] = useState<{
			isLoading: boolean;
			locale?: Locales;
			translate: ReturnType<typeof getTranslate>;
		}>({
			isLoading: false,
			locale: defaultLocale,
			translate: getTranslate(
				addExtraTranslations(
					defaultTranslations,
					extraTranslations?.[defaultLocale] ?? {}
				),
				defaultLocale,
				extraFormatters
			),
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
						fallbackTranslationData = await fallbackTranslationOrLoader().then(
							t => t.default
						);
					} else {
						fallbackTranslationData = fallbackTranslationOrLoader;
					}
				}

				setState({
					isLoading: false,
					locale: targetLocale,
					translate: getTranslate(
						addExtraTranslations(translationData, extraTranslations?.[targetLocale] ?? {}),
						targetLocale,
						extraFormatters,
						fallbackLocale === targetLocale || !fallbackLocale
							? undefined
							: getTranslate(
									fallbackTranslationData!,
									fallbackLocale,
									extraFormatters
								)
					),
				});
			} catch (error) {
				console.error(
					`Failed to load translations for locale ${String(targetLocale)}:`,
					error
				);
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

	return TranslationProvider;
};

const useTranslation = () => {
	const context = useContext(TranslationContext);
	if (!context)
		throw new Error('useTranslation must be used within a TranslationProvider');

	return context;
};

export default useTranslation;

