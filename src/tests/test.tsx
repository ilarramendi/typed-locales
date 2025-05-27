import { useTranslation } from './config';


const Test = () => {
	const { t, locale, setLocale } = useTranslation()
	
	return <div>
		{t('test')}
		{t('nested.test', { translation: 'translated text' })}
		{t('nested.deep.again', { value: 'someValue', otherValue: 'anotherValue' })}
		{t('withValue', { value: 'myValue' })}
		{t('multipleValues', { one: '1', two: '2', three: '3' })}
		{t('examplePlural', { count: 0 })}
		{t('examplePlural', { count: 1 })}
		{t('examplePlural', { count: 5 })}
		{t('examplePluralWithOtherValues', { count: 0, user: 'Alice', otherUser: undefined })}
		{t('examplePluralWithOtherValues', { count: 1, user: 'Alice', otherUser: undefined })}
		{t('examplePluralWithOtherValues', { count: 123, user: 'Alice', otherUser: 'Bob' })}
		{t('exampleWithFormatting', { value: 'TEXT', other: 'Text' })}
		{t('exampleWithJSONFormatter', { data: { key: 'value' } })}
		{t('pluralWithNestedSubstitution', { count: 0, query: 'search', user: undefined })}
		{t('pluralWithNestedSubstitution', { count: 1, query: 'search', user: 'john' })}
		{t('pluralWithNestedSubstitution', { count: 5, query: 'search', user: 'john' })}
		{t('mixedPluralNested', { count: 0, itemType: 'book', location: 'shelf' })}
		{t('mixedPluralNested', { count: 1, itemType: 'book', location: 'shelf' })}
		{t('mixedPluralNested', { count: 10, itemType: 'book', location: 'shelf' })}
		{t('onlyFormat', { value: 'capitalize this' })}
		{/* @ts-expect-error */}
		{t('escapeBraces')}
		{/* @ts-expect-error */}
		{t('incorrectKey')}
		{locale}
		<button onClick={() => setLocale('es')}>Change locale</button>
	</div>;
}
