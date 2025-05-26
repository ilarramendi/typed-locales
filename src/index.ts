export type DeepStringify<T> = {
	[K in keyof T]: T[K] extends string ? string : T[K] extends object ? DeepStringify<T[K]> : never;
};

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

type InterpolationProperties<S, Plural extends boolean> =
	ExtractPlaceholders<S> extends never
	? Plural extends true
	? { count: number }
	: {}
	: Plural extends true
	? Omit<Record<ExtractPlaceholders<S>, ValueType>, 'count'> & { count: number }
	: Record<ExtractPlaceholders<S>, ValueType>;

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

type RemovePluralSuffix<T extends string> = T extends `${infer Base}_none`
	? Base
	: T extends `${infer Base}_one`
	? Base
	: T extends `${infer Base}_other`
	? Base
	: T;

type Simplify<T> = {
	[K in keyof T]: T[K];
	// eslint-disable-next-line sonarjs/no-useless-intersection
} & {};

type ValueType = null | number | string | undefined;

export const getTranslate = <Translations>(translations: Translations) => {
	const translate = <Key extends DotNestedLeafKeys<Translations>>(
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
	): GetValue<Translations, Key> => {
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
	};

	return translate;
};
