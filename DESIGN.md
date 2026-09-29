# Ventro design system

Calm, dense, professional. The product helps people under time and money
pressure feel in control. Reference the restraint of Linear and Notion.

## Hard rules

- No gradients anywhere. Flat fills only.
- No shadows except dropdowns, modals and sheets.
- Corner radius max 8px (`rounded-lg`), except avatars and pills.
- Font weights: 400 and 500 for body, 600 for emphasis. Never 700.
- One primary (accent-filled) button per screen.
- Every interactive element needs a visible keyboard focus state:
  `focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none`
- Neutrals carry ~90% of every screen. If a screen looks colourful, it is wrong.

## Typography

Inter, loaded via @fontsource-variable/inter.

| Role | Size | Weight | Tailwind |
|---|---|---|---|
| Page title | 24px | 600 | `text-2xl font-semibold tracking-tight` |
| Section heading | 18px | 600 | `text-lg font-semibold` |
| Card title | 15px | 600 | `text-[15px] font-semibold` |
| Body | 14px | 400 | inherited from body |
| Label | 13px | 500 | `text-[13px] font-medium` |
| Caption / meta | 12px | 400 | `text-xs text-muted-foreground` |
| Section label | 11px | 600 | `text-[11px] font-semibold uppercase tracking-[0.04em]` |

Base: body is 14px with line-height 1.6.
All numbers use `tabular-nums`.
Sentence case everywhere. Uppercase only for 11px section labels.

## Spacing — 4px base unit

| Thing | Value | Tailwind |
|---|---|---|
| Card padding | 20px | `p-5` |
| Between cards | 16px | `gap-4` |
| Between sections | 32px | `mt-8` |
| Page gutter | 32px desktop / 16px mobile | `px-8` / `px-4` |
| Control height | 36px | `h-9` |
| Table row height | 44px | `h-11` |
| Sidebar width | 240px | `w-60` |
| Content max width | 1200px | `max-w-[1200px]` |

## Colour tokens

Defined in src/index.css. Never use raw hex in components.

Surfaces: `bg-background` (page), `bg-card` (cards, sidebar),
`bg-muted` (subtle fills)
Text: `text-foreground` (primary), `text-foreground-soft` (secondary),
`text-muted-foreground` (captions)
Borders: `border` (default), `border-border-strong` (emphasis)
Accent: `bg-primary` / `text-primary` — primary actions, active nav,
focus rings and links ONLY
Status: success / warning / destructive — only ever carry meaning,
never decoration

### Badge rule

Every badge and tinted row is `bg-{tone}-tint text-{tone}-strong`.
Tint background, strong text. Never solid status colour behind text.

Available: `primary-tint`/`primary-strong`, `success-tint`/`success-strong`,
`warning-tint`/`warning-strong`, `destructive-tint`/`destructive-strong`

## Responsive

Mobile-first. Default styles target phones; `sm:` `md:` `lg:` add up
from there. Layout switches at `md` (768px). Minimum tap target 44px.
Inputs must be 16px on mobile to stop iOS zooming.

## Motion

150ms for hover and colour changes. 200ms for panels and modals.
Skeletons pulse, never shimmer. No page transition animations.
No parallax. No spring or bounce easing.