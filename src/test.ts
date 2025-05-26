import { getTranslate } from './index';

const translations = {
	test: 'Regular translation',
	nested: {
		test: 'Nested translation',
	},
	withValue: 'With value {value}',
	// Key dosnt need to include plural, its just for the example
	examplePlural_none: 'No elements',
	examplePlural_one: 'One element',
	examplePlural_other: '{count} elements',
	examplePluralWithOtherValues_none: 'No elements and {name}',
	examplePluralWithOtherValues_one: 'One element and {name}',
	examplePluralWithOtherValues_other: '{count} elements and {name} or {name2}',
} as const;

const translate = getTranslate(translations);


// Normal
const translation = translate('test');
//     ^?

// Nested
const translation2 = translate('nested.test');
//    ^? string

// Incorrect
const translation3 = translate('nested.noFunciona');

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

