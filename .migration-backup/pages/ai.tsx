import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  Brain,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileText,
  Globe2,
  Image as ImageIcon,
  Layers3,
  MessageSquare,
  Paperclip,
  Pencil,
  Search,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import gsap from 'gsap';
import { dlavieAiPacks, estimateTextUnits, type DlavieAiPack, type DlavieAiPackId } from '@/lib/dlavie-ai-credits';
import { dlavieAiPlans, type DlavieAiPlan } from '@/lib/dlavie-ai-plans';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Screen = 'welcome' | 'form' | 'app';
type Tab = 'chat' | 'playground' | 'projects' | 'pricing' | 'resources';
type Mode = 'instant' | 'thinking' | 'agent' | 'research';
type Billing = 'month' | 'year';
type Msg = { id: string; role: 'user' | 'assistant'; content: string; model?: string; tools?: string[]; vision?: boolean };
type Attachment = { id: string; name: string; kind: 'file' | 'image'; size: number; text?: string; inline?: string; preview?: string };
type Access = { authenticated: boolean; plan: DlavieAiPlan; name: string; dailyQuota: number; dailyUsed: number; remaining: number; dBalance: number; aiTokenBalance: number };

const VIDEO = 'https://image-link.edgeone.app/1779988010622-t0qa9o.mp4';
const intents = ['Website dan aplikasi', 'Konten dan brand', 'Analisis bisnis', 'Agent otomatis', 'Debugging kode', 'Belajar dan riset'];
const sources = ['TikTok atau Reels', 'Instagram', 'Teman atau komunitas', 'Google Search', 'YouTube', 'Website DLAVIE'];
const professions = ['Pelajar atau mahasiswa', 'Founder atau owner', 'Web developer', 'Content creator', 'Designer', 'Marketer', 'Freelancer', 'Lainnya'];
const promptIdeas = ['Rate foto yang saya upload secara detail', 'Buat landing page produk digital DLAVIE', 'Audit arsitektur website saya'];

const models = [
  { id: 'dlavie-x-lite', name: 'Dlavie X Lite', tier: 'Fast', usage: 'Ringkasan, ide cepat, chat ringan', cost: '0.7x' },
  { id: 'dlavie-x-mini', name: 'Dlavie X Mini', tier: 'Default', usage: 'Konten, support, tugas harian', cost: '1x' },
  { id: 'dlavie-1-5', name: 'Dlavie 1.5', tier: 'Stable', usage: 'Planning, UI UX, strategi produk', cost: '1.4x' },
  { id: 'dlavie-1-5-preview', name: 'Dlavie 1.5 Preview', tier: 'Preview', usage: 'Eksperimen reasoning dan ide baru', cost: '1.8x' },
  { id: 'dlavie-x-3', name: 'Dlavie X 3', tier: 'Pro', usage: 'Coding, debugging, agent, arsitektur, vision', cost: '2.2x' },
  { id: 'dlavie-agent-pro', name: 'Dlavie Agent Pro', tier: 'Soon', usage: 'Workflow multi-step dan automation', cost: '3x' },
];

const modes: { id: Mode; title: string; desc: string; Icon: typeof Zap }[] = [
  { id: 'instant', title: 'Instant', desc: 'Jawaban cepat dan ringkas.', Icon: Zap },
  { id: 'thinking', title: 'Thinking', desc: 'Menampilkan proses analisis.', Icon: Brain },
  { id: 'agent', title: 'Agent', desc: 'Membuat rencana dan langkah kerja.', Icon: Bot },
  { id: 'research', title: 'Deep Research', desc: 'Riset lebih panjang dengan status web.', Icon: Search },
];

const pricing = [
  { name: 'Free', monthly: 0, yearly: 0, badge: 'Explore', accent: 'from-slate-200/20 to-white/5', features: ['8 chat per hari', 'Dlavie X Lite dan X Mini', 'Resource standar', 'Tanpa Memory', 'Tanpa mode agent lanjutan'] },
  { name: 'Basic', monthly: 25000, yearly: 250000, badge: 'Starter', accent: 'from-blue-500/20 to-white/5', features: ['40 chat per hari', 'Upload file teks ringan', 'Gems standar', 'Context lebih panjang', 'Memory belum tersedia'] },
  { name: 'Core', monthly: 175000, yearly: 1750000, badge: 'Recommended', accent: 'from-[#dfff4f]/25 to-blue-500/10', features: ['300 chat per hari', 'Memory aktif', 'Thinking dan Agent mode', 'Dlavie 1.5 dan X 3', 'Build workspace dan vision'] },
  { name: 'Custom', monthly: 477000, yearly: 4777000, badge: 'Studio', accent: 'from-violet-500/25 to-cyan-400/10', features: ['1.200 chat per hari', 'Memory prioritas', 'Custom workflow', 'Context besar', 'Model routing premium'] },
];

let audioCtx: AudioContext | null = null;

function tone(kind: 'click' | 'enter' | 'toggle' | 'done' = 'click') {
  if (typeof window === 'undefined') return;

  try {
    navigator.vibrate?.(kind === 'click' ? 8 : kind === 'toggle' ? 12 : 18);

    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    audioCtx = audioCtx || new Ctor();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()