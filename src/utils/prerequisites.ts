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

const MML = 'https://mml-book.github.io/';
const D2L_MLP = 'https://d2l.ai/chapter_multilayer-perceptrons/index.html';
const D2L_BACKPROP = 'https://d2l.ai/chapter_multilayer-perceptrons/backprop.html';
const D2L_LINEAR = 'https://d2l.ai/chapter_linear-classification/index.html';

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
  // Mathematics: Deisenroth, Faisal and Ong, "Mathematics for Machine Learning".
  'Linear algebra': { href: MML },
  'Calculus': { href: MML },
  'Determinants': { href: MML },
  'Линейная алгебра': { href: MML },
  'Математический анализ': { href: MML },
  'Определители': { href: MML },
  'Trigonometry': { href: 'https://en.wikipedia.org/wiki/Trigonometric_functions' },
  'Тригонометрия': { href: 'https://ru.wikipedia.org/wiki/Тригонометрические_функции' },
  // Neural networks: Zhang, Lipton, Li and Smola, "Dive into Deep Learning".
  'Neural networks': { href: D2L_MLP },
  'Нейронные сети': { href: D2L_MLP },
  'Backpropagation': { href: D2L_BACKPROP },
  'Обратное распространение ошибки': { href: D2L_BACKPROP },
  'Python basics': { href: 'https://docs.python.org/3/tutorial/' },
  'Основы Python': { href: 'https://docs.python.org/3/tutorial/' },
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
  'Markov chain Monte Carlo': { note: 'probability/markov-chain-monte-carlo' },
  'LoRA': { note: 'nlp/peft', anchor: 'lora-a-low-rank-update' },
  'Марковские методы Монте-Карло (MCMC)': { note: 'probability/markov-chain-monte-carlo' },
  'Метод максимального правдоподобия': { note: 'probability/maximum-likelihood' },
  'Gradient descent': { note: 'generative-models/fitting-distributions-with-kl', anchor: 'how-the-parameters-are-trained' },
  'Градиентный спуск': { note: 'generative-models/fitting-distributions-with-kl', anchor: 'how-the-parameters-are-trained' },
  'Gaussian distributions': { note: 'generative-models/gaussian-distributions' },
  'Convolutional networks': { note: 'generative-models/training-background', anchor: 'a-convolution-layer' },
  'Convolutions': { note: 'generative-models/training-background', anchor: 'a-convolution-layer' },
  'Свёрточные сети': { note: 'generative-models/training-background', anchor: 'a-convolution-layer' },
  'Свёртки': { note: 'generative-models/training-background', anchor: 'a-convolution-layer' },
  'Wasserstein GANs': { note: 'generative-models/wgan' },
  'GAN Вассерштейна': { note: 'generative-models/wgan' },
  'Linear models': { href: D2L_LINEAR },
  'Линейные модели': { href: D2L_LINEAR },
  'Logistic regression': { note: 'nlp/bag-of-words-and-tf-idf', anchor: 'a-linear-classifier-on-counts' },
  'Логистическая регрессия': { note: 'nlp/bag-of-words-and-tf-idf', anchor: 'a-linear-classifier-on-counts' },
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
