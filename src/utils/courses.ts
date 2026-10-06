export type CourseKey = 'nlp' | 'generative-models';

export type CourseTopic = string | { title: string; note: string; anchor?: string };

export interface CourseSection {
  title: string;
  /** One line on what the section answers. */
  summary?: string;
  topics: CourseTopic[];
}

export interface Course {
  title: string;
  shortTitle: string;
  description: string;
  /** Short list of what every note provides. */
  tagline: string;
  /** The course storyline as a sequence of stages. */
  progression: string[];
  sections: CourseSection[];
}

// A string is a planned topic. Published topics explicitly name their note and,
// where useful, a section: article titles are not a reliable coverage map.
function noteTopic(title: string, note: string, anchor?: string): CourseTopic {
  return { title, note, anchor };
}

export const courses: Record<CourseKey, Course> = {
  nlp: {
    title: 'Natural Language Processing',
    shortTitle: 'NLP',
    description: 'One path from raw text to modern LLM systems: each method is introduced by the problem the previous one could not solve.',
    tagline: 'Stable URLs · equations · examples · prerequisites',
    progression: ['Text', 'Representations', 'Sequences', 'Transformers', 'Pretraining', 'Adaptation', 'Tasks', 'LLM Systems'],
    sections: [
      { title: 'Text Foundations', summary: 'How text becomes model input, and how a result is measured.', topics: [
        noteTopic('Text as data', 'nlp/text-as-data'),
        noteTopic('Tokenization', 'nlp/tokenization'),
        noteTopic('Byte-pair encoding', 'nlp/tokenization', 'byte-pair-encoding'),
        noteTopic('WordPiece and SentencePiece', 'nlp/tokenization', 'wordpiece-and-sentencepiece'),
        noteTopic('Corpora and evaluation', 'nlp/corpora-and-evaluation'),
      ] },
      { title: 'Classical NLP', summary: 'Counting words is a strong baseline; counting sequences gives the first language model.', topics: [
        noteTopic('Bag of words', 'nlp/bag-of-words-and-tf-idf'),
        noteTopic('TF-IDF', 'nlp/bag-of-words-and-tf-idf', 'tf-idf-reweighting-the-counts'),
        noteTopic('N-gram language models', 'nlp/n-gram-language-models'),
        noteTopic('Perplexity', 'nlp/n-gram-language-models', 'perplexity-from-probability-to-a-number'),
        noteTopic('Smoothing', 'nlp/n-gram-language-models', 'smoothing'),
      ] },
      { title: 'Distributed Representations', summary: 'From one-hot vectors to dense vectors that carry meaning.', topics: [
        noteTopic('Word embeddings', 'nlp/word-embeddings'),
        noteTopic('Word2Vec', 'nlp/word2vec'),
        noteTopic('CBOW and skip-gram', 'nlp/word2vec', 'two-prediction-tasks-cbow-and-skip-gram'),
        noteTopic('Negative sampling', 'nlp/word2vec', 'negative-sampling'),
        'GloVe',
        'FastText',
        noteTopic('From static to contextual embeddings', 'nlp/bert', 'from-static-to-contextual-embeddings'),
      ] },
      { title: 'Neural Sequence Models', summary: 'Models that read a sequence, and the bottleneck that attention removes.', topics: [
        noteTopic('CNNs for text classification', 'nlp/cnn-text-classification'),
        noteTopic('Recurrent neural networks', 'nlp/recurrent-networks'),
        noteTopic('LSTM and GRU', 'nlp/lstm-and-gru'),
        noteTopic('Sequence-to-sequence models', 'nlp/seq2seq'),
        noteTopic('Attention before Transformers', 'nlp/attention-before-transformers'),
      ] },
      { title: 'Transformers', summary: 'Attention as the only mixing operation, and what it takes to make that work.', topics: [
        noteTopic('Self-attention', 'nlp/attention'),
        noteTopic('Multi-head attention', 'nlp/attention', 'multi-head-attention'),
        noteTopic('Transformer architecture', 'nlp/transformers'),
        noteTopic('Positional representations', 'nlp/positional-encoding'),
        noteTopic('Transformer for machine translation', 'nlp/transformer-machine-translation'),
      ] },
      { title: 'Pretrained Language Models', summary: 'Training objectives that turn unlabeled text into reusable models.', topics: [
        noteTopic('BERT and masked language modeling', 'nlp/bert'),
        noteTopic('GPT and autoregressive language modeling', 'nlp/gpt'),
        noteTopic('Decoding strategies', 'nlp/gpt', 'decoding-turning-probabilities-into-text'),
        noteTopic('Encoder, decoder and encoder–decoder models', 'nlp/model-families'),
        noteTopic('Transfer learning in NLP', 'nlp/transfer-learning'),
      ] },
      { title: 'Adaptation and Efficient Models', summary: 'Changing a pretrained model without paying for it twice.', topics: [
        noteTopic('Fine-tuning', 'nlp/fine-tuning'),
        noteTopic('Parameter-efficient fine-tuning', 'nlp/peft'),
        noteTopic('LoRA', 'nlp/peft', 'lora-a-low-rank-update'),
        noteTopic('Instruction tuning and alignment', 'nlp/instruction-tuning'),
        noteTopic('Quantization', 'nlp/quantization'),
        noteTopic('GPTQ', 'nlp/quantization', 'gptq-quantizing-weights-with-calibration-data'),
      ] },
      { title: 'NLP Tasks', summary: 'The same pretrained encoder, a different head for each task.', topics: [
        noteTopic('Text classification', 'nlp/text-classification'),
        'Semantic similarity and sentence pairs',
        noteTopic('Named entity recognition', 'nlp/named-entity-recognition'),
        noteTopic('Question answering', 'nlp/question-answering'),
        noteTopic('Summarization', 'nlp/summarization'),
        noteTopic('Machine translation', 'nlp/transformer-machine-translation'),
      ] },
      { title: 'Modern LLM Systems', summary: 'Systems built around a language model, and how to evaluate the whole system.', topics: [
        noteTopic('Embeddings and semantic search', 'nlp/semantic-search'),
        noteTopic('Retrieval-augmented generation', 'nlp/rag'),
        noteTopic('Tool use', 'nlp/tools-and-agents'),
        noteTopic('Agents', 'nlp/tools-and-agents', 'agents-a-loop-around-tool-calls'),
        noteTopic('LLM evaluation', 'nlp/llm-evaluation'),
      ] },
      { title: 'Advanced Generation', summary: 'Generating text without a left-to-right order.', topics: [
        noteTopic('Non-autoregressive generation and text diffusion', 'nlp/text-diffusion'),
      ] },
    ],
  },
  'generative-models': {
    title: 'Generative Models',
    shortTitle: 'Generative Models',
    description: 'Probability, latent variables and the main families of modern generative models.',
    tagline: 'Stable URLs · equations · examples · prerequisites',
    progression: ['Probability', 'Divergences', 'Autoencoders', 'VAEs', 'GANs', 'Evaluation', 'Flows', 'Diffusion'],
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
};

/** Section title of a note, used to group the course tree. */
export function sectionOf(course: CourseKey, noteId: string): string | undefined {
  return courses[course].sections.find((section) => section.topics.some((topic) => typeof topic !== 'string' && topic.note === noteId))?.title;
}
