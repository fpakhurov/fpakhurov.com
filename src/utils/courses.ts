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
