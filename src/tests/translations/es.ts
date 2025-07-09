import {
	type EnsureValidTranslation,
	type TranslationType,
	type ValidateTranslation,
} from '../../index';

const test: EnsureValidTranslation<ValidateTranslation<typeof es>> = 0;
void test;

const es = {
	test: 'Hola {who|capitalize}!',
	nested: {
		deep: {
			again: 'Anidado nuevamente {value|currency}',
			hello: 'Hola',
		},
		test2_one: 'Plural uno',
	},
	test2_none: 'Plural ninguno',
	test2_other: 'Plural otros {count}',
	customFormatter: 'Prueba formatter {data|customFormatter}',
} as const satisfies TranslationType;

export default es;
