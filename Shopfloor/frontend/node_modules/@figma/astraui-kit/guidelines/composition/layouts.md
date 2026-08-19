# Layout Structure

## Container hierarchy

Pages should have clear nesting depth — the canvas contains cards, cards contain content. Aim for 2–3 levels of visible nesting:

```
Page canvas (brand-tertiary)
└── Section card (surface-bg, rounded-corner-lg, p-xl)
    └── Content (text, inputs, buttons)
        └── Optional: recessed area (bg-faint or bg-subtle)
```

Do not create flat pages where all content sits at the same level. Do not over-nest — more than 3 levels of visible containers creates clutter.

## Page structure

Every desktop page follows this structure:

```tsx
<div className="flex h-screen">
  {/* Primary nav — always present */}
  <SidebarNavigation footer={...}>
    <SidebarButton icon={<Home className="size-full" strokeWidth={1.5} />} />
    ...
  </SidebarNavigation>

  {/* Secondary nav — optional, for pages with sub-sections */}
  <SecondaryNav title="...">
    <SecondaryNavItem icon={...} label="..." />
  </SecondaryNav>

  {/* Main content — always brand-tertiary */}
  <main className="flex-1 bg-brand-tertiary p-2xl overflow-y-auto">
    {/* Page header — on canvas, not in a card */}
    <div className="mb-xl">
      <h1 className="text-title text-text-primary">Page Title</h1>
      <p className="text-label-sm text-text-secondary mt-xs">Description</p>
    </div>

    {/* Card stack — each section = separate card */}
    <div className="flex flex-col gap-xl max-w-3xl">
      <div className="bg-surface-bg rounded-corner-lg p-xl">
        {/* Section content */}
      </div>
      <div className="bg-surface-bg rounded-corner-lg p-xl">
        {/* Section content */}
      </div>
    </div>
  </main>
</div>
```

## Card stack pattern

For form pages and settings:

- Each logical section gets its own `surface-bg` card
- Cards are separated by `gap-xl` (16px) — use `flex flex-col gap-xl`
- Inside each card: `flex flex-col gap-lg` (12px) between fields
- Section heading goes inside its card as the first element
- Page header sits on the canvas above the card stack

```tsx
<div className="flex flex-col gap-xl max-w-3xl">
  {/* Card 1 */}
  <div className="bg-surface-bg rounded-corner-lg p-xl">
    <h2 className="text-label text-text-primary font-semibold mb-lg">Profile Photo</h2>
    <div className="flex items-center gap-lg">
      <Avatar type="initial" initials="SC" size="large" />
      <Button variant="neutral" size="small">Change Photo</Button>
    </div>
  </div>

  {/* Card 2 */}
  <div className="bg-surface-bg rounded-corner-lg p-xl">
    <h2 className="text-label text-text-primary font-semibold mb-lg">Personal Information</h2>
    <div className="flex flex-col gap-lg">
      <div className="flex gap-xl">
        <div className="flex-1"><InputField label="First Name" /></div>
        <div className="flex-1"><InputField label="Last Name" /></div>
      </div>
      <InputField label="Email" />
    </div>
  </div>
</div>
```

## Content grid pattern

For dashboards and media galleries:

```tsx
<div className="flex flex-col gap-2xl">
  {/* Header row */}
  <div className="flex items-center justify-between">
    <h1 className="text-title text-text-primary">Dashboard</h1>
    <div className="flex items-center gap-lg">
      <SearchComponent placeholder="Search" />
      <Button variant="primary">New Project</Button>
    </div>
  </div>

  {/* Card grid */}
  <div>
    <h2 className="text-heading text-text-primary mb-lg">Recently Viewed</h2>
    <div className="grid grid-cols-4 gap-xl">
      <ItemCard title="Video 1" duration="0:01:30" />
      <ItemCard title="Video 2" duration="0:02:15" />
      <ItemCard title="Video 3" duration="0:00:45" />
      <ItemCard title="Video 4" duration="0:03:00" />
    </div>
  </div>
</div>
```

## Two-column layout pattern

For pages with a main content area and a side panel:

```tsx
<div className="flex gap-xl">
  <div className="flex-1 bg-surface-bg rounded-corner-lg p-xl">
    {/* Main content */}
  </div>
  <div className="w-[320px] bg-surface-bg rounded-corner-lg p-xl">
    {/* Side panel */}
  </div>
</div>
```

## List repetition consistency

Repeated items in a list must be visually identical:

- Same height, padding, and layout for every row
- Same icon size and position in every item
- Same typography and color treatment for every label
- If one item has a badge or status indicator, allocate the same space in every item (even if empty)

## Grid cell uniformity

Cards or tiles in a grid must have:

- Equal width — use `grid-template-columns: repeat(n, 1fr)`
- Equal height — grid handles this by default with `align-items: stretch`
- Consistent internal padding
- Same content structure in every card

## Rules

- Every page starts with `SidebarNavigation` — no exceptions
- Main content uses `bg-brand-tertiary` with `p-2xl` and `overflow-y-auto`
- Each logical section gets its own `bg-surface-bg rounded-corner-lg p-xl` card
- Never combine unrelated sections in one card
- Use `max-w-3xl` on form card stacks to prevent overly wide forms
- Use `flex flex-col gap-xl` between cards, `flex flex-col gap-lg` between fields
- Page header sits on the canvas, not inside a card
