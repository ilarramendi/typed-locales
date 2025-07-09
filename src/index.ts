/* eslint-disable no-unused-vars */
import baseFormatters from './formatters.js';
import formatters, { type Formatter } from './formatters.js';

// Possible value types passed as parameters
export type ValueType = null | number | string | undefined | object;

// Type mapping from string type names to TypeScript types
export type TypeMap = {
	string: string;
	number: number;
	boolean: boolean;
	object: object;
	array: any[];
	null: null;
	undefined: undefined;
	any: any;
};

export interface DefaultOverrides {
	shape: object;
	extraFormatters?: Record<string, Formatter>;
	locales: string;
	validateFormatters: true;
}

export interface Overrides extends DefaultOverrides {}
export type Translations = Overrides['shape'];

/** Shape of the translation, used to ensure translations match */
export type TranslationType = DeepResolve<
	GenerateTranslationType<Translations>
>;

export type Locales = Overrides['locales'];
/** All possible translation keys */
export type PossibleTranslationKeys = DotNestedStringKeys<Translations>;
export type ExtraFormatters = Overrides['extraFormatters'];
/** Base formatters + Custom formatters */
export type FormatterTypes = keyof ExtraFormatters | keyof typeof formatters;
export type TranslateFunctionType = ReturnType<typeof getTranslate>;

type TranslatedMark = { translated: true };

/** Ensure a string is translated */
export type TranslatedString = string & TranslatedMark;

export type InterpolationProperties<
	Key extends PossibleTranslationKeys,
	Value extends string = GetValue<Key>,
> =
	IsPlural<Key> extends true
		? { count: number } & Omit<ExtractParams<Value>, 'count'>
		: ExtractParams<Value>;

type ExtractParams<Value extends string> =
	Value extends `${infer _}{${infer _}}${infer _}`
		? PlaceholderInfoToObject<ExtractPlaceholders<Value>>
		: {};

const pluralSufixes = ['_none', '_one', '_other'] as const;
type PluralSuffix = (typeof pluralSufixes)[number];

type BaseTranslationType = {
	[K: string]: string | BaseTranslationType;
};

type FilterByPrefix<
	T,
	Prefix extends string,
> = T extends `${Prefix}.${infer Rest}` ? Rest : never;

type RemovePluralSuffix<T extends string> = T extends `${infer Base}_none`
	? Base
	: T extends `${infer Base}_one`
		? Base
		: T extends `${infer Base}_other`
			? Base
			: T;

// Get all plural keys for a base key
type PluralKeys<Base extends string> = `${Base}${PluralSuffix}`;

type DotNestedStringKeys<T, Prefix extends string = ''> = T extends object
	? {
			[K in keyof T]: K extends string
				? T[K] extends Record<string, any>
					? DotNestedStringKeys<T[K], `${Prefix}${K}.`>
					: `${Prefix}${RemovePluralSuffix<K>}`
				: never;
		}[keyof T]
	: never;

type DotNestedObjectKeys<T, Prefix extends string = ''> = T extends object
	? {
			[K in keyof T]: K extends string
				? T[K] extends Record<string, any>
					? `${Prefix}${K}` | DotNestedObjectKeys<T[K], `${Prefix}${K}.`>
					: never
				: never;
		}[keyof T]
	: never;

// Helper types to break down complexity
type IsPluralKey<K> = K extends
	| `${string}_none`
	| `${string}_one`
	| `${string}_other`
	? true
	: false;

type GetBasePluralKey<K> = K extends `${infer Base}_none`
	? Base
	: K extends `${infer Base}_one`
		? Base
		: K extends `${infer Base}_other`
			? Base
			: K;

// Pre-compute plural key mappings to avoid deep nesting
type PluralKeyVariants<Base extends string> =
	| `${Base}_none`
	| `${Base}_one`
	| `${Base}_other`;

type GenerateTranslationType<T, Depth extends number = 0> = Depth extends 6
	? any // Depth limit to prevent infinite recursion
	: {
			[K in keyof T]: T[K] extends object
				? GenerateTranslationType<T[K], [...Array<Depth>, 0]['length']>
				: string;
		};

type GeneratePluralTranslationType<
	T,
	Depth extends number = 0,
> = Depth extends 6
	? {} // Depth limit
	: {
			[K in keyof T as IsPluralKey<K> extends true
				? K | PluralKeyVariants<GetBasePluralKey<K & string>>
				: never]?: T[K] extends object
				? GeneratePluralTranslationType<T[K], [...Array<Depth>, 0]['length']>
				: string;
		};

type ExtractPlaceholders<
	T extends string,
	Acc = never,
> = T extends `${infer Start}{${infer P}}${infer Rest}`
	? Start extends `${infer _}{${infer _}`
		? Acc // Nested braces, skip
		: ExtractPlaceholders<Rest, Acc | ParsePlaceholder<P>>
	: Acc;

