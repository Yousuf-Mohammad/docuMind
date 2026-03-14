# @documind/vector-store

Vector store abstraction for DocuMind. **Default backend: Convex.** The package exposes `IVectorStore`, so you can swap in Pinecone, Weaviate, or another backend without changing the RAG pipeline.

## Convex setup

1. **Install and link Convex** (from this package directory):

   ```bash
   cd packages/vector-store
   npm install
   npx convex dev
   ```

   On first run, `npx convex dev` will prompt you to log in or create a Convex project and will generate `convex/_generated/`. It also deploys your functions and prints the deployment URL.

2. **Set the deployment URL** in your app `.env`:

   ```env
   CONVEX_URL=https://your-deployment.convex.cloud
   ```

   Use the URL from the Convex dashboard or from the output of `npx convex dev`.

3. **Build this package** (after codegen has run at least once):

   ```bash
   npm run build
   ```

## Scripts

- `npm run codegen` – Generate Convex API (run after pulling or changing `convex/`).
- `npm run dev` – Run Convex dev server (syncs and generates).
- `npm run deploy` – Deploy Convex functions to production.

## Structure

- `convex/` – Convex backend: schema, `insertDocument` (single + batch), `vectorSearch` (vector similarity action).
- `src/` – `ConvexVectorStore` (implements `IVectorStore`), `VectorStoreService` (default Convex), types.

Embedding dimensions are fixed at **768** (nomic-embed-text). If you change the embedding model, update `EMBEDDING_DIMENSIONS` in `convex/schema.ts`.
