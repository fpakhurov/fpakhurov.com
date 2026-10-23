/**
 * Links for the "Prerequisites" line of a note.
 *
 * A prerequisite that is the title of a note of the same course (in the page's language, or the
 * Russian course-map label of a topic) links to that note. Everything else must be listed here:
 * background topics point to a note of another course, a section of a note, or an external
 * textbook chapter. The build fails on a prerequisite that resolves to nothing, so a new note
 * cannot add an unlinked one.
 */

export type PrerequisiteTarget = { note: string; anchor?: string } | { href: string };


const background: Record<string, PrerequisiteTarget> = {
  // Probability: the notes of the probability course.
  'Probability': { note: 'probability/what-probability-is' },
  'Basic probability': { note: 'probability/what-probability-is' },
  'Conditional probability': { note: 'probability/conditional-probability-and-bayes' },
  'Probability and statistics at an introductory level': { note: 'probability/what-probability-is' },
  'Expectation': { note: 'probability/expectation-and-variance' },
  'Теория вероятностей': { note: 'probability/what-probability-is' },
  'Математическое ожидание': { note: 'probability/expectation-and-variance' },
  'Условная вероятность': { note: 'probability/conditional-probability-and-bayes' },
  // Mathematics: the notes of the Mathematics for Machine Learning course.
  'Linear algebra': { note: 'math/vectors-and-linear-maps' },
  'Calculus': { note: 'math/derivatives-and-taylor-series' },
  'Determinants': { note: 'math/determinants-and-eigenvalues' },
  'Линейная алгебра': { note: 'math/vectors-and-linear-maps' },
  'Математический анализ': { note: 'math/derivatives-and-taylor-series' },
  'Определители': { note: 'math/determinants-and-eigenvalues' },
  'Trigonometry': { href: 'https://en.wikipedia.org/wiki/Trigonometric_functions' },
  'Тригонометрия': { href: 'https://ru.wikipedia.org/wiki/Тригонометрические_функции' },
  // Neural networks and other machine-learning background: the notes of the ML course.
  'Neural networks': { note: 'ml/neural-networks' },
  'Нейронные сети': { note: 'ml/neural-networks' },
  'Classification metrics': { note: 'ml/classification-metrics' },
  'Метрики классификации': { note: 'ml/classification-metrics' },
  'Backpropagation': { note: 'ml/backpropagation' },
  'Обратное распространение ошибки': { note: 'ml/backpropagation' },
  'Python basics': { note: 'python/running-python' },
  'Основы Python': { note: 'python/running-python' },
  // Sections of the course notes.
  'Entropy': { note: 'generative-models/entropy-and-divergences', anchor: 'entropy-expected-surprise' },
  'Энтропия': { note: 'generative-models/entropy-and-divergences', anchor: 'entropy-expected-surprise' },
  'KL divergence': { note: 'generative-models/entropy-and-divergences', anchor: 'kullbackleibler-divergence' },
  'KL-дивергенция': { note: 'generative-models/entropy-and-divergences', anchor: 'kullbackleibler-divergence' },
  'Jensen–Shannon divergence': { note: 'generative-models/entropy-and-divergences', anchor: 'jensenshannon-divergence' },
  'Дивергенция Йенсена–Шеннона': { note: 'generative-models/entropy-and-divergences', anchor: 'jensenshannon-divergence' },
  'Binary cross-entropy': { note: 'generative-models/entropy-and-divergences', anchor: 'cross-entropy-surprise-under-a-wrong-belief' },
  'Бинарная кросс-энтропия': { note: 'generative-models/entropy-and-divergences', anchor: 'cross-entropy-surprise-under-a-wrong-belief' },
  'Maximum likelihood': { note: 'probability/maximum-likelihood' },
  'Conditional expectation': { note: 'probability/conditional-expectation' },
  'Условное математическое ожидание': { note: 'probability/conditional-expectation' },
  'The multivariate Gaussian': { note: 'probability/multivariate-gaussian' },
  'Многомерное нормальное распределение': { note: 'probability/multivariate-gaussian' },
  'The law of large numbers': { note: 'probability/law-of-large-numbers' },
  'Закон больших чисел': { note: 'probability/law-of-large-numbers' },
  'The central limit theorem': { note: 'probability/central-limit-theorem' },
  'Центральная предельная теорема': { note: 'probability/central-limit-theorem' },
  'Bayesian inference': { note: 'probability/bayesian-inference' },
  'Байесовский вывод': { note: 'probability/bayesian-inference' },
  'Confidence intervals and the bootstrap': { note: 'probability/confidence-intervals-and-bootstrap' },
  'Доверительные интервалы и бутстрэп': { note: 'probability/confidence-intervals-and-bootstrap' },
  'Markov chain Monte Carlo': { note: 'probability/markov-chain-monte-carlo' },
  'Markov chains': { note: 'probability/markov-chains' },
  'Методы Монте-Карло': { note: 'probability/monte-carlo' },
  'Цепи Маркова': { note: 'probability/markov-chains' },
  'Monte Carlo methods': { note: 'probability/monte-carlo' },
  'LoRA': { note: 'nlp/peft', anchor: 'lora-a-low-rank-update' },
  'Self-attention': { note: 'nlp/attention' },
  'Transformer architecture': { note: 'nlp/transformers' },
  'Normalization and initialization': { note: 'deep-learning/normalization-and-initialization' },
  'Нормализация и инициализация': { note: 'deep-learning/normalization-and-initialization' },
  'Convolution': { note: 'deep-learning/convolution' },
  'Свёртка': { note: 'deep-learning/convolution' },
  'GPT and autoregressive language modeling': { note: 'nlp/gpt' },
  'GPT и авторегрессионное языковое моделирование': { note: 'nlp/gpt' },
  'Instruction tuning and alignment': { note: 'nlp/instruction-tuning' },
  'Обучение на инструкциях и выравнивание': { note: 'nlp/instruction-tuning' },
  'Tool use and agents': { note: 'nlp/tools-and-agents' },
  'Users, groups and permissions': { note: 'acos/users-and-permissions' },
  'Processes and threads': { note: 'acos/processes-and-threads' },
  'Процессы и потоки': { note: 'acos/processes-and-threads' },
  'Files and input/output': { note: 'acos/files-and-io' },
  'Файлы и ввод-вывод': { note: 'acos/files-and-io' },
  'Inter-process communication': { note: 'acos/inter-process-communication' },
  'Межпроцессное взаимодействие': { note: 'acos/inter-process-communication' },
  'Computer networks': { note: 'acos/networking' },
  'Компьютерные сети': { note: 'acos/networking' },
  'Sockets': { note: 'acos/sockets' },
  'Сокеты': { note: 'acos/sockets' },
  'Modules, packages and environments': { note: 'python/modules-and-packages' },
  'Модули, пакеты и окружения': { note: 'python/modules-and-packages' },
  'Testing': { note: 'python/testing' },
  'Тестирование': { note: 'python/testing' },
  'Hypothesis tests and A/B testing': { note: 'probability/hypothesis-tests' },
  'Проверка гипотез и A/B-тесты': { note: 'probability/hypothesis-tests' },
  'Пользователи, группы и права доступа': { note: 'acos/users-and-permissions' },
  'Virtual machines and containers': { note: 'acos/virtual-machines-and-containers' },
  'Виртуальные машины и контейнеры': { note: 'acos/virtual-machines-and-containers' },
  'Retrieval-augmented generation': { note: 'nlp/rag' },
  'Генерация с извлечением (RAG)': { note: 'nlp/rag' },
  'LLM evaluation': { note: 'nlp/llm-evaluation' },
  'Оценка LLM': { note: 'nlp/llm-evaluation' },
  'Использование инструментов и агенты': { note: 'nlp/tools-and-agents' },
  'Discrete distributions': { note: 'probability/discrete-distributions' },
  'Дискретные распределения': { note: 'probability/discrete-distributions' },
  'Архитектура трансформера': { note: 'nlp/transformers' },
  'Марковские методы Монте-Карло (MCMC)': { note: 'probability/markov-chain-monte-carlo' },
  'Метод максимального правдоподобия': { note: 'probability/maximum-likelihood' },
  'Gradient descent': { note: 'ml/gradient-descent' },
  'Least squares': { note: 'ml/least-squares' },
  'Метод наименьших квадратов': { note: 'ml/least-squares' },
  'Regularization': { note: 'ml/regularization' },
  'Регуляризация': { note: 'ml/regularization' },
  'Stochastic gradient descent': { note: 'ml/stochastic-and-adaptive-optimizers' },
  'Стохастический градиентный спуск': { note: 'ml/stochastic-and-adaptive-optimizers' },
  'Градиентный спуск': { note: 'ml/gradient-descent' },
  'Gaussian distributions': { note: 'generative-models/gaussian-distributions' },
  'Convolutional networks': { note: 'deep-learning/convolution' },
  'Convolutions': { note: 'deep-learning/convolution' },
  'Свёрточные сети': { note: 'deep-learning/convolution' },
  'Свёртки': { note: 'deep-learning/convolution' },
  'Wasserstein GANs': { note: 'generative-models/wgan' },
  'GAN Вассерштейна': { note: 'generative-models/wgan' },
  'Linear models': { note: 'ml/linear-classifiers' },
  'Линейные модели': { note: 'ml/linear-classifiers' },
  'Logistic regression': { note: 'ml/logistic-regression' },
  'Kernels': { note: 'ml/kernels' },
  'Ядра': { note: 'ml/kernels' },
  'Support vector machines': { note: 'ml/support-vector-machines' },
  'Метод опорных векторов': { note: 'ml/support-vector-machines' },
  'Mixtures and the EM algorithm': { note: 'ml/em-algorithm' },
  'Смеси распределений и EM-алгоритм': { note: 'ml/em-algorithm' },
  'Dimensionality reduction': { note: 'ml/dimensionality-reduction' },
  'Понижение размерности': { note: 'ml/dimensionality-reduction' },
  'Логистическая регрессия': { note: 'ml/logistic-regression' },
};

