# Course design: Probability Theory and Machine Learning

Two new courses under `/notes`, written to the standard of Generative Models and NLP (`docs/course-writing.md`): every note opens with a problem, gives a baseline and where it fails, the key idea, the mechanism with derivations and shapes, a worked example with numbers checked by hand or by a script, what changed, limitations, what to remember and a hand-over to the next note. This document fixes the storyline, the motivation, what a reader can do afterwards, and the map of sections and notes. Sources of inspiration: the HSE Faculty of Computer Science courses (wiki.cs.hse.ru): "Теория вероятностей" (ПМИ; Koralov–Sinai, Shiryaev), "Машинное обучение 1–2" (E. Sokolov, github.com/esokolov/ml-course-hse), plus Deisenroth–Faisal–Ong (*Mathematics for Machine Learning*), Hastie–Tibshirani–Friedman (*ESL*), Bishop (*PRML*), Murphy (*PML*). Notes are written from these as independent course notes, never as transcripts.

## How the four courses fit together

```
Probability Theory ──► Machine Learning ──► NLP
        │                     │
        └──────────┬──────────┘
                   ▼
           Generative Models
```

- **Probability → ML.** Losses are negative log-likelihoods (squared error is Gaussian noise, cross-entropy is a categorical model); generalization is a law of large numbers with a deviation bound; regularization is a prior.
- **Probability → Generative Models.** Densities, change of variables, Gaussians, KL divergence, sampling.
- **ML → NLP.** Linear classifiers, gradient descent, backpropagation, evaluation and validation, the bias–variance trade-off.
- **ML → Generative Models.** Neural networks and their training.

The `/notes` page draws this graph from the `requires` field of each course in `src/utils/courses.ts`, and note prerequisites (`src/utils/prerequisites.ts`) switch from external textbooks to these courses as their notes are published.

---

## Probability Theory

**One sentence.** How to reason exactly about outcomes we cannot predict, from a coin flip to the Gaussian behind every average, and how that reasoning becomes the loss functions, estimates and guarantees of machine learning.

### Motivation (the opening note)

- Every model on this site is a probabilistic statement. A classifier outputs a distribution over labels; a language model a distribution over the next token; a diffusion model a distribution over images. Training is maximum likelihood; evaluation is an estimate with an error bar.
- Intuition fails in exactly the cases that matter: the base-rate fallacy in a medical test, the birthday problem, Simpson's paradox in an A/B test, "an average of noisy measurements is still noisy". The course replaces intuition by a calculus that gives the right answer.
- The course is built backwards from what ML needs: random variables and expectations (losses, risks), conditional distributions (prediction is $E[Y \mid X]$), the multivariate Gaussian (noise models, latent spaces), limit theorems (why training on a sample works, why confidence intervals are Gaussian), likelihood and Bayes (estimation, priors, regularization), Markov chains and sampling (language models, MCMC, diffusion).

### Storyline: each idea answers a question the previous one could not

| Question | Answer (note) |
| --- | --- |
| What does "probability" even mean, and how do we compute it when all outcomes are equally likely? | Classical model and counting |
| What if outcomes are not equally likely, or there are infinitely many (a random point on a segment)? | Kolmogorov's axioms |
| How does information change probabilities? | Conditional probability, Bayes' formula, independence |
| How do we talk about numbers produced by chance? | Random variables, distributions, CDF and density |
| How do we summarize a distribution by a few numbers? | Expectation, variance, moments |
| How do several random quantities relate? | Joint distributions, covariance, the multivariate Gaussian |
| What is the best prediction of one quantity from another? | Conditional expectation |
| Why does averaging work, and how fast? | Inequalities (Markov, Chebyshev, Hoeffding), the law of large numbers |
| Why is the Gaussian everywhere? | The central limit theorem |
| How do we go from data back to the distribution? | Estimation, maximum likelihood, Bayesian inference |
| How do we decide if an effect is real? | Confidence intervals, hypothesis tests, the bootstrap |
| How do random systems evolve and how do we sample from complex distributions? | Markov chains, Monte Carlo |

### Map (sections and notes)

