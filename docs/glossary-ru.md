# Russian translation guide and glossary

How the course notes are translated into Russian. The Russian notes live in `src/content/notes-ru/<course>/<slug>.mdx`, with the same file name (and therefore the same id) as the English original, and are served at `/ru/notes/<course>/<slug>`. The English note stays the source of truth: the translation follows its structure exactly.

## Structure

- Same frontmatter fields. Translate `title`, `description`, `section` (use the Russian section label from `src/utils/courses.ts`) and `prerequisites`; keep `course`, `order`, `status` and `tags` unchanged.
- Same imports, same figures in the same places, same headings in the same order.
- Every heading keeps the anchor of the English heading: `## Ковариационная матрица \{#the-covariance-matrix\}`. The braces are escaped because MDX would otherwise read them as a JavaScript expression; `src/plugins/remark-heading-ids.mjs` turns the suffix into the heading id. The id is the slug of the English heading as it appears in the built English page. This keeps links, the course map and the table of contents language-independent.
- Links to other notes point to the Russian URL: `/notes/generative-models/vae#...` becomes `/ru/notes/generative-models/vae#...` with the same anchor. Notes without a translation yet open in English under the Russian URL, so the link is valid either way.
- External links, references, code and notebook links stay as they are.

- Figures are shared between languages. A figure component reads the page language with `pageLang(Astro.url)` and switches its title, caption, `<title>`, `<desc>` and text labels with `ru ? '…' : '…'`; geometry and numbers stay common. Check Russian labels at wide and narrow widths, since Russian text is longer.
- Check each translation with the parity checks: identical display and inline math (except words inside `\text{}`), identical figures in the same order, identical code apart from comments, identical heading ids on the built pages.

## What is not translated

- Mathematics: every `$…$` and `$$…$$` block is copied unchanged, including `\text{…}` inside formulas, unless the text there is an English word that a reader must understand (then translate it inside `\text{}`).
- Code blocks, identifiers in backticks (`MultivariateNormal`, `requires_grad=True`), file names and cell numbers. Code comments may be translated.
- The References list: author names, titles and venues stay in the original language. Short glosses after an entry ("§2.3: the Gaussian distribution…") are translated.
- Names of models, metrics and methods that are used in Russian as they are: VAE, GAN, WGAN, WGAN-GP, SN-GAN, DCGAN, f-GAN, DDPM, DDIM, MADE, MAF, IAF, NICE, RealNVP, Glow, ELBO, FID, IS (Inception Score), LPIPS, Inception, ImageNet, Adam, ReLU, BatchNorm (the method; in prose «батч-нормализация»).

## Style

- Neutral scientific register, first person plural («мы получаем», «рассмотрим»), as in the English notes. No «вы».
- Russian typography: «ёлочки» for quotes, an em dash with spaces — between clauses, the letter «ё» where it is pronounced.
- Decimal numbers keep the decimal point (0.5, 1.225), so that prose, formulas, figures and code use one notation. Percentages: «39 %» is not needed, write «39%».
- Keep sentences short and declarative, like the original. Do not add or drop content; if the English is ambiguous, translate the meaning that the mathematics supports.
- **English terms in parentheses.** On the first use of a key term in each note, give the English term in parentheses: «нормализующий поток (normalizing flow)». Do this for every term in the glossary marked †, for any term whose Russian translation is not established or varies between textbooks, and whenever the English name is what a reader will search for. Later uses in the same note are Russian only.

## Glossary

† = give the English term in parentheses at first use in each note.

### Probability and information

