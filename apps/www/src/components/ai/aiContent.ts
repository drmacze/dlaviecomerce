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
  { id: 'fast', label: 'Fast', description: 'Cepat untuk jawaban ringan', icon: 'zap' },
  { id: 'smart', label: 'Smart', description: 'Jawaban lebih teliti', icon: 'sparkles' },
  { id: 'agent', label: 'Agent', description: 'Rencana kerja dan otomasi', icon: 'workflow' },
  { id: 'research', label: 'Research', description: 'Analisis dokumen dan data', icon: 'search' },
  { id: 'private', label: 'Private', description: 'Obrolan tidak disimpan', icon: 'lock' },
] as const;

export type AiModeId = (typeof aiModes)[number]['id'];
export type AiModeIconKey = (typeof aiModes)[number]['icon'];

export type SettingsAction = 'profile' | 'upgrade' | 'agent' | 'connectors' | 'notice' | 'logout';
export type SettingsIconKey =
  | 'palette'
  | 'vibrate'
  | 'bell'
  | 'languages'
  | 'sliders'
  | 'link'
  | 'settings'
  | 'messages'
  | 'shield'
  | 'database'
  | 'star'
  | 'file'
  | 'lock'
  | 'flag'
  | 'logout';

export type SettingsItem = {
  label: string;
  icon: SettingsIconKey;
  action?: SettingsAction;
};

export const connectors = ['Gmail', 'Google Drive', 'GitHub', 'Notion', 'Supabase', 'Vercel'] as const;

export const upgradeFeatures = [
  'Percakapan lebih panjang',
  'Mode Agent lebih kuat',
  'Analisis dokumen lebih banyak',
  'Balasan lebih cepat',
  'Konektor premium',
  'Prioritas fitur baru',
] as const;

export const settingsSections: readonly { title: string; items: readonly SettingsItem[] }[] = [
  {
    title: 'Aplikasi',
    items: [
      { label: 'Penampilan', icon: 'palette' },
      { label: 'Haptic', icon: 'vibrate' },
      { label: 'Notifikasi', icon: 'bell' },
      { label: 'Bahasa Aplikasi', icon: 'languages' },
    ],
  },
  {
    title: 'DLavie AI',
    items: [
      { label: 'Sesuaikan', icon: 'sliders', action: 'agent' },
      { label: 'Konektor', icon: 'link', action: 'connectors' },
      { label: 'Lanjutan', icon: 'settings' },
    ],
  },
  {
    title: 'Data & Informasi',
    items: [
      { label: 'Percakapan Bersama', icon: 'messages' },
      { label: 'Kontrol Data', icon: 'shield' },
      { label: 'Penyimpanan', icon: 'database' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Beri Peringkat Aplikasi', icon: 'star' },
      { label: 'Ketentuan Penggunaan', icon: 'file' },
      { label: 'Kebijakan Privasi', icon: 'lock' },
      { label: 'Laporkan Masalah', icon: 'flag' },
      { label: 'Keluar', icon: 'logout', action: 'logout' },
    ],
  },
] as const;
