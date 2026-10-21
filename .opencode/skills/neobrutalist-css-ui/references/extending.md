# Extending the system

Use this when the request needs a component that does not exist yet (modal, toast,
select, tabs, table, badge, pagination, tooltip, sidebar, tier-list board…).

## Recipe: any new surface

1. **Border**: `border: var(--nb-border)`.
2. **Hard shadow**: `box-shadow: var(--nb-shadow)` (cards/panels) or `--nb-shadow-input` (form controls).
3. **Radius**: pick from tokens. Containers that hold content like cards: `--nb-radius-card`. Interactive controls: `--nb-radius-sm`.
4. **Surface**: `--nb-paper` (default), `--nb-bg`/`--nb-bg-tint` for panels, `--nb-ink` for emphasis.
5. **Type**: chrome in Inter, headings of focused flows in Montserrat, content snippets in mono.
6. **States**: hover = `translate(-2px,-2px)` + bigger shadow; active = `translate(2px,2px)` + no shadow; focus-visible inherits the base ring; disabled = 45% opacity, no shadow.
7. **Transition**: `transform` and `box-shadow` only, `var(--nb-dur) var(--nb-ease)`.

## Worked examples (build in the same language)

**Badge / tag**: inline-flex, `padding: 2px 10px`, `border: 2px solid`, `border-radius: 4px`, `font: 700 12px Inter`, `box-shadow: 2px 2px 0 #000`, uppercase. Inverted variant: black face, white text, no shadow.

**Modal**: backdrop `rgba(0,0,0,.55)` (flat, no blur). Dialog = white, 2px border, `--nb-shadow-lg`, radius 8px, Montserrat 800 title, actions row with one `--solid` and one `--outline` button.

**Toast**: white, 2px border, `--nb-shadow`, left 6px solid black stripe for neutral; stripe `--nb-success` or `--nb-danger` for state. Slides in with `translate`, never fades with blur.

**Tabs**: row of Inter 700 text. Active tab gets the navbar underline treatment (3px, offset 6px). No pill backgrounds.

**Table**: 2px outer border + `--nb-shadow`, header row black with white text, rows separated by 1px black lines, hover row `--nb-bg`. Numbers in mono.

**Select / dropdown**: trigger identical to `.nb-field__input`; menu = card surface with `--nb-shadow-lg`, options 44px high, hover = black face + white text.

**Tier-list board** (the nav mentions "Make your own tierlist"): rows with a 2px border; tier label cell is a solid colored block (the one place a saturated color is allowed, one hue per tier S/A/B/C/D with black text); books inside are small `.nb-card` variants without description, dragged items lift with `--nb-shadow-lg`.

## When a request conflicts with the DNA

If the user asks for gradients, blur, pill buttons or a colorful palette in a screen of
this system, build it but keep structure (borders, hard shadows, type voices) and say
which part departs from the base style, so they can decide whether it belongs in the
design system.

## Adding to the system

New component CSS goes in a new numbered section at the end of `neobrutalist.css`
(before Utilities) with its own `nb-` BEM block. New values go to `tokens.css` first.
Document the component in `components.md` with anatomy, sizes and states.
