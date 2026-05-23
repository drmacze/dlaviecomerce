import { config } from './config.js';

function reply(text, extra = {}) {
  return {
    ok: true,
    channel: 'whatsapp',
    reply: text,
    ...extra
  };
}

function menu() {
  return [
    '👋 Selamat datang di DLAVIE Bot',
    '',
    'Ketik salah satu command:',
    '• menu - tampilkan menu',
    '• ping - cek bot',
    '• status - cek koneksi website',
    '• panel - info panel Pterodactyl',
    '• ppob - info PPOB',
    '',
    `Website: ${config.appUrl}`
  ].join('\n');
}

async function checkWebsite() {
  const url = `${config.appUrl}/api/bot/whatsapp/connect/verify?session_id=connect-bot`;
  const response = await fetch(url);
  const data = await response.json();
  return { response, data };
}

export async function handleWhatsappCommand({ from, message }) {
  const text = String(message || '').trim().toLowerCase();

  if (!text || text === 'menu' || text === '/start') {
    return reply(menu(), { from });
  }

  if (text === 'ping') {
    return reply('pong ✅ DLAVIE Connect Bot aktif.', { from });
  }

  if (text === 'status') {
    try {
      const { data } = await checkWebsite();
      return reply(`Website connected ✅\nStatus: ${data.status || 'unknown'}\nSession: ${data.session_id || '-'}`, { from, data });
    } catch (error) {
      return reply(`Website belum tersambung ❌\n${error.message}`, { from });
    }
  }

  if (text === 'panel') {
    return reply([
      '🧩 Panel Pterodactyl DLAVIE',
      '',
      'Fitur tahap ini:',
      '• katalog panel dari website',
      '• order via website',
      '• fulfil manual/admin',
      '',
      'Auto-create server akan disambungkan setelah adapter bot stabil.'
    ].join('\n'), { from });
  }

  if (text === 'ppob') {
    return reply([
      '⚡ PPOB DLAVIE',
      '',
      'Status: endpoint website aktif.',
      'Produk PPOB bot masih mode placeholder sampai helper database dipindah ke lib/bot.'
    ].join('\n'), { from });
  }

  return reply(`Command tidak dikenal: ${text}\n\n${menu()}`, { from });
}
