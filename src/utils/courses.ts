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
        noteTopic('Autoencoders', 'generative-models/autoencoders'),
        noteTopic('Probability review', 'generative-models/vae', 'probability-recap-joint-marginal-and-conditional'),
        noteTopic('Gaussian distributions', 'generative-models/gaussian-distributions'),
        noteTopic('Entropy and divergences', 'generative-models/entropy-and-divergences'),
        noteTopic('Neural training background', 'generative-models/neural-training-background'),
        noteTopic('Fitting distributions with KL', 'generative-models/fitting-distributions'),
        noteTopic('Maximum likelihood', 'generative-models/normalizing-flows', 'maximum-likelihood'),
      ] },
      { title: 'Autoregressive Models', topics: ['Factorization', 'PixelRNN / PixelCNN', 'Autoregressive transformers'] },
      { title: 'Variational Autoencoders', topics: [
        noteTopic('Variational autoencoders', 'generative-models/vae'),
        noteTopic('Latent-variable models', 'generative-models/vae', 'prior-decoder-and-posterior'),
        noteTopic('ELBO derivation', 'generative-models/vae', 'deriving-the-evidence-lower-bound'),
        noteTopic('Reparameterization trick', 'generative-models/vae', 'reparameterization-separate-noise-from-parameters'),
        noteTopic('Analytic Gaussian KL', 'generative-models/vae', 'analytic-gaussian-kl'),
        noteTopic('Beta-VAE: notebook context', 'generative-models/vae', 'beta-vae-notebook-context'),
        'Conditional and vector-quantized VAEs',
      ] },
      { title: 'GANs', topics: [
        noteTopic('GAN objective', 'generative-models/gan-objective'),
        noteTopic('Adversarial training', 'generative-models/gan-objective', 'alternating-updates'),
        noteTopic('Wasserstein GAN', 'generative-models/wgan'),
        noteTopic('Vanishing generator gradients', 'generative-models/gan-objective', 'non-saturating-generator-loss'),
        noteTopic('Conditional GAN: notebook context', 'generative-models/gan-objective', 'conditional-gan-notebook-context'),
        noteTopic('f-GAN: notebook context', 'generative-models/gan-objective', 'f-gan-notebook-context'),
        'Other GAN variants',
      ] },
      { title: 'Normalizing Flows', topics: [
        noteTopic('Normalizing flows', 'generative-models/normalizing-flows'),
        noteTopic('Change of variables', 'generative-models/normalizing-flows', 'why-substituting-into-the-base-density-is-insufficient'),
        noteTopic('Invertible transformations', 'generative-models/normalizing-flows', 'fix-the-two-directions-first'),
        noteTopic('Flow architectures', 'generative-models/flow-architectures'),
      ] },
      { title: 'Diffusion Models', topics: [
        noteTopic('DDPM: forward process', 'generative-models/diffusion'),
        noteTopic('DDPM: reverse process', 'generative-models/diffusion-reverse'),
        noteTopic('DDPM: ELBO derivation', 'generative-models/diffusion-reverse', 'jensen-gives-an-upper-bound-on-negative-log-likelihood'),
        noteTopic('DDPM: noise prediction', 'generative-models/diffusion-noise-prediction'),
        noteTopic('Sampling', 'generative-models/diffusion-noise-prediction', 'turn-the-prediction-into-a-sampling-step'),
        'Score matching', 'Latent diffusion',
      ] },
      { title: 'Evaluation', topics: [
        noteTopic('Likelihood', 'generative-models/normalizing-flows', 'maximum-likelihood'),
        noteTopic('Inception Score', 'generative-models/inception-score'),
        noteTopic('FID', 'generative-models/fid'),
        noteTopic('LPIPS', 'generative-models/lpips'),
        'Precision / Recall', 'Human evaluation', 'Hallucination analysis',
      ] },
    ],
  },
} as const;
