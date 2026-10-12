---
title: MOBA → HPC
label: ML infrastructure · HPC
description: Distributed reinforcement learning for a Unity-based MOBA environment. We wanted to know whether the training setup could scale on the HSE HPC cluster, and to test that, we first had to get it running there.
highlights:
  - The Unity environment and the learner stack containerized as separate images and converted to Singularity for the cluster.
  - Slurm jobs for distributed and parallel execution experiments, with container connectivity tests before full runs.
tags: [Distributed RL, HPC, Slurm, Singularity, Unity]
year: 2025
status: completed
category: engineering
order: 5
ru:
  title: MOBA → HPC
  label: ML-инфраструктура · HPC
  description: Распределённое обучение с подкреплением в MOBA-среде на Unity. Мы хотели понять, масштабируется ли обучение на HPC-кластере ВШЭ, — а чтобы это проверить, сначала нужно было его там запустить.
  highlights:
    - Среда Unity и стек обучения упакованы в отдельные контейнеры и сконвертированы в Singularity для кластера.
    - Задачи Slurm для экспериментов с распределённым и параллельным запуском, с проверкой связности контейнеров перед полными прогонами.
  tags: [Распределённое RL, HPC, Slurm, Singularity, Unity]
---
