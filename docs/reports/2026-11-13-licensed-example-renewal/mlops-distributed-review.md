# MLOps renewal: distributed training

Reviewed 2026-11-13. Scope: complete replacement English and Russian note, direct inline content, original standard-library implementation and saved output. This does not approve the remaining MLOps or systems topics. Independent coordinator review and integrated publication checks remain separate.

## Replacement boundary

Both complete teaching bodies were newly composed for Fedor Pakhurov's project with Codex assistance. No old course/book narrative, original figure layout, long NumPy listing or measured training result remains in the replacement. Curriculum IDs, order, prerequisites and explicit anchors are preserved. The description was updated because the new explicit dtype layout replaces a misleading universal sixteen-bytes framing.

The new English body is about 2,600 words and the Russian body about 2,440, developing mechanisms, derivations, failures, tradeoffs and limitations. General algorithm credit remains with primary sources: ZeRO and GPipe papers, plus official PyTorch and NCCL mechanism documentation. Those sources are references, not reused teaching assets. No source license badge is treated as clearance for an external experiment or model.

The complete scope and exact file hashes are in `content-rights/reviews/mlops-distributed-training-renewal.json`.

## Original cases and actual results

- Unequal worker batches contain one, two and three original scalar pairs. Gradient sums are 1, 1 and 10. The intended six-example mean is 2; equal averaging of worker means gives 29/18. Learning rate 1/10 updates the original weight 1 to 4/5. This isolates loss normalization without networking or floating-point ambiguity.
- A newly written three-rank integer ring divides twelve coordinates into three chunks. Two reduction and two distribution rounds produce `[-3,0,3,6,9,12,15,18,21,24,27,30]` at every rank. Every intermediate state is saved. Each rank sends sixteen values, modeled as 64 payload bytes. Python object allocation is not claimed to be that payload representation.
- A stipulated twelve-million-parameter layout uses two bytes for working parameters, four for gradients and twelve for master parameters plus optimizer moments. Persistent per-rank amounts are 216/120/88/72 decimal MB under the four specified sharing arrangements. Activations, buffers, temporary gathered groups and allocator overhead are explicitly excluded. A three-rank ring of the declared 48 MB full gradient sends 64 MB per rank; no timing is inferred.
- Original matrix multiplication gives `[-3,3]`. Input-partition partials are `[0,-3]` and `[-3,6]`; reducing before ReLU gives `[0,3]`, while applying ReLU first gives `[0,6]`. This demonstrates the boundary at a nonlinear operation without copying a source diagram.
- A generated balanced three-stage fill-and-drain schedule uses 6/14/22 slots for 1/5/9 microbatches, with occupied stage-slot fractions 1/3, 5/7 and 9/11. Every operation is assigned a slot and dependency constraints are asserted. These are abstract operation counts, not measured GPU utilization.
- An original nine-layer affine chain maps input 2 to output 25. For half-square loss, its input gradient is 200. Full storage and three-boundary replay give identical nine weight gradients. The simple replay performs nine extra forward operations. Storage figures describe algorithm requirements; the verification program deliberately keeps reference arrays and does not measure peak memory.

## Dependencies and retired assets

The linked `scripts/notes/mlops-distributed-cases.py` uses only Python's standard library. It loads no package, external dataset, model, device, service or network resource. Exact generated records live in `docs/reports/2026-11-13-licensed-example-renewal/mlops-distributed-results.json`.

Removed after scanning for remaining imports:

- `src/components/figures/distributed-training/RingAllReduce.astro`
- `src/components/figures/distributed-training/ZeroMemory.astro`
- `src/components/figures/distributed-training/PipelineBubble.astro`

The new note imports no teaching component. Tables, equations and the inline gradient program are original direct content. Shared unchanged renderer and runtime notices remain outside this per-topic review.

## Primary source checks

Read official PyTorch 2.15 DDP internal design, FSDP2 communication groups and resharding/prefetch descriptions, and checkpoint replay/RNG caveats. Read NCCL 2.32.3 collective semantics and participation requirements. Read ZeRO arXiv:1910.02054v3 and GPipe arXiv:1811.06965v5 primary HTML at the mechanism sections, and verified author names against the primary metadata. No paper benchmark, table, illustration or source code is reproduced. No framework API demonstration is claimed to have executed.

## Executed verification

Full fixture execution generated the saved JSON, and a fresh process reproduced the bytes exactly. Each inline block executes to the displayed stdout. All 49 mathematical spans and the Python block match between locales. Closed-form products independently verify every affine-chain weight gradient and input gradient. The ring is checked against a direct coordinate sum and the pipeline against operation dependency order. Both final MDX bodies compile with strict KaTeX and local heading processing. Previous explicit anchors are preserved.

No heavy build, browser check, GPU experiment, NCCL/PyTorch runtime validation or production publication is claimed. Independent reviewer pass is pending; final integrated rights/practice/build checks belong to the coordinator's selected publication snapshot.

## Independent review

A second agent read all EN/RU bodies, complete scripts, saved results, provenance reports and old examples to check the replacement boundary. Fresh stdout matched the saved JSON. Independent calculations verified the polynomial/Fraction gradient, per-phase ring source-contribution sets, pipeline dependencies, checkpoint finite differences; the separate rollout pass exhaustively counted all 2^20 paths and checked planning totals 4780/7469/13278, intervals, pooled test, noninferiority, SRM, balanced draft trace and mixture reversal. All 49 distributed and 24 rollout math spans and inline code agree across locales.

Primary comparison covered PyTorch 2.15 DDP/FSDP/checkpoint, NCCL 2.32.3, ZeRO v3 Section 4, GPipe v5 Section 2; SRE canary, NIST test/CI, primary SRM/Johari/Thompson abstracts and team-draft Section 5.2. The fixtures and results differ from the source examples; conceptual credit remains. Abstract-only evidence was not promoted to full-text inspection. Final rollout descriptions and the RU covariance qualifier were reread after correction. No remaining blocker was found within this full file-level technical/bilingual/source-comparison scope; this is not legal certification, runtime testing or production validation.
