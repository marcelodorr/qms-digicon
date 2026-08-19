# Composition

These guidelines cover how to combine components and tokens into complete, polished layouts. Every page should have clear visual hierarchy, consistent spacing rhythm, and well-defined content regions.

## Principles

- Every content region must have a visible surface — `surface-bg` cards on the `brand-tertiary` canvas, never content floating unstyled
- Spacing should follow a predictable rhythm — related items closer (`gap-lg`), separate sections farther (`gap-xl`)
- Pages need 2–3 levels of visual hierarchy — not everything should compete for attention
- All repeated elements (list items, grid cells, card layouts) must be visually identical
- Complexity is revealed progressively — show only what's needed at rest

## Files

| File | Covers |
|---|---|
| `alignment.md` | Text alignment, button heights, grid alignment |
| `icons.md` | Icon sizing rules within layouts |
| `surfaces.md` | Layering, contrast stacking, overflow |
| `layouts.md` | Container hierarchy, lists, grids, page structure |
| `density.md` | Section grouping, content density, whitespace rhythm |
| `hierarchy.md` | Visual weight, region completeness, information depth |

## Common page patterns

### Settings / form page
```
SidebarNavigation → SecondaryNav → Main (brand-tertiary)
                                    ├── Page header (title + description)
                                    └── Card stack (flex flex-col gap-xl)
                                        ├── Section card (surface-bg, rounded-corner-lg, p-xl)
                                        ├── Section card
                                        └── Section card
```

### Dashboard / content page
```
SidebarNavigation → Main (brand-tertiary)
                     ├── Header row (title + search + actions)
                     ├── Feature row (flex gap-xl, surface-bg cards)
                     └── Content grid (grid grid-cols-N gap-xl, ItemCards)
```

### Editor / workspace page
```
SidebarNavigation → Main workspace (brand-tertiary)
                     ├── Canvas/preview area
                     ├── Floating Toolbar (absolute positioned)
                     └── PromptPane (chat sidebar)
```
