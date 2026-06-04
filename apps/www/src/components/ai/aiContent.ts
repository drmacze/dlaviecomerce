export const aiQuickActions = [
  { id: 'document', label: 'Analisis Dokumen' },
  { id: 'camera', label: 'Buka Kamera' },
  { id: 'voice', label: 'Mode Suara' },
  { id: 'connectors', label: 'Coba Konektor' },
  { id: 'agent', label: 'Sesuaikan DLavie AI' },
  { id: 'website', label: 'Bantu Website' },
  { id: 'ppob', label: 'PPOB Support' },
] as const;

export type AiQuickActionId = (typeof aiQuickActions)[number]['id'];

export const aiModes = [
  { id: 'fast', label: 'Fast', description: 'Cepat untuk jawaban ringan' },
  { id: 'smart', label: 'Smart', description: 'Jawaban lebih teliti' },
  { id: 'agent', label: 'Agent', description: 'Rencana kerja dan otomasi' },
  { id: 'research', label: 'Research', description: 'Analisis dokumen dan data' },
  { id: 'private', label: 'Private', description: 'Obrolan tidak disimpan' },
] as const;

export type AiModeId = (typeof aiModes)[number]['id'];

export const connectors = ['Gmail', 'Google Drive', 'GitHub', 'Notion', 'Supabase', 'Vercel'] as const;

export const upgradeFeatures = [
  'Percakapan lebih panjang',
  'Mode Agent lebih kuat',
  'Analisis dokumen lebih banyak',
  'Balasan lebih cepat',
  'Konektor premium',
  'Prioritas fitur baru',
] as const;

export const settingsSections = [
  { title: 'Aplikasi', items: ['Penampilan', 'Haptic', 'Notifikasi', 'Bahasa Aplikasi'] },
  { title: 'DLavie AI', items: ['Sesuaikan', 'Konektor', 'Lanjutan'] },
  { title: 'Data & Informasi', items: ['Percakapan Bersama', 'Kontrol Data', 'Penyimpanan'] },
  { title: 'Support', items: ['Beri Peringkat Aplikasi', 'Ketentuan Penggunaan', 'Kebijakan Privasi', 'Laporkan Masalah', 'Keluar'] },
] as const;
