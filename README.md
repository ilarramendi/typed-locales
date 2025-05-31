# Typed Locales

A powerful, type-safe internationalization (i18n) library for TypeScript and React applications. Get full IntelliSense support, compile-time validation, and seamless pluralization handling.

## ✨ Features

- 🔒 **Type Safety**: Full TypeScript support with autocomplete and compile-time validation
- ⚡ **No Build Process Required**: Type safety works instantly without code generation or background processes
- 🌍 **Nested Translations**: Support for deeply nested translation keys
- 📊 **Pluralization**: Built-in plural form handling with customizable rules
- 🎨 **Custom Formatters**: Extensible formatting system for dates, numbers, and custom transformations
- ⚛️ **React Integration**: Ready-to-use React hooks and context providers
- 🔧 **Developer Experience**: VS Code extension support with i18n-ally
- 📦 **Zero Dependencies**: Lightweight with minimal runtime overhead
- 🚀 **Modern**: Built with ESM, supports tree-shaking

## 📦 Installation

```bash
npm install typed-locales
# or
yarn add typed-locales
# or
pnpm add typed-locales
```

## 🚀 Quick Start

### 1. Define Your Translations

Create your translation files with TypeScript:

```typescript
// translations/en.ts
export const en = {
  greeting: "Hello, {name}!",
  nested: {
    welcome: "Welcome to our app",
    farewell: "Goodbye, {name}!"
  },
  items_none: "No items",
  items_one: "One item",
  items_other: "{count} items"
} as const;

// translations/es.ts  
export const es = {
  greeting: "¡Hola, {name}!",
  nested: {
    welcome: "Bienvenido a nuestra aplicación",
    farewell: "¡Adiós, {name}!"
  },
  items_none: "Sin elementos",
  items_one: "Un elemento", 
  items_other: "{count} elementos"
} as const;
```

### 2. Configure Type Overrides

Extend the library types to match your translations:

```typescript
// types/i18n.ts
import { en } from '../translations/en';

declare module 'typed-locales' {
  interface Overrides {
    shape: typeof en;
    locales: 'en' | 'es';
  }
}
```

### 3. Basic Usage

```typescript
import { getTranslate } from 'typed-locales';
import { en, es } from './translations';

const t = getTranslate(en, 'en', undefined);

// Simple translation
console.log(t('greeting', { name: 'John' })); // "Hello, John!"

// Nested keys
console.log(t('nested.welcome')); // "Welcome to our app"

// Pluralization
console.log(t('items', { count: 0 })); // "No items"
console.log(t('items', { count: 1 })); // "One item" 
console.log(t('items', { count: 5 })); // "5 items"


// TypeScript error examples
console.log(t('fakeKey')); 
// Argument of type "fakeKey" is not assignable to parameter of type PossibleTranslationKeys 

console.log(t('items', { test: 5 }));
// Object literal may only specify known properties, and test does not exist in type { count: number }
```

### 4. React Integration

```tsx
import React from 'react';
import { initReact } from 'typed-locales';
import { en, es } from './translations';

// Initialize React integration
const { TranslationProvider, useTranslation } = initReact(
  en, // Initial translation
  'en', // Initial locale
  {
    en,
    es: () => import('./translations/es').then(m => m.es) // Lazy load
  },
  {} // Extra formatters
);

// App component
function App() {
  return (
    <TranslationProvider>
      <MyComponent />
    </TranslationProvider>
  );
}

// Component using translations
function MyComponent() {
  const { t, locale, setLocale, isLoading } = useTranslation();
  
  return (
    <div>
      <h1>{t('nested.welcome')}</h1>
      <p>{t('greeting', { name: 'User' })}</p>
      
      <select value={locale} onChange={e => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
      
      {isLoading && <p>Loading translations...</p>}
    </div>
  );
}
```

## 🎨 Advanced Features

### Custom Formatters

Create custom formatters for specialized text transformations:

