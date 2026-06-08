'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Database,
  FileText,
  Flag,
  Github,
  Image,
  Languages,
  Link2,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  MicOff,
  Palette,
  Plus,
  Search,
  Settings,
  Settings2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  StopCircle,
  Trash2,
  Vibrate,
  Volume2,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { DlavieAccountSession } from '../../lib/supabase/account-session';
import { DlavieAiMark } from './DlavieAiMark';
import {
  aiModes,
  aiQuickActions,
  connectors,
  settingsSections,
  upgradeFeatures,
  type AiModeIconKey,
  type AiModeId,
  type AiQuickActionId,
  type SettingsAction,
  type SettingsIconKey,
  type SettingsItem,
} from './aiContent';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
  private?: boolean;
};

type SheetName = 'settings' | 'profile' | 'connectors' | 'agent' | 'upgrade' | null;

type DlavieAiAppShellProps = {
  accountSession: DlavieAccountSession;
};

const FRIENDLY_FALLBACK =
  'DLavie AI sedang kesulitan terhubung ke model utama. Saya tetap bisa membantu dengan mode aman. Ceritakan kebutuhan Anda dalam satu atau dua kalimat.';
const HISTORY_LIMIT = 60;
const HISTORY_VERSION = 1;

const quickPrompts: Partial<Record<AiQuickActionId, string>> = {
  website: 'Bantu saya menyusun rencana website premium untuk bisnis DLavie.',
  ppob: 'Bantu saya memahami alur support PPOB dan langkah pengecekan yang aman.',
};

const settingsIconMap: Record<SettingsIconKey, LucideIcon> = {
  palette: Palette,
  vibrate: Vibrate,
  bell: Bell,
  languages: Languages,
  sliders: SlidersHorizontal,
  link: Link2,
  settings: Settings2,
  messages: MessageSquare,
  shield: Shield,
  database: Database,
  star: Star,
  file: FileText,
  lock: Lock,
  flag: Flag,
  logout: LogOut,
};

const modeIconMap: Record<AiModeIconKey, LucideIcon> = {
  zap: Zap,
  sparkles: Sparkles,
  workflow: Workflow,
  search: Search,
  lock: Lock,
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getModeLabel(mode: AiModeId) {
  return aiModes.find((item) => item.id === mode)?.label ?? 'Fast';
}

function getConnectorInitial(connector: string) {
  return connector.slice(0, 1);
}

function getHistoryKey(accountSession: DlavieAccountSession) {
  const owner = accountSession.authenticated ? accountSession.email || accountSession.fullName : 'preview';
  return `dlavie-ai-history:v${HISTORY_VERSION}:${owner}`;
}

function normalizeStoredMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Partial<ChatMessage> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : newId('stored'),
      role: item.role === 'user' ? 'user' : 'assistant',
      content: typeof item.content === 'string' ? item.content.slice(0, 8000) : '',
      private: Boolean(item.private),
    }))
    .filter((item) => item.content.trim().length > 0)
    .slice(-HISTORY_LIMIT);
}

