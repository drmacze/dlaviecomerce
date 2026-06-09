'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import Link from 'next/link';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  Check,
  ChevronRight,
  Github,
  Link2,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  UserRound,
  Workflow,
  X,
  Zap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { AccountSessionView } from '../../lib/supabase/account-session';
import { DlavieAiMark } from './DlavieAiMark';
import { aiModes, type AiModeIconKey, type AiModeId } from './aiContent';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
  private?: boolean;
};
type HistoryItem = {
  id: string;
  title: string;
  mode: string;
  createdAt: string;
  updatedAt: string;
  preview: string;
};
type SheetName = 'settings' | 'profile' | 'history' | 'connectors' | 'privacy' | null;
type Preferences = { historyEnabled: boolean };
type MeResponse = { ok: boolean; account: AccountSessionView; providers: string[] };

const modeIconMap: Record<AiModeIconKey, LucideIcon> = {
  zap: Zap,
  sparkles: Sparkles,
  workflow: Workflow,
  search: Search,
  lock: Lock,
};
const safeFallback =
  'DLavie AI sedang memakai mode aman. Jelaskan kebutuhan Anda dalam satu atau dua kalimat dan saya akan membantu semampunya.';
const unavailable = 'Belum tersedia: membutuhkan backend connector/token storage.';
const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function DlavieAiAppShell({ accountSession }: { accountSession: AccountSessionView }) {
  const [account, setAccount] = useState(accountSession);
  const [providers, setProviders] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({ historyEnabled: false });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState<AiModeId>('fast');
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetName>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMessages = messages.length > 0;
  const modeLabel = useMemo(
    () => aiModes.find((item) => item.id === selectedMode)?.label ?? 'Fast',
    [selectedMode],
  );

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setNotice(''), 3600);
  }, []);

  const loadHistory = useCallback(async () => {
    const response = await fetch('/api/ai/history', {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.ok) setHistoryItems(result.items ?? []);
  }, []);

  useEffect(() => {
    fetch('/api/account/me', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => {
        const result = (await response.json()) as MeResponse;
        if (!response.ok || !result.ok) return;
        setAccount(result.account);
        setProviders(result.providers ?? []);
        if (!result.account.authenticated) return;
        const preferencesResponse = await fetch('/api/ai/preferences', {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        const preferencesResult = await preferencesResponse.json().catch(() => ({}));
        const next = {
          historyEnabled:
            preferencesResponse.ok && preferencesResult.preferences?.historyEnabled === true,
        };
        setPreferences(next);
        if (next.historyEnabled) void loadHistory();
      })
      .catch(() => showNotice('Status akun tidak dapat dimuat saat ini.'));
  }, [loadHistory, showNotice]);

  useEffect(() => {
    stageRef.current?.scrollTo({
      top: stageRef.current.scrollHeight,
      behavior: sending ? 'smooth' : 'auto',
    });
  }, [messages, sending]);

  function startNewChat() {
    setMessages([]);
    setConversationId(undefined);
    setPlusMenuOpen(false);
    setModeSelectorOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }
  function openSheet(sheet: SheetName) {
    setActiveSheet(sheet);
    setPlusMenuOpen(false);
    setModeSelectorOpen(false);
  }

  async function toggleHistory() {
    if (!account.authenticated) {
      showNotice('Login untuk mengaktifkan riwayat per akun.');
      return;
    }
    const response = await fetch('/api/ai/preferences', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ historyEnabled: !preferences.historyEnabled }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      showNotice(result.message ?? 'Preferensi tidak dapat diperbarui.');
      return;
    }
    const next = { historyEnabled: result.preferences.historyEnabled === true };
    setPreferences(next);
    if (next.historyEnabled) void loadHistory();
    showNotice(
      next.historyEnabled
        ? 'Riwayat aktif untuk chat berikutnya.'
        : 'Riwayat nonaktif. Chat baru tidak akan disimpan.',
    );
  }

  async function sendMessage(nextMessage = inputValue) {
    const message = nextMessage.trim();
    if (!message || sending) return;
    const userMessage: ChatMessage = {
      id: newId('user'),
      role: 'user',
      content: message,
      private: selectedMode === 'private',
    };
    const pendingId = newId('assistant');
    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: pendingId,
        role: 'assistant',
        content: 'DLavie AI sedang berpikir…',
        pending: true,
        private: selectedMode === 'private',
      },
    ]);
    setInputValue('');
    setSending(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          mode: selectedMode,
          conversationId,
          metadata: { history_enabled: preferences.historyEnabled },
        }),
      });
      const result = await response.json().catch(() => ({}));
      const answer =
        response.ok && typeof result.answer === 'string' ? result.answer : safeFallback;
      setMessages((current) =>
        current.map((item) =>
          item.id === pendingId ? { ...item, content: answer, pending: false } : item,
        ),
      );
      if (result.persisted === true && result.conversationId) {
        setConversationId(result.conversationId);
        void loadHistory();
      }
      if (!response.ok)
        showNotice('Model utama tidak tersedia; mode aman digunakan tanpa mengganggu chat.');
    } catch {
      setMessages((current) =>
        current.map((item) =>
          item.id === pendingId ? { ...item, content: safeFallback, pending: false } : item,
        ),
      );
      showNotice('Koneksi model terputus; mode aman digunakan.');
    } finally {
      setSending(false);
    }
  }

  async function openConversation(id: string) {
    const response = await fetch(`/api/ai/history/${id}`, {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      showNotice(result.message ?? 'Percakapan tidak dapat dibuka.');
      return;
    }
    setMessages(
      (result.messages ?? [])
        .filter((item: { role: string }) => item.role === 'user' || item.role === 'assistant')
        .map((item: { id?: string; role: 'user' | 'assistant'; content: string }) => ({
          id: item.id ?? newId(item.role),
          role: item.role,
          content: item.content,
        })),
    );
    setConversationId(id);
    setActiveSheet(null);
  }

  async function deleteConversation(id: string) {
    await fetch(`/api/ai/history/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    if (conversationId === id) startNewChat();
    void loadHistory();
  }
  async function deleteAll() {
    if (!window.confirm('Hapus semua riwayat percakapan?')) return;
    await fetch('/api/ai/history', { method: 'DELETE', credentials: 'same-origin' });
    setHistoryItems([]);
    startNewChat();
  }
  async function logout() {
    const response = await fetch('/api/account/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    const result = await response.json().catch(() => ({}));
    window.location.assign(result.redirectTo ?? '/account/login');
  }
  function onComposerSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }
  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <main className="dlavie-ai-app">
      <div className="ai-app-frame">
        <TopBar
          account={account}
          onNewChat={startNewChat}
          onHistory={() => openSheet('history')}
          onSettings={() => openSheet('settings')}
          onProfile={() => openSheet('profile')}
          onConnectors={() => openSheet('connectors')}
          onPrivacy={() => openSheet('privacy')}
          onLogout={logout}
        />
        <section ref={stageRef} className={`ai-chat-stage ${hasMessages ? 'has-messages' : ''}`}>
          {hasMessages ? (
            <MessageList messages={messages} />
          ) : (
            <EmptyState
              account={account}
              mode={selectedMode}
              historyEnabled={preferences.historyEnabled}
            />
          )}
        </section>
        <div className="ai-composer-dock">
          {notice ? (
            <div className="ai-toast" role="status">
              {notice}
            </div>
          ) : null}
          <form className="ai-composer-card" onSubmit={onComposerSubmit}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={onComposerKeyDown}
              rows={1}
              placeholder="Tanya apa saja"
              aria-label="Pesan untuk DLavie AI"
            />
            <div className="ai-composer-actions">
              <Popover.Root open={plusMenuOpen} onOpenChange={setPlusMenuOpen}>
                <Popover.Trigger asChild>
                  <button className="ai-icon-button" type="button" aria-label="Menu tambahan">
                    <Plus size={20} />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="ai-floating-panel ai-plus-panel"
                    side="top"
                    align="start"
                    sideOffset={12}
                  >
                    <UnsupportedMenu
                      onNotice={showNotice}
                      onConnectors={() => openSheet('connectors')}
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
              <Popover.Root open={modeSelectorOpen} onOpenChange={setModeSelectorOpen}>
                <Popover.Trigger asChild>
                  <button className="ai-mode-trigger" type="button">
                    {modeLabel}
                    <ChevronRight size={16} />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="ai-floating-panel ai-mode-panel"
                    side="top"
                    align="start"
                    sideOffset={12}
                  >
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
              <span className="ai-composer-spacer" />
              <button
                className="ai-send-button"
                type="submit"
                disabled={!inputValue.trim() || sending}
                aria-label="Kirim"
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </form>
          <p className="ai-composer-caption">
            {selectedMode === 'private'
              ? 'Mode Private — percakapan ini tidak disimpan.'
              : preferences.historyEnabled
                ? 'Riwayat aktif untuk akun ini.'
                : 'Riwayat nonaktif secara default.'}
          </p>
        </div>
      </div>
      <SettingsSheet
        open={activeSheet === 'settings'}
        account={account}
        historyEnabled={preferences.historyEnabled}
        onClose={() => setActiveSheet(null)}
        onProfile={() => openSheet('profile')}
        onHistory={() => openSheet('history')}
        onConnectors={() => openSheet('connectors')}
        onPrivacy={() => openSheet('privacy')}
        onToggleHistory={toggleHistory}
        onLogout={logout}
      />
      <ProfileSheet
        open={activeSheet === 'profile'}
        account={account}
        providers={providers}
        onClose={() => setActiveSheet(null)}
        onLogout={logout}
      />
      <HistorySheet
        open={activeSheet === 'history'}
        account={account}
        enabled={preferences.historyEnabled}
        items={historyItems}
        onClose={() => setActiveSheet(null)}
        onToggle={toggleHistory}
        onOpen={openConversation}
        onDelete={deleteConversation}
        onDeleteAll={deleteAll}
      />
      <ConnectorsSheet
        open={activeSheet === 'connectors'}
        account={account}
        providers={providers}
        onClose={() => setActiveSheet(null)}
      />
      <PrivacySheet open={activeSheet === 'privacy'} onClose={() => setActiveSheet(null)} />
    </main>
  );
}

function TopBar({
  account,
  onNewChat,
  onHistory,
  onSettings,
  onProfile,
  onConnectors,
  onPrivacy,
  onLogout,
}: {
  account: AccountSessionView;
  onNewChat: () => void;
  onHistory: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onConnectors: () => void;
  onPrivacy: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="ai-topbar">
      <button className="ai-brand-button" type="button" onClick={onNewChat}>
        <DlavieAiMark />
        <strong>DLavie AI</strong>
      </button>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className="ai-icon-button" type="button" aria-label="Buka menu">
            <Menu size={20} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="ai-floating-panel ai-main-menu" align="end" sideOffset={10}>
            <button type="button" onClick={onNewChat}>
              <Plus size={18} />
              <span>
                <strong>Chat baru</strong>
                <small>Mulai percakapan baru</small>
              </span>
            </button>
            <button type="button" onClick={onHistory}>
              <MessageSquare size={18} />
              <span>
                <strong>Percakapan</strong>
                <small>Riwayat per akun</small>
              </span>
            </button>
            <button type="button" onClick={onSettings}>
              <Settings size={18} />
              <span>
                <strong>Pengaturan</strong>
                <small>Akun, data, dan koneksi</small>
              </span>
            </button>
            <button type="button" onClick={onConnectors}>
              <Link2 size={18} />
              <span>
                <strong>Konektor</strong>
                <small>Status koneksi akun</small>
              </span>
            </button>
            <button type="button" onClick={onPrivacy}>
              <Lock size={18} />
              <span>
                <strong>Privasi & Data</strong>
                <small>Kontrol penyimpanan</small>
              </span>
            </button>
            <button type="button" onClick={onProfile}>
              <span className="ai-avatar">{account.initials}</span>
              <span>
                <strong>{account.authenticated ? account.fullName : 'Login'}</strong>
                <small>{account.authenticated ? account.email : 'Hubungkan akun DLavie'}</small>
              </span>
            </button>
            {account.authenticated ? (
              <button type="button" onClick={onLogout}>
                <LogOut size={18} />
                <span>
                  <strong>Keluar</strong>
                  <small>Akhiri sesi akun</small>
                </span>
              </button>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </header>
  );
}
function EmptyState({
  account,
  mode,
  historyEnabled,
}: {
  account: AccountSessionView;
  mode: AiModeId;
  historyEnabled: boolean;
}) {
  const status =
    mode === 'private'
      ? 'Mode Private — percakapan tidak disimpan.'
      : !account.authenticated
        ? 'Login untuk sinkronisasi akun dan riwayat.'
        : historyEnabled
          ? 'Riwayat aktif untuk akun ini.'
          : 'Riwayat nonaktif secara default.';

  return (
    <div className="ai-empty-state">
      <span className="ai-empty-mark">
        <DlavieAiMark />
      </span>
      <h1>Apa yang ingin Anda kerjakan?</h1>
      <p>{status}</p>
    </div>
  );
}
function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="ai-message-list" aria-live="polite">
      {messages.map((message) => (
        <article
          className={`ai-message is-${message.role} ${message.pending ? 'is-pending' : ''}`}
          key={message.id}
        >
          <div>{message.content}</div>
          {message.private ? (
            <small>
              <Lock size={12} /> Private
            </small>
          ) : null}
        </article>
      ))}
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
    <div className="ai-mode-selector-list">
      {aiModes.map((mode) => {
        const Icon = modeIconMap[mode.icon];
        return (
          <button
            className={mode.id === selectedMode ? 'is-selected' : ''}
            key={mode.id}
            type="button"
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
function UnsupportedMenu({
  onNotice,
  onConnectors,
}: {
  onNotice: (message: string) => void;
  onConnectors: () => void;
}) {
  return (
    <div className="ai-plus-menu-list">
      <button type="button" disabled>
        <Plus size={18} />
        <span>
          <strong>Upload media</strong>
          <small>{unavailable}</small>
        </span>
      </button>
      <button type="button" disabled>
        <Workflow size={18} />
        <span>
          <strong>Voice & camera</strong>
          <small>{unavailable}</small>
        </span>
      </button>
      <button type="button" onClick={onConnectors}>
        <Link2 size={18} />
        <span>
          <strong>Koneksi akun</strong>
          <small>Lihat status konektor</small>
        </span>
      </button>
      <button type="button" onClick={() => onNotice(unavailable)}>
        <Shield size={18} />
        <span>
          <strong>Info fitur</strong>
          <small>Status backend yang jujur</small>
        </span>
      </button>
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
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
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
  account,
  historyEnabled,
  onClose,
  onProfile,
  onHistory,
  onConnectors,
  onPrivacy,
  onToggleHistory,
  onLogout,
}: {
  open: boolean;
  account: AccountSessionView;
  historyEnabled: boolean;
  onClose: () => void;
  onProfile: () => void;
  onHistory: () => void;
  onConnectors: () => void;
  onPrivacy: () => void;
  onToggleHistory: () => void;
  onLogout: () => void;
}) {
  return (
    <SheetShell open={open} title="Pengaturan" onClose={onClose} className="is-full">
      <button className="ai-settings-profile" type="button" onClick={onProfile}>
        <span className="ai-avatar">{account.initials}</span>
        <span>
          <strong>{account.authenticated ? account.fullName : 'Login ke DLavie'}</strong>
          <small>{account.authenticated ? account.email : 'Sinkronkan profil dan riwayat'}</small>
        </span>
        <ChevronRight size={18} />
      </button>
      <div className="ai-settings-section">
        <h3>DLavie AI</h3>
        <div className="ai-settings-card">
          <SettingsRow icon={MessageSquare} label="Percakapan" onClick={onHistory} />
          <SettingsRow
            icon={Shield}
            label={`Simpan Riwayat: ${historyEnabled ? 'Aktif' : 'Nonaktif'}`}
            onClick={onToggleHistory}
          />
          <SettingsRow icon={Link2} label="Koneksi Akun" onClick={onConnectors} />
          <SettingsRow icon={Lock} label="Privasi & Data" onClick={onPrivacy} />
        </div>
      </div>
      {account.authenticated ? (
        <button className="ai-primary-wide" type="button" onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      ) : (
        <Link className="ai-primary-wide" href="/account/login">
          Login
        </Link>
      )}
    </SheetShell>
  );
}
function SettingsRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}>
      <span className="ai-settings-row-icon">
        <Icon size={18} />
      </span>
      <span className="ai-settings-row-label">{label}</span>
      <ChevronRight size={17} />
    </button>
  );
}
function ProfileSheet({
  open,
  account,
  providers,
  onClose,
  onLogout,
}: {
  open: boolean;
  account: AccountSessionView;
  providers: string[];
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <SheetShell open={open} title="Profil" onClose={onClose}>
      {account.authenticated ? (
        <>
          <div className="ai-profile-hero">
            <span className="ai-avatar is-large">{account.initials}</span>
            <strong>Tersambung</strong>
          </div>
          <div className="ai-form-card">
            <InfoRow label="Nama" value={account.fullName ?? '—'} />
            <InfoRow label="Email" value={account.email ?? '—'} />
            <InfoRow label="Minat Produk" value={account.productInterest} />
            <InfoRow
              label="Provider"
              value={providers.length ? providers.map(formatProvider).join(', ') : 'Email'}
            />
          </div>
          <button className="ai-primary-wide" type="button" onClick={onLogout}>
            <LogOut size={18} /> Logout
          </button>
        </>
      ) : (
        <div className="ai-sheet-intro">
          <UserRound size={28} />
          <h3>Profil belum terhubung</h3>
          <p>Login untuk menampilkan identitas dan provider akun yang sebenarnya.</p>
          <Link className="ai-primary-wide" href="/account/login">
            Login
          </Link>
        </div>
      )}
    </SheetShell>
  );
}
function HistorySheet({
  open,
  account,
  enabled,
  items,
  onClose,
  onToggle,
  onOpen,
  onDelete,
  onDeleteAll,
}: {
  open: boolean;
  account: AccountSessionView;
  enabled: boolean;
  items: HistoryItem[];
  onClose: () => void;
  onToggle: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}) {
  return (
    <SheetShell
      open={open}
      title="Percakapan"
      onClose={onClose}
      rightAction={
        items.length ? (
          <button className="ai-text-button" type="button" onClick={onDeleteAll}>
            Hapus semua
          </button>
        ) : null
      }
    >
      {!account.authenticated ? (
        <div className="ai-sheet-intro">
          <h3>Login diperlukan</h3>
          <p>Riwayat bersifat opt-in dan disimpan per akun.</p>
          <Link className="ai-primary-wide" href="/account/login">
            Login
          </Link>
        </div>
      ) : !enabled ? (
        <div className="ai-sheet-intro">
          <h3>Riwayat nonaktif</h3>
          <p>Chat tetap berjalan tanpa disimpan. Aktifkan hanya jika Anda menginginkannya.</p>
          <button className="ai-primary-wide" type="button" onClick={onToggle}>
            Aktifkan Riwayat
          </button>
        </div>
      ) : items.length ? (
        <div className="ai-history-list">
          {items.map((item) => (
            <div className="ai-history-item" key={item.id}>
              <button type="button" onClick={() => onOpen(item.id)}>
                <strong>{item.title}</strong>
                <small>{item.preview || item.mode}</small>
              </button>
              <button
                type="button"
                aria-label={`Hapus ${item.title}`}
                onClick={() => onDelete(item.id)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="ai-sheet-intro">
          <h3>Belum ada percakapan tersimpan</h3>
          <p>Chat berikutnya akan muncul di sini. Mode Private selalu dikecualikan.</p>
        </div>
      )}
    </SheetShell>
  );
}
function ConnectorsSheet({
  open,
  account,
  providers,
  onClose,
}: {
  open: boolean;
  account: AccountSessionView;
  providers: string[];
  onClose: () => void;
}) {
  const active = (provider: string) =>
    providers.includes(provider) ||
    (provider === 'email' && account.authenticated && providers.length === 0);
  return (
    <SheetShell open={open} title="Koneksi Akun" onClose={onClose}>
      <div className="ai-connector-list">
        {['google', 'github', 'email'].map((provider) => (
          <ConnectorRow key={provider} label={formatProvider(provider)} active={active(provider)} />
        ))}
        {['Gmail', 'Google Drive', 'Notion', 'Camera / media', 'Voice'].map((label) => (
          <ConnectorRow key={label} label={label} active={false} disabled />
        ))}
      </div>
    </SheetShell>
  );
}
function ConnectorRow({
  label,
  active,
  disabled = false,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="ai-connector-row">
      <span className="ai-connector-icon">
        {label === 'GitHub' ? <Github size={18} /> : label.slice(0, 1)}
      </span>
      <strong>{label}</strong>
      <span>{active ? 'Aktif' : disabled ? 'Butuh konektor backend' : 'Tidak aktif'}</span>
    </div>
  );
}
function PrivacySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SheetShell open={open} title="Privasi & Data" onClose={onClose}>
      <div className="ai-sheet-intro">
        <Lock size={28} />
        <h3>Riwayat selalu opt-in</h3>
        <p>
          Identitas diambil dari cookie server yang aman. Mode Private dan chat saat riwayat
          nonaktif tidak dipersist.
        </p>
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
function formatProvider(provider: string) {
  return provider === 'github'
    ? 'GitHub'
    : provider === 'google'
      ? 'Google'
      : provider.charAt(0).toUpperCase() + provider.slice(1);
}
