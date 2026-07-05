# DocuMind AI

A full-stack **Retrieval-Augmented Generation (RAG)** application. Upload a PDF, then ask
questions about its contents and get grounded answers with citations back to the source text.

DocuMind keeps the language model honest: instead of answering from memory, it retrieves the
most relevant passages from *your* documents and asks the LLM to answer using only that context.

## Contents

- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Using the app](#using-the-app)
- [API reference](#api-reference)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## How it works

DocuMind runs two pipelines: **ingestion** (when you upload a document) and **query** (when you
ask a question).

### 1. Ingestion — turning a PDF into searchable knowledge

```
PDF upload ──▶ extract text ──▶ split into chunks ──▶ embed each chunk ──▶ store vectors
              (LangChain PDF     (RecursiveCharacter   (Transformers.js:   (Convex vector
               loader)            TextSplitter,         all-MiniLM-L6-v2,   index, tagged
                                  ~1000 chars /         384-dim vectors)    with docId)
                                  200 overlap)
```

Each uploaded PDF is assigned a `docId`, its text is split into overlapping ~1,000-character
chunks, and every chunk is converted into a 384-dimensional embedding vector. Chunks and vectors
are stored in Convex, tagged with their `docId` and source filename so answers can be traced and
filtered back to specific documents.

### 2. Query — answering a question

```
question ──▶ embed question ──▶ vector similarity search ──▶ build context ──▶ LLM answer
             (same embedder)     (top-K chunks from Convex,   (concatenate      (Groq
                                  optionally filtered by        retrieved         llama-3.1-8b-
                                  docIds)                       chunks)           instant)
                                                                                     │
                                                                                     ▼
                                                                          { answer, sources }
```

Your question is embedded with the same model used for ingestion, the vector store returns the
top-K most similar chunks (default 4), and those chunks become the context handed to the Groq LLM.
The model is prompted to answer **only** from the provided context and to say so when the context
is insufficient — this is what prevents hallucination. The response includes both the answer and
the source chunks it was built from.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn-style UI |
| Backend | Node.js, Express, TypeScript |
| RAG / AI | LangChain, Groq (`llama-3.1-8b-instant` LLM), Transformers.js (`all-MiniLM-L6-v2` in-process embeddings) |
| Vector store | Convex (hosted vector index; abstracted for swap to Pinecone, Weaviate, etc.) |
| Tooling | npm workspaces monorepo |

## Repository structure

```text
documind-ai/
├── apps/
│   ├── web/                # Next.js frontend (upload UI + chat)
│   └── api/                # Express API (routes, controllers, services)
├── packages/
│   ├── rag-core/           # RAG orchestration: chunk, ingest, retrieve, generate
│   ├── vector-store/       # Convex vector store + Convex functions (swappable backend)
│   ├── document-loader/    # PDF text extraction (LangChain)
│   ├── embeddings/         # Transformers.js embeddings (all-MiniLM-L6-v2, 384-dim, in-process)
│   └── llm/                # Groq chat LLM service
├── shared/                 # Shared types, utils, and env-based config
├── docs/                   # Setup, deployment, and architecture guides
├── docker-compose.yml      # Optional: run the API in Docker
├── .env.example
└── README.md
```

The `apps/` are the runnable programs; the `packages/` are the reusable building blocks they
compose. Business logic lives in the packages and in `apps/api/src/services/` — the HTTP routes
are thin boundaries only.

## Prerequisites

- **Node.js** ≥ 20
- **Groq API key** — powers the LLM that generates answers. Set as `GROQ_API_KEY`.
  Get one at [console.groq.com](https://console.groq.com).
- **Convex** — the hosted vector store. Run `npx convex dev` from `packages/vector-store` to link
  and deploy your deployment, then set its **deployment URL** (e.g. `https://xxx.convex.cloud`) as
  `CONVEX_URL`.
- **Embeddings** — generated **in-process** by Transformers.js (`all-MiniLM-L6-v2`). No API key,
  no server, no setup. The model (~90 MB) is downloaded to a local cache on first upload.

> Full setup and deployment walkthrough: [docs/SETUP_AND_DEPLOY.md](docs/SETUP_AND_DEPLOY.md)

## Setup

1. **Clone and install** (installs all workspaces):

   ```bash
   cd documind-ai
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env and set at least GROQ_API_KEY and CONVEX_URL.
   ```

3. **Deploy the Convex vector store** (creates the `documents` table and vector index):

   ```bash
   npx convex dev        # run from packages/vector-store; copy the deployment URL into CONVEX_URL
   ```

4. **Build the workspace packages** (the API and web apps depend on their compiled output — build
   in dependency order):

   ```bash
   npm run build -w @documind/shared
   npm run build -w @documind/embeddings
   npm run build -w @documind/document-loader
   npm run build -w @documind/llm
   npm run build -w @documind/vector-store
   npm run build -w @documind/rag-core
   ```

5. **Run the app:**

   ```bash
   npm run dev           # starts every workspace that defines a dev script
   ```

   Or start each side individually:

   - API: `npm run dev:api` → <http://localhost:3001>
   - Web: `npm run dev:web` → <http://localhost:3000>

   The first upload downloads the embedding model (~90 MB) to a local cache, so it may take a
   little longer; subsequent uploads are fast.

## Using the app

1. Open <http://localhost:3000>.
2. **Upload a PDF** using the uploader. The file is sent to the API, chunked, embedded, and stored;
   you'll get back a `docId` and the number of chunks created.
3. **Ask a question** in the chat. DocuMind retrieves the most relevant chunks, generates an
   answer grounded in them, and displays the source passages the answer was drawn from.
4. If the documents don't contain the answer, the model will tell you rather than inventing one.

Prefer the terminal? The same flow works directly against the [API](#api-reference).

## API reference

Base URL: `http://localhost:3001`

### `POST /upload`

Upload a PDF for ingestion.

- **Body:** `multipart/form-data` with field `file` (PDF only, max 20 MB).
- **Response `201`:**

  ```json
  {
    "success": true,
    "data": { "docId": "abc123", "filename": "report.pdf", "chunkCount": 42 }
  }
  ```

Example:

```bash
curl -F "file=@report.pdf" http://localhost:3001/upload
```

### `POST /ask`

Ask a question over your ingested documents.

- **Body:** `application/json`

  | Field | Type | Required | Description |
  | --- | --- | --- | --- |
  | `question` | string (1–2000 chars) | yes | The question to answer. |
  | `docIds` | string[] | no | Restrict retrieval to these documents. Omit to search all. |
  | `topK` | integer (1–20) | no | Number of chunks to retrieve. Default `4`. |

- **Response `200`:**

  ```json
  {
    "success": true,
    "data": {
      "answer": "…",
      "sources": [{ "content": "…", "metadata": { "docId": "abc123", "source": "report.pdf" } }]
    }
  }
  ```

Example:

```bash
curl -X POST http://localhost:3001/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What was Q3 revenue?", "topK": 4}'
```

### `GET /health`

Liveness check. Returns `{ "status": "ok", "service": "documind-api" }`.

> **Rate limits:** 100 requests / 15 min per IP on general endpoints, and 20 uploads / 15 min.
> Errors return a consistent `{ "success": false, "error": { code, message, statusCode } }` shape.

## Configuration

Set these in `.env` (see [`.env.example`](.env.example) for the annotated version):

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | ✅ | — | Groq API key for the answer-generating LLM. |
| `CONVEX_URL` | ✅ | — | Convex **deployment** URL (`https://xxx.convex.cloud`), not the dashboard URL. |
| `API_PORT` | | `3001` | Port for the Express API. |
| `NODE_ENV` | | `development` | Node environment. |
| `NEXT_PUBLIC_API_URL` | | `http://localhost:3001` | API base URL the web app calls. |
| `CORS_ORIGINS` | | `http://localhost:3000` | Comma-separated origins the API accepts (add your LAN URL if needed). |

## Architecture

- **Monorepo** using npm workspaces (`apps/*`, `packages/*`, `shared`).
- **Separation of concerns:** RAG logic lives entirely in `packages/rag-core`; the API's
  `services/` wire concrete implementations (Transformers.js embeddings, Convex store, Groq LLM) into the
  core, and routes handle only HTTP.
- **Swappable vector store:** `VectorStoreService` wraps a `ConvexVectorStore` behind an
  `IVectorStore` interface, so the backend can be replaced (Pinecone, Weaviate, …) without
  touching the RAG pipeline.
- **Environment-based config** is centralized via `@documind/shared/config`.

More detail: [docs/architecture.md](docs/architecture.md).

## Scripts

Run from the repository root:

| Script | Description |
| --- | --- |
| `npm run dev` | Run all workspaces that define a `dev` script |
| `npm run dev:web` | Start the Next.js dev server |
| `npm run dev:api` | Start the Express API (tsx watch) |
| `npm run build` | Build all workspaces |
| `npm run build:web` / `build:api` | Build a single app |
| `npm run lint` | Lint all workspaces |
| `npm run clean` | Remove all `node_modules` |

## Troubleshooting

- **Upload fails with "fetch failed":** ensure `CONVEX_URL` is a deployment URL
  (`https://xxx.convex.cloud`) and that the Convex deployment is reachable.
- **Convex 502 / Bad Gateway:** redeploy from `packages/vector-store` with `npx convex deploy`;
  check the Convex dashboard or [status.convex.dev](https://status.convex.dev).
- **`LLM_RATE_LIMIT` (429):** you've hit Groq's rate limit — retry shortly.
- **`LLM_CONFIG` (503):** `GROQ_API_KEY` is missing or invalid.
- **Empty or off-topic answers:** the relevant text may not have been retrieved — try a more
  specific question or increase `topK`.

## License

MIT
