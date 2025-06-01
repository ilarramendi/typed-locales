import type { FormatterTypes, TypeMap } from './index.js';

type ErrorMessage<
	Value extends string,
	T extends string,
> = `You are using an invalid formatter: ${T} in: "${Value}"`;
type InvalidTypeError<
	Value extends string,
	T extends string,
> = `You are using an invalid type: ${T} in: "${Value}"`;
type EmptyBracesError<Value extends string> =
	`Empty braces {} are not allowed in: "${Value}"`;

// Extract all type annotations from a string
type ExtractAllTypes<
	T extends string,
	Acc extends string = never,
> = T extends `${infer Before}{${infer Content}}${infer After}`
	? Content extends `${string}:${infer Type}|${string}`
		? ExtractAllTypes<After, Acc | Type>
		: Content extends `${string}:${infer Type}`
			? ExtractAllTypes<After, Acc | Type>
			: ExtractAllTypes<After, Acc>
	: Acc;

// Extract all formatters from a string
type ExtractAllFormatters<
	T extends string,
	Acc extends string = never,
> = T extends `${infer Before}{${infer Content}}${infer After}`
	? Content extends `${string}|${infer Formatters}`
		? ExtractAllFormatters<After, Acc | ExtractFormatterList<Formatters>>
		: ExtractAllFormatters<After, Acc>
	: Acc;

// Extract individual formatters from a pipe-separated list
type ExtractFormatterList<T extends string> =
	T extends `${infer F}|${infer Rest}` ? F | ExtractFormatterList<Rest> : T;

type CountOpenBraces<
	T extends string,
	Count extends readonly unknown[] = [],
> = T extends `${infer First}${infer Rest}`
	? First extends '{'
		? CountOpenBraces<Rest, [...Count, unknown]>
		: CountOpenBraces<Rest, Count>
	: Count['length'];

type CountCloseBraces<
	T extends string,
	Count extends readonly unknown[] = [],
> = T extends `${infer First}${infer Rest}`
	? First extends '}'
		? CountCloseBraces<Rest, [...Count, unknown]>
		: CountCloseBraces<Rest, Count>
	: Count['length'];

// Main type that ensures balanced braces
type BalancedBraces<T extends string> =
	CountOpenBraces<T> extends CountCloseBraces<T>
		? never // Brackets are balanced
		: `Brackets are not balanced in: "${T}"`; // Brackets are not balanced

// Check for empty braces {}
type HasEmptyBraces<T extends string> = T extends `${string}{}${string}`
	? EmptyBracesError<T>
	: never;

// Validate type annotations
type ValidateTypes<T extends string> =
	ExtractAllTypes<T> extends never
		? never // No types found
		: Exclude<ExtractAllTypes<T>, keyof TypeMap> extends never
			? never // All types are valid
			: InvalidTypeError<T, Exclude<ExtractAllTypes<T>, keyof TypeMap>>; // Invalid type found

// Validate formatters
type ValidateFormatters<T extends string> =
	ExtractAllFormatters<T> extends never
		? never // No formatters found
		: Exclude<ExtractAllFormatters<T>, FormatterTypes> extends never
			? never // All formatters are valid
			: ErrorMessage<T, Exclude<ExtractAllFormatters<T>, FormatterTypes>>; // Invalid formatter found

// Combined validation
type ValidateTranslationString<T extends string> =
	| BalancedBraces<T>
	| HasEmptyBraces<T>
	| ValidateTypes<T>
	| ValidateFormatters<T>;

// Main validation type
type InternalValidateTranslation<T, KeyPath extends string = ''> =
	T extends Record<string, any>
		? {
				[K in keyof T]: InternalValidateTranslation<
					T[K],
					KeyPath extends '' ? K & string : `${KeyPath}.${K & string}`
				>;
			}
		: T extends string
			? ValidateTranslationString<T>
			: never;

type RemoveNeverDeep<T> =
	T extends Record<string, any>
		? {
				-readonly [K in keyof T as T[K] extends Record<string, any>
					? RemoveNeverDeep<T[K]> extends never
						? never
						: K
					: [T[K]] extends [never]
						? never
						: K]: T[K] extends Record<string, any>
					? RemoveNeverDeep<T[K]>
					: T[K];
			} extends Record<string, never>
			? never
			: {
					-readonly [K in keyof T as T[K] extends Record<string, any>
						? RemoveNeverDeep<T[K]> extends never
							? never
							: K
						: [T[K]] extends [never]
							? never
							: K]: T[K] extends Record<string, any>
						? RemoveNeverDeep<T[K]>
						: T[K];
				}
		: T;

/**
 * Utility type to check if translation brackets are used incorrectly,
 * invalid formatter is used, invalid type annotation is used, or empty braces are present
 *
 * Should be used with EnsureValidTranslation
 * */
export type ValidateTranslation<T> = RemoveNeverDeep<
	InternalValidateTranslation<T>
>;

/**
 * Utility type to ensure there is no validation errors
 *
 * Example on how to use without any extra eslint/ts errors except for the validations
 *
 * ```
 * const validations: EnsureValidTranslation<ValidateTranslation<typeof en>> = 0;
 * void validations;
 * ```
 *
 * where `en` is your translation with `as const`
 * */
export type EnsureValidTranslation<T extends never> = T | any;