export function DlavieAiAppShell({ accountSession }: DlavieAiAppShellProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState<AiModeId>('fast');
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetName>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [agentName, setAgentName] = useState('DLavie AI');
  const [agentInstructions, setAgentInstructions] = useState('');
  const [agentStyle, setAgentStyle] = useState('Friendly');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [notice, setNotice] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyKey = useMemo(() => getHistoryKey(accountSession), [accountSession]);

  const hasMessages = messages.length > 0;
  const modeLabel = useMemo(() => getModeLabel(selectedMode), [selectedMode]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(historyKey);
      if (!raw) {
        setMessages([]);
        return;
      }

      setMessages(normalizeStoredMessages(JSON.parse(raw)));
    } catch {
      setMessages([]);
    }
  }, [historyKey]);

  useEffect(() => {
    const safeMessages = messages.filter((message) => !message.pending && !message.private).slice(-HISTORY_LIMIT);

    try {
      if (safeMessages.length === 0) {
        window.localStorage.removeItem(historyKey);
        return;
      }

      window.localStorage.setItem(historyKey, JSON.stringify(safeMessages));
    } catch {
      // Storage can fail in private browsing or low-storage environments; the chat must keep working.
    }
  }, [historyKey, messages]);

  function showNotice(message: string) {
    setNotice(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setNotice(''), 3200);
  }

  function focusComposer() {
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function insertPrompt(prompt: string) {
    setInputValue(prompt);
    focusComposer();
  }

  function startNewChat() {
    setMessages([]);
    setPlusMenuOpen(false);
    setModeSelectorOpen(false);
    showNotice('Percakapan baru dimulai.');
    focusComposer();
  }

  function clearHistory() {
    setMessages([]);
    try {
      window.localStorage.removeItem(historyKey);
    } catch {
      // Ignore storage failures.
    }
    showNotice('Riwayat percakapan lokal dihapus.');
  }

  function handleQuickAction(action: AiQuickActionId) {
    if (action === 'document') {
      setPlusMenuOpen(true);
      return;
    }
    if (action === 'camera') {
      showNotice('Kamera akan hadir segera. Untuk sekarang, tulis konteks yang ingin dianalisis.');
      focusComposer();
      return;
    }
    if (action === 'voice') {
      setVoiceOpen(true);
      return;
    }
    if (action === 'connectors') {
      setActiveSheet('connectors');
      return;
    }
    if (action === 'agent') {
      setActiveSheet('agent');
      return;
    }

    const prompt = quickPrompts[action];
    if (prompt) insertPrompt(prompt);
  }

  async function sendMessage(nextMessage = inputValue) {
    const trimmed = nextMessage.trim();
    if (!trimmed || sending) return;

    const isPrivate = selectedMode === 'private';
    setInputValue('');
    setPlusMenuOpen(false);
    setModeSelectorOpen(false);
    const userMessage: ChatMessage = { id: newId('user'), role: 'user', content: trimmed, private: isPrivate };
    const pendingMessage: ChatMessage = {
      id: newId('assistant-pending'),
      role: 'assistant',
      content: 'DLavie AI sedang menyusun jawaban…',
      pending: true,
      private: isPrivate,
    };
    setMessages((current) => [...current, userMessage, pendingMessage]);
    setSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          mode: selectedMode,
          metadata: { authenticated: accountSession.authenticated },
        }),
      });
      const payload = (await response.json().catch(() => null)) as { answer?: string } | null;
      const answer = payload?.answer || FRIENDLY_FALLBACK;
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingMessage.id ? { ...message, content: answer, pending: false, private: isPrivate } : message,
        ),
      );
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingMessage.id ? { ...message, content: FRIENDLY_FALLBACK, pending: false, private: isPrivate } : message,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function handleMenuItem(label: string) {
    if (label === 'Konektor') {
      setActiveSheet('connectors');
    } else {
      showNotice(`${label} akan hadir segera. Anda tetap bisa menuliskan kebutuhan Anda di chat.`);
      focusComposer();
    }
    setPlusMenuOpen(false);
  }

  function closeSheet() {
    setActiveSheet(null);
  }

  return (
    <main className="dlavie-ai-app" aria-label="DLavie AI app">
      <div className="ai-app-frame">
        <TopBar
          accountSession={accountSession}
          hasMessages={hasMessages}
          onOpenSettings={() => setActiveSheet('settings')}
          onOpenProfile={() => setActiveSheet('profile')}
          onOpenConnectors={() => setActiveSheet('connectors')}
          onOpenAgent={() => setActiveSheet('agent')}
          onOpenUpgrade={() => setActiveSheet('upgrade')}
          onNewChat={startNewChat}
          onClearHistory={clearHistory}
        />

        <section className={hasMessages ? 'ai-conversation is-active' : 'ai-conversation'} aria-live="polite">
          {!hasMessages ? <EmptyState accountSession={accountSession} /> : <MessageList messages={messages} />}
        </section>

        <form className="ai-composer-dock" onSubmit={handleSubmit}>
          <QuickActions onAction={handleQuickAction} />
          <div className="ai-composer-card">
            <label className="sr-only" htmlFor="dlavie-ai-input">
              Tanyakan Apa Saja
            </label>
            <textarea
              ref={textareaRef}
              id="dlavie-ai-input"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan Apa Saja"
              rows={1}
              maxLength={4000}
            />
            <div className="ai-composer-controls">
              <Popover.Root open={plusMenuOpen} onOpenChange={setPlusMenuOpen}>
                <Popover.Trigger asChild>
                  <button className="ai-icon-button" type="button" aria-label="Buka menu tambahan">
                    <Plus size={20} />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content className="ai-floating-panel ai-plus-menu" align="start" side="top" sideOffset={14} collisionPadding={12}>
                    <PlusMenu onSelect={handleMenuItem} />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <Popover.Root open={modeSelectorOpen} onOpenChange={setModeSelectorOpen}>
                <Popover.Trigger asChild>
                  <button className="ai-mode-chip" type="button" aria-label="Pilih mode AI">
                    {modeLabel}
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content className="ai-floating-panel ai-mode-selector" align="start" side="top" sideOffset={14} collisionPadding={12}>
                    <ModeSelector
                      selectedMode={selectedMode}
                      onSelect={(mode) => {
                        setSelectedMode(mode);
                        setModeSelectorOpen(false);
                      }}
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <span className="ai-control-spacer" />
              <button
                className="ai-icon-button"
                type="button"
                aria-label="Buka mode suara"
                onClick={() => setVoiceOpen(true)}
              >
                <Mic size={19} />
              </button>
              <button
                className="ai-send-button"
                type="submit"
                aria-label="Kirim pesan"
                disabled={!inputValue.trim() || sending}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {notice ? <div className="ai-toast">{notice}</div> : null}
      <SettingsSheet
        open={activeSheet === 'settings'}
        accountSession={accountSession}
        onClose={closeSheet}
        onOpenProfile={() => setActiveSheet('profile')}
        onOpenUpgrade={() => setActiveSheet('upgrade')}
        onOpenConnectors={() => setActiveSheet('connectors')}
        onOpenAgent={() => setActiveSheet('agent')}
        onNotice={showNotice}
      />
      <ProfileSheet open={activeSheet === 'profile'} accountSession={accountSession} onClose={closeSheet} />
      <ConnectorsSheet open={activeSheet === 'connectors'} onClose={closeSheet} onNotice={showNotice} />
      <AgentSheet
        open={activeSheet === 'agent'}
        agentName={agentName}
        instructions={agentInstructions}
        style={agentStyle}
        onNameChange={setAgentName}
        onInstructionsChange={setAgentInstructions}
        onStyleChange={setAgentStyle}
        onClose={closeSheet}
        onNotice={showNotice}
      />
      <UpgradeSheet
        open={activeSheet === 'upgrade'}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
        onClose={closeSheet}
        onNotice={showNotice}
      />
      <VoiceOverlay open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </main>
  );
}

