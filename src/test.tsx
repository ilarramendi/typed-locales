import { getTranslate } from './index';
import { initReact } from './react';
import en from './translations/en';


const translate = getTranslate(en, {
	testFormatter: (value) => 'test'
});


// Normal
const translation = translate('test');
//     ^?

// Nested
const translation2 = translate('nested.test');
//    ^? string

// Incorrect key
const translation3 = translate('incorrectKey');

// With value
const translation4 = translate('withValue', { value: 'Juan' });
//     ^?

// Incorrect value
const translation5 = translate('withValue', { incorrect: 'Juan' });

// Unnecesary value
const translation7 = translate('test', {});

// Missing value key
const translation6 = translate('withValue', {});

// Missing value property
const translation8 = translate('withValue');

// Plural
const translation9 = translate('examplePlural', { count: 123 });
//     ^?

// Plural missing count value
const translation10 = translate('examplePlural', {});

// Plural missing values
const translation11 = translate('examplePlural');

// Plural with other values
const translation12 = translate('examplePluralWithOtherValues', { count: 0, name: 'Juan', name2: 'Perez' });

// Plural with other values missing count value
const translation13 = translate('examplePluralWithOtherValues', { name: 'Juan', name2: 'Perez' });

// Plural with other values missing values
const translation14 = translate('examplePluralWithOtherValues', { count: 123 });

// Plural missing value property
const translation15 = translate('examplePluralWithOtherValues');

// With formatting
const translation16 = translate('exampleWithFormatting', { text: 'Juan' });

// With formatting using formatter key incorrectly
const translation17 = translate('exampleWithFormatting', { 'text|testFormatter': 'Juan' });

// React example
const { useTranslation } = initReact<typeof en, 'en' | 'es'>({
	en,
	es: () => import('./translations/es').then(module => module.default),
}, 'en');

const Test = () => {
	const { t, locale, setLocale } = useTranslation()
	
	return <div>
		{t('examplePluralWithOtherValues', { count: 123 })}
		{locale}
		<button onClick={() => setLocale('es')}>Change locale</button>
	</div>;
}
