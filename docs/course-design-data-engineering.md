# Course design: Python, SQL, Databases and Big Data

The track follows one change in scale: a program processes records, a query describes an operation over tables, a database manages shared state, and a data platform distributes that state and the work performed on it. The public material is a sequence of self-contained lecture notes. Small executable examples belong inside the explanation.

This document fixes the scope, topic ownership, prerequisite boundaries and handovers. `src/utils/courses.ts` supplies the public course navigation. A planned topic becomes a linked note only after its English and Russian versions, examples, sources and review are complete.

## The route and its prerequisites

The suggested reading order is:

```text
Python -> SQL -> Databases -> Big Data
```

The course prerequisite graph is more precise:

| Course key | Required courses | Entry and exit |
| --- | --- | --- |
| `python` | None | Start with basic computer use. Read and transform records, control memory through iteration, handle failures and release resources. |
| `sql` | None | Start with tables introduced in the opening note. Express queries and changes, explain their results and call SQL safely from a program. |
| `databases` | `sql` | Design a relational model and explain storage, query execution, concurrent changes and recovery. |
| `big-data` | `databases` | Explain distributed storage and computation, analytical models, change delivery and the guarantees of a complete data pipeline. |

SQL remains an independent entry point. The reading route through Python helps readers compare a loop with a declarative query; the full Python course is not a prerequisite for the first SQL query. The closing SQL note requires specific Python concepts. Computational examples in Big Data identify their Python prerequisites individually.

The course graph on `/notes` highlights the reading route. The three course pages are `/notes/sql`, `/notes/databases` and `/notes/big-data`. Russian pages use the `/ru` prefix. Note URLs follow `/notes/<course>/<slug>` and retain the same slug in both languages.

## Python: reuse the existing course

The existing Python course has 22 notes. The first nine form the entry route for this track:

| Reading order | Existing note | What it supplies |
| --- | --- | --- |
| 1 | `python/running-python` | Scripts, interactive execution and reading an error. |
| 2 | `python/values-and-names` | Types, references, mutation and value representation. |
| 3 | `python/control-flow` | Conditions and repeated work. |
| 4 | `python/functions` | Explicit inputs, outputs and reusable transformations. |
| 5 | `python/strings-and-text` | Text, Unicode and the boundary between characters and bytes. |
| 6 | `python/lists-and-tuples` | Sequences, records and the cost of collecting values. |
| 7 | `python/dicts-and-sets` | Keyed lookup, grouping and deduplication. |
| 8 | `python/iteration-and-generators` | Lazy processing, one-pass inputs and bounded memory. |
| 9 | `python/files-and-exceptions` | Files, context managers, failures, CSV and JSON. |

Package installation can link to the existing sections `python/modules-and-packages#why-environments-exist` and `python/modules-and-packages#installing-packages-pip-and-uv`. These are targeted supporting readings, not a claim that the full Modules note has no prerequisites. In the existing course, Modules depends on Closures and decorators, which depends on The data model and Classes and objects. Testing depends on Modules. The route must preserve those dependencies when it recommends complete notes.

Classes, the data model, decorators, type hints, testing and profiling remain useful parts of the wider Python course. CPython internals, concurrency, NumPy, pandas and plotting are additional reading for this track. They do not gate SQL or Databases. The existing machine-learning route through Python stays intact.

No second introduction to CSV, JSON, generators or exceptions is needed. New notes link to their existing homes and restate only the result needed for the current argument.

## SQL: the meaning of an operation over tables

**Entry.** No programming or database course is assumed. A small table and its schema are introduced before the first query. PostgreSQL is the reference dialect for SQL examples; any example checked with another engine identifies its scope and avoids claiming PostgreSQL equivalence without verification.

**Exit.** A reader can determine the rows returned by a query, detect multiplicity and missing-value mistakes, express changes with constraints, use a transaction and issue a parameterized query from Python.

