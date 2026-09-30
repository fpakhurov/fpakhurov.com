export type CourseKey = 'nlp' | 'generative-models';

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
      { title: 'Transformers', topics: ['Self-attention', 'Transformer architecture', 'BERT', 'GPT', 'Encoder / decoder models'] },
      { title: 'Modern LLM Systems', topics: ['Instruction tuning', 'RAG', 'Tool use', 'Agents', 'Evaluation'] },
      { title: 'Applications', topics: ['Classification', 'NER', 'Search', 'QA', 'Generation'] },
    ],
  },
  'generative-models': {
    title: 'Generative Models',
    shortTitle: 'Generative Models',
    description: 'Probability, latent variables and the main families of modern generative models.',
    sections: [
      { title: 'Foundations', topics: ['Autoencoders', 'Multivariate Gaussian distributions', 'Entropy, cross-entropy and KL divergence', 'Batch normalization, gradients and convolutions', 'Fitting distributions with KL', 'Maximum likelihood', 'Latent variables'] },
      { title: 'Evaluation', topics: ['Inception Score', 'Fréchet Inception Distance', 'LPIPS', 'Precision / Recall', 'Human evaluation'] },
      { title: 'GANs', topics: ['Generative adversarial networks', 'Wasserstein GANs and Lipschitz constraints', 'Conditional GANs', 'f-GAN'] },
      { title: 'Variational Autoencoders', topics: ['Variational autoencoders', 'VAE variants'] },
      { title: 'Normalizing Flows', topics: ['Normalizing flows: change of variables', 'Flow architectures'] },
      { title: 'Diffusion Models', topics: ['DDPM: the forward process', 'DDPM: reverse process and training objective', 'Score matching', 'Latent diffusion'] },
      { title: 'Autoregressive Models', topics: ['Factorization', 'PixelRNN / PixelCNN', 'Autoregressive transformers'] },
    ],
  },
} as const;
