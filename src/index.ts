import baseFormatters from './formatters';

type BaseFormatters = keyof typeof baseFormatters;

// Remove const from object type
export type DeepStringify<T> = {
	[K in keyof T]: T[K] extends string ? string : T[K] extends object ? DeepStringify<T[K]> : never;
};

// Plural suffixes as a union type
type PluralSuffix = '_none' | '_one' | '_other';

export type TranslationType = {
	[key: string]: string | TranslationType;
};

// Remove plural suffix from a key
type RemovePluralSuffix<T extends string> = T extends `${infer Base}${PluralSuffix}` ? Base : T;

// Get all plural keys for a base key
type PluralKeys<Base extends string> = `${Base}_none` | `${Base}_one` | `${Base}_other`;

// Given a translations object returns a union of all possible keys
type DotNestedLeafKeys<T> = {
	[K in keyof T]: K extends string
	? T[K] extends Record<string, any>
	? `${K}.${DotNestedLeafKeys<T[K]>}`
	: RemovePluralSuffix<K>
	: never;
}[keyof T];


// Extract placeholders from a string
type ExtractPlaceholders<S, Formatters extends string> = S extends `${string}{${infer Parameter}}${infer Rest}`
	? ExtractPlaceholders<Rest, Formatters> | (Parameter extends `${infer Field}|${Formatters}` ? Field : Parameter)
	: never;

// Check if the key is plural
type HasPluralKeys<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? HasPluralKeys<T[K], Rest>
	: false
	: PluralKeys<Path> & keyof T extends never
	? false
	: true;
type IsPlural<T, Path extends string> = HasPluralKeys<T, Path>;

// Get value(s) for a key (handles both regular and plural)
type GetValue<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? GetValue<T[K], Rest>
	: never
	: Path extends keyof T
	? T[Path]
	: T[PluralKeys<Path> & keyof T];

// Interpolation properties based on key type
type InterpolationProperties<S, IsPlural extends boolean, Formatters extends string> =
	IsPlural extends true
	? { count: number } & Record<Exclude<ExtractPlaceholders<S, Formatters>, 'count'>, ValueType>
	: ExtractPlaceholders<S, Formatters> extends never
	? {}
	: Record<ExtractPlaceholders<S, Formatters>, ValueType>;

// Transform a complex typescript union object to a simple type
type Simplify<T> = {
	[K in keyof T]: T[K];
	// eslint-disable-next-line sonarjs/no-useless-intersection
} & {};

// Possible value types passed as parameters
type ValueType = null | number | string | undefined;


// Given a translations object returns a function that can be used to translate keys
export const getTranslate = <
	Translations,
	ExtraFormattersType extends string = string,
	ExtraFormatters extends Record<ExtraFormattersType, (value: string) => string> = Record<ExtraFormattersType, (value: string) => string>,
>(translations: Translations, extraFormatters?: ExtraFormatters) => {
	type PossibleKeys = DotNestedLeafKeys<Translations>;
	const formatters = { ...baseFormatters, ...extraFormatters };
	type Formatters = BaseFormatters | ExtraFormattersType;

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
				IsPlural<Translations, Key>,
				Formatters
			> extends Record<string, never>
				? []
				: [
					params: Simplify<
						InterpolationProperties<GetValue<Translations, Key>, IsPlural<Translations, Key>, Formatters>
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
				value = value.replaceAll(new RegExp(`{${parameter}(\\|[a-z|]+)?}`, 'g'), (match, formatters_) => {
					const parsedFormatters = (formatters_?.split('|').filter(Boolean) ?? []) as (keyof typeof formatters)[];
					let formattedValue = String(value_);
					for (const formatter of parsedFormatters) {
						if (!formatters[formatter]) {
							console.error(`Formatter "${formatter}" not found used in key "${key}"`);

							return match;
						}
						formattedValue = formatters[formatter](formattedValue);
					}
					return formattedValue;
				});
			}
		}

		return value as Value;
	}

	return translate;
};
