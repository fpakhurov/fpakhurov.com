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
- Decimal numbers keep the decimal point (0.5, 1.225), so that prose, formulas, figures and code use one notation. Thousands are separated by a thin space, never a comma: `$50\,000$` in math (the English `$50{,}000$` would read as a decimal comma), «50 000» with a no-break space in prose; four-digit numbers stay unseparated (4096). Percentages: «39 %» is not needed, write «39%».
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
| likelihood bound | нижняя оценка правдоподобия (not bare «оценка правдоподобия», which reads as an estimate) |
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
| evidence (marginal likelihood) | обоснованность (evidence) † |
| latent-variable model | модель с латентными переменными (latent-variable model) † |
| intractable | вычислительно неразрешимый (intractable) † |
| amortized inference | амортизированный вывод (amortized inference) † |
| score-function estimator (REINFORCE) | оценка REINFORCE через градиент логарифма плотности (score-function estimator) † |
| aggregate posterior | агрегированное апостериорное распределение (aggregate posterior) † |
| mutual information | взаимная информация (mutual information) † |
| marginal KL | маргинальная KL (marginal KL) † |
| KL to / from a distribution | KL-дивергенция относительно распределения (not «KL до») |
| Jensen gap | зазор Йенсена |
| quadrature | квадратурные формулы |
| f-divergence | f-дивергенция (f-divergence) † |
| generator (function) of an f-divergence | порождающая функция |
| lower semicontinuous | полунепрерывная снизу |
| Fenchel–Moreau theorem | теорема Фенхеля–Моро |
| intercept (of a line) | свободный член |
| class prior | априорная вероятность класса |
| mode dropping | пропуск мод (mode dropping) † |
| perfectly aligned manifolds (Arjovsky–Bottou) | идеально выровненные многообразия (perfectly aligned) † |
| Wasserstein-1 distance | расстояние Вассерштейна-1 (Wasserstein-1 distance) † |
| transport plan, coupling; optimal coupling | транспортный план (transport plan / coupling) †; оптимальный транспортный план |
| Kantorovich–Rubinstein duality | двойственность Канторовича–Рубинштейна (Kantorovich–Rubinstein duality) † |
| point mass | точечная масса |
| operator norm | операторная норма |
| mean value theorem | теорема о среднем |
| proxy (stand-in quantity) | суррогат |
| conditional entropy / marginal entropy | условная энтропия / маргинальная энтропия |
| law of total probability | формула полной вероятности |
| peaked / flat (distribution) | с острым пиком / плоское |
| 2-Wasserstein distance | расстояние Вассерштейна-2 (2-Wasserstein distance) † |
| principal square root (of a matrix) | главный квадратный корень (principal square root) † |
| similar matrices / diagonalisable | подобные матрицы / диагонализуемая |
| maximum entropy (principle) | принцип максимума энтропии (maximum entropy) † |
| resampling | повторная выборка (resampling) †; not «перевыбор» |
| base density | базовая плотность |
| spherical Gaussian | сферическая гауссиана (spherical Gaussian) † |
| diffeomorphism | диффеоморфизм |
| inverse function theorem | теорема об обратной функции |
| dequantization / dequantized | деквантование / деквантованные (dequantized) † |
| cofactor expansion | разложение по алгебраическим дополнениям (cofactor expansion) † |
| Gaussian elimination / LU decomposition | метод Гаусса / LU-разложение |
| shear (linear map) | сдвиг |
| closed form | замкнутый вид, в замкнутом виде, замкнутая формула; not «явный вид» |
| fixed point (of a recursion) | неподвижная точка |
| convergence in distribution | сходимость по распределению |
| transition kernel (Markov chain) | (гауссовское) переходное ядро; not bare «ядро», which reads as a convolution kernel |
| mean coefficient | коэффициент среднего |
| noise std | стандартное отклонение шума («σ шума» in figure labels) |
| precision (inverse variance) | обратная дисперсия (precision) †; not «точность», which is reserved for precision / recall |
| chain rule of probability | формула умножения вероятностей (chain rule) † |
| tower property | формула полного математического ожидания (tower property) † |
| completing the square | выделение полного квадрата |
| true posterior (diffusion) | истинное апостериорное распределение (true posterior) † |
| Markov chain | марковская цепь |
| telescoping (ratios / sum) | телескопически сокращаются |
| antithetic samples / partners | антитетические пары (antithetic) † |
| variance-reduction trick | приём снижения дисперсии |
| conditions on (a variable) | в условии стоит …; not «обусловлено», which reads as «вызвано» |

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
| one-sided label smoothing | одностороннее сглаживание меток (one-sided label smoothing) † |
| label flipping | инвертирование меток (label flipping) † |
| generative adversarial network (GAN) | генеративно-состязательная сеть (generative adversarial network, GAN) † |
| implicit model | неявная модель (implicit) † |
| value function (GAN) | функция ценности (value function) † |
| fake / real (labels, samples) | подделка / настоящие (not «фейк») |
| infinite capacity (model) | неограниченная ёмкость (infinite capacity) † |
| gradient ascent | градиентный подъём |
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
| linear / cosine / sigmoid schedule | линейное / косинусное / сигмоидное расписание |
| rescaled step (DDPM) | шаг с масштабированием |
| one-jump shortcut | переход за один скачок |
| sampler | сэмплер |
| benchmark | бенчмарк |
| toy setting / toy problem | игрушечная постановка / игрушечная задача; not «игрушечные настройки» |
| Swiss roll (dataset) | «швейцарский рулет» (Swiss roll) † |
| variance-preserving / variance-exploding | сохраняющий дисперсию / с растущей дисперсией (variance-preserving / variance-exploding) † |
| denoiser | денойзер (модель шумоподавления) |
| sampling, sample | сэмплирование, сэмпл (выборка — for a set of samples) |
| timestep | шаг (временной шаг) |
| timestep-conditioned (network) | получающая на вход шаг; not «обусловленная шагом» |
| reverse diffusion step | шаг обратной диффузии |
| discretized decoder | дискретизированный декодер |
| pixel tile (figures) | пиксельная плитка; «Плитки — настоящие сэмплы…» |
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
| representation | представление (representation) † |
| encoding problem (Rumelhart et al.) | задача кодирования (encoding problem) |
| downsample / upsample | понижение / повышение разрешения |
| mean squared error (MSE) | среднеквадратичная ошибка (MSE) † |
| binary cross-entropy (BCE) | бинарная кросс-энтропия (BCE) † |
| logits | логиты |
| Bernoulli variable / distribution | бернуллиевская величина / распределение Бернулли |
| corruption (denoising) | искажение (corruption) † |
| dropout | дропаут (dropout) † |
| pooling | пулинг (pooling) |
| score matching | score matching (сопоставление градиентов логарифма плотности) †; keep the English term, as in the course map |
| sparse autoencoder | разреженный автоэнкодер (sparse autoencoder) † |
| sparsity penalty | штраф за разреженность (sparsity penalty) † |
| hidden unit | скрытый нейрон |
| firing rate | частота срабатывания (firing rate) † |
| transposed convolution | транспонированная свёртка (transposed convolution) † |
| output padding | выходное дополнение (output padding) † |
| soft thresholding | мягкое пороговое отсечение (soft thresholding) † |
| checkerboard artifacts | шахматные артефакты (checkerboard artifacts) † |
| reconstruction loss | функция потерь реконструкции |
| posterior collapse | коллапс апостериорного распределения (posterior collapse) † |
| disentangled / disentanglement | распутанный / распутывание (disentangled / disentanglement) † |
| inductive bias | индуктивное смещение (inductive bias) † |
| conditional VAE | условный VAE (conditional VAE) |
| KL penalty ("fine") | штраф KL |
| organized / disorganized latent space | упорядоченное / неупорядоченное латентное пространство |
| (linear) heads of a network | линейные выходные слои (heads) |
| Wasserstein GAN | GAN Вассерштейна (Wasserstein GAN) † |
| critic score (output) | значение (выход) критика; not «оценка», which is reserved for estimate / bound. «критик» is animate: «обучаем критика» |
| feedforward network | сеть прямого распространения (feedforward network) † |
| hinge loss | кусочно-линейная функция потерь (hinge loss) † |
| spectral norm | спектральная норма (spectral norm) † |
| broadcast (tensors) | распространяется (broadcasting) † |
| pretrained / frozen (network) | предобученный / замороженный |
| adversarial examples | состязательные примеры (adversarial examples) † |
| early stopping | ранняя остановка |
| hyperparameter search / architecture search | подбор гиперпараметров / поиск архитектуры |
| one-hot prediction | предсказание в виде one-hot-вектора |
| Inception modules | модули Inception (Inception modules) |
| coding layer | кодирующий слой (coding layer) † |
| memorization (of training data) | запоминание (memorization) † |
| antialiasing | сглаживание (antialiasing) † |
| quantisation | квантование |
| backbone (network) | базовая сеть (backbone) † |
| adversarial perturbations | состязательные возмущения (adversarial perturbations) † |
| perceptual loss | перцептивная функция потерь (perceptual loss) † |
| super-resolution | сверхразрешение (super-resolution) † |
| inpainting | заполнение пропущенных областей (inpainting) † |
| style transfer | перенос стиля |
| unit normalisation | нормировка (к единичной длине) |
| cosine distance | косинусное расстояние |
| element-wise product | поэлементное произведение |
| wrapping around (circular boundary) | с переносом через край (циклически) |
| masked / inverse autoregressive flow (MAF / IAF) | маскированный / обратный авторегрессионный поток (masked / inverse autoregressive flow) † |
| neural spline coupling | слой связи на нейросетевых сплайнах (neural spline coupling) † |
| tail bound (spline) | граница сплайна (tail bound) † |
| scale network / translation network (coupling) | сеть масштаба (scale) / сеть сдвига (translation) † |
| additive / affine coupling | аддитивный / аффинный слой связи (additive / affine coupling) † |
| identity block / identity map (in figure labels) | единичный блок / тождественно (not «тождество», which reads as an equation) |
| masked autoencoder for distribution estimation (MADE) | маскированный автоэнкодер для оценивания распределений (MADE) |
| degree (MADE unit) | степень (degree) † |
| hidden mask / output mask (MADE) | маска скрытого слоя / маска выходного слоя (not «скрытая маска») |
| unused (input that feeds nothing) | не нужен (not «лишний») |
| latent-side coordinates (IAF) | латентные координаты; "before i" — с номерами меньше i |
| pivoting / pivot | выбор ведущего элемента (pivoting) † / ведущий элемент |
| permutation matrix | матрица перестановки |
| mixing matrix | матрица перемешивания |
| per-dimension affine layer (ActNorm) | покоординатный аффинный слой |
| universal density approximator | универсальный аппроксиматор плотности (universal density approximator) † |
| neural / spline transformer (flows) | нейросетевой / сплайновый преобразователь (transformer) † |
| rational-quadratic spline | рационально-квадратичный сплайн (rational-quadratic spline) † |
| push a grid backward through a flow | пропустить сетку через поток в обратном направлении (not «проталкивать назад») |
| weight decay | затухание весов (weight decay) † |

