import baseFormatters from "./formatters.js";
import formatters, { type Formatter } from "./formatters.js";

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
export interface Overrides extends DefaultOverrides { }
export type Translations = Overrides["shape"];
export type TranslationType = DeepResolve<GenerateTranslationType<Translations>>
export type Locales = Overrides["locales"];
export type PossibleTranslationKeys = DotNestedLeafKeys<Translations>;
export type ExtraFormatters = Overrides['extraFormatters'];
export type FormatterTypes = keyof ExtraFormatters | keyof typeof formatters;
// TODO add more
const pluralSufixes = ["_none", "_one", "_other"] as const;
type PluralSuffix = (typeof pluralSufixes)[number];

type BaseTranslationType = {
	[K: string]: string | BaseTranslationType
}

// Remove plural suffix from a key
type RemovePluralSuffix<T extends string> =
	T extends `${infer Base}${PluralSuffix}` ? Base : T;

// Get all plural keys for a base key
type PluralKeys<Base extends string> = `${Base}${PluralSuffix}`;

type DotNestedLeafKeys<T> = {
	[K in keyof T]: K extends string
	? T[K] extends Record<string, any>
	? `${K}.${DotNestedLeafKeys<T[K]>}`
	: RemovePluralSuffix<K>
	: never;
}[keyof T];


export type GenerateTranslationType<T> = {
	[K in keyof T as IsPlural<RemovePluralSuffix<K & string>> extends true
	? never
	: K
	]: T[K] extends object ? GenerateTranslationType<T[K]> : string
} & {
	[K in keyof T as IsPlural<RemovePluralSuffix<K & string>> extends true
	? K | PluralKeys<RemovePluralSuffix<K & string>>
	: never
	]?: T[K] extends object ? GenerateTranslationType<T[K]> : string
};

// Extract placeholder info including name and type
type ExtractPlaceholderInfo<T extends string> =
	T extends `${infer Name}:${infer Type}|${infer _Rest}`
	? Type extends keyof TypeMap
	? { name: Name; type: TypeMap[Type] }
	: { name: Name; type: ValueType }
	: T extends `${infer Name}:${infer Type}`
	? Type extends keyof TypeMap
	? { name: Name; type: TypeMap[Type] }
	: { name: Name; type: ValueType }
	: T extends `${infer Name}|${infer _Rest}`
	? { name: Name; type: ValueType }
	: { name: T; type: ValueType };

// Extract all placeholders with their types from a string
type ExtractPlaceholdersWithTypes<T extends string, Acc = never> =
	T extends `${infer _Start}{${infer Placeholder}}${infer Rest}`
	? ExtractPlaceholdersWithTypes<Rest, Acc | ExtractPlaceholderInfo<Placeholder>>
	: Acc;

// Convert placeholder info union to object type
type PlaceholderInfoToObject<T> = {
	[K in T extends { name: infer N extends string; type: any } ? N : never]:
	T extends { name: K; type: infer Type } ? Type : never
};

// Extract placeholders from a string (for backward compatibility)
type ExtractPlaceholders<T extends string> =
	T extends `${infer _Start}{${infer Placeholder}}${infer Rest}`
	?
	| (Placeholder extends `${infer Name}:${infer _TypeAndFormatters}`
		? Name
		: Placeholder extends `${infer Name}|${infer _Formatters}`
		? Name
		: Placeholder)
	| ExtractPlaceholders<Rest>
	: never;

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

// Get value(s) for a key (handles both regular and plural)
type InternalGetValue<
	T,
	Path extends string,
> = Path extends `${infer K}.${infer Rest}`
	? K extends keyof T
	? InternalGetValue<T[K], Rest>
	: never
	: Path extends keyof T
	? T[Path]
	: T[PluralKeys<Path> & keyof T];

type GetValue<Path extends string> = Exclude<InternalGetValue<Translations, Path>, undefined>;

