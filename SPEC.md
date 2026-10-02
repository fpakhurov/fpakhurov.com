# fpakhurov.com — Personal Website Handout

## 1. Goal

Build a fast, minimal personal website for Fedor Pakhurov.

The website should combine:

* professional profile / personal business card;
* selected AI/ML/LLM projects and case studies;
* CV / experience;
* technical notes;
* two educational collections:

  * NLP;
  * Generative Models.

The site should feel like a personal technical knowledge site, not a generic résumé template.

Primary language: English.
Secondary language: Russian.

Domain:

`https://fpakhurov.com`

---

## 2. Tech stack

Use:

* Astro;
* TypeScript;
* MDX;
* CSS;
* Astro Content Collections;
* KaTeX for math;
* GitHub Actions;
* GitHub Pages.

Avoid:

* Next.js;
* backend;
* database;
* authentication;
* CMS;
* client-side JavaScript unless necessary;
* external analytics initially;
* cookies.

The site should work as a fully static website.

---

## 3. Main information architecture

```text
/
├── /
├── /about
├── /work
├── /projects
├── /notes
├── /cv
├── /contact
├── /notes/nlp
├── /notes/generative-models
└── /ru/...
```

The homepage should contain enough information to understand who Fedor is without opening additional pages.

---

# 4. Homepage

## Hero

Name:

**Fedor Pakhurov**

Suggested positioning:

**AI / ML Engineer focused on LLM systems, agents and applied AI products**

Short description:

Builds applied AI systems around LLMs, retrieval, agents and multimodal models, with a focus on turning prototypes into useful products.

Primary actions:

* Selected Work
* Notes
* CV
* GitHub
* Contact

Do not use oversized marketing language.

---

## Selected highlights

Create compact highlight cards.

### Applied LLM products

Worked on production-oriented NLP and LLM systems, including RAG, agents, multimodal prototypes and internal AI services.

### Multi-agent systems

Designed a multi-agent system for merchant inventory operations.

Agents handled:

* supply;
* transit;
* export;
* coordination.

The system could retrieve context from internal systems, propose operational actions and require explicit confirmation for critical operations.

### Operational AI

Built AI/NLP systems for operational workflows where response times were reduced from minutes to seconds.

### AI transformation

Worked on AI transformation strategy and AI-first architecture:

```text
Paper
→ Digitalization
→ Decision History
→ Business Rules
→ Dataset
→ ML
→ MLOps
→ Infrastructure
→ LLM
→ Agents
```

### Generative Models research

Bachelor thesis:

**Methods of Evaluation of Diffusion Model Hallucinations**

Research included:

* diffusion models;
* complexity–entropy analysis;
* Rényi entropy;
* Bandt–Pompe;
* clustering;
* hallucination severity estimation.

---

# 5. Work page

Route:

`/work`

Use case-study-oriented presentation rather than a chronological résumé dump.

Each case should follow:

```text
Problem
Context
My role
Approach
Architecture
Result
Lessons
```

Initial cases:

## LLM systems / e-commerce operations

Topics:

* RAG;
* LLM agents;
* multimodal systems;
* internal AI products;
* production integration.

## Multi-agent inventory platform

Architecture:

```text
User request
     ↓
Coordinator Agent
     ↓
┌──────────────┬──────────────┬──────────────┐
Supply Agent   Transit Agent  Export Agent
└──────────────┴──────────────┴──────────────┘
     ↓
Internal systems / tools
     ↓
Proposed action
     ↓
User confirmation for critical operations
```

## AI transformation

Show the AI-first maturity chain visually.

Avoid publishing confidential internal information, proprietary metrics, code or architecture details.

---

# 6. Projects

Route:

`/projects`

Projects should be separate from employment history.

Content schema:

```yaml
title:
description:
year:
status:
tags:
github:
demo:
featured:
```

Suggested tags:

```text
LLM
NLP
Agents
RAG
Generative Models
Diffusion
Machine Learning
MLOps
```

Projects can include:

* diffusion-model hallucination research;
* generative-model coursework;
* NLP coursework;
* selected open-source experiments;
* future personal AI projects.

---

# 7. Notes

Route:

`/notes`

Notes are a first-class part of the website.

Top-level collections:

```text
NLP
Generative Models
Other Notes
```

The page should feel closer to technical documentation than a blog.

Do not emphasize publication dates.

Emphasize:

* topic;
* sequence;
* prerequisites;
* navigation;
* mathematical notation.

---

# 8. NLP course

Route:

`/notes/nlp`

Treat it as a structured set of technical notes.

Suggested structure:

