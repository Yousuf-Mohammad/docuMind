import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Embedding dimensions must match the embedding model.
 * nomic-embed-text (Ollama) produces 768-dimensional vectors.
 */
export const EMBEDDING_DIMENSIONS = 768;

export default defineSchema({
  documents: defineTable({
    content: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.any(),
    source: v.string(),
    docId: v.optional(v.string()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: EMBEDDING_DIMENSIONS,
    filterFields: ["docId"],
  }),
});