### Natural language processing

| English | Russian |
| --- | --- |
| token, tokenization, tokenizer | токен, токенизация, токенизатор |
| vocabulary, out-of-vocabulary (OOV) | словарь, слово вне словаря (OOV) |
| subword | подслово (subword) † |
| byte-pair encoding (BPE), merge | byte-pair encoding (BPE), слияние (merge) |
| pre-tokenization | предварительная токенизация (pre-tokenization) † |
| normalization (of text) | нормализация текста |
| stemming, lemmatization, lemma | стемминг, лемматизация, лемма |
| stop words | стоп-слова |
| corpus, corpora | корпус, корпусы |
| bag of words | мешок слов (bag of words) † |
| term frequency, inverse document frequency | частота термина, обратная документная частота (TF-IDF) |
| n-gram, bigram | n-грамма, биграмма |
| language model | языковая модель |
| perplexity | перплексия |
| smoothing, add-k smoothing, backoff | сглаживание, сглаживание add-k, откат (backoff) † |
| one-hot encoding | one-hot кодирование |
| word embedding | векторное представление слова, эмбеддинг (word embedding) † |
| distributional hypothesis | дистрибутивная гипотеза |
| context window | контекстное окно |
| skip-gram, CBOW | skip-gram, CBOW (continuous bag of words) |
| negative sampling | негативное сэмплирование (negative sampling) † |
| padding, padding token, mask | паддинг, токен заполнения (padding), маска |
| sequence length, batch size | длина последовательности, размер батча |
| recurrent neural network (RNN), hidden state | рекуррентная нейронная сеть (RNN), скрытое состояние |
| cell state, gate | состояние ячейки (cell state), вентиль (gate) † |
| sequence-to-sequence (seq2seq) | sequence-to-sequence (seq2seq) |
| encoder, decoder, encoder–decoder | энкодер, декодер, энкодер–декодер |
| context vector | вектор контекста |
| teacher forcing | teacher forcing † |
| attention, attention weights, attention score | внимание (attention), веса внимания, оценка внимания (attention score) † |
| self-attention, cross-attention | self-attention (внимание последовательности к самой себе; masculine agreement: «слой self-attention»), cross-attention (внимание к выходам энкодера) † |
| query, key, value | запрос, ключ, значение (query, key, value) † |
| scaled dot-product attention | внимание на основе масштабированного скалярного произведения (scaled dot-product attention) † |
| multi-head attention, head | многоголовое внимание (multi-head attention), голова † |
| causal mask | каузальная маска (causal mask) † |
| positional encoding | позиционное кодирование (positional encoding) † |
| residual connection, layer normalization | остаточная связь, нормализация слоя (layer normalization) |
| feed-forward block | полносвязный блок (feed-forward) |
| pretraining, fine-tuning | предобучение, дообучение (fine-tuning) † |
| masked language modeling (MLM) | маскированное языковое моделирование (MLM) † |
| next-token prediction, autoregressive | предсказание следующего токена, авторегрессионный |
| greedy decoding, beam search | жадное декодирование, лучевой поиск (beam search) † |
| temperature, top-k, top-p (nucleus) sampling | температура, top-k, top-p (nucleus) сэмплирование |
| transfer learning | перенос обучения (transfer learning) † |
| zero-shot, few-shot | zero-shot, few-shot |
| linear probing | линейное зондирование (linear probing) † |
| parameter-efficient fine-tuning (PEFT), adapter | параметрически эффективное дообучение (PEFT), адаптер |
| low-rank adaptation (LoRA), rank | низкоранговая адаптация (LoRA), ранг |
| prompt, prompt tuning | промпт, настройка промпта (prompt tuning) † |
| instruction tuning, alignment | обучение на инструкциях (instruction tuning), выравнивание (alignment) † |
| reward model, RLHF, DPO | модель вознаграждения, RLHF, DPO |
| quantization, calibration | квантизация, калибровка |
| knowledge distillation | дистилляция знаний |
| named entity recognition (NER) | распознавание именованных сущностей (NER) |
| question answering (QA), extractive / abstractive | ответы на вопросы (QA), экстрактивный / абстрактивный |
| summarization | суммаризация |
| BLEU, ROUGE, exact match, F1 | BLEU, ROUGE, точное совпадение (exact match), F1 |
| semantic search, dense retrieval, reranker | семантический поиск, плотный поиск (dense retrieval), реранкер † |
| retrieval-augmented generation (RAG), chunk | генерация с извлечением (RAG), фрагмент (chunk) † |
| vector store, index | векторное хранилище, индекс |
| tool use, function calling, agent | использование инструментов, вызов функций (function calling), агент |
| LLM-as-a-judge | LLM в роли судьи (LLM-as-a-judge) † |
| hallucination | галлюцинация |
| text diffusion, masked diffusion | текстовая диффузия, маскированная диффузия |
| centre word / context word | центральное слово / контекстное слово |
| input / output vector (word2vec) | входной / выходной вектор |
| score (dot product, logit) | оценка (score) †; «в оптимуме оценка равна…» where it could read as an estimate |
| negative samples, noise distribution, noise words | негативные примеры (negative samples) †, шумовое распределение, шумовые слова |
| unigram distribution | униграммное распределение (unigram distribution) † |
| subsampling of frequent words | прореживание частых слов (subsampling) † |
| hierarchical softmax | иерархический softmax (hierarchical softmax) † |
| noise-contrastive estimation (NCE) | шумоконтрастное оценивание (noise-contrastive estimation, NCE) † |
| pointwise mutual information (PMI), shifted / smoothed PMI | поточечная взаимная информация (PMI) †, сдвинутая / сглаженная PMI |
| context distribution smoothing | сглаживание распределения контекстов (context distribution smoothing) † |
| skip-gram negative sampling (SGNS) | skip-gram с негативным сэмплированием (SGNS) † |
| self-supervised learning | обучение с самоконтролем (self-supervision) †; not «самообучение» |
| counts / frequency | число вхождений / частота |
| word type / running words | тип слова (word type) † / словоупотребления |
| held-out text | отложенный текст (held-out) † |
| greedy longest match | жадный поиск самого длинного совпадения (greedy longest match) † |
| merge rule, end-of-word marker | правило слияния, маркер конца слова |
| ties, tie-break rule | равенство счётчиков, правило разрешения равенств |
| byte-level BPE | байтовый BPE (byte-level BPE) † |
| unigram language model (tokenizer), lattice, Viterbi algorithm | униграммная языковая модель (unigram language model) †, решётка (lattice) †, алгоритм Витерби |
| subword regularization | регуляризация подслов (subword regularization) † |
| WordPiece score | критерий слияния WordPiece; not «оценка» |
| trainer (tokenizers library) | процедура обучения; not «тренер» |
| re-estimate (EM) | повторно оценивать; not «переоценивать» |
| unseen word | слово, не встречавшееся при обучении, новое слово; not «невиданное» |
| weight tying, weight sharing | связывание весов (weight tying) †, разделение весов (weight sharing) † |
| cased / uncased tokenizer | токенизатор с учётом регистра (cased) / без учёта регистра (uncased) |
| detokenization, special tokens | детокенизация, специальные токены |
| soft dictionary lookup | мягкий поиск по словарю (the data structure, not the vocabulary) |
| contextual / static embedding | контекстный / статический эмбеддинг |
| padding mask, pad key / pad query | маска паддинга (padding mask) †, ключ-паддинг / запрос-паддинг |
| permutation-equivariant | эквивариантный относительно перестановок (permutation-equivariant) † |
| rotary position embedding | ротационные позиционные эмбеддинги (rotary, RoPE) † |
| Winograd schema, coreference | схема Винограда (Winograd schema) †, кореференция |
| attention pattern / attention map | шаблон внимания / карта внимания |
| GPU kernel (FlashAttention) | GPU-ядро (kernel) †; not bare «ядро» |
| position-wise feed-forward network | полносвязная сеть, применяемая к каждой позиции отдельно (position-wise feed-forward) † |
| Cauchy–Schwarz inequality | неравенство Коши–Буняковского |
| random seed | начальное значение генератора (seed) |
| stacked (tensors) | собранные (stack) в тензор; not «сложенные», which reads as summed |

