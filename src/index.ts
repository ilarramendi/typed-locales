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

const getValue = (
	key: string,
	translations: any,
	parameters: Record<string, any> | undefined,
	silent: boolean
): string | undefined => {
	const parts = key.split('.');
	let current = translations;

	for (const [index, part] of parts.entries()) {
		if (typeof current[part] === 'string') {
			return current[part];
		}

		if (current[part] !== undefined) {
			current = current[part];
		} else if (index === parts.length - 1) {
			// Handle plural keys
			if (pluralSufixes.some(sufix => current[part + sufix] !== undefined)) {
				const lastPart = parts.at(-1)!;
				const count = Number(parameters?.count ?? 0);
				const none = current[`${lastPart}_none`];
				const one = current[`${lastPart}_one`];
				const other = current[`${lastPart}_other`];

				if (!count && typeof none === 'string') {
					return none;
				} else if (count === 1 && typeof one === 'string') {
					return one;
				} else if (typeof other === 'string') {
					return other;
				} else {
					if (!silent) {
						console.warn(
							`'Missing plural translation for key "${key}" with count: ${count}`
						);
					}
					return undefined;
				}
			}
		}
	}

	if (!silent) {
		console.error(`Missing translation for key "${key}"`);
	}
	return undefined;
};

type OptionsType = {
	fallback?: string;
};

// Runtime implementation remains the same
export const getTranslate = (
	translations: TranslationType,
	locale: Locales,
	extraFormatters: ExtraFormatters
) => {
	const formatters = { ...baseFormatters, ...extraFormatters };

	function translate<Key extends PossibleTranslationKeys>(
		key: Key,
		...arguments_: InterpolationProperties<Key> extends Record<string, never>
			? [params?: undefined, options?: OptionsType]
			: Key extends PossibleTranslationKeys
				? [params: InterpolationProperties<Key>, options?: OptionsType]
				: [params?: undefined, options?: OptionsType]
	): GetValue<Key> & TranslatedMark {
		const options = arguments_[1];
		const parameters = arguments_[0] as Record<string, ValueType>;
		type Value = GetValue<Key> & TranslatedMark;

		let value =
			getValue(key, translations, parameters, Boolean(options?.fallback)) ??
			options?.fallback ??
			key;

		if (parameters) {
			for (const [parameter, value_] of Object.entries(parameters)) {
				value = value?.replaceAll(
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

/**
 * @description Convert import.meta.glob to a record of locales and the function to import the translations
 * @param files - The files to convert
 * @returns A record of locales and the function to import the translations
 * @example
 * ```ts
 * const translations = translationsFromImportMeta(import.meta.glob('../translations/*.ts'));
 * ```
 */
export const translationsFromImportMeta = (files: Record<string, any>) =>
	Object.fromEntries(
		Object.entries(files).map(([key, value]) => [
			key.split('/').at(-1)!.replace('.ts', ''),
			value,
		])
	) as Record<Locales, () => Promise<{ default: object }>>;