function TopBar({
  accountSession,
  hasMessages,
  onOpenSettings,
  onOpenProfile,
  onOpenConnectors,
  onOpenAgent,
  onOpenUpgrade,
  onNewChat,
  onClearHistory,
}: {
  accountSession: DlavieAccountSession;
  hasMessages: boolean;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenConnectors: () => void;
  onOpenAgent: () => void;
  onOpenUpgrade: () => void;
  onNewChat: () => void;
  onClearHistory: () => void;
}) {
  const menuItems = [
    { label: 'Percakapan', description: hasMessages ? 'Lanjutkan obrolan tersimpan' : 'Belum ada riwayat lokal', icon: MessageSquare, action: onOpenSettings },
    { label: 'Profil', description: accountSession.authenticated ? accountSession.email : 'Masuk ke DLavie Account', icon: Shield, action: onOpenProfile },
    { label: 'Konektor', description: 'Gmail, Drive, GitHub, Notion', icon: Link2, action: onOpenConnectors },
    { label: 'Agen', description: 'Atur gaya dan instruksi DLavie AI', icon: SlidersHorizontal, action: onOpenAgent },
    { label: 'Upgrade', description: 'DLavie AI Pro', icon: Sparkles, action: onOpenUpgrade },
    { label: 'Chat Baru', description: 'Mulai percakapan kosong', icon: Plus, action: onNewChat },
    { label: 'Hapus Riwayat', description: 'Bersihkan history lokal browser ini', icon: Trash2, action: onClearHistory },
  ];

  return (
    <header className="ai-topbar">
      <div className="ai-brand-lockup" aria-label="DLavie AI">
        <span className="ai-brand-mark"><DlavieAiMark /></span>
        <span>DLavie AI</span>
      </div>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="ai-profile-button" type="button" aria-label="Buka menu DLavie AI">
            <span>{accountSession.initials}</span>
            <Menu size={16} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="ai-floating-panel ai-main-menu" align="end" side="bottom" sideOffset={12} collisionPadding={12}>
            <div className="ai-main-menu-header">
              <strong>{accountSession.fullName}</strong>
              <small>{accountSession.authenticated ? accountSession.email : 'Mode preview DLavie AI'}</small>
            </div>
            <div className="ai-main-menu-list">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} type="button" onClick={item.action}>
                    <span className="ai-menu-icon"><Icon size={18} /></span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </header>
  );
}

