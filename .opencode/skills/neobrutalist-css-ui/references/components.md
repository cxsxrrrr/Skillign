# Component reference

Contents: Buttons · Fields · Checkbox & divider · Navbar · Title badge · Book card & shelf ·
Auth layout · Showcase (orb + dots)

All measurements come from the Figma at 1x; rem values assume 16px root.

## Buttons

| Variant | Class | Face | Shadow | Use |
|---|---|---|---|---|
| Solid | `nb-btn nb-btn--solid` | `#000`, white text | none at rest | Primary CTA (LOG IN, GET OTP). Uppercase when `--block`. |
| Outline | `nb-btn nb-btn--outline` | white, black text | stacked double outline | Secondary / providers (Google, Microsoft). |

- Height 52px (`--nb-field-h`), radius 8px, Inter 700 (outline uses Montserrat 500).
- Hover: `translate(-2px,-2px)` + stacked outline shadow. Active: `translate(2px,2px)`, no shadow.
- Provider buttons: icon (20px) + label, `gap: 12px`, two per row in `.nb-auth__providers`.

```html
<button class="nb-btn nb-btn--solid nb-btn--block">Log in</button>
<button class="nb-btn nb-btn--outline"><svg class="nb-icon">…</svg>Google</button>
```

## Fields

Anatomy: `label.nb-field` > leading icon (`.nb-field__icon`) + `input.nb-field__input` + optional trailing `button.nb-field__action`.

- Height 52px, left/right padding 48px to clear icons, 2px border, 8px radius, shadow `2px 4px 0 #000`.
- Background: `--nb-field` on neutral panels; add `.nb-field--tint` on tinted panels.
- Icon color: black by default (login); `.nb-field--faint-icon` for the pale lavender icon (forgot-password).
- Focus: lifts 1px and the shadow deepens to `4px 6px 0`, plus the blue focus ring.
- Error: add `.nb-field--error`; border and hard shadow turn `--nb-danger`; message in `.nb-field__error` (13px, 600).
- Password fields: trailing eye-off button toggles `type` between `password` and `text` and swaps the icon (eye / eye-off).

## Checkbox & divider

- `.nb-check` wraps `input.nb-check__box` + text. Box 20px, 2px border, 4px radius; checked state draws a black check via `clip-path`.
- `.nb-divider`: text centered between two 1px black lines, 13px muted. Used as "or continue with email".
- "Remember me" (muted) and "Forgot Password?" (`.nb-link`, bold) share one `.nb-auth__row` (space-between).

## Navbar

Structure: `header.nb-navbar` > brand · `ul.nb-navbar__links` (3 text links + search icon button) · `a.nb-navbar__user`.

- Height 72px, white, sticky, the only soft shadow `0 2px 4px rgba(0,0,0,.25)`.
- Links: Inter 700 / 18px. Hover and `aria-current="page"` show a 3px black underline (offset 6px), not a color change.
- User block: full-height black rectangle at the right edge, bottom corners 8px, white bold username + white circular avatar with outline user icon.
- Brand is a text wordmark (`Logo` placeholder) at 28px/800.

## Page title badge

`h1.nb-title-badge`: centered, white box, 1px border, `3px 3px 0 #000` shadow, uppercase 800/36px. Appears once per page ("EXPLORE").

## Book card & shelf

- `.nb-shelf`: flex row, `gap: 24px`, `overflow-x: auto`, scroll-snap. The extra padding is deliberate: it stops the hard shadow and hover scale from being clipped.
- `a.nb-card`: width `--nb-card-w` (152px), white, 2px border, 2px radius, shadow `4px 4px 0 #000`, content centered, **monospace**.
  - cover: 72% width, aspect 2/3, `object-fit: cover`
  - title: 13px bold
  - description: 11px, clamped to 4 lines
- Hover/focus: `scale(1.08)` + `6px 6px 0` shadow, `z-index: 2`. Active: `scale(1.04)`.
- Section title (`.nb-section__title`) sits above each shelf: "Read the classics", "Sci-Fi", "Because you liked [book]". Spacing between sections 32px.
- Always set meaningful `alt` text on covers.

## Auth layout

`main.nb-auth` is a 2-column grid (1fr 1fr), `min-height: 100vh`, `border-radius: 24px`, `overflow: hidden`. Put `body` background to `#000` so the rounded frame reads like the Figma device edge.

- Left `.nb-auth__form-panel` (`--tint` for login). Content is a vertical grid, max-width 368px, centered.
- Heading: Montserrat 700 / 28px, tight tracking. Subheading: Montserrat 400 muted, pulled up under the heading.
- Footer line: "Don't have account? **Create an account**" centered, 13px.
- Variants:
  - Login: tinted left panel + **dark** showcase.
  - Forgot password: neutral left panel + **light** showcase.
  - Sign-up / OTP verify: choose either; alternate between light/dark across the flow for rhythm, and keep the form panel neutral unless it has provider buttons.

## Showcase (orb + caption + dots)

- `.nb-orb`: circle up to 480px. Light = lavender ring (gradient `#d2d2dd → #f3f3ff`) with a gray radial core inset 6.5%. Dark = near-black radial with a faint navy glow at the top; no ring.
- Caption: `.nb-showcase__title` (Montserrat 700/16px) + `.nb-showcase__text` (13px, 80% opacity).
- Dots: `.nb-dots__dot` 6px circles; the active one (`aria-current="true"`) stretches to a 20px pill. Wire as a carousel indicator; rotate the caption text per slide.
- The orb is a placeholder slot for an illustration; to swap, place an `<img>` inside `.nb-orb` with `border-radius: 50%` and hide `::after`.