| No. | Note and stable slug | Question answered and depth boundary |
| --- | --- | --- |
| 1 | Tables and the first query — `tables-and-queries` | What is a table, and how does a query turn an input table into a result? Introduce columns, rows, schemas and a complete small example. |
| 2 | Selection and expressions — `select-and-expressions` | How do expressions and predicates select values and rows? Explain aliases and the logical processing order. |
| 3 | Types and NULL — `types-and-null` | What does a value mean, and what happens when it is unknown? Explain coercion, numeric precision and three-valued logic. |
| 4 | Duplicates and order — `duplicates-and-order` | Which repetitions are retained, and when is output order defined? Cover bag semantics, DISTINCT, ORDER BY, LIMIT and tied sort keys. |
| 5 | Grouping and aggregation — `grouping-and-aggregation` | What does one result row represent after grouping? Cover aggregates, GROUP BY, HAVING and NULL handling. |
| 6 | Inner joins — `inner-joins` | Which pairs of rows match? Derive the multiplicity of a join from a small example and relate it to keys. |
| 7 | Outer joins — `outer-joins` | How are unmatched rows retained? Work through NULL extension and ON versus WHERE. |
| 8 | Subqueries and existence — `subqueries-and-exists` | How can a query depend on another result? Cover scalar and correlated subqueries, EXISTS, IN and absent relationships. |
| 9 | Set operations — `set-operations` | How are complete results combined? Cover UNION, INTERSECT, EXCEPT and their duplicate rules. |
| 10 | CTEs and views — `ctes-and-views` | How can a query be decomposed without changing its meaning? Cover named subqueries and logical views; execution choices belong to Databases. |
| 11 | Window functions — `window-functions` | How can a row retain its identity while using neighbouring rows? Cover partitions, order, ranks and offsets. |
| 12 | Window frames — `window-frames` | Which rows contribute to an ordered window? Cover default frames, peer rows, running totals and moving aggregates. |
| 13 | Dates, time and text — `dates-and-text` | How do typed values define periods and transformations? Cover time zones, half-open intervals, calendar grouping and string operations. |
| 14 | Tables and constraints — `tables-and-constraints` | How is an admissible table described? Cover CREATE/ALTER TABLE, PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK and NOT NULL. |
| 15 | Changing data — `changing-data` | How are rows inserted, changed or deleted? Include key conflicts and deterministic insert-or-update behaviour with dialect-specific syntax identified. |
| 16 | Transactions from the client — `transactions` | How do several changes become one visible operation? Cover BEGIN, COMMIT and ROLLBACK; concurrency guarantees are developed in Databases. |
| 17 | SQL from Python — `sql-from-python` | How does a program call SQL safely? Cover connection and cursor lifetimes, DB-API types, parameters versus identifiers, result iteration and transaction boundaries. |

Recursive CTEs are an optional branch of note 10. Explain traversal, termination and cycles there; later courses can link to it. A new standalone recursive-query note needs its own verified sources before it enters the published map.

The Python prerequisites for note 17 are Functions, Dictionaries and sets, Iteration, comprehensions and generators, and Files and exceptions. A driver-specific environment section links to the existing Python environment anchors. Consuming a connection object's methods does not require teaching class implementation again.

## Databases: models, execution and guarantees

**Entry.** The SQL course through transactions. The Python bridge is useful when examples contain client code; the storage and concurrency arguments stand on SQL and their own diagrams.

**Exit.** A reader can choose keys and constraints, normalize a model, explain a physical plan, reason about concurrent updates and distinguish crash recovery from restoring lost or incorrectly changed data.

