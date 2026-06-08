import { appChatRequestSchema } from '../../schemas/app-chat.schema';
import { AppChatService } from './app-chat.service';

describe('AppChatService', () => {
  const chat = { send: jest.fn() };
  const service = new AppChatService(chat);

  beforeEach(() => chat.send.mockReset());

  it('rejects an empty message', () => {
    expect(() => appChatRequestSchema.parse({ message: '   ' })).toThrow();
  });

  it.each([
    ['greeting', 'Halo!', 'Halo! Saya DLavie AI'],
    ['PPOB', 'Bagaimana layanan PPOB?', 'DLavie PPOB'],
    ['website', 'Saya ingin membuat website', 'DLavie dapat membantu merencanakan website'],
  ])('returns a friendly public %s fallback', async (_topic, message, expected) => {
    const response = await service.send(appChatRequestSchema.parse({ message }));

    expect(response.answer).toContain(expected);
    expect(response.authenticated).toBe(false);
    expect(response.conversation_id).toBeNull();
    expect(chat.send).not.toHaveBeenCalled();
  });

  it('calls the existing chat service for authenticated requests', async () => {
    chat.send.mockResolvedValue({
      answer: 'Authenticated answer',
      conversation_id: 'conversation-id',
      fallback_used: false,
    });

    const response = await service.send(
      appChatRequestSchema.parse({ message: 'Help me', mode: 'agent' }),
      'user-id',
    );

    expect(chat.send).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({
        mode: 'dlavie',
        messages: [{ role: 'user', content: 'Help me' }],
        metadata: expect.objectContaining({ app_mode: 'agent' }),
      }),
      expect.any(Number),
    );
    expect(response).toMatchObject({
      answer: 'Authenticated answer',
      authenticated: true,
      mode: 'agent',
    });
  });

  it('disables RAG for private mode', async () => {
    chat.send.mockResolvedValue({
      answer: 'Private answer',
      conversation_id: 'id',
      fallback_used: false,
    });

    await service.send(
      appChatRequestSchema.parse({ message: 'Private help', mode: 'private', use_rag: true }),
      'user-id',
    );

    expect(chat.send).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({ mode: 'general', use_rag: false }),
      expect.any(Number),
    );
  });

  it('hides authenticated provider or database failures', async () => {
    chat.send.mockRejectedValue(new Error('raw provider secret failure'));

    const response = await service.send(
      appChatRequestSchema.parse({ message: 'Help me' }),
      'user-id',
    );

    expect(response.answer).not.toContain('raw provider secret failure');
    expect(response.fallback_used).toBe(true);
  });
});
