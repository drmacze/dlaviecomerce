'use client';

import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  Camera,
  Check,
  ChevronRight,
  FileText,
  Github,
  Image,
  Link2,
  Menu,
  Mic,
  MicOff,
  Plus,
  Settings,
  Sparkles,
  StopCircle,
  Volume2,
  X,
} from 'lucide-react';
import type { DlavieAccountSession } from '../../lib/supabase/account-session';
import {
  aiModes,
  aiQuickActions,
  connectors,
  settingsSections,
  upgradeFeatures,
  type AiModeId,
  type AiQuickActionId,
} from './aiContent';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
};

type SheetName = 'settings' | 'profile' | 'connectors' | 'agent' | 'upgrade' | null;

type DlavieAiAppShellProps = {
  accountSession: DlavieAccountSession;
};

const FRIENDLY_FALLBACK =
  'DLavie AI sedang kesulitan terhubung ke model utama. Saya tetap bisa membantu dengan mode aman: jelaskan kebutuhan Anda, misalnya akun, PPOB, website, atau automation.';

const quickPrompts: Partial<Record<AiQuickActionId, string>> = {
  website: 'Bantu saya menyusun rencana website premium untuk bisnis DLavie.',
  ppob: 'Bantu saya memahami alur support PPOB dan langkah pengecekan yang aman.',
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getModeLabel(mode: AiModeId) {
  return aiModes.find((item) => item.id === mode)?.label ?? 'Fast';
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

  const hasMessages = messages.length > 0;
  const modeLabel = useMemo(() => getModeLabel(selectedMode), [selectedMode]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
  }

  function insertPrompt(prompt: string) {
    setInputValue(prompt);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleQuickAction(action: AiQuickActionId) {
    if (action === 'document') {
      setPlusMenuOpen(true);
      return;
    }
    if (action === 'camera') {
      showNotice('Kamera akan hadir segera. Untuk sekarang, tulis konteks yang ingin dianalisis.');
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

    setInputValue('');
    setPlusMenuOpen(false);
    setModeSelectorOpen(false);
    const userMessage: ChatMessage = { id: newId('user'), role: 'user', content: trimmed };
    const pendingMessage: ChatMessage = {
      id: newId('assistant-pending'),
      role: 'assistant',
      content: 'DLavie AI sedang menyusun jawaban…',
      pending: true,
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
          message.id === pendingMessage.id ? { ...message, content: answer, pending: false } : message,
        ),
      );
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingMessage.id
            ? { ...message, content: FRIENDLY_FALLBACK, pending: false }
            : message,
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
    }
    setPlusMenuOpen(false);
  }

  function closeSheet() {
    setActiveSheet(null);
  }

  return (
    <main className="dlavie-ai-app" aria-label="DLavie AI app">
      <div className="ai-app-frame">
        <TopBar accountSession={accountSession} onOpenSettings={() => setActiveSheet('settings')} />

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
              <button
                className="ai-icon-button"
                type="button"
                aria-label="Buka menu tambahan"
                aria-expanded={plusMenuOpen}
                onClick={() => {
                  setPlusMenuOpen((open) => !open);
                  setModeSelectorOpen(false);
                }}
              >
                <Plus size={20} />
              </button>
              <button
                className="ai-mode-chip"
                type="button"
                aria-label="Pilih mode AI"
                aria-expanded={modeSelectorOpen}
                onClick={() => {
                  setModeSelectorOpen((open) => !open);
                  setPlusMenuOpen(false);
                }}
              >
                {modeLabel}
              </button>
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
          {plusMenuOpen ? <PlusMenu onSelect={handleMenuItem} /> : null}
          {modeSelectorOpen ? (
            <ModeSelector
              selectedMode={selectedMode}
              onSelect={(mode) => {
                setSelectedMode(mode);
                setModeSelectorOpen(false);
              }}
            />
          ) : null}
        </form>
      </div>

      {notice ? <div className="ai-toast">{notice}</div> : null}
      {activeSheet === 'settings' ? (
        <SettingsSheet
          accountSession={accountSession}
          onClose={closeSheet}
          onOpenProfile={() => setActiveSheet('profile')}
          onOpenUpgrade={() => setActiveSheet('upgrade')}
          onOpenConnectors={() => setActiveSheet('connectors')}
          onOpenAgent={() => setActiveSheet('agent')}
          onNotice={showNotice}
        />
      ) : null}
      {activeSheet === 'profile' ? <ProfileSheet accountSession={accountSession} onClose={closeSheet} /> : null}
      {activeSheet === 'connectors' ? <ConnectorsSheet onClose={closeSheet} onNotice={showNotice} /> : null}
      {activeSheet === 'agent' ? (
        <AgentSheet
          agentName={agentName}
          instructions={agentInstructions}
          style={agentStyle}
          onNameChange={setAgentName}
          onInstructionsChange={setAgentInstructions}
          onStyleChange={setAgentStyle}
          onClose={closeSheet}
          onNotice={showNotice}
        />
      ) : null}
      {activeSheet === 'upgrade' ? (
        <UpgradeSheet
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
          onClose={closeSheet}
          onNotice={showNotice}
        />
      ) : null}
      {voiceOpen ? <VoiceOverlay onClose={() => setVoiceOpen(false)} /> : null}
    </main>
  );
}

function TopBar({
  accountSession,
  onOpenSettings,
}: {
  accountSession: DlavieAccountSession;
  onOpenSettings: () => void;
}) {
  return (
    <header className="ai-topbar">
      <div className="ai-brand-lockup" aria-label="DLavie AI">
        <span className="ai-brand-mark">D</span>
        <span>DLavie AI</span>
      </div>
      <button className="ai-profile-button" type="button" aria-label="Buka pengaturan" onClick={onOpenSettings}>
        <span>{accountSession.initials}</span>
        <Menu size={16} />
      </button>
    </header>
  );
}

function EmptyState({ accountSession }: { accountSession: DlavieAccountSession }) {
  return (
    <div className="ai-empty-state">
      <div className="ai-orb" aria-hidden="true">
        <span>D</span>
      </div>
      <p>{accountSession.authenticated ? `Siap membantu, ${accountSession.fullName}.` : 'Mode preview publik aktif.'}</p>
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
    { label: 'Kamera', icon: Camera },
    { label: 'Foto', icon: Image },
    { label: 'Berkas', icon: FileText },
    { label: 'Konektor', icon: Link2 },
  ];

  return (
    <div className="ai-floating-panel ai-plus-menu" role="menu" aria-label="Menu tambahan">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.label} type="button" role="menuitem" onClick={() => onSelect(item.label)}>
            <span>
              <Icon size={18} />
            </span>
            {item.label}
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
    <div className="ai-floating-panel ai-mode-selector" role="listbox" aria-label="Pilih mode DLavie AI">
      {aiModes.map((mode) => (
        <button
          className={mode.id === selectedMode ? 'is-selected' : ''}
          key={mode.id}
          type="button"
          role="option"
          aria-selected={mode.id === selectedMode}
          onClick={() => onSelect(mode.id)}
        >
          <span>
            <strong>{mode.label}</strong>
            <small>{mode.description}</small>
          </span>
          {mode.id === selectedMode ? <Check size={18} /> : null}
        </button>
      ))}
    </div>
  );
}