| No. | Note and stable slug | Question answered and depth boundary |
| --- | --- | --- |
| 1 | Why databases exist — `why-databases` | Which problems arise when files hold shared state? Introduce the DBMS, client/server boundary, connections and sessions. |
| 2 | Modelling a domain — `data-modeling` | Which objects, relationships and identities must the data represent? Cover entities, cardinalities and natural versus surrogate keys. |
| 3 | The relational model — `relational-model` | Which formal model underlies relational operations? Define relations, keys, constraints and algebra; explain the differences from SQL bags and NULL. |
| 4 | Functional dependencies — `functional-dependencies` | Which values determine other values? Derive update, insertion and deletion anomalies from a concrete model. |
| 5 | Normalization — `normalization` | How can a table be decomposed while preserving information? Cover normal forms, lossless decomposition and dependency preservation. |
| 6 | Physical storage — `physical-storage` | How do records occupy storage and reach the processor? Cover pages, record layout, table organization and the buffer pool. |
| 7 | Indexes — `indexes` | How does an extra structure reduce search work? Explain tree and hash access paths together with their write cost. |
| 8 | Index design — `index-design` | Which access path helps a particular query? Cover selectivity, compound keys, column order and covering indexes. |
| 9 | Query execution — `query-execution` | How does a logical query become a physical program? Cover operators, scans, filtering, sorting and aggregation. |
| 10 | Join algorithms — `join-algorithms` | How can the same join result be computed? Compare nested-loop, hash and merge joins using data size, memory and input order. |
| 11 | Query optimization — `query-optimization` | Why does the system choose a particular plan? Cover statistics, cardinality estimates, costs and EXPLAIN. |
| 12 | Transactions and invariants — `transactions-and-invariants` | Which states are admissible, and what does a transaction promise? Explain ACID through a concrete invariant. |
| 13 | Isolation — `isolation` | Which interleavings change the result? Cover schedules, anomalies, isolation levels and serializability. |
| 14 | Locks and MVCC — `locks-and-mvcc` | How are concurrent readers and writers coordinated? Explain blocking, versions, conflicts and deadlocks. |
| 15 | Logging and recovery — `logging-and-recovery` | What survives a process or machine crash? Explain WAL, checkpoints and recovery. |
| 16 | Backups and restore — `backups-and-restore` | How is data restored after loss or a committed mistake? Distinguish recovery points, recovery time and tested restoration. |
| 17 | Roles and permissions — `roles-and-permissions` | Who may read or change which state? Explain owners, roles, grants, restricted access and the limits of views. |
| 18 | Schema evolution — `schema-evolution` | How can a schema change while old and new clients coexist? Cover migrations, compatibility and large-table changes. |
| 19 | Transactional and analytical systems — `transactional-and-analytical-systems` | Why do workloads require different layouts? Introduce OLTP/OLAP and row versus column storage, then hand over to Big Data. |

The closing note introduces analytical workloads and identifies the modelling question. Detailed dimensional modelling, SCD, integration layers and Data Vault belong to Big Data. Replication, sharding and leader selection also begin there; the database course remains focused on the mechanisms within one database system.

## Big Data: distributed state and computation

**Entry.** Databases, including query execution, transactions, recovery and the OLTP/OLAP bridge. Network messages, disk reads and process failures are introduced where the mechanism needs them. Completing the full ACOS or DevOps course is not an entry requirement.

**Exit.** A reader can trace a result from source records through distributed storage and computation, state the ordering and failure assumptions, explain replay and late updates, and compare platform designs by correctness, latency, recovery and cost.

