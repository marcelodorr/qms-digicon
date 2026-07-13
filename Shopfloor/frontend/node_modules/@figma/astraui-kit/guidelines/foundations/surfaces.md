# Surface Tokens

## Background strategy

Astra uses a **layered surface strategy** — visual hierarchy is achieved through background color variation, not borders. A branded `brand-tertiary` canvas provides ambient identity, with `surface-bg` cards floating on top.

| Token | Tailwind | Frequency | Usage |
|---|---|---|---|
| `--brand-tertiary` | `bg-brand-tertiary` | **Dominant** | Page background canvas |
| `--surface-bg` | `bg-surface-bg` | **Dominant** | Cards, panels, sidebar, elevated content |
| `--surface-secondary-bg` | `bg-surface-secondary-bg` | Common | Secondary navigation panel |
| `--bg-faint` | `bg-bg-faint` | Occasional | Recessed areas within cards |
| `--bg-subtle` | `bg-bg-subtle` | Occasional | Subtle grouping, input backgrounds |
| `--input-bg` | `bg-input-bg` | Common | Input field backgrounds |
| `--surface-hover` | `bg-surface-hover` | Interactive | Hover states on regions |
| `--bg-hover` | `bg-bg-hover` | Interactive | Hover states on tinted areas |

## Surface layering

Astra's surface hierarchy stacks from bottom to top:

```
brand-tertiary        → page background canvas (branded lavender)
surface-bg            → elevated content (cards, panels, forms, sidebar)
surface-secondary-bg  → secondary navigation panel
bg-faint              → recessed areas within elevated surfaces
bg-subtle             → subtle grouping within elevated surfaces
input-bg              → input field backgrounds
surface-hover         → hover state for interactive regions
```

The key principle: **the branded canvas provides identity, elevated surfaces provide hierarchy.** Content cards in `surface-bg` visually "float" on the `brand-tertiary` background — this contrast is what creates separation without borders.

## Separation strategy

Use **surface color contrast** to define content regions, not borders:

```tsx
{/* CORRECT — surface color separation (dominant pattern) */}
<main className="bg-brand-tertiary p-2xl">
  <div className="bg-surface-bg rounded-corner-lg p-xl">
    {/* Card floats on canvas — color contrast creates separation */}
  </div>
</main>

{/* AVOID — adding unnecessary borders to cards on the canvas */}
<main className="bg-brand-tertiary p-2xl">
  <div className="bg-surface-bg border border-border-primary rounded-corner-lg p-xl">
    {/* Border is redundant — the surface contrast already separates */}
  </div>
</main>
```

Borders are reserved for:
- Interactive elements (inputs, buttons, clickable cards)
- The sidebar navigation (uses `border-r border-border-primary`)
- Floating overlays (toolbar, modal — `border-border-primary` + shadow)
- Explicit content boundaries within interactive components

## Surface stacking decision tree

```
┌─ "How should I layer this surface?"
│
├─ Page canvas (main content area)?
│  └─ bg-brand-tertiary — always the base layer
│
├─ Card or panel on the canvas?
│  └─ bg-surface-bg rounded-corner-lg p-xl
│     Color contrast with canvas creates separation
│
├─ Sidebar navigation?
│  └─ bg-surface-bg with border-r border-border-primary
│
├─ Secondary navigation panel?
│  └─ bg-surface-secondary-bg with border-r border-border-primary
│
├─ Recessed area within a card (metadata, grouped content)?
│  └─ bg-bg-faint or bg-bg-subtle
│
├─ Input field within a card?
│  └─ bg-input-bg (handled by InputField component)
│
├─ Modal or overlay?
│  └─ bg-surface-bg + shadow + bg-modal-scrim backdrop
│     Modal component handles this internally
│
└─ Hover state on an interactive surface?
   └─ bg-surface-hover or bg-bg-hover
```

## Surface separation decision tree

```
┌─ "How should I visually separate two adjacent regions?"
│
├─ Content card on page canvas?
│  └─ Surface color contrast (bg-surface-bg on bg-brand-tertiary)
│     No border needed — the color difference is enough
│
├─ Side-by-side panels (sidebar | content)?
│  └─ border-r border-border-primary on the left panel
│
├─ Stacked section cards (vertical)?
│  └─ Spacing gap — flex flex-col gap-xl
│     Each card is its own bg-surface-bg container
│
├─ Nested region within a card?
│  └─ bg-bg-faint or bg-bg-subtle background
│     Must be visually distinct from parent surface-bg
│
└─ Interactive card (ItemCard, clickable)?
   └─ border-border-primary border on the card
      Borders communicate interactivity
```

## Common mistakes

```tsx
{/* WRONG — white/gray page background instead of branded canvas */}
<main className="bg-white p-2xl">
  {/* Missing brand identity — must use bg-brand-tertiary */}
</main>

{/* WRONG — content directly on canvas without elevation */}
<main className="bg-brand-tertiary p-2xl">
  <InputField label="Name" />
  {/* Form fields should be inside a surface-bg card */}
</main>

{/* CORRECT — card elevated on canvas */}
<main className="bg-brand-tertiary p-2xl">
  <div className="bg-surface-bg rounded-corner-lg p-xl">
    <InputField label="Name" />
  </div>
</main>

{/* WRONG — borders between layout regions where color handles it */}
<div className="bg-brand-tertiary border-l border-border-primary">
  {/* The surface color change from sidebar already separates */}
</div>

{/* WRONG — brand-primary as a large surface */}
<div className="bg-brand-primary p-2xl">
  <h2 className="text-on-brand">Welcome</h2>
  {/* brand-primary is for small accents, not section backgrounds */}
</div>
```

## Rules

- The page canvas is ALWAYS `bg-brand-tertiary` — never white or gray
- Content cards and panels use `bg-surface-bg` and float on the canvas
- Surface color contrast is the primary separation tool — not borders
- Borders are for interactive elements and explicit panel edges only
- Never place form fields or content directly on the canvas — wrap in a `bg-surface-bg` card
- Each logical section gets its own `bg-surface-bg rounded-corner-lg p-xl` card
