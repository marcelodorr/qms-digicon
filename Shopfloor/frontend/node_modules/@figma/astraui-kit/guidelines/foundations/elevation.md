# Elevation Tokens

Astra is a **surface-layered, minimal** design system. Shadows are reserved for floating overlays only — main surfaces use background color contrast for definition, not box-shadow.

## Shadow usage

| Level | Usage | Where |
|---|---|---|
| None | **~95% of elements** | Cards, panels, nav, inputs, buttons — default state |
| Subtle | Floating overlays | Toolbar (`0px 0px 12.1px 0px rgba(0,0,0,0.1)`) |
| Scrim | Modal backdrop | `bg-modal-scrim` (`rgba(0,0,0,0.75)`) — handled by Modal component |

Most elements use **no shadow**. Visual hierarchy comes from surface color contrast (`surface-bg` cards on `brand-tertiary` canvas), not elevation.

## Decision tree

```
┌─ "Should I add a shadow?"
│
├─ Card or panel on the page canvas?
│  └─ No shadow — bg-surface-bg on bg-brand-tertiary provides contrast
│
├─ Sidebar or secondary navigation?
│  └─ No shadow — border-r border-border-primary defines the edge
│
├─ Button or input?
│  └─ No shadow — borders and background color handle states
│
├─ Floating toolbar?
│  └─ Yes — subtle shadow (built into Toolbar component)
│
├─ Modal or dialog?
│  └─ Yes — scrim backdrop (built into Modal component)
│
├─ Tooltip?
│  └─ No shadow — bg-surface-dark provides contrast
│
└─ Dropdown or popover?
   └─ Subtle shadow + border-border-primary is acceptable
```

## Rules

- Default to no shadow — Astra uses surface color contrast, not elevation
- Only use shadows for floating overlays (toolbar, modal, dropdown)
- Do not add shadows to cards, panels, or navigation — they don't need them
- Do not create custom `box-shadow` values — use component defaults
- Always pair shadows with a background color — shadows on transparent surfaces look broken

```tsx
{/* CORRECT — card uses surface color, no shadow */}
<div className="bg-surface-bg rounded-corner-lg p-xl">
  <InputField label="Name" />
</div>

{/* WRONG — unnecessary shadow on a card */}
<div className="bg-surface-bg rounded-corner-lg p-xl shadow-lg">
  <InputField label="Name" />
</div>

{/* CORRECT — Toolbar has shadow built in */}
<Toolbar>
  <ToolbarItem icon={<Scissors size={24} />} />
</Toolbar>

{/* CORRECT — Modal handles its own scrim and elevation */}
<Modal isOpen={open} onClose={close} title="Export">
  <p>Content</p>
</Modal>
```
