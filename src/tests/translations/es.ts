import { type EnsureValidTranslation, type TranslationType, type ValidateTranslation } from '../../../index';

let test: EnsureValidTranslation<ValidateTranslation<typeof es>>;
void test;
const es = {
	test: 'Regular translation',
	nested: {
		test: 'Nested',
		deep: {
			again: 'Nested again',
		},
	},
	test2_none: 'Plural none (not in en)',
	test2_one: undefined, // Key not used
	test2_other: 'Plural other {count|uppercase}'
} as const satisfies TranslationType;

export default es;

