import type { EnsureValidTranslation, ValidateTranslation } from '../../index';

const test: EnsureValidTranslation<ValidateTranslation<typeof en>> = 0;
void test;
const en = {
	test: 'Hello {who:string|capitalize}!',
	nested: {
		deep: {
			hello: 'Hello',
			again: 'Nested again {value:number|number}',
		},
	},
	// Key not used test2_none
	test2_one: 'Plural one',
	test2_other: 'Plural: {count}',
	customFormatter: 'Test formatter {data|customFormatter}',
} as const;

export default en;
