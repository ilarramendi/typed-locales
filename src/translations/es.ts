import type { NamespaceShape, ValidateTranslation } from "../config";
import type { EnsureValidTranslation } from "../validation";

type Test = EnsureValidTranslation<ValidateTranslation<typeof es>>;
const es = {
	test: 'Traducción regular',
	nested: {
		test: 'Anidado {translation|myCustomFormatter}',
		deep: {
			again: 'Anidado nuevamente con {value} y {otherValue}',
		},
	},
	withValue: 'Con valor {value}',
	multipleValues: 'Múltiples valores: {one}, {two} y {three}',
	// @ts-expect-error
	examplePlural_none: 'No hay elementos disponibles',
	// @ts-expect-error
	examplePlural_one: 'Un elemento disponible',
	examplePlural_other: '{count} elementos disponibles',
	examplePluralWithOtherValues_none: 'No hay elementos para {user}',
	examplePluralWithOtherValues_one: 'Un elemento para {user}',
	examplePluralWithOtherValues_other: '{count} elementos para {user} y {otherUser}',
	exampleWithFormatting: 'Texto formateado {value|uppercase} y {other|lowercase}',
	exampleWithJSONFormatter: 'Formateador JSON: {data|json}',
	pluralWithNestedSubstitution_none: 'No se encontraron resultados para {query}',
	pluralWithNestedSubstitution_one: 'Un resultado para {query} con {user|capitalize}',
	pluralWithNestedSubstitution_other: '{count} resultados para {query} por {user|capitalize}',
	mixedPluralNested_none: 'No hay {itemType} en {location}',
	mixedPluralNested_one: 'Un {itemType} en {location|uppercase}',
	mixedPluralNested_other: '{count} {itemType}s en {location|uppercase}',
	onlyFormat: 'Solo formateo: {value|capitalize}',
	escapeBraces: 'Llaves como estas: \\{notAKey\\}',

} as const satisfies NamespaceShape;

export default es;

