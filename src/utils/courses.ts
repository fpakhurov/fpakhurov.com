export type CourseKey = 'nlp' | 'generative-models';

export type CourseTopic = string | { title: string; note: string; anchor?: string };

// A string is a planned topic. Published topics explicitly name their note and,
// where useful, a section: article titles are not a reliable coverage map.
function noteTopic(title: string, note: string, anchor?: string): CourseTopic {
  return { title, note, anchor };
}

export const courses = {
  nlp: {
    title: 'Natural Language Processing',
    shortTitle: 'NLP',
    description: 'A structured path from text fundamentals to modern LLM systems and evaluation.',
    ru: {
      title: 'Обработка естественного языка',
      shortTitle: 'NLP',
      description: 'Путь от основ работы с текстом к современным LLM-системам и их оценке.',
      labels: {},
    },
    sections: [
      { title: 'Foundations', topics: ['Text preprocessing', 'Tokenization', 'Corpora', 'Evaluation'] },
      { title: 'Classical NLP', topics: ['Bag of Words', 'TF-IDF', 'N-grams', 'Language models'] },
      { title: 'Representations', topics: ['Word2Vec', 'GloVe', 'FastText', 'Contextual embeddings'] },
      { title: 'Neural NLP', topics: ['RNN', 'LSTM / GRU', 'Seq2Seq', 'Attention'] },
      { title: 'Transformers', topics: [noteTopic('Self-attention', 'nlp/attention'), noteTopic('Transformer architecture', 'nlp/transformers'), 'BERT', 'GPT', 'Encoder / decoder models'] },
      { title: 'Modern LLM Systems', topics: ['Instruction tuning', 'RAG', 'Tool use', 'Agents', 'Evaluation'] },
      { title: 'Applications', topics: ['Classification', 'NER', 'Search', 'QA', 'Generation'] },
    ],
  },
  'generative-models': {
    title: 'Generative Models',
    shortTitle: 'Generative Models',
    description: 'Probability, latent variables and the main families of modern generative models.',
    // Russian labels for the course map, keyed by the English titles below.
    ru: {
      title: 'Генеративные модели',
      shortTitle: 'Генеративные модели',
      description: 'Вероятность, латентные переменные и основные семейства современных генеративных моделей.',
      labels: {
        'Foundations': 'Основы',
        'Multivariate Gaussian distributions': 'Многомерные гауссовские распределения',
        'Entropy, cross-entropy and KL divergence': 'Энтропия, кросс-энтропия и KL-дивергенция',
        'Fitting distributions with KL': 'Подгонка распределений с помощью KL',
        'Maximum likelihood': 'Метод максимального правдоподобия',
        'Batch normalization, gradients and convolutions': 'Батч-нормализация, градиенты и свёртки',
        'Autoencoders': 'Автоэнкодеры',
        'Variational Autoencoders': 'Вариационные автоэнкодеры',
        'Variational autoencoders': 'Вариационные автоэнкодеры (VAE)',
        'ELBO': 'ELBO',
        'Reparameterization trick': 'Трюк репараметризации',
        'VAE variants': 'Варианты VAE',
        'GANs': 'GAN',
        'Generative adversarial networks': 'Генеративно-состязательные сети (GAN)',
        'Conditional GAN': 'Условный GAN',
        'f-GAN': 'f-GAN',
        'Wasserstein GANs and Lipschitz constraints': 'GAN Вассерштейна и ограничение Липшица',
        'Evaluation': 'Оценка качества',
        'Inception Score': 'Inception Score (IS)',
        'Fréchet Inception Distance': 'Fréchet Inception Distance (FID)',
        'LPIPS': 'LPIPS',
        'Precision / Recall': 'Precision / Recall',
        'Human evaluation': 'Оценка людьми',
        'Normalizing Flows': 'Нормализующие потоки',
        'Normalizing flows: change of variables': 'Нормализующие потоки: замена переменных',
        'Flow architectures': 'Архитектуры потоков',
        'Diffusion Models': 'Диффузионные модели',
        'DDPM: the forward process': 'DDPM: прямой процесс',
        'DDPM: reverse process and training objective': 'DDPM: обратный процесс и целевая функция обучения',
        'Sampling': 'Сэмплирование',
        'Score matching': 'Score matching',
        'Latent diffusion': 'Латентная диффузия',
        'Autoregressive Models': 'Авторегрессионные модели',
        'Factorization': 'Факторизация',
        'PixelRNN / PixelCNN': 'PixelRNN / PixelCNN',
        'Autoregressive transformers': 'Авторегрессионные трансформеры',
      },
    },
    sections: [
      { title: 'Foundations', topics: [
        noteTopic('Multivariate Gaussian distributions', 'generative-models/gaussian-distributions'),
        noteTopic('Entropy, cross-entropy and KL divergence', 'generative-models/entropy-and-divergences'),
        noteTopic('Fitting distributions with KL', 'generative-models/fitting-distributions-with-kl'),
        noteTopic('Maximum likelihood', 'generative-models/entropy-and-divergences', 'why-cross-entropy-is-the-loss-we-minimize'),
        noteTopic('Batch normalization, gradients and convolutions', 'generative-models/training-background'),
        noteTopic('Autoencoders', 'generative-models/autoencoders'),
      ] },
      { title: 'Variational Autoencoders', topics: [
        noteTopic('Variational autoencoders', 'generative-models/vae'),
        noteTopic('ELBO', 'generative-models/vae', 'where-the-elbo-comes-from'),
        noteTopic('Reparameterization trick', 'generative-models/vae', 'the-reparameterization-trick'),
        'VAE variants',
      ] },
      { title: 'GANs', topics: [
        noteTopic('Generative adversarial networks', 'generative-models/gans'),
        noteTopic('Conditional GAN', 'generative-models/gans', 'conditional-gan'),
        noteTopic('f-GAN', 'generative-models/gans', 'f-gan'),
        noteTopic('Wasserstein GANs and Lipschitz constraints', 'generative-models/wgan'),
      ] },
      { title: 'Evaluation', topics: [
        noteTopic('Inception Score', 'generative-models/inception-score'),
        noteTopic('Fréchet Inception Distance', 'generative-models/fid'),
        noteTopic('LPIPS', 'generative-models/lpips'),
        'Precision / Recall', 'Human evaluation',
      ] },
      { title: 'Normalizing Flows', topics: [
        noteTopic('Normalizing flows: change of variables', 'generative-models/normalizing-flows'),
        noteTopic('Flow architectures', 'generative-models/flow-architectures'),
      ] },
      { title: 'Diffusion Models', topics: [
        noteTopic('DDPM: the forward process', 'generative-models/ddpm-forward-process'),
        noteTopic('DDPM: reverse process and training objective', 'generative-models/ddpm-training-objective'),
        noteTopic('Sampling', 'generative-models/ddpm-training-objective', 'sampling-running-the-chain-backwards'),
        'Score matching', 'Latent diffusion',
      ] },
      { title: 'Autoregressive Models', topics: ['Factorization', 'PixelRNN / PixelCNN', 'Autoregressive transformers'] },
    ],
  },
} as const;
