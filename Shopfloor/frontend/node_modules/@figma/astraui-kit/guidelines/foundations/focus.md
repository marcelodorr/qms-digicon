# Focus Styles

## Focus ring pattern

All interactive elements must have a visible focus indicator for keyboard navigation. Astra uses a consistent focus-visible pattern:

```css
.interactive:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

In Tailwind:
```tsx
<button className="focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2">
  Custom button
</button>
```

## Rules

- Always use `focus-visible`, not `focus` — the ring only appears for keyboard navigation, not mouse clicks
- Use `brand-primary` for the outline color — it provides consistent brand identity on focus
- Use 2px outline width with 2px offset as the standard pattern
- Do not use `box-shadow` for focus indicators — use `outline`
- Do not remove focus styles — if the default is ugly, replace it with the pattern above, never set `outline: none` without a replacement

## Focus on colored backgrounds

On `brand-primary` or dark surfaces, the standard brand-colored focus ring may not have sufficient contrast. Use white instead:

```tsx
{/* On brand background — use white focus ring */}
<div className="bg-brand-primary">
  <button className="focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2">
    Action
  </button>
</div>
```

## Components with built-in focus

Design system components handle their own focus styles. Do not override focus behavior on these components:

- **Button** — all variants
- **InputField**, **TextareaField**, **SelectField** — input focus states
- **Checkbox**, **RadioGroup**, **SwitchField** — selection controls
- **SidebarButton**, **SecondaryNavItem** — navigation items
- **Tabs** — tab focus and keyboard navigation
- **ToolbarItem** — toolbar button focus
- **Modal** — focus trap and Escape key handling

## Custom interactive elements

If you create custom interactive elements (clickable divs, custom controls), you must implement focus styles manually:

```tsx
{/* Custom clickable element — must add focus styles */}
<div
  role="button"
  tabIndex={0}
  className="bg-surface-bg rounded-corner-lg p-xl cursor-pointer
             focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2"
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Custom card
</div>
```

Rules for custom interactive elements:
- Add `tabIndex={0}` to make it focusable
- Add `role="button"` (or appropriate ARIA role)
- Handle `Enter` and `Space` key events for activation
- Apply the standard focus-visible pattern
