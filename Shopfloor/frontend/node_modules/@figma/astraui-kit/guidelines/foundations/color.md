# Color Tokens

## Color palette overview

Astra uses a primarily neutral palette with a branded lavender canvas. Brand color (`brand-primary`) is used sparingly — only for primary actions, active states, and small accents.

| Role | Value (light) | Token | Frequency | Usage |
|---|---|---|---|---|
| Lavender canvas | `#eaeaff` | `--brand-tertiary` | **Dominant** | Page background canvas |
| White surface | `#ffffff` | `--surface-bg` | **Dominant** | Cards, panels, sidebar, elevated content |
| Black text | `rgba(0,0,0,0.85)` | `--text-primary` | **Dominant** | Primary text |
| Brand purple | `#5250f3` | `--brand-primary` | Sparse | Primary buttons, active tabs, progress bars |
| Dark surface | `#22222c` | `--surface-dark` | Internal | Tooltips, component internals |

The UI is ~90% neutral surfaces (`brand-tertiary` canvas + `surface-bg` cards). Brand color appears only in primary actions, active indicators, and small highlights.

## Naming pattern

Astra tokens follow: `--{category}-{role}`

- **category**: `brand`, `surface`, `text`, `border`, `bg`
- **role**: describes the semantic purpose

| Category | Tokens | Used for |
|---|---|---|
| `brand-*` | `primary`, `hover`, `dark`, `secondary`, `tertiary`, `muted` | Brand identity, actions, canvas |
| `surface-*` | `bg`, `secondary-bg`, `hover`, `dark`, `dark-hover`, `darkest` | Content surfaces, tooltips, component internals |
| `text-*` | `primary`, `secondary`, `tertiary` | Text hierarchy |
| `border-*` | `primary`, `secondary`, `selected` | Interactive element borders |
| `bg-*` | `faint`, `subtle`, `hover` | Background tints within surfaces |
| `on-*` | `brand`, `reverse` | Text on solid color backgrounds |
| Status | `success`, `warning`, `danger` | Semantic status indicators |

## Tailwind class mapping

Tokens are mapped to Tailwind via `@theme inline`. Use these classes — never hardcode hex values.

```
bg-brand-primary, text-brand-primary, border-brand-primary
bg-brand-hover, bg-brand-dark, bg-brand-secondary, bg-brand-tertiary, bg-brand-muted
bg-surface-bg, bg-surface-secondary-bg, bg-surface-hover, bg-surface-dark
text-text-primary, text-text-secondary, text-text-tertiary
border-border-primary, border-border-secondary, border-border-selected
bg-bg-faint, bg-bg-subtle, bg-bg-hover
text-on-brand, text-on-reverse
bg-success, bg-warning, bg-danger
bg-input-bg, bg-modal-scrim
```

## Decision trees

### Background color

```
┌─ "What background color should I use?"
│
├─ Page canvas (main content area)?
│  └─ bg-brand-tertiary
│
├─ Elevated content (card, panel, form container)?
│  └─ bg-surface-bg
│
├─ Sidebar navigation?
│  └─ bg-surface-bg (with border-r border-border-primary)
│
├─ Secondary navigation panel?
│  └─ bg-surface-secondary-bg
│
├─ Recessed area within a card?
│  └─ bg-bg-faint
│
├─ Input field background?
│  └─ bg-input-bg
│
├─ Subtle grouping within a card?
│  └─ bg-bg-subtle
│
├─ Hover state on an interactive region?
│  └─ bg-surface-hover or bg-bg-hover
│
├─ Primary action button?
│  └─ bg-brand-primary + text-on-brand
│
├─ AI chat bubble?
│  └─ bg-brand-secondary (built into ChatBubbles component)
│
├─ Modal backdrop?
│  └─ bg-modal-scrim
│
└─ Status indicator?
   └─ bg-success, bg-warning, or bg-danger
```

### Text color

```
┌─ "What text color should I use?"
│
├─ PRIMARY content users must read?
│  └─ text-text-primary
│
├─ SUPPORTING information (descriptions, helper text, timestamps)?
│  └─ text-text-secondary
│
├─ DECORATIVE or very low priority (placeholders, disabled labels)?
│  └─ text-text-tertiary
│
├─ Interactive text (active tab label, link)?
│  └─ text-brand-primary
│
├─ Text on brand-primary background?
│  └─ text-on-brand (always white)
│
├─ Status text?
│  └─ text-danger, text-success, text-warning
│
└─ Element that must stay dark in both modes?
   └─ text-on-reverse
```

### Border color

```
┌─ "What border color should I use?"
│
├─ Default interactive element (input, select, clickable card)?
│  └─ border-border-primary
│
├─ Subtle separator (secondary divider, card edge)?
│  └─ border-border-secondary
│
├─ Focused or selected element?
│  └─ border-border-selected
│
└─ Layout region boundary?
   └─ No border — use surface color contrast instead
      Exception: SidebarNavigation uses border-r border-border-primary
```

### Icon color

```
Icons inherit text color via currentColor. Follow the text hierarchy:
├─ Primary → text-text-primary (default via currentColor)
├─ Secondary → text-text-secondary
├─ On brand background → text-on-brand
├─ Active/selected → text-brand-primary
└─ Status → text-danger, text-success, text-warning
```

## Token usage by element type

### Buttons
- Primary: `bg-brand-primary` background, `text-on-brand` text
- Neutral: `bg-surface-bg` background, `text-text-primary` text, `border-border-primary` border
- Subtle: transparent background, `text-text-primary` text

### Text
- Body text: `text-text-primary`
- Descriptions, metadata: `text-text-secondary`
- Placeholders: `text-text-tertiary`
- Active tab, link: `text-brand-primary`
- Error message: `text-danger`

### Surfaces
- Page canvas: `bg-brand-tertiary`
- Elevated cards/panels: `bg-surface-bg`
- Sidebar: `bg-surface-bg` with `border-r border-border-primary`
- Recessed areas: `bg-bg-faint` or `bg-bg-subtle`
- Tooltips: `bg-surface-dark` (component internal)

### Icons
- Default: inherits `currentColor` from parent text color
- Active sidebar item: 85% opacity via component
- Status: `text-danger`, `text-success`

## Common mistake: "on-" roles

Use `on-brand` for text on solid brand backgrounds:

```tsx
{/* CORRECT — white text on brand background */}
<div className="bg-brand-primary text-on-brand">Save</div>

{/* WRONG — primary text disappears on brand background */}
<div className="bg-brand-primary text-text-primary">Save</div>
```

`on-reverse` (`#1e1e1e`) is for elements that must stay dark in both light and dark modes — e.g., the dot separator in `ItemCard` metadata.

## Common mistake: brand color overuse

IMPORTANT: `brand-primary` and `brand-secondary` are for small accents only. Never use them as backgrounds for cards, panels, sections, or large areas.

```tsx
{/* CORRECT — brand on a button */}
<Button variant="primary">Save</Button>

{/* WRONG — brand as a section background */}
<div className="bg-brand-primary p-xl">
  <h2>Welcome</h2>
</div>
```
