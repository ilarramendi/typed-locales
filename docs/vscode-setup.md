# VS Code Setup Guide

## IntelliSense Features

TypeScript provides excellent IDE support out of the box:

### Hover Information
When you hover over translation keys, VS Code shows:
- The actual translation value
- Required parameters and their types
- Available formatters

```typescript
// Hovering over 'greeting' shows: "Hello, {name}!"
t('greeting', { name: 'John' });
```

### Autocomplete
- Full autocomplete for all translation keys
- Parameter name suggestions
- Type information for parameters

### Type Checking
- Red squiggles for invalid keys
- Type errors for wrong parameter types
- Missing required parameters

## i18n Ally Extension

### Installation

1. Install the [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally) extension
2. Create configuration file in your project root or `.vscode` folder

### Configuration

Create `i18n-ally-custom-framework.yml`:

```yaml
# Supported file extensions
languageIds:
  - javascript
  - typescript
  - javascriptreact
  - typescriptreact

# Regex to detect translation usage
usageMatchRegex:
  - "[^\\w\\d]t\\(\\s*['\"`]([\\w-.]+)['\"`]\\s*(?:,\\s*\\{[^\\}]*\\})?\\s*\\)"

# Use only this framework
monopoly: true
```
