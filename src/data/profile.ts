// Profile content shared by the English and Russian pages. Each entry carries both languages
// so the two versions keep the same structure. Only publicly verifiable items belong here.

export type Lang = 'en' | 'ru';
type Text = Record<Lang, string>;

// Three examples from production work for the homepage, with each figure in its context.
// <strong> marks the figures. System, employer and client names stay out.
export const examples: { label: Text; text: Text; href: string }[] = [
  {
    label: { en: 'Retrieval', ru: 'Поиск' },
    text: {
      en: 'In the main retrieval workflow, getting a usable answer took about <strong>4 minutes</strong> per request. After we rebuilt retrieval around the decision people actually had to make and tuned inference for latency, it took about <strong>5 seconds</strong>.',
      ru: 'В основном сценарии поиска полезный ответ на один запрос занимал около <strong>4 минут</strong>. После того как мы перестроили поиск вокруг решения, которое людям на самом деле нужно было принять, и оптимизировали инференс по задержке, — около <strong>5 секунд</strong>.',
    },
    href: '/work#llm-ecommerce',
  },
  {
    label: { en: 'Local inference', ru: 'Локальный инференс' },
    text: {
      en: 'A Text-to-SQL assistant had to move inside the company perimeter onto one A100, with a target of under 10 seconds per question. On transformers it needed <strong>2 minutes</strong>; on vLLM with FP8 quantization, <strong>3 seconds</strong>.',
      ru: 'Ассистент Text-to-SQL нужно было перенести внутрь контура компании на одну A100 с целью меньше 10 секунд на вопрос. На transformers генерация занимала <strong>2 минуты</strong>, на vLLM с квантизацией FP8 — <strong>3 секунды</strong>.',
    },
    href: '/work#local-text-to-sql',
  },
  {
    label: { en: 'Agents', ru: 'Агенты' },
    text: {
      en: 'Supply, transit and export agents under one coordinator, with a person confirming every critical operation. The platform handles <strong>5,000+</strong> operational actions a month, with an estimated annual effect above <strong>₽48M</strong>.',
      ru: 'Агенты снабжения, транзита и экспорта под общим координатором; каждую критическую операцию подтверждает человек. Через платформу проходит <strong>5 000+</strong> операционных действий в месяц, оценка годового эффекта — более <strong>48 млн ₽</strong>.',
    },
    href: '/work#multi-agent',
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
