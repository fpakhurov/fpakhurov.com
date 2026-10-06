---
title: Multi-agent inventory platform
summary: A coordinated system for merchant inventory operations with specialist agents and human confirmation.
problem: Inventory questions crossed several operational domains and systems, making a single undifferentiated assistant difficult to control and evaluate.
context: Supply, transit and export workflows each required their own context and tools, while critical operations had to remain under explicit user control.
role: Designed the agent topology, coordination flow and confirmation boundary for operational actions.
approach: Routed each request through a coordinator that delegated bounded tasks to supply, transit and export agents. Each agent worked only with its own tools and context from internal systems; the coordinator assembled one proposed action for review.
result: Requests spanning several domains received one proposal built from domain-specific tools. Critical operations ran only after explicit user confirmation, so every consequential action had a person who approved it.
lessons: Specialization helps when tool scopes and responsibilities are real. Coordination becomes reliable only when agents share a clear contract and escalation path.
tags: [Agents, Orchestration, Human-in-the-loop]
order: 3
ru:
  title: Мультиагентная платформа управления запасами
  summary: Координируемая система для операций с запасами продавцов — специализированные агенты и подтверждение человеком.
  problem: Вопросы о запасах затрагивали несколько операционных доменов и систем, поэтому один универсальный ассистент было трудно контролировать и оценивать.
  context: Снабжению, транзиту и экспорту нужны были собственный контекст и инструменты, а критические операции должны были оставаться под явным контролем пользователя.
  role: Спроектировал топологию агентов, схему координации и границу подтверждения для операционных действий.
  approach: Каждый запрос проходил через координатора, который передавал ограниченные задачи агентам снабжения, транзита и экспорта. Каждый агент работал только со своими инструментами и контекстом из внутренних систем; координатор собирал одно предложенное действие на проверку.
  result: Запросы, затрагивающие несколько доменов, получали одно предложение, собранное из доменных инструментов. Критические операции выполнялись только после явного подтверждения пользователя, поэтому у каждого значимого действия был человек, который его одобрил.
  lessons: Специализация помогает, когда зоны инструментов и ответственности реальны. Координация становится надёжной, только когда у агентов есть понятный контракт и путь эскалации.
  tags: [Агенты, Оркестрация, Human-in-the-loop]
---