```typescript
const customFormatters = {
  currency: (value: string, locale: string) => 
    new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: 'USD' 
    }).format(Number(value)),
  
  highlight: (value: string) => `**${value}**`,
  
  truncate: (value: string) => 
    value.length > 50 ? value.slice(0, 47) + '...' : value
} as const;

// Update your type declaration
declare module 'typed-locales' {
  interface Overrides {
    shape: typeof en;
    locales: 'en' | 'es';
    extraFormatters: typeof customFormatters;
  }
}

// Use in translations
const translations = {
  price: "Price: {amount|currency}",
  title: "{text|highlight|truncate}",
  username: "{name|lowercase}"
} as const;

const t = getTranslate(translations, 'en', customFormatters);
console.log(t('price', { amount: '99.99' })); // "Price: $99.99"
```

### Built-in Formatters

The library includes several built-in formatters:

- `lowercase`: Convert to lowercase
- `uppercase`: Convert to uppercase  
- `capitalize`: Capitalize first letter
- `void`: Remove the value (empty string)
- `weekday`: Format date as weekday name
- `number`: Format as localized number
- `json`: Convert to JSON string

### Pluralization Rules

The library supports three plural forms following common i18n patterns:

- `_none`: Used when count is 0
- `_one`: Used when count is 1  
- `_other`: Used for all other counts (if the value 1 or 0 and that translation is not defuned this will be used too)

```typescript
const translations = {
  // All three forms
  messages_none: "No messages",
  messages_one: "One message", 
  messages_other: "{count} messages",
} as const;
```

### Validation System

The library includes a powerful compile-time validation system that catches translation errors before runtime. This validation ensures your translations are correctly formatted and use valid formatters.

#### Setting Up Validation

Add validation to your translation files using the validation utilities:

```typescript
// translations/en.ts
import type { EnsureValidTranslation, ValidateTranslation } from 'typed-locales';

const en = {
  greeting: "Hello, {name}!",
  price: "Cost: {amount|currency}",
  items_one: "One item", 
  items_other: "{count} items",
  invalidExample: "Hello {name" // This will be caught!
} as const;

// Add this validation line - it will show TypeScript errors for any issues
let validation: EnsureValidTranslation<ValidateTranslation<typeof en>> = 0;
void validation; // Prevents unused variable warnings

export default en;
```

#### What Gets Validated

The validation system checks for several types of errors:

**1. Bracket Balance**
```typescript
const translations = {
  valid: "Hello {name}",
  missingClose: "Hello {name",     // ❌ Error: Missing closing brace
  missingOpen: "Hello name}",      // ❌ Error: Missing opening brace
} as const;

// TypeScript will show: `Brackets are not balanced in: "Hello {name"`
```

**2. Invalid Formatters**
```typescript
const translations = {
  invalidFormatter: "Hello {name|badFormatter}",
  // TypeScript will show: `You are using an invalid formatter: badFormatter in: "Hello {name|badFormatter}"`
} as const;

```

**3. Complex Validation Example**

```typescript
// This example shows various validation scenarios
const complexTranslations = {
  // ✅ Valid cases
  simple: "Hello world",
  withParam: "Hello {name}",
  withFormatter: "Hello {name|capitalize}",
  multipleFormatters: "Price: {amount|number|currency}",
  plural_one: "One item",
  plural_other: "{count} items",
  
  // ❌ Invalid cases that will be caught
  unmatchedBrace1: "Hello {name",
  unmatchedBrace2: "Hello name}",
  invalidFormatter: "Hello {name|badFormatter}",
  emptyBraces: "Hello {}",
  // Missing translations
} as const;

// The validation will only show errors for the invalid cases
let validation: EnsureValidTranslation<ValidateTranslation<typeof complexTranslations>> = 0;
void validation;
```

#### The Validation Trick Explained

```typescript
// This line serves multiple purposes:
let validation: EnsureValidTranslation<ValidateTranslation<typeof en>> = 0;
void validation;
```

**Why this pattern works:**
1. **Type-only validation**: No runtime overhead, pure compile-time checking
2. **Silent when valid**: If translations are valid, TypeScript sees `never` and allows the assignment
3. **Loud when invalid**: If translations have errors, TypeScript shows detailed error messages
4. **No lint issues**: The `void validation;` prevents "unused variable" warnings
5. **Zero runtime cost**: The validation code is purely for TypeScript and gets compiled away

**TypeScript Error Output:**
```
Type '{ broken: "You are using an invalid formatter: unknownFormatter in: \"Hello {name|unknownFormatter}\""; }' 
is not assignable to type 'never'.
```