| No. | Note and stable slug | Question answered and depth boundary |
| --- | --- | --- |
| 1 | The limits of one machine — `beyond-one-machine` | Which resource limits volume, throughput or latency? Relate CPU, memory, storage and network capacity to the workload. |
| 2 | The distributed-system model — `partial-failures` | What does a timeout tell us? Introduce messages, partial failures, retries and uncertain outcomes. |
| 3 | Partitioning data — `partitioning` | How is responsibility divided between nodes? Compare range and hash partitioning, key choice, skew and rebalancing. |
| 4 | Replication and failover — `replication` | Which copy can serve a request, and what can be lost? Explain synchronous/asynchronous replication, lag and failover. |
| 5 | Consistency across nodes — `consistency` | What may a reader observe after an update? Explain read guarantees, quorums, leader selection and CAP through a network partition. |
| 6 | Distributed files and object storage — `distributed-storage` | How can storage outlive a compute cluster? Compare the access models of HDFS and object storage and separate storage from compute. |
| 7 | Data formats — `file-formats` | How do schema and encoding change access cost? Explain Avro and Parquet, serialization, columnar layout and compression. |
| 8 | Organizing datasets — `dataset-layout` | Which files must a query read? Cover partition layout, sorting, pruning, small files and compaction. |
| 9 | Tables over files — `table-formats` | What makes many files one consistent table? Explain catalogs, metadata, snapshots, atomic changes and schema evolution through Iceberg. |
| 10 | Distributed analytical databases — `distributed-sql` | How does a SQL query run across a shared-nothing cluster? Explain MPP, coordinators and workers using Greenplum as an example. |
| 11 | Aggregation and shuffle — `distributed-aggregation` | Which operations are local, and which require moving data? Derive partial aggregation and redistribution. |
| 12 | Distributed joins — `distributed-joins` | Where must matching records meet? Compare colocated, broadcast and repartition joins and show the effect of skew. |
| 13 | MapReduce — `mapreduce` | How can a large computation be divided and repeated after failure? Explain map, shuffle and reduce as one execution model. |
| 14 | The Spark execution model — `spark` | How does a lazy computation become tasks? Explain dependencies, stages, actions and recovery of lost work. |
| 15 | The cost of distributed execution — `execution-costs` | What prevents more workers from making a job faster? Cover serialization, caching, spill, task size and slow partitions. |
| 16 | Analytical-platform architectures — `data-platform-architecture` | How are source systems, integration and serving arranged? Compare DWH, data lake and lakehouse and their layers. |
| 17 | Dimensional modelling — `dimensional-modeling` | What does one analytical row represent? Cover grain, facts, dimensions, additivity, events and snapshots. |
| 18 | History and time — `history-in-warehouses` | Which version of a value belongs to an event? Explain SCD, corrections, late facts and valid time versus arrival time. |
| 19 | Full and incremental loading — `full-and-incremental-loads` | Which changes belong to this load? Cover file and API inputs, consistent database snapshots, extraction boundaries, updates and deletions. Locate transformation in ETL and ELT. |
| 20 | Change data capture — `change-data-capture` | How can a source expose committed changes? Explain log-based CDC and the transition from an initial snapshot to a change stream, using Debezium as an example. |
| 21 | Queues and event logs — `event-logs` | How do consumers share and replay events? Explain Kafka partitions, ordering, offsets, consumer groups and reassignment. |
| 22 | Delivery and processing guarantees — `processing-guarantees` | What happens when an operation is retried? Work through loss, duplicate delivery, idempotency and the boundaries of exactly-once claims. |
| 23 | From batch to streams — `batch-and-streaming` | How is a result maintained when input does not end? Compare bounded and unbounded inputs, continuous results and microbatch execution. |
| 24 | Time and windows — `time-and-windows` | When can a time-based result be emitted or revised? Explain event time, processing time, windows, watermarks and late data. |
| 25 | Stateful stream processing — `state-and-checkpoints` | Which past information must a streaming operator retain? Explain stateful aggregates, stream joins, state growth and checkpoints. |
| 26 | Recovering the complete pipeline — `end-to-end-recovery` | How do input position, operator state and external writes agree after failure? Explain replay and source/state/sink coordination with explicit assumptions. |
| 27 | Orchestration and backfills — `orchestration` | Which result is ready to publish? Cover dependencies, processing intervals, retries, historical recomputation and atomic publication. |
| 28 | Data contracts and quality — `data-contracts-and-quality` | Which changes can downstream users accept? Cover schema, uniqueness, completeness, admissible values and semantic checks. |
| 29 | Metadata, catalogs and lineage — `catalogs-and-lineage` | Where did this result come from, and which results depend on it? Explain metadata, ownership, discovery and derivation paths. |
| 30 | Access and privacy — `access-and-privacy` | Which users and systems may use which data? Explain access boundaries, sensitive fields, retention and deletion across copies. |
| 31 | Observing a data system — `data-observability` | How can a correct-looking result still be stale or incomplete? Cover freshness, latency, volume, consumer lag and tracing discrepancies. |
| 32 | Choosing an architecture — `architecture-and-cost` | Which design meets a given requirement? Compare correctness, latency, recovery, operational complexity and cost through worked scenarios. |

Three optional branches follow the core route:

| Branch and reserved slug | Entry and purpose |
| --- | --- |
| Data Vault — `big-data/data-vault` | After Dimensional modelling and History and time. Explain hubs, links, satellites, business keys and integration history; compare the additional machinery with a concrete integration need. |
| Anchor Modeling — `big-data/anchor-modeling` | After History and time and Data Vault. Explain the alternative decomposition, historization and its query and automation costs. |
| Consensus and distributed transactions — `big-data/consensus-and-distributed-transactions` | After Consistency across nodes and Recovering the complete pipeline. Develop consensus algorithms and cross-node commit beyond the leader/quorum concepts already needed in the core. |

The first five core notes explain enough coordination to reason about later guarantees. The optional consensus branch supplies algorithmic depth. A pipeline guarantee cannot depend on an unstated cross-system transaction.

