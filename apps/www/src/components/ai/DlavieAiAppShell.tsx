'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { History, Menu, Plus, Send, Settings, UserRound, X } from 'lucide-react';
import type { AccountSessionView } from '../../lib/supabase/account-session';

type Sheet = 'settings' | 'profile' | 'history' | 'connectors' | 'privacy' | 'agent' | 'upgrade' | null;
type HistoryItem = { id: string; title: string; mode: string; createdAt: string; updatedAt: string; preview: string };
type ChatMessage = { role: 'user' | 'assistant'; content: string };
type MeResponse = { ok: boolean; account: AccountSessionView; providers: string[] };

export function DlavieAiAppShell({ accountSession }: { accountSession: AccountSessionView }) {
  const [account, setAccount] = useState(accountSession);
  const [providers, setProviders] = useState<string[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [mode, setMode] = useState<'fast' | 'private'>('fast');
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [input, setInput] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const loadHistory = useCallback(async () => {
    const response = await fetch('/api/ai/history', { cache: 'no-store', credentials: 'same-origin' });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.ok) setHistoryItems(result.items ?? []);
  }, []);

  useEffect(() => {
    fetch('/api/account/me', { cache: 'no-store', credentials: 'same-origin' }).then(async (response) => {
      const result = await response.json() as MeResponse;
      if (!response.ok || !result.ok) return;
      setAccount(result.account);
      setProviders(result.providers ?? []);
      if (!result.account.authenticated) return;
      const preferencesResponse = await fetch('/api/ai/preferences', { cache: 'no-store', credentials: 'same-origin' });
      const preferencesResult = await preferencesResponse.json().catch(() => ({}));
      const enabled = preferencesResponse.ok && preferencesResult.preferences?.historyEnabled === true;
      setHistoryEnabled(enabled);
      if (enabled) void loadHistory();
    }).catch(() => setNotice('Status akun tidak dapat dimuat saat ini.'));
  }, [loadHistory]);

  async function toggleHistory() {
    if (!account.authenticated) { setNotice('Login untuk mengaktifkan riwayat per akun.'); return; }
    const response = await fetch('/api/ai/preferences', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ historyEnabled: !historyEnabled }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setNotice(result.message ?? 'Preferensi tidak dapat diperbarui.'); return; }
    setHistoryEnabled(result.preferences.historyEnabled);
    setNotice(result.preferences.historyEnabled ? 'Riwayat aktif untuk chat berikutnya.' : 'Riwayat nonaktif. Riwayat lama tidak dihapus.');
    if (result.preferences.historyEnabled) void loadHistory();
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const message = input.trim(); if (!message || busy) return;
    setInput(''); setMessages((current) => [...current, { role: 'user', content: message }]); setBusy(true); setNotice('');
    const response = await fetch('/api/ai/chat', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, mode, conversationId, metadata: { history_enabled: historyEnabled } }) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setNotice(result.message ?? 'AI tidak tersedia saat ini.'); return; }
    setMessages((current) => [...current, { role: 'assistant', content: result.answer }]);
    if (result.persisted && result.conversationId) { setConversationId(result.conversationId); void loadHistory(); }
  }

  async function openConversation(id: string) {
    const response = await fetch(`/api/ai/history/${id}`, { cache: 'no-store', credentials: 'same-origin' });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setNotice(result.message ?? 'Percakapan tidak dapat dibuka.'); return; }
    setMessages((result.messages ?? []).filter((item: { role: string }) => item.role === 'user' || item.role === 'assistant').map((item: ChatMessage) => ({ role: item.role, content: item.content })));
    setConversationId(id); setActiveSheet(null);
  }

  async function deleteConversation(id: string) { await fetch(`/api/ai/history/${id}`, { method: 'DELETE', credentials: 'same-origin' }); if (conversationId === id) { setConversationId(undefined); setMessages([]); } void loadHistory(); }
  async function deleteAll() { if (!window.confirm('Hapus semua riwayat percakapan?')) return; await fetch('/api/ai/history', { method: 'DELETE', credentials: 'same-origin' }); setHistoryItems([]); setConversationId(undefined); setMessages([]); }
  async function logout() { const response = await fetch('/api/account/logout', { method: 'POST', credentials: 'same-origin' }); const result = await response.json().catch(() => ({})); window.location.assign(result.redirectTo ?? '/account/login'); }
  function newChat() { setConversationId(undefined); setMessages([]); setMenuOpen(false); }
  const providerActive = (provider: string) => providers.includes(provider) || (provider === 'email' && account.authenticated && providers.length === 0);

  return <main className="ai-app-shell">
    <header className="ai-app-topbar"><button aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}><Menu /></button><strong>DLavie AI</strong><button aria-label="Profil" className="ai-avatar" onClick={() => setActiveSheet('profile')}>{account.initials}</button></header>
    {menuOpen ? <nav className="ai-menu"><button onClick={newChat}><Plus /> Chat baru</button><button onClick={() => { setActiveSheet('history'); setMenuOpen(false); }}><History /> Percakapan</button><button onClick={() => { setActiveSheet('settings'); setMenuOpen(false); }}><Settings /> Pengaturan</button></nav> : null}
    <section className="ai-chat" aria-live="polite">{messages.length ? messages.map((message, index) => <article key={index} className={`ai-message is-${message.role}`}>{message.content}</article>) : <div className="ai-empty"><span>DL</span><h1>Apa yang ingin kamu kerjakan?</h1><p>Riwayat {historyEnabled ? 'aktif untuk akun ini' : 'nonaktif secara default'}.</p></div>}{busy ? <p className="ai-muted-copy">DLavie AI sedang merespons…</p> : null}</section>
    {notice ? <button className="ai-notice" onClick={() => setNotice('')}>{notice}<X size={14} /></button> : null}
    <form className="ai-composer" onSubmit={sendMessage}><div className="ai-mode-switch"><button type="button" className={mode === 'fast' ? 'is-on' : ''} onClick={() => setMode('fast')}>Cepat</button><button type="button" className={mode === 'private' ? 'is-on' : ''} onClick={() => setMode('private')}>Privat</button></div><div><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Kirim pesan…" aria-label="Pesan"/><button type="submit" aria-label="Kirim" disabled={busy}><Send /></button></div><p>Voice dan unggahan belum tersedia karena backend belum aktif.</p></form>
    {activeSheet ? <><button className="ai-sheet-backdrop" aria-label="Tutup" onClick={() => setActiveSheet(null)} /><aside className="ai-sheet"><header><h2>{activeSheet === 'history' ? 'Percakapan' : activeSheet === 'profile' ? 'Profil' : activeSheet === 'connectors' ? 'Koneksi Akun' : activeSheet === 'privacy' ? 'Privasi & Data' : activeSheet === 'agent' ? 'Agent' : activeSheet === 'upgrade' ? 'Upgrade' : 'Pengaturan'}</h2><button aria-label="Tutup" onClick={() => setActiveSheet(null)}><X /></button></header>
      {activeSheet === 'settings' ? <div className="ai-sheet-stack"><button onClick={() => setActiveSheet('profile')}><UserRound /> Profil</button><button onClick={() => setActiveSheet('history')}><History /> Percakapan</button><label className="ai-toggle-row"><span><strong>Simpan Riwayat</strong><small>Opt-in per akun. Mode Privat tidak pernah disimpan.</small></span><input type="checkbox" checked={historyEnabled} onChange={toggleHistory} /></label><button onClick={() => setActiveSheet('connectors')}>Koneksi Akun</button><button onClick={() => setActiveSheet('privacy')}>Privasi & Data</button><button onClick={() => setActiveSheet('agent')}>Agent</button><button onClick={() => setActiveSheet('upgrade')}>Upgrade</button>{account.authenticated ? <button className="ai-danger-wide" onClick={logout}>Logout</button> : <Link className="ai-primary-wide" href="/account/login">Login</Link>}</div> : null}
      {activeSheet === 'profile' ? account.authenticated ? <div className="ai-profile"><span className="ai-profile-avatar">{account.initials}</span><h3>{account.fullName}</h3><p>{account.email}</p><p>{account.productInterest}</p><span className="ai-status-pill is-on">Akun aktif</span><p>Metode masuk: {providers.length ? providers.join(', ') : 'email'}</p><button className="ai-danger-wide" onClick={logout}>Logout</button></div> : <div className="ai-empty-sheet"><p>Belum masuk. Login untuk melihat profil akun nyata.</p><Link className="ai-primary-wide" href="/account/login">Login</Link></div> : null}
      {activeSheet === 'history' ? !account.authenticated ? <div className="ai-empty-sheet"><p>Login untuk mengaktifkan riwayat per akun.</p><Link className="ai-primary-wide" href="/account/login">Login</Link></div> : !historyEnabled ? <div className="ai-empty-sheet"><p>Riwayat nonaktif. Chat tidak disimpan.</p><button className="ai-primary-wide" onClick={toggleHistory}>Aktifkan Riwayat</button></div> : <div className="ai-history-list">{historyItems.map((item) => <article className="ai-history-item" key={item.id}><button onClick={() => openConversation(item.id)}><strong>{item.title}</strong><small>{item.preview || 'Percakapan tersimpan'}</small></button><button aria-label="Hapus percakapan" onClick={() => deleteConversation(item.id)}><X /></button></article>)}{!historyItems.length ? <p className="ai-muted-copy">Belum ada percakapan tersimpan.</p> : <button className="ai-danger-wide" onClick={deleteAll}>Hapus semua riwayat</button>}</div> : null}
      {activeSheet === 'connectors' ? <div className="ai-sheet-stack">{['google','github','email'].map((provider) => <div className="ai-toggle-row" key={provider}><strong>{provider[0].toUpperCase()+provider.slice(1)}</strong><span className={`ai-status-pill ${providerActive(provider) ? 'is-on' : ''}`}>{providerActive(provider) ? 'Aktif' : 'Tidak terhubung'}</span></div>)}{['Gmail','Google Drive','Notion','Kamera/media'].map((name) => <div className="ai-disabled-row" key={name}><strong>{name}</strong><small>Belum tersedia: membutuhkan OAuth konektor dan penyimpanan token aman.</small></div>)}</div> : null}
      {activeSheet === 'privacy' ? <div className="ai-sheet-stack"><p className="ai-muted-copy">Riwayat hanya disimpan setelah opt-in. Mode Privat tidak pernah dipersistenkan.</p>{historyItems.length ? <button className="ai-danger-wide" onClick={deleteAll}>Hapus semua riwayat</button> : null}</div> : null}
      {activeSheet === 'agent' ? <div className="ai-empty-sheet"><p>Preferensi lokal sesi ini. Penyimpanan konfigurasi Agent belum tersedia.</p></div> : null}
      {activeSheet === 'upgrade' ? <div className="ai-empty-sheet"><p>Billing belum aktif. Checkout tidak tersedia.</p></div> : null}
    </aside></> : null}
  </main>;
}
