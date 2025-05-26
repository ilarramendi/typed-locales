const translations = {
	test: 'Hola Soy Un Test',
	nested: {
		nestedTest: 'Hola Soy Un Test Anidado',
	},
	withValue: {
		hello: 'Hola {nombre}',
	},
	plural: {
		example_none: 'No hay nada',
		example_one: 'Hay un elemento',
		withOtherValues_none: 'No hay nada y {nombre}',
		withOtherValues_one: 'Hay {count} elemento y {nombre}',
		withOtherValues_other: 'Hay {count} elementos y {nombre}',
	}
} as const;

type RemovePluralSuffix<T extends string> = T extends `${infer Base}_none`
	? Base
	: T extends `${infer Base}_one`
	? Base
	: T extends `${infer Base}_other`
	? Base
	: T;

type DotNestedLeafKeys<T> = {
	[K in keyof T]: K extends string
	? T[K] extends Record<string, any>
	? `${K}.${DotNestedLeafKeys<T[K]>}`
	: RemovePluralSuffix<K>
	: never
}[keyof T];

type GetValue<T, Path extends string> =
	Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? GetValue<T[K], Rest>
	: never
	: Path extends keyof T
	? T[Path]
	: (`${Path}_none` extends keyof T ? T[`${Path}_none`] : never) |
	(`${Path}_one` extends keyof T ? T[`${Path}_one`] : never) |
	(`${Path}_other` extends keyof T ? T[`${Path}_other`] : never) extends never
	? never
	: (`${Path}_none` extends keyof T ? T[`${Path}_none`] : never) |
	(`${Path}_one` extends keyof T ? T[`${Path}_one`] : never) |
	(`${Path}_other` extends keyof T ? T[`${Path}_other`] : never);

type IsPlural<T, Path extends string> =
	Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? IsPlural<T[K], Rest>
	: never
	: `${Path}_none` extends keyof T
	? true
	: `${Path}_one` extends keyof T
	? true
	: `${Path}_other` extends keyof T
	? true
	: false;

// Based on a string containing placeholders, return a union type of all the placeholder keys
type ExtractPlaceholders<S> =
	S extends `${string}{${infer Param}}${infer Rest}`
	? Param | ExtractPlaceholders<Rest>
	: never;

type exampleExtractPlaceholders = ExtractPlaceholders<GetValue<typeof translations, 'plural.withOtherValues'>>;

type InterpolationProps<S, Plural extends boolean> =
	ExtractPlaceholders<S> extends never
	? Plural extends true
	? { count: number }
	: {}
	: Plural extends true
	? Omit<Record<ExtractPlaceholders<S>, string | number>, 'count'> & { count: number }
	: Record<ExtractPlaceholders<S>, string | number>;

type Simplify<T> = {
	[K in keyof T]: T[K]
} & {}

export function translate<
	Translations extends typeof translations,
	Value extends GetValue<Translations, Key>,
	Key extends DotNestedLeafKeys<Translations>,
	Plural extends IsPlural<Translations, Key>,
>(
	key: Key,
	...args: InterpolationProps<Value, Plural> extends Record<string, never>
		? []  // No params needed if no placeholders
		: [params: Simplify<InterpolationProps<Value, Plural>>]  // Params required if placeholders exist
): Value {
	const parts = key.split('.');
	let current = translations;
	for (const part of parts) {
		// @ts-expect-error
		current = current[part];
	}
	if (typeof current !== 'string') {
		return key as unknown as Value;
	}
	let value = current as string;

	const params = args[0];
	if (params) {
		for (const [param, val] of Object.entries(params)) {
			value = value.replace(new RegExp(`{${param}}`, 'g'), String(val));
		}
	}

	return value as Value;
}
