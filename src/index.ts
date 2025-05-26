const translations = {
	test: 'Hola Soy Un Test',
	nested: {
		nestedTest: 'Hola Soy Un Test Anidado',
	},
	withValue: {
		hello: 'Hola {nombre}',
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
//    ^? string

type ExtractPlaceholders<S> =
	S extends `${string}{${infer Param}}${infer Rest}`
	? Param | ExtractPlaceholders<Rest>
	: never;
type exampleExtractPlaceholders = ExtractPlaceholders<'Hola {nombre} {pepe}'>;
//    ^? 'nombre'

type InterpolationProps<S> =
	ExtractPlaceholders<S> extends never
	? {}
	: Record<ExtractPlaceholders<S>, string | number>;

type exampleInterpolationProps = InterpolationProps<'Hola {nombre} {pepe}'>;
//    ^?


type Flatten<T> = {
	[K in DotNestedLeafKeys<T>]: {
		value: GetValue<T, K>;
		properties: GetValue<T, K> extends string ? InterpolationProps<GetValue<T, K>> : {};
	}
};

type exampleFlatten = Flatten<typeof translations>;
//    ^? {


const translate = <
	T,
	K extends DotNestedLeafKeys<T>,
	P extends InterpolationProps<GetValue<T, K>>
>(
	obj: T,
	key: K,
	params?: P
) => {
	const parts = key.split('.');
	let current = obj;
	for (const part of parts) {
		// @ts-expect-error
		current = current[part];
	}
	if (typeof current !== 'string') {
		return key as GetValue<T, K>;
	}
	let value = current as string;

	if (params) {
		for (const [param, val] of Object.entries(params)) {
			value = value.replace(new RegExp(`{${param}}`, 'g'), String(val));
		}
	}

	return value as GetValue<T, K>;
};


const translation = translate(translations, 'test');
//    ^? string

const translation2 = translate(translations, 'nested.nestedTest');
//    ^? string

const translation3 = translate(translations, 'nested.noFunciona');
//    ^? string

const translation4 = translate(translations, 'withValue.hello', { nombre: 'Juan' });

console.log(translation);
console.log(translation2);
console.log(translation3);
console.log(translation4);