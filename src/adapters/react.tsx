import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
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
	locale: Locales;
	setLocale: (locale: Locales) => Promise<Locales>;
	t: ReturnType<typeof getTranslate>;
	setShowKeys: (showKeys: boolean) => void;
	showKeys: boolean;
	translations: TranslationType;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
	undefined
);

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
	allTranslations: Record<Locales, () => Promise<{ default: object }>>,
	extraFormatters: ExtraFormatters,
	defaultLocale: Locales,
	extraTranslations?: ExtraTranslations
) => {
	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const defaultTranslate = useMemo(
			() =>
				getTranslate(
					addExtraTranslations(
						defaultTranslations as any,
						extraTranslations ?? [],
						defaultLocale
					),
					defaultLocale,
					extraFormatters
				),
			[]
		);
		const [showKeys, setShowKeys] = useState(false);
		const [state, setState] = useState<{
			isLoading: boolean;
			locale: Locales;
			translate: ReturnType<typeof getTranslate>;
			translations: TranslationType;
		}>({
			isLoading: false,
			locale: defaultLocale,
			translate: defaultTranslate,
			translations: defaultTranslations as any,
		});

		const setLocale = useCallback(
			async (targetLocale: Locales) => {
				if (state.locale === targetLocale) {
					return targetLocale;
				}

				try {
					const translationOrLoader = allTranslations[targetLocale];
					if (!translationOrLoader) {
						throw new Error(`Translation loader not found`);
					}

					const translationData = (await translationOrLoader().then(
						t => t.default
					)) as any;

					setState({
						isLoading: false,
						locale: targetLocale,
						translate: getTranslate(
							addExtraTranslations(
								translationData,
								extraTranslations ?? [],
								targetLocale
							),
							targetLocale,
							extraFormatters
						),
						translations: translationData,
					});
				} catch (error) {
					console.error(
						`Failed to load translations for locale ${String(targetLocale)}:`,
						(error as Error)?.message ?? error
					);
					setState(previous => ({ ...previous, isLoading: false }));
				}

				return targetLocale;
			},
			[state.locale]
		);

		return (
			<TranslationContext.Provider
				value={{
					isLoading: state.isLoading,
					locale: state.locale,
					setLocale,
					t: showKeys ? (((key: string) => key) as any) : state.translate,
					setShowKeys,
					showKeys,
					translations: state.translations,
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
