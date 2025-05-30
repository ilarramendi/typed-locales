import type { FormatterTypes } from "./index";

type ErrorMessage<Value extends string, T extends string> = `You are using an invalid formatter: ${T} in: "${Value}"`;

// Extract formatter from {data|formatter} pattern
type ExtractFormatter<T extends string> =
	T extends `${string}{${string}|${infer F}}${string}` ? F : never;

type CountOpenBraces<T extends string, Count extends readonly unknown[] = []> =
	T extends `${infer First}${infer Rest}`
	? First extends '{'
	? CountOpenBraces<Rest, [...Count, unknown]>
	: CountOpenBraces<Rest, Count>
	: Count['length']

type CountCloseBraces<T extends string, Count extends readonly unknown[] = []> =
	T extends `${infer First}${infer Rest}`
	? First extends '}'
	? CountCloseBraces<Rest, [...Count, unknown]>
	: CountCloseBraces<Rest, Count>
	: Count['length']

// Main type that ensures balanced braces
type BalancedBraces<T extends string> =
	CountOpenBraces<T> extends CountCloseBraces<T>
	? never // Brackets are balanced
	: `Brackets are not balanced in: "${T}"` // Brackets are not balanced

// Validate formatter and return error message if invalid
type ValidateFormatter<T extends string> =
	ExtractFormatter<T> extends never
	? BalancedBraces<T> // No formatter found
	: ExtractFormatter<T> extends FormatterTypes
	? BalancedBraces<T> // Valid formatter
	: ErrorMessage<T, ExtractFormatter<T>>; // Invalid formatter

// Main validation type
type InternalValidateTranslation<T, KeyPath extends string = ''> = T extends Record<string, any>
	? { [K in keyof T]: InternalValidateTranslation<T[K], KeyPath extends '' ? K & string : `${KeyPath}.${K & string}`> }
	: T extends string
	? ValidateFormatter<T>
	: never;

type RemoveNeverDeep<T> = T extends Record<string, any>
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
 * Utility type to check if translation brackets are used incorrectly or a invalid formatter is used
 * 
 * Should be used with EnsureValidTranslation
 * */ 
export type ValidateTranslation<T> = RemoveNeverDeep<InternalValidateTranslation<T>>;

/**
 * Utility type to ensure there is no validation errors
 * 
 * */ 
export type EnsureValidTranslation<T extends never> = T | number;