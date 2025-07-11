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

type ExtraTranslation = {
	[locale in Locales]?: string;
} & {
	key: string;
};

type ExtraTranslations = ExtraTranslation[];


const addExtraTranslations = (
	translation: TranslationType,
	extraTranslations: ExtraTranslations,
	locale: Locales
) => {
	let current: any = translation;
	for (const extraTranslation of extraTranslations) {
		current = translation;
		const parts = extraTranslation.key.split('.');
		const lastPart = parts.pop();
		for (const part of parts) {
			if (current[part] === undefined) {
				current[part] = {};
			}
			current = current[part];
		}
		if (lastPart && extraTranslation[locale] !== undefined) {
			current[lastPart] = extraTranslation[locale];
		}
	}
	return translation;
};

// Initial translation always should be loaded
export const initReact = (
	defaultTranslations: object,
	allTranslations: Record<
		Locales,
		() => Promise<{ default: object }>
	>,
	extraFormatters: ExtraFormatters,
	defaultLocale: Locales,
	extraTranslations?: ExtraTranslations
) => {
	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const defaultTranslate = getTranslate(
			addExtraTranslations(
				defaultTranslations as any,
				extraTranslations ?? [],
				defaultLocale
			),
			defaultLocale,
			extraFormatters
		)
		const [state, setState] = useState<{
			isLoading: boolean;
			locale?: Locales;
			translate: ReturnType<typeof getTranslate>;
		}>({
			isLoading: false,
			locale: defaultLocale,
			translate: defaultTranslate,
		});

		const setLocale = useCallback(async (targetLocale: Locales) => {
			try {
				const translationOrLoader = allTranslations[targetLocale];
				const translationData = await translationOrLoader().then(t => t.default) as any;

				setState({
					isLoading: false,
					locale: targetLocale,
					translate: getTranslate(
						addExtraTranslations(translationData, extraTranslations ?? [], targetLocale),
						targetLocale,
						extraFormatters,
						defaultTranslate
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

export const useTranslation = () => {
	const context = useContext(TranslationContext);
	if (!context)
		throw new Error('useTranslation must be used within a TranslationProvider');

	return context;
};

