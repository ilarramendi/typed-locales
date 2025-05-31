import { type EnsureValidTranslation, type TranslationType, type ValidateTranslation } from '../../index';

let test: EnsureValidTranslation<ValidateTranslation<typeof es>> = 0;
void test;

const es = {
	test: 'Hola {who|capitalize}!',
	nested: {
		deep: {
			again: 'Anidado nuevamente {value|currency}',
		},
	},
	test2_none: 'Plural ninguno', // Not present in EN
	test2_one: undefined,// Key not used test2_one, fallbacks to other
	test2_other: 'Plural otros {count}',
	customFormatter: 'Prueba formatter {data|customFormatter}'
} as const satisfies TranslationType;
export default es;