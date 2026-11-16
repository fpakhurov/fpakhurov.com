# Estimation pair: independent input plan

Selected before primary-source reading on 2026-11-16. Author: Codex sequence_peer assisting Fedor Pakhurov. This documents new instructional composition, not exclusive copyright or new mathematical discoveries.

## Preserved identity

Probability estimators (order 14) and maximum-likelihood (order 15), current prerequisite graph, all existing true heading anchors. The strict extraction retained only identity metadata, headings outside code fences and figure import paths. No historic descriptions, explanations, code, input observations, plots or results were emitted or retained as teaching input. The four historic figure filenames are identity only; their implementations will not be read or adapted.

## Independently selected cases

1. Estimator distribution: independent Bernoulli trials, n=7 and p=2/7. Compare A=K/n with B=(K+2)/(n+5); enumerate K=0,...,n using exact rational binomial weights. Compare expectation, bias, variance and MSE at p=2/7 and p=4/5, then n=28 and112. Explain that shrinkage target is2/5 and an improvement at one parameter does not imply universal dominance. Figure1 has two exact sampling PMFs; figure2 plots both analytic MSE curves over p in[0,1] for n7 and28. No simulated performance claims.
2. Sample variance: observations[-2,1,1,4] give mean1, residual squares18, biased variance4.5 and unbiased variance6. Derive n-1 using centered-sum identity and expectations for iid observations; enumerate all 2^4 Bernoulli outcomes at p2/7 as an independent execution check. Show standard error distinction using Bernoulli exact SE and plug-in SE for observed K3/n7.
3. MLE: new observed binary sequence[1,0,1,1,0,1,0,1,1,0,1,0,1], K8/n13. Derive log-likelihood score/concavity, boundary cases K0,n; compare normalized likelihood at p=.25,.5,8/13,.8. Figure3 plots relative likelihood and relative log-likelihood, with maximum at8/13.
4. Regression/noise link: fresh residual vector[-3,-1,0,2,5]. Compare Gaussian fixed variance4 and Laplace fixed scale2 likelihoods (and their negative logs) as functions of location shift; explain mean versus median optima, with Gaussian SSE and Laplace absolute deviations. Figure4 plots both objective increments on common shift grid. Derive normal variance MLE from sum of squares and state its finite-sample bias via previous topic.
5. Fisher information: Bernoulli score directly checked by exact two-outcome expectation, per-observation1/[p(1-p)], sample informationn/[p(1-p)], CR bound p(1-p)/n for unbiased estimators under stated interchange and support regularity. Show sample mean attains bound. Explain score-T covariance identity with differentiation under integral and Cauchy-Schwarz. Conditional independence and common parameter explicit.
6. Failure: parameter-dependent support via exponential endpoint family f_theta(x)=exp(-(x-theta))1{x>=theta}, theta real, sample[.4,1.1,1.9]. Likelihood exp(n*theta-sum x) is increasing on theta<=min x so MLE minimum=.4; derivative-root recipe fails. Mean min excess1/n, variance1/n² (derive via survivor); naive score regularity fails because support boundary moves. This independently selected shifted-exponential example replaces any historic endpoint example. Also misspecified Bernoulli constant-p observations and finite versus asymptotic claims distinguished.

## Scope and assets

Four new bilingual Astro figures from these formulas, new stdlib calculation script, saved exact/floating results, actual-render figure/MDX scoped checker. No corpus, model, images, source code, benchmark measurements or external assets. No local full build/browser/CI/install. First-party shared Figure/lang/heading helpers may be copied with pinned Git provenance. Source facts will be verified against exact author/institution-hosted primary statistical texts. Reference-only sources will not be copied or distributed.

## Handoffs and review

Estimators receives LLN/CLT results by precise links and hands off to MLE; MLE hands off to Bayesian inference. No curriculum changes. Author freeze then two independent full peers; root owns integration, normal rights/build/browser publication gates and upstream-first publication.
