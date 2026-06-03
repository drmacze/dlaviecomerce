import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import type { ChatRequest } from '../../schemas/chat.schema';
import type { AIMessage } from '../../types/ai';
import { estimateTokens } from '../../utils/token-estimator';
import { ProviderRegistry } from '../ai/provider-registry';
import type { RagService } from '../rag/rag.service';
import { UsageService } from '../usage/usage.service';
import { ConversationService } from './conversation.service';
import { ModelRouterService } from './model-router.service';
import { PromptService } from './prompt.service';
export class ChatService {
  constructor(
    private conversations: ConversationService,
    private providers: ProviderRegistry,
    private router: ModelRouterService,
    private prompts: PromptService,
    private rag?: RagService,
    private usage = new UsageService(),
  ) {}
  async send(userId: string, request: ChatRequest, latencyStart = Date.now()) {
    const conversationId =
      request.conversation_id ??
      (await this.conversations.createConversation(
        userId,
        request.mode,
        request.messages.find((m) => m.role === 'user')?.content,
      ));
    if (request.conversation_id) await this.conversations.assertOwner(conversationId, userId);
    const latestUser = [...request.messages].reverse().find((m) => m.role === 'user');
    if (!latestUser)
      throw new AppError('BAD_REQUEST', 'At least one user message is required.', 400);
    await this.conversations.addMessage({
      conversationId,
      userId,
      role: 'user',
      content: latestUser.content,
      metadata: request.metadata,
    });
    const ragChunks =
      request.use_rag && env.ENABLE_RAG && this.rag
        ? await this.rag.context(latestUser.content)
        : [];
    const messages = this.prompts.prepareMessages(
      request.mode,
      request.messages as AIMessage[],
      ragChunks.map((c) => ({
        title: c.title,
        content: c.content,
        headings: Array.isArray(c.metadata.headings)
          ? c.metadata.headings.filter((heading): heading is string => typeof heading === 'string')
          : [],
      })),
    );
    const route = this.router.route({
      mode: request.mode,
      messageTokens: estimateTokens(messages.map((m) => m.content).join('\n')),
      useRag: ragChunks.length > 0,
    });
    let output;
    let fallbackUsed = false;
    let finalRoute = route;
    try {
      output = await this.providers.get(route.providerName).chat({
        messages,
        model: route.model,
        temperature: route.temperature,
        max_tokens: route.maxTokens,
        metadata: request.metadata,
      });
    } catch (error) {
      if (!env.ENABLE_MODEL_FALLBACK) throw error;
      fallbackUsed = true;
      finalRoute = this.router.route({
        mode: request.mode,
        messageTokens: 0,
        useRag: ragChunks.length > 0,
        fallback: true,
      });
      output = await this.providers.get(finalRoute.providerName).chat({
        messages,
        model: finalRoute.model,
        temperature: finalRoute.temperature,
        max_tokens: finalRoute.maxTokens,
        metadata: request.metadata,
      });
    }
    const messageId = await this.conversations.addMessage({
      conversationId,
      userId,
      role: 'assistant',
      content: output.content,
      model: output.model,
      provider: output.provider,
      metadata: { fallback_used: fallbackUsed },
    });
    await this.usage.log({
      userId,
      route: '/v1/chat',
      provider: output.provider,
      model: output.model,
      promptTokens: output.usage.prompt_tokens,
      completionTokens: output.usage.completion_tokens,
      totalTokens: output.usage.total_tokens,
      latencyMs: Date.now() - latencyStart,
      status: 'ok',
      metadata: { fallback_used: fallbackUsed },
    });
    return {
      conversation_id: conversationId,
      message_id: messageId,
      answer: output.content,
      mode: request.mode,
      provider: output.provider,
      model: output.model,
      fallback_used: fallbackUsed,
      rag: {
        enabled: request.use_rag && env.ENABLE_RAG,
        chunks_used: ragChunks.map((c) => ({
          document_id: c.document_id,
          chunk_id: c.chunk_id,
          title: c.title ?? '',
          similarity: c.similarity,
        })),
      },
      usage: output.usage,
    };
  }
}
