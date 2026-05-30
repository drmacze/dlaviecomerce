import type { NextApiRequest, NextApiResponse } from 'next';
import { getGeminiClient } from '@/lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const content = String(req.body?.content || '').trim();
    if (content.length < 30) return res.status(200).json({ summary: null });
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Ringkas teks ini maksimal 15 kata dalam Bahasa Indonesia: ${content}` });
    return res.status(200).json({ summary: response.text?.trim() || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Summarize failed';
    return res.status(500).json({ error: message });
  }
}
