# B.21 Knowledge Base Foundation

## Purpose

This phase builds the storage structure for Operon's future knowledge base without trying to ingest, parse, or answer from documents yet.

In simple terms: we are building the shelves before we start loading them with books.

## What This Adds

- `knowledge_sources`
- `knowledge_documents`
- `knowledge_document_versions`
- `knowledge_chunks`
- `knowledge_document_links`

## What This Foundation Supports

- tenant-aware knowledge ownership
- shared generic knowledge
- shared Belgian regional knowledge
- document version history
- citation-ready chunks
- future extraction and embedding work
- future cross-document linking

## Scope Model

The foundation supports these scope tags:

- `[GENERIC]`
- `[REGIONAL: BE]`
- `[INSTANCE]`
- `[STRATEGY-DEFAULT]`

This keeps platform knowledge separate from brewery-specific material and keeps Belgian compliance logic out of the global layer.

## Access Rules

- authenticated users can read:
  - their brewery's own knowledge
  - shared global knowledge
  - shared Belgian regional knowledge
- authenticated users can only write tenant-owned knowledge
- shared/global knowledge is meant to be managed through controlled admin or service-role paths later

## What Is Deliberately Not Included Yet

- document upload flows
- OCR pipelines
- chunk generation pipelines
- embeddings generation
- chatbot or answer generation
- automatic fact extraction
- UI screens for the knowledge base

## Why This Order Matters

This keeps three things separate from the start:

- durable reference knowledge
- brewery-instance knowledge
- temporary operational state

That separation is what makes later search, citations, and structured extraction trustworthy instead of messy.
