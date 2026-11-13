# Sources, licensing and course publication

Policy version: 1.0. Adopted 2026-11-13 for all courses on fpakhurov.com and BIASED School.
Canonical policy: fpakhurov.com `docs/content/source-policy.md`. The BIASED copy must stay identical.

## Publication order

1. Keep our existing learning objectives, topic IDs and prerequisite graph. External syllabi can reveal coverage gaps; do not reproduce a distinctive syllabus, assignment sequence or example collection without reviewing its rights.
2. Select primary references and commercially reusable teaching material before drafting. Evaluate the exact repository revision and individual material, not an organization name or a license badge.
3. Write and review the complete English and Russian notes on fpakhurov.com first. Verify explanations, examples, calculations, attribution and rights. Publish the reviewed notes and retain the source revision.
4. Build BIASED explanations and new phone-friendly questions from those reviewed notes. Record the exact fpakhurov.com commit, note hashes and rights review. Added examples, hints, answers, figures, datasets and optional notebooks need their own provenance.
5. Validate the BIASED version against the notes, then publish. A later note change requires a new comparison; a URL alone is not a pinned source.

Do not restore withdrawn content merely because its citation was removed or another source was added. The withdrawn text, dataset, queries, worked examples, code and results cannot be renamed, translated or paraphrased into an apparently independent replacement. Do not feed withdrawn source content into an AI rewriting step. Retain the withdrawal record and replace from independently reviewed sources.

## Three different uses

- **Reference**: read a primary source to check a scientific fact or definition; cite the exact supporting section. A reference does not grant a right to copy its prose, code, images or distinctive examples. A source with restrictive or missing reuse terms can remain a factual citation; do not label it reusable.
- **Reuse/adaptation**: reproduce, translate or adapt expression, a figure, code, notebook, dataset or a distinctive worked example. Record the exact material, source revision, applicable license/permission, exceptions, changes and delivered notices. Translating, redrawing or changing variable names does not erase origin.
- **Original work**: newly authored text, data, code or illustration. Record authorship accurately, including AI assistance, input data, generation/evaluation script and saved results. Original composition does not make the underlying facts novel or eliminate citation requirements. Do not claim that an AI-generated asset has guaranteed exclusive copyright.

A link collection, GitHub organization, wiki landing page, search result, Kaggle discussion or model hub is a discovery source. Its visibility, hosting terms or license do not license its linked materials.

## License decisions for this product

Both sites are reviewed for the intended commercial course use. Making a page free does not by itself resolve a noncommercial restriction in a connected paid product.

| Basis | Default editorial decision | Required checks |
| --- | --- | --- |
| MIT, BSD-2-Clause, BSD-3-Clause, ISC | Eligible for reuse review | Exact scope and copyright holders; retain required copyright, permission and disclaimer notices. |
| Apache-2.0 | Eligible for reuse review | Include license; retain relevant attribution/patent/trademark notices; carry applicable NOTICE entries; mark modified files. No endorsement or trademark permission is implied. |
| CC-BY-4.0 | Eligible for reuse review | Credit creator and source, link license, describe modifications and retain supplied notices; do not impose additional restrictions on the licensed material. |
| CC0-1.0, Unlicense, established public-domain status | Eligible for reuse review | Record evidence and jurisdiction/scope limits; still identify provenance and check privacy, trademarks and third-party inputs. |
| CC-BY-SA, GPL, LGPL, AGPL, MPL and other reciprocal/custom licenses | Separate compatibility review | Commercial use is not automatically prohibited. Document the material boundary, applicable version, redistribution/source/share-alike obligations and how the product satisfies them before reuse. Do not silently relabel them permissive. |
| NC, ND, educational-only, research-only, evaluation-only, unclear or absent license | No default reuse/adaptation in this workflow | Use as a reference only, find an independent replacement, or record specific permission covering our actual commercial use and adaptation. This is our conservative editorial policy, not a claim that every possible use is forbidden by law. |
| Written permission | Case-specific review | Record the authorized material, licensor, recipient, commercial use, adaptation/translation, distribution, duration and any conditions. Keep private correspondence out of public repositories. |

