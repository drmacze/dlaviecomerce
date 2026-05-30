import type { NextApiRequest, NextApiResponse } from 'next';
import { getGeminiClient } from '@/lib/gemini';

type ChatResponse = { reply?: string; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatResponse>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Kamu adalah AI customer service LUMINA, toko produk digital premium. Jawab ramah, ringkas, dan membantu. Pertanyaan: ${message}`
    });

    return res.status(200).json({ reply: response.text || 'Maaf, AI belum memberi jawaban.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI chat failed';
    return res.status(500).json({ error: message });
  }
}
