import { translate } from './index';

// Normal translation
const translation = translate('test');
//     ^?

// Nested translation
const translation2 = translate('nested.nestedTest');
//    ^? string

// Incorrect translation
const translation3 = translate('nested.noFunciona');
//     ^?

// With value translation
const translation4 = translate('withValue.hello', { nombre: 'Juan' });
//     ^?

// Incorrect value translation
const translation5 = translate('withValue.hello', { incorrect: 'Juan' });
//     ^?

// Missing value key
const translation6 = translate('withValue.hello', {});
//     ^?

// Unnecesary value
const translation7 = translate('nested.nestedTest', { nombre: 'Juan' });
//     ^?

// Missing value
const translation8 = translate('withValue.hello');
//     ^?

// Plural
const translation9 = translate('plural.example', { count: 123 });

// Plural missing count value
const translation10 = translate('plural.example', {});

// Plural missing values
const translation11 = translate('plural.example');

// Plural with other values
const translation12 = translate('plural.withOtherValues', { count: 123, nombre: 'Juan' });

// Plural with other values missing count value
const translation13 = translate('plural.withOtherValues', { nombre: 123 });

// Plural with other values missing values
const translation14 = translate('plural.withOtherValues', { count: 123 });

// Plural with other values missing values
const translation15 = translate('plural.withOtherValues');

