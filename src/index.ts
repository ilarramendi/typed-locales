

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

export function getTranslate<
	Translations
>(translations: Translations) {
	function translate<
		Key extends DotNestedLeafKeys<Translations>,
	>(
		key: Key,
		...args: InterpolationProps<GetValue<Translations, Key>, IsPlural<Translations, Key>> extends Record<string, never>
			? []
			: [params: Simplify<InterpolationProps<GetValue<Translations, Key>, IsPlural<Translations, Key>>>]
	): GetValue<Translations, Key> {
		type Value = GetValue<Translations, Key>;

		const parts = key.split('.');
		let current = translations;
		for (const part of parts) {
			// @ts-expect-error
			if (current && current[part]) {
				// @ts-expect-error
				current = current[part];
			} else {
				break;
			}
		}

		if (typeof current === 'undefined') {
			console.error(`Translation key "${key}" not found`);
			return key as unknown as Value;
		}

		if (typeof current === 'object') {
			// If its an object being returned check if its a plural key
			// @ts-expect-error
			const isPlural = current[`${parts.at(-1)}_none`] !== undefined || current[`${parts.at(-1)}_one`] !== undefined || current[`${parts.at(-1)}_other`] !== undefined;
			if (isPlural) {
				if (!args[0] || !Object.hasOwn(args[0], 'count')) {
					console.error(`Missing count value for plural key "${key}"`);
					return key as unknown as Value;
				}
				// @ts-expect-error
				const count = Number(args[0]?.count);
				if (!count) {
					// @ts-expect-error
					current = current[`${parts.at(-1)}_none`];
				} else if (count === 1) {
					// @ts-expect-error
					current = current[`${parts.at(-1)}_one`];
				} else {
					// @ts-expect-error
					current = current[`${parts.at(-1)}_other`];
				}
			} else {
				console.error(`Incomplete translation key "${key}"`);
				return key as unknown as Value;
			}
		}

		let value = String(current);
		const params = args[0];
		if (params) {
			for (const [param, val] of Object.entries(params)) {
				value = value.replaceAll(`{${param}}`, String(val));
			}
		}

		return value as Value;
	}

	return translate; 
}