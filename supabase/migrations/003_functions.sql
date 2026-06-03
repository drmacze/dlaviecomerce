create or replace function public.match_knowledge_chunks(query_embedding vector(1536), match_count int, similarity_threshold float)
returns table(chunk_id uuid, document_id uuid, title text, content text, metadata jsonb, similarity float)
language sql stable as $$
  select kc.id, kc.document_id, kd.title, kc.content, kc.metadata,
         1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  join public.knowledge_documents kd on kd.id = kc.document_id
  where kc.embedding is not null and 1 - (kc.embedding <=> query_embedding) >= similarity_threshold
  order by kc.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

revoke execute on function public.match_knowledge_chunks(vector, integer, double precision) from public;
revoke execute on function public.match_knowledge_chunks(vector, integer, double precision) from anon;
revoke execute on function public.match_knowledge_chunks(vector, integer, double precision) from authenticated;
grant execute on function public.match_knowledge_chunks(vector, integer, double precision) to service_role;
