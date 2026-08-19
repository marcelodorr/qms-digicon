# Icon Sizing in Layouts

## Aspect ratio

Icons must always render at their native aspect ratio (1:1). Never stretch or squash icons with width/height overrides:

```tsx
{/* CORRECT — square at native size */}
<Search size={24} />

{/* WRONG — distorted icon via className */}
<Search className="w-6 h-4" />
```

## Size precision

Use exact icon sizes from the Astra system. Do not use arbitrary sizes like 18px or 20px:

| Size | Usage |
|---|---|
| 24px | Toolbar items, segmented controls, video controls |
| 16px | Input prefixes, button icons, inline indicators |
| `size-full` | SidebarButton, SecondaryNavItem (parent controls size) |
| 32px | Large feature icons, empty states (rare) |

```tsx
{/* CORRECT — standard sizes */}
<ToolbarItem icon={<Scissors size={24} />} />
<Button iconStart={<Plus size={16} />}>Add</Button>
<InputField prefix={<Search size={16} />} label="Search" />

{/* WRONG — arbitrary size */}
<ToolbarItem icon={<Scissors size={20} />} />
<Button iconStart={<Plus size={18} />}>Add</Button>
```

## Size consistency

All icons within the same context must be the same size:

- All icons in a Toolbar → `size={24}`
- All icons in SidebarNavigation → `className="size-full"`
- All icons in SecondaryNav → `className="size-full"`
- All icons in a SegmentedControl → `size={24}`
- All prefix icons in a form → `size={16}`

Do not mix icon sizes in the same row, list, toolbar, or navigation.

```tsx
{/* CORRECT — consistent 24px in toolbar */}
<Toolbar>
  <ToolbarItem icon={<MousePointer size={24} />} selected />
  <ToolbarItem icon={<Type size={24} />} />
  <ToolbarItem icon={<Scissors size={24} />} />
</Toolbar>

{/* WRONG — mixed sizes in toolbar */}
<Toolbar>
  <ToolbarItem icon={<MousePointer size={24} />} selected />
  <ToolbarItem icon={<Type size={16} />} />
  <ToolbarItem icon={<Scissors size={20} />} />
</Toolbar>
```

## Icons alongside text

When placing icons inline with text, vertically center them:

```tsx
{/* Icon + text inline — use flex items-center */}
<span className="flex items-center gap-xs text-text-secondary">
  <Clock size={16} />
  <span className="text-video-title">2 hours ago</span>
</span>
```

Use `gap-xs` (4px) between icon and text for tight inline pairings.