// Interpolation properties based on key type with type inference
type InterpolationProperties<
	S extends string,
	IsPlural extends boolean,
	forceCount extends boolean,
> = DeepResolve<IsPlural extends true
	? (forceCount extends true ? { count: number } : {}) &
	PlaceholderInfoToObject<Exclude<ExtractPlaceholdersWithTypes<S>, { name: "count"; type: any }>>
	: ExtractPlaceholders<S> extends never
	? {}
	: PlaceholderInfoToObject<ExtractPlaceholdersWithTypes<S>>>;

export type DeepResolve<T> = T extends (...args: any[]) => any
	? T
	: T extends object
	? { -readonly [K in keyof T]: DeepResolve<T[K]> }
	: T;

// Given a translations object returns a function that can be used to translate keys
export const getTranslate = (
	translations: TranslationType,
	locale: Locales,
	extraFormatters: ExtraFormatters,
	baseTranslate?: <Key extends PossibleTranslationKeys>(...props: any) => string
) => {
	const formatters = { ...baseFormatters, ...extraFormatters };

	function translate<Key extends PossibleTranslationKeys>(
		key: Key,
		...arguments_: InterpolationProperties<
			GetValue<Key>,
			IsPlural<Key>,
			true
		> extends Record<string, never>
			? []
			: Key extends PossibleTranslationKeys
			? [
				params: InterpolationProperties<
					GetValue<Key>,
					IsPlural<Key>,
					true
				>
			]
			: []
	): GetValue<Key> {
		type Value = GetValue<Key>;

		const parts = key.split(".");
		const parameters = arguments_[0] as Record<string, ValueType>;
		let current = translations as BaseTranslationType;
		let value = key as string;
		let isPlural = false;
		let lastPart = "";
		for (const part of parts) {
			if (current && current[part]) {
				if (typeof current[part] === "string") {
					value = current[part];
					break;
				}
				current = current[part];
			} else {
				lastPart = parts.at(-1)!;
				isPlural = pluralSufixes.some(
					(sufix) => current[lastPart + sufix] !== undefined,
				);
				if (!isPlural) {
					if (baseTranslate) {
						return baseTranslate(key, parameters) as Value;
					}
					console.error(`Translation key "${key}" not found`);
					return key as Value;
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
				return key as Value;
			}
			const count = Number(parameters.count);
			const none = current[`${lastPart}_none`];
			const one = current[`${lastPart}_one`];
			const other = current[`${lastPart}_other`];

			if (!count && typeof none === "string") {
				value = none;
			} else if (count === 1 && typeof one === "string") {
				value = one;
			} else if (typeof other === "string") {
				value = other;
			} else if (baseTranslate) {
				return baseTranslate(key, parameters) as Value;
			} else {
				console.warn(
					`'Missing other translation for: ${key} with count ${count}`,
				);
				return key as Value;
			}
		}

		if (parameters) {
			for (const [parameter, value_] of Object.entries(parameters)) {
				value = value.replaceAll(
					new RegExp(`{${parameter}(:\w+)?(\\|[\w|]+)?}`, "g"),
					(match, _type, formatters_) => {
						const parsedFormatters = (formatters_?.split("|").filter(Boolean) ??
							[]) as FormatterTypes[];
						let formattedValue = String(value_);
						for (const formatter of parsedFormatters) {
							if (!formatters[formatter]) {
								console.error(
									`Non existing formatter "${formatter}" used in key "${key}"`,
								);

								return match;
							}
							formattedValue = (formatters[formatter] as Formatter)(
								formattedValue,
								locale,
							);
						}
						return formattedValue;
					},
				);
			}
		}

		return value as Value;
	}

	return translate;
};

export { initReact } from "./react.js";

export { type Formatter, default as defaultFormatters } from "./formatters.js";

export {
	type ValidateTranslation,
	type EnsureValidTranslation,
} from "./validation.js";