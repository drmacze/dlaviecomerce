import type { AppChatMode, AppChatRequest } from '../../schemas/app-chat.schema';
import type { ChatRequest } from '../../schemas/chat.schema';
import type { ChatService } from './chat.service';

type AppChatResponse = {
  answer: string;
  mode: AppChatMode;
  authenticated: boolean;
  conversation_id: string | null;
  fallback_used: boolean;
  [key: string]: unknown;
};

const publicAnswers = {
  greeting:
    'Halo! Saya DLavie AI. Saya bisa membantu menjelaskan layanan DLavie, PPOB, website, commerce, akun, dan otomasi. Apa yang ingin Anda kerjakan?',
  ppob: 'DLavie PPOB membantu kebutuhan pembayaran dan pembelian digital seperti pulsa, paket data, token listrik, serta tagihan. Masuk ke akun DLavie untuk melihat layanan dan transaksi yang tersedia dengan aman.',
  website:
    'DLavie dapat membantu merencanakan website yang cepat, aman, dan sesuai tujuan bisnis—mulai dari struktur halaman, konten, integrasi, hingga pengembangan. Ceritakan jenis website dan target Anda.',
  commerce:
    'DLavie Commerce membantu menyiapkan pengalaman toko digital, katalog, alur pemesanan, pembayaran, dan operasional penjualan. Ceritakan produk serta kebutuhan toko Anda agar saya bisa menyusun langkah awal.',
  account:
    'Untuk mengakses fitur yang terhubung ke data pribadi, silakan masuk melalui halaman akun DLavie. Jangan pernah membagikan kata sandi, OTP, atau token akses di chat.',
  automation:
    'DLavie Agent dapat membantu merancang otomasi dan alur kerja bertahap. Demi keamanan, tindakan yang memakai akun, data, atau alat terhubung hanya dapat dijalankan setelah Anda masuk dan memberikan persetujuan.',
  general:
    'Saya DLavie AI dalam mode publik. Saya bisa membantu informasi umum tentang layanan DLavie. Untuk jawaban yang memakai konteks akun, percakapan tersimpan, atau knowledge base terlindungi, silakan masuk terlebih dahulu.',
} as const;

const topicPatterns: Array<[keyof typeof publicAnswers, RegExp]> = [
  [
    'greeting',
    /^(halo|hai|hi|hello|hey|selamat\s+(pagi|siang|sore|malam)|ass?alamu'?alaikum|pagi|siang|sore|malam)[!.?,\s]*$/i,
  ],
  ['ppob', /\b(ppob|pulsa|paket data|token listrik|pln|bayar tagihan|pdam|bpjs)\b/i],
  ['website', /\b(website|web site|situs|landing page|web development|buat web|bikin web)\b/i],
  ['commerce', /\b(commerce|e-?commerce|toko|store|jualan|katalog|checkout|produk)\b/i],
  ['account', /\b(account|akun|login|log in|sign in|masuk|daftar|register|password|kata sandi)\b/i],
  ['automation', /\b(automation|otomasi|agent|agen|workflow|alur kerja|automate)\b/i],
];

export class AppChatService {
  constructor(private chat: Pick<ChatService, 'send'>) {}

  async send(request: AppChatRequest, userId?: string): Promise<AppChatResponse> {
    if (!userId) return this.publicFallback(request);

    try {
      const response = await this.chat.send(userId, this.toChatRequest(request), Date.now());
      return { ...response, mode: request.mode, authenticated: true };
    } catch {
      return {
        answer:
          'Maaf, DLavie AI belum dapat menyelesaikan permintaan itu sekarang. Silakan coba lagi sebentar lagi atau gunakan bantuan publik tanpa membagikan informasi sensitif.',
        mode: request.mode,
        authenticated: true,
        conversation_id: request.conversation_id ?? null,
        fallback_used: true,
      };
    }
  }

  publicFallback(request: AppChatRequest): AppChatResponse {
    const topic =
      topicPatterns.find(([, pattern]) => pattern.test(request.message))?.[0] ?? 'general';
    return {
      answer: publicAnswers[topic],
      mode: request.mode,
      authenticated: false,
      conversation_id: null,
      fallback_used: true,
    };
  }

  private toChatRequest(request: AppChatRequest): ChatRequest {
    const internalMode =
      request.mode === 'fast' || request.mode === 'private' ? 'general' : 'dlavie';
    const useRag =
      request.mode === 'private' ? false : (request.use_rag ?? request.mode !== 'fast');
    return {
      conversation_id: request.conversation_id,
      mode: internalMode,
      use_rag: useRag,
      stream: false,
      messages: [{ role: 'user', content: request.message }],
      metadata: { ...request.metadata, app_mode: request.mode, surface: 'dlavie-ai-app' },
    };
  }
}
