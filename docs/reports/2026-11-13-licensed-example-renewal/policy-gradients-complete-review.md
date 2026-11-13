# Policy gradients: complete replacement and scoped review

Date: 2026-11-13. Author/reviewer: Codex root, for the Fedor Pakhurov project with explicit AI assistance. Full EN/RU body, new diagram, executable fixture and direct local import closure read and checked. Independent peer review, full-site build and production verification are separate release steps; none is asserted in advance.

## Replaced material

The prior short-corridor task, its analytic and learning curves, CartPole example and old actor-critic/PPO illustrations and helper implementation are removed. No source benchmark, original task layout, episode trace, learned result, simulator code or external dataset is an input to the replacement. New prose covers the existing curriculum; all sixteen section anchors and three legacy figure anchors remain available. The old filename/anchor is retained only for link compatibility, not for reusing the old example.

The replacement was specified as three binary allocation slots with reward one exactly for two priority assignments. All eight paths are exhaustively enumerated. The shared Bernoulli policy is deliberately restricted; a state-aware deterministic policy achieves reward one, while the restricted optimum is 4/9. This distinction prevents a false claim that the underlying fully observed task requires random behavior. A separate new four-step GAE trace and scalar PPO/KL calculations are explicitly constructed arithmetic, not empirical training.

## Primary-source boundaries

- Sutton, McAllester, Singh and Mansour, NeurIPS 1999, Section 1 and Theorem 1: discounted visitation and policy-gradient identity checked in primary proceedings PDF. The finite-horizon proof is derived explicitly. No task, prose, illustration or implementation copied.
- Williams, Machine Learning 8 (1992), DOI 10.1007/BF00992696: publisher author/title/date/pages and abstract checked for historical REINFORCE attribution. Full paywalled article was not inspected and is not claimed as evidence for specific implementation details. The score calculation is independently derived.
- Schulman et al., GAE arXiv:1506.02438v6: Section 3 equations 11-19 and conditional baseline conditions checked. The note uses a stated start-state discounted objective and retains gamma^t in its gradient. Terminal and cutoff bootstrapping are distinguished.
- Schulman et al., TRPO arXiv:1502.05477v5: Sections 3-6, maximum versus average divergence, and Appendix C Fisher-vector/conjugate-gradient/line-search calculation checked. Practical approximation is separated from the ideal improvement guarantee.
- Schulman et al., PPO arXiv:1707.06347v2: Section 3 equation 7 and Section 5 equations 9-12/Algorithm 1 checked. The minimum bounds the unclipped surrogate term, not real policy performance. The new Bernoulli calculation proves that a flat clipped term does not impose a KL barrier.

These sources are scientific references only. ArXiv posting permission is not treated as a reuse license. No source artwork, training data, code or empirical table is redistributed. Newly composed fixtures and diagram were prepared with Codex assistance; no guaranteed exclusive copyright in AI-assisted material is asserted. Shared Figure and locale utilities are existing first-party rendering code inspected as direct dependencies.

## Executed arithmetic and bilingual checks

`python3 scripts/notes/policy-gradient-allocation.py` freshly matches the saved JSON. Fractions verify all eight masses and scores, total probability one and zero expected score; J=36/125 and logit gradient 144/625 at p=2/5. Independent finite differences at four probabilities agree within 1e-9. Best constant baseline is 32/125, with variance 0.08404992; subtracting the value gives 0.08478720; no baseline gives 0.13123584. Adding seven to all terminal rewards leaves the mean but raises unbaselined variance to 37.99171584, while adjusting the baseline restores it pathwise. The optimum's unbaselined variance is zero, illustrating that variance reduction is not automatic.

The GAE recursion is checked at lambda zero, 0.6 and one against telescoping returns. Its four displayed values are 0.6146432, -0.13616, 0.508 and 0.6. A continued final bootstrap 0.7 contributes 0.28672 at the start for lambda one. The clipping table and old-to-new Bernoulli KL sequence are independently evaluated; the clipped positive term stays 3.45 while KL exceeds 3 nats. Entropy and its logit derivative are evaluated directly.

`node scripts/notes/check-policy-gradients-renewal.mjs` passes 81 identical mathematical spans per language with strict KaTeX and MDX compilation; checks preserved anchor aliases, removed legacy material and all three result tables. Manual bilingual reading confirms equivalent assumptions and limits. Browser review remains a separate release check.

## Independent peer and actual-page review

Codex takedown_routing read both complete bodies, AllocationPolicy, Figure/pageLang/heading-ID helpers, both verification scripts and saved outputs. A separate grouped-binomial Fraction calculation recovered J=36/125, gradient144/625, E[S²]=18/25, b*=32/125 and all three variances. Independent finite weighted GAE sums matched lambda0/0.6/1 and the cutoff adjustment. A separate piecewise clipping expression and 50-digit Decimal KL/entropy computation matched the saved output. Fresh Python3.14 stdout was byte-identical; all81math spans per language compiled. The peer checked all16old heading anchors, three figure aliases, and primary Sutton/GAE/TRPO/PPO passages; Williams access remained metadata/abstract only. No mathematical, bilingual or source-boundary blocker remained.

Root rendered the actual Astro pages for PG and VAE across EN/RU,390/1440pixels and light/dark:16views passed without document overflow, KaTeX errors, failed fonts or SVG text outside its viewport. The original shared dependency cache initially produced font403responses; final checks used an isolated temporary Vite cache and explicit dependency allowlist, without production configuration changes. Root visually inspected the PG mobile figure and fixed its amber marker to the actual color token. Full-site CI/build/deployment remain separate release evidence.
