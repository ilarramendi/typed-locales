import type { EnsureValidTranslation, ValidateTranslation } from '../../../index';

let test: EnsureValidTranslation<ValidateTranslation<typeof en>>;
void test;
const en = {
	test: 'Regular translation',
	nested: {
		test: 'Nested',
		deep: {
			again: 'Nested again',
		},
	},
	test2_one: 'Plural one {value}',
	test2_other: 'Plural other {value}'
} as const; 

export default en;