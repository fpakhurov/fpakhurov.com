---
title: Telemetron
label: Systems · Streaming · ML infrastructure
description: "Capstone for a Big Data course. A fleet of AI agents reports every processed request as an event. The question: how do you get per-minute latency and tool-call statistics for each agent type when events arrive late and out of order?"
highlights:
  - Kafka topics on both ends, a PyFlink DataStream job in between.
  - Event-time windows with watermarks. The generator sends events up to 90 seconds late and out of order, and they still land in the correct minute.
  - Enrichment from a PostgreSQL dimension loaded into the operator once, instead of a lookup per event.
  - Average latency and median tool calls per agent type per minute, on a live dashboard.
  - One docker-compose file and one script start the whole stack.
tags: [Kafka, Flink, PostgreSQL, Event time, Docker]
year: 2026
status: completed
category: engineering
github: https://github.com/fpakhurov/telemetron
order: 4
ru:
  title: Telemetron
  label: Системы · Стриминг · ML-инфраструктура
  description: "Итоговый проект курса по Big Data. Парк AI-агентов отправляет каждый обработанный запрос как событие. Вопрос: как получить поминутную задержку и статистику вызовов инструментов по каждому типу агента, если события приходят с опозданием и не по порядку?"
  highlights:
    - Топики Kafka на входе и выходе, задача PyFlink DataStream между ними.
    - Окна по времени событий с водяными знаками. Генератор отправляет события с опозданием до 90 секунд и не по порядку, и они всё равно попадают в свою минуту.
    - Обогащение из справочника PostgreSQL, загруженного в оператор один раз, вместо запроса на каждое событие.
    - Средняя задержка и медиана вызовов инструментов по каждому типу агента за минуту на живом дашборде.
    - Весь стек поднимается из одного docker-compose и одного скрипта.
  tags: [Kafka, Flink, PostgreSQL, Event time, Docker]
---