### Python prerequisites inside Big Data

Most Big Data notes can use diagrams, tables and short pseudocode. Executable Python examples declare only the concepts they use:

| Notes | Required Python readings when Python code is present |
| --- | --- |
| Data formats; Organizing datasets; Full and incremental loading | Functions; Strings and text; Dictionaries and sets; Iteration, comprehensions and generators; Files and exceptions. |
| MapReduce | Functions; Dictionaries and sets; Iteration, comprehensions and generators; Files and exceptions. A shell pipeline is explained locally or linked to the existing DevOps shell note. |
| The Spark execution model; The cost of distributed execution | Functions; Dictionaries and sets; Iteration, comprehensions and generators; Files and exceptions; the environment sections of Modules, packages and environments. DataFrame operations are introduced locally; pandas is not assumed. |
| Change data capture; Queues and event logs; Delivery and processing guarantees | Functions; Dictionaries and sets; Iteration, comprehensions and generators; Files and exceptions; SQL from Python for database client code. |
| Stateful stream processing; Recovering the complete pipeline | Functions; Dictionaries and sets; Iteration, comprehensions and generators; Files and exceptions. Any framework-specific state API is introduced where used. |
| Data contracts and quality | Functions; Dictionaries and sets; Files and exceptions. The complete Testing note is supporting reading, not a hidden requirement for understanding a contract. |

No note requires implementation of a Python class, async runtime or cluster deployment merely to explain the systems mechanism. If a future example genuinely needs one, add the exact prerequisite or choose a simpler example.

## Topic ownership and overlap audit

An introductory statement may appear before a topic's home so that a reader can continue. The full argument, derivation or worked failure has one home. Later notes link to its exact anchor and state the assumption needed for their own mechanism.

| Topic | SQL owns | Databases owns | Big Data owns |
| --- | --- | --- | --- |
| Tables and keys | User-visible meaning, minimal DDL and constraint syntax | Identity choice, formal relations, dependencies and normalization | Cross-source keys, integration and analytical identities |
| Relation versus SQL result | Duplicate and NULL behaviour in queries | Formal relational model and its relationship to SQL | Links to the existing definitions |
| JOIN | Matching rows, multiplicity, missing matches and predicate placement | Local algorithms, access paths and plan choice | Placement, network exchange, distributed algorithms and skew |
| Query order | Logical semantics | Physical execution | Distributed stages and exchanges |
| CTEs and views | Meaning and query decomposition | Planning, inlining and materialization decisions | Table metadata and distributed planning where they change the mechanism |
| Transactions | Client operation and COMMIT/ROLLBACK | Invariants, isolation, MVCC, locks, logging and recovery | Replicated state, failures between systems and pipeline guarantees |
| Indexes and layout | A brief pointer when needed | Page-level structures and local access paths | Dataset placement, file pruning and distributed work |
| Time | Timestamp types, zones and interval predicates | Constraints that preserve a model's integrity | Historical models, source changes, event time and late results |
| Analytical data | Queries that compute a measure | Workload and storage-layout bridge | Platform architecture, dimensional models and SCD |
| Data changes | INSERT/UPDATE/DELETE and key-conflict semantics | Concurrent enforcement and schema evolution | Snapshot/CDC boundaries, replay, incremental loads and backfills |
| Access | Parameter binding and the values/identifiers boundary | Roles, ownership and grants within the database | Catalog-wide access, privacy, retention and multiple copies |
| Quality and recovery | Query correctness on explicit small tables | Integrity under concurrent updates, crashes and restore | Contracts, freshness, completeness and recovery of derived results |

Terms that need an explicit distinction:

- SQL is generally a bag language; the formal relation used in the model is a set. A duplicate is not automatically an error.
- A window's `PARTITION BY`, table partitioning and distributed sharding describe different boundaries.
- Logical SQL processing order is separate from a physical operator schedule.
- ACID consistency describes preservation of invariants; replica consistency describes what distributed observations may see.
- A crash-recovery journal, a backup and a retained event log serve different recovery tasks.
- File compaction and storage-engine compaction need their own mechanisms if both appear. The core dataset note explains the file-level operation.
- A source watermark used to bound an extraction and an event-time watermark used by a stream processor must be defined in their own context.

### Gaps closed by this design

