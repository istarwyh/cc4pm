---
id: agentic-knowledge-base
title: Agentic Knowledge Base (LLM Wiki)
tags: [architecture, rag-evolution, knowledge-management]
status: stable
last_updated: 2026-04-12
---

# Agentic Knowledge Base (LLM Wiki)

## 定义
一种由 AI 代理主动维护、基于 Markdown 的结构化知识库。它与传统 RAG 的区别在于「知识编译」——AI 不是在提问时去检索碎片，而是在录入时就将碎片整合进现有的主题页面。

## 三层架构
1. **Raw (原始层)**: 只读资料。
2. **Wiki (编译层)**: 动态更新的实体页、摘要、矛盾记录。
3. **Schema (规则层)**: 定义维护逻辑的 `AGENTS.md` 或 `CLAUDE.md`。

## 核心循环 (IQI)
- **Ingest (灌入)**: 读新料，更新 N 个相关 Wiki 页。
- **Query (提问)**: 搜 Wiki，生成带引用的回答。
- **Inspect (巡检)**: 定期查冲突、补关联。

## 技术栈
- **IDE**: Obsidian
- **Search**: qmd (Hybrid Search)
- **Engine**: Claude Code / Agentic Loop
