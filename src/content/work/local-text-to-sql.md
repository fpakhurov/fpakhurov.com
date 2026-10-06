---
title: Local Text-to-SQL for internal analytics
summary: A natural-language analytics assistant moved from an external model API to open-weight models inside the company perimeter.
problem: Analysts spent their time on routine ad hoc queries. A bot that turned questions into SQL worked as a proof of concept on synthetic data, but sending questions and schemas about real data to an external model API was not acceptable for production.
context: Enterprise data had to stay inside the internal perimeter. The infrastructure budget was a single A100 GPU, and the target for SQL generation was under 10 seconds per question.
role: Worked on the model side with one teammate. Selected and evaluated the models, tuned prompts, optimized inference and prepared the quantized deployment together with the MLOps team.
approach: Split the work between two open-weight models, one for SQL and one for the Russian-language answer. Built an evaluation set of about 50 real user questions and compared query execution results rather than SQL text. Replaced transformers with 8-bit bitsandbytes by vLLM and switched to static FP8 quantization to fit one A100.
result: SQL generation fell from 2 minutes to 3 seconds, well inside the 10-second target. Prompt changes closed an 8-point gap to the reference score on the internal set. The models went to production on vLLM behind a Triton wrapper, with data kept inside the perimeter.
lessons: Public benchmarks were a weak guide for one company's schema; a small execution-based set of real questions was more informative. The serving stack decided whether the product was usable at all.
metrics:
  - { value: 2 min → 3 sec, label: SQL generation latency }
links:
  - { kind: article, href: 'https://habr.com/ru/articles/992238/', lang: ru }
tags: [Text-to-SQL, Local LLM, Inference, Evaluation]
order: 2
ru:
  title: Локальный Text-to-SQL для внутренней аналитики
  summary: Аналитический ассистент на естественном языке перенесён с внешнего API модели на open-weight модели внутри контура компании.
  problem: Аналитики тратили время на типовые ad hoc запросы. Бот, переводящий вопросы в SQL, работал как PoC на синтетических данных, но отправлять вопросы и схемы реальных данных во внешний API модели для продакшена было недопустимо.
  context: Корпоративные данные должны были оставаться во внутреннем контуре. Бюджет инфраструктуры — одна видеокарта A100, цель по генерации SQL — меньше 10 секунд на вопрос.
  role: Работал над моделями вместе с коллегой. Подбирал и оценивал модели, настраивал промпты, оптимизировал инференс и готовил квантизованное развёртывание вместе с командой MLOps.
  approach: Разделил задачу между двумя open-weight моделями — одна генерирует SQL, другая формулирует ответ на русском. Собрал оценочный набор примерно из 50 реальных вопросов пользователей и сравнивал результаты исполнения запросов, а не текст SQL. Заменил transformers с 8-битной квантизацией bitsandbytes на vLLM и перешёл на статическую квантизацию FP8, чтобы уместиться в одну A100.
  result: Генерация SQL ускорилась с 2 минут до 3 секунд — с большим запасом относительно цели в 10 секунд. Правки промптов закрыли разрыв в 8 п.п. до эталонного результата на внутреннем наборе. Модели ушли в продакшен на vLLM с обёрткой Triton, данные остались внутри контура.
  lessons: Публичные бенчмарки плохо предсказывали качество на схеме конкретной компании; небольшой набор реальных вопросов с проверкой по исполнению оказался информативнее. Пригодность продукта определил стек инференса.
  metrics:
    - { value: 2 мин → 3 с, label: задержка генерации SQL }
  tags: [Text-to-SQL, Локальные LLM, Инференс, Оценка качества]
---