1. SQL from Python connects the language to a program and makes parameter binding, type conversion, resource lifetime and transaction boundaries explicit.
2. The database introduction defines clients, sessions and connections before they appear in replication or CDC examples.
3. Roles and permissions has a database-level home before the platform-level privacy discussion.
4. DML includes conflict handling before Big Data introduces idempotent incremental loading.
5. Distributed guarantees name their source, state and sink assumptions; the optional consensus branch cannot hide a missing core assumption.
6. Catalog and lineage have their own note. Access and privacy have a separate note, with enough space to explain copies and deletion.
7. The Python route names its actual prerequisites and avoids forcing interpreter internals or scientific libraries into SQL entry requirements.

## Handovers between courses

### Python to SQL

The last Python reading in the entry route can process CSV rows lazily and release the file after an error. A small record-processing example provides the handover: a loop filters rows and totals a quantity; the equivalent SQL states the input, condition and aggregate. The SQL opening explains the declarative result before discussing how a database executes it. A standalone SQL reader receives the input table directly.

The last note in the Python entry route links to the SQL opening alongside its continuation in Python.

### SQL to Databases

A query now has a defined result and a program can execute it. The reader still has to choose a schema, explain an expensive join and decide what happens when two clients change the same state. The closing SQL bridge names these questions and links to the database introduction when it is published.

An order-and-payment example can connect transaction commands to invariants. A join that multiplies rows connects query semantics to modelling; the same join later connects to its physical execution plan.

### Databases to Big Data

The database course ends with the workload that requires analytical scans and a different physical layout. A larger dataset or several independent sources introduces limits that indexes and one local transaction cannot settle. The Big Data opening starts from those limits and states the resource assumptions explicitly.

The later handovers reuse the familiar mechanisms: a local join becomes a network exchange, WAL becomes a source for CDC, and an atomic local change becomes a question about agreement across nodes and systems. Normalization, join semantics and isolation are linked rather than derived again.

### Big Data to the neighbouring courses

DevOps supplies the broader treatment of shell tools, builds, containers, deployment, service observability and infrastructure. Big Data explains the data-specific meaning of checkpoints, freshness, replay and derived-state recovery. Installation of Kubernetes or a production cluster is outside this track's lecture-note scope.

MLOps uses the resulting data guarantees for training data, features, reproducibility and model monitoring. Model training, serving and training-serving skew retain their homes in MLOps. New track notes can link to them as applications.

## A shared worked example

Use a small, fully synthetic retail dataset when a common example makes the connection easier to see: orders, order lines, products, payments and returns. Each note supplies every row or assumption it needs. Reading another course is unnecessary just to obtain the example data.

SQL explains row multiplicity and the meaning of a measure. Databases explains keys, constraints, plans and simultaneous updates. Big Data introduces a second source, a late return, a repeated change or a failed worker one assumption at a time. The worked example is explanatory material, not a project or an assessed task.

Keep identifiers, currency units, timestamp conventions and definitions of measures consistent. Declare the row grain before each aggregate. Derive or execute every quoted count and total; store the verification with the relevant change rather than inventing benchmark results.

## Sources and evidence

Each authored note has **three or four distinct sources that were read for that note**. Each reference supports a specific definition, mechanism, result or comparison in the body. Several links into one manual count as one source; a long bibliography does not replace verification. Prefer primary documentation, original papers and a textbook for the surrounding argument. Cite the exact chapter, section or result when the claim needs it.

The count is a writing constraint, not a reason to pad the list. If three relevant sources have not been checked, keep the topic planned and complete the source work before publishing. A source accepted for one note is a candidate for the next until its relevant passage is checked again.

