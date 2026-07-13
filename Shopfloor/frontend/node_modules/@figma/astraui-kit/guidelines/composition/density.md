# Density & Spacing Rhythm

## Section grouping

Related content should be visually grouped. Use spacing and surface containers to create clear sections:

- Group related form fields together inside a single `surface-bg` card with `gap-lg`
- Separate distinct sections into their own cards with `gap-xl` between them
- Each section should have a heading that labels its purpose
- Do not scatter related content across multiple cards or leave fields ungrouped

```tsx
{/* CORRECT — related fields grouped in one card */}
<div className="bg-surface-bg rounded-corner-lg p-xl">
  <h2 className="text-label text-text-primary font-semibold mb-lg">Personal Information</h2>
  <div className="flex flex-col gap-lg">
    <InputField label="First Name" />
    <InputField label="Last Name" />
    <InputField label="Email" />
  </div>
</div>

{/* WRONG — each field in its own card */}
<div className="flex flex-col gap-xl">
  <div className="bg-surface-bg rounded-corner-lg p-xl">
    <InputField label="First Name" />
  </div>
  <div className="bg-surface-bg rounded-corner-lg p-xl">
    <InputField label="Last Name" />
  </div>
</div>
```

## Content density balance

Different areas of the UI have different density expectations:

| Region | Density | Spacing | Examples |
|---|---|---|---|
| Navigation (sidebar, secondary nav) | High | `gap-md` (8px) | Compact icon buttons, tight nav items |
| Toolbars | High | `gap-md` (8px) | Compact tool buttons |
| Form content | Medium | `gap-lg` (12px) between fields | Comfortable field spacing, readable labels |
| Card stacks | Medium | `gap-xl` (16px) between cards | Clear section separation |
| Page-level | Generous | `p-2xl` (24px) padding | Breathing room at page edges |
| Dashboard headers | Generous | `gap-2xl` (24px) between sections | Major section breaks |

A single page should not be uniformly dense or uniformly sparse. Vary density by region to create visual rhythm — tight in navigation, comfortable in content, generous at page level.

## Whitespace rhythm

Spacing between elements follows a predictable pattern based on relationship:

| Relationship | Token | Value | Example |
|---|---|---|---|
| Tightly coupled | `space-xs` | 4px | Title → subtitle, label → input |
| Within a component | `space-md` | 8px | Nav item gaps, toolbar gaps |
| Between fields in a card | `space-lg` | 12px | Form field vertical stack |
| Between section cards | `space-xl` | 16px | Card stack separation |
| Card internal padding | `space-xl` | 16px | Padding inside each card |
| Page-level padding | `space-2xl` | 24px | Main content area edges |
| Major section breaks | `space-2xl` | 24px | Dashboard section separation |

**The proximity principle is the most important spacing rule:** elements that are conceptually related should be closer together, elements that are conceptually separate should have more space between them.

```tsx
{/* CORRECT — proximity reflects relationships */}
<div className="mb-xl">
  {/* Title and description are tightly coupled → xs gap */}
  <h1 className="text-title text-text-primary">Profile</h1>
  <p className="text-label-sm text-text-secondary mt-xs">Manage your account</p>
</div>
{/* Card stack is a separate concept → xl gap from header */}
<div className="flex flex-col gap-xl">
  <div className="bg-surface-bg rounded-corner-lg p-xl">
    {/* Fields within a card → lg gap */}
    <div className="flex flex-col gap-lg">
      <InputField label="Name" />
      <InputField label="Email" />
    </div>
  </div>
</div>
```

## Rules

- Related fields belong in the same card — do not split them across cards
- Unrelated sections get their own cards — do not combine them
- Use the spacing token that matches the relationship between elements
- Never hardcode pixel values — always use spacing tokens
- Vary density by region: tight in nav/toolbars, comfortable in content, generous at page level
- If elements are touching with no gap, the layout is wrong