If using its recommended to install `Pretty Typescript Errors` from `yoavbls`, this extension greatly improves how all TS errors are shown in vscode hover on error

#### Key Benefits of This Approach

The validation system provides several advantages over traditional i18n solutions:

**⚡ Instant Type Safety**
- No code generation or build processes required
- Type safety works immediately when you save your translation files
- No need to run watchers or background processes during development
- Pure TypeScript type inference - works with any TypeScript setup

**🔍 Comprehensive Error Detection**
- Catches syntax errors before they reach production
- Validates formatter names against your actual formatter implementations
- Ensures bracket balance and proper placeholder syntax
- Shows exact error locations with helpful messages

**🚀 Zero Runtime Overhead**
- All validation happens at compile time
- No runtime performance impact
- Validation code is completely removed in production builds
- Works with any bundler or TypeScript compiler

## 🔧 Configuration

### VS Code Integration

For the best development experience, install the i18n-ally VS Code extension and use the provided configuration:

```yaml
# .vscode/i18n-ally-custom-framework.yml
languageIds:
  - javascript
  - typescript
  - javascriptreact
  - typescriptreact

usageMatchRegex:
  - "[^\\w\\d]t\\(\\s*['\"`]([\\w-.]+)['\"`]\\s*(?:,\\s*\\{[^\\}]*\\})?\\s*\\)"

monopoly: true
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes proper configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "target": "ESNext",
    "module": "ESNext"
  }
}
```

## 📚 API Reference

### `getTranslate(translations, locale, extraFormatters)`

Creates a translation function.

**Parameters:**
- `translations`: Translation object with type safety
- `locale`: Current locale string
- `extraFormatters`: Object with custom formatter functions

**Returns:** Translation function `t(key, params?)`

### `initReact(initialTranslation, initialLocale, allTranslations, extraFormatters)`

Initializes React integration.

**Parameters:**
- `initialTranslation`: Initial translation object (must be loaded)
- `initialLocale`: Starting locale
- `allTranslations`: Record of all available translations (can be lazy-loaded)
- `extraFormatters`: Custom formatters object

**Returns:** `{ TranslationProvider, useTranslation }`

### `useTranslation()`

React hook for accessing translations (must be used within TranslationProvider).

**Returns:**
```typescript
{
  t: TranslationFunction;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  isLoading: boolean;
}
```

## 🛠️ Development Patterns

### Lazy Loading Translations

For better performance, lazy load translation files:

```typescript
const translations = {
  en: englishTranslations, // Always loaded
  es: () => import('./translations/es').then(m => m.default),
  fr: () => import('./translations/fr').then(m => m.default),
  de: () => import('./translations/de').then(m => m.default)
};
```

### Organizing Large Translation Files

Split large translation files into modules:

```typescript
// translations/en/common.ts
export const common = {
  buttons: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete"
  }
} as const;

// translations/en/pages.ts  
export const pages = {
  home: {
    title: "Welcome Home",
    subtitle: "Get started with our app"
  }
} as const;

// translations/en/index.ts
export const en = {
  ...common,
  ...pages
} as const;
```

### Type-Safe Translation Keys

Extract translation keys for reuse:

```typescript
import type { PossibleTranslationKeys } from 'typed-locales';

// Get all possible keys as a union type
type TranslationKey = PossibleTranslationKeys;

// Use in functions
function logTranslation(key: TranslationKey) {
  console.log(t(key));
}
```

## 🚨 Common Pitfalls

### Missing `as const`

Always use `as const` on translation objects for proper type inference:

```typescript
// ❌ Wrong - loses type information
const translations = {
  hello: "Hello"
};

// ✅ Correct - preserves literal types  
const translations = {
  hello: "Hello"  
} as const;
```

**Note**: The TypeScript compiler will catch most other common issues automatically, including:
- Missing translation keys across different languages
- Incorrect parameter names or missing required parameters (like `count` for plurals)
- Invalid translation key references
- Missing parameters for placeholders

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License - see LICENSE file for details.

## 🔗 Related Projects

- [i18next](https://www.i18next.com/) - Mature i18n framework
- [react-i18next](https://react.i18next.com/) - React bindings for i18next
- [i18n-ally](https://github.com/lokalise/i18n-ally) - VS Code extension for i18n

---

**typed-locales** - Type-safe translations made simple! 🌍✨