# Validation System

Typed Locales provides compile-time validation to catch common errors before runtime.

## What Gets Validated

### 1. Bracket Balance

Ensures opening and closing braces match:

```typescript
const translations = {
  valid: "Hello {name}!",        // ✅ Balanced
  invalid: "Hello {name",        // ❌ Missing closing brace
  invalid2: "Hello name}",       // ❌ Missing opening brace
  invalid3: "Hello {{name}",     // ❌ Unbalanced
} as const;
```

### 2. Empty Braces

Prevents empty placeholders:

```typescript
const translations = {
  valid: "Hello {name}!",        // ✅ Has content
  invalid: "Hello {}!",          // ❌ Empty braces not allowed
} as const;
```

### 3. Formatter Validation

Checks that all formatters exist:

```typescript
const translations = {
  valid: "Hello {name|uppercase}!",     // ✅ Valid formatter
  invalid: "Hello {name|fake}!",        // ❌ 'fake' formatter doesn't exist
} as const;

// TypeScript error: You are using an invalid formatter: fake in: "Hello {name|fake}!"
```

### 4. Type Annotation Validation

Validates type annotations:

```typescript
const translations = {
  valid: "Age: {age:number}",          // ✅ Valid type
  invalid: "Age: {age:integer}",       // ❌ 'integer' is not a valid type
} as const;

// TypeScript error: You are using an invalid type: integer in: "Age: {age:integer}"
```

### 5. Translation Shape Validation

Using `satisfies TranslationType` ensures secondary translations match the primary:

```typescript
// Primary translation
const en = {
  greeting: "Hello",
  nested: { welcome: "Welcome" }
} as const;

// Secondary translation
const es = {
  greeting: "Hola",
  // Missing nested.welcome! TypeScript will error
} as const satisfies TranslationType; // ❌ Type error
```

## How to Use Validation

### Basic Setup

```typescript
import type { EnsureValidTranslation, ValidateTranslation } from 'typed-locales';

const translations = {
  greeting: "Hello {name}!",
  broken: "Broken {key"  // Missing closing brace
} as const;

// This line triggers validation
let validation: EnsureValidTranslation<ValidateTranslation<typeof translations>> = 0;
void validation; // Prevents unused variable warning
```

### Understanding Errors

TypeScript will show descriptive errors:

```
Type '{ greeting: "Hello {name}!"; broken: "Broken {key"; }' does not satisfy the constraint 'never'.
  Types of property 'broken' are incompatible.
    Type '"Broken {key"' is not assignable to type '"Brackets are not balanced in: \"Broken {key\""'.
```

## The Validation Pattern

```typescript
// 1. Define translations with 'as const'
const translations = { /* ... */ } as const;

// 2. Add validation line
let validation: EnsureValidTranslation<ValidateTranslation<typeof translations>> = 0;
void validation;

// 3. Export translations
export default translations;
```

## Why This Pattern?

- **Zero runtime cost** - Pure TypeScript, removed during compilation
- **Immediate feedback** - Errors appear instantly in your IDE
- **No build process** - Works without any code generation
- **Descriptive errors** - Clear messages about what's wrong

## Common Validation Errors

### Missing Closing Brace
```typescript
"Hello {name" 
// Error: Brackets are not balanced in: "Hello {name"
```

### Invalid Formatter
```typescript
"Hello {name|doesntexist}"
// Error: You are using an invalid formatter: doesntexist in: "Hello {name|doesntexist}"
```

### Empty Braces
```typescript
"Hello {}!"
// Error: Empty braces {} are not allowed in: "Hello {}!"
```

### Invalid Type
```typescript
"Count: {count:integer}"
// Error: You are using an invalid type: integer in: "Count: {count:integer}"
```

## Tips

1. **Use "Pretty TypeScript Errors" extension** - Makes errors more readable in VS Code

2. **Validate all translation files** - Add validation to each translation file:
   ```typescript
   // In each translation file
   let validation: EnsureValidTranslation<ValidateTranslation<typeof translations>> = 0;
   void validation;
   ```

3. **Fix errors immediately** - Validation errors prevent successful compilation

4. **Check formatter names** - Ensure custom formatters are properly registered:
   ```typescript
   declare module 'typed-locales' {
     interface Overrides {
       extraFormatters: typeof myFormatters;
     }
   }
   ```