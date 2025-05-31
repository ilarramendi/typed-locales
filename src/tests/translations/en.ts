import type { EnsureValidTranslation, TranslationType, ValidateTranslation } from '../../index';

let test: EnsureValidTranslation<ValidateTranslation<typeof en>> = 0;
void test;
const en = {
	test: 'Hello {who:string|capitalize}!',
	nested: {
		deep: {
			again: 'Nested again {value:number|number}',
		},
	},
	// Key not used test2_none
	test2_one: 'Plural one', 
	test2_other: 'Plural: {count}',
	customFormatter: 'Test formatter {data|customFormatter}'
} as const;

export default en;