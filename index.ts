import baseFormatters from './src/formatters';
import type { Formatter } from './src/formatters';

// Possible value types passed as parameters
type ValueType = null | number | string | undefined | object;

export interface DefaultOverrides {
	shape: any;
	extraFormatters?: Record<string, Formatter>;
	locales: string;
};
export interface Overrides  extends DefaultOverrides {};
export type Translations = Overrides['shape'];
export type Locales = Overrides['locales'];
export type BaseFormatters = typeof baseFormatters;
export type ExtraFormatters = Overrides['extraFormatters'];
export type Formatters = BaseFormatters | ExtraFormatters;
export type PossibleTranslationKeys = DotNestedLeafKeys<Translations>;

// Remove const from object type
export type InternalDeepStringify<T> = {
	[K in keyof T]: T[K] extends string ? string : T[K] extends object ? InternalDeepStringify<T[K]> : never;
};

export type DeepStringify<T> = RemoveReadonlyDeep<InternalDeepStringify<T>>;

export type InternalRemoveReadonlyDeep<T> = {
	-readonly [K in keyof T]: T[K] extends object ? InternalRemoveReadonlyDeep<T[K]> : T[K];
};

export type RemoveReadonlyDeep<T> = Simplify<InternalRemoveReadonlyDeep<T>>;


// Plural suffixes as a union type
type PluralSuffix = '_none' | '_one' | '_other';

export type TranslationType = {
	[key: string]: string | TranslationType;
};

// Remove plural suffix from a key
type RemovePluralSuffix<T extends string> = T extends `${infer Base}${PluralSuffix}` ? Base : T;

// Get all plural keys for a base key
type PluralKeys<Base extends string> = `${Base}${PluralSuffix}`;

// Given a translations object returns a union of all possible keys
type DotNestedLeafKeys<T> = {
	[K in keyof T]: K extends string
	? T[K] extends Record<string, any>
	? `${K}.${DotNestedLeafKeys<T[K]>}`
	: RemovePluralSuffix<K>
	: never;
}[keyof T];

// Given a string properties generated from the base translation, generate a generic string type for all translations
type GenerateStringFromProperties<T extends Record<string, any>> =
	T extends Record<string, never>
	? string
	: `${string}{${keyof T & string}${string}` | `${string}{${keyof T & string}|${string}}${string}`;


// TODO for multi value keys we have to merge the 
export type GenerateTranslationType<T> = {
	-readonly [K in keyof T]: T[K] extends object
	? Simplify<GenerateTranslationType<T[K]>>
	: GenerateStringFromProperties<InterpolationProperties<RemovePluralSuffix<T[K] & string>, IsPlural<T, RemovePluralSuffix<K & string>>>>;
};

// Extract placeholders from a string
type ExtractPlaceholders<T extends string> =
	T extends `${infer _Start}{${infer Placeholder}}${infer Rest}`
	? (Placeholder extends `${infer Name}|${infer _Formatters}`
		? Name
		: Placeholder) | ExtractPlaceholders<Rest>
	: never;

// Check if the key is plural
type HasPluralKeys<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? HasPluralKeys<T[K], Rest>
	: false
	: PluralKeys<Path> & keyof T extends never
	? false
	: true;
type IsPlural<Path extends string> = HasPluralKeys<Translations, Path>;

// Get value(s) for a key (handles both regular and plural)
type InternalGetValue<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? InternalGetValue<T[K], Rest>
	: never
	: Path extends keyof T
	? T[Path]
	: T[PluralKeys<Path> & keyof T];

type GetValue<Path extends string> = InternalGetValue<Translations, Path>;

// Interpolation properties based on key type
type InterpolationProperties<
	S extends string,
	IsPlural extends boolean,
> = IsPlural extends true
	? { count: number } & {
		[K in Exclude<ExtractPlaceholders<S>, 'count'>]: ValueType;
	}
	: ExtractPlaceholders<S> extends never
	? {}
	: {
		[K in ExtractPlaceholders<S>]: ValueType;
	};

// Transform a complex typescript union object to a simple type
type InternalSimplify<T> = {
	[K in keyof T]: InternalSimplify<T[K]>;
	// eslint-disable-next-line sonarjs/no-useless-intersection
} & {};

type DeepOmitNever<T> = {
	[K in keyof T as T[K] extends never 
		? never 
		: T[K] extends Record<string, any>
			? DeepOmitNever<T[K]> extends never
				? never
				: K
			: K
	]: T[K] extends Record<string, any>
		? DeepOmitNever<T[K]>
		: T[K];
} extends infer U
	? keyof U extends never
		? never
		: U
	: never;

// Given a complex object type simplify it
export type Simplify<T> = InternalSimplify<DeepOmitNever<T>>;

// Given a translations object returns a function that can be used to translate keys
export const getTranslate = (translations: Translations, locale: Locales, extraFormatters: ExtraFormatters) => {
	const formatters = { ...baseFormatters, ...extraFormatters } as Formatters;

	/**
	 * Given a key returns the translated value
	 * Supports nested keys, substitutions and plurals
	 */
	function translate<
		Key extends PossibleTranslationKeys
	>(
			key: Key,
			...arguments_: InterpolationProperties<
				GetValue<Key>,
				IsPlural<Key>
			> extends Record<string, never>
				? []
				: [
					params: Simplify<
						InterpolationProperties<GetValue<Key> & string, IsPlural<Key>>
					>,	
				]
	): GetValue<Key> {
		type Value = GetValue<Key>;

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
						formattedValue = formatters[formatter](formattedValue, locale);
					}
					return formattedValue;
				});
			}
		}

		return value as Value;
	}

	return translate;
};

export { initReact } from './src/react';

export { type Formatter, default as defaultFormatters } from './src/formatters';

export { type ValidateTranslation as ValidateTranslationInternal, type EnsureValidTranslation } from './src/validation';