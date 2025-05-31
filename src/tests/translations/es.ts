import { type EnsureValidTranslation, type TranslationType, type ValidateTranslation } from '../../index';

let test: EnsureValidTranslation<ValidateTranslation<typeof es>> = 0;
void test;

const es = {
	test: 'Hola {who|capitalize}!',
	// @ts-expect-error Property test is missing in...
	nested: {
		// Missing key 'test' fallbacks to EN
		deep: {
			again: 'Anidado nuevamente {value|currency}',
		},
	},
	test2_none: 'Plural ninguno', // Not present in EN
	test2_one: undefined,// Key not used test2_one, fallbacks to other
	test2_other: 'Plural otros {count}'
} as const satisfies TranslationType;
export default es;