```text
NLP
│
├── Foundations
│   ├── Text preprocessing
│   ├── Tokenization
│   ├── Corpora
│   └── Evaluation
│
├── Classical NLP
│   ├── Bag of Words
│   ├── TF-IDF
│   ├── N-grams
│   └── Language models
│
├── Representations
│   ├── Word2Vec
│   ├── GloVe
│   ├── FastText
│   └── Contextual embeddings
│
├── Neural NLP
│   ├── RNN
│   ├── LSTM / GRU
│   ├── Seq2Seq
│   └── Attention
│
├── Transformers
│   ├── Self-attention
│   ├── Transformer architecture
│   ├── BERT
│   ├── GPT
│   └── Encoder / decoder models
│
├── Modern LLM Systems
│   ├── Instruction tuning
│   ├── RAG
│   ├── Tool use
│   ├── Agents
│   └── Evaluation
│
└── Applications
    ├── Classification
    ├── NER
    ├── Search
    ├── QA
    └── Generation
```

This structure can later be adjusted to match the handwritten material.

---

# 9. Generative Models course

Route:

`/notes/generative-models`

Suggested structure:

```text
Generative Models
│
├── Foundations
│   ├── Probability review
│   ├── Maximum likelihood
│   ├── Latent variables
│   └── Divergences
│
├── Autoregressive Models
│   ├── Factorization
│   ├── PixelRNN / PixelCNN
│   └── Autoregressive transformers
│
├── Variational Autoencoders
│   ├── Latent-variable models
│   ├── ELBO
│   ├── Reparameterization trick
│   └── VAE variants
│
├── GANs
│   ├── Adversarial training
│   ├── GAN objective
│   ├── Training instability
│   └── GAN variants
│
├── Normalizing Flows
│   ├── Change of variables
│   ├── Invertible transformations
│   └── Flow architectures
│
├── Diffusion Models
│   ├── Forward process
│   ├── Reverse process
│   ├── DDPM
│   ├── Score matching
│   ├── Sampling
│   └── Latent diffusion
│
└── Evaluation
    ├── Likelihood
    ├── FID
    ├── Precision / Recall
    ├── Human evaluation
    └── Hallucination analysis
```

---

# 10. Course content model

Use Astro Content Collections.

Example structure:

```text
src/content/
├── projects/
├── work/
└── notes/
    ├── nlp/
    │   ├── index.mdx
    │   ├── tokenization.mdx
    │   ├── embeddings.mdx
    │   └── transformers.mdx
    │
    └── generative-models/
        ├── index.mdx
        ├── vae.mdx
        ├── gan.mdx
        └── diffusion.mdx
```

Frontmatter:

```yaml
title: Self-Attention
description: Self-attention mechanism and its role in Transformer models.
course: nlp
section: transformers
order: 4
status: published
tags:
  - attention
  - transformers
```

Statuses:

```text
draft
published
needs-review
```

---

# 11. Note page layout

Desktop:

```text
┌───────────────────────────────────────────────────────┐
│ Header                                                │
├───────────────┬───────────────────────────┬───────────┤
│ Course tree   │ Article                   │ On page   │
│               │                           │ TOC       │
│               │                           │           │
│               │                           │           │
├───────────────┴───────────────────────────┴───────────┤
│ Previous                         Next                │
└───────────────────────────────────────────────────────┘
```

Mobile:

* collapsible course navigation;
* article;
* compact TOC.

Support:

* equations;
* code;
* tables;
* diagrams;
* images;
* footnotes;
* callouts.

---

# 12. Math

Use KaTeX.

Example:

```markdown
$$
\operatorname{Attention}(Q,K,V)
=
\operatorname{softmax}
\left(
\frac{QK^T}{\sqrt{d_k}}
\right)V
$$
```

Math should render server-side/static.

---

# 13. Handwritten notes workflow

The handwritten material should not be directly coupled to the website architecture.

Workflow:

```text
Handwritten notes
      ↓
Scan / photo
      ↓
Transcription
      ↓
Markdown / MDX
      ↓
Technical review
      ↓
Git commit
      ↓
Automatic build
      ↓
fpakhurov.com
```

Store original scans separately:

```text
source-material/
├── nlp/
└── generative-models/
```

Do not publish these directories automatically.

---

# 14. Design

The current direction is **Research studio**: a coherent visual system for applied AI work, research and teaching. This supersedes the earlier serif-led editorial treatment and the blanket prohibition on glass surfaces.

Use balanced neutral gray light-mode surfaces and neutral graphite dark-mode surfaces. Keep the light theme's faint blue wash; in the dark theme, pair blue accents with very quiet warm sand ambient light. The dark page and glass fills have equal RGB channels to prevent a violet or red cast. Navigation and cards use translucent matte frosted fills, fine borders and soft shadows. Cards use 68% fills; floating navigation uses 84% light and 86% dark fills with dedicated readable label colors. Glass has diffuse blur and a subtle edge, without directional reflection gradients. Prose, equations, code and figures stay on unblurred reading surfaces.

Typography:

* system rounded sans for display and section headings, with a system sans fallback;
* comfortable heading line-height around 1.08–1.16;
* 17px sans reading text with 1.75 line-height, 16px on small screens;
* monospace for numbers and code.

