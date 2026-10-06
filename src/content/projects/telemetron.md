---
title: Telemetron
label: Systems · Streaming · ML infrastructure
description: Streaming telemetry for a fleet of AI agents. Every processed request is an event; a Flink job aggregates the events per agent type in event time. Built as the capstone project of a Big Data course.
highlights:
  - Event-driven pipeline with Kafka topics on both ends and a PyFlink DataStream job in between.
  - Event-time windows with watermarks; the generator emits late and out-of-order events, up to 90 seconds late, and they still land in the correct minute.
  - A PostgreSQL dimension loaded once into the operator for enrichment, with no lookup per event.
  - Per-minute average latency and median tool calls for each agent type, monitored on a live dashboard.
  - The whole stack starts from one docker-compose file and one script.
tags: [Kafka, Flink, PostgreSQL, Event time, Docker]
year: 2026
status: completed
category: engineering
github: https://github.com/fpakhurov/telemetron
order: 4
ru:
  title: Telemetron
  label: Системы · Стриминг · ML-инфраструктура
  description: Потоковая телеметрия для парка AI-агентов. Каждый обработанный запрос — событие; задача Flink агрегирует события по типам агентов во времени событий. Итоговый проект курса по Big Data.
  highlights:
    - Событийный конвейер — топики Kafka на входе и выходе и задача PyFlink DataStream между ними.
    - Окна по времени событий с водяными знаками; генератор выдаёт опоздавшие и перемешанные события с задержкой до 90 секунд, и они всё равно попадают в свою минуту.
    - Справочник PostgreSQL загружается в оператор один раз для обогащения, без запроса на каждое событие.
    - Поминутная средняя задержка и медиана вызовов инструментов по каждому типу агента на живом дашборде.
    - Весь стек поднимается из одного docker-compose и одного скрипта.
  tags: [Kafka, Flink, PostgreSQL, Event time, Docker]
---
