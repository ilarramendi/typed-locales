import type { RemoveReadonlyDeep } from "..";
import type { EnsureValidTranslation, ValidateTranslation } from "../../test";
import type { NamespaceShape } from "./en";

const es = {
	test: 'Traducción regular',
	nested: {
		test: 'Traducción tgest {text|asd}',
	},
	withValue: 'Con valor {value}',
	examplePlural_none: 'No elementos',
	examplePlural_one: 'Un elemento',
	examplePlural_other: '{count} elementos',
	examplePluralWithOtherValues_none: 'No elementos y {name}',
	examplePluralWithOtherValues_one: 'U{n elemento y {name}',
	exampleWithFormatting: 'Esto es un {text|asd} ejemplo',
	examplePluralWithOtherValues_other: '{count} elementos y {name} o {name2}',
} as const satisfies NamespaceShape;

type _ = EnsureValidTranslation<ValidateTranslation<typeof es>>;
