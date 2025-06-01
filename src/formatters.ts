import type { ValueType } from "./index.js";

export type Formatter = (value: ValueType, locale: string) => string;

const formatters = {
	lowercase: (value) => value?.toString().toLowerCase() ?? '',
	uppercase: (value) => value?.toString().toUpperCase() ?? '',
	capitalize: (value) => value ? (value.toString().charAt(0).toUpperCase() + value.toString().slice(1)) : '',
	void: () => '',
	weekday: (value) => new Date(value?.toString() ?? '').toLocaleDateString('en-US', { weekday: 'long' }),
	number: (value, locale) => new Intl.NumberFormat(locale).format(Number(value)),
	json: (value) => JSON.stringify(value),
	currency: (value, locale) => new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'USD'
	}).format(Number(value)),
} as const satisfies Record<string, Formatter>;

export default formatters;