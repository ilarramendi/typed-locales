
# Helper Types
Sometimes you may want to recieve a translation key as a function parameter, get the parameters of a translation as a type, or ensure a function parameter is translated, for this 3 helper types are exposed.

## PossibleTranslationKeys
Ensure a string is a valid translation key
```ts
const formatLabel = (key: PossibleTranslationKeys) => t(key);
```

## InterpolationProperties
Get the properties of a given translation key
```ts
const formatLabel = (props: InterpolationProperties<'labelWithProps'>) => t('labelWithProps', props);
```

## TranslatedString
Ensure a recieved string is translated
```ts
const print = (string_: TranslatedString) => console.log(string_);

print(t('hello')); // This is ok
print('hello'); // This show an error
```

This is usefull for react components, for example
```tsx
const Label: React.FC<{
	label: TranslatedString
}> = ({label}) => (<label>{label}</label>);

const test = <Label label={t('hello')}} /> // This is ok
const test2 = <Label label="hello" /> // This shows an error
```