# Changelog

Notable changes to the site, newest first. Each entry gives the date, what changed and why.

## 2026-10-12

- **Generative Models: new opening note "What generative modeling is" (EN and RU).** The note states the problem the course solves (learning to sample from an unknown data distribution from examples), what generative models are used for, why maximizing likelihood is the same as minimizing KL, and why the problem is hard in high dimensions. It walks through how a computer samples at all: uniform pseudo-random numbers, inverse transform sampling, Box–Muller, an affine map to any Gaussian and a learned nonlinear map, and maps the four model families of the course (VAE, GAN, flows, diffusion) by what they can compute. Four new figures. The note opens the Foundations section of the course map, and the Gaussian note links back to it. Why: readers asked what the course is about and what motivates it; the gap between "we have data" and "we sample from a model" was not covered anywhere.
- **Projects: in-progress results hidden.** Removed the `Outcome` lines from Connectome Rewiring Rule and MOBA → HPC (EN and RU). Connectome Rewiring Rule is now labelled as in progress. Why: this work is still in progress; results will be published once they are final.
- **Home and About: negative-result wording removed.** Dropped "A negative result counts as a result" from the homepage research card, and the sentences about negative results from the research paragraph and meta description on About (EN and RU). Why: with the outcomes hidden, this wording pointed at results the site no longer shows.