### Evaluation

| English | Russian |
| --- | --- |
| Inception Score | Inception Score (IS) |
| Fréchet Inception Distance | Fréchet Inception Distance (FID), расстояние Фреше |
| perceptual similarity | перцептивное сходство |
| embedding | эмбеддинг (векторное представление) |
| precision / recall | точность / полнота (precision / recall) † |
| fidelity / diversity | качество (fidelity) / разнообразие (diversity) † |
| bits per dimension | бит на размерность (bits per dimension) †; «3.70 бита на размерность» |
| score (Inception Score etc.) | метрика, значение метрики; not «оценка», which is reserved for estimate / bound |
| accuracy (classifier) | доля правильных ответов (accuracy) †; not «точность», which is reserved for precision |
| mean term / covariance term (FID) | член средних / член ковариаций |
| intra-FID | intra-FID (not translated) |
| two-alternative forced choice (2AFC) | вынужденный выбор из двух альтернатив (two-alternative forced choice, 2AFC) † |
| reference image | эталон (эталонное изображение) |
| reference implementation | эталонная реализация |

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
| markdown cell | текстовая ячейка |
| perplexity (t-SNE) | перплексия |
| worked example | разобранный пример |
| callout titles | translate the title in `<strong>` |
| callout: Intuition / Takeaway | Интуиция / Итог (not «Вывод», which means derivation or inference) |
| Summary (section) | Итоги |
| Recap (section) | Сводка (Summary stays «Итоги») |
| cell outputs (notebook) | выходы ячеек; not «выводы», which means derivation or inference |
| panel letters (a)/(b) in figures | (а)/(б), Cyrillic |
| citation parts: Algorithm, Proposition, Theorem, Lemma, Section, Equations, Table | алгоритм, предложение, теорема, лемма, раздел, формулы, таблица (lower case after the citation) |
