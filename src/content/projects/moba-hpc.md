---
title: MOBA → HPC
label: ML infrastructure · HPC
description: Distributed reinforcement learning for a Unity-based MOBA environment. The training setup was moved onto a university HPC cluster to check whether the originally stated results could be reached at scale.
highlights:
  - The Unity environment and the learner stack containerized as separate images and converted to Singularity for the cluster.
  - Slurm jobs for distributed and parallel execution experiments, with container connectivity tests before full runs.
  - Infrastructure trials against the originally stated targets.
outcome: The project ended with a technically grounded conclusion that the originally stated results are not achievable in the tested configuration. It is listed here as an example of a negative engineering result.
tags: [Distributed RL, HPC, Slurm, Singularity, Unity]
year: 2025
status: completed
category: engineering
order: 5
ru:
  title: MOBA → HPC
  label: ML-инфраструктура · HPC
  description: Распределённое обучение с подкреплением в MOBA-среде на Unity. Обучение перенесено на университетский HPC-кластер, чтобы проверить, достижимы ли исходно заявленные результаты в масштабе.
  highlights:
    - Среда Unity и стек обучения упакованы в отдельные контейнеры и сконвертированы в Singularity для кластера.
    - Задачи Slurm для экспериментов с распределённым и параллельным запуском, с проверкой связности контейнеров перед полными прогонами.
    - Инфраструктурные испытания против исходно заявленных целей.
  outcome: Итог проекта — технически обоснованный вывод о том, что исходно заявленные результаты недостижимы в проверенной конфигурации. Проект приведён как пример нормального отрицательного инженерного результата.
  tags: [Распределённое RL, HPC, Slurm, Singularity, Unity]
---
