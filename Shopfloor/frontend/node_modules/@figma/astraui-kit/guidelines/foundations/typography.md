# Typography Tokens

## Font families

Astra uses a single font family for all UI text:

| Family | Token | Tailwind | Usage |
|---|---|---|---|
| Instrument Sans | `font-sans` | `font-sans` | **All UI text** — body, labels, inputs |
| Instrument Sans | `font-display` | `font-display` | Titles (same family, used semantically) |

Both `font-sans` and `font-display` resolve to `'Instrument Sans', system-ui, sans-serif`. Do not use other font families directly.

## Type scale

Astra uses composite typography classes that bundle size, weight, line height, and extras together. Always use these classes — do not set font-size independently.

| Class | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-title` | 24px | 600 (SemiBold) | 1.4 | Page titles, major headings |
| `text-heading` | 20px | 500 (Medium) | 1.4 | Section headings |
| `text-caption` | 20px | 600 (SemiBold) | 1.4 | Uppercase captions |
| `text-label` | 16px | 500 (Medium) | 1.4 | Form labels, card section headings, button text |
| `text-label-sm` | 14px | 500 (Medium) | 1.4 | Descriptions, helper text, secondary labels |
| `text-input` | 16px | 400 (Regular) | 1.4 | Input field values |
| `text-input-sm` | 14px | 500 (Medium) | 1.4 | Small input values, DurationBadge text |
| `text-video-title` | 12px | 400 (Regular) | normal | Metadata, timestamps, smallest text |

The dominant text sizes are 16px (`text-label`) and 14px (`text-label-sm`). Do not use arbitrary font sizes — every text element should map to a class from this scale.

## Font weights

| Tailwind | Weight | Usage |
|---|---|---|
| `font-book` | 450 | Occasional — between regular and medium |
| `font-medium` | 500 | **Default for labels and UI text** |
| `font-semibold` | 600 | Titles, section headings, strong emphasis |

Most UI text uses `font-medium` (500) via the composite type classes. Do not use weights outside this set (no 300, 700, 800, or 900).

## Decision tree

```
┌─ "What typography class should I use?"
│
├─ PAGE TITLE (top of page, one per view)?
│  └─ text-title (24px semibold)
│
├─ SECTION HEADING (within page content)?
│  └─ text-heading (20px medium)
│
├─ UPPERCASE CAPTION or label?
│  └─ text-caption (20px semibold, uppercase)
│
├─ CARD SECTION HEADING or form label?
│  └─ text-label (16px medium)
│
├─ DESCRIPTION, helper text, or secondary info?
│  └─ text-label-sm (14px medium)
│
├─ INPUT FIELD VALUE?
│  └─ text-input (16px regular)
│
├─ SMALL INPUT or compact field?
│  └─ text-input-sm (14px medium)
│
└─ METADATA, timestamp, or fine print?
   └─ text-video-title (12px regular)
```

## Line height

All composite type classes include a paired line height of `1.4` (except `text-video-title` which uses `normal`). Do not override line height independently.

```tsx
{/* CORRECT — use the composite class */}
<h1 className="text-title text-text-primary">Page Title</h1>

{/* WRONG — arbitrary size and line height */}
<h1 className="text-2xl leading-8 font-semibold">Page Title</h1>
```

## Common patterns

### Page header
```tsx
<h1 className="text-title text-text-primary">Profile</h1>
<p className="text-label-sm text-text-secondary mt-xs">Manage your account settings</p>
```

### Card section heading
```tsx
<h2 className="text-label text-text-primary font-semibold mb-lg">Personal Information</h2>
```

### Metadata row
```tsx
<span className="text-video-title text-text-primary">Edited 2m ago</span>
```

## Rules

- Always use composite type classes (`text-title`, `text-label`, etc.) — never set `font-size` directly
- Do not use Tailwind's default size classes (`text-sm`, `text-base`, `text-lg`) — use Astra's type scale
- Text color is separate — pair type classes with `text-text-primary`, `text-text-secondary`, or `text-text-tertiary`
- Reduce importance through scale (smaller type class), not opacity — use `text-video-title` at `text-text-primary` rather than `text-label` at `text-text-tertiary`
