import type { NextApiRequest, NextApiResponse } from 'next';
import { getGeminiClient } from '@/lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const content = String(req.body?.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Buat 3 balasan singkat untuk posting ini. Jawab JSON array string saja: ${content}` });
    const raw = response.text || '[]';
    const match = raw.match(/\[[\s\S]*\]/);
    return res.status(200).json({ suggestions: match ? JSON.parse(match[0]) : ['Setuju!', 'Keren!', 'Makasih infonya!'] });
  } catch {
    return res.status(200).json({ suggestions: ['Setuju!', 'Keren!', 'Makasih infonya!'] });
  }
}
