# Matte glass material

The site's editorial layout keeps its warm paper palette, serif headings, blue accents and existing grids. Matte glass adds a quiet surface to navigation and collection cards. It is implemented in `src/styles/matte-glass.css`, loaded after the base styles.

## Surfaces

| Surface | Treatment |
| --- | --- |
| Site header | Floating sticky panel, frosted fill, 16px corners and a soft edge highlight. |
| Mobile menus, course navigation and table of contents | Same material; the course rails scroll independently when they exceed the available height. |
| Course cards and the selected-work grid | Tinted fill, restrained shadow and fine border. Existing blue/ink feature panels retain their solid colors. |
| Buttons | Smaller 8px corners; the primary action retains its ink fill. |
| Article text, equations, tables and figures | Original paper treatment, without backdrop blur. |

`--glass-fill`, `--glass-solid`, `--glass-line`, `--glass-light`, `--glass-wash`, `--glass-shadow`, `--glass-menu-shadow`, `--glass-radius` and `--glass-blur` define the material. The fill is deliberately dense (95% in light mode, 92% in dark mode), keeping small navigation labels readable over changing page content. Dark-mode tokens follow the existing system color preference. The mobile blur drops from 18px to 12px. Blur is static; hover changes fill and border, without moving the layout or animating filters.

The shared `--header-height`, `--header-top` and `--header-offset` tokens coordinate the sticky header, scroll padding and sticky reading rails. New anchor links remain visible below navigation. The header material lives on a pointer-transparent pseudo-element. This lets the native mobile menu blur the page independently instead of inheriting a restricted backdrop root. The header does not clip that menu.

## States and fallback

Hover deepens the neutral fill; the current course link receives a faint accent tint. Keyboard focus has a visible accent outline. Native links and disclosure elements keep their existing roles and keyboard behavior.

The base material has an opaque fallback. Supporting browsers enable translucent fill and backdrop filtering with `@supports`. Reduced-transparency preferences restore opaque surfaces and remove filters; reduced-motion preferences remove transitions. Forced-color mode uses system canvas colors and removes material shadows. No JavaScript or external visual assets are needed.

CSS behavior references: [backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) and [prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency).

## Validation

`npm run build` passes with zero errors, warnings or hints (62 Astro files, 35 pages). Browser review covered the home page, selected-work cards, notes collection and reading layout at desktop and 390px widths in the available light/dark views. Sticky section targets clear the header, long course rails scroll to the final entry, mobile menus open and navigate, and the reviewed pages have no horizontal overflow. Prose and figures have no backdrop filter. The 95%/92% fill values give conservative token-based contrast bounds above 4.5:1 for muted text over black/white backdrops; this is not a full accessibility audit.
