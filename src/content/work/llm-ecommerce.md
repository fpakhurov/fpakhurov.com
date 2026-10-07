---
title: LLM systems for e‑commerce operations
summary: Retrieval, agents and multimodal prototypes built into operational workflows and taken to production.
problem: Operational teams spent minutes per request assembling context from fragmented internal sources, and recurring decisions were handled inconsistently.
context: The systems ran inside live workflows. Retrieval quality, latency, access boundaries and failure handling mattered as much as the model, and some data could not leave the company perimeter.
role: Shaped the use cases with operations teams and built the systems end to end, from retrieval and agent tools to multimodal prototypes, local model serving and integration with internal services.
approach: Started from the decision being supported and designed retrieval and tool interfaces around it. Served models locally where data had to stay inside, optimized inference for latency, evaluated on real requests and kept model output advisory wherever an action had consequences.
result: In the main retrieval workflow, time to a usable answer fell from 4 minutes to 5 seconds. On a local model, inference optimization cut SQL generation from 2 minutes to 3 seconds (see the Text-to-SQL case below).
lessons: Useful LLM products depend on context quality, observable failure modes and a clear human decision point. A stronger base model rarely fixes any of the three.
includes: [RAG, LLM agents, Multimodal prototypes, Local model deployment, Latency optimization, Production integration, Evaluation and human control]
metrics:
  - { value: 4 min → 5 sec, label: retrieval workflow latency }
tags: [LLM, RAG, Agents, Multimodal, Production]
order: 1
ru:
  title: LLM-системы для операционных процессов e-commerce
  summary: Поиск, агенты и мультимодальные прототипы, встроенные в операционные процессы и доведённые до продакшена.
  problem: Операционные команды тратили минуты на каждый запрос, собирая контекст из разрозненных внутренних источников, а повторяющиеся решения принимались непоследовательно.
  context: Системы работали внутри действующих процессов. Качество поиска, задержка, границы доступа и обработка сбоев были так же важны, как сама модель, а часть данных не могла покидать контур компании.
  role: Формулировал сценарии вместе с операционными командами и строил системы целиком — от поиска и инструментов агентов до мультимодальных прототипов, локального развёртывания моделей и интеграции с внутренними сервисами.
  approach: Начинал с решения, которое нужно поддержать, и проектировал вокруг него поиск и интерфейсы инструментов. Там, где данные должны оставаться внутри, разворачивал модели локально, оптимизировал инференс по задержке, оценивал качество на реальных запросах и оставлял вывод модели рекомендательным везде, где у действия есть последствия.
  result: В основном сценарии поиска время до полезного ответа сократилось с 4 минут до 5 секунд. На локальной модели оптимизация инференса сократила генерацию SQL с 2 минут до 3 секунд (см. кейс Text-to-SQL ниже).
  lessons: Полезный LLM-продукт держится на качестве контекста, наблюдаемых режимах отказа и понятной точке решения человека. Более сильная базовая модель редко исправляет хотя бы одно из трёх.
  includes: [RAG, LLM-агенты, Мультимодальные прототипы, Локальное развёртывание моделей, Оптимизация задержки, Интеграция в продакшен, Оценка качества и контроль человека]
  metrics:
    - { value: 4 мин → 5 с, label: задержка сценария поиска }
  tags: [LLM, RAG, Агенты, Мультимодальность, Продакшен]
---
