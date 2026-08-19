# Alignment

## Text alignment

- Body text, labels, and descriptions: always left-aligned
- Headings: left-aligned — never center headings in content areas
- Numbers in tables or data displays: right-aligned
- Center alignment is only for empty states and hero sections

Do not mix alignment within the same content region.

```tsx
{/* CORRECT — left-aligned content */}
<div className="bg-surface-bg rounded-corner-lg p-xl">
  <h2 className="text-label text-text-primary font-semibold mb-lg">Personal Information</h2>
  <div className="flex flex-col gap-lg">
    <InputField label="Full Name" />
    <InputField label="Email" />
  </div>
</div>

{/* WRONG — centered heading in a form card */}
<div className="bg-surface-bg rounded-corner-lg p-xl text-center">
  <h2 className="text-label text-text-primary font-semibold mb-lg">Personal Information</h2>
</div>
```

## Button heights

All buttons in the same row must have the same height:

- Do not mix `size="medium"` and `size="small"` buttons in the same group or row
- If a button sits next to an input, both should use the same size variant
- Icon buttons should match the height of adjacent text buttons

```tsx
{/* CORRECT — same size buttons */}
<ButtonGroup align="end">
  <Button variant="neutral" size="medium">Cancel</Button>
  <Button variant="primary" size="medium">Save</Button>
</ButtonGroup>

{/* WRONG — mixed sizes */}
<ButtonGroup align="end">
  <Button variant="neutral" size="small">Cancel</Button>
  <Button variant="primary" size="medium">Save</Button>
</ButtonGroup>
```

## Side-by-side field alignment

When placing fields side by side, use `flex` with equal `flex-1` children so fields have equal width:

```tsx
{/* CORRECT — equal-width fields */}
<div className="flex gap-xl">
  <div className="flex-1">
    <InputField label="First Name" />
  </div>
  <div className="flex-1">
    <InputField label="Last Name" />
  </div>
</div>

{/* WRONG — unequal widths */}
<div className="flex gap-xl">
  <InputField label="First Name" />
  <InputField label="Last Name" />
</div>
```

## Grid alignment

When using grids for content cards or items:

- All columns should align to the same grid
- Cards in a row must have equal height (grid handles this by default)
- Use consistent gap tokens — same spacing for all gutters

```tsx
{/* CORRECT — uniform grid */}
<div className="grid grid-cols-4 gap-xl">
  <ItemCard title="Video 1" duration="0:01:30" />
  <ItemCard title="Video 2" duration="0:02:15" />
  <ItemCard title="Video 3" duration="0:00:45" />
  <ItemCard title="Video 4" duration="0:03:00" />
</div>

{/* WRONG — mixed gaps or arbitrary spacing */}
<div className="flex">
  <ItemCard title="Video 1" className="mr-4" />
  <ItemCard title="Video 2" className="mr-8" />
  <ItemCard title="Video 3" />
</div>
```

## Page header alignment

Page headers sit directly on the `brand-tertiary` canvas, left-aligned, above the card stack:

```tsx
<div className="mb-xl">
  <h1 className="text-title text-text-primary">Page Title</h1>
  <p className="text-label-sm text-text-secondary mt-xs">Page description text</p>
</div>
```

- Title and description are left-aligned, stacked vertically
- `mt-xs` (4px) between title and description
- `mb-xl` (16px) below the header before the card stack

## Rules

- All text is left-aligned unless explicitly in an empty state or hero section
- All buttons in a row use the same size variant
- Side-by-side fields use `flex gap-xl` with `flex-1` wrappers for equal width
- Grids use consistent `gap-xl` or `gap-2xl` — never mix gap values or use arbitrary margins
- All repeated elements in a grid or list must be visually identical in size and spacing
