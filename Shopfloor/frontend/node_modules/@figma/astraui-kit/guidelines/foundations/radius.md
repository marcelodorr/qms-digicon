# Border Radius Tokens

Corner style: **Rounded** — generous rounding with `corner-md` (8px) as the default.

## Scale

| Token | Value | Tailwind | Frequency | Usage |
|---|---|---|---|---|
| `--corner-sm` | 4px | `rounded-corner-sm` | Occasional | Small elements, dot separators, mini badges |
| `--corner-md` | 8px | `rounded-corner-md` | **Common** | Inputs, badges, toolbar items, ItemCard |
| `--corner-lg` | 16px | `rounded-corner-lg` | **Dominant** | Content cards, panels, floating overlays, modals |
| `--corner-full` | 999px | `rounded-corner-full` | Common | Buttons (pill shape), avatars, toggles |

## Decision tree

```
┌─ "What border radius should I use?"
│
├─ SMALL element (badge, dot separator, mini indicator)?
│  └─ rounded-corner-sm (4px)
│
├─ INTERACTIVE ELEMENT (input, select, toolbar item)?
│  └─ rounded-corner-md (8px)
│
├─ CONTENT CARD or PANEL (surface-bg containers)?
│  └─ rounded-corner-lg (16px) ⭐ Most common for layout
│
├─ FLOATING OVERLAY (toolbar, modal, large card)?
│  └─ rounded-corner-lg (16px)
│
├─ BUTTON (pill shape)?
│  └─ rounded-corner-full (999px)
│
└─ AVATAR or CIRCULAR ELEMENT?
   └─ rounded-corner-full (999px)
```

## Component-to-radius mapping

| Component | Radius | Token |
|---|---|---|
| Button | pill | `rounded-corner-full` |
| InputField, SelectField, TextareaField | 8px | `rounded-corner-md` |
| Content cards (`bg-surface-bg` containers) | 16px | `rounded-corner-lg` |
| ItemCard | 8px | `rounded-corner-md` |
| Modal | 16px | `rounded-corner-lg` |
| Toolbar | 16px | `rounded-corner-lg` |
| ToolbarItem | 8px | `rounded-corner-md` |
| Badge | 8px | `rounded-corner-md` |
| DurationBadge | 8px | `rounded-corner-md` |
| Avatar (circle) | pill | `rounded-corner-full` |
| Avatar (square) | 8px | `rounded-corner-md` |
| Tooltip | 8px | `rounded-corner-md` (uses `rounded-lg`) |

## Rules

- Use `rounded-corner-lg` (16px) for content cards and panels — this is the standard card shape
- Use `rounded-corner-md` (8px) for interactive elements and smaller components
- Use `rounded-corner-full` (999px) for buttons and circular elements
- Nested elements should use equal or smaller radius than their parent
- Do not use arbitrary border-radius values — every rounded corner should use a token from this scale

```tsx
{/* CORRECT — card uses corner-lg */}
<div className="bg-surface-bg rounded-corner-lg p-xl">
  <InputField label="Name" />
</div>

{/* WRONG — arbitrary radius */}
<div className="bg-surface-bg rounded-[12px] p-xl">
  <InputField label="Name" />
</div>
```
