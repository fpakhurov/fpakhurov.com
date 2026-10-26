# Changelog

Notable changes to the site, newest first. Each entry gives the date, what changed and why.

## 2026-10-26

- **Pilot of the new note style: two notes rewritten.** "Variational inference" (Bayesian Methods) and "Rolling out models" (MLOps) were each compared, by content, with the matching lectures and chapters of their reference courses, and rewritten in English and Russian under the new writing rules. They are the sample for the owner to approve before the other courses follow.
  - **Variational inference.**
    - Opens with the normal model under independent priors, where the posterior has no closed form.
    - Adds the reading of the bound as data fit minus KL to the prior, why the bound is computable when the evidence is not, fixed-form against free-form families, the Markov blanket, a proper section on the variational mixture of Gaussians, and a table that places the method among exact Bayes, EM and variational EM.
    - Fixes two errors. The support condition on q was stated backwards. The forward and reverse KL optima of a correlated Gaussian coincide for every two-dimensional Gaussian, not because of the example's symmetry.
    - The repeated two-mode experiment and the duplicating summary blocks are gone.
  - **Rolling out models.**
    - Built around one exposure ramp (shadow, canary, a 50/50 experiment in whole weeks, a long-term holdout), with a new figure, and a new team-draft figure.
    - Adds why the experiment splits 50/50 (a 5% share needs 5.3 times the users), triggering through the shadow's disagreement rate, and A/A tests and primacy.
    - Adds a non-inferiority decision for cheaper models. The rollback table had kept the current model on "no significant gain", which is wrong for a quantized model.
    - The sample-size derivation and the peeking demonstration are no longer repeated from the DevOps and Probability notes. The old sample-size figure is replaced, and the note is 18% shorter.

- **Notes read more like a book.** A review of all twelve courses found that the shared template, not the content, made the notes feel generated. This change set fixes what can be fixed across the site at once; the courses will be rewritten one by one after a two-note pilot.
  - **Type and spacing:**
    - running text is set at 17 px with a measure of about 72 characters (it was about 93);
    - paragraphs and list items are spaced apart;
    - display equations no longer sit in boxes, and they are centred on the text;
    - the *Key idea* callout is set in the text colour at full size;
    - figure captions are larger and darker;
    - the closing blocks (what changed, what to remember, next, references) are set smaller and left out of the page outline.
  - **One equation per line:** 575 displays, in both languages, that set two or more equations side by side with `\qquad` are now aligned blocks with one equation per line. On a desktop screen they no longer scroll sideways.
  - **Self-checks removed:** the 296 "Check yourself" blocks are gone from the notes; practice will live on biased.school, and the courses will link to it.
  - **Stale pages:** the home page, About, CV, Projects, the /notes description and the 404 page described two courses taught at HSE and an NLP translation "in preparation". They now describe the twelve courses. The Russian CV again says that the ₽48M effect is an estimate. Course numbers follow the order of study (Probability is 01, MLOps 12).
  - **Russian fixes:**
    - "shrinks by a factor of 1 − ηλ" had been translated as «уменьшается в 1 − ηλ раз», which says the opposite. It is now «умножается на 1 − ηλ», in nine places across ML, DL, Math, Bayes and MLOps.
    - Also fixed: a list of two fixes called «тремя способами», «Самостоятельный метод» for a self-supervised method, «Отжиг динамики Ланжевена», «точность» for accuracy in the NLP introduction, and «алерт» in MLOps.
  - **Course entries:** the AI Agents entry now says that NLP builds on Deep Learning; DevOps says where it uses probability; NLP no longer carries an audit note.
  - **Writing guide:** `docs/course-writing.md` gains the section "Depth and density" and rules for openings, voice ("we" in derivations), optional blocks, display math, paragraph length, captions and descriptions. `words.py` no longer miscounts notes with a dollar sign in code or prose.

- **A new course: MLOps, machine learning in production.** It has 16 notes in six sections, in English and Russian, and covers what it takes to keep a model working after the notebook. It builds on DevOps and Deep Learning.
  - **ML systems:** what MLOps is (the lifecycle loop, hidden technical debt, maturity levels) and ML system design (framing, the metric chain from business to model, batch versus online prediction).
  - **Data:** data pipelines (orchestration, idempotence, backfills), data quality and versioning (validation, lineage, DVC-style snapshots), features and training–serving skew (feature stores, point-in-time joins, leakage through time).
  - **Training:** experiment tracking and the model registry, testing ML systems (data, model and infrastructure tests, the evaluation gate), distributed training (data, tensor and pipeline parallelism, all-reduce, sharding, the pipeline bubble).
  - **Serving:** serving models (latency, throughput, dynamic batching, what GPU utilization means), LLM inference systems (prefill and decode, the KV cache, continuous batching, speculative decoding), rolling out models (shadow, canary, A/B tests and their sample sizes).
  - **Operations:** monitoring and drift (PSI and KS and how both depend on the window), continual learning (retraining triggers, feedback loops, forgetting), LLMOps (prompts as code, traces, evaluation in production).
  - **Responsibility and cost:** responsible ML (fairness metrics and their conflicts, privacy, model cards) and cost and efficiency (MFU, the cost of a token, the Pareto front of quality and price).

  Scope draws on two HSE courses («Введение в MLOps» and «Эффективные системы глубинного обучения»), the HSE course on LLM systems engineering, CMU's Machine Learning in Production and Stanford's CS329S with Chip Huyen's book. Mixed precision, compression, quantization, agent evaluation and A/B statistics are linked to the courses that already explain them, not repeated. The site holds the notes only; each note ends with an Example. Python examples were run on 3.14.7 with NumPy, pandas and scikit-learn and show their real output; serving, orchestration and cluster configurations are marked as not executed. 24 figures.
  - **Course graph:** an edge in the lane between the columns now keeps a few pixels toward the column it points to, so two lane edges no longer draw on top of each other.

## 2026-10-23

