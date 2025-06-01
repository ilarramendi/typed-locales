# Typed Locales

A powerful, type-safe internationalization (i18n) library for TypeScript and React applications. Get full IntelliSense support, compile-time validation, and seamless pluralization handling.

## ✨ Key Features

- 🔒 **Type Safety**: Full TypeScript support with autocomplete and compile-time validation
- ⚡ **Zero Build Process**: Type safety works instantly without code generation
- 🌍 **Nested Translations**: Support for deeply nested translation keys
- 📊 **Pluralization**: Built-in plural form handling (_none, _one, _other)
- 🎨 **Custom Formatters**: Extensible formatting system
- ⚛️ **React Integration**: Ready-to-use React hooks and context providers
- 🔧 **VS Code Integration**: Works with i18n-ally extension
- 📦 **Zero Dependencies**: Lightweight with minimal runtime overhead
- 🛡️ **Automatic Fallbacks**: Missing translations automatically fall back to default language

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

```typescript
// translations/en.ts
import type { EnsureValidTranslation, ValidateTranslation } from 'typed-locales';

const en = {
  greeting: "Hello, {name}!",
  nested: {
    welcome: "Welcome to our app"
  },
  items_none: "No items",
  items_one: "One item", 
  items_other: "{count} items"
} as const;

// Compile-time validation
let validation: EnsureValidTranslation<ValidateTranslation<typeof en>> = 0;
void validation;

export default en;
```

### 2. Define Secondary Translations

```typescript
// translations/es.ts
import type { TranslationType } from 'typed-locales';

const es = {
  greeting: "¡Hola, {name}!",
  nested: {
    welcome: "Bienvenido a nuestra aplicación"
  },
  items_none: "Sin elementos",
  items_one: undefined, // Unused plural form
  items_other: "{count} elementos"
} as const satisfies TranslationType;

export default es;
```

### 3. Configure Types

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

### 4. Use Translations

```typescript
import { getTranslate } from 'typed-locales';
import en from './translations/en';
import es from './translations/es';

// Create translators with fallback
const defaultTranslate = getTranslate(en, 'en', {});
const translate = getTranslate(es, 'es', {}, defaultTranslate);

// Full type safety and IntelliSense
translate('greeting', { name: 'John' }); // "¡Hola, John!"
translate('items', { count: 5 }); // "5 elementos"
```

## 📚 Documentation

- [API Reference](./docs/api-reference.md) - Complete API documentation
- [React Integration](./docs/react-integration.md) - Using with React applications
- [Formatters Guide](./docs/formatters.md) - Built-in and custom formatters
- [Validation System](./docs/validation.md) - Compile-time validation features
- [VS Code Setup](./docs/vscode-setup.md) - IDE integration guide

## 🛠️ TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "Node",
    "esModuleInterop": true
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

GNU Lesser General Public License v2.1 - see LICENSE file for details.