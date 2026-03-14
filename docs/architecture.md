# DocuMind AI – Architecture

## Overview

DocuMind AI is a full-stack RAG (Retrieval Augmented Generation) application. Users upload PDFs and ask questions; the system retrieves relevant chunks from a vector store and generates answers using an LLM.

## RAG Pipeline Flow

1. **Document ingestion** – PDF uploaded → load and parse → extract text.
2. **Chunking** – Text split into overlapping chunks (RecursiveCharacterTextSplitter).
3. **Embedding generation** – Each chunk is embedded (e.g. Ollama nomic-embed-text).
4. **Vector storage** – Embeddings and metadata stored in Convex.
5. **Retrieval** – User question is embedded; Convex vector similarity search returns top-K chunks.
6. **Answer generation** – Chunks + question sent to LLM (e.g. Groq); answer and sources returned.

```
[PDF] → load → chunk → embed → store
[Question] → embed → similarity search → [Context] + [Question] → LLM → [Answer] + [Sources]
```

## Document Ingestion

- **Location**: `packages/document-loader` (load, extract, normalize), `packages/rag-core/ingestion` (orchestration).
- **Flow**: `loadPDF()` / `loadPDFFromBuffer()` loads the PDF using LangChain’s PDFLoader. Optional `extractText()` and `normalizeDocument()` for raw text and normalized structure.
- **Chunking**: `chunkDocument()` in `packages/rag-core/chunking` uses **RecursiveCharacterTextSplitter** (chunk size 1000, overlap 200 by default) so chunks keep semantic boundaries (paragraphs, sentences).
- **Output**: LangChain `Document[]` with metadata (docId, source, page).

## Chunking Strategy

- **Splitter**: RecursiveCharacterTextSplitter from `@langchain/textsplitters`.
- **Parameters**: `chunkSize` (default 1000), `chunkOverlap` (default 200).
- **Rationale**: Overlap avoids cutting mid-sentence; recursive splitting tries paragraph → sentence → word boundaries.
- **Configurable**: Options passed from `ingestDocument()` so different apps can tune size/overlap.

## Embedding Generation

- **Location**: `packages/embeddings` – e.g. `LocalEmbeddingService` (Ollama / nomic-embed-text).
- **API**: LangChain embeddings interface; batch embedding for chunks.
- **Config**: `OLLAMA_BASE_URL` (optional); model default nomic-embed-text.
- **Abstraction**: Embedding service can be swapped for other providers without changing callers.

## Vector Search

- **Location**: `packages/vector-store` – `VectorStoreService`, default backend Convex.
- **API**: `initializeCollection()`, `addDocuments()`, `similaritySearch(query, topK, filter)`, `deleteCollection()`.
- **Abstraction**: `IVectorStore` allows replacing Convex with Pinecone, Weaviate, etc.
- **Filtering**: Optional metadata filter (e.g. by `docId`) for scoped search.

## Answer Generation

- **Location**: `packages/rag-core/generation` – `generateAnswer(context, question)`.
- **Flow**: Retrieved chunks are concatenated into a context string; context + question are sent to the LLM (e.g. Groq llama3-8b-8192) with a fixed system-style prompt that instructs the model to answer only from context.
- **Output**: Answer string; sources are the same chunks (mapped to `RAGSource[]`).

## Backend API (apps/api)

- **Structure**: Clean layering – `controllers/`, `routes/`, `services/`, `middlewares/`, `config/`, `utils/`.
- **Endpoints**: `POST /upload` (PDF upload, multer), `POST /ask` (JSON body: question, optional docIds, topK).
- **Design**: No RAG logic in routes; controllers call services; services use `@documind/rag-core` and related packages.
- **Production features**: Structured logging (`@documind/shared/utils` logger), request validation (Zod), rate limiting (express-rate-limit), centralized error handling (AppError + errorHandler middleware), environment validation (config/env).

## Frontend (apps/web)

- **Stack**: Next.js 15 (App Router), TypeScript, TailwindCSS.
- **Components**: `ChatWindow`, `ChatMessage`, `ChatInput`, `DocumentUploader`, `SourceList`.
- **Data**: `lib/api-client.ts` talks to the backend; hooks `useUpload` and `useAsk` use the client.

## Shared (shared/)

- **Types**: `DocumentChunk`, `EmbeddingVector`, `QueryRequest`, `QueryResponse`, `UploadedDocument`, `ApiError`, etc., used by both frontend and backend.
- **Utils**: `logger`, `getEnv` / `getEnvOptional` (env), `AppError` / `toApiError` (error-handler), `success` / `errorResponse` (api-response).

## Monorepo Layout

- **apps/web** – Next.js frontend.
- **apps/api** – Express API.
- **packages/rag-core** – RAG pipeline (ingestion, chunking, retrieval, generation).
- **packages/vector-store** – Vector store abstraction (Convex default).
- **packages/document-loader** – PDF load, extract, normalize.
- **packages/embeddings** – Embedding service (e.g. Ollama / nomic-embed-text).
- **shared** – Types, utils, config.
