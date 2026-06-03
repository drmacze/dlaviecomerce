export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: {
      match_knowledge_chunks: {
        Args: { query_embedding: string; match_count: number; similarity_threshold: number };
        Returns: Array<{
          chunk_id: string;
          document_id: string;
          title: string;
          content: string;
          metadata: Json;
          similarity: number;
        }>;
      };
    };
  };
};
