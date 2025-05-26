import type { NamespaceShape } from './en';

const es: NamespaceShape = {
	test: 'Traducción regular',
	nested: {
		test: 'Traducción anidada',
	},
	withValue: 'Con valor {value}',
	// Key dosnt need to include plural, its just for the example
	examplePlural_none: 'No elementos',
	examplePlural_one: 'Un elemento',
	examplePlural_other: '{count} elementos',
	examplePluralWithOtherValues_none: 'No elementos y {name}',
	examplePluralWithOtherValues_one: 'Un elemento y {name}',
	examplePluralWithOtherValues_other: '{count} elementos y {name} o {name2}',
};

export default es;