function SheetShell({
  title,
  children,
  onClose,
  className = '',
  rightAction,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="ai-sheet-backdrop" role="presentation">
      <section className={`ai-sheet ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="ai-sheet-header">
          <button className="ai-icon-button" type="button" aria-label="Tutup" onClick={onClose}>
            <X size={19} />
          </button>
          <h2>{title}</h2>
          <div className="ai-sheet-action-slot">{rightAction}</div>
        </header>
        <div className="ai-sheet-body">{children}</div>
      </section>
    </div>
  );
}

function SettingsSheet({
  accountSession,
  onClose,
  onOpenProfile,
  onOpenUpgrade,
  onOpenConnectors,
  onOpenAgent,
  onNotice,
}: {
  accountSession: DlavieAccountSession;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenUpgrade: () => void;
  onOpenConnectors: () => void;
  onOpenAgent: () => void;
  onNotice: (message: string) => void;
}) {
  function handleSettingsItem(label: string) {
    if (label === 'Sesuaikan') onOpenAgent();
    else if (label === 'Konektor') onOpenConnectors();
    else onNotice(`${label} akan hadir segera di DLavie AI.`);
  }

  return (
    <SheetShell title="Pengaturan" onClose={onClose} className="is-full">
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
            {section.items.map((item) => (
              <button key={item} type="button" onClick={() => handleSettingsItem(item)}>
                <span>{item}</span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>
      ))}
    </SheetShell>
  );
}

function ProfileSheet({ accountSession, onClose }: { accountSession: DlavieAccountSession; onClose: () => void }) {
  return (
    <SheetShell
      title="Profil"
      onClose={onClose}
      rightAction={
        <button className="ai-text-button" type="button" onClick={onClose}>
          Simpan
        </button>
      }
    >
      <div className="ai-profile-hero">
        <span className="ai-avatar is-large">{accountSession.initials}</span>
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

function ConnectorsSheet({ onClose, onNotice }: { onClose: () => void; onNotice: (message: string) => void }) {
  return (
    <SheetShell title="Konektor" onClose={onClose}>
      <div className="ai-sheet-intro">
        <h3>Bawa alat Anda ke DLavie AI</h3>
        <p>Hubungkan aplikasi untuk memberi konteks yang aman saat Anda bekerja.</p>
      </div>
      <div className="ai-connector-list">
        {connectors.map((connector) => (
          <div className="ai-connector-row" key={connector}>
            <span className="ai-connector-icon">{connector === 'GitHub' ? <Github size={18} /> : connector.at(0)}</span>
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
  agentName,
  instructions,
  style,
  onNameChange,
  onInstructionsChange,
  onStyleChange,
  onClose,
  onNotice,
}: {
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
  billingCycle,
  onBillingCycleChange,
  onClose,
  onNotice,
}: {
  billingCycle: 'monthly' | 'yearly';
  onBillingCycleChange: (value: 'monthly' | 'yearly') => void;
  onClose: () => void;
  onNotice: (message: string) => void;
}) {
  return (
    <SheetShell title="DLavie AI Pro" onClose={onClose}>
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

function VoiceOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="ai-voice-overlay" role="dialog" aria-modal="true" aria-label="Mode suara DLavie AI">
      <button className="ai-icon-button" type="button" aria-label="Tutup mode suara" onClick={onClose}>
        <X size={20} />
      </button>
      <div className="ai-voice-status">
        <span className="ai-voice-pulse"><MicOff size={38} /></span>
        <h2>Mode suara belum aktif</h2>
        <p>DLavie AI belum meminta akses mikrofon. Mode suara akan hadir saat backend suara siap.</p>
      </div>
      <div className="ai-voice-controls">
        <button type="button" aria-label="Speaker"><Volume2 size={21} /></button>
        <button type="button" aria-label="Mikrofon"><Mic size={21} /></button>
        <button type="button" aria-label="Pengaturan"><Settings size={21} /></button>
        <button className="is-stop" type="button" aria-label="Berhenti" onClick={onClose}><StopCircle size={24} /></button>
      </div>
    </div>
  );
}
