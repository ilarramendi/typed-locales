const en = {
	test: 'Regular translation',
	nested: {
		test: 'Nested translation',
	},
	withValue: 'With value {value}',
	// Key dosnt need to include plural, its just for the example
	examplePlural_none: 'No elements',
	examplePlural_one: 'One element',
	examplePlural_other: '{count} elements',
	examplePluralWithOtherValues_none: 'No elements and {name}',
	examplePluralWithOtherValues_one: 'One element and {name}',
	examplePluralWithOtherValues_other: '{count} elements and {name} or {name2}',
} as const;

export type NamespaceShape = DeepStringify<typeof en>;

type DeepStringify<T> = {
	[K in keyof T]: T[K] extends string ? string : T[K] extends object ? DeepStringify<T[K]> : never;
};

export default en;