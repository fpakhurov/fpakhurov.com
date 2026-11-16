# 320px overflow: source-only diagnosis

Reviewer: Codex gan_author, 2026-11-16. No source edits, browser, build or Actions run.

The strongest common cause is the bottom note-pagination grid. `src/styles/global.css:554` defines two `1fr` tracks with a 1rem gap. Its links have 1rem padding and flex-column content; neither the grid items nor their titles have `min-width: 0` / `overflow-wrap`. No narrow-screen override exists. `src/layouts/NoteLayout.astro:143` supplies the adjacent published note's complete title in each card.

At 320px the article is 284px wide (`.docs-shell` uses viewport minus 36px). Two equal nominal tracks leave 134px per card, approximately 102px for text after padding, while `1fr`'s automatic minimum respects the unbreakable word widths. Two long Russian adjacent titles can therefore increase the grid's intrinsic minimum beyond the available column. The same problem need not occur with the shorter English words or at 390px, where 70px more is available.

The adjacency pattern matches the recorded failures:

| Current RU route | Previous title | Next title | 320px result |
|---|---|---|---|
| efficient-transformers | Данные для предобучения больших языковых моделей | Перенос обучения в NLP | overflow |
| transfer-learning | Эффективные трансформеры: FlashAttention и смесь экспертов | Эмбеддинги и семантический поиск | overflow |
| functions-of-random-variables | Непрерывные распределения | Математическое ожидание и дисперсия | overflow |
| joint-distributions | Математическое ожидание и дисперсия | Многомерное нормальное распределение | overflow |
| multivariate-gaussian | Совместные распределения и независимость | Условное математическое ожидание | overflow |
| conditional-expectation | Многомерное нормальное распределение | Неравенства и концентрация | overflow |
| inequalities-and-concentration | Условное математическое ожидание | Закон больших чисел | pass |
| continuous-distributions | Дискретные распределения | Функции от случайных величин | pass |

The artifact records no escaped header text, and the 320px heading crops for functions and inequalities visibly agree. `pageOverflow` currently measures the entire document while its attached text walker inspects only `.note-header`, so it cannot identify an overflowing footer/card. The result label is broader than the available diagnostic detail.

Other inspected shared constraints do not explain the route pattern as directly: `.note-article` and `.fig-body` already have `min-width:0`; figures use 100%-width SVGs and mostly `minmax(0,1fr)` inner grids; prose tables/pre/display math have internal horizontal overflow. The longest body heading in the passing continuous note is no shorter than several failing notes. SVG labels can still overflow a viewBox because the global SVG rule uses `overflow:visible`; source inspection cannot prove there is no secondary offender.

Recommended bounded repair for coordinator review: make note-pagination tracks `repeat(2,minmax(0,1fr))`; add `min-width:0` to its cards and wrap long titles, then stack its tracks into `minmax(0,1fr)` at the existing phone breakpoint. This keeps narrow phone cards useful without relying on arbitrary word breaks in two tiny columns. Do not hide overflow globally.

For the next existing browser job, record `documentElement.scrollWidth` plus bounds of `.note-pagination` and each card. A bounded offender list should include elements whose right/left bounds escape the viewport, excluding expected descendants clipped inside table/pre/math scroll containers. Run the same 320/390/1440 route matrix after the common CSS change. The present diagnosis is high-confidence source inference, not browser-measured proof of the exact overflowing element or validation of the proposed fix.
