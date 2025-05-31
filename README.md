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
- ✅ **Translation Validation**: Comprehensive compile-time validation for translation keys and formatters

## 📦 Installation

```bash
npm install typed-locales
# or
yarn add typed-locales
# or
pnpm add typed-locales
```

## 🚀 Quick Start

### 1. Define Your Primary Translation

Create your main translation file (typically English):

```typescript
// translations/en.ts
import type { EnsureValidTranslation, ValidateTranslation } from 'typed-locales';

const en = {
  greeting: "Hello, {name}!",
  nested: {
    welcome: "Welcome to our app",
    farewell: "Goodbye, {name}!"
  },
  items_none: "No items",
  items_one: "One item",
  items_other: "{count} items"
} as const;

// Validation catches bracket/formatter errors
let validation: EnsureValidTranslation<ValidateTranslation<typeof en>> = 0;
void validation;

export default en;
```

### 2. Define Secondary Translations with `satisfies TranslationType`

For other languages, use `satisfies TranslationType` to ensure all keys are present:

```typescript
// translations/es.ts  
import type { 
  EnsureValidTranslation, 
  ValidateTranslation, 
  TranslationType 
} from 'typed-locales';

const es = {
  greeting: "¡Hola, {name}!",
  nested: {
    welcome: "Bienvenido a nuestra aplicación",
    farewell: "¡Adiós, {name}!"
  },
  items_none: "Sin elementos",
  items_one: undefined, // Only plural keys can be undefined (unused in this language)
  items_other: "{count} elementos"
} as const satisfies TranslationType; // ← Ensures all keys from primary translation are handled

let validation: EnsureValidTranslation<ValidateTranslation<typeof es>> = 0;
void validation;

export default es;
```

**What `satisfies TranslationType` does:**
- Ensures your translation matches the primary translation structure
- Catches missing keys (TypeScript will error)
- Allows `undefined` for plural keys not used in specific languages (like `items_one`, `items_none`)
- Prevents typos in translation keys

### 3. Configure Type Overrides

```typescript
// types/i18n.ts
import en from '../translations/en';

declare module 'typed-locales' {
  interface Overrides {
    shape: typeof en;
    locales: 'en' | 'es';
  }
}
```

### 4. Basic Usage

```typescript
import { getTranslate } from 'typed-locales';
import en from './translations/en';

const t = getTranslate(en, 'en', undefined);

console.log(t('greeting', { name: 'John' })); // "Hello, John!"
console.log(t('nested.welcome')); // "Welcome to our app"
console.log(t('items', { count: 0 })); // "No items"
```

### 5. React Integration

```tsx
import React from 'react';
import { initReact } from 'typed-locales';
import en from './translations/en';

const { TranslationProvider, useTranslation } = initReact(
  en, // Initial translation
  'en', // Initial locale
  {
    en,
    es: () => import('./translations/es').then(m => m.default) // Lazy load
  },
  {} // Extra formatters
);

function App() {
  return (
    <TranslationProvider>
      <MyComponent />
    </TranslationProvider>
  );
}

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

```typescript
const customFormatters = {
  currency: (value: string, locale: string) => 
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(Number(value)),
  highlight: (value: string) => `**${value}**`,
  truncate: (value: string) => value.length > 50 ? value.slice(0, 47) + '...' : value
} as const;

// Update type declaration
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
  title: "{text|highlight|truncate}"
} as const;
```

### Built-in Formatters

- `lowercase`, `uppercase`, `capitalize`: Text case transformations
- `void`: Remove the value (empty string)
- `weekday`: Format date as weekday name
- `number`: Format as localized number
- `json`: Convert to JSON string

### Pluralization

Three plural forms following common i18n patterns:

```typescript
const translations = {
  messages_none: "No messages",    // count === 0
  messages_one: "One message",     // count === 1
  messages_other: "{count} messages" // all other counts
} as const;
```

## 🛡️ Validation System

The library provides compile-time validation to catch errors before runtime:

```typescript
const translations = {
  valid: "Hello {name|capitalize}",
  missingBrace: "Hello {name",           // ❌ Brackets not balanced
  invalidFormatter: "Hello {name|fake}", // ❌ Invalid formatter
} as const;

// This line will show TypeScript errors for any issues:
let validation: EnsureValidTranslation<ValidateTranslation<typeof translations>> = 0;
void validation;
```

**What gets validated:**
- Bracket balance in placeholders
- Formatter names against available formatters
- Missing translation keys (via `satisfies TranslationType`)

**The validation pattern:**
- Zero runtime cost - pure TypeScript validation
- Silent when valid, descriptive errors when invalid
- Works instantly without build processes

## 🔧 Configuration

### VS Code Integration

Install i18n-ally extension with this config:

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
Creates a translation function with full type safety.

### `initReact(initialTranslation, initialLocale, allTranslations, extraFormatters)`
Initializes React integration with context provider and hooks.

### `useTranslation()`
React hook returning `{ t, locale, setLocale, isLoading }`.

## 🛠️ Development Patterns

### Lazy Loading
```typescript
const translations = {
  en: englishTranslations,
  es: () => import('./translations/es').then(m => m.default),
  fr: () => import('./translations/fr').then(m => m.default)
};
```

### Organizing Large Files
```typescript
// Split into modules
export const en = {
  ...common,
  ...pages,
  ...forms
} as const;
```

## 🚨 Common Pitfalls

### Missing `as const`
```typescript
// ❌ Wrong - loses type information
const translations = { hello: "Hello" };

// ✅ Correct - preserves literal types  
const translations = { hello: "Hello" } as const;
```

### Forgetting `satisfies TranslationType` for Secondary Translations
```typescript
// ❌ Wrong - no validation against primary shape
const es = { greeting: "¡Hola!" } as const;

// ✅ Correct - validates structure and catches missing keys
const es = { greeting: "¡Hola!" } as const satisfies TranslationType;
```

### Not Adding Validation
```typescript
// ❌ Missing validation
const translations = { broken: "Hello {name" } as const;

// ✅ With validation - catches syntax errors
const translations = { broken: "Hello {name" } as const;
let validation: EnsureValidTranslation<ValidateTranslation<typeof translations>> = 0;
void validation; // TypeScript error: Brackets not balanced
```

**Pro Tip**: Install "Pretty TypeScript Errors" VS Code extension for clearer error messages.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

GNU Lesser General Public License v2.1 - see LICENSE file for details.

---

**typed-locales** - Type-safe translations made simple! 🌍✨