type ParsePlaceholder<P extends string> =
	P extends `${infer Name}:${infer Type}|${infer _}`
		? {
				name: Name;
				type: Type extends keyof TypeMap ? TypeMap[Type] : ValueType;
			}
		: P extends `${infer Name}:${infer Type}`
			? {
					name: Name;
					type: Type extends keyof TypeMap ? TypeMap[Type] : ValueType;
				}
			: P extends `${infer Name}|${infer _}`
				? { name: Name; type: ValueType }
				: { name: P; type: ValueType };

// Convert placeholder info union to object type
type PlaceholderInfoToObject<T> = {
	[K in T extends { name: infer N extends string; type: any }
		? N
		: never]: T extends { name: K; type: infer Type } ? Type : never;
};

// Check if the key is plural
type HasPluralKeys<
	T,
	Path extends string,
> = Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? HasPluralKeys<T[K], Rest>
		: false
	: PluralKeys<Path> & keyof T extends never
		? false
		: true;
type IsPlural<Path extends string> = HasPluralKeys<Translations, Path>;

type InternalGetValue<
	T,
	Path extends string,
> = Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? InternalGetValue<T[K], Rest>
		: string
	: Path extends keyof T
		? T[Path]
		: T[PluralKeys<Path> & keyof T] extends infer V
			? unknown extends V
				? string
				: Exclude<V, undefined>
			: string;
type GetValue<S extends PossibleTranslationKeys> = Exclude<
	InternalGetValue<Translations, S>,
	undefined
>;

export type DeepResolve<T> = T extends (...args: any[]) => any
	? T
	: T extends object
		? { -readonly [K in keyof T]: DeepResolve<T[K]> }
		: T;

// Runtime implementation remains the same
export const getTranslate = (
	translations: TranslationType,
	locale: Locales,
	extraFormatters: ExtraFormatters,
	baseTranslate?: (...props: any) => string
) => {
	const formatters = { ...baseFormatters, ...extraFormatters };

	function translate<Key extends PossibleTranslationKeys>(
		key: Key,
		...arguments_: InterpolationProperties<Key> extends Record<string, never>
			? []
			: Key extends PossibleTranslationKeys
				? [params: InterpolationProperties<Key>]
				: []
	): GetValue<Key> & TranslatedMark {
		type Value = GetValue<Key> & TranslatedMark;

		const parts = key.split('.');
		const parameters = arguments_[0] as Record<string, ValueType>;
		let current = translations as BaseTranslationType;
		let value = key as string;
		let isPlural = false;
		let lastPart = '';

		for (const part of parts) {
			if (current && current[part]) {
				if (typeof current[part] === 'string') {
					value = current[part];
					break;
				}
				current = current[part];
			} else {
				lastPart = parts.at(-1)!;
				isPlural = pluralSufixes.some(
					sufix => current[lastPart + sufix] !== undefined
				);
				if (!isPlural) {
					if (baseTranslate) {
						return baseTranslate(key, parameters) as Value;
					}
					console.error(`Translation key "${key}" not found`);
					return key as unknown as Value;
				}
			}
		}

		// Handle plural keys
		if (isPlural) {
			if (typeof parameters?.count === 'undefined') {
				if (baseTranslate) {
					return baseTranslate(key, parameters) as Value;
				}
				console.error(`Missing count value for plural key "${key}"`);
				return key as unknown as Value;
			}
			const count = Number(parameters.count);
			const none = current[`${lastPart}_none`];
			const one = current[`${lastPart}_one`];
			const other = current[`${lastPart}_other`];

			if (!count && typeof none === 'string') {
				value = none;
			} else if (count === 1 && typeof one === 'string') {
				value = one;
			} else if (typeof other === 'string') {
				value = other;
			} else if (baseTranslate) {
				return baseTranslate(key, parameters) as Value;
			} else {
				console.warn(
					`'Missing other translation for: ${key} with count ${count}`
				);
				return key as unknown as Value;
			}
		}

		if (parameters) {
			for (const [parameter, value_] of Object.entries(parameters)) {
				value = value.replaceAll(
					new RegExp(`{${parameter}(:\\w+)?(\\|[\\w|]+)?}`, 'g'),
					(match, _type, formatters_) => {
						const parsedFormatters = (formatters_?.split('|').filter(Boolean) ??
							[]) as FormatterTypes[];
						let formattedValue = value_;
						for (const formatter of parsedFormatters) {
							if (!formatters[formatter]) {
								console.error(
									`Non existing formatter "${formatter}" used in key "${key}"`
								);

								return match;
							}
							formattedValue = (formatters[formatter] as Formatter)(
								formattedValue,
								locale
							);
						}
						return String(formattedValue);
					}
				);
			}
		}

		return value as Value;
	}

	return translate;
};

export { initReact, useTranslation } from './adapters/react.js';
export { initZustand } from './adapters/zustand.js';

export { type Formatter, default as defaultFormatters } from './formatters.js';

export {
	type ValidateTranslation,
	type EnsureValidTranslation,
} from './validation.js';
