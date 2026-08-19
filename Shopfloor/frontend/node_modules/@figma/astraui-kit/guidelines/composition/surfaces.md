# Surfaces

## Visible layering

Every content region must have a clear visual surface. The user should be able to identify distinct areas at a glance.

- The page canvas is always `bg-brand-tertiary` — this is the base layer
- Content cards and panels use `bg-surface-bg` — they float on the canvas
- Do not place content directly on the canvas without a `surface-bg` container
- Navigation panels use their own surface tokens (`surface-bg` for sidebar, `surface-secondary-bg` for secondary nav)

## Contrast stacking

When stacking surfaces, adjacent layers must have sufficient visual contrast:

| Boundary | Separation method |
|---|---|
| Canvas → card | Background color contrast (`brand-tertiary` → `surface-bg`) |
| Sidebar → content | `border-r border-border-primary` on the sidebar |
| SecondaryNav → content | `border-r border-border-primary` on the nav panel |
| Card → recessed area | Background step (`surface-bg` → `bg-faint` or `bg-subtle`) |
| Card → input field | `bg-input-bg` inside the input component |
| Page → modal | `bg-modal-scrim` backdrop + `surface-bg` modal |

Do not use both a border and a background color change at the same boundary — pick one. For Astra, surface color contrast is the primary tool; borders are the exception for panel edges.

```tsx
{/* CORRECT — surface color creates separation */}
<main className="bg-brand-tertiary p-2xl">
  <div className="bg-surface-bg rounded-corner-lg p-xl">
    {/* Content is visually distinct from canvas */}
  </div>
</main>

{/* WRONG — card on canvas with redundant border */}
<main className="bg-brand-tertiary p-2xl">
  <div className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl">
    {/* Border is unnecessary — color contrast already separates */}
  </div>
</main>

{/* WRONG — content directly on canvas */}
<main className="bg-brand-tertiary p-2xl">
  <InputField label="Name" />
  {/* No containing surface — fields float unstyled */}
</main>
```

## Elevation stacking

| Level | Use for | Astra implementation |
|---|---|---|
| 0 | Page canvas | `bg-brand-tertiary` |
| 1 | Cards, panels, sidebar | `bg-surface-bg` (no shadow) |
| 2 | Floating toolbar | `bg-surface-bg` + shadow + border |
| 3 | Modal | `bg-surface-bg` + `bg-modal-scrim` backdrop |

Modals always use the highest elevation. Do not nest elevated surfaces more than 2 levels deep.

## Overflow

Content must not overflow its container:

- The main content area uses `overflow-y-auto` for vertical scrolling
- Sidebars scroll independently from the main content
- Long text should truncate with ellipsis or wrap — never overflow horizontally
- Modal content that exceeds viewport height scrolls internally (handled by Modal component)

```tsx
{/* CORRECT — independent scrolling regions */}
<div className="flex h-screen">
  <SidebarNavigation>{/* fixed height, internal scroll */}</SidebarNavigation>
  <SecondaryNav title="Settings">{/* full height, internal scroll */}</SecondaryNav>
  <main className="flex-1 bg-brand-tertiary p-2xl overflow-y-auto">
    {/* Main content scrolls independently */}
  </main>
</div>
```

## Rules

- Every content region must sit on a visible surface — no unstyled floating content
- Surface color contrast is the primary separation tool, not borders
- Do not add shadows to cards or panels — only floating overlays get shadows
- Each panel in the layout scrolls independently
- Do not nest visible containers more than 3 levels deep
