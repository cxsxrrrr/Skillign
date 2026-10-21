---
name: neobrutalist-css-ui
description: Build web UI in a specific neobrutalist visual language using plain CSS (no Tailwind, no Bootstrap, no UI kits) - black 2px borders, hard offset shadows with zero blur, white/off-white surfaces, solid black buttons, monospace book cards, split-screen auth pages with a gradient orb, and a white navbar with a black user block. Use this skill whenever the user asks for a login, sign-up, forgot-password / OTP screen, a catalog or "explore" page with horizontal shelves of cards, a navbar, forms, inputs or buttons in a brutalist, neobrutalist, "hard shadow", "black border" or "Figma-exact" style, or whenever they want pixel-faithful vanilla CSS for this design system, even if they never say "neobrutalism". Also use it to extend the system with new components that must look native to it. Prefer this skill over generic frontend-design for anything in this style.
---

# Neobrutalist CSS UI

A narrow, opinionated design system translated from the user's Figma. The goal is
**fidelity**: output must look like it came from the same designer as the reference
screens (login, forgot password, explore/catalog), not like a generic "brutalist" theme.

Plain CSS only. Custom properties for tokens, BEM classes prefixed `nb-`. No Tailwind,
no utility-class frameworks, no CSS-in-JS, no preprocessors unless the user asks.
Why: the user wants very precise control of every shadow offset and border; utility
frameworks hide those values behind abstractions and drift from the Figma.

## Files in this skill

| File | Use it for |
|---|---|
| `assets/tokens.css` | All colors, shadows, radii, fonts, spacing. Always load first. |
| `assets/neobrutalist.css` | Ready components (buttons, fields, navbar, cards, auth layout). |
| `assets/template-login.html` | Login with providers, dark showcase panel. |
| `assets/template-forgot-password.html` | Email + OTP request, light showcase panel. |
| `assets/template-explore.html` | Navbar + title badge + horizontal book shelves. |
| `references/components.md` | Exact anatomy, states and recipes per component. Read when building or modifying a component. |
| `references/extending.md` | How to design NEW components in this language (checklist + examples). Read when the user asks for something not already covered. |

## Workflow

1. **Start from the assets.** Copy `tokens.css` and `neobrutalist.css` into the project
   (keep the filenames) and start the page from the closest `template-*.html`.
   Reusing the shipped classes keeps every project visually identical.
2. **Never hardcode a color, shadow, radius or font** that has a token. If a value is
   missing, add a token to `tokens.css` first, then use it.
3. **Customize through tokens, not overrides.** To change the card size set
   `--nb-card-w`; to change shadow depth set `--nb-shadow-x/y`. Avoid `!important`.
4. **If the user shares a new Figma screenshot**, map every element to an existing
   component first, note what is genuinely new, and build only that using
   `references/extending.md`.
5. **Verify before delivering**: run the checklist at the bottom.

## The visual DNA (what makes it *this* style)

1. **Hard shadows, zero blur.** `box-shadow: 4px 4px 0 0 #000`. Direction is always
   bottom-right. The only soft shadow in the whole system is under the navbar.
2. **Black is structural.** Borders, shadows, primary buttons, the user block and the
   dark auth panel are pure `#000`. There is no brand color; the single accent
   (`--nb-focus`) exists only for keyboard focus rings.
3. **Monochrome surfaces.** White cards, `#fafafa` neutral panels, `#f4f8ff` cool-tinted
   panels. Color comes from content (book covers, provider logos), not from chrome.
4. **Three type voices.**
   - Inter: UI chrome (nav, buttons, section titles). Bold/800 for emphasis.
   - Montserrat: auth headings and subtitles, large and tightly tracked.
   - Space Mono (monospace): card text only. It gives the catalog its "index card" feel.
5. **Square-ish geometry.** Inputs/buttons use 8px radius, cards 2px (nearly square),
   checkbox 4px, only avatars, dots and the orb are fully round.
6. **Physical interaction.** Hover lifts (translate up-left, shadow grows); active
   presses (translate down-right, shadow collapses). Cards scale up on hover.
7. **Outline icons.** 1.75px stroke, `currentColor`, rounded caps (Lucide style). Never
   filled icons, never emoji as UI icons.
8. **Split-screen auth.** 50/50 grid inside a 24px-radius frame: form panel left,
   showcase right (orb + caption + carousel dots). Light and dark variants exist.

## Quick token reference

| Token | Value | Notes |
|---|---|---|
| `--nb-ink` | `#000` | borders, shadows, solid buttons |
| `--nb-bg` / `--nb-bg-tint` | `#fafafa` / `#f4f8ff` | form panels (neutral / cool) |
| `--nb-border` | `2px solid #000` | every bordered element |
| `--nb-shadow` | `4px 4px 0 0 #000` | cards |
| `--nb-shadow-input` | `2px 4px 0 0 #000` | fields (heavier at the bottom) |
| `--nb-shadow-double` | white + black stacked outline | outline buttons |
| `--nb-radius-sm` | `8px` | inputs, buttons |
| `--nb-font-ui / display / mono` | Inter / Montserrat / Space Mono | see above |

## Responsive & accessibility rules (non-negotiable)

- Figma frames show tiny text (~6-8px in cards). In code the floor is `--nb-fs-xs`
  (11px); do not go below. Body and inputs stay at 16px so iOS does not zoom on focus.
- Under 56rem the auth layout collapses to one column and hides the showcase panel;
  the navbar hides its links (add a menu button using `.nb-btn--outline` if needed).
- Every interactive element keeps the focus ring from the base layer
  (`3px solid var(--nb-focus)`, 3px offset). Never `outline: none` without a replacement.
- Placeholder color (`--nb-text-faint`) is decorative; always provide a real `<label>`
  or `.nb-sr-only` text.
- Honor `prefers-reduced-motion` (already wired via `--nb-dur`).
- Cards are links (`<a>`) or buttons, never clickable `<div>`s.

## Don'ts

- No gradients, except the auth orb. No blurred or colored shadows (error state uses a
  hard red shadow, still zero blur).
- No rounded-pill buttons, no glassmorphism, no pastel brand palette, no drop-shadow filter.
- No border widths other than `--nb-border-w` (2px); the page title badge is the one 1px exception.
- Don't import Tailwind/Bootstrap, and don't write utility classes like `.mt-4`. If a
  spacing helper is needed, use the `--nb-s-*` scale inside a named component class.
- Don't center-align body text; only card text, captions and the footer line are centered.

## Pre-delivery checklist

- [ ] Only `nb-` classes and tokens; no hardcoded hex outside `tokens.css`
- [ ] Every bordered surface has a hard shadow or is intentionally flat (solid buttons)
- [ ] Hover, active and focus-visible states exist for every interactive element
- [ ] Fonts loaded via `<link>` (Inter, Montserrat, Space Mono) with fallbacks defined
- [ ] Shelf padding leaves room for shadow + hover scale (no clipped shadows)
- [ ] Mobile (<56rem) checked: auth is single column, shelves scroll horizontally
- [ ] Provider logos (Google/Microsoft) use the official SVGs, not the placeholders
