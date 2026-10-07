// Profile content shared by the English and Russian pages. Each entry carries both languages
// so the two versions keep the same structure. Only publicly verifiable items belong here.

export type Lang = 'en' | 'ru';
type Text = Record<Lang, string>;

// Production figures shown on the homepage. System and client names stay out.
export const impact: { value: Text; label: Text }[] = [
  { value: { en: '5,000+', ru: '5 000+' }, label: { en: 'operational actions per month', ru: 'операционных действий в месяц' } },
  { value: { en: '> ₽48M', ru: '> 48 млн ₽' }, label: { en: 'estimated annual business effect', ru: 'оценка годового бизнес-эффекта' } },
  { value: { en: '4 min → 5 sec', ru: '4 мин → 5 с' }, label: { en: 'retrieval / RAG workflow latency', ru: 'задержка сценария поиска / RAG' } },
  { value: { en: '2 min → 3 sec', ru: '2 мин → 3 с' }, label: { en: 'model inference after optimization', ru: 'инференс модели после оптимизации' } },
];

export const principles: { title: Text; text: Text }[] = [
  {
    title: { en: 'Baseline first', ru: 'Сначала базовая линия' },
    text: {
      en: 'Measure how the process works today, in time, errors or cost, before a model touches it.',
      ru: 'Измерить, как процесс работает сейчас — по времени, ошибкам или стоимости, — до того как к нему прикоснётся модель.',
    },
  },
  {
    title: { en: 'Outcomes over prototypes', ru: 'Результат важнее прототипов' },
    text: {
      en: 'A system counts when it moves a metric in production. The number of proofs of concept says little.',
      ru: 'Система засчитывается, когда двигает метрику в продакшене. Количество PoC говорит мало.',
    },
  },
  {
    title: { en: 'Cheap tests', ru: 'Дешёвые проверки' },
    text: {
      en: 'Check a hypothesis on a small labelled set or a manual run before building infrastructure for it.',
      ru: 'Проверить гипотезу на небольшом размеченном наборе или ручном прогоне, прежде чем строить под неё инфраструктуру.',
    },
  },
  {
    title: { en: 'Reusable patterns', ru: 'Повторно используемые паттерны' },
    text: {
      en: 'Retrieval, tool access, evaluation and confirmation steps are built once and reused across products.',
      ru: 'Поиск, доступ к инструментам, оценка и шаги подтверждения строятся один раз и переиспользуются в разных продуктах.',
    },
  },
  {
    title: { en: 'People own consequential actions', ru: 'Значимые действия — за человеком' },
    text: {
      en: 'The model proposes. A person confirms anything that changes money, stock or a customer’s experience.',
      ru: 'Модель предлагает. Человек подтверждает всё, что меняет деньги, запасы или опыт клиента.',
    },
  },
  {
    title: { en: 'Rules, ML or agents', ru: 'Правила, ML или агенты' },
    text: {
      en: 'Deterministic automation where the logic is known, ML where it has to be learned from data, agents where the path cannot be fixed in advance.',
      ru: 'Детерминированная автоматизация, где логика известна; ML, где её нужно выучить из данных; агенты, где путь нельзя зафиксировать заранее.',
    },
  },
  {
    title: { en: 'Infrastructure as a chain', ru: 'Инфраструктура как цепочка' },
    text: {
      en: 'Agents depend on LLMs, LLMs on infrastructure and data, data on recorded decisions. A missing link cannot be skipped.',
      ru: 'Агенты зависят от LLM, LLM — от инфраструктуры и данных, данные — от зафиксированных решений. Недостающее звено нельзя пропустить.',
    },
  },
];

const read: Text = { en: 'Read', ru: 'Читать' };
const event: Text = { en: 'Event page', ru: 'Страница события' };

// Writing and public talks, newest first. Titles follow the official pages where they give one.
export const writing: { year: number; title: Text; type: Text; links: { label: Text; href: string; hreflang?: Lang }[] }[] = [
  {
    year: 2026,
    title: { en: 'Generating SQL queries with local models', ru: 'Генерируем SQL-запросы на локальных моделях' },
    type: { en: 'Article · Habr · in Russian', ru: 'Статья · Хабр' },
    links: [{ label: read, href: 'https://habr.com/ru/articles/992238/', hreflang: 'ru' }],
  },
  {
    year: 2025,
    title: { en: 'Evaluating hallucinations in diffusion generative models', ru: 'Оценка галлюцинаций диффузионных генеративных моделей' },
    type: { en: 'Talk · HSE conference “AI in Mathematical Finance”', ru: 'Доклад · конференция ВШЭ «ИИ в математических финансах»' },
    links: [{ label: event, href: 'https://cs.hse.ru/news/1092597391.html', hreflang: 'ru' }],
  },
  {
    year: 2025,
    title: { en: 'Methods for evaluating generation errors of diffusion models', ru: 'Методы оценки ошибок генерации диффузионных моделей' },
    type: { en: 'Seminar · HSE AIM Lab · in Russian', ru: 'Семинар · AIM Lab ВШЭ' },
    links: [
      { label: { en: 'Recording', ru: 'Запись' }, href: 'https://cs.hse.ru/iai/aimf/news/1073321715.html', hreflang: 'ru' },
      { label: { en: 'Slides', ru: 'Слайды' }, href: 'https://cs.hse.ru/mirror/pubs/share/1101573802.pdf', hreflang: 'ru' },
    ],
  },
  {
    year: 2025,
    title: { en: 'Lecture at the 5th HSE School on Financial Technologies', ru: 'Лекция на пятой Школе по финансовым технологиям ВШЭ' },
    type: { en: 'Lecture · HSE Faculty of Computer Science', ru: 'Лекция · ФКН ВШЭ' },
    links: [{ label: event, href: 'https://www.hse.ru/news/edu/1060816489.html', hreflang: 'ru' }],
  },
  {
    year: 2025,
    title: { en: 'Methods of Evaluation of Diffusion Model Hallucinations', ru: 'Methods of Evaluation of Diffusion Model Hallucinations' },
    type: { en: 'Bachelor thesis · HSE', ru: 'Бакалаврская работа · ВШЭ, на английском' },
    links: [{ label: { en: 'PDF', ru: 'PDF' }, href: 'https://github.com/fpakhurov/diffusion-hallucinations/blob/main/arXiv_diploma_report/template.pdf' }],
  },
];