- **A new course: DevOps.** It has 16 notes in five sections, in English and Russian, and covers how software gets from a commit to a reliable service. It builds on Computer Architecture and Operating Systems and on Python.
  - **Foundations:** what DevOps is (the value stream, Little's law, the DORA metrics, why small batches lower risk), the shell and text tools, Git as an object graph and its workflows.
  - **Build and ship:** builds as dependency graphs and reproducible builds, container images (the OCI layout, layer caching, multi-stage builds, digests), continuous integration, and continuous delivery with deployment strategies, canary statistics and expand/contract migrations.
  - **Infrastructure:** the path of an HTTPS request through DNS, TLS, proxies and load balancers; infrastructure as code with OpenTofu/Terraform; cloud building blocks.
  - **Orchestration:** Kubernetes as reconciliation, and Kubernetes in practice.
  - **Reliability:** observability, SLOs and burn-rate alerting, resilience and capacity (retries, backoff, Little's law, the utilization curve), incidents and operational security.

  Scope draws on two HSE courses («Инструменты промышленной разработки» and DevOps), MIT's Missing Semester, Helsinki's DevOps with Docker and Kubernetes, and Google's SRE books. The site holds the notes only; each note ends with an Example, one realistic artifact read line by line. Shell, Git and make sessions were run and show real output; container, Kubernetes, Terraform and CI configurations were validated against their schemas and are marked as not executed. 24 figures.
  - **Course graph:** on phones, an edge that skips rows now runs down the lane between the two columns instead of through the cards between.
  - **Parity script:** `ru_parity.py` no longer reads a `$` inside inline code as math.

- **NLP figures: five labels fixed.** In the ROUGE overlap figure, the score header ran past the right edge. On phones:
  - the byte row in "From bytes to cleaned units" ran past the edge;
  - the rotated tokens in the BPE compression chart overlapped each other and the row above;
  - the "one row per token" label in the embedding lookup ran past the edge;
  - the Russian «B = 0 в начале» note beside LoRA's B ran past the edge.

  The byte-row figure now checks at build time that every row fits.

## 2026-10-22

- **A new course: Programming in Python.** It has 22 notes in six sections, in English and Russian, and goes from the first line of code to how CPython runs it. It is a starting course, and Machine Learning now builds on it with Probability and Mathematics.
  - **Getting started:** running Python, values and names, control flow, functions, strings and Unicode.
  - **Data structures:** lists and tuples, dictionaries and sets, iteration and generators, files and exceptions.
  - **Abstraction:** classes and the MRO, the data model, closures and decorators, modules, packages and environments, type hints.
  - **Reliable code:** testing with pytest, debugging and profiling.
  - **Under the hood:** how CPython runs code (bytecode, the specializing interpreter, reference counting and the GC, the JIT), writing fast Python, concurrency with threads, processes and asyncio, with and without the GIL.
  - **Scientific Python:** NumPy arrays, pandas data frames, Matplotlib.

  Every example and Code section was run on Python 3.14.7 and shows its real output; 3.15, released in October 2026, is noted where it differs. Timings are measured on one machine and say so, including the same thread benchmark on the default and the free-threaded build. The "Python basics" prerequisite across the site now links here instead of the official tutorial.
  - **Figures:** 42, computed at build time.

  Why: every course assumed basic Python and pointed to an external tutorial.

- **Header mark matches the favicon.** The FP badge in the header now draws the favicon's letter outlines in its exact colours (#365DC2 on #ECEEF5, #A5BAFF on #212124 in dark), instead of system-font text in the navigation blue.

- **Site icons.** A new FP favicon drawn from the site's own type and accent colour, in light and dark versions that follow the browser theme: an adaptive SVG, PNG and ICO fallbacks, an Apple touch icon, a web manifest with 192 and 512 px icons, and theme-colour tags. The social card at `/og.png` is replaced by the matching one, at 80 KB instead of 1 MB.

- **Cross-course audit.** All nine courses were read against each other after four new courses arrived in two days. Notes now link to where a topic is developed in full: Mathematics for linear algebra, matrix calculus, convexity and duality; Bayesian Methods for VI, Gibbs and evidence; AI Agents for RL, RLHF/GRPO and evaluation; ACOS for floating point. Stale statements and course-page texts were updated, two external prerequisite links now point to site notes, a gradient-descent bound now matches its proof, and a misattributed RLHF result is corrected. In the Russian notes, "policy" is «стратегия» and "alignment" is «выравнивание» throughout, now in the glossary.

- **A new course: Mathematics for Machine Learning.** It has 15 notes in four sections, in English and Russian. It is a starting course next to Probability, and Machine Learning now builds on both.
  - **Linear algebra:** vectors, spaces and linear maps; matrices and linear systems with LU; inner products, norms and orthogonality with QR; determinants and eigenvalues; symmetric matrices and quadratic forms; the singular value decomposition.
  - **Calculus:** derivatives and Taylor series, gradients, Jacobians and Hessians, matrix calculus by the differential method, multiple integrals and change of variables.
  - **Optimization:** convex sets and functions, unconstrained optimization (gradient descent rates, Newton, BFGS), Lagrange multipliers and KKT conditions, duality.
  - **Numerical computation:** conditioning and numerical stability.

  Scope follows Deisenroth, Faisal and Ong's *Mathematics for Machine Learning*. It is cited alongside Strang, Axler, Boyd–Vandenberghe, Nocedal–Wright and Trefethen–Bau, not copied. Derivations go step by step, and every Code section checks the note's results numerically in NumPy.
  - **Figures:** 29, computed at build time.
  - **Prerequisites:** "Linear algebra", "Calculus" and "Determinants" now link to these notes instead of the external book.
  - **Course graph:** cards in the same column no longer overlap. A card now moves below the one above it, and on phones a row holds either one centre card or side cards only. This also fixes the NLP, AI Agents and Computer Architecture cards, which overlapped since the last release.
  - **Build:** the build gets a 4 GB Node heap. With every course the bundling step had outgrown the 2 GB default on an 8 GB machine.

  Why: the ML, Deep Learning and Bayes notes assumed linear algebra, calculus and optimization that were only linked to a book.
- **A new course: AI Agents.** It has 27 notes in seven sections, in English and Russian, and runs from the classical agent to current language-model agents. It comes after the NLP course.
  - **Agents and environments:** what an agent is, search and planning (A*, STRIPS/PDDL), Markov decision processes, games and Monte Carlo tree search.
  - **Reinforcement learning:** Q-learning and TD, deep Q-networks, policy gradients and actor-critic up to PPO, model-based RL.
  - **Language models as agents:** the model as a policy, chain of thought, tool use and function calling with constrained decoding, ReAct and the agent loop.
  - **Memory, planning and reflection:** context and memory, planning with language models, reflection and self-correction, workflows, frameworks and the Model Context Protocol (revision 2026-07-28).
  - **Agents at work:** coding, web and computer-use, research and multi-agent systems.
  - **Training agents:** RL for language models (RLHF, GRPO, verifiable rewards), reasoning models and test-time compute, multi-turn agentic RL.
  - **Evaluation and safety:** evaluating agents (pass@k, pass^k, time horizons), agent security and prompt injection, alignment and oversight, open problems.

  Scope draws on Russell–Norvig, Sutton–Barto, the Berkeley agent courses and the primary papers. Scores are given with their date and setup.
  - **Code:** every Code section runs offline in Python and NumPy; where a language model would be called, a small scripted stand-in takes its place.
  - **Figures:** 69, computed at build time.
  - **Flow diagrams:** a box label with a subscript now gets 2 px more room above its second line, in every course.

  Why: agents are where the NLP course's tools-and-agents note leads, and the subject needs reinforcement learning, which no course covered.

- **A new course: Bayesian Methods in Machine Learning.** It has 15 notes in five sections, in English and Russian, and sits between Machine Learning and Generative Models.
  - **Bayesian modelling:** the Bayesian approach, conjugate priors and the exponential family, Bayesian model selection.
  - **Bayesian linear models:** Bayesian linear regression, the relevance vector machine, the Laplace approximation and Bayesian classification.
  - **Latent variables and approximate inference:** EM and Bayesian PCA, variational inference, Gibbs sampling.
  - **Nonparametric models:** Gaussian processes, Dirichlet processes, latent Dirichlet allocation.
  - **Scalable inference:** stochastic variational inference, black-box variational inference and the VAE, Bayesian deep learning.

  The scope follows the course of D. P. Vetrov and D. A. Kropotov (2015). It is cited, not copied, alongside Bishop, Murphy, MacKay, Barber, Rasmussen–Williams and the primary papers.
  - **Code:** every Code section is NumPy or SciPy that runs on a laptop in under a minute, and its printed numbers match the text. Experiments report what they found, including a collapsed Gibbs sampler that gets stuck, variational LDA missing topics from some starts, and Bayesian networks that stay overconfident far from the data.
  - **Figures:** 34, computed at build time.
  - **Course graph:** Generative Models now builds on both Deep Learning and Bayesian Methods.

  Why: the Generative Models course leans on evidence, variational inference and sampling. The HSE curriculum teaches them in a Bayesian methods course before generative models.

- **Generative Models: the training background note is slimmed.** Batch normalization, the signal-scale argument, convolution shapes and the training routine now live in the Deep Learning course. The note keeps what Generative Models needs on its own (instance normalization, the one-unit gradient derivation, a convolution layer's fan-in), and the ML and Deep Learning notes link the Deep Learning course for the rest.

- **A new course: Deep Learning.** It has 14 notes in four sections, in English and Russian, and sits between Machine Learning and the Generative Models and NLP courses.
  - **Training neural networks:**
    - what deep learning is;
    - PyTorch and automatic differentiation, with a scalar autograd built from scratch;
    - losses and regularization;
    - normalization and initialization;
    - optimizing deep networks: schedules and warm-up, AdamW, SAM, mixed precision.
  - **Convolutional networks:** convolution, the architectures from LeNet to EfficientNet, object detection, semantic segmentation.
  - **Representations and vision transformers:** self-supervised learning, Vision Transformers.
  - **Robustness and deployment:** adversarial examples, model compression, training networks in practice.

  The scope follows the HSE course "Глубинное обучение 1". It is cited, not copied. Topics that the other courses already develop are linked rather than repeated: sequences and Transformers for text are in NLP, and GANs, VAEs and diffusion are in Generative Models.
  - **Code:** every Code section is PyTorch that runs on a laptop CPU in under a minute, and its printed numbers match the text. Several notes run small experiments: degradation without residual connections, warm-up rescuing a post-norm network, U-Net skips and boundaries, a SimCLR linear probe, and distillation transferring an unseen class.
  - **Figures:** 49, computed at build time.
  - **Course graph:** it now reads Probability → Machine Learning → Deep Learning → Generative Models and NLP, with Computer Architecture and Operating Systems apart. Long course titles wrap in the wide layout too.

  Why: the Generative Models and NLP courses had to explain convolutions, normalization and training on the side. The HSE curriculum has a deep learning course between machine learning and both of them.


- **A new course: Computer Architecture and Operating Systems.** 32 notes in ten sections, in English and Russian, tell how a computer runs a program, from the bits of a number to a process talking over the network:
  - **Foundations:** what a computer system is, bits, integers and byte order, floating point.
  - **RISC-V assembly:** the instruction set, encoding, branches and memory, procedures and the stack.
  - **Memory hierarchy:** caches and virtual memory.
  - **Inside the processor:** the pipelined datapath, exceptions and interrupts, input and output.
  - **Parallelism and performance:** instruction-, thread- and data-level parallelism, making programs fast, and domain-specific architectures with the TPU.
  - **The operating system:** C for systems programming, system calls, linking and loading, dynamic memory allocation.
  - **Processes and concurrency:** processes and threads, synchronization, inter-process communication.
  - **Files, users and isolation:** files and I/O, permissions, virtual machines and containers.
  - **Networking:** computer networks and sockets.
  - **Languages and compilers:** language runtimes and LLVM.

  The scope and order follow A. Tatarnikov's HSE course "Computer Architecture and Operating Systems". Patterson and Hennessy, Harris and Harris, CS:APP, OSTEP and *The Linux Programming Interface* are cited section by section. The text, examples, figures and code are the site's own.

  66 figures are computed at build time; most mechanism figures step through numbered stages. Every Code section runs as written:
  - RISC-V assembly in RARS syntax, checked with an RV32IM interpreter;
  - C compiled and run on macOS;
  - the Linux-only examples (POSIX message queues, `strace`, `LD_DEBUG`, `LD_PRELOAD`, an `epoll` server, namespaces and cgroups) run in a Debian 13 container;
  - the raw-`ecall` RISC-V program under `qemu-riscv64`.

  Excerpts that need a RISC-V machine or RARS itself (CSRs, atomics, the vector extension) are labelled as not run. The course stands on its own on the course graph and links to the other courses where they meet: floating point to quantization, caches to FlashAttention, the TPU to neural networks.

  Why: the site covered the mathematics and models but not the machine they run on, and the HSE curriculum puts this course alongside the others.

## 2026-10-21

- **NLP: how a large language model is built, adapted and run.** The NLP course goes from 37 to 41 notes. Its second half is reordered, so that a reader first sees how an LLM is built, then how it is adapted and turned into an assistant, then how it is run cheaply.
  - **New notes**, in English and Russian:
    - *Evolution of pretrained models*: RoBERTa, ELECTRA, GPT-2 and ModernBERT, separating changes to the architecture, the objective, the training procedure and data, and the implementation.
    - *Scaling laws and compute-optimal training*:
      - Kaplan and Chinchilla, with a step-by-step budget split;
      - Gopher and Chinchilla on the same budget;
      - why compute-optimal is not inference-optimal;
      - why there is no strict line between a language model and a large one.
    - *Pretraining data for large language models*: the pipeline from crawl to batches, with filtering, exact and MinHash deduplication, decontamination against evaluation sets, safety filtering and data mixtures.
    - *Efficient Transformers: FlashAttention and mixture of experts*:
      - memory traffic and online softmax, with a check in code that tiled attention equals the standard one;
      - routing, total against active parameters, load balancing;
      - a table of the modern Transformer block.
  - **New order of sections:** Pretrained Language Models → Scaling and LLM Pretraining → Modern Transformer Architectures → Adapting Pretrained Models → NLP Tasks → LLM Post-training → Efficient Inference → Modern LLM Systems → Advanced Generation. The tasks now come after the adaptation notes they build on. The hand-overs, the plan in the opening note, its course figure and the course page follow the new order.
  - **Existing notes, extended without rewriting:**
    - *Transformer Architecture*: RMSNorm and a table comparing the original and the modern Transformer.
    - *Positional representations*: a figure and a worked example of why RoPE scores depend only on the offset.
    - *GPT*: from GPT-1 to GPT-3, and temperature, top-k and top-p side by side.
    - *Model families*: one central comparison table.
    - *Transfer learning* and *Fine-tuning*: one backbone with different heads, and task fine-tuning against instruction tuning.
    - *Instruction tuning*:
      - the stages of LLM training;
      - an SFT example with its loss mask;
      - the sources, quality and diversity of SFT data;
      - what preference optimization is for.
    - *Quantization*: memory, latency and throughput of generation.
    - Among the earlier notes:
      - *Bag of words*: when TF-IDF with a linear model is the right final choice;
      - *N-gram models*: when two perplexities can be compared;
      - *Word embeddings*: intrinsic and extrinsic evaluation of embeddings;
      - *Word2Vec*: why both Word2Vec tasks give useful vectors;
      - *Transformer for translation*: the roles of encoder and decoder;
      - *NER*: token against sequence classification;
      - *Question answering*: extractive against generative QA.

  Eight NLP figures had labels that overlapped or ran past the frame, among them the ELECTRA, iso-FLOP, mixture-of-experts, generation-loop, alignment and quantization figures; fixed and checked in both languages at desktop and phone widths.

  Why: the course jumped from GPT to fine-tuning, so how models grew, what their data is, and what makes them affordable to train and run were mentioned in passing or missing.

## 2026-10-17

- **Figure labels that overlapped or ran past the frame.** A check of every label's box against its neighbours and the drawing's edge, in English and Russian at desktop and phone widths, found defects in nine older figures:
  - **GANs:** the schematic, the saturating-loss plot and the least-squares pull;
  - **Human evaluation:** the Elo curve;
  - **VAE:** reparameterization, and the latent-space panel in Russian;
  - **Transfer learning:** the three-routes bar chart;
  - **Word2vec:** the noise distribution and negative sampling.

  The fixes move or shorten labels, give axes a little more room and split one long Russian label. The GAN pointwise-maximum plot also gains a phone layout, so its tick labels no longer shrink below 9 px. The step badges in the LSTM and self-attention flows, which an audit had flagged as small, measure 9–9.3 px inside their circles and stay as they are.

  Why: the audit-fix pass found these with its overlap check; they predate it.

- **All four courses: corrections from an external audit.** An external review of the live site (16 October 2026) logged 295 findings across Probability Theory, Machine Learning, Generative Models and NLP: 28 of priority 1, 195 of priority 2 and 72 of priority 3. Each finding was checked against the current text before it was acted on:
  - 267 were fixed;
  - 18 were partly fixed (usually a reading route or an optional-depth mark where the audit proposed splitting a note);
  - 10 were rejected as already fixed, out of date, or contradicted by the glossary.

  Every change is made in English and Russian.
  - **Claims that outran their assumptions**, corrected with a small calculation where one helps:
    - diffusion is no longer called MCMC in disguise; equilibrium Langevin, annealed Langevin and reverse diffusion are told apart;
    - the prior-odds correction states the label-shift assumption, with a counterexample;
    - squared loss targets the conditional mean without Gaussian noise;
    - precision and recall denominators are corrected;
    - the RankNet and GPTQ signs are fixed, each with a numeric check;
    - the self-attention example now shows that softmax weights are not symmetric (0.307 against 0.274);
    - the Transformer note no longer calls the feed-forward network the only nonlinearity;
    - the DDPM bound is written as NLL = bound − gap, with an example where the bound falls and the NLL rises;
    - classifier-free guidance is described as a guided score at each noise level, not sampling from a tilted distribution; DDPM and DDIM are computed to end at different places;
    - exact Gaussian supports are all of space, so the support-based precision and recall of Gaussians are both 1;
    - affine coupling flows cite the published universality result;
    - straight-through gradients are a surrogate, never exact;
    - SFT can lower the probability of alternatives;
    - text diffusion's 1/t weight emphasizes lightly masked steps.
  - **Evidence:**
    - the NLP results table records the split, training size and selection protocol of every number and no longer reads as a leaderboard;
    - test-informed choices (a label word, an epoch) are labelled optimistic;
    - the 0.342/0.253 BLEU gap between two greedy decoders is reported as unresolved;
    - human–human agreement is no longer called a ceiling for a judge;
    - the LPIPS notebook ranking is labelled a diagnostic of an input bug.
  - **Course pages:**
    - each course page opens with what to know before starting and links to the notes that map the course;
    - every section states what a reader can do after it;
    - Generative Models marks its architecture and application branches as Extension;
    - the NLP stage strip names all ten sections;
    - the course descriptions and the notes index no longer claim that every method answers the failure of the one before.
  - **Proof detours** inside notes (the Vitali set, characteristic-function proofs, Borel–Cantelli, approximation theorems, VAPNEV and others) are marked as optional depth. Two Generative Models notes gained a self-check.
  - **Layout:**
    - three NLP comparison tables that a `|` inside math had broken are repaired;
    - long inline code wraps instead of widening the page on phones;
    - wide equations show a shadow where they scroll;
    - phones get a collapsible "On this page" outline;
    - the course graph switches to its stacked layout at tablet width;
    - an empty prerequisites panel is no longer shown;
    - BERT's breadcrumb names its own section.

  Why: an external audit found claims that were wrong or overstated, comparisons that did not share a protocol, and places where readers could not tell the main route from the detours.

## 2026-10-16

- **Generative Models: the main GAN variants.** Three new notes, in English and Russian, cover the GAN architectures the course had only mentioned in passing:
  - *Scaling GANs: progressive growing, self-attention and BigGAN*: ProGAN, SAGAN with a step-through self-attention block, BigGAN with class conditioning, orthogonal regularization and the truncation trick.
  - *StyleGAN: a style-based generator*: InfoGAN as the first attempt at control, then StyleGAN (mapping network, W space, AdaIN styles, noise, style mixing, perceptual path length), StyleGAN2 (weight demodulation, derived and computed; path-length regularization) and StyleGAN3.
  - *Beyond CycleGAN: multimodal, contrastive and semantic image synthesis*: MUNIT, CUT, pix2pixHD and SPADE, and SRGAN and ESRGAN, with a proof that a perfect sampler has twice the squared error of the blurry mean.

  The GAN section now reads WGAN → scaling → StyleGAN → α-GAN → CycleGAN → StarGAN → beyond CycleGAN. The figures in the papers cannot be republished (arXiv's default licence), so every GAN note gains a "Where to see the images" section. It lists the figure numbers in each paper and the official project pages, each checked against the paper. Two figures of the sampling section had labels running past the frame at some widths; fixed.

  Why: a reader compared the course with a list of GAN variants and found StyleGAN, BigGAN and the newer image-translation models missing.

- **Generative Models: how a computer samples, written out step by step.** The sampling section of *What generative modeling is* was too compressed: it did not say where the computer's random numbers come from, and the move from uniform numbers to other distributions skipped steps. Each of the five steps now gives the idea, the key formula in a frame, why it works, and the same step in a few lines of code that run as written.
  - **Where the numbers come from:** physical noise against pseudo-random generators, a 16-state toy generator worked through number by number, what real generators (PCG64, the Mersenne Twister, Philox) change, how a 64-bit integer becomes a number in [0, 1), and the seed.
  - **Inverse transform sampling:** built up from a discrete example (cutting [0, 1) into pieces) to the continuous case, with the three-line proof and the exponential distribution solved step by step.
  - **Box–Muller:** in four numbered steps with a worked example.
  - Three new figures, one of them step-through, and a column in the families table on how each model draws a sample.

  Why: a reader asked where the numbers come from and found the transition from uniform to other distributions hard to follow.

- **Machine Learning: the course written.** Every topic of the course map is now a note, in English and Russian: 27 notes in seven sections.
  - *The Learning Problem*: what machine learning is, data, features and leakage, validation and overfitting, nearest neighbours.
  - *Linear Regression*: least squares, gradient descent, stochastic and adaptive optimizers, regularization.
  - *Linear Classification*: linear classifiers and surrogate losses, logistic regression, classification metrics, support vector machines, kernels, multiclass and multilabel classification.
  - *Trees and Ensembles*: decision trees, the bias–variance decomposition, bagging and random forests, gradient boosting with stacking.
  - *Neural Networks*: from linear models to networks, backpropagation, training deep networks.
  - *Learning Without Labels*: clustering, mixtures and the EM algorithm, dimensionality reduction, anomaly detection.
  - *Beyond Classification*: learning to rank, recommender systems.

  The scope and order follow the HSE course "Машинное обучение" (E. Sokolov), whose lecture notes the notes cite; the text, figures, examples and code are the site's own.

  The course is written as the bridge between the others. Each method links back to the probability result it rests on (losses as likelihoods, regularization as a prior, validation error bars from the limit theorems, the best predictor as a conditional expectation). It also points forward to where NLP and Generative Models use it: logistic regression and softmax in text classifiers and language models, backpropagation in recurrent networks, EM in the VAE, PCA in autoencoders, k-means in VQ codebooks, kernels in KID, ranking in retrieval. The opening note draws this bridge as a figure.

  Each note ends with a Code section that runs as written, on synthetic data or scikit-learn's bundled datasets, and its printed numbers match the text. About 50 figures are computed at build time and assert their numbers. The prerequisites "Logistic regression", "Gradient descent", "Neural networks" and "Backpropagation" in the other courses now link to these notes instead of external textbooks.

  Why: the course map was all planned topics, and the course graph runs through it from Probability Theory to NLP and Generative Models.

## 2026-10-15

- **Generative Models: everything in the course notebooks is now on the site.** Every seminar and homework notebook of the HSE *Deep Generative Models* course (`spring-2025-long`) was checked cell by cell against the notes. Seven new notes, in English and Russian, cover the notebooks that had no note:
  - *Autoencoding GANs: adversarial autoencoders and α-GAN*: the code discriminator, α-GAN's four losses, α-WGAN with two critics, and lerp against slerp in a computed figure.
  - *CycleGAN: unpaired image-to-image translation*: pix2pix, why an adversarial loss alone does not tie an output to its input (a one-dimensional figure), cycle and identity losses as a step-through diagram, the ResNet generator and the 70×70 PatchGAN (11.38M and 2.76M parameters, receptive field 70), the training recipe and the failure modes.
  - *StarGAN: one generator for many domains*: StarGAN v1 and v2 with step-through diagrams, and the StarGAN homework.
  - *Sampling unnormalized densities: MALA, Hamiltonian Monte Carlo and NUTS*: computed comparisons of the samplers on a narrow Gaussian and of leapfrog against Euler.
  - *Energy-based models*: the likelihood gradient, contrastive divergence with a replay buffer, the short-chain bias in a computed figure, NCE, JEM and out-of-distribution detection.
  - *Point-based image editing: DragGAN and DragDiffusion*: StyleGAN2 and GAN inversion, motion supervision and point tracking on a computed toy.
  - *Audio generation: text-to-speech and music*: Glow-TTS with monotonic alignment search, EnCodec and residual vector quantization, and MusicGen's codebook interleaving.

  The course map gains two sections, Energy-Based Models and Audio Generation. The overview counts six families of models, and the closing paragraph of the course moves to the audio note. Gaps found in the existing notes are filled:
  - **GANs:** the GAN practice the notebooks teach (DCGAN rules, update ratios, label smoothing, mode-collapse remedies, the f-GAN table, the least-squares GAN).
  - **FID:** KID, and FID with a custom encoder (homework 1).
  - **Training background:** instance normalization.
  - **VAE:** the conditional VAE and VAPNEV (homework 3).
  - **Flows:** neural spline flows, ActNorm, flows on images and bits per dimension.
  - **Diffusion:** the denoising U-Net and its timestep embedding, noise schedules, EMA, and DDIM and DPM-Solver (homework 4).
  - **NLP:** the LLM seminar and the RAG homework (homework 5), in the RAG, semantic-search, agents, tokenization and fine-tuning notes.
  - **Notebook sections:** the saved results, settings and issues of each notebook.

  Why: the notes are the course's official notes, and several notebooks and all five homeworks had no counterpart on the site.

- **Probability Theory: the course written.** Every topic of the course map is now a note, in English and Russian: 22 notes in six sections. *Foundations*: what probability is (three readings, the base-rate, birthday, Simpson and averaging examples, the plan of the course), outcomes, events and counting (the four ways to choose k of n with a figure of all four on one grid), Kolmogorov's axioms (inclusion–exclusion as a step-through figure, the union bound and Bonferroni, why not every set is an event, Bertrand's three chords), conditional probability and Bayes' formula (the odds form with a step-through log-odds ladder, Monty Hall, independence of several events and conditional independence, the Sally Clark case). *Random variables*: discrete distributions (the Poisson limit of the binomial, Bortkiewicz's horse kicks), continuous distributions (densities, quantiles, the exponential as the continuous geometric, the normal), functions of random variables (the change-of-variables formula as a step-through figure, inverse transform sampling, one-dimensional flows), expectation and variance (linearity and indicators with the coupon collector as a step-through figure, Jensen, the 1/√n rule, moment and characteristic functions). *Several random variables*: joint distributions (a joint table stepped from cells to margins to a conditional, correlation that misses dependence, the variance of an average of correlated estimates), the multivariate Gaussian (covariance as an ellipse, conditioning as a step-through figure, the high-dimensional shell), conditional expectation (the best predictor, the law of total variance, which loss targets which summary). *Limit theorems*: inequalities and concentration (Markov, Chebyshev, Hoeffding against the exact tail, a first generalization bound and the selection effect on a validation set), the law of large numbers (weak and strong, Borel–Cantelli, Monte Carlo), the central limit theorem (why the normal, error bars, Berry–Esseen, the four modes of convergence). *From probability to statistics*: estimators (bias, variance, MSE, the bias–variance trade-off of polynomial fits), maximum likelihood (losses as negative log-likelihoods, Fisher information), Bayesian inference (beta–binomial updates as a step-through figure, shrinkage, ridge and lasso as MAP estimates), confidence intervals and the bootstrap (coverage, Wald against Wilson, a step-through bootstrap, paired comparison of two models), hypothesis tests and A/B testing (p-values, power and sample size as a step-through figure, peeking, multiple comparisons, permutation tests). *Random processes and sampling*: Markov chains (a step-through weather chain, PageRank, the gambler's ruin), Monte Carlo methods (rejection sampling as a step-through figure, importance sampling for a rare event, control variates), and Markov chain Monte Carlo (Metropolis–Hastings and its step size, a chain stuck in one mode, the Gibbs zigzag, Langevin dynamics and the bridge to diffusion models). 45 new figures; those that show numbers compute them from the formulas or from seeded simulations when the site is built and fail the build if a number drifts from the text; the numbers of the worked examples are printed by the code at the end of each note, which was run as written. The Russian translations were read critically, and several dozen imprecise or overstated sentences of the English were corrected on the way. The prerequisites "Probability", "Basic probability", "Conditional probability" and "Expectation" of the other courses now link to these notes instead of a textbook, and the Russian glossary gains a probability and statistics section. Smaller changes: the step-through bar says «3 шага», not «3 шагов»; Russian formulas separate thousands with a thin space instead of a comma. Why: the course map promised the course, and the other three courses list probability as what to know first.
- **NLP: the planned chapters written.** *GloVe: embeddings from global co-occurrence counts* (the probability-ratio argument with the paper's ice/steam table and a tea/coffee table counted on the course's 537,272 Quora questions, the weighted least-squares loss with a worked term, a GloVe implementation trained on the same questions next to Word2Vec, and what GloVe and skip-gram share), *FastText: word vectors from character n-grams* (n-grams of length 3 to 6 with a step-through figure, hashing into two million buckets, vectors for unseen words with the cases that work and a transposition that does not, how subwords change neighbours, and the fastText classifier re-implemented on the course's AG News split: 0.914 with words and 0.922 with bigrams, against the paper's 91.5 and 92.5), and *Semantic similarity and sentence pairs* (STS, paraphrase and NLI, why averaged word vectors call *lose weight* and *gain weight* near duplicates, Spearman correlation with a worked example, and cross-encoders against Sentence-BERT bi-encoders with the paper's accuracy and cost). Every number either comes from the paper cited next to it or from the code printed in the note, run on the course's own data files; no course notebook covers these topics. The course map lists all three, the Word2Vec and classification notes hand over to them, and the closing note no longer mentions planned topics. Why: the course map promised these topics.
- **Course pages count notes, not sections.** The line under each section of a course page counted every listed topic, including the anchored sections of a note; it now counts notes only ("4 of 4 notes published"). Why: a section of a note is not a separate article.
- **NLP: step-through diagrams from RNN to Transformer.** The six sequence-model notes (RNN, LSTM, seq2seq, attention, self-attention, Transformer) get "what goes where" diagrams in one visual language: every vector drawn with its values, inputs in green, states in blue, weights and gates in amber, outputs in red, and an amber outline around what each model adds to the previous one. Each diagram runs the note's own worked example and has numbered steps that match a numbered list printed right after it, and buttons under the figure (or a swipe on a phone) step through it one step at a time; without JavaScript the whole figure is shown. The Transformer note ends its comparison with a six-panel summary of the whole path. The new diagrams replace the old LSTM, encoder–decoder and attention-step figures. Smaller fixes on the way: the LSTM example's $\tanh(2.948)$ is 0.9945, not 0.994; two Russian figure labels in the self-attention note were shortened to fit. The kit (`src/components/figures/seqflow/`) is described in `docs/course-writing.md`. Why: the figures did not make the data flow visible, and the continuity between the models was in the text only.
- **NLP: every note stands on its own.** Links to notebooks, cell numbers, what a notebook prints and its implementation issues now appear only in each note's Notebook section, the practice part at the end, in all 34 notes in English and Russian, and in figure captions. Numbers from saved runs stay in the articles as self-contained results, with the setup described in the article's own words. Two headings that named the notebook were renamed with their links (*What a small model learns from Quora questions* in Word2Vec, *Three runs of a small code agent* in tools and agents); the RAG note now says that the recipe it quotes comes from an example written into a markdown cell, not from a saved output; the introduction says that every note ends with a practice section. The rule is in `docs/course-writing.md`. Why: notebook remarks scattered through the text pulled readers away from the article.

## 2026-10-14

- **Generative Models and NLP: the planned chapters written.** Topics that the course maps listed as planned become notes, in English and Russian, with figures computed from their formulas. So far: *VAE variants: β-VAE and VQ-VAE* (the β-weighted objective as a point on the rate–distortion curve, with a one-dimensional example solved in closed form; vector quantization, the straight-through estimator, the codebook and commitment terms and the EMA codebook as online k-means; VQ-VAE-2 with its two code grids and autoregressive priors, following the course notebook), *Precision and recall for generative models* (why one number cannot tell a collapsed model from a spread-out one: two Gaussians with the same FID of 0.98; the PRD curve; k-nearest-neighbour precision and recall with a one-dimensional example in which one outlier lifts recall from 2/4 to 4/4; density and coverage; a seeded simulation computed when the site is built, so text, table and figure share their numbers), *Human evaluation of generative models* (real-or-generated tests and the HYPE protocol, the Wilson interval and how many judgements a comparison needs, pairwise preferences with Bradley–Terry and Elo, absolute ratings, prompt alignment, and a checklist for reliable studies), *Score matching and Langevin dynamics* (Hyvärinen's integration by parts with a Gaussian example that recovers the sample mean and variance, sliced and denoising score matching, Langevin dynamics and its discretization bias, a seeded simulation in which plain Langevin finds the wrong mode weights and annealing over noise levels recovers them, and the identity that makes DDPM's noise predictor a score; the DDPM note now hands over to it instead of closing the course), *Latent diffusion and Stable Diffusion* (perceptual versus semantic compression with the 48-fold smaller latent, the autoencoder, cross-attention conditioning, classifier-free guidance as sampling from a tilted density with a worked Gaussian example, DDIM and DPM-Solver, and editing; the course notebook's scheduler comparison is noted to run DPM-Solver++ twice, and its embedding size, ODE and model repository are corrected), *Autoregressive models: PixelRNN and PixelCNN* (the chain rule as a model with parameter counts from a full table to a shared network, bits per dimension, parallel training against sequential sampling, Row LSTM and Diagonal BiLSTM, masked convolutions and colour-channel masks, the blind spot computed from the masks and confirmed by a gradient check in the note's code, Gated PixelCNN and PixelCNN++ with the paper results; the course notebook's bucket sizes, masking and two-layer receptive field are noted), and *Autoregressive transformers: ImageGPT, VQGAN, DALL·E and Parti* (causal attention as a PixelCNN without a blind spot, sequence lengths and the KV cache with worked counts, ImageGPT's palette, the two-stage recipe with VQGAN's losses and its sampling-knob FIDs, DALL·E and Parti, a comparison with diffusion, and the course's LLM seminar, whose saved chat answers are noted to repeat the whole prompt; it closes the course with the paragraph that the DDPM note used to carry, now for five families). The course overview now has five families in its table, figure and plan. The VAE note now hands over to it instead of summarizing β-VAE in a paragraph, and the orders of the later notes shift by one. Why: the course maps promised these topics, and the notebooks they come from were part of the course.
- **Notes: the course graph as a diamond, and sections of a note nested in the course plan.** `/notes` (and `/ru/notes`) now places the courses on a diamond: Probability Theory first, Machine Learning and Generative Models next (ML leading into Generative Models), NLP last. Wide screens read it left to right and phones top to bottom, with no crossing arrows; on phones, long course titles wrap inside their cards instead of running out of them. In every course plan, a section of a note ("Section →") now sits one step in from its note, on a thin rule, instead of in the same flat list as whole notes; a section listed away from its note names the note it belongs to. The writing guide states that NLP notebook links go only to `xufana/dsba_nlp` on `autumn-2025`. Why: on phones the graph was one column with crossing lanes, and the plans read as long undifferentiated lists.

## 2026-10-13

- **NLP: notes checked against the notebooks, overview figures, Russian translation.** Going through the course in order, each note is checked against its notebook and recomputed where the notebook does not print a number, gets an overview figure where it had none, and is translated into Russian with Russian figure labels. Done so far: *Text as data* (the 29,350-word AG News vocabulary comes from lowercasing and a frequency cut alone, not from the full cleaning pipeline; WordNet lemmas such as `went` → `go` need the part of speech; BERT's normalizer uses NFD, not NFKC), *Corpora and evaluation* (four forms of leakage, not three; which datasets report on validation and why), *Bag of words and TF-IDF* (scikit-learn's three differences from the textbook formula; the 1–3-gram vocabulary has 101,284 entries; the 0.2-point gain is within one standard error), *N-gram language models* (the notebook's perplexity is a mean over lines, not the corpus perplexity), *Word embeddings* (the analogy and corpus numbers as the notebook prints them), *CNNs for text classification* (real article lengths and vocabulary size; the leave-one-token-out probe read from the saved colours, which show the classifier relying on the news-agency tag `ap`), *Recurrent neural networks* (no unsaved GRU result is claimed; a largest singular value above 1 is necessary for exploding gradients, not sufficient), *LSTM and GRU* (the LSTM–GRU comparison now cites the studies that compared them; a 2-layer bidirectional LSTM with H = 512 has 10.5 M parameters, not 8 M), *Sequence-to-sequence models* (which cell states the BLEU of 0.152 comes from), *Attention before Transformers* (the BLEU of 0.32 and 0.19 are stated in markdown cells; the one-token-ahead alignment checked on the saved heatmaps), *Transformer Architecture* (the 0.906 of the small encoder is its best epoch chosen on the test set; Xiong et al.'s result stated precisely), *Positional representations* (the table is added once, not at every layer; T5's bucketed biases; which model's listing shows `rotary_emb`), *Transformer for machine translation* (which BLEU values come from markdown cells; a new figure splits the gain over the LSTM into the rest of the architecture, cross-attention to all positions and depth), *BERT* (a new figure of masked language modelling on one sentence: the three cases of the 80/10/10 rule and a loss only at the selected positions), *GPT* (speculative decoding saved 101 s → 41 s, not 103 s → 45 s, and its greedy text diverges from the base run after one sentence, likely through 16-bit arithmetic; Llama 3.2 1B has ten times GPT-2 small's parameters, not eleven; a new figure of the generation loop and where each decoding choice acts), *Encoder, decoder and encoder–decoder models* (a new figure of the three families as pairs of attention mask and pretraining objective), *Transfer learning in NLP* (the top fillers of the World class as printed, pronouns included; where the 0.9486 of fine-tuning was saved; a new figure of the three routes with what is frozen and what is trained), *Fine-tuning* (memory in consistent decimal units; a new figure of full fine-tuning, linear probing and LP-FT as phases), *Parameter-efficient fine-tuning* (which cell counts the 296,448 LoRA parameters; a new figure of where adapters, LoRA and prompt tuning put their parameters), *Instruction tuning and alignment* (InstructGPT's 1.3 B model was preferred to the 175 B GPT-3, as the paper states; a new figure of the SFT, RLHF and DPO stages), *Quantization* (on the GPU the 8-bit DistilBERT was slower than float32, 3 min 50 s against 2 min 4 s over the test set, where the note had called it seven times faster by comparing a GPU batch with a CPU batch; the 0.089 GiB of dynamic quantization leaves out its packed weights; embeddings are 36 % of the parameters, not 23 %; a new figure of the quantized linear layer), *Text classification* (the TextCNN with trainable embeddings has 2.9 M parameters, not 3.1 M; the 1–3-gram vocabulary size filled in; a new figure of constrained decoding at the first step), *Named entity recognition* (the frozen head's predictions were read per subword token as if per word: it actually tags JAPAN as a person and misses CHINA; a new figure of aligning word labels to subword tokens), *Question answering* (a new figure of the start and end distributions over positions with the question excluded from the search), *Summarization* (the correct paraphrase in the ROUGE example scores 33.3 / 20.0, not near zero; the T5 table no longer compares a validation loss with a mean training loss; a new figure of what ROUGE counts), *Embeddings and semantic search* (the corpus is 830 posts, not a few thousand, and the golden set is 20 hand-written excerpts of posts, not whole posts; the notebook's hybrid is weighted reciprocal rank fusion, not a weighted sum of scores; the reranker reorders at most four posts, because the parent-document retriever ignores the `k` the evaluation loop passes; the e5 prefix no longer said to select a different head; a new figure of the retriever at query time), *Retrieval-augmented generation* (the notebook announces the no-context baseline but never runs it; the decision list follows the notebook's checklist, whose "symmetric search" means matching the query against stored questions; the two judge tips are told apart as drift and cost rules; a new figure of the token budget and of placing the best chunks at the edges of the context), *Tool use and agents* (the saved runs differ from the cookbook text the note had followed: the James Bond request made no search and sent a generic prompt to the image tool, the DB5 picture being the cookbook's; the weather search first returned unrelated forum posts and the answer merges two sources; the debugging run returned fixed code without executing anything; a new figure of the agent loop with the runtime, human approval and the stopping rules), *LLM evaluation* (the notebook's narration, written for the tutorial's Mixtral-8x7B judge at 0.567 and 0.843, called the 1B judge's −0.169 close to human level, not its 0.192; with 28 items both judge correlations are within noise of zero, now stated with the interval; the harness runs' saved scores are used, including MMLU geography at 0.4 when the letters are scored and 0.1 when the option texts are; a new figure of which instrument measures which stage), and *Non-autoregressive generation and text diffusion* (the sampler checked line by line against the notebook's code: the unmasking schedule is fixed when a block starts; the model named, LLaDA-MoE with about 1B of its 7B parameters active; a new figure of the forward masking and reverse prediction processes). The LSTM cell, seq2seq, attention-step, Transformer block, sinusoid, encoder-only, LoRA, affine-quantization, RAG-pipeline and unmasking figures gain Russian labels (the unmasking figure also gains a readable phone layout), the glossary settles on «гейт» for gate and gains the retrieval and agent terms, and the attention-step table keeps its column spacing. New figures: the preprocessing steps on one fragment, the evaluation protocol with its leaks, TF-IDF as matrices, the bigram model as a graph of transitions, the embedding layer as a row lookup, the TextCNN architecture, and an RNN used as a classifier and as a language model. The prerequisite "Linear models" of the bag-of-words note linked to the note itself and now links to a textbook chapter; an untranslated note on a Russian page resolves prerequisites by their English titles. Why: the course should be correct, readable at the level of the whole method, and available in Russian.
- **Links checked and brought up to date.** All 357 external links in the notes were checked. The Generative Models notebooks now link the maintained default branch of HSE-LAMBDA/DeepGenerativeModels (`spring-2025-long`) instead of a commit, as the NLP notebooks link `autumn-2025`; the cells and outputs are unchanged, since the commit was the head of that branch. The dead link to the CRF paper (Lafferty, McCallum and Pereira, 2001) now points to its ML Anthology page. Publisher pages that refuse automated checks (ACM, MIT Press, Wiley and others) were left as they are: their DOIs resolve. Why: readers should land on the notebooks that are maintained, and no reference should be a dead end.
- **Notes: the courses as a graph of prerequisites, and two new courses in preparation.** `/notes` (and `/ru/notes`) now draws the courses as a graph, from the course to take first to the courses that build on it, with the course cards below in the same order and what to take first. Two courses are added with their full maps, all topics still planned: **Probability Theory** (events, random variables, dependence, limit theorems, statistics, sampling) and **Machine Learning** (the learning problem, linear models, classification, trees and ensembles, neural networks, learning without labels, ranking). The storyline, motivation and map of both are in `docs/course-design-probability-ml.md`. Why: the courses build on each other, and a list did not say in which order to read them.
- **Course pages: less noise, more links.** The course page no longer shows the tagline and the counters of notes, translations, planned topics and progress. The stages of the storyline link to their sections, and the prerequisites of every note link to the note that covers them, or to a textbook chapter for background topics. Why: the counters said little a reader needed, and the stages and prerequisites looked like links but were plain text.
- **NLP: an opening note on what the course is for (EN and RU).** "What natural language processing is" opens the Text Foundations section. It states the problem (text into decisions and into other text), the four shapes every task takes, the next-token objective with cross-entropy and perplexity, why language is hard for a computer, with word-frequency numbers from the AG News training set (including the `#39;` left over from a broken apostrophe in a quarter of the texts), why the methods matter when a chat model is one call away, using the course's own AG News results, and the plan of the course as a chain in which each method answers the failure of the previous one. Two new figures; the course now has 34 notes. Why: the course said what it covers but not why it is worth taking; the Generative Models course got the same kind of opening note on 2026-10-12.
- **NLP notebook links follow the maintained branch.** Every Notebook section now links the `autumn-2025` branch of `xufana/dsba_nlp`, where the fixed notebooks are merged, instead of the commits with the notebooks as first taught (the change made earlier the same day). Every notebook gained an environment cell and some cells changed, so the 272 cited cell numbers are remapped by matching cell contents, and the descriptions of cells the fixes changed are rewritten (the Quora download, solved exercises, `pad_token_id`, the NER label map, the QA metric and span decoding, the Qdrant index, Laplace smoothing, `compute_metrics`, the IMDb checkpoint, static quantization). Each Notebook section says that quoted numbers come from the run saved with the course. Why: readers should land on the notebooks that run today.
- **NLP course: 33 notes in ten sections.** `/notes/nlp` grows from two notes to 33 published notes: text as data and tokenization, classical NLP, word embeddings and Word2Vec, RNNs, LSTMs, seq2seq and attention, the Transformer, pretrained models (BERT, GPT, model families, transfer learning), adaptation (fine-tuning, PEFT, instruction tuning, quantization), NLP tasks (classification, NER, QA, summarization), LLM systems (semantic search, RAG, agents, evaluation) and text diffusion. Each note follows one storyline: the problem, a baseline, where it fails, the key idea, the mechanism with tensor shapes, a worked example, what changed, limitations and what to remember. 36 new SVG figures. GloVe, FastText and sentence-pair similarity are listed as planned. The URLs `/notes/nlp/attention` and `/notes/nlp/transformers` are kept. Why: the course had two standalone notes while its seminars cover twelve weeks; readers need one connected path from text representation to modern LLM systems.
- **NLP course in Russian: tokenization, attention and Word2Vec.** The first three NLP notes are translated, the Russian glossary gains the NLP terms, and the Russian notes page says the rest of the NLP course is in English for now. Why: the Russian site had no NLP notes at all.
- **NLP notebook links open for everyone.** Every "Notebook" section now links to the public copy of the seminars in `xufana/dsba_nlp` instead of the private course repository, which gave readers a 404. The links are pinned to the notebooks as taught, so the cell numbers and saved outputs the notes cite are what the reader sees; the versions with fixes and pinned environments follow them on the same `autumn-2025` branch. Why: none of the notebooks the notes cite could be opened.
- **Course page and note navigation.** The course page shows the number of sections, published and planned notes and a progress bar computed from the course map. Every note has a breadcrumb, its number and section, a section-grouped contents tree, previous and next links, anchor links on headings and structured data. The build fails when a note and the course map disagree. Why: with 33 notes, a reader has to see where a note sits and what comes before and after it.
- **Note tooling.** `scripts/notes/` counts prose words per section, screenshots figures, checks a rendered note, compares an English note with its Russian translation and localizes figure labels; explicit heading ids may contain underscores. `docs/course-writing.md` gains the NLP conventions. Why: keeps length, figures and translations consistent as the course grows.

## 2026-10-12

- **Generative Models: new opening note "What generative modeling is" (EN and RU).** The note states the problem the course solves (learning to sample from an unknown data distribution from examples), what generative models are used for, why maximizing likelihood is the same as minimizing KL, and why the problem is hard in high dimensions. It walks through how a computer samples at all: uniform pseudo-random numbers, inverse transform sampling, Box–Muller, an affine map to any Gaussian and a learned nonlinear map, and maps the four model families of the course (VAE, GAN, flows, diffusion) by what they can compute. Four new figures. The note opens the Foundations section of the course map, and the Gaussian note links back to it. Why: readers asked what the course is about and what motivates it; the gap between "we have data" and "we sample from a model" was not covered anywhere.
- **Projects: in-progress results hidden.** Removed the `Outcome` lines from Connectome Rewiring Rule and MOBA → HPC (EN and RU). Connectome Rewiring Rule is now labelled as in progress. Why: this work is still in progress; results will be published once they are final.
- **Home and About: negative-result wording removed.** Dropped "A negative result counts as a result" from the homepage research card, and the sentences about negative results from the research paragraph and meta description on About (EN and RU). Why: with the outcomes hidden, this wording pointed at results the site no longer shows.
