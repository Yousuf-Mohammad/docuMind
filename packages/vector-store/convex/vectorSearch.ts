import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { EMBEDDING_DIMENSIONS } from "./schema";

/**
 * Internal query to fetch full documents by IDs (used by the action).
 */
export const fetchDocumentsByIds = internalQuery({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc !== null) {
        results.push({
          _id: doc._id,
          content: doc.content,
          metadata: doc.metadata,
          source: doc.source,
        });
      }
    }
    return results;
  },
});

export interface VectorSearchResult {
  content: string;
  metadata: Record<string, unknown>;
  source: string;
  score: number;
}

/**
 * Vector similarity search. Returns documents with content, metadata, source, and score.
 * Must be run from an action (vector search is only available in actions).
 */
export const vectorSimilaritySearch = action({
  args: {
    queryEmbedding: v.array(v.float64()),
    limit: v.optional(v.number()),
    docIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<VectorSearchResult[]> => {
    if (args.queryEmbedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Query embedding must have ${EMBEDDING_DIMENSIONS} dimensions, got ${args.queryEmbedding.length}`
      );
    }
    const limitNum = Math.min(args.limit ?? 10, 256);

    type VectorSearchOpts = {
      vector: number[];
      limit: number;
      filter?: (q: { eq: (field: string, value: string) => unknown; or: (...expr: unknown[]) => unknown }) => unknown;
    };
    const searchOptions: VectorSearchOpts = {
      vector: args.queryEmbedding,
      limit: limitNum,
    };
    if (args.docIds !== undefined && args.docIds.length > 0) {
      searchOptions.filter = (q) =>
        q.or(...args.docIds!.map((id) => q.eq("docId", id)));
    }

    const results = await ctx.vectorSearch(
      "documents",
      "by_embedding",
      searchOptions
    );

    if (results.length === 0) return [];

    const docs = await ctx.runQuery(internal.vectorSearch.fetchDocumentsByIds, {
      ids: results.map((r) => r._id),
    });

    const byId = new Map(docs.map((d) => [d._id, d]));
    return results.map((r) => {
      const doc = byId.get(r._id);
      if (!doc) return null;
      return {
        content: doc.content,
        metadata: (doc.metadata ?? {}) as Record<string, unknown>,
        source: doc.source,
        score: r._score,
      };
    }).filter((x): x is VectorSearchResult => x !== null);
  },
});
