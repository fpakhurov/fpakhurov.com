# Joint distributions: complete scoped author review

Reviewed 2026-11-14 by Codex takedown_routing. Both full languages and their current figure/code dependency closure are covered. This is an author-reviewed candidate awaiting independent peers and publication checks, not whole-course or whole-source clearance.

## What was replaced

Both bodies were newly composed around explicit fictional inputs. The previous dice/sum/max table, uniform-disk example, Gaussian-square dependence example, randomized correlation gallery, ice-cream/drowning narrative, fixed-correlation Monte Carlo benchmark and uniform-sum illustration are retired. No old random stream, source-specific output, code or image was retained through a label change. Original curriculum identity, order, prerequisite and section/figure anchors remain.

The 36-record table is specified directly. Its distinct X values are 0,1,3 and Y values 0,2,5, with counts [[6,4,2],[2,8,2],[4,2,6]]. A separate nonnegative polynomial on the unit square supplies a fully calculable continuous law with uniform marginals and nonconstant conditional means. A pair of explicit finite tables shows zero covariance with matching marginals but different dependence. A common fair sign plus individual signs supplies an infinite-family variance floor; four centered signs demonstrate the finite negative-correlation boundary. A two-by-three independent law supplies a convolution with two paths to one sum.

These constructions and all displayed values are project work prepared with Codex assistance. Established mathematical ideas are not claimed novel. No external dataset, model, PRNG, source exercise or copied implementation is used. No new public license or guarantee of exclusive copyright is assigned.

## Full-body and source review

The exposition distinguishes a joint measure from a joint density, continuous marginals from joint absolute continuity, positive-mass conditioning from a.e. conditional versions, pairwise from mutual independence, and covariance from the full law. Finite second moments and positive variances are stated where needed. Correlation equality means an affine relation almost surely, including its sign. The covariance formula is derived by expanding a centered sum; equal negative correlations are bounded for a fixed collection size. Common random error is distinguished from fixed bias. Convolution uses independence and support restrictions; an unnormalized sum is not automatically Gaussian. Observational conditioning is not asserted to determine an intervention.

Selected mathematical passages were read directly from Kyle Siegrist's author-owned primary resource: Joint Distributions (Basic Theory, marginalization and factorization), Conditional Distributions (discrete/general definitions, density ratio, a.e. uniqueness and independence), Covariance and Correlation (definitions, bilinearity, sum variance, inequality and equality cases), and Transformations of Variables (Sums and Convolution). Exact fetched snapshots and selected read scopes are hashed in `joint-source-evidence.json`; snapshots stay outside the release package.

The homepage's Rights and Permissions declaration and linked official CC BY 2.0 deed were read. The note retains creator/title/source/home/license attribution. This is reference-only mathematical use: no source paragraph, distinctive problem, plot, software, data or experimental result is redistributed. The site's license is not generalized to separately attributed assets or assigned to the new project material.

## Assets and execution

Both old figure implementations are replaced in place. `JointTable.astro` is an accessible count table with explicit totals and a highlighted conditional row. `CorrelationGallery.astro` compares two full mass tables with identical marginals and covariance. Both use semantic row/column headers, current design tokens and a narrow layout; there are no external media or random plots. Captions describe mechanisms and conditions. The only local figure dependencies are the existing first-party Figure wrapper and URL-language helper. The checker additionally imports the existing heading-ID helper; all three helpers were read and compared byte-for-byte with published Git objects at b06b1f66040c4c4426955a1be0906c5baddc26cb. Installed compilation/runtime libraries remain operational dependencies, not teaching-asset reuse grants.

The exact standard-library verifier checks:

- all nine finite masses, both marginals, the conditional row, means 4/3 and 13/6, product moment 32/9, variances 14/9 and 137/36, covariance 2/3 and squared correlation 72/959;
- polynomial normalization, both uniform marginals, corner positivity, product moment 19/72, covariance 1/72, correlation 1/6, upper-quarter probability 9/32 and conditional means 11/24 and 13/24;
- both zero-covariance tables, uniform marginals, variances 8/3 and 2/3 and the incompatible center masses;
- exact binomial-multiplicity average variances for n=1,4,16,64, an explicit 32-outcome four-variable common-sign population, and all 16 centered-sign outcomes at the negative boundary;
- all finite convolution masses and its mean 7/2.

The continuous statements and infinite-family claims were reviewed analytically; finite enumeration is not presented as a proof of a general theorem. The bilinear density has extrema at corners, and the shared-sign construction defines each finite collection consistently.

Fresh serial checks pass at a 192 MiB Node limit: 67 identical EN/RU math spans, 19 parsed display blocks, 12 preserved headings, strict MDX/GFM/KaTeX, identical inline code with two exact stdout replays, byte-exact saved Python fixture output and four actual standalone Astro renders. Every displayed table cell and total is compared to the Python fixture, with unique IDs and finite output. The scoped renderer removes only unused compiler metadata incompatible with the installed runtime and omits style imports for static HTML inspection; it does not claim browser CSS validation. Both complete notes and every current asset/code file were read after authoring.

## Coordinated review correction

The second peer identified the undefined `--text` color token in both new figures. Verified against the current theme definitions and replaced it with the existing `--ink` token in all four text rules. No mathematical inputs or numerical outputs changed. Root also requested explicit table display/layout rules against the global prose CSS, normal header word wrapping, an aligned variance display and prose placement of density support/positivity conditions. These layout-equivalent bilingual changes preserve the statements and anchors. Full peer results are still pending.

## Remaining checks

Independent full scoped peers, browser/full-page checks, global rights/content/build gates, CI, publication and live verification remain separate. No heavy build or browser was run during this low-memory author pass. BIASED migration must wait for an exact published, live-verified FP note/review revision. No other probability topic is cleared by this record.
