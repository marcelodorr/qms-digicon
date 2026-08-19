# Visual Hierarchy

## Visual weight distribution

Not all content should compete for attention. Create a clear primary → secondary → tertiary reading flow:

| Level | Typography | Color | Examples |
|---|---|---|---|
| **Primary** | `text-title` (24px semibold) | `text-text-primary` | Page title, main CTA |
| **Secondary** | `text-heading` (20px) or `text-label` (16px) | `text-text-primary` | Section headings, card titles, key data |
| **Tertiary** | `text-label-sm` (14px) | `text-text-secondary` | Descriptions, helper text, timestamps |
| **Metadata** | `text-video-title` (12px) | `text-text-secondary` | File metadata, "Edited 2m ago" |

Every page should have one clear focal point. If everything is bold or large, nothing stands out.

```tsx
{/* CORRECT — clear hierarchy */}
<div className="mb-xl">
  <h1 className="text-title text-text-primary">Profile</h1>           {/* Primary */}
  <p className="text-label-sm text-text-secondary mt-xs">Manage your account</p>  {/* Tertiary */}
</div>
<div className="bg-surface-bg rounded-corner-lg p-xl">
  <h2 className="text-label text-text-primary font-semibold mb-lg">Personal Info</h2>  {/* Secondary */}
  <div className="flex flex-col gap-lg">
    <InputField label="Name" />
    <InputField label="Email" />
  </div>
</div>

{/* WRONG — flat hierarchy, everything same weight */}
<h1 className="text-label text-text-primary">Profile</h1>
<h2 className="text-label text-text-primary">Personal Info</h2>
<p className="text-label text-text-primary">Manage your account</p>
```

## Region completeness

Every visible region of the page should feel intentional:

- No empty panels without placeholder or empty-state content
- No orphaned headings without body content below them
- No lone buttons without context (label or surrounding content)
- Sidebars should have content that fills them purposefully — not a single link in a full-height panel

### Empty states

When a content area has no data, show a centered empty state with:
- An icon (from lucide-react, `size={32}`, `text-text-tertiary`)
- A heading (`text-label`, `text-text-primary`)
- A description (`text-label-sm`, `text-text-secondary`)
- Optional action button

```tsx
<div className="flex flex-col items-center justify-center py-2xl text-center">
  <Film size={32} className="text-text-tertiary mb-lg" />
  <p className="text-label text-text-primary mb-xs">No videos yet</p>
  <p className="text-label-sm text-text-secondary mb-xl">Upload your first video to get started</p>
  <Button variant="primary" iconStart={<Plus size={16} />}>Upload Video</Button>
</div>
```

## Information hierarchy depth

Use at least 2–3 levels of typographic hierarchy on any page with substantial content:

| Page element | Type class | Role |
|---|---|---|
| Page title | `text-title` | Primary — one per page |
| Section heading | `text-heading` or `text-label font-semibold` | Secondary — one per card/section |
| Description | `text-label-sm` | Tertiary — supporting context |
| Body/input text | `text-input` or `text-label` | Content — form values, body text |
| Metadata | `text-video-title` | Quaternary — timestamps, file info |

Never jump directly from a page title to body text without intermediate section headings. Headings create scannable structure.

```
CORRECT hierarchy:
  Page Title (text-title)
    → Section Heading (text-label font-semibold)
      → Fields and content (text-input)
      → Description (text-label-sm)

WRONG — flat, no intermediate headings:
  Page Title (text-title)
    → Fields and content (text-input)
    → More fields (text-input)
    → More fields (text-input)
```

## Reducing importance

When de-emphasizing content, prefer reducing through scale (smaller type class) rather than opacity (lighter color):

```tsx
{/* PREFERRED — reduce via scale */}
<span className="text-video-title text-text-primary">Edited 2m ago</span>

{/* ACCEPTABLE — reduce via color */}
<span className="text-label-sm text-text-secondary">Edited 2m ago</span>

{/* AVOID — reduce via both (too invisible) */}
<span className="text-video-title text-text-tertiary">Edited 2m ago</span>
```

## Rules

- Every page has one clear focal point — the page title at `text-title`
- Use 2–3 levels of typographic hierarchy — never flat text at one size
- Section headings go inside their card, not floating between cards
- Empty regions must have empty-state content — no blank panels
- Reduce importance through scale first, color second — not both
- `brand-primary` draws the eye — use it only for primary actions and active indicators, not decorative emphasis
