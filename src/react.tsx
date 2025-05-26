import React, { createContext, useContext, useState } from 'react';
import { getTranslate } from './index';

export function initReact<
	const Translations extends Record<string, Record<string, any>>,
	Locales extends keyof Translations = keyof Translations
>(
	translations: Translations & {
		[K in keyof Translations]: Translations[Locales]
	},
	initialLocale: Locales,
) {
	type Translation = Translations[Locales];
	type TranslationContextType = {
		translate: ReturnType<typeof getTranslate<Translation>>;
		locale: keyof Translations;
		setLocale: (locale: keyof Translations) => void;
	};

	const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

	const TranslationProvider = ({
		children,
	}: {
		children: React.ReactNode
	}) => {
		const [locale, setLocale] = useState<keyof Translations>(initialLocale);
		const [translate, setTranslate] = useState(
			() => getTranslate(translations[locale]) as TranslationContextType['translate']
		);

		return (
			<TranslationContext.Provider value={{
				translate,
				locale,
				setLocale: (locale) => {
					setTranslate(getTranslate(translations[locale]) as TranslationContextType['translate']);
					setLocale(locale);
				}
			}}>
				{children}
			</TranslationContext.Provider>
		);
	}

	const useTranslate = () => {
		const context = useContext(TranslationContext);
		if (!context) throw new Error('useTranslate must be used within a TranslationProvider');
		return context;
	}

	return {
		TranslationProvider,
		useTranslate,
	}
}