| English | Russian |
| --- | --- |
| random variable / random vector | случайная величина / случайный вектор |
| distribution, density | распределение, плотность |
| probability mass function | функция вероятности |
| expectation, mean | математическое ожидание, среднее |
| variance, standard deviation | дисперсия, стандартное отклонение |
| covariance matrix | ковариационная матрица |
| correlation coefficient | коэффициент корреляции |
| Gaussian (normal) distribution | гауссовское (нормальное) распределение |
| standard normal | стандартное нормальное распределение |
| positive (semi)definite | положительно (полу)определённая |
| Cholesky factor | множитель Холецкого † |
| spectral decomposition | спектральное разложение |
| Mahalanobis distance | расстояние Махаланобиса |
| level set, contour | линия уровня |
| change of variables | замена переменных |
| Jacobian, Jacobian determinant | якобиан, определитель Якоби |
| Jacobian matrix, singular values | матрица Якоби, сингулярные числа |
| population statistics | статистики по генеральной совокупности |
| unbiased estimate | несмещённая оценка |
| marginal, marginalization | маргинальное распределение, маргинализация |
| posterior, prior, likelihood | апостериорное распределение, априорное распределение, правдоподобие |
| log-likelihood, negative log-likelihood (NLL) | логарифм правдоподобия, отрицательный логарифм правдоподобия (NLL) |
| maximum likelihood estimation | метод максимального правдоподобия |
| support (of a distribution) | носитель † |
| absolutely continuous | абсолютно непрерывная |
| surprise (self-information) | неожиданность (self-information) † |
| entropy, cross-entropy | энтропия, кросс-энтропия |
| KL divergence | расхождение Кульбака–Лейблера, KL-дивергенция † |
| forward KL / reverse KL | прямая KL / обратная KL (forward / reverse KL) † |
| Jensen–Shannon divergence | дивергенция Йенсена–Шеннона † |
| Wasserstein distance, earth mover's distance | расстояние Вассерштейна, расстояние перемещения земли (earth mover's distance) † |
| mode-covering / mode-seeking | покрывающее моды / ищущее моду (mode-covering / mode-seeking) † |
| mode collapse | коллапс мод (mode collapse) † |
| mixture of Gaussians | смесь гауссиан |
| Jensen's inequality | неравенство Йенсена |
| lower bound / upper bound | нижняя / верхняя оценка (граница) |
| evidence lower bound (ELBO) | нижняя оценка обоснованности (ELBO) † |
| Fenchel conjugate | сопряжённая по Фенхелю функция (convex conjugate) † |
| Lipschitz constant, K-Lipschitz | константа Липшица, K-липшицева функция |
| self-information | собственная информация (self-information) |
| bit, nat | бит, нат (1 бит, 0.469 бита, 0.693 ната; nats in parentheses at first use) |
| relative entropy | относительная энтропия |
| differential entropy | дифференциальная энтропия |
| Gibbs' inequality | неравенство Гиббса (Gibbs' inequality) |
| information inequality | информационное неравенство |
| triangle inequality | неравенство треугольника |
| empirical distribution | эмпирическое распределение |
| uniform distribution | равномерное распределение |
| law of large numbers | закон больших чисел |
| Monte Carlo estimate | оценка методом Монте-Карло |
| importance weights | веса значимости (importance weights) † |
| moment matching | сопоставление моментов (moment matching) † |
| heavy / light tails | тяжёлые / лёгкие хвосты |
| variational inference | вариационный вывод (variational inference) † |
| fair / rigged coin; biased coin | честная / нечестная монета; несимметричная монета |
| heads / tails | орёл / решка |

### Learning and networks

