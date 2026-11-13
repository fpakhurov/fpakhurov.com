# Mulberry32 shared-helper provenance

Primary sources checked 2026-11-13 by Codex `course_licenses`. Attribution is now delivered in public/licenses/mulberry32.txt, linked from THIRD_PARTY_NOTICES.txt and next to all four surviving implementations. Runtime code is unchanged.

- [bryc/code, `jshash/PRNGs.md`](https://github.com/bryc/code/blob/88c1317ea6f9b25c153afa9c369c365fed11b482/jshash/PRNGs.md), commit `88c1317ea6f9b25c153afa9c369c365fed11b482`, file blob `5b58125493d8043cc416bd035b8f24fa8843e006`. The document itself starts with **“License: Public domain.”** Its Mulberry32 section supplies the JavaScript implementation and links Tommy Ettinger's original C implementation.
- [Tommy Ettinger's original `mulberry32.c`](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c/fc93b8ad259c09a3635d80ed12a05309120795dc), gist revision `fc93b8ad259c09a3635d80ed12a05309120795dc`, raw file revision `8fe823ef157841986a99f272a3840fa3fae26f81`. Its header expressly dedicates copyright and neighboring rights to the public domain worldwide, disclaims warranty, and links CC0 1.0.

`src/components/figures/random.ts` and the `seeded` function in `geometry.ts` use this distinctive increment/shift/multiply sequence. Their TypeScript wrappers, variable names and signed/unsigned normalization differ, but the generator's source identity should be credited. The grant applies to this code, not to arbitrary sources rendered using it. Mathematical Box–Muller normal sampling is separate from the PRNG code.

## Delivered public notice

```text
Mulberry32 pseudorandom generator
Original algorithm/C implementation: Tommy Ettinger (2017), CC0-1.0.
JavaScript implementation: bryc, public-domain dedication in PRNGs.md.
Local changes: typed seeded closures, naming and explicit 32-bit coercions
for reproducible teaching illustrations.

Original source:
https://gist.github.com/tommyettinger/46a874533244883189143505d203312c/fc93b8ad259c09a3635d80ed12a05309120795dc
JavaScript source:
https://github.com/bryc/code/blob/88c1317ea6f9b25c153afa9c369c365fed11b482/jshash/PRNGs.md#mulberry32
CC0:
https://creativecommons.org/publicdomain/zero/1.0/

Written in 2017 by Tommy Ettinger.
To the extent possible under law, the author has dedicated all copyright
and related and neighboring rights to this software to the public domain
worldwide. This software is distributed without any warranty.

JavaScript source declaration: License: Public domain.
```

A short source comment should link this notice next to each surviving implementation. Do not relabel bryc's dedication as MIT or assume a repository-wide license file: the applicable declaration is embedded in the source document. The generator is used for small deterministic teaching figures; this review does not certify it for cryptography or statistical simulation. No runtime or sequence change is required to add provenance.

Implementation validation: the comment-free TypeScript transpilation was byte-identical before/after in random.ts, geometry.ts, em-and-bayesian-pca/bpca.ts and variational-inference/ng.ts. Shared wrappers matched 40,000 draw pairs over four seeds. Exact fingerprints and sample sequences are saved in mulberry32-runtime-check.json. The first two files have a complete scoped helper review; the two embedded copies and existing notice index have maintenance coverage only. This does not clear their consumer notes.