1. **Foundations**
   - *What probability is* (opening note: motivation, frequency and belief, the course map).
   - *Outcomes, events and counting*: the classical model, combinatorics, the birthday problem, sampling with and without replacement.
   - *Kolmogorov's axioms*: σ-algebras and why they are needed (Bertrand's paradox, a random point in $[0, 1]$), properties, inclusion–exclusion.
   - *Conditional probability and Bayes' formula*: the law of total probability, the base-rate fallacy with real numbers, independence and conditional independence.
2. **Random variables**
   - *Discrete distributions*: Bernoulli, binomial, geometric, Poisson as the limit of the binomial.
   - *Continuous distributions*: CDF, density, quantiles; uniform, exponential, normal; memorylessness.
   - *Functions of random variables*: the change-of-variables formula (the one-dimensional case of normalizing flows), inverse transform sampling.
   - *Expectation and variance*: linearity, indicators, Jensen's inequality, moments, the moment and characteristic functions.
3. **Several random variables**
   - *Joint distributions and independence*: marginals, covariance and correlation, uncorrelated is not independent.
   - *The multivariate Gaussian*: covariance as geometry, affine maps, marginals and conditionals (links to Generative Models).
   - *Conditional expectation*: $E[Y \mid X]$ as the best predictor in mean square; the regression function of ML.
4. **Limit theorems**
   - *Inequalities and concentration*: Markov, Chebyshev, Hoeffding; a first generalization bound.
   - *The law of large numbers*: convergence in probability and almost surely, Monte Carlo estimation.
   - *The central limit theorem*: why sums become Gaussian, the error of an average, convergence in distribution.
5. **From probability to statistics**
   - *Estimators*: bias, variance, consistency, mean squared error.
   - *Maximum likelihood*: the derivation of squared error and cross-entropy as losses, Fisher information.
   - *Bayesian inference*: priors, posteriors, conjugacy, MAP estimation as regularization.
   - *Confidence intervals, tests and the bootstrap*: A/B tests, p-values and their misuse, resampling.
6. **Random processes and sampling**
   - *Markov chains*: stationary distributions, PageRank, n-gram language models as Markov chains.
   - *Monte Carlo methods*: rejection and importance sampling, MCMC, the bridge to diffusion models.

### What a reader can do afterwards

Compute the probability of a compound event and check it by simulation; choose a distribution for a quantity and derive its moments; recognize a loss function as a likelihood; quantify the error of an average and of an A/B test; read the probabilistic notation of ML papers (conditional densities, expectations under a distribution, KL divergence) without translating it word by word.

---

## Machine Learning

**One sentence.** How a program learns a rule from examples and how to tell whether the rule will work on new data: from a line through points to gradient boosting and neural networks, each method introduced by the failure of the previous one.

### Motivation (the opening note)

- Most applied ML outside text and images is tabular: prices, credit, churn, demand, search ranking. Linear models, trees and gradient boosting do that work, and neural networks are built from the same parts (linear maps, gradient descent, losses, regularization).
- The hard part is not fitting: it is generalization. A model that is perfect on the training data can be useless; a leaky validation split makes a useless model look perfect. The course treats validation as a first-class method.
- Every method has a failure that motivates the next one: nearest neighbours break in high dimension → linear models; least squares overfits with many features → regularization; squared error is wrong for classes → logistic regression and margins; linear boundaries are too simple → trees; trees overfit → bagging and forests; forests stop improving on hard patterns → boosting; hand-made features run out → neural networks.

### Storyline

