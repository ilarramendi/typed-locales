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
	locale: Locales;
	setLocale: (locale: Locales) => Promise<void>;
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
	return translation as TranslationType;
};

const dumbTranslate = ((key: string) => key) as any;

// Initial translation always should be loaded
export const initReact = (
	_defaultTranslations: TranslationType,
	allTranslations: Record<Locales, () => Promise<{ default: object }>>,
	extraFormatters: ExtraFormatters,
	defaultLocale: Locales,
	extraTranslations?: ExtraTranslations
) => {
	const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
		const [showKeys, setShowKeys] = useState(false);
		const [locale, _setLocale] = useState(defaultLocale);
		const [translations, setTranslations] = useState<TranslationType>(() => {
			return addExtraTranslations(
				_defaultTranslations,
				extraTranslations ?? [],
				defaultLocale
			);
		});
		const translate = useMemo(() => {
			return getTranslate(translations, locale, extraFormatters);
		}, [translations, locale]);

		const setLocale = useCallback(
			async (targetLocale: Locales) => {
				if (locale === targetLocale) {
					return;
				}

				try {
					const translationOrLoader = allTranslations[targetLocale];
					if (!translationOrLoader) {
						throw new Error(`Translation loader not found`);
					}

					const translationData = (await translationOrLoader().then(
						t => t.default
					)) as any;

					const newTranslations = addExtraTranslations(
						translationData,
						extraTranslations ?? [],
						targetLocale
					);

					setTranslations(newTranslations);
					_setLocale(targetLocale);
				} catch (error) {
					console.error(
						`Failed to load translations for locale ${String(targetLocale)}:`,
						(error as Error)?.message ?? error
					);

					throw error;
				}
			},
			[locale]
		);

		return (
			<TranslationContext.Provider
				value={{
					locale,
					setLocale,
					t: showKeys ? dumbTranslate : translate,
					setShowKeys,
					showKeys,
					translations,
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