| English | Russian |
| --- | --- |
| generative model | генеративная модель |
| training, inference | обучение, инференс (вывод) |
| loss, objective | функция потерь, целевая функция |
| gradient descent, learning rate | градиентный спуск, шаг обучения (learning rate) |
| optimizer | оптимизатор |
| batch, mini-batch | батч, мини-батч |
| epoch | эпоха |
| weights, parameters | веса, параметры |
| autograd | автоматическое дифференцирование (autograd) |
| backpropagation | обратное распространение ошибки |
| vanishing / exploding gradients | затухающие / взрывающиеся градиенты |
| gradient clipping | обрезка градиентов (gradient clipping) † |
| batch normalization | батч-нормализация (batch normalization) † |
| convolution, kernel, stride, padding | свёртка, ядро, шаг (stride), дополнение (padding) |
| feature map, features | карта признаков, признаки |
| activation | активация |
| encoder, decoder | энкодер, декодер |
| autoencoder | автоэнкодер |
| bottleneck | узкое место (bottleneck) † |
| latent space, latent variable, latent code | латентное пространство, латентная переменная, латентный код |
| reconstruction | реконструкция |
| denoising autoencoder | шумоподавляющий автоэнкодер (denoising autoencoder) † |
| sparsity | разреженность |
| reparameterization trick | трюк репараметризации (reparameterization trick) † |
| generator, discriminator, critic | генератор, дискриминатор, критик |
| adversarial | состязательный |
| saturating / non-saturating loss | насыщающаяся / ненасыщающаяся функция потерь (saturating / non-saturating loss) † |
| label smoothing | сглаживание меток (label smoothing) † |
| one-hot label | метка в виде one-hot-вектора |
| gradient penalty | штраф на градиент (gradient penalty) † |
| weight clipping | обрезка весов (weight clipping) † |
| spectral normalization | спектральная нормализация |
| power iteration | степенной метод (power iteration) † |
| conditional model | условная модель |
| normalizing flow | нормализующий поток (normalizing flow) † |
| coupling layer | слой связи (coupling layer) † |
| autoregressive | авторегрессионный |
| invertible 1×1 convolution | обратимая свёртка 1×1 |
| diffusion model | диффузионная модель |
| forward process / reverse process | прямой процесс / обратный процесс |
| noise schedule | расписание шума (noise schedule) † |
| variance-preserving / variance-exploding | сохраняющий дисперсию / с растущей дисперсией (variance-preserving / variance-exploding) † |
| denoiser | денойзер (модель шумоподавления) |
| sampling, sample | сэмплирование, сэмпл (выборка — for a set of samples) |
| timestep | шаг (временной шаг) |
| exponential moving average (EMA) | экспоненциальное скользящее среднее (EMA) |
| running average / running estimate | скользящее среднее / скользящая оценка |
| batch mean / batch variance | среднее по батчу / дисперсия по батчу |
| momentum (BatchNorm running-average coefficient) | коэффициент обновления (momentum); not «момент», which reads as a statistical moment |
| running statistics / running buffers | скользящие статистики / буферы скользящих средних |
| internal covariate shift | внутренний ковариатный сдвиг (internal covariate shift) † |
| pre-activation | предактивация (pre-activation) † |
| loss landscape | ландшафт функции потерь |
| unrolled RNN | развёрнутая RNN |
| Xavier/Glorot initialization, He initialization | инициализация Ксавье/Глоро (Xavier/Glorot initialization) †, инициализация Хе (He initialization) † |
| fan-in / fan-out | число входов / выходов (fan-in / fan-out) † |
| saturating / non-saturating activation | насыщающаяся / ненасыщающаяся активация |
| gated recurrent cell | рекуррентная ячейка с гейтами (gated recurrent cell) † |
| forget gate / update gate | гейт забывания / гейт обновления (forget gate / update gate) † |
| residual connection, identity skip | остаточная связь (residual connection) †, тождественный обход (identity skip) † |
| filter (of a conv layer), bias (of a layer) | фильтр, смещение |
| dilation | расширение (dilation) † |
| cross-correlation | взаимная корреляция (cross-correlation) † |
| zero-padding | дополнение нулями (zero-padding) † |
| grouped convolution | групповая свёртка (grouped convolution) † |
| receptive field | рецептивное поле |
| feature extractor | экстрактор признаков |
| edge detector | детектор границ (not «краёв») |
| "size" of a matrix meaning its norm | величина (not «размер», which reads as dimensions) |
| least-squares loss | функция потерь наименьших квадратов (least-squares loss) † |
| minimax objective | минимаксная целевая функция |
| grid search | перебор по сетке |
| underflow | обращение в 0 при потере точности (underflow) † |

### Evaluation

| English | Russian |
| --- | --- |
| Inception Score | Inception Score (IS) |
| Fréchet Inception Distance | Fréchet Inception Distance (FID), расстояние Фреше |
| perceptual similarity | перцептивное сходство |
| embedding | эмбеддинг (векторное представление) |
| precision / recall | точность / полнота (precision / recall) † |
| fidelity / diversity | качество (fidelity) / разнообразие (diversity) † |

### Site and notebook vocabulary

| English | Russian |
| --- | --- |
| note | заметка |
| Notebook (section) | Ноутбук |
| Next (section) | Дальше |
| References (section) | Литература |
| Notation | Обозначения |
| Figure N | Рисунок N |
| cell N | ячейка N |
| worked example | разобранный пример |
| callout titles | translate the title in `<strong>` |
| callout: Intuition / Takeaway | Интуиция / Итог (not «Вывод», which means derivation or inference) |