export interface PrerequisiteLink { label: string; href: string; external: boolean }

/**
 * Resolve the prerequisites of a note into links.
 * @param titles   note id by lower-cased title, for the notes of the same course in the page's language
 * @param labels   Russian course-map labels (English topic title → Russian label), used on Russian pages
 * @param topics   note id (with anchor) by English course-map topic title
 */
export function prerequisiteLinks(
  prerequisites: string[],
  { prefix, titles, labels, topics, lenient }: {
    prefix: string;
    titles: Map<string, string>;
    labels: Record<string, string>;
    topics: Map<string, string>;
    lenient: boolean;
  },
): PrerequisiteLink[] {
  const byRuLabel = new Map(Object.entries(labels).map(([en, ru]) => [ru.toLowerCase(), en]));
  return prerequisites.map((label) => {
    const key = label.toLowerCase();
    const titled = titles.get(key);
    if (titled) return { label, href: `${prefix}/${titled}`, external: false };
    const topic = topics.get(key) ?? topics.get(byRuLabel.get(key)?.toLowerCase() ?? '');
    if (topic) return { label, href: `${prefix}/${topic}`, external: false };
    const target = background[label];
    if (target && 'href' in target) return { label, href: target.href, external: true };
    if (target) return { label, href: `${prefix}/${target.note}${target.anchor ? `#${target.anchor}` : ''}`, external: false };
    if (lenient) return { label, href: '', external: false };
    throw new Error(`Prerequisite "${label}" links to nothing: add it to src/utils/prerequisites.ts`);
  });
}