Use a shared radius scale: 12px for small elements, 20px for panels, 28px for feature surfaces and 999px for pill controls. Buttons have compact content-sized widths and a 48px target height. Selected work, course cards, project rows, syllabus items, callouts, figures and pagination share this shape and spacing language.

The AI transformation sequence uses one shared systems-chain component on the homepage and work page. Group its existing steps as **Foundation** (Paper, Digitalization, Decision history, Business rules), **Delivery** (Dataset, ML, MLOps, Infrastructure) and **Agency** (LLM, Agents). Preserve sequential arrows and use a vertical flow on mobile.

Keep the site's technical character through clear diagrams, equations and useful hierarchy. Use restrained interaction feedback, visible keyboard focus and opaque surface fallbacks. Support light/dark mode, reduced transparency and reduced motion across the whole system.

The component rules, surface roles and completed validation checks are documented in [the Research studio design system](docs/matte-glass.md). Implementation and visual review should follow that document; completed verification must be recorded separately from the design direction.

---

# 15. Navigation

Desktop:

```text
Fedor Pakhurov

Work
Projects
Notes
About
CV

EN / RU
GitHub
```

Notes should have nested navigation.

---

# 16. CV

Route:

`/cv`

Readable HTML version first.

Later support:

`/cv.pdf`

Sections:

* Summary;
* Experience;
* Education;
* Selected projects;
* Research;
* Technical skills.

Do not make the homepage itself a résumé.

---

# 17. SEO

Implement:

* semantic HTML;
* canonical URLs;
* sitemap.xml;
* robots.txt;
* OpenGraph;
* Twitter/X cards;
* Schema.org Person;
* Article schema for notes where appropriate.

Person structured data should include:

```text
Fedor Pakhurov
fpakhurov.com
GitHub
professional profile links
```

Every note should have a unique title and description.

---

# 18. URLs

URLs must remain stable.

Examples:

```text
/notes/nlp/attention
/notes/nlp/transformers
/notes/generative-models/vae
/notes/generative-models/diffusion
```

Never put dates in note URLs.

---

# 19. Search

Phase 1:

No search required.

Phase 2:

Add static client-side search across:

* note titles;
* headings;
* tags;
* descriptions.

Do not add a hosted search service initially.

---

# 20. Privacy

Initial version:

* no analytics;
* no cookies;
* no trackers;
* no contact form.

Contact through external links / email.

This means no cookie banner should be required for the initial implementation.

---

# 21. Performance

Target:

* static HTML by default;
* minimal JS;
* optimized images;
* local/system fonts where reasonable;
* responsive images;
* lazy loading below the fold.

Target Lighthouse scores should be approximately:

```text
Performance      > 95
Accessibility    > 95
Best Practices   > 95
SEO              > 95
```

---

# 22. Repository

Suggested repository:

```text
fpakhurov.com
```

Suggested project structure:

```text
fpakhurov.com/
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   └── utils/
│
├── astro.config.ts
├── package.json
└── README.md
```

---

# 23. Deployment

Production:

```text
GitHub repository
      ↓
GitHub Actions
      ↓
Astro build
      ↓
GitHub Pages
      ↓
fpakhurov.com
```

Custom domain:

```text
fpakhurov.com
www.fpakhurov.com
```

HTTPS must be enforced.

---

# 24. Initial implementation phases

## Phase 1

Build infrastructure and visual foundation:

* Astro;
* layouts;
* typography;
* header;
* footer;
* responsive design;
* dark mode;
* metadata;
* GitHub Pages deployment.

Create placeholder pages:

```text
/
/work
/projects
/notes
/about
/cv
```

## Phase 2

Implement Notes architecture:

* Astro Content Collections;
* NLP collection;
* Generative Models collection;
* sidebar;
* TOC;
* Previous / Next;
* KaTeX.

Add 2–3 sample notes.

## Phase 3

Populate professional content:

* homepage highlights;
* selected work;
* projects;
* about;
* CV.

## Phase 4

Convert handwritten courses to structured MDX incrementally.

---

# 25. Initial acceptance criteria

The first usable release is complete when:

1. `fpakhurov.com` loads over HTTPS.
2. The site works on desktop and mobile.
3. Homepage clearly communicates Fedor's specialization.
4. Work and Projects pages exist.
5. `/notes/nlp` exists.
6. `/notes/generative-models` exists.
7. At least one real article exists in each course.
8. Equations render correctly.
9. Course navigation works.
10. GitHub push automatically deploys production.
11. No backend or database is required.
12. No cookie banner is present because no tracking is used.

---

# 26. Guiding principle

When deciding between complexity and simplicity:

**choose simplicity.**

The important asset is the content.

The architecture should make it easy to turn:

```text
idea / handwritten note
```

into:

```text
clean, permanent technical page
```

with as little friction as possible.
