import { type EnsureValidTranslation, type TranslationType, type ValidateTranslation } from '../../index';

let test: EnsureValidTranslation<ValidateTranslation<typeof es>> = 0;
void test;
const es = {
	test: 'Traducción regular',
	nested: {
		test: 'Anidado',
		deep: {
			again: 'Anidado nuevamente',
		},
	},
	test2_none: 'Plural ninguno (no está en en)',
	test2_one: undefined, // Clave no utilizada
	test2_other: 'Plural otros {count|uppercase}'
} as const satisfies TranslationType;

export default es;

