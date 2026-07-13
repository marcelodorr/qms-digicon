# Icons

## Icon library

All icons come from `lucide-react`. Do NOT import icons from `@figma/astraui` or create inline SVGs.

```tsx
import { Home, Search, Settings } from 'lucide-react'
```

For the complete catalog of available icons, see `icon-discovery.md`.

## Icon sizes

| Size | Frequency | Usage |
|---|---|---|
| 24px | ~60% | Toolbar items, segmented controls, video controls |
| 20px | ~20% | Sidebar buttons, secondary nav items (via `className="size-full"` on parent) |
| 16px | ~15% | Input prefixes/suffixes, inline indicators, compact UI |
| 32px | ~5% | Large feature icons, empty states |

Default to 24px for most UI contexts. Use 16px for inline positions within inputs or compact elements.

## Sizing patterns

```tsx
{/* Standard 24px — explicit size prop */}
<Search size={24} />

{/* 16px — for input prefixes */}
<InputField prefix={<Search size={16} />} label="Search" />

{/* Fill parent container — used in SidebarButton and SecondaryNavItem */}
<SidebarButton icon={<Home className="size-full" strokeWidth={1.5} />} />
<SecondaryNavItem icon={<Home className="size-full" strokeWidth={1.5} />} label="Home" />
```

When icons are passed to `SidebarButton` or `SecondaryNavItem`, use `className="size-full"` and `strokeWidth={1.5}` — the parent component controls the rendered size.

## Naming convention

Lucide icons use PascalCase imports derived from kebab-case file names:

- File: `arrow-up.js` → Import: `ArrowUp`
- File: `chevron-down.js` → Import: `ChevronDown`
- File: `more-horizontal.js` → Import: `MoreHorizontal`

## Color

Icons inherit color from their parent via `currentColor` by default. Control icon color through the parent's text color class:

| Context | Parent class | Result |
|---|---|---|
| Default | `text-text-primary` | Standard icon color |
| Secondary/muted | `text-text-secondary` | Reduced emphasis |
| On brand surface | `text-on-brand` | White icon |
| Active/selected | `text-brand-primary` | Brand-colored icon |
| Status | `text-danger`, `text-success` | Semantic color |

```tsx
{/* Icon inherits text-text-secondary from parent */}
<span className="text-text-secondary">
  <Clock size={16} /> 2 hours ago
</span>

{/* Icon inherits brand color */}
<span className="text-brand-primary">
  <Check size={16} /> Selected
</span>
```

## Props

All lucide icons accept:

| Prop | Default | Usage |
|---|---|---|
| `size` | `24` | Icon dimensions in pixels |
| `color` | `"currentColor"` | Override color (prefer parent class instead) |
| `strokeWidth` | `2` | Stroke width — use `1.5` for nav icons |
| `className` | — | Additional classes (`"size-full"` for container-fill) |

## Rules

IMPORTANT: Do NOT guess icon names. Always verify against `icon-discovery.md` before importing.

- Always import from `lucide-react` — never from `@figma/astraui`
- Never create inline SVGs — always use lucide icon components
- Use consistent sizes within the same context — do not mix 16px and 24px icons in the same toolbar or list
- Use `strokeWidth={1.5}` for icons inside `SidebarButton` and `SecondaryNavItem`
- Use `className="size-full"` when the parent component controls icon size
- Control icon color through parent text classes, not the `color` prop
