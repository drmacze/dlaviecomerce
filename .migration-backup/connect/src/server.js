import express from 'express';
import { config, safeJson } from './config.js';
import { handleWhatsappCommand } from './whatsapp.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'dlavie-connect-bot',
    mode: config.whatsappMode,
    appUrl: config.appUrl,
    timestamp: new Date().toISOString()
  });
});

app.post('/webhook/whatsapp/manual', async (req, res) => {
  const message = String(req.body?.message || '').trim();
  const from = String(req.body?.from || 'manual-tester').trim();
  const result = await handleWhatsappCommand({ from, message });
  res.status(200).json(result);
});

app.get('/', (_req, res) => {
  res.type('text/plain').send([
    'DLAVIE Connect Bot is running.',
    '',
    'GET  /health',
    'POST /webhook/whatsapp/manual',
    '',
    'Manual body example:',
    safeJson({ from: '628xxxxxxxxxx', message: 'menu' })
  ].join('\n'));
});

app.listen(config.port, () => {
  console.log(`[dlavie-connect] running on port ${config.port}`);
  console.log(`[dlavie-connect] app url: ${config.appUrl}`);
});
