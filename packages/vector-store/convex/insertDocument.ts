import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { EMBEDDING_DIMENSIONS } from "./schema";

/**
 * Insert a single document with embedding into the vector store.
 */
export const insertDocument = mutation({
  args: {
    content: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.any(),
    source: v.string(),
    docId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Embedding must have ${EMBEDDING_DIMENSIONS} dimensions, got ${args.embedding.length}`
      );
    }
    return await ctx.db.insert("documents", {
      content: args.content,
      embedding: args.embedding,
      metadata: args.metadata ?? {},
      source: args.source,
      docId: args.docId,
    });
  },
});

/**
 * Insert multiple documents in a single transaction.
 */
export const batchInsertDocuments = mutation({
  args: {
    documents: v.array(
      v.object({
        content: v.string(),
        embedding: v.array(v.float64()),
        metadata: v.any(),
        source: v.string(),
        docId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const doc of args.documents) {
      if (doc.embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Embedding must have ${EMBEDDING_DIMENSIONS} dimensions, got ${doc.embedding.length}`
        );
      }
      const id = await ctx.db.insert("documents", {
        content: doc.content,
        embedding: doc.embedding,
        metadata: doc.metadata ?? {},
        source: doc.source,
        docId: doc.docId,
      });
      ids.push(id);
    }
    return ids;
  },
});
