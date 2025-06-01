# API Reference

## Core Functions

### `getTranslate()`

Creates a translation function with full type safety.

```typescript
function getTranslate(
  translations: TranslationType,
  locale: Locales,
  extraFormatters: ExtraFormatters,
  defaultTranslate?: TranslateFunction
): TranslateFunction
```

**Parameters:**
- `translations`: Translation object with all strings
- `locale`: Current locale identifier
- `extraFormatters`: Custom formatter functions
- `defaultTranslate`: Optional fallback translator for missing keys

**Returns:** A translate function with full type inference

**Example:**
```typescript
const translate = getTranslate(translations, 'en', customFormatters, fallbackTranslate);
```

### `initReact()`

Initializes React integration with context provider and hooks.

```typescript
function initReact(
  initialTranslation: TranslationType,
  initialLocale: Locales,
  allTranslations: Record<Locales, TranslationType | (() => Promise<TranslationType>)>,
  extraFormatters: ExtraFormatters
): {
  TranslationProvider: React.FC<{ children: React.ReactNode }>,
  useTranslation: () => TranslationContextType
}
```

**Parameters:**
- `initialTranslation`: Default translation (also serves as fallback)
- `initialLocale`: Initial locale
- `allTranslations`: Map of all available translations (supports lazy loading)
- `extraFormatters`: Custom formatter functions

**Returns:** Object containing `TranslationProvider` component and `useTranslation` hook

## Type System

### Core Types

```typescript
// Value types that can be passed as parameters
type ValueType = null | number | string | undefined | object;

// Type-safe translation keys
type PossibleTranslationKeys = DotNestedLeafKeys<Translations>;

// Locale identifiers
type Locales = Overrides["locales"];
```

### Type Annotations

You can specify expected parameter types in placeholders:

```typescript
const translations = {
  typed: "Age: {age:number}, Name: {name:string}"
} as const;

// TypeScript enforces correct types
translate('typed', { 
  age: 25,      // ✅ Must be number
  name: "John"  // ✅ Must be string
});
```

**Supported type annotations:**
- `:string`
- `:number`  
- `:boolean`
- `:object`
- `:array`
- `:null`
- `:undefined`
- `:any`

## Translation Structure

### Standard Keys

```typescript
const translations = {
  simple: "Hello world",
  withParam: "Hello {name}",
  nested: {
    deep: {
      key: "Deeply nested value"
    }
  }
} as const;
```

### Plural Forms

Pluralization uses suffixes: `_none`, `_one`, `_other`

```typescript
const translations = {
  items_none: "No items",        // count === 0
  items_one: "One item",         // count === 1  
  items_other: "{count} items"   // count > 1
} as const;

// Usage
translate('items', { count: 0 });   // "No items"
translate('items', { count: 1 });   // "One item"
translate('items', { count: 5 });   // "5 items"
```

## Placeholder Syntax

### Basic Placeholders
```typescript
"{parameterName}"
```

### With Type Annotation
```typescript
"{parameterName:type}"
```

### With Formatters
```typescript
"{parameterName|formatter1|formatter2}"
```

### Combined
```typescript
"{parameterName:type|formatter1|formatter2}"
```

## Module Augmentation

Configure global types via module augmentation:

```typescript
declare module 'typed-locales' {
  interface Overrides {
    shape: typeof myTranslations;
    locales: 'en' | 'es' | 'fr';
    extraFormatters?: typeof customFormatters;
  }
}
```

## TranslationType

Use `satisfies TranslationType` for secondary translations to ensure structure matches:

```typescript
const spanish = {
  // All keys from primary translation must be present
  // Plural keys can be undefined if unused in this language
} as const satisfies TranslationType;
```