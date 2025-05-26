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
		example_other: 'Hay {count} elementos',
	}
} as const;

type DotNestedLeafKeys<T> = {
	[K in keyof T]: K extends string
	? T[K] extends Record<string, any>
	? `${K}.${DotNestedLeafKeys<T[K]>}`
	: K
	: never
}[keyof T];

// Helper to resolve value at dot-notated path
type GetValue<T, Path extends string> =
	Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? GetValue<T[K], Rest>
	: never
	: Path extends keyof T
	? T[Path]
	: never;

type exampleGetValue = GetValue<typeof translations, 'nested.nestedTest'>;

type ExtractPlaceholders<S> =
	S extends `${string}{${infer Param}}${infer Rest}`
	? Param | ExtractPlaceholders<Rest>
	: never;

type InterpolationProps<S> =
	ExtractPlaceholders<S> extends never
	? {}
	: Record<ExtractPlaceholders<S>, string | number>;


type Flatten<T> = {
	[K in DotNestedLeafKeys<T>]: {
		value: GetValue<T, K>;
		properties: GetValue<T, K> extends string ? InterpolationProps<GetValue<T, K>> : {};
	}
};

export function translate<
	T extends typeof translations,
	K extends DotNestedLeafKeys<T>
>(
	key: K,
	...args: InterpolationProps<GetValue<T, K>> extends Record<string, never>
		? []  // No params needed if no placeholders
		: [params: InterpolationProps<GetValue<T, K>>]  // Params required if placeholders exist
): GetValue<T, K> {
	const parts = key.split('.');
	let current = translations;
	for (const part of parts) {
		// @ts-expect-error
		current = current[part];
	}
	if (typeof current !== 'string') {
		return key as GetValue<T, K>;
	}
	let value = current as string;

	const params = args[0];
	if (params) {
		for (const [param, val] of Object.entries(params)) {
			value = value.replace(new RegExp(`{${param}}`, 'g'), String(val));
		}
	}

	return value as GetValue<T, K>;
}
