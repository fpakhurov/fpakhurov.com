import type { Course, CourseKey } from './courses';

type Text = readonly [en: string, ru: string];
export type DataCourseKey = 'sql' | 'databases' | 'big-data';
export interface DataTopic {
  slug: string;
  title: Text;
  available?: boolean;
}
interface DataSection {
  title: Text;
  summary: Text;
  outcome: Text;
  topics: DataTopic[];
  optional?: boolean;
}
interface DataCoursePlan {
  key: DataCourseKey;
  title: Text;
  shortTitle: Text;
  description: Text;
  entry: Text;
  requires: CourseKey[];
  sections: DataSection[];
}

const topic = (slug: string, en: string, ru: string, available = false): DataTopic => ({ slug, title: [en, ru], available });

// A reading route can include a useful introduction without making the whole course a prerequisite.
export const dataTrackOrder = ['python', 'sql', 'databases', 'big-data'] as const;

export const dataCoursePlans: DataCoursePlan[] = [
  {
    key: 'sql', title: ['SQL', 'SQL'], shortTitle: ['SQL', 'SQL'], requires: [],
    description: ['Express a question about tables as a query and explain every row of its result: selection, joins, aggregation and windows, then changes, transactions and SQL from Python.', 'Выразить вопрос к таблицам запросом и объяснить каждую строку результата: выборка, соединения, агрегация и окна, затем изменения, транзакции и SQL из Python.'],
    entry: ['Start without programming experience. The data-engineering route places basic Python first, but SQL can be read independently. Examples use PostgreSQL syntax. Python is needed only for the closing connection to a program; recursive CTEs are optional depth.', 'Можно начинать без опыта программирования. В треке инженерии данных сначала идёт базовый Python, но SQL можно читать самостоятельно. Примеры используют синтаксис PostgreSQL. Python нужен только для заключительного перехода к работе из программы; рекурсивные CTE — дополнительный материал.'],
    sections: [
      {
        title: ['Reading Tables', 'Чтение таблиц'],
        summary: ['From a row with a defined meaning to a predictable query result.', 'От строки с определённым смыслом к предсказуемому результату запроса.'],
        outcome: ['Explain selection, projection, NULL, duplicates and ordering on a small table.', 'Объяснять выборку, проекцию, NULL, дубликаты и порядок строк на маленькой таблице.'],
        topics: [
          topic('tables-and-queries', 'Tables and the first query', 'Таблицы и первый запрос', true),
          topic('select-and-expressions', 'Expressions and filtering', 'Выражения и фильтрация', true),
          topic('types-and-null', 'Types and NULL', 'Типы и NULL', true),
          topic('duplicates-and-order', 'Duplicates and ordering', 'Дубликаты и порядок строк', true),
        ],
      },
      {
        title: ['Combining Rows', 'Объединение строк'],
        summary: ['Group rows and combine tables while keeping track of multiplicity.', 'Группировать строки и соединять таблицы, сохраняя контроль над кратностью.'],
        outcome: ['Predict counts and sums after a join and explain missing or repeated rows.', 'Предсказывать количества и суммы после соединения и объяснять пропавшие или повторяющиеся строки.'],
        topics: [
          topic('grouping-and-aggregation', 'Grouping and aggregation', 'Группировка и агрегация', true),
          topic('inner-joins', 'Inner joins', 'Внутренние соединения', true),
          topic('outer-joins', 'Outer joins', 'Внешние соединения', true),
          topic('subqueries-and-exists', 'Subqueries and existence', 'Подзапросы и проверка существования', true),
          topic('set-operations', 'Set operations', 'Операции над результатами', true),
        ],
      },
      {
        title: ['Structuring Queries', 'Построение запросов'],
        summary: ['Compose queries and calculate over related rows without collapsing them.', 'Составлять запросы и считать по связанным строкам, сохраняя сами строки.'],
        outcome: ['Explain a window frame, a time boundary and the intermediate results of a CTE.', 'Объяснять оконную рамку, границу временного интервала и промежуточные результаты CTE.'],
        topics: [
          topic('ctes-and-views', 'Common table expressions and views', 'CTE и представления', true),
          topic('window-functions', 'Window functions', 'Оконные функции', true),
          topic('window-frames', 'Window frames', 'Оконные рамки', true),
          topic('dates-and-text', 'Dates, time and text', 'Даты, время и текст', true),
        ],
      },
      {
        title: ['Changing Data', 'Изменение данных'],
        summary: ['Define tables, change rows and group changes into one operation.', 'Определять таблицы, изменять строки и объединять изменения в одну операцию.'],
        outcome: ['Use constraints and conflict handling, and explain what commit or rollback changes.', 'Использовать ограничения и обработку конфликтов и объяснять результат commit или rollback.'],
        topics: [
          topic('tables-and-constraints', 'Tables and constraints', 'Таблицы и ограничения', true),
          topic('changing-data', 'Changing rows and handling conflicts', 'Изменение строк и обработка конфликтов', true),
          topic('transactions', 'Transactions at the client', 'Транзакции со стороны клиента', true),
        ],
      },
      {
        title: ['Python and SQL', 'Python и SQL'],
        summary: ['Connect a program to a database without mixing query text with values.', 'Соединить программу с базой данных, разделяя текст запроса и значения.'],
        outcome: ['Explain parameters, result types, resource cleanup and transaction boundaries in a Python client.', 'Объяснять параметры, типы результата, освобождение ресурсов и границы транзакции в Python-клиенте.'],
        topics: [topic('sql-from-python', 'SQL from Python', 'SQL из Python', true)],
      },
    ],
  },
  {
    key: 'databases', title: ['Databases', 'Базы данных'], shortTitle: ['Databases', 'Базы данных'], requires: ['sql'],
    description: ['Design a data model and follow a query through storage, indexes and execution, then explain concurrent changes, recovery and the boundary between transactional and analytical systems.', 'Спроектировать модель данных и проследить путь запроса через хранение, индексы и выполнение, затем объяснить конкурентные изменения, восстановление и границу транзакционных и аналитических систем.'],
    entry: ['Read SQL through constraints and client transactions, or know the same material. The Python client chapter is a separate bridge. Pages, memory, input/output and network sessions are introduced when needed; a full operating-systems course is optional background.', 'Перед началом: SQL до ограничений и транзакций со стороны клиента либо эквивалентные знания. Python-клиент — отдельный мост. Страницы, память, ввод-вывод и сетевые сессии вводятся по мере необходимости; полный курс ОС — дополнительная опора.'],
    sections: [
      {
        title: ['Models and Integrity', 'Модели и целостность'],
        summary: ['Turn a domain into relations and make its invariants explicit.', 'Перевести предметную область в отношения и явно задать её инварианты.'],
        outcome: ['Choose keys and decompose a schema without losing information.', 'Выбирать ключи и декомпозировать схему без потери информации.'],
        topics: [
          topic('why-databases', 'Why databases exist', 'Зачем нужны базы данных', true),
          topic('data-modeling', 'From a domain to a data model', 'От предметной области к модели', true),
          topic('relational-model', 'The relational model and algebra', 'Реляционная модель и алгебра'),
          topic('functional-dependencies', 'Functional dependencies', 'Функциональные зависимости'),
          topic('normalization', 'Normalization and decomposition', 'Нормализация и декомпозиция'),
        ],
      },
      {
        title: ['Storage and Execution', 'Хранение и выполнение'],
        summary: ['Explain how the same SQL result can have very different execution costs.', 'Объяснить, почему один результат SQL может иметь разную стоимость выполнения.'],
        outcome: ['Read a physical plan and justify an index or a join algorithm.', 'Читать физический план и обосновывать индекс или алгоритм соединения.'],
        topics: [
          topic('physical-storage', 'Pages, records and the buffer pool', 'Страницы, записи и буферный пул'),
          topic('indexes', 'Indexes and access paths', 'Индексы и пути доступа'),
          topic('index-design', 'Designing an index', 'Проектирование индекса'),
          topic('query-execution', 'From SQL to execution', 'От SQL к выполнению'),
          topic('join-algorithms', 'Join algorithms', 'Алгоритмы соединения'),
          topic('query-optimization', 'Statistics and query optimization', 'Статистики и оптимизация запросов'),
        ],
      },
      {
        title: ['Concurrency and Recovery', 'Конкурентность и восстановление'],
        summary: ['Keep invariants while operations overlap and machines fail.', 'Сохранять инварианты при пересечении операций и сбоях машины.'],
        outcome: ['Explain an isolation anomaly and distinguish crash recovery from restoring a backup.', 'Объяснять аномалию изоляции и различать восстановление после сбоя и восстановление из резервной копии.'],
        topics: [
          topic('transactions-and-invariants', 'Transactions and invariants', 'Транзакции и инварианты'),
          topic('isolation', 'Isolation and serializability', 'Изоляция и сериализуемость'),
          topic('locks-and-mvcc', 'Locks and MVCC', 'Блокировки и MVCC'),
          topic('logging-and-recovery', 'Logging and recovery', 'Журналирование и восстановление'),
          topic('backups-and-restore', 'Backups and restoration', 'Резервные копии и восстановление'),
        ],
      },
      {
        title: ['Operating a Data Model', 'Жизнь модели данных'],
        summary: ['Control access, change the schema and recognize a different workload.', 'Управлять доступом, менять схему и распознавать другую нагрузку.'],
        outcome: ['Explain roles, a compatible migration and the move from OLTP to OLAP.', 'Объяснять роли, совместимую миграцию и переход от OLTP к OLAP.'],
        topics: [
          topic('roles-and-permissions', 'Roles and permissions', 'Роли и права доступа'),
          topic('schema-evolution', 'Schema evolution', 'Эволюция схемы'),
          topic('transactional-and-analytical-systems', 'Transactional and analytical systems', 'Транзакционные и аналитические системы'),
        ],
      },
    ],
  },
  {
    key: 'big-data', title: ['Big Data', 'Большие данные'], shortTitle: ['Big Data', 'Большие данные'], requires: ['databases'],
    description: ['Follow data beyond one database and one machine: distributed storage and computation, analytical warehouses, change capture, streams and the guarantees of the complete data pipeline.', 'Проследить путь данных за пределами одной базы и одной машины: распределённое хранение и вычисления, аналитические хранилища, захват изменений, потоки и гарантии всей цепочки обработки.'],
    entry: ['Start after Databases. Basic Python is used for computational examples; its first nine notes are enough to enter, with precise background links when more is needed. Data Vault, Anchor Modeling and the detailed consensus and distributed-transaction branch are optional.', 'Начинать после баз данных. В вычислительных примерах используется базовый Python; для входа достаточно первых девяти заметок, дальнейшие знания связываются точными ссылками. Data Vault, Anchor Modeling и подробный разбор консенсуса и распределённых транзакций — дополнительные ветки.'],
    sections: [
      {
        title: ['Beyond One Machine', 'За пределами одной машины'],
        summary: ['Distribute state while making failures and guarantees explicit.', 'Распределить состояние, явно описав сбои и гарантии.'],
        outcome: ['Distinguish partitioning from replication and explain a read during a network partition.', 'Различать партиционирование и репликацию и объяснять чтение при сетевом разделении.'],
        topics: [
          topic('beyond-one-machine', 'The limits of one machine', 'Пределы одной машины', true),
          topic('partial-failures', 'Partial failures and timeouts', 'Частичные отказы и тайм-ауты', true),
          topic('partitioning', 'Partitioning and rebalancing', 'Партиционирование и перераспределение'),
          topic('replication', 'Replication and failover', 'Репликация и переключение после сбоя'),
          topic('consistency', 'Consistency between nodes', 'Согласованность между узлами'),
        ],
      },
      {
        title: ['Files and Tables', 'Файлы и таблицы'],
        summary: ['Separate storage from compute and recover the guarantees of a table.', 'Разделить хранение и вычисления и восстановить гарантии таблицы.'],
        outcome: ['Explain a file layout, a table snapshot and the cost of small files.', 'Объяснять размещение файлов, снимок таблицы и стоимость маленьких файлов.'],
        topics: [
          topic('distributed-storage', 'Distributed files and object storage', 'Распределённые файлы и объектное хранение'),
          topic('file-formats', 'File formats: Avro and Parquet', 'Файловые форматы: Avro и Parquet'),
          topic('dataset-layout', 'Dataset layout and compaction', 'Размещение данных и compaction'),
          topic('table-formats', 'Table formats and snapshots', 'Табличные форматы и снимки'),
        ],
      },
      {
        title: ['Distributed Computation', 'Распределённые вычисления'],
        summary: ['Execute familiar operations when data and workers are spread across a cluster.', 'Выполнять знакомые операции, когда данные и исполнители распределены по кластеру.'],
        outcome: ['Trace a distributed join and justify its network, memory and recovery costs.', 'Разбирать распределённое соединение и обосновывать его затраты на сеть, память и восстановление.'],
        topics: [
          topic('distributed-sql', 'Distributed SQL and MPP', 'Распределённый SQL и MPP'),
          topic('distributed-aggregation', 'Distributed aggregation and shuffle', 'Распределённая агрегация и shuffle'),
          topic('distributed-joins', 'Distributed joins', 'Распределённые соединения'),
          topic('mapreduce', 'The MapReduce model', 'Модель MapReduce'),
          topic('spark', 'The Spark execution model', 'Модель выполнения Spark'),
          topic('execution-costs', 'The cost of distributed execution', 'Стоимость распределённого выполнения'),
        ],
      },
      {
        title: ['Analytical Warehouses', 'Аналитические хранилища'],
        summary: ['Integrate sources into a model with a defined grain and history.', 'Объединить источники в модель с определённой гранулярностью и историей.'],
        outcome: ['Choose a fact-table grain and explain a historical correction without double counting.', 'Выбирать гранулярность таблицы фактов и объяснять историческое исправление без двойного счёта.'],
        topics: [
          topic('data-platform-architecture', 'DWH, data lake and lakehouse', 'DWH, data lake и lakehouse'),
          topic('dimensional-modeling', 'Dimensional modeling', 'Размерное моделирование'),
          topic('history-in-warehouses', 'History in a warehouse', 'История в хранилище'),
        ],
      },
      {
        title: ['Delivering Changes', 'Доставка изменений'],
        summary: ['Move from a consistent initial snapshot to a replayable stream of changes.', 'Перейти от согласованного начального снимка к воспроизводимому потоку изменений.'],
        outcome: ['Explain snapshot-to-log handover, deletions, duplicates and the boundary of delivery guarantees.', 'Объяснять переход от снимка к журналу, удаления, дубликаты и границу гарантий доставки.'],
        topics: [
          topic('full-and-incremental-loads', 'Full and incremental loads', 'Полная и инкрементальная загрузка'),
          topic('change-data-capture', 'Change data capture', 'Захват изменений'),
          topic('event-logs', 'Queues and event logs', 'Очереди и журналы событий'),
          topic('processing-guarantees', 'Delivery and processing guarantees', 'Гарантии доставки и обработки'),
        ],
      },
      {
        title: ['Streams and State', 'Потоки и состояние'],
        summary: ['Keep a correct evolving result when events arrive late and workers restart.', 'Поддерживать корректный меняющийся результат при опоздании событий и перезапуске исполнителей.'],
        outcome: ['Trace event time, a window, a checkpoint and the commit of its output.', 'Разбирать время события, окно, checkpoint и фиксацию результата.'],
        topics: [
          topic('batch-and-streaming', 'From batch to streaming', 'От пакетной обработки к потоковой'),
          topic('time-and-windows', 'Time, windows and late data', 'Время, окна и опоздавшие данные'),
          topic('state-and-checkpoints', 'State and checkpoints', 'Состояние и checkpoints'),
          topic('end-to-end-recovery', 'End-to-end recovery', 'Восстановление всей цепочки'),
        ],
      },
      {
        title: ['The Data System', 'Система данных'],
        summary: ['Make dependencies, correctness, ownership and cost visible across the whole pipeline.', 'Сделать зависимости, корректность, ответственность и стоимость видимыми во всей цепочке.'],
        outcome: ['Explain a backfill, diagnose stale data and compare architectures against explicit requirements.', 'Объяснять пересчёт истории, находить причину устаревших данных и сравнивать архитектуры по явным требованиям.'],
        topics: [
          topic('orchestration', 'Orchestration and historical recomputation', 'Оркестрация и пересчёт истории'),
          topic('data-contracts-and-quality', 'Data contracts and quality', 'Контракты и качество данных'),
          topic('catalogs-and-lineage', 'Catalogs and lineage', 'Каталоги и происхождение данных'),
          topic('access-and-privacy', 'Access and privacy', 'Доступ и приватность'),
          topic('data-observability', 'Observing a data pipeline', 'Наблюдаемость цепочки данных'),
          topic('architecture-and-cost', 'Architecture and cost', 'Архитектура и стоимость'),
        ],
      },
      {
        title: ['Extensions', 'Дополнительные ветки'], optional: true,
        summary: ['Alternative integration models and deeper coordination mechanisms.', 'Альтернативные модели интеграции и более подробные механизмы координации.'],
        outcome: ['Compare the additional guarantees and complexity with the main route.', 'Сравнивать дополнительные гарантии и сложность с основным маршрутом.'],
        topics: [
          topic('data-vault', 'Data Vault', 'Data Vault'),
          topic('anchor-modeling', 'Anchor Modeling', 'Anchor Modeling'),
          topic('consensus-and-distributed-transactions', 'Consensus and distributed transactions', 'Консенсус и распределённые транзакции'),
        ],
      },
    ],
  },
];

function courseFromPlan(plan: DataCoursePlan): Course {
  const labels: Record<string, string> = {};
  const translate = ([en, ru]: Text) => { labels[en] = ru; return en; };
  return {
    title: plan.title[0], shortTitle: plan.shortTitle[0], description: plan.description[0],
    entry: plan.entry[0], requires: plan.requires, guide: [],
    progression: plan.sections.filter((section) => !section.optional).map((section) => ({ label: section.title[0], section: section.title[0] })),
    sections: plan.sections.map((section) => ({
      title: translate(section.title), summary: translate(section.summary), outcome: translate(section.outcome),
      topics: section.topics.map((item) => {
        const title = translate(item.title);
        return item.available ? { title, note: `${plan.key}/${item.slug}` } : title;
      }),
    })),
    ru: {
      title: plan.title[1], shortTitle: plan.shortTitle[1], description: plan.description[1], entry: plan.entry[1],
      progression: plan.sections.filter((section) => !section.optional).map((section) => section.title[1]), labels,
    },
  };
}

export const dataEngineeringCourses = Object.fromEntries(dataCoursePlans.map((plan) => [plan.key, courseFromPlan(plan)])) as Record<DataCourseKey, Course>;
