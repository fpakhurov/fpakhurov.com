---
title: Local Text-to-SQL for internal analytics
summary: Analysts had a bot that turned questions into SQL. It worked on synthetic data but could not go to production, because it sent questions and database schemas to an external model API. We moved it to open-weight models on one A100 inside the company perimeter.
problem: Analysts spent their time on routine ad hoc queries. The proof of concept handled them well enough on synthetic data, but real questions and schemas could not be sent outside the company.
context: The data had to stay inside the internal perimeter. The budget was one A100 GPU, and the target was under 10 seconds of SQL generation per question.
role: I worked on the model side with one teammate. I chose and evaluated the models, tuned prompts, optimized inference and prepared the quantized deployment together with the MLOps team.
approach: We split the job between two open-weight models, one writes the SQL and the other writes the answer in Russian. To compare models, we collected about 50 real user questions and checked the result of executing each query rather than the SQL text. On transformers with 8-bit bitsandbytes, generation took about two minutes, so we moved serving to vLLM and switched to static FP8 quantization to fit on one A100.
result: SQL generation went from 2 minutes to 3 seconds, well inside the 10-second target. Prompt changes closed an 8-point gap to the reference score on our internal set. The models went to production on vLLM behind a Triton wrapper, and the data stayed inside the perimeter.
lessons: Public benchmarks told us little about one company's schema. A small set of real questions, scored by execution, told us more. The serving stack decided whether the product was usable at all.
links:
  - { kind: article, href: 'https://habr.com/ru/articles/992238/', lang: ru }
tags: [Text-to-SQL, Local LLM, Inference, Evaluation]
order: 2
ru:
  title: Локальный Text-to-SQL для внутренней аналитики
  summary: У аналитиков был бот, который переводил вопросы в SQL. На синтетических данных он работал, но в продакшен не мог — вопросы и схемы баз уходили во внешний API модели. Мы перенесли его на open-weight модели на одной A100 внутри контура компании.
  problem: Аналитики тратили время на типовые ad hoc запросы. PoC справлялся с ними на синтетических данных, но реальные вопросы и схемы нельзя было отправлять за пределы компании.
  context: Данные должны были оставаться во внутреннем контуре. Бюджет — одна видеокарта A100, цель — меньше 10 секунд на генерацию SQL для одного вопроса.
  role: Работал над моделями вместе с коллегой. Подбирал и оценивал модели, настраивал промпты, оптимизировал инференс и вместе с командой MLOps готовил квантизованное развёртывание.
  approach: Разделили задачу между двумя open-weight моделями — одна пишет SQL, другая формулирует ответ на русском. Чтобы сравнивать модели, собрали около 50 реальных вопросов пользователей и проверяли результат исполнения запроса, а не текст SQL. На transformers с 8-битной квантизацией bitsandbytes генерация занимала около двух минут, поэтому перевели инференс на vLLM и перешли на статическую квантизацию FP8, чтобы уместиться в одну A100.
  result: Генерация SQL ускорилась с 2 минут до 3 секунд — с большим запасом относительно цели в 10 секунд. Правки промптов закрыли разрыв в 8 п.п. до эталонного результата на нашем внутреннем наборе. Модели ушли в продакшен на vLLM с обёрткой Triton, данные остались внутри контура.
  lessons: Публичные бенчмарки мало говорили о схеме конкретной компании. Небольшой набор реальных вопросов с проверкой по исполнению сказал больше. А пригоден ли продукт вообще, определил стек инференса.
  tags: [Text-to-SQL, Локальные LLM, Инференс, Оценка качества]
---
