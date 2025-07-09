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
		test2_one: 'Plural one',
	},
	test2_none: 'Plural ninguno',
	test2_other: 'Plural otros {count}',
	customFormatter: 'Test formatter {data|customFormatter}',
} as const;

export default en;