The user-supplied [Modern Storages and Data Warehousing repository](https://github.com/mgcrp/hse_ftda_dwh_course_2026) is a curriculum reference. Its tree was inspected on 5 November 2026; the tree object was `e4c38bbe167225725e87433f641e08b37c26de8e`. This is a Git tree identifier, not an asserted release or commit. The material includes a separate `week07/week07_dwh.pdf` covering analytical models, SCD, Data Vault and Anchor Modeling, beyond the topics listed in its README schedule. The inspected reference does not establish that any future note's technical claims have been verified.

Keep downloaded PDFs, scans, books and recordings outside the public repository. New lecture notes explain the concepts in their own sequence and cite their checked sources. They do not transcribe slides or describe their production from source material.

The following are **source candidates**, not a completed verification log:

| Area | Candidates to check when the note is authored |
| --- | --- |
| SQL | PostgreSQL's Tutorial and SQL Language manuals; Codd's relational-model paper where the formal model matters; a database textbook such as *Database System Concepts*; Python's DB-API specification and the chosen driver's documentation for the client bridge. |
| Storage and execution | PostgreSQL's storage, indexing, EXPLAIN and concurrency documentation; *Database System Concepts*; original papers on the specific access path or mechanism being explained. |
| Distributed state | *Designing Data-Intensive Applications*; original papers on consistency, consensus or commit when those results are used; the relevant database's replication documentation. |
| Files and tables | HDFS documentation; the object-store API documentation; Avro, Parquet and Iceberg specifications and design documentation. |
| Computation | The original MapReduce paper; Spark's execution and SQL documentation; original Spark papers; the analytical database's distribution and query-planning documentation. |
| Analytical modelling | The inspected HSE DWH material; dimensional-modelling literature; the relevant original or authoritative Data Vault and Anchor Modeling publications for their optional branches. |
| Change delivery and streams | Kafka and Debezium documentation; the Dataflow model paper; Flink's event-time, state and checkpoint documentation; sink-specific transactional guarantees. |
| Platform guarantees | Documentation for the exact scheduler, catalog or storage mechanism discussed; checked literature on data contracts, lineage, privacy and operational measurement. |

Future authoring records the chosen three or four sources, the checked passages, the assumptions of each claim and the date/version relevant to executable examples. A plan entry remains planned until that record and the note are complete.

## Authoring and review

Follow `docs/course-writing.md`: open from a concrete problem, introduce the mechanism through a small example, justify the general statement, work through a failure and hand over to the next unresolved question. Symbols are defined where used. Systems claims explain the state transition or messages that make them hold.

Both language versions are authored together. Preserve definitions, conditions, examples, numbers, figures, code and reference coverage across English and Russian. SQL syntax and identifiers remain consistent. New code comments and console output use plain English.

Notes use code examples when these make the mechanism checkable. They have no compulsory Notebook section, quizzes, self-checks, project deliverables or assignments. Do not manufacture a notebook or a baseline comparison to fill a template.

Each authored note receives two independent reviews:

1. **Sources and storyline:** verify the checked references, factual conditions, ownership boundary, prerequisites and handovers. Check that a reader can understand the note from its stated entry requirements.
2. **Semantics, numbers and figures:** verify SQL results or systems traces, numerical examples, derivations, failure scenarios and diagram labels. Execute examples on the stated engine/runtime and inspect the rendered figures.

Resolve valid findings and record the reason for rejecting a finding. Review English and Russian together so a correction cannot leave the other version stale.

## Initial implementation and publication state

The first release puts all three outlines on the shared course graph and opens each course with bilingual notes. The existing Python course supplies the entry readings. The remaining topics were initially marked as planned. The complete release includes 17 SQL notes, 19 Databases notes and 35 Big Data notes, including all three extensions.

Planned course entries can be visible with their published-note counts and planned topics, but planned notes have no article links or fabricated completed status. Avoid links to future `Next` targets until their routes exist; name the next problem and link to the course plan instead. Counts and progress are calculated from real published notes.

The first SQL note was checked on PostgreSQL 18.6 through PGlite and reviewed in both languages. The full production build runs in GitHub Actions before merge. Deployment uses the build from `main`.

Before a change is ready for publication:

- Run the strict `npm run build` and the repository's content, prerequisite and translation checks. `COURSE_LENIENT=1` is only a drafting tool.
- Check the course map against note order and sections; every published note has a real route, and each planned entry remains an unlinked topic.
- Check internal links and anchors, duplicate IDs, math rendering and the source-word/private-link scans required by the writing guide.
- Execute the note's examples and compare their printed or tabular results with the body, figures and Russian translation.
- Inspect the changed course navigation and note at wide and mobile widths, in light and dark themes. Check text, diagrams and table overflow; record a usable preview or screenshot.
- Confirm that each new note has three or four checked references and that both reviews are resolved.
- Keep local implementation, a pushed branch, successful CI and verified production deployment as separate states in the final report.
