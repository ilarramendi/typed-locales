import { translate } from './index';

// Normal translation
const translation = translate('test');
//     ^?

// Nested translation
const translation2 = translate('nested.nestedTest');
//    ^? string

// @ts-nocheck
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