The allowlist is not automatic approval. A repository license covers only material its licensors can license, within its stated scope. Check file headers, subdirectory licenses, README exceptions and upstream credits. A newer license does not establish permission for a different historic version.

## Separate material classes

Review text, slides, figures, screenshots, notebooks, code, fonts, datasets and model weights separately. In particular:

- A library's license does not license datasets it downloads or models it loads.
- A model-card license does not automatically cover the training corpus, associated images or output rights.
- A notebook's code license does not license its input data, scraped posts, labels, embedded images or third-party outputs.
- A dataset card is evidence, not a substitute for tracing the underlying creator and collection terms. Verify train/test files, annotations and media as applicable.
- A locally drawn SVG may still adapt a source figure. A local filename is not proof of original authorship.
- A public paper may be cited for facts; its diagrams, explanatory prose and supplement code need their own reuse review.
- Synthetic data must be newly authored, documented and evaluated. Do not transplant an old benchmark's queries, labels, examples or measured scores.

Learners receive required credits next to the adapted item or in a clearly linked notice. Downloads carry notices inside the distributed package. A bibliography alone does not satisfy every license's redistribution obligations. Do not remove credit to make an adaptation appear original.

## Required review record

Every new or changed teaching file has a record under `content-rights/reviews/` before publication. A record contains:

- A stable review ID, date and actual reviewer identity; a bounded review summary, not a declaration of universal legal clearance.
- Exact paths and SHA-256 hashes of all reviewed files, including both note languages and relevant local assets.
- For each source: author/owner, title, canonical URL, exact revision or edition, checked locator, use type, material scope, license and license evidence where reuse is intended.
- For reused material: permission scope, preserved attribution, license/NOTICE files and a change description. A specific compatibility/permission record is required for any exception to the default license set.
- For original examples: origin, method and saved verification evidence. Report experiment results only from the recorded run, not from an earlier notebook.
- Claim support, mathematical checks, example execution, bilingual equivalence, figure checks and applicable publication holds.
- For BIASED: the already published fpakhurov.com commit, EN/RU note paths and hashes, and upstream review path/hash. This chain does not waive review of BIASED's added material.

Use `content-rights/review.example.json` for the machine-readable contract. Examples and incomplete reviews are not approvals. A complete record uses `status: reviewed` and `scope: complete`; this means checked for the recorded use, not legal certification. A bounded correction to an existing baseline file may use `scope: maintenance` with the original `baselineRevision`, the exact changed material, and an explicit `remainingReview` statement. Maintenance is not whole-note clearance, cannot create a new teaching file or publish a withheld note, and cannot serve as an approved upstream source for a new BIASED lesson. Automated tooling can validate completeness and freshness, not truthfulness or ownership.

## Enforcement and existing material

`npm run rights:check` checks publication holds and the source-rights gate. CI rejects new or changed teaching files without a matching, current review and rejects stale hashes, missing notices, unsupported default reuse licenses and missing upstream note evidence. BIASED additionally verifies its pinned upstream review against the public fpakhurov.com revision in CI when new reviews are introduced.

The 2026-11-13 baseline is an inventory of existing files, **not clearance**. Unchanged baseline files remain available while the all-course review proceeds; each course and unresolved dependency is tracked in the renewal inventory. No source is approved merely because it predates this policy. A substantive change must leave the baseline path through a new review; do not regenerate the baseline to bypass the gate. Confirmed problematic material is withdrawn promptly, including derivative assessments and downloads. Preserve account progress and issued certificates.

The policy does not authorize contacting source authors, accepting terms, uploading private material or changing the license of our original work. Obtain an appropriate specific authorization when such an action is needed. Keep the decision and evidence in the review.

## Primary policy references

- [GitHub: licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository): public visibility is distinct from a reuse license.
- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), especially section 4: redistribution and notices.
- [CC BY 4.0 legal code](https://creativecommons.org/licenses/by/4.0/legalcode): attribution, modifications and conditions.
- [CC BY-SA 4.0 legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode): adaptation and share-alike conditions.
- [GNU license FAQ](https://www.gnu.org/licenses/gpl-faq.html): apply software obligations to the actual use and distribution, not a generic ban on commercial activity.
