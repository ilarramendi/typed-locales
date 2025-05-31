import type { EnsureValidTranslation, TranslationType, ValidateTranslation } from '../../index';

let test: EnsureValidTranslation<ValidateTranslation<typeof en>> = 0;
void test;
const en = {
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
} as const;

export default en;