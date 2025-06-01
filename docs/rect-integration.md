# React Integration Guide

## Setup

### 1. Initialize React Integration

```typescript
// i18n/setup.ts
import { initReact } from 'typed-locales';
import en from './translations/en';
import customFormatters from './formatters';

export const { TranslationProvider, useTranslation } = initReact(
  en,    // Initial translation (serves as fallback)
  'en',  // Initial locale
  {
    en,
    es: () => import('./translations/es').then(m => m.default),
    fr: () => import('./translations/fr').then(m => m.default)
  },
  customFormatters
);
```

### 2. Wrap Your App

```tsx
// App.tsx
import { TranslationProvider } from './i18n/setup';

function App() {
  return (
    <TranslationProvider>
      <YourApp />
    </TranslationProvider>
  );
}
```

### 3. Use in Components

```tsx
import { useTranslation } from './i18n/setup';

function MyComponent() {
  const { t, locale, setLocale, isLoading } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting', { name: 'User' })}</p>
      
      <select value={locale} onChange={e => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
      
      {isLoading && <div>Loading translations...</div>}
    </div>
  );
}
```

## useTranslation Hook

The hook returns:

```typescript
interface TranslationContextType {
  t: TranslateFunction;        // Translation function
  locale: Locales;             // Current locale
  setLocale: (locale: Locales) => void;  // Change locale
  isLoading: boolean;          // Loading state for async translations
}
```

## Lazy Loading

Translations can be loaded asynchronously:

```typescript
const translations = {
  en: englishTranslations,  // Synchronous
  es: () => import('./translations/es').then(m => m.default),  // Lazy
  fr: () => import('./translations/fr').then(m => m.default)   // Lazy
};
```

Benefits:
- Reduces initial bundle size
- Loads translations on demand
- Shows loading state via `isLoading`

## Automatic Fallbacks

The initial translation automatically serves as the fallback:

```typescript
const { TranslationProvider } = initReact(
  en,  // This becomes the fallback for all missing keys
  'en',
  translations,
  formatters
);
```

When a key is missing in the current locale, it falls back to the initial translation.

## TypeScript Support

Full type inference works in React components:

```tsx
function Component() {
  const { t } = useTranslation();
  
  // TypeScript knows all available keys and required parameters
  return <p>{t('user.profile', { name: 'John', age: 25 })}</p>;
}
```

## Best Practices

### 1. Centralize Setup
Create a single module for i18n setup:

```typescript
// i18n/index.ts
export { TranslationProvider, useTranslation } from './setup';
export type { Locales } from './types';
```

### 2. Handle Loading States
Show appropriate UI during translation loading:

```tsx
function LocaleSwitcher() {
  const { locale, setLocale, isLoading } = useTranslation();
  
  return (
    <select 
      value={locale} 
      onChange={e => setLocale(e.target.value)}
      disabled={isLoading}
    >
      {/* options */}
    </select>
  );
}
```