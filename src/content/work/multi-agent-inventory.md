---
title: Multi-agent inventory platform
summary: Questions about merchant inventory cut across supply, transit and export, and each of those lived in different systems. The question was whether one natural-language interface could handle them without giving a model unrestricted control over operational systems.
problem: Inventory questions crossed several operational domains and systems. One general assistant over all of them was hard to control and hard to evaluate.
context: Supply, transit and export each needed their own context and tools. Critical operations had to stay under explicit user control.
role: I designed the agent topology, the coordination flow and the boundary where a person confirms an operation.
approach: We split the system into supply, transit and export agents because each domain needed different context and different tools. A coordinator routes each request, hands bounded tasks to the agents and assembles their results into one proposed action. Each agent works only with its own tools and the internal data it needs.
result: The platform handles more than 5,000 operational actions a month, with an estimated annual business effect above ₽48M. A request that spans several domains gets one proposal built from domain-specific tools, and critical operations run only after the user confirms them.
lessons: Splitting into specialists helped because the tool scopes and responsibilities really were different. Coordination became reliable only once the agents had a clear contract and a path for escalation.
tags: [Agents, Orchestration, Human-in-the-loop]
order: 3
ru:
  title: Мультиагентная платформа управления запасами
  summary: Вопросы о запасах продавцов затрагивали снабжение, транзит и экспорт, и у каждого направления были свои системы. Вопрос был в том, сможет ли один интерфейс на естественном языке с ними справиться — и при этом не дать модели неограниченного контроля над операционными системами.
  problem: Вопросы о запасах затрагивали несколько операционных доменов и систем. Один универсальный ассистент поверх всех них был трудно контролируем и трудно оцениваем.
  context: Снабжению, транзиту и экспорту нужны были собственный контекст и инструменты. Критические операции должны были оставаться под явным контролем пользователя.
  role: Спроектировал топологию агентов, схему координации и границу, на которой человек подтверждает операцию.
  approach: Разделили систему на агентов снабжения, транзита и экспорта, потому что каждому домену нужны свой контекст и свои инструменты. Координатор маршрутизирует запрос, передаёт агентам ограниченные задачи и собирает их результаты в одно предложенное действие. Каждый агент работает только со своими инструментами и нужными ему внутренними данными.
  result: Через платформу проходит более 5 000 операционных действий в месяц, оценка годового бизнес-эффекта — более 48 млн ₽. Запрос, затрагивающий несколько доменов, получает одно предложение, собранное из доменных инструментов, а критические операции выполняются только после подтверждения пользователя.
  lessons: Разделение на специалистов помогло, потому что зоны инструментов и ответственности действительно различались. Координация стала надёжной только тогда, когда у агентов появились понятный контракт и путь эскалации.
  tags: [Агенты, Оркестрация, Human-in-the-loop]
---
