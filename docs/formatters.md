# Formatters Guide

Formatters transform interpolated values before they're inserted into translations.

## Built-in Formatters

### Text Transformations

```typescript
// lowercase
"{name|lowercase}" // JOHN → john

// uppercase  
"{name|uppercase}" // john → JOHN

// capitalize
"{name|capitalize}" // john → John
```

### Number Formatting

```typescript
// number - Locale-aware number formatting
"{count|number}" // 1234.5 → "1,234.5" (en) or "1.234,5" (de)

// currency - Format as USD currency
"{price|currency}" // 99.99 → "$99.99"
```

### Special Formatters

```typescript
// void - Returns empty string
"{debug|void}" // anything → ""

// json - Converts to JSON string
"{data|json}" // {a: 1} → '{"a":1}'

// weekday - Format date as weekday name
"{date|weekday}" // "2024-01-15" → "Monday"
```

## Creating Custom Formatters

### Basic Example

```typescript
import type { Formatter } from 'typed-locales';

const customFormatters = {
  // Simple formatter
  reverse: (value) => value?.toString().split('').reverse().join('') ?? '',
  
  // Using locale parameter
  percent: (value, locale) => 
    new Intl.NumberFormat(locale, { style: 'percent' }).format(Number(value) / 100),
    
  // Complex formatter
  truncate: (value) => {
    const str = value?.toString() ?? '';
    return str.length > 20 ? str.slice(0, 17) + '...' : str;
  }
} as const satisfies Record<string, Formatter>;
```

### TypeScript Configuration

```typescript
declare module 'typed-locales' {
  interface Overrides {
    shape: typeof translations;
    locales: 'en' | 'es';
    extraFormatters: typeof customFormatters;
  }
}
```

### Usage

```typescript
const translations = {
  reversed: "Hello {name|reverse}!",
  discount: "Save {amount|percent}",
  title: "{longTitle|truncate}"
} as const;

const translate = getTranslate(translations, 'en', customFormatters);
translate('discount', { amount: 25 }); // "Save 25%"
```

## Chaining Formatters

Multiple formatters can be chained with pipe (`|`) separator:

```typescript
const translations = {
  // Applied left to right
  username: "{name|lowercase|capitalize}",  // "JOHN DOE" → "john doe" → "John doe"
  
  // Complex chains
  price: "{amount|currency|uppercase}",     // 99 → "$99.00" → "$99.00"
} as const;
```

## Formatter Signature

All formatters must match this signature:

```typescript
type Formatter = (value: ValueType, locale: string) => string;

// Where ValueType is:
type ValueType = null | number | string | undefined | object;
```

## Advanced Patterns

### Conditional Formatting

```typescript
const formatters = {
  pluralize: (value) => {
    const num = Number(value);
    return num === 1 ? 'item' : 'items';
  },
  
  timeAgo: (value) => {
    const date = new Date(value?.toString() ?? '');
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  }
} as const;
```

### Locale-Aware Formatters

```typescript
const formatters = {
  date: (value, locale) => 
    new Intl.DateTimeFormat(locale).format(new Date(value?.toString() ?? '')),
    
  relativeTime: (value, locale) => {
    const rtf = new Intl.RelativeTimeFormat(locale);
    const days = Number(value);
    return rtf.format(days, 'day');
  }
} as const;
```

## Best Practices

1. **Keep formatters pure** - No side effects
2. **Handle edge cases** - Null/undefined values
3. **Use locale parameter** - For locale-specific formatting
4. **Name descriptively** - Clear formatter names
5. **Type strictly** - Use `satisfies` for type safety

## Common Use Cases

### Display Names
```typescript
const formatters = {
  displayName: (value) => {
    const name = value?.toString() ?? '';
    return name.split(' ').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
  }
};
```

### File Sizes
```typescript
const formatters = {
  fileSize: (value) => {
    const bytes = Number(value);
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
};
```