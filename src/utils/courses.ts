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
      { title: 'Foundations', topics: ['Autoencoders', 'Probability review', 'Gaussian distributions', 'Entropy and divergences', 'Fitting distributions with KL', 'Maximum likelihood', 'Latent variables'] },
      { title: 'Autoregressive Models', topics: ['Factorization', 'PixelRNN / PixelCNN', 'Autoregressive transformers'] },
      { title: 'Variational Autoencoders', topics: ['Latent-variable models', 'ELBO', 'Reparameterization trick', 'VAE variants'] },
      { title: 'GANs', topics: ['Adversarial training', 'GAN objective', 'Wasserstein GAN', 'Training instability', 'GAN variants'] },
      { title: 'Normalizing Flows', topics: ['Change of variables', 'Invertible transformations', 'Flow architectures'] },
      { title: 'Diffusion Models', topics: ['Forward process', 'Reverse process', 'DDPM', 'Score matching', 'Sampling', 'Latent diffusion'] },
      { title: 'Evaluation', topics: ['Likelihood', 'Inception Score', 'FID', 'LPIPS', 'Precision / Recall', 'Human evaluation', 'Hallucination analysis'] },
    ],
  },
} as const;
