# Input Styling

## Standard input appearance

All form inputs in Astra share a consistent visual treatment. Use the design system's form components — never raw HTML elements.

| Element | Component | Never use |
|---|---|---|
| Text input | `InputField` | `<input>` |
| Textarea | `TextareaField` | `<textarea>` |
| Select | `SelectField` | `<select>` |
| Checkbox | `Checkbox` | `<input type="checkbox">` |
| Radio | `RadioGroup` | `<input type="radio">` |
| Toggle | `SwitchField` | Custom toggle |

## Visual treatment

All text inputs, selects, and textareas share these properties:

| Property | Value | Token/Class |
|---|---|---|
| Background | Subtle tint | `bg-input-bg` |
| Text color | Primary | `text-text-primary` |
| Placeholder color | Tertiary | `text-text-tertiary` |
| Border radius | 8px | `rounded-corner-md` |
| Font size | 16px | `text-input` |
| Small font size | 14px | `text-input-sm` |

### States

| State | Appearance |
|---|---|
| Default | `bg-input-bg`, no visible border |
| Focus | `border-border-selected` or `brand-primary` outline |
| Disabled | Reduced opacity, `cursor-not-allowed`, no resize (textarea) |
| Error | `border-danger` border, `text-danger` error message below |

## Labels and descriptions

All form components accept `label` and `description` props for consistent form layout:

```tsx
<InputField
  label="Email Address"
  description="This is your primary contact email"
  value="sarah@example.com"
  onChange={(val) => {}}
/>
```

- Labels are positioned above the input
- Descriptions appear below the label, above the input
- Both use consistent typography and spacing handled by the component

## Prefix and suffix

`InputField` supports `prefix` and `suffix` for icons, units, or short labels inside the input container:

```tsx
<InputField
  prefix={<Search size={16} />}
  suffix="USD"
  label="Amount"
  value="100"
/>
```

## Layout patterns

### Vertical stack (default)
```tsx
<div className="flex flex-col gap-lg">
  <InputField label="Email" />
  <InputField label="Username" />
  <TextareaField label="Bio" />
</div>
```

### Side-by-side fields
```tsx
<div className="flex gap-xl">
  <div className="flex-1">
    <InputField label="First Name" />
  </div>
  <div className="flex-1">
    <InputField label="Last Name" />
  </div>
</div>
```

## Rules

- Always use design system form components — never raw HTML inputs
- Do not mix input sizing within the same form
- Labels should be positioned consistently — always above the input
- Use `gap-lg` (12px) between fields in a vertical stack
- Use `gap-xl` (16px) between side-by-side fields with `flex-1` children
- Placeholder text uses `text-text-tertiary` — never use it for actual content
- All form fields should be inside a `bg-surface-bg` card — never directly on the canvas
- `InputField` uses a simplified `onChange` signature: `(value: string) => void`, not the native event
