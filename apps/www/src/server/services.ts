import { ProviderRegistry } from './services/ai/provider-registry';
import { ChatService } from './services/chat/chat.service';
import { ConversationService } from './services/chat/conversation.service';
import { ModelRouterService } from './services/chat/model-router.service';
import { PromptService } from './services/chat/prompt.service';
import { EmbeddingService } from './services/embeddings/embedding.service';
import { OpenAIEmbeddingProvider } from './services/embeddings/openai-embedding.provider';
import { KnowledgeService } from './services/knowledge/knowledge.service';
import { ChunkerService } from './services/rag/chunker.service';
import { RagService } from './services/rag/rag.service';
import { RetrievalService } from './services/rag/retrieval.service';

const embeddings = new EmbeddingService(new OpenAIEmbeddingProvider());
const retrieval = new RetrievalService(embeddings);
const conversations = new ConversationService();

export const chatService = new ChatService(
  conversations,
  new ProviderRegistry(),
  new ModelRouterService(),
  new PromptService(),
  new RagService(retrieval),
);

export const conversationService = conversations;

export const knowledgeService = new KnowledgeService(new ChunkerService(), embeddings, retrieval);
