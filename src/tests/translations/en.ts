import type { ValidateTranslation } from '../config';
import type { EnsureValidTranslation } from '../../validation';

type Test = EnsureValidTranslation<ValidateTranslation<typeof en>>;
const en = {
	test: 'Regular translation',
	nested: {
		test: 'Nested {translation|myCustomFormatter}',
		deep: {
			again: 'Nested again with {value} and {otherValue}',
		},
	},
	withValue: 'With value {value}',
	multipleValues: 'Multiple values: {one}, {two}, and {three}',
	examplePlural_none: 'No items available',
	examplePlural_one: 'One item available',
	examplePlural_other: '{count} items available',
	examplePluralWithOtherValues_none: 'No items for {user}',
	examplePluralWithOtherValues_one: 'One item for {user}',
	examplePluralWithOtherValues_other: '{count} items for {user} and {otherUser}',
	exampleWithFormatting: 'Formatted {value|uppercase} text and {other|lowercase}',
	exampleWithJSONFormatter: 'JSON formatter: {data|json}',
	pluralWithNestedSubstitution_none: 'No results found for {query}',
	pluralWithNestedSubstitution_one: 'One result for {query} with {user|capitalize}',
	pluralWithNestedSubstitution_other: '{count} results for {query} by {user|capitalize}',
	mixedPluralNested_none: 'No {itemType} in {location}',
	mixedPluralNested_one: 'One {itemType} in {location|uppercase}',
	mixedPluralNested_other: '{count} {itemType}s in {location|uppercase}',
	onlyFormat: 'Just formatting: {value|capitalize}',
	escapeBraces: 'Braces like this: \\{notAKey\\}',
} as const; 

export default en;