import en from "./src/translations/en";
import type { Simplify, DeepStringify, RemoveReadonlyDeep } from "./src/index";

type Formatters = 'uppercase' | 'lowercase'

type ErrorMessage<Value extends string, T extends string> = `🚫 You are using an invalid formatter: ${T} in: "${Value}"`;

// Extract formatter from {data|formatter} pattern
type ExtractFormatter<T extends string> =
	T extends `${string}{${string}|${infer F}}${string}` ? F : never;

type CountOpenBraces<T extends string, Count extends readonly unknown[] = []> =
	T extends `${infer First}${infer Rest}`
	? First extends '{'
	? CountOpenBraces<Rest, [...Count, unknown]>
	: CountOpenBraces<Rest, Count>
	: Count['length']

// Type to count closing braces  
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
	: `🚫 Brackets are not balanced in: "${T}"` // Brackets are not balanced

// Validate formatter and return error message if invalid
type ValidateFormatter<T extends string> =
	ExtractFormatter<T> extends never
	? BalancedBraces<T> // No formatter found
	: ExtractFormatter<T> extends Formatters
	? BalancedBraces<T> // Valid formatter
	: ErrorMessage<T, ExtractFormatter<T>>; // Invalid formatter


// Main validation type
type InternalValidateTranslation<T, KeyPath extends string = ''> = T extends Record<string, any>
	? { [K in keyof T]: InternalValidateTranslation<T[K], KeyPath extends '' ? K & string : `${KeyPath}.${K & string}`> }
	: T extends string
	? ValidateFormatter<T>
	: T;

export type ValidateTranslation<T> = RemoveReadonlyDeep<InternalValidateTranslation<T>>;

export type EnsureValidTranslation<T extends never> = T;

const example = {
	name: 'asd',
	status: 'testing {data}',
	user: {
		id: 1,
		email: 'test@example.com',
		testEmail: 'testing {data|caca}',
		profile: {
			bio: 'asd',
			description: 'this is a test',
			testDescription: 'asd',
			settings: {
				theme: 'asd',
				notifications: true,
				mode: 'test-mode',
				testMode: 'asd',
				advanced: {
					debugMode: true,
					environment: 'testing',
					testEnvironment: 'asd',
					cache: {
						enabled: true,
						type: 'test-cache',
						testCache: 'asd',
						size: 1,
					}
				}
			}
		}
	},
	config: {
		api: {
			baseUrl: 'asd',
			endpoint: 'https://test.api.com',
			testEndpoint: 'asd',
			timeout: 1,
		}
	}
} as const;

export type TranslationType = RemoveReadonlyDeep<ValidateTranslation<typeof en>>;
const test: TranslationType = en as RemoveReadonlyDeep<typeof en>;
console.log(test);