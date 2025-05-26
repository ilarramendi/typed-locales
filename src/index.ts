// Remove const from object type
export type DeepStringify<T> = {
	[K in keyof T]: T[K] extends string ? string : T[K] extends object ? DeepStringify<T[K]> : never;
};

// Given a key rmove the plural sufix
type RemovePluralSuffix<T extends string> = T extends `${infer Base}_none`
	? Base
	: T extends `${infer Base}_one`
	? Base
	: T extends `${infer Base}_other`
	? Base
	: T;

// Given a translations object returns a union of all possible keys
type DotNestedLeafKeys<T> = {
	[K in keyof T]: K extends string
	? T[K] extends Record<string, any>
	? `${K}.${DotNestedLeafKeys<T[K]>}`
	: RemovePluralSuffix<K>
	: never;
}[keyof T];

// Based on a string containing placeholders, return a union type of all the placeholder keys
type ExtractPlaceholders<S> = S extends `${string}{${infer Parameter}}${infer Rest}`
	? ExtractPlaceholders<Rest> | Parameter
	: never;

// Get a union of all possible values of a key (returns multiple if plural)
type GetValue<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? GetValue<T[K], Rest>
	: never
	: Path extends keyof T
	? T[Path]
	:
	| (`${Path}_none` extends keyof T ? T[`${Path}_none`] : never)
	| (`${Path}_one` extends keyof T ? T[`${Path}_one`] : never)
	| (`${Path}_other` extends keyof T ? T[`${Path}_other`] : never) extends never
	? never
	:
	| (`${Path}_none` extends keyof T ? T[`${Path}_none`] : never)
	| (`${Path}_one` extends keyof T ? T[`${Path}_one`] : never)
	| (`${Path}_other` extends keyof T ? T[`${Path}_other`] : never);

// Given a key and a plural boolean returns the properties object required for that key
type InterpolationProperties<S, Plural extends boolean> =
	ExtractPlaceholders<S> extends never
	? Plural extends true
	? { count: number }
	: {}
	: Plural extends true
	? { count: number } & {
		[K in Exclude<ExtractPlaceholders<S>, 'count'>]: ValueType;
	}
	: {
		[K in ExtractPlaceholders<S>]: ValueType
	};

// Given a key returns if its plural
type IsPlural<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
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



// Transform a complex typescript union object to a simple type
type Simplify<T> = {
	[K in keyof T]: T[K];
	// eslint-disable-next-line sonarjs/no-useless-intersection
} & {};

// Possible value types passed as parameters
type ValueType = null | number | string | undefined;

// Given a translations object returns a function that can be used to translate keys
export const getTranslate = <Translations>(translations: Translations) => {
	type PossibleKeys = DotNestedLeafKeys<Translations>;

	/**
	 * Given a key returns the translated value
	 * Supports nested keys, substitutions and plurals
	 */
	function translate<
		Key extends PossibleKeys
	>(
			key: Key,
			...arguments_: InterpolationProperties<
				GetValue<Translations, Key>,
				IsPlural<Translations, Key>
			> extends Record<string, never>
				? []
				: [
					params: Simplify<
						InterpolationProperties<GetValue<Translations, Key>, IsPlural<Translations, Key>>
					>,
				]
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

		// eslint-disable-next-line sonarjs/different-types-comparison
		if (current === undefined) {
			console.error(`Translation key "${key}" not found`);

			return key as unknown as Value;
		}

		if (typeof current === 'object') {
			// If its an object being returned check if its a plural key
			const isPlural =
				// @ts-expect-error
				current[`${parts.at(-1)}_none`] !== undefined ||
				// @ts-expect-error
				current[`${parts.at(-1)}_one`] !== undefined ||
				// @ts-expect-error
				current[`${parts.at(-1)}_other`] !== undefined;
			if (isPlural) {
				if (!arguments_[0] || !Object.hasOwn(arguments_[0], 'count')) {
					console.error(`Missing count value for plural key "${key}"`);

					return key as unknown as Value;
				}
				// @ts-expect-error
				const count = Number(arguments_[0].count);
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
		const parameters = arguments_[0];
		if (parameters) {
			for (const [parameter, value_] of Object.entries(parameters)) {
				value = value.replaceAll(`{${parameter}}`, String(value_));
			}
		}

		return value as Value;
	}

	return translate;
};
