# Research studio design system

The site presents applied AI work, research and teaching as parts of one personal practice. The visual direction is a research studio: warm neutral surfaces, rounded typography, clear diagrams and quiet blue accents. The homepage, work pages, collections and articles share this system.

This document replaces the earlier material-only glass treatment. Typography, spacing, surfaces and component shapes are designed together. The filename is retained for existing documentation links.

## Color and material

| Role | Light mode | Dark mode | Use |
| --- | --- | --- | --- |
| Page background | Warm neutral | Graphite | Continuous background across routes. |
| Reading surface | Dense warm neutral | Dense graphite | Articles, equations, tables, code and figures. |
| Navigation and card surface | High-opacity frosted neutral | High-opacity frosted graphite | Header, menus, reading rails and collection cards. |
| Primary text | Near-black | Warm near-white | Headings, prose and control labels. |
| Secondary text | Muted neutral | Muted light neutral | Descriptions and supporting labels. |
| Accent | Restrained blue | Lighter blue | Links, current items, focus and diagram emphasis. |
| Ambient wash | Faint blue tint | Faint blue tint | A broad background cue that stays behind content. |

Use the existing semantic color tokens (`--paper`, `--paper-strong`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-ink` and `--code`) for content. All tokens, component rules, page geometry and responsive fallbacks live together in `src/styles/global.css`. There is no second material stylesheet overriding an earlier design. `--surface-*` tokens describe the 94% frosted fills, opaque fallbacks, borders, highlights, shadows and blur; `--action` and `--action-ink` define primary controls.

The frosted fill is deliberately dense. A fine border and restrained shadow define a panel; backdrop blur adds material depth where useful. Prose, mathematical notation and diagrams remain on unblurred reading surfaces. The background wash must stay subtle enough that it does not become the strongest element on a page.

Featured cards use an accent border within the same matte material. The solid accent fill is reserved for primary actions.

## Typography

| Role | Treatment |
| --- | --- |
| Display and section headings | System rounded sans, starting with `ui-rounded` and falling back to the system sans stack. Moderate weight and line-height around 1.08–1.16. |
| Body and reading text | System sans, 17px reading size and 1.75 line-height; 16px on small screens. Keep readable line lengths and room between paragraphs. |
| Navigation, buttons and descriptive labels | Sans, with explicit size and weight hierarchy. |
| Numbers and code | Monospace for indices, counts, code and other genuinely numeric or code content. |
| Equations | Preserve the math renderer's typography and allow local scrolling when needed. |

Headings should fit naturally over several lines. Size and spacing communicate hierarchy without compressed line boxes or tight tracking that makes letters collide. The rounded display stack works for English and Russian; a fallback remains part of the design rather than requiring a downloaded font.

Ordinary labels, dates written as prose, navigation and descriptions use sans. Monospace distinguishes numbers and code instead of becoming the default style for every small piece of text.

## Shape, spacing and density

Use four shared radius roles:

| Role | Radius | Examples |
| --- | --- | --- |
| Small | 12px | Compact list items, equations, code and small diagram nodes. |
| Panel | 20px | Navigation panels, cards, callouts, figures and pagination. |
| Feature | 28px | Course and collection surfaces. |
| Control | 999px | Pill buttons, tags and compact rounded controls. |

Cards are separate surfaces with visible gaps and consistent internal padding. Collections, project rows, case details and syllabus items follow the same shape language. Long reading pages keep a continuous reading column, with panels used for navigation and distinct supporting content.

Buttons use a compact pill form with a 48px target height, content-sized width, and room for a label and optional arrow. Primary, secondary and text actions have a clear hierarchy. A group wraps into sensible rows on small screens rather than imposing wide rectangular buttons.

Lists and course rows should feel related to cards without adding a large panel around every sentence. Callouts, code blocks, figures and previous/next links use consistent rounded boundaries and spacing. Figure captions remain connected to their diagrams, and mathematical content keeps its full available width.

## Shared components and patterns

| Pattern | Design and behavior |
| --- | --- |
| Header and mobile menu | Floating matte navigation panel. Keep clear active states, visible focus and usable menu spacing. |
| Selected-work and course cards | Separate rounded surfaces with a balanced title, description and action. Featured cards use an accent border. |
| Project and syllabus lists | Rounded rows, consistent gaps, and a clear distinction between navigable and planned items. |
| Article navigation | Course rail and table of contents share the navigation material. Long rails scroll independently; anchor targets clear the sticky header. |
| Reading components | Unblurred prose and mathematics, rounded callouts and figures, and matching previous/next panels. |
| Systems chain | One reusable component for the existing AI transformation sequence on the homepage and work page. |

### Systems chain

`SystemsChain.astro` organizes the existing ten steps into three named groups while retaining their order:

| Group | Steps |
| --- | --- |
| Foundation | Paper → Digitalization → Decision history → Business rules |
| Delivery | Dataset → ML → MLOps → Infrastructure |
| Agency | LLM → Agents |

Sequential arrows show progression within and between groups. Each group has the same panel structure, with numbers providing orientation. Below 700px, groups and their steps become a vertical sequence. Arrows follow that reading order without crossing labels. This is a visual organization of the existing content, not a new claim about project maturity or results.

## States and accessible behavior

Hover changes a surface fill or border gently. Current navigation receives a clear accent cue. Keyboard focus uses a visible outline that remains distinguishable on neutral and accent surfaces. Avoid layout movement or animated blur when an element becomes active.

Use native links, buttons and disclosure elements for their existing interactions. Decorative arrows do not replace the underlying labels or reading order. The systems chain is readable as an ordered sequence without its visual connectors.

Opaque surfaces provide the baseline. Browsers that support backdrop filtering may enable the frosted treatment. Reduced-transparency preferences use the opaque surfaces; reduced-motion preferences remove unnecessary transitions. Forced-color mode keeps visible system-colored boundaries and focus treatment. No external visual assets are required for the material.

## Completed validation

- `npm run build`: 63 Astro files checked, zero errors, warnings or hints; 35 static pages built.
- Browser review covered the homepage, work, projects, notes index, Generative Models overview, VAE and neural-training articles, CV, contact, about, Russian home/work and the 404 page at 1280px and 390px. Reviewed routes had no horizontal page overflow.
- The light palette was also reviewed from a temporary local copy of the production build with only its dark-mode media rules disabled. The main preview was reviewed in the available dark and light appearances. No theme override or fixture is shipped.
- At 600px, 900px and 1280px, Systems labels fit their panels and header content stays within its surface. At 390px the chain follows a vertical sequence. Section targets clear the sticky header, including their metadata.
- Primary and secondary hero buttons measure 48px high. The mobile menu opens with Enter, shows a visible focus outline and navigates successfully. Course contents expand, identify the current article and navigate to another note.
- Reading rails are height-bounded and scrollable: at a 720px viewport, the 586px course rail scrolls through its 650px content to expose the final entry. Wide mobile equations scroll locally while the page remains 390px wide; tables use the same containment.
- Reviewed VAE and neural-training SVG labels stay within their diagrams. Prose and figures have no backdrop filter. Existing diagram geometry and mathematical font roles are preserved.
- Independent source review covered responsive rules, selector coverage, opaque fallback, reduced transparency, reduced motion and forced colors. These preference fallbacks were source-reviewed, not browser-emulated.

Conservative token calculations over black/white backdrops give muted material-text contrast of at least 4.81:1 light and 5.43:1 dark. Accent material text is at least 5.06:1 and 6.31:1; primary action labels are 6.00:1 and 8.99:1. The current navigation tint is tighter (4.55:1 light, 5.25:1 dark), so its accent text override must remain. These calculations and browser checks are not a full accessibility audit.
