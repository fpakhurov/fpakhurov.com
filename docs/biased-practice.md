# Contextual practice links

Published notes may end with one optional invitation to answer the corresponding
questions on BIASED. The article stays self-contained. The invitation adds no
quiz, purchase prompt or account requirement to fpakhurov.com.

`src/components/BiasedPractice.astro` renders through the shared `NoteLayout` in
both languages, after the article and before previous/next navigation. It uses
the note's exact collection id. A note without a verified match gets no invitation.
The single action says “Practice on BIASED” / «Проверить себя в BIASED».
Two targets are shown by their separate translated names for VAE and Gibbs
sampling; no title or course-slug similarity is used to choose a target.

## Catalogue provenance and refresh

`src/data/biasedPractice.json` is a generated snapshot of public routing
metadata: course and topic ids, translated titles and the explicit `sourceNote`
URL. Its provenance records the BIASED catalogue revision hash, never a local
path, question, answer key or personal data. The initial snapshot contains 284
available question-based topics mapped to 282 published note ids. The 71 SQL,
Databases and Big Data notes currently have no matching BIASED topics and are
omitted.

To refresh from an authorized local BIASED checkout with its normal dependencies:

```sh
npm run practice:generate -- --biased-repo /path/to/biased-school
npm run practice:generate -- --biased-repo /path/to/biased-school --check
```

The generator runs that checkout's own content-schema loader. Only available
topics referenced by an available course, with actual core questions, are kept.
`sourceNote` must name an existing published note on fpakhurov.com. English and
Russian source URLs share the same id; source fragments remain in the snapshot.
Catalogue order determines the order of the named actions. Uncommitted catalogue
changes are rejected. `--check` compares the exact public mapping without writing;
unrelated BIASED application commits do not require regenerating identical data.
Review the generated diff before publication. CI needs only the public snapshot,
not access to the BIASED repository.

## Entry and attribution

Every action points directly to `/learn/<course>/<topic>` with `lang=en|ru`,
`mode=deep` and `#check-yourself`. It opens the existing practice boundary on
BIASED; no new free-access or paid-access policy is implied by the invitation.

Campaign labels follow the BIASED analytics contract:

| Parameter | Value |
|---|---|
| `utm_source` | `fpakhurov_com` |
| `utm_medium` | `referral` |
| `utm_campaign` | `course_practice` |
| `utm_content` | The exact source note id with `/` replaced by `--`; long ids get a stable hash suffix within 64 characters. |
| `utm_term` | The BIASED course slug. |

Labels contain only lowercase letters, digits, underscores and hyphens. The
target route identifies the matching course and topic; `site_entry` receives
the public campaign tags. Native links preserve ordinary browser navigation.

## Validation

```sh
npm run practice:check
npm run build
npm run practice:check -- --dist dist
```

The prebuild check verifies exact source ids, public-only fields, bilingual
titles, unique targets and URL/UTM constraints. The rendered check examines every
English and Russian note page, verifies target URLs and source fragments, checks
invitation placement, and confirms unmatched notes have no invitation. Inspect
single-target, VAE, Gibbs and unmatched notes at 320 px and desktop widths in
both colour schemes. Notes retain their existing reading order and navigation.
