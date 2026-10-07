---
title: LLM systems for e‑commerce operations
summary: Operations teams spent minutes on every request, pulling context together from several internal sources. In the main retrieval workflow, a usable answer took about 4 minutes. After the rework it took about 5 seconds.
problem: The context for each request lived in several internal systems, and people assembled it by hand. Every request was slow, and the same recurring decisions came out differently depending on who handled them.
context: These systems ran inside live workflows, so retrieval quality, latency, access boundaries and failure handling mattered as much as the model. Some of the data was not allowed to leave the company perimeter, which ruled out external model APIs for those cases.
role: I worked out the use cases with the operations teams and built the systems end to end, from retrieval and agent tools to multimodal prototypes, local model serving and integration with internal services.
approach: We started from the decision each workflow had to support and designed retrieval and tool interfaces around it, not around a model. Where data had to stay inside, models ran locally, and inference was tuned for latency. Quality was checked on real requests. Wherever an action had consequences, model output stayed advisory.
result: In the main retrieval workflow, time to a usable answer fell from 4 minutes to 5 seconds. On the local Text-to-SQL work, SQL generation went from 2 minutes to 3 seconds (next case).
lessons: A useful LLM product depends on three things, the quality of the context, failure modes you can observe and a clear point where a person decides. A stronger base model rarely fixes any of them.
includes: [RAG, LLM agents, Multimodal prototypes, Local model deployment, Latency optimization, Production integration, Evaluation and human control]
tags: [LLM, RAG, Agents, Multimodal, Production]
order: 1
ru:
  title: LLM-системы для операционных процессов e-commerce
  summary: Операционные команды тратили минуты на каждый запрос, собирая контекст из нескольких внутренних источников. В основном сценарии поиска полезный ответ занимал около 4 минут. После переработки — около 5 секунд.
  problem: Контекст для каждого запроса лежал в нескольких внутренних системах, и люди собирали его вручную. Каждый запрос шёл медленно, а одни и те же повторяющиеся решения принимались по-разному в зависимости от того, кто их принимал.
  context: Системы работали внутри действующих процессов, поэтому качество поиска, задержка, границы доступа и обработка сбоев значили столько же, сколько сама модель. Часть данных нельзя было выносить за контур компании, и для таких сценариев внешние API моделей не подходили.
  role: Вместе с операционными командами формулировал сценарии и строил системы целиком — от поиска и инструментов агентов до мультимодальных прототипов, локального развёртывания моделей и интеграции с внутренними сервисами.
  approach: Начинали с решения, которое должен поддерживать процесс, и проектировали вокруг него поиск и интерфейсы инструментов — а не вокруг модели. Там, где данные должны оставаться внутри, модели работали локально, а инференс оптимизировали по задержке. Качество проверяли на реальных запросах. Везде, где у действия есть последствия, вывод модели оставался рекомендацией.
  result: В основном сценарии поиска время до полезного ответа сократилось с 4 минут до 5 секунд. В локальном Text-to-SQL генерация SQL ускорилась с 2 минут до 3 секунд (следующий кейс).
  lessons: Полезный LLM-продукт держится на трёх вещах — качестве контекста, наблюдаемых режимах отказа и понятной точке, где решает человек. Более сильная базовая модель редко исправляет хотя бы одну из них.
  includes: [RAG, LLM-агенты, Мультимодальные прототипы, Локальное развёртывание моделей, Оптимизация задержки, Интеграция в продакшен, Оценка качества и контроль человека]
  tags: [LLM, RAG, Агенты, Мультимодальность, Продакшен]
---