function EmptyState({ accountSession }: { accountSession: DlavieAccountSession }) {
  return (
    <div className="ai-empty-state">
      <div className="ai-orb" aria-hidden="true">
        <DlavieAiMark />
      </div>
      <p>{accountSession.authenticated ? 'Siap membantu.' : 'Mode preview.'}</p>
    </div>
  );
}

function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="ai-message-list">
      {messages.map((message) => (
        <article
          className={message.role === 'user' ? 'ai-message is-user' : 'ai-message is-assistant'}
          key={message.id}
        >
          <p>{message.content}</p>
          {message.pending ? <span className="ai-typing-dot" aria-hidden="true" /> : null}
        </article>
      ))}
    </div>
  );
}

function QuickActions({ onAction }: { onAction: (action: AiQuickActionId) => void }) {
  return (
    <div className="ai-quick-actions" aria-label="Aksi cepat">
      {aiQuickActions.map((action) => (
        <button key={action.id} type="button" onClick={() => onAction(action.id)}>
          {action.label}
        </button>
      ))}
    </div>
  );
}

function PlusMenu({ onSelect }: { onSelect: (label: string) => void }) {
  const items = [
    { label: 'Kamera', description: 'Ambil konteks visual', icon: Camera },
    { label: 'Foto', description: 'Pilih gambar untuk dibahas', icon: Image },
    { label: 'Berkas', description: 'Analisis dokumen', icon: FileText },
    { label: 'Konektor', description: 'Hubungkan alat kerja', icon: Link2 },
  ];

  return (
    <div className="ai-plus-menu-list" aria-label="Menu tambahan">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.label} type="button" onClick={() => onSelect(item.label)}>
            <span className="ai-menu-icon">
              <Icon size={18} />
            </span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ModeSelector({
  selectedMode,
  onSelect,
}: {
  selectedMode: AiModeId;
  onSelect: (mode: AiModeId) => void;
}) {
  return (
    <div className="ai-mode-selector-list" aria-label="Pilih mode DLavie AI">
      {aiModes.map((mode) => {
        const Icon = modeIconMap[mode.icon];
        return (
          <button
            className={mode.id === selectedMode ? 'is-selected' : ''}
            key={mode.id}
            type="button"
            aria-pressed={mode.id === selectedMode}
            onClick={() => onSelect(mode.id)}
          >
            <span className="ai-menu-icon">
              <Icon size={18} />
            </span>
            <span>
              <strong>{mode.label}</strong>
              <small>{mode.description}</small>
            </span>
            {mode.id === selectedMode ? <Check size={18} /> : null}
          </button>
        );
      })}
    </div>
  );
}

function SheetShell({
  open,
  title,
  children,
  onClose,
  className = '',
  rightAction,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  rightAction?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="ai-sheet-backdrop" />
        <Dialog.Content className={`ai-sheet ${className}`} aria-describedby={undefined}>
          <header className="ai-sheet-header">
            <Dialog.Close asChild>
              <button className="ai-icon-button" type="button" aria-label="Tutup">
                <X size={19} />
              </button>
            </Dialog.Close>
            <Dialog.Title>{title}</Dialog.Title>
            <div className="ai-sheet-action-slot">{rightAction}</div>
          </header>
          <div className="ai-sheet-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SettingsSheet({
  open,
  accountSession,
  onClose,
  onOpenProfile,
  onOpenUpgrade,
  onOpenConnectors,
  onOpenAgent,
  onNotice,
}: {
  open: boolean;
  accountSession: DlavieAccountSession;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenUpgrade: () => void;
  onOpenConnectors: () => void;
  onOpenAgent: () => void;
  onNotice: (message: string) => void;
}) {
  function handleSettingsItem(item: SettingsItem) {
    const action: SettingsAction = item.action ?? 'notice';
    if (action === 'agent') onOpenAgent();
    else if (action === 'connectors') onOpenConnectors();
    else if (action === 'logout') onNotice('Keluar dari akun dapat dilakukan dari halaman akun DLavie.');
    else onNotice(`${item.label} akan hadir segera di DLavie AI.`);
  }

  return (
    <SheetShell open={open} title="Pengaturan" onClose={onClose} className="is-full">
      <button className="ai-settings-profile" type="button" onClick={onOpenProfile}>
        <span className="ai-avatar">{accountSession.initials}</span>
        <span>
          <strong>{accountSession.fullName}</strong>
          <small>{accountSession.email}</small>
        </span>
        <ChevronRight size={18} />
      </button>
      <div className="ai-pro-card">
        <div>
          <strong>DLavie AI Pro</strong>
          <p>Mode Agent, konektor premium, dan balasan lebih cepat.</p>
        </div>
        <button type="button" onClick={onOpenUpgrade}>
          Tingkatkan
        </button>
      </div>
      {settingsSections.map((section) => (
        <section className="ai-settings-section" key={section.title}>
          <h3>{section.title}</h3>
          <div className="ai-settings-card">
            {section.items.map((item) => {
              const Icon = settingsIconMap[item.icon];
              return (
                <button key={item.label} type="button" onClick={() => handleSettingsItem(item)}>
                  <span className="ai-settings-row-icon"><Icon size={18} /></span>
                  <span className="ai-settings-row-label">{item.label}</span>
                  <ChevronRight size={17} />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </SheetShell>
  );
}

function ProfileSheet({ open, accountSession, onClose }: { open: boolean; accountSession: DlavieAccountSession; onClose: () => void }) {
  return (
    <SheetShell
      open={open}
      title="Profil"
      onClose={onClose}
      rightAction={
        <button className="ai-text-button" type="button" onClick={onClose}>
          Simpan
        </button>
      }
    >
      <div className="ai-profile-hero">
        <span className="ai-avatar is-large"><DlavieAiMark /></span>
        <button type="button">Ubah</button>
      </div>
      {!accountSession.authenticated ? (
        <a className="ai-signin-card" href="/account/login">
          Masuk untuk menghubungkan profil DLavie Anda.
        </a>
      ) : null}
      <div className="ai-form-card">
        <InfoRow label="Nama" value={accountSession.fullName} />
        <InfoRow label="Email" value={accountSession.email} />
        <InfoRow label="Minat Produk" value={accountSession.productInterest} />
        <InfoRow label="Kelola Akun" value={accountSession.authenticated ? 'Tersambung' : 'Belum masuk'} />
      </div>
    </SheetShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ai-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ConnectorsSheet({ open, onClose, onNotice }: { open: boolean; onClose: () => void; onNotice: (message: string) => void }) {
  return (
    <SheetShell open={open} title="Konektor" onClose={onClose}>
      <div className="ai-sheet-intro">
        <h3>Bawa alat Anda ke DLavie AI</h3>
        <p>Hubungkan aplikasi untuk memberi konteks yang aman saat Anda bekerja.</p>
      </div>
      <div className="ai-connector-list">
        {connectors.map((connector) => (
          <div className="ai-connector-row" key={connector}>
            <span className="ai-connector-icon">{connector === 'GitHub' ? <Github size={18} /> : getConnectorInitial(connector)}</span>
            <strong>{connector}</strong>
            <button type="button" onClick={() => onNotice(`${connector} akan hadir segera.`)}>
              Hubungkan
            </button>
          </div>
        ))}
      </div>
      <button className="ai-primary-wide" type="button" onClick={() => onNotice('Katalog konektor akan hadir segera.')}>
        Tambahkan Konektor
      </button>
    </SheetShell>
  );
}

function AgentSheet({
  open,
  agentName,
  instructions,
  style,
  onNameChange,
  onInstructionsChange,
  onStyleChange,
  onClose,
  onNotice,
}: {
  open: boolean;
  agentName: string;
  instructions: string;
  style: string;
  onNameChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onClose: () => void;
  onNotice: (message: string) => void;
}) {
  const styles = ['Kustom', 'Ringkas', 'Formal', 'Socratic', 'Friendly', 'Developer'];

  return (
    <SheetShell
      open={open}
      title="Edit Agen"
      onClose={onClose}
      rightAction={
        <button
          className="ai-text-button"
          type="button"
          onClick={() => {
            onNotice('Preferensi agen disimpan untuk sesi ini.');
            onClose();
          }}
        >
          Simpan
        </button>
      }
    >
      <label className="ai-field-label">
        Nama
        <input value={agentName} onChange={(event) => onNameChange(event.target.value)} />
      </label>
      <label className="ai-field-label">
        Instruksi
        <textarea
          value={instructions}
          onChange={(event) => onInstructionsChange(event.target.value)}
          placeholder="Bagaimana seharusnya DLavie AI bersikap?"
          rows={5}
        />
      </label>
      <div className="ai-style-chips" aria-label="Gaya agen">
        {styles.map((item) => (
          <button
            className={item === style ? 'is-selected' : ''}
            key={item}
            type="button"
            onClick={() => onStyleChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </SheetShell>
  );
}

function UpgradeSheet({
  open,
  billingCycle,
  onBillingCycleChange,
  onClose,
  onNotice,
}: {
  open: boolean;
  billingCycle: 'monthly' | 'yearly';
  onBillingCycleChange: (value: 'monthly' | 'yearly') => void;
  onClose: () => void;
  onNotice: (message: string) => void;
}) {
  return (
    <SheetShell open={open} title="DLavie AI Pro" onClose={onClose}>
      <div className="ai-upgrade-hero">
        <Sparkles size={28} />
        <h3>DLavie AI Pro</h3>
        <p>Buka kemampuan penuh DLavie AI.</p>
      </div>
      <div className="ai-billing-toggle" aria-label="Pilih periode pembayaran">
        <button
          className={billingCycle === 'monthly' ? 'is-selected' : ''}
          type="button"
          onClick={() => onBillingCycleChange('monthly')}
        >
          Bulanan
        </button>
        <button
          className={billingCycle === 'yearly' ? 'is-selected' : ''}
          type="button"
          onClick={() => onBillingCycleChange('yearly')}
        >
          Tahunan
        </button>
      </div>
      <div className="ai-feature-card">
        {upgradeFeatures.map((feature) => (
          <div key={feature}>
            <Check size={17} />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <button className="ai-primary-wide is-blue" type="button" onClick={() => onNotice('Pembayaran DLavie AI Pro akan hadir segera.')}>
        Tingkatkan ke DLavie AI Pro
      </button>
      <div className="ai-footer-links">
        <button type="button">Ketentuan Layanan</button>
        <button type="button">Kebijakan Privasi</button>
        <button type="button">Pulihkan Pembelian</button>
      </div>
    </SheetShell>
  );
}

function VoiceOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Content className="ai-voice-overlay" aria-describedby={undefined}>
          <Dialog.Close asChild>
            <button className="ai-icon-button" type="button" aria-label="Tutup mode suara">
              <X size={20} />
            </button>
          </Dialog.Close>
          <div className="ai-voice-status">
            <span className="ai-voice-pulse"><DlavieAiMark /></span>
            <Dialog.Title>Mode suara belum aktif</Dialog.Title>
            <p>DLavie AI belum meminta akses mikrofon. Mode suara akan hadir saat backend suara siap.</p>
          </div>
          <div className="ai-voice-controls">
            <button type="button" aria-label="Speaker"><Volume2 size={21} /></button>
            <button type="button" aria-label="Mikrofon"><MicOff size={21} /></button>
            <button type="button" aria-label="Pengaturan"><Settings size={21} /></button>
            <button className="is-stop" type="button" aria-label="Berhenti" onClick={onClose}><StopCircle size={24} /></button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