| Failure | Answer (note) |
| --- | --- |
| "Memorize the training set" does not generalize | The learning problem: risk, empirical risk, train/validation/test |
| Similar inputs should get similar outputs, but similarity in many dimensions is meaningless | Nearest neighbours and the curse of dimensionality |
| A neighbour vote has no global structure | Linear regression and least squares |
| The closed form is too expensive or does not exist | Gradient descent, SGD, momentum and Adam |
| Many features: the fit chases noise | Regularization (ridge, lasso) and its Bayesian reading |
| Squared error is wrong for classes | Linear classification, margins and surrogate losses |
| We need probabilities, not only a side of a line | Logistic regression and calibration |
| Accuracy hides the errors that matter | Classification metrics (precision, recall, ROC, PR) |
| The best line is not unique | SVM and the maximum margin, kernels |
| A line cannot express interactions | Decision trees |
| Why do flexible models overfit? | The bias–variance decomposition |
| One tree is unstable | Bagging and random forests |
| Averaging does not fix bias | Gradient boosting |
| Features must be designed by hand | Neural networks and backpropagation |
| No labels at all | Clustering, EM, dimensionality reduction (PCA, t-SNE) |
| The output is an order, not a label | Ranking and recommender systems |

### Map (sections and notes)

1. **The learning problem**
   - *What machine learning is* (opening note: motivation, the setup $x \to y$, risk, the course map).
   - *Data, features and leakage*: types of features, encoding categories, scaling, missing values, target leakage.
   - *Validation*: train/validation/test, cross-validation, time splits, overfitting and underfitting.
   - *Nearest neighbours*: the first model, choice of $k$ and metric, the curse of dimensionality.
2. **Linear regression**
   - *Least squares*: the normal equation, the geometric picture (projection), the probabilistic picture (Gaussian noise).
   - *Gradient descent*: convergence and the learning rate, SGD and mini-batches, momentum and Adam.
   - *Regularization*: ridge and lasso, sparsity, the prior behind each, choosing $\lambda$ by validation.
3. **Linear classification**
   - *Linear classifiers and losses*: margin, 0–1 loss and its surrogates (logistic, hinge).
   - *Logistic regression*: likelihood, the gradient, calibration of probabilities, the multiclass softmax.
   - *Classification metrics*: confusion matrix, precision–recall, ROC-AUC and PR-AUC, threshold choice, class imbalance.
   - *Support vector machines and kernels*: the maximum margin, the dual, the kernel trick.
4. **Trees and ensembles**
   - *Decision trees*: impurity criteria, greedy splitting, pruning, trees for regression.
   - *Bias–variance decomposition*: the derivation and what it says about every model in the course.
   - *Bagging and random forests*: variance reduction, out-of-bag estimates, feature importance.
   - *Gradient boosting*: functional gradient descent, shrinkage, XGBoost, LightGBM and CatBoost in one table.
5. **Neural networks**
   - *From linear models to networks*: hidden layers, nonlinearities, universal approximation.
   - *Backpropagation*: the computational graph, the chain rule in matrix form, what autograd computes.
   - *Training deep networks*: initialization, normalization, dropout, learning-rate schedules (links to Generative Models).
6. **Learning without labels**
   - *Clustering*: k-means, its loss and failure cases, density-based clustering.
   - *Mixtures and EM*: Gaussian mixtures, the EM algorithm as coordinate ascent on a lower bound (links to VAEs).
   - *Dimensionality reduction*: PCA through the SVD, t-SNE and UMAP and how to read them.
7. **Beyond classification**
   - *Ranking*: pointwise, pairwise and listwise losses, NDCG.
   - *Recommender systems*: collaborative filtering, matrix factorization, implicit feedback.

### What a reader can do afterwards

Turn a business question into a supervised problem with a target, features and a metric; build a validation scheme that matches deployment and catches leakage; fit and debug linear models, trees and boosting, and derive their gradients; choose between boosting and a neural network for a given dataset; read the source of scikit-learn or PyTorch training code and know what each line does.

---

## Writing plan

1. Course maps in `src/utils/courses.ts` with every topic planned, the course pages and the course graph on `/notes`.
2. The two opening notes (EN and RU), with figures.
3. Notes section by section, in the order of the maps; each published note replaces its planned topic and, where it covers a background prerequisite of another course, takes over that prerequisite in `src/utils/prerequisites.ts`.
4. Notebooks: the HSE ML course repository (github.com/esokolov/ml-course-hse) has no license, so its materials are a reference to read and cite, not to copy; the courses get their own small notebooks (one per section) whose saved outputs are the numbers quoted in the worked examples, and the probability course uses short simulations in the same way.
