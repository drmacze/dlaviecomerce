import React, { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';

const triggerVibration = (pattern: number | number[] = 50) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch(e) {}
  }
};
import { useDropzone } from 'react-dropzone';
import Confetti from 'react-confetti';
import { ShoppingCart, Menu, X, MessageCircle, Star, ShieldCheck, Truck, CreditCard, Send, Plus, Briefcase, List as ListIcon, Info, User, Bot, LayoutGrid, MessageSquare, Download, CheckCircle, ArrowRight, Users, Moon, Ticket as TicketIcon, Sun, Volume2, VolumeX, Upload, Megaphone, Settings, Edit3, Bell, Mail, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react';
import Tilt from 'react-parallax-tilt';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
// @ts-ignore
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';

// ================= AUDIO ENGINE =================
const sfxClick = typeof Audio !== 'undefined' ? new Audio('https://actions.google.com/sounds/v1/foley/cassette_deck_button.ogg') : null;
const sfxSwoosh = typeof Audio !== 'undefined' ? new Audio('https://actions.google.com/sounds/v1/foley/whoosh_dry.ogg') : null;
const bgmAudio = typeof Audio !== 'undefined' ? new Audio('https://actions.google.com/sounds/v1/science_fiction/sci_fi_ambience.ogg') : null;

if (sfxClick) sfxClick.volume = 0.5;
if (sfxSwoosh) sfxSwoosh.volume = 0.3;
if (bgmAudio) {
  bgmAudio.loop = true;
  bgmAudio.volume = 0.15;
}

export const playClick = () => {
  if (sfxClick) {
    sfxClick.currentTime = 0;
    sfxClick.play().catch(() => {});
  }
};

export const playSwoosh = () => {
  if (sfxSwoosh) {
    sfxSwoosh.currentTime = 0;
    sfxSwoosh.play().catch(() => {});
  }
};
// ================================================

// ================= CONSTANTS =================
const WITTY_EMPTY_CATALOG = [
  "Brankas digitalmu kosong, Komandan. Mari isi dengan aset premium!",
  "Sepi banget di sini, ayo klaim template gratis atau borong yang pro!",
  "Rak ini sedang bermeditasi. Tambahkan produk untuk membangunkannya.",
  "Belum ada yang cocok? Tenang, ide-ide gila sedang dalam perjalanan.",
  "Oops! Sepertinya kurir digital kami sedang tersesat. Coba cari kata kunci lain?"
];

const WITTY_EMPTY_COMMUNITY = [
  "Jangkrik pun belum berbunyi di sini. Jadilah yang pertama memulai ghibah kreatif!",
  "Sunyi senyap... Apa semua orang sedang asyik ngedit template?",
  "Ruang hampa terdeteksi! Isi dengan ide cemerlangmu sekarang.",
  "Jangan malu-malu, ketik sesuatu! Bahkan admin pun butuh hiburan.",
  "Tempat ini sepi banget, bagai dompet di akhir bulan. Ayo ramaikan!"
];

const WITTY_EMPTY_REWARDS = [
  "Poinmu masih nol? Yuk, login tiap hari dan kumpulkan L-Points!",
  "Kantong poinmu tipis banget, Sultan. Ayo berburu reward!",
  "Belum ada hadiah? Mungkin karena kamu terlalu sibuk jadi orang keren.",
  "Kumpulkan poin, tukar barang. Gampang kan? Ayo mulai!",
  "Masih kosong? Tenang, VIP Access akan merubah segalanya."
];

// ================= COMPONENTS =================
const UserIntelligenceTooltip = ({ username, children }: { username: string, children: React.ReactNode }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserInsight = async () => {
    if (insight) return;
    setIsLoading(true);
    try {
      // Logic would call /api/user-insight or similar
      // Mocking for now as requested per "Zero-Click AI Edge" guidelines to show immediate feel
      const profiles = ["Sering bantu jawab di technical", "Sultan Kolektor Template Pro", "Ekspertis di Bidang Grafik", "Pecinta L-Points Militan", "Digital Nomad Sejati"];
      const statuses = ["On Fire", "Mencari Inspirasi", "Sedang Ngedit", "Ready for Hire", "AFK sebentar"];
      const randomInsight = `${profiles[Math.floor(Math.random() * profiles.length)]}. Status: ${statuses[Math.floor(Math.random() * statuses.length)]}`;
      setInsight(randomInsight);
    } catch (e) {}
    setIsLoading(false);
  };

  return (
    <div className="relative group/user inline-block" onMouseEnter={fetchUserInsight}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl opacity-0 group-hover/user:opacity-100 pointer-events-none transition-all z-50 border-2 border-emerald-500 scale-90 group-hover/user:scale-100">
         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Lumina AI Profile</span>
         </div>
         {isLoading ? (
           <div className="h-4 bg-slate-800 rounded animate-pulse w-full"></div>
         ) : (
           <p className="text-[11px] font-bold italic leading-relaxed text-slate-200">"{insight || 'Menganalisa aura digital user...'}"</p>
         )}
         <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
};

const EmptyState = ({ type, icon: Icon }: { type: 'catalog' | 'community' | 'rewards', icon: any }) => {
  const [phrase] = useState(() => {
    const list = type === 'catalog' ? WITTY_EMPTY_CATALOG : type === 'community' ? WITTY_EMPTY_COMMUNITY : WITTY_EMPTY_REWARDS;
    return list[Math.floor(Math.random() * list.length)];
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center"
    >
      <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <p className="max-w-xs font-bold text-slate-500 text-sm leading-relaxed tracking-tight underline decoration-emerald-200 decoration-4 underline-offset-4">
        {phrase}
      </p>
    </motion.div>
  );
};

interface Product {
  id: number;
  name: string;
  price: number;
  currentPrice?: number;
  image: string;
  videoPreview?: string;
  category: string;
  secretContent: string;
  is_deleted?: boolean;
  isPremiumOnly?: boolean;
  dynamicPricing?: boolean;
  priceIncrement?: number;
  salesThreshold?: number;
  salesCount?: number;
  stock: number;
  demoUrl?: string; // V7: Live Preview
  licenses?: { name: string; price: number }[]; // V7: Tiered Licensing
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedLicenseIndex: number;
}

interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  amount: number;
  minPurchase: number;
  maxUse: number;
  currentUse: number;
  expDate: string;
  isActive: boolean;
}

// Wrapper for Confetti
const SmartConfetti = (props: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false });
  
  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none z-[100]">
       {isInView && <Confetti {...props} />}
    </div>
  );
};
const SmartTilt = ({ children, ...props }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  
  if (!isInView) {
    return <div ref={ref} className={props.className || ''}>{children}</div>;
  }
  
  return (
    <div ref={ref}>
       <Tilt {...props}>{children}</Tilt>
    </div>
  );
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'owner' | 'system';
  text: string;
  timestamp: Date;
}

interface ThreadReply {
  id: string;
  thread_id: string;
  authorName: string;
  content: string;
  timestamp: Date;
  isVIP?: boolean;
  customBannerClass?: string;
  bannerUrl?: string;
}

interface CommunityThread {
  id: string;
  authorName: string;
  authorEmail: string;
  isVerifiedBuyer: boolean;
  isVIP?: boolean;
  customBannerClass?: string;
  bannerUrl?: string;
  category?: string;
  title: string;
  content: string;
  timestamp: Date;
  stars_count: number;
  replies: ThreadReply[];
}

interface LuminaNews {
  id: string;
  title: string;
  content_html: string;
  is_pinned: boolean;
  start_date: string; // ISO string
  end_date: string; // ISO string
}

interface MailboxMessage {
  id: string;
  sender_name: string;
  title: string;
  content: string;
  is_claimed?: boolean;
  is_read: boolean;
  gift_type?: 'l_points' | 'item';
  gift_amount?: number;
  created_at: Date;
}

interface UserData {
  name: string;
  email: string;
  isVIP?: boolean;
  affiliateEarnings?: number;
  totalReferrals?: number;
  lPoints?: number;
  lastClaimDate?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  activeTheme?: 'default' | 'night-synced' | 'party-mode' | 'ruby' | 'violet' | 'royal-blue' | 'matrix';
  activeFont?: 'Inter' | 'Playfair Display' | 'JetBrains Mono' | 'Plus Jakarta Sans';
  customBannerClass?: string;
  current_status?: string;
  level?: string;
  xp?: number;
  trophies?: string[];
  profileViews?: number;
  isVerifiedBuyer?: boolean;
  birthDate?: string;
  last_login?: string;
}

const formatIDR = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const AvatarDropzone = ({ onDrop }: { onDrop: (url: string) => void }) => {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onDrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  } as any);

  return (
    <div 
      {...getRootProps()} 
      className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
    >
      <input {...getInputProps()} />
      <Upload className={`w-8 h-8 mb-2 ${isDragActive ? 'text-emerald-500' : 'text-slate-400'}`} />
      <p className="font-bold text-xs text-slate-500 text-center">
        {isDragActive ? 'Lepas gambar disini...' : 'Drag & drop avatar baru, atau klik untuk memilih.'}
      </p>
    </div>
  );
};

const HoverVideoPreview = ({ src, poster }: { src: string, poster: string }) => {
  const vidRef = useRef<HTMLVideoElement>(null);
  return (
    <div 
      className="relative w-full h-full"
      onMouseEnter={() => { if (vidRef.current) vidRef.current.play().catch(() => {}); }}
      onMouseLeave={() => { if (vidRef.current) { vidRef.current.pause(); vidRef.current.currentTime = 0; } }}
    >
      <img src={poster} className="absolute inset-0 object-cover w-full h-full" alt="Product" />
      <video ref={vidRef} src={src} muted loop playsInline className="absolute inset-0 object-cover w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-500 z-10" />
    </div>
  );
};

const MagneticButton = ({ children, onClick, className, disabled, type = "button" }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distX = clientX - centerX;
    const distY = clientY - centerY;
    
    // Only attract if within 50px of the boundary
    if (Math.abs(distX) < width/2 + 50 && Math.abs(distY) < height/2 + 50) {
        setPosition({ x: distX * 0.3, y: distY * 0.3 });
    } else {
        setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      type={type}
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => { triggerVibration(50); onClick?.(e); }}
      className={className}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

const VIPCursor = ({ isVIP }: { isVIP: boolean }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
  
  useEffect(() => {
    if (window.innerWidth < 768) return;
    
    document.body.style.cursor = 'none';
    let id = 0;
    
    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (isVIP) {
        setTrail(prev => [...prev.slice(-15), { x: e.clientX, y: e.clientY, id: id++ }]);
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.body.style.cursor = '';
    }
  }, [isVIP]);

  if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

  return (
    <>
      {isVIP && trail.map((t, i) => (
         <div key={t.id} className="fixed w-3 h-3 bg-amber-400 rounded-full mix-blend-screen pointer-events-none z-[99999]" style={{ left: t.x - 6, top: t.y - 6, opacity: (i / trail.length) * 0.5, transform: `scale(${(i / trail.length)})`, transition: 'opacity 0.1s' }} />
      ))}
      <div className="fixed w-4 h-4 bg-white rounded-full mix-blend-difference pointer-events-none z-[100000] shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" style={{ left: pos.x - 8, top: pos.y - 8 }} />
    </>
  );
};

const ScratchCard = ({ code }: { code: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratched, setScratched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#cbd5e1'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GOSOK DI SINI', canvas.width / 2, canvas.height / 2);

    let isDrawing = false;
    
    const getPos = (e: any) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const start = (e: any) => { isDrawing = true; scratch(e); };
    const stop = () => { isDrawing = false; checkScratched(); };
    const scratch = (e: any) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    };

    const checkScratched = () => {
       const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
       const pixels = image.data;
       let transparent = 0;
       for (let i = 3; i < pixels.length; i += 4) {
         if (pixels[i] === 0) transparent++;
       }
       if (transparent / (canvas.width * canvas.height) > 0.6) {
          setScratched(true);
       }
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseleave', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    canvas.addEventListener('touchend', stop);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', scratch);
      canvas.removeEventListener('mouseup', stop);
      canvas.removeEventListener('mouseleave', stop);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', scratch);
      canvas.removeEventListener('touchend', stop);
    }
  }, []);

  return (
    <div className="relative inline-block w-64 h-16 rounded-xl overflow-hidden border-2 border-slate-300 select-none group cursor-pointer" onClick={(e) => {
        if(scratched) {
            navigator.clipboard.writeText(code);
            triggerVibration([50, 50]);
            window.dispatchEvent(new CustomEvent('showCopyPopup', { detail: { x: e.clientX, y: e.clientY, text: 'Tercopy! ✨' } }));
        }
    }}>
       <div className="absolute inset-0 flex items-center justify-center font-black tracking-widest text-emerald-600 bg-emerald-50 text-xl font-mono">
          {code}
       </div>
       <canvas 
         ref={canvasRef} 
         width={256} 
         height={64} 
         className={`absolute inset-0 z-10 transition-opacity duration-1000 ${scratched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
         style={{ touchAction: 'none' }}
       />
    </div>
  );
};

export default function App() {
  const { scrollY } = useScroll();
  const bgY1 = useTransform(scrollY, [0, 2000], [0, -300]);
  const bgY2 = useTransform(scrollY, [0, 2000], [0, -150]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => {
      setActiveSlide(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDashboard, setIsAdminDashboard] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'katalog' | 'inbox' | 'analytics' | 'broadcast' | 'affiliate' | 'coupons' | 'news'>('katalog');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  
  const [showNewsDrawer, setShowNewsDrawer] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [mailboxMessages, setMailboxMessages] = useState<MailboxMessage[]>([
    {
      id: 'm1',
      sender_name: 'Admin Lumina',
      title: 'Selamat Datang di Lumina!',
      content: 'Halo! Terima kasih telah bergabung dengan komunitas kami. Jelajahi etalase kami untuk menemukan produk digital terbaik.',
      is_read: false,
      created_at: new Date()
    }
  ]);
  const [publicProfileUsername, setPublicProfileUsername] = useState<string | null>(null);
  
  const [copyPopup, setCopyPopup] = useState<{x: number, y: number, text: string} | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
       setCopyPopup({ x: e.detail.x, y: e.detail.y, text: e.detail.text });
       setTimeout(() => setCopyPopup(null), 1500);
    };
    window.addEventListener('showCopyPopup', handler);
    return () => window.removeEventListener('showCopyPopup', handler);
  }, []);
  const [luminaNews, setLuminaNews] = useState<LuminaNews[]>([
    {
      id: 'news-1',
      title: 'Update V9.9: The Master Ecosystem',
      content_html: '<h2>Welcome to the next level of Lumina!</h2><p>Pembaruan kali ini membawa Ekonomi Digital, sistem afiliasi yang diperbarui, dan marketplace gila bernama <strong>L-Market</strong>. Segera kumpulkan poin Anda dan beli VIP Item eksklusif sekarang juga!</p>',
      is_pinned: true,
      start_date: new Date(Date.now() - 86400000).toISOString(),
      end_date: new Date(Date.now() + 86400000 * 30).toISOString()
    }
  ]);
  
  // App State
  const [audioKeystrokes, setAudioKeystrokes] = useState(false);

  useEffect(() => {
    if (!audioKeystrokes) return;
    const handler = (e: globalThis.KeyboardEvent) => {
       const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
       if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
           try {
             const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
             const oscillator = audioCtx.createOscillator();
             const gainNode = audioCtx.createGain();
             oscillator.connect(gainNode);
             gainNode.connect(audioCtx.destination);
             oscillator.type = 'square';
             oscillator.frequency.setValueAtTime(300 + Math.random() * 200, audioCtx.currentTime);
             gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime); 
             gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
             oscillator.start(audioCtx.currentTime);
             oscillator.stop(audioCtx.currentTime + 0.05);
           } catch(err) {}
       }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [audioKeystrokes]);

  useEffect(() => {
     if (typeof document === 'undefined') return;
     const unread = mailboxMessages.filter(m => !m.is_read).length;
     const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
     link.type = 'image/svg+xml';
     link.rel = 'icon';
     const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
       <rect width="100" height="100" rx="20" fill="#0f172a" />
       <text x="50" y="70" font-family="Arial" font-size="60" font-weight="bold" fill="white" text-anchor="middle">L</text>
       ${unread > 0 ? '<circle cx="85" cy="15" r="15" fill="#f43f5e" />' : ''}
     </svg>`;
     link.href = `data:image/svg+xml;base64,${btoa(svg)}`;
     if (!document.querySelector("link[rel*='icon']")) {
       document.getElementsByTagName('head')[0].appendChild(link);
     }
  }, [mailboxMessages]);

  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'community'>('home');
  const [communityThreads, setCommunityThreads] = useState<CommunityThread[]>([
    {
      id: 'mock-1',
      authorName: 'Sultan Budi',
      authorEmail: 'sultan@example.com',
      isVerifiedBuyer: true,
      isVIP: true,
      category: 'Pamer Produk',
      title: 'Setup Lumina v9 The Aurora 🚀',
      content: 'Baru saja mengupdate profil dengan Aurora Animasi yang baru. Gila banget efek tembus pandangnya! Kudos ke dev tim buat fitur Chameleon ini... Kotak chat saya jadi yang paling mencolok sekarang 😂',
      timestamp: new Date(Date.now() - 3600000),
      stars_count: 142,
      customBannerClass: 'vip-banner-liquid',
      replies: [
        {
          id: 'reply-1',
          thread_id: 'mock-1',
          authorName: 'Admin Lumina',
          isVIP: true,
          customBannerClass: 'vip-banner-matrix',
          content: 'Terima kasih atas dukungannya! Nantikan efek-efek gila lainnya di patch bulan depan 😎',
          timestamp: new Date(Date.now() - 1800000)
        }
      ]
    },
    {
      id: 'mock-2',
      authorName: 'AnonUser99',
      authorEmail: 'anon@example.com',
      isVerifiedBuyer: false,
      isVIP: false,
      category: 'Ide & Saran',
      title: 'Tolong tambahkan fitur Dark Mode penuh',
      content: 'Mata saya sakit kalau baca forum lama-lama di malam hari. Bisa gak ya tambahin toggle dark mode? Btw, banner VIP yang bintang-bintang bagus banget 🤩',
      timestamp: new Date(Date.now() - 7200000),
      stars_count: 24,
      replies: []
    }
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('Ide & Saran');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [allPurchases, setAllPurchases] = useState<{email: string, name: string, products: Product[], date: Date}[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoBanners, setPromoBanners] = useState<{id: number, title: string, content: string}[]>([]);

  const filteredProducts = products.filter(p => !p.is_deleted && (
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  useEffect(() => {
    // Simulate fetching products structure
    const timer = setTimeout(() => {
      setIsLoadingProducts(false);
      setProducts([
        {
          id: 1,
          name: 'The Ultimate Dashboard UI Kit V2',
          price: 499000,
          currentPrice: 249000,
          category: 'UI Kits',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
          videoPreview: 'https://www.w3schools.com/html/mov_bbb.mp4',
          secretContent: 'https://figma.com/file/mock-dashboard',
          dynamicPricing: true,
          salesCount: 45,
          salesThreshold: 10,
        }
      ]);
      setCommunityThreads([
        {
          id: 't1',
          authorName: 'Budi Santoso',
          authorEmail: 'budi@example.com',
          isVerifiedBuyer: true,
          isVIP: true,
          customBannerClass: 'bg-emerald-100/50',
          category: 'Showcase',
          title: 'Hasil desain saya dengan UI Kit terbaru',
          content: 'Ini hasilnya gampang banget dipake! 🚀',
          timestamp: new Date(),
          stars_count: 5,
          replies: []
        }
      ]);

      // Simulate Fetching Banner Promo
      const fetchedBanners = [{id: 1, title: '🔥 Flash Sale!', content: 'Gunakan Kupon LUMINA-GAJIAN untuk diskon hingga 50%! Hanya untuk 100 orang pertama.'}];
      setPromoBanners(fetchedBanners);
      
      if (fetchedBanners.length > 0) {
        setTimeout(() => {
          setIsPromoModalOpen(true);
        }, 1500);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('lumina_chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {}
    }
    return [];
  });
  const [chatInput, setChatInput] = useState('');
  const [adminChatInput, setAdminChatInput] = useState('');
  const [chatMode, setChatMode] = useState<'ai' | 'owner'>('ai');
  const [isTyping, setIsTyping] = useState(false);
  
  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [flyingItem, setFlyingItem] = useState<{ id: number, startX: number, startY: number, endX: number, endY: number, imageUrl: string } | null>(null);

  // Checkout State
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isCheckingOutCart, setIsCheckingOutCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '' });
  const [acceptUpsell, setAcceptUpsell] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<Product[]>([]);
  
  // V7: New Checkout States
  const [selectedLicenseIndex, setSelectedLicenseIndex] = useState(0);
  const [isGifting, setIsGifting] = useState(false);
  const [giftInfo, setGiftInfo] = useState({ email: '', name: '', message: '' });

  // V10: Community Gift Modal State
  const [giftModal, setGiftModal] = useState<{isOpen: boolean, targetUser: string}>({isOpen: false, targetUser: ''});
  const [giftAmount, setGiftAmount] = useState('100');
  const [isGiftAnonymous, setIsGiftAnonymous] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Track Order State
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackContact, setTrackContact] = useState('');
  const [trackedOrderResult, setTrackedOrderResult] = useState<any>(null);

  // Rate Limiting States
  const chatAttemptCount = useRef(0);
  const lastChatTime = useRef(0);
  const [chatBlockMessage, setChatBlockMessage] = useState('');

  const couponAttempts = useRef({ count: 0, firstAttemptTime: 0 });
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberStep, setMemberStep] = useState<'login' | 'magic-sent' | 'dashboard'>('login');
  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<UserData | null>(null);
  const [showBirthdaySurprise, setShowBirthdaySurprise] = useState(false);
  const [treasureFound, setTreasureFound] = useState(false);
  const [liveOnlineUsers, setLiveOnlineUsers] = useState(Math.floor(Math.random() * 300) + 200);

  useEffect(() => {
     const interval = setInterval(() => {
        setLiveOnlineUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
     }, 5000);
     return () => clearInterval(interval);
  }, []);
  const [activeMemberTab, setActiveMemberTab] = useState<'purchases' | 'affiliate' | 'settings' | 'coupons'>('purchases');
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(() => {
    const saved = localStorage.getItem('lumina_bgm_volume');
    return saved ? parseFloat(saved) : 0.2;
  });
  const audioStarted = useRef(false);

  // Audio BGM Auto-play on interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!audioStarted.current) {
        if (bgmAudio) {
          bgmAudio.volume = bgmVolume;
          bgmAudio.play().catch(() => {});
        }
        audioStarted.current = true;
      }
    };
    window.addEventListener('pointerdown', handleInteraction, { once: true });
    return () => window.removeEventListener('pointerdown', handleInteraction);
  }, [bgmVolume]);

  // Konami Code Easter Egg
  useEffect(() => {
    let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (!e.key) return;
      if (e.key === konamiCode[konamiIndex] || e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          konamiIndex = 0;
          window.dispatchEvent(new CustomEvent('showCopyPopup', { detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, text: '🎮 KONAMI CODE: +5000 L-Points! 🎮' } }));
          triggerVibration([100, 50, 100, 50, 200]);
          if (loggedInUser) {
             setLoggedInUser({ ...loggedInUser, lPoints: (loggedInUser.lPoints || 0) + 5000 });
          }
        }
      } else {
        konamiIndex = 0;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loggedInUser]);

  // Birthday Check
  useEffect(() => {
     if (loggedInUser && loggedInUser.birthDate) {
         let today = new Date();
         let bDate = new Date(loggedInUser.birthDate);
         if (bDate.getDate() === today.getDate() && bDate.getMonth() === today.getMonth()) {
             if (!sessionStorage.getItem('bday_surprised')) {
                 setShowBirthdaySurprise(true);
                 sessionStorage.setItem('bday_surprised', 'true');
             }
         }
     }
  }, [loggedInUser]);

  useEffect(() => {
    if (bgmAudio) {
      bgmAudio.volume = bgmVolume;
      localStorage.setItem('lumina_bgm_volume', bgmVolume.toString());
    }
  }, [bgmVolume]);

  useEffect(() => {
    if (loggedInUser?.activeFont) {
      document.body.style.setProperty('--font-sans', `"${loggedInUser.activeFont}", sans-serif`);
      document.body.style.fontFamily = `var(--font-sans)`;
    } else {
      document.body.style.removeProperty('--font-sans');
      document.body.style.fontFamily = '';
    }
  }, [loggedInUser?.activeFont]);

  // Hook sound swoosh on view change
  useEffect(() => {
    playSwoosh();
  }, [currentView]);


  const chatEndRef = useRef<HTMLDivElement>(null);
  const adminChatEndRef = useRef<HTMLDivElement>(null);

  // Secret Login Logic
  const clickTimestamps = useRef<number[]>([]);
  const [isSecretLoginModalOpen, setIsSecretLoginModalOpen] = useState(false);
  const [secretPasswordInput, setSecretPasswordInput] = useState('');

  // Global Body Scroll Lock for Modals & Overlay
  useEffect(() => {
    const isAnyModalOpen = isMenuOpen || isTrackOrderOpen || isMemberModalOpen || isPromoModalOpen || showWinnerModal || isChatOpen || checkoutProduct || isCartOpen || isSecretLoginModalOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isTrackOrderOpen, isMemberModalOpen, isPromoModalOpen, showWinnerModal, isChatOpen, checkoutProduct, isCartOpen, isSecretLoginModalOpen]);
  
  const handleSecretLogin = () => {
    // Check lockout
    const lockout = sessionStorage.getItem('lockout_time');
    if (lockout) {
       const lockoutTime = parseInt(lockout, 10);
       if (Date.now() - lockoutTime < 10 * 60 * 1000) {
           return; // Silent ban
       } else {
           sessionStorage.removeItem('lockout_time');
           sessionStorage.removeItem('failed_attempts');
       }
    }

    const now = Date.now();
    clickTimestamps.current.push(now);
    
    // Keep only timestamps from the last 3 seconds
    clickTimestamps.current = clickTimestamps.current.filter(time => now - time <= 3000);
    
    if (clickTimestamps.current.length >= 5) {
      setIsSecretLoginModalOpen(true);
      clickTimestamps.current = []; // reset
    }
  };

  const handleSecretPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretPasswordInput === 'KEY') { // hardcoded for demo
       setIsAdminDashboard(true);
       setIsSecretLoginModalOpen(false);
       setSecretPasswordInput('');
       sessionStorage.removeItem('failed_attempts');
    } else {
       let failed = parseInt(sessionStorage.getItem('failed_attempts') || '0', 10);
       failed += 1;
       sessionStorage.setItem('failed_attempts', failed.toString());
       if (failed >= 3) {
          sessionStorage.setItem('lockout_time', Date.now().toString());
          setIsSecretLoginModalOpen(false); // Silent close
          setSecretPasswordInput('');
       } else {
          alert('Password salah!');
       }
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen, isAdminDashboard]);

  useEffect(() => {
    localStorage.setItem('lumina_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Handle User Chat Submission
  const handleUserSendMessage = async () => {
    if (!chatInput.trim()) return;

    // V7 Feature: Anti-Spam API Rate Limiting
    const now = Date.now();
    if (chatAttemptCount.current >= 20) {
      setChatBlockMessage('Limit Percakapan Anda Hari ini Terlampaui');
      return;
    }
    if (now - lastChatTime.current < 5000) {
       setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Mohon tunggu 5 detik sebelum mengirim pesan berikutnya (Anti-Spam).',
          timestamp: new Date()
       }]);
       return;
    }
    
    chatAttemptCount.current += 1;
    lastChatTime.current = now;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    if (chatMode === 'ai') {
      setIsTyping(true);
      setTimeout(async () => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: [...chatMessages, userMsg],
              userContext: loggedInUser ? {
                 name: loggedInUser.name,
                 email: loggedInUser.email,
                 is_vip: loggedInUser.isVIP,
                 l_points: loggedInUser.lPoints
              } : null
            })
          });
          
          const data = await response.json();
          
          setIsTyping(false);
          if (!response.ok) {
             setChatMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender: 'ai',
              text: data.error || 'Terjadi kesalahan sistem. Mohon coba lagi.',
              timestamp: new Date()
            }]);
          } else if (data.reply) {
            setChatMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender: 'ai',
              text: data.reply,
              timestamp: new Date()
            }]);
          }
        } catch (error) {
          setIsTyping(false);
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: 'Gagal terhubung ke AI server. Mohon coba lagi.',
            timestamp: new Date()
          }]);
          console.error('Chat error:', error);
        }
      }, 1500);
    }
  };

  const handleAdminSendMessage = () => {
    if (!adminChatInput.trim()) return;
    
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'owner',
      text: adminChatInput,
      timestamp: new Date()
    }]);
    setAdminChatInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, handler: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handler();
    }
  };

  const requestOwner = () => {
    setChatMode('owner');
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'system',
      text: 'Menghubungkan ke Owner... Silakan tinggalkan pesan Anda.',
      timestamp: new Date()
    }]);
  };

  // Admin New Product Form State
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', image: '', category: '', secretContent: '',
    isPremiumOnly: false,
    dynamicPricing: false,
    priceIncrement: '5000',
    salesThreshold: '10',
    stock: '100'
  });
  const [isGeneratingProduct, setIsGeneratingProduct] = useState(false);

  const [newNews, setNewNews] = useState({
    title: '',
    content_html: '',
    is_pinned: false,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  });

  const [userProfiles, setUserProfiles] = useState<any[]>([
    { username: 'Darma', avatar_url: '', isVIP: true, banner_url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80' },
    { username: 'Sultan_Digital', avatar_url: '', isVIP: true, banner_url: '' },
    { username: 'Lumina_Lover', avatar_url: '', isVIP: false, banner_url: '' }
  ]);

  const getProfileData = (username: string) => {
    // Priority: Logged in user if username matches
    if (loggedInUser && loggedInUser.name === username) return loggedInUser;
    // Secondary: Search profiles
    return userProfiles.find(p => p.username === username) || { username, isVIP: false };
  };

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    amount: '',
    minPurchase: '0',
    maxUse: '100',
    expDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  });

  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [btnStates, setBtnStates] = useState({ claim: false, claimSuccess: false, applyCoupon: false, follow: false });

  // ZERO-CLICK AI: STATES
  const [adminDailyInsight, setAdminDailyInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [threadSummaries, setThreadSummaries] = useState<Record<string, string>>({});
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (isAdminDashboard && !adminDailyInsight) {
      fetchAdminInsight();
    }
  }, [isAdminDashboard]);

  // Handle Thread Summary Fetching
  const fetchThreadSummary = async (threadId: string, content: string) => {
    if (threadSummaries[threadId] || content.length < 300) return;
    try {
      const res = await fetch('/api/ai-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.summary) {
        setThreadSummaries(prev => ({ ...prev, [threadId]: data.summary }));
      }
    } catch (e) {}
  };

  // Handle Reply Suggestions
  useEffect(() => {
    if (activeThreadId) {
      const thread = communityThreads.find(t => t.id === activeThreadId);
      if (thread) {
        fetchReplySuggestions(thread.content);
        fetchThreadSummary(thread.id, thread.content);
      }
    } else {
      setSuggestedReplies([]);
    }
  }, [activeThreadId]);

  const fetchReplySuggestions = async (threadContent: string) => {
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch('/api/ai-suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadContent })
      });
      const data = await res.json();
      setSuggestedReplies(data.suggestions || []);
    } catch (e) {}
    setIsLoadingSuggestions(false);
  };

  const fetchAdminInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const stats = {
        salesToday: allPurchases.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).length,
        activeUsers: userProfiles.length + (loggedInUser ? 1 : 0),
        pointsClaimed: Math.floor(Math.random() * 500) + 100 // Mock dynamic stats
      };
      const res = await fetch('/api/admin-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats })
      });
      const data = await res.json();
      setAdminDailyInsight(data.insight);
    } catch (e) {
      setAdminDailyInsight("Bos, koneksi AI kita lagi agak lemot, tapi data manual bilang hari ini Lumina tetap 'on fire'!");
    }
    setIsLoadingInsight(false);
  };

  const handleSaveCoupon = async () => {
    if (!newCoupon.code || !newCoupon.amount) {
      alert('Kode dan Jumlah Diskon wajib diisi!');
      return;
    }

    setIsSavingCoupon(true);
    try {
      const response = await fetch('/api/add-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      const data = await response.json();
      if (response.ok) {
        setCoupons(prev => [data.coupon, ...prev]);
        setNewCoupon({
          code: '',
          type: 'percentage',
          amount: '',
          minPurchase: '0',
          maxUse: '100',
          expDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
        });
        setShowCouponForm(false);
        alert('Kupon berhasil disimpan ke Database! 🎫');
      } else {
        alert(data.error || 'Gagal menyimpan kupon.');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal simpan kupon. Cek server.');
    }
    setIsSavingCoupon(false);
  };

  const handlePublishNews = () => {
    if (!newNews.title || !newNews.content_html) {
      alert('Judul dan Konten tidak boleh kosong!');
      return;
    }
    
    const newsItem: LuminaNews = {
      id: 'news-' + Date.now(),
      title: newNews.title,
      content_html: newNews.content_html,
      is_pinned: newNews.is_pinned,
      start_date: new Date(newNews.start_date).toISOString(),
      end_date: new Date(newNews.end_date).toISOString()
    };
    
    setLuminaNews([newsItem, ...luminaNews]);
    setNewNews({
      title: '',
      content_html: '',
      is_pinned: false,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
    });
    alert('Berita berhasil diterbitkan ke Megaphone! 📢');
  };

  const handleAutoGenerateProduct = async () => {
    setIsGeneratingProduct(true);
    try {
      const response = await fetch('/api/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: 'Produk digital high-quality, bisa template Notion, UI Kit, atau E-book untuk profesional' })
      });
      const data = await response.json();

      if (!response.ok) {
         alert(data.error || 'Gagal generate produk via AI');
      } else if (data && data.name) {
        setNewProduct({
           name: data.name,
           price: data.price.toString(),
           category: data.category,
           image: data.image,
           secretContent: data.secretContent,
           isPremiumOnly: data.isPremiumOnly || false,
           dynamicPricing: data.dynamicPricing || false,
           priceIncrement: '5000',
           salesThreshold: '10',
           stock: '100'
        });
      }
    } catch (e) {
      console.error(e);
      alert('Gagal generate produk via AI. Cek koneksi.');
    }
    setIsGeneratingProduct(false);
  };

  const onDropProductImage = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const objectUrl = URL.createObjectURL(file);
      setNewProduct(prev => ({ ...prev, image: objectUrl }));
    }
  }, []);

  const { getRootProps: getProductImgRootProps, getInputProps: getProductImgInputProps, isDragActive: isProductImgDragActive } = useDropzone({ 
    onDrop: onDropProductImage,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false
  } as any);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.secretContent) return;
    
    const product: Product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseInt(newProduct.price) || 0,
      currentPrice: parseInt(newProduct.price) || 0,
      image: newProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      category: newProduct.category || 'Terbaru',
      secretContent: newProduct.secretContent,
      isPremiumOnly: newProduct.isPremiumOnly,
      dynamicPricing: newProduct.dynamicPricing,
      priceIncrement: parseInt(newProduct.priceIncrement) || 0,
      salesThreshold: parseInt(newProduct.salesThreshold) || 1,
      salesCount: 0,
      stock: parseInt(newProduct.stock) || 0
    };
    
    setProducts(prev => [product, ...prev]);
    setNewProduct({ name: '', price: '', image: '', category: '', secretContent: '', isPremiumOnly: false, dynamicPricing: false, priceIncrement: '5000', salesThreshold: '10', stock: '100' });
    setActiveAdminTab('katalog'); // Optional
    alert('Produk Digital berhasil ditambahkan!');
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product, licenseIndex: number = 0) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Find active cart icon (desktop or mobile)
    const isMobile = window.innerWidth < 768;
    const cartIcon = document.getElementById(isMobile ? 'mobile-cart-icon' : 'desktop-cart-icon');
    
    let targetX = window.innerWidth;
    let targetY = 0;
    
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      targetX = cartRect.left + cartRect.width / 2;
      targetY = cartRect.top + cartRect.height / 2;
    }
    
    setFlyingItem({
      id: Date.now(),
      startX: rect.left + rect.width / 2,
      startY: rect.top + rect.height / 2,
      endX: targetX,
      endY: targetY,
      imageUrl: product.image
    });
    
    // Play a small 'bloop' if possible, or just add to cart immediately
    addToCart(product, licenseIndex);

    // Clear animation
    setTimeout(() => {
      setFlyingItem(null);
    }, 800);
  };

  const addToCart = (product: Product, licenseIndex: number = 0) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedLicenseIndex === licenseIndex);
      if (existing) {
         return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, selectedLicenseIndex: licenseIndex }];
    });
  };

  const removeFromCart = (product: Product, licenseIndex: number = 0) => {
    setCartItems(prev => prev.filter(item => !(item.product.id === product.id && item.selectedLicenseIndex === licenseIndex)));
  };

  const updateCartQuantity = (product: Product, licenseIndex: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === product.id && item.selectedLicenseIndex === licenseIndex) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.licenses?.[item.selectedLicenseIndex]?.price || item.product.currentPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const checkoutCart = () => {
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    setIsCheckingOutCart(true);
    setCheckoutStep('form');
    setCheckoutProduct(null); // Because we check out cart items, not a single product
    setAcceptUpsell(false);
    setCustomerInfo({ name: '', email: '' });
    setSelectedLicenseIndex(0);
    setIsGifting(false);
    setGiftInfo({ email: '', name: '', message: '' });
    setCouponCode('');
    setAppliedCoupon(null);
  };

  // Checkout Logic
  const startCheckout = (product: Product) => {
    // V7: Freebies logic bypasses checkout completely
    if (product.price === 0) {
      setCheckoutProduct(product);
      setPurchasedItems([product]);
      setCheckoutStep('success');
      return;
    }

    setCheckoutProduct(product);
    setCheckoutStep('form');
    setAcceptUpsell(false);
    setCustomerInfo({ name: '', email: '' });
    setSelectedLicenseIndex(0);
    setIsGifting(false);
    setGiftInfo({ email: '', name: '', message: '' });
    setCouponCode('');
    setAppliedCoupon(null);
  };

  const handleApplyCoupon = async () => {
    // V7: Rate limiting (Max 5 attempts per 10 minutes)
    const now = Date.now();
    if (now - couponAttempts.current.firstAttemptTime > 10 * 60 * 1000) {
       couponAttempts.current = { count: 1, firstAttemptTime: now };
    } else {
       if (couponAttempts.current.count >= 5) {
          alert('Terlalu banyak percobaan kode kupon. Silakan coba lagi setelah 10 menit.');
          return;
       }
       couponAttempts.current.count += 1;
    }

    if (!couponCode.trim()) return;

    try {
      const totalAmount = isCheckingOutCart 
        ? getCartTotal()
        : (checkoutProduct ? (checkoutProduct.licenses?.[selectedLicenseIndex]?.price || checkoutProduct.currentPrice || checkoutProduct.price) : 0);

      const response = await fetch('/api/check-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode,
          cartTotal: totalAmount,
          email: customerInfo.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Kupon tidak valid.');
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(data.coupon);
      setShowWinnerModal(true); // Trigger Confetti 🎉
      playClick();
    } catch (error) {
      console.error('Coupon error:', error);
      alert('Gagal memproses kupon. Cek koneksi.');
    }
  };

  const processPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email) return;
    if (isGifting && (!giftInfo.name || !giftInfo.email)) return;
    
    // [SECURITY MOCK] Atomic JWT Coupon Validation Bypass Check
    if (appliedCoupon && appliedCoupon.code === 'VIP-ELITE-99') {
       console.log('🔒 [LOCK] Mengantrekan Transaksi Kupon VIP ke Table Locker. Mencegah exploit "Double Spender".');
       // simulate network sync delay
    }

    // [SECURITY MOCK] Anti-Fraud Affiliate Middleware
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const refParam = urlParams?.get('ref');
    
    if (refParam && loggedInUser && refParam.toLowerCase() === loggedInUser.name.toLowerCase().replace(/\s+/g,'-')) {
       console.warn('🚨 [FRAUD DETECTED] Mencoba menggunakan link afiliasi sendiri. Referrer diabaikan!');
       // You would normally strip the referrer from the transaction payload here
    }

    setCheckoutStep('processing');
    
    // Simulate Payment Gateway Delay
    setTimeout(() => {
      let finalItems: Product[] = [];
      if (isCheckingOutCart) {
        // Expand cart items based on quantities
        cartItems.forEach(item => {
           for (let i = 0; i < item.quantity; i++) {
              finalItems.push(item.product);
           }
        });
      } else {
        finalItems = [checkoutProduct!];
        
        // Smart Bundling: Add related category items if accepted
        if (acceptUpsell && checkoutProduct) {
          const bundles = products.filter(p => p.category === checkoutProduct.category && p.id !== checkoutProduct.id).slice(0, 2);
          finalItems = [...finalItems, ...bundles];
        }
      }
      
      // Update Coupon count (Simulated after Webhook PAID callback)
      if (appliedCoupon) {
        setCoupons(prev => prev.map(c => c.id === appliedCoupon.id ? { ...c, currentUse: c.currentUse + 1 } : c));
      }
      
      // V5 Dynamic Pricing Update
      setProducts(prevProducts => prevProducts.map(p => {
        const cartItemMatch = isCheckingOutCart ? cartItems.find(item => item.product.id === p.id) : null;
        const boughtQty = isCheckingOutCart && cartItemMatch ? cartItemMatch.quantity : (p.id === checkoutProduct?.id ? 1 : 0);
        
        if (boughtQty > 0) {
           const newCount = (p.salesCount || 0) + boughtQty;
           const newStock = Math.max(0, (p.stock || 0) - boughtQty);
           const newPrice = p.dynamicPricing ? p.price + Math.floor(newCount / (p.salesThreshold || 1)) * (p.priceIncrement || 0) : p.price;
           return { ...p, salesCount: newCount, currentPrice: newPrice, stock: newStock };
        }
        return p;
      }));

      const purchaseRecord = {
        email: isGifting ? giftInfo.email : customerInfo.email,
        name: isGifting ? giftInfo.name : customerInfo.name,
        products: finalItems,
        date: new Date()
      };
      setAllPurchases(prev => [...prev, purchaseRecord]);
      
      setPurchasedItems(finalItems);
      if (isCheckingOutCart) setCartItems([]); // Clear cart
      setCheckoutStep('success');

      if (isGifting) {
        setTimeout(() => alert(`Simulasi: Email Gifting berhasil dikirim ke ${giftInfo.email} dari ${customerInfo.name} beserta pesan spesial Anda.`), 500);
      }
    }, 2000);
  };

  // Member Area Logic
  const handleSetTheme = (themeName: 'default' | 'night-synced' | 'party-mode' | 'ruby' | 'violet' | 'royal-blue' | 'matrix') => {
    // [SECURITY MOCK] Hard Server Validation
    if (!loggedInUser?.isVIP) {
       alert("HTTP 403 Access Denied. Status manipulasi Terdeteksi oleh Agent-Guard Boss!");
       return;
    }
    setLoggedInUser({...loggedInUser, activeTheme: themeName});
  };

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmailInput) return;
    
    setMemberStep('magic-sent');
    
    // Simulate Magic Link Email
    setTimeout(() => {
      // Find past purchases for this email
      const userRecords = allPurchases.filter(p => p.email.toLowerCase() === memberEmailInput.toLowerCase());
      const userName = userRecords.length > 0 ? userRecords[0].name : 'Member';
      
      // [SECURITY MOCK] Anti-Urunan Device / Concurrent Session Kick
      if (Math.random() > 0.8) {
        alert('🛡️ [SECURITY GUARD] Akun ini mencoba login dari 3 device berbeda. Sesi dari Device Lama telah di-"Kick" secara paksa untuk melindungi keamanan akun sultan Anda.');
      }

      // [SECURITY MOCK] Otomasi Demoted Revoke (Expired VIP Checked via DB Timeout)
      let isVipActive = false;
      if (Math.random() > 0.9) {
          console.warn('[WEBHOOK SYNC] Status VIP pengguna telah Kadaluarsa/Gagal Bayar. Mencabut lencana VIP...');
          isVipActive = false;
      }

      const initialXp = Math.floor(Math.random() * 500) + 50;
      setLoggedInUser({ 
        name: userName, 
        email: memberEmailInput, 
        isVIP: isVipActive,
        last_login: new Date().toISOString(),
        current_status: 'Free Time',
        profileViews: Math.floor(Math.random() * 40) + 10,
        xp: initialXp,
        level: initialXp > 300 ? 'Apprentice' : 'Novice'
      });
      setMemberStep('dashboard');
    }, 2000);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setMemberStep('login');
    setMemberEmailInput('');
    setPublicProfileUsername(null);
    setIsAdminDashboard(false);
  };

  const claimGift = (msg: MailboxMessage) => {
    if (msg.gift_type === 'l_points' && msg.gift_amount) {
      setLoggedInUser(prev => prev ? { ...prev, lPoints: (prev.lPoints || 0) + msg.gift_amount! } : prev);
      alert(`🎁 Sukses! ${msg.gift_amount} L-Points telah ditambahkan ke saldo Anda.`);
    } else if (msg.gift_type === 'item') {
      alert(`🎁 Sukses! Item eksklusif telah ditambahkan ke inventaris Anda.`);
    }
    setMailboxMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_claimed: true, is_read: true } : m));
  };

  // ================= ADMIN DASHBOARD UI =================
  if (isAdminDashboard) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        {/* Admin Sidebar */}
        <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col items-center py-6 px-4 md:h-screen md:sticky top-0 z-10 shrink-0 shadow-xl border-r-4 border-slate-900 border-opacity-20">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-2xl mb-2 text-slate-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">L</div>
          <h1 className="font-black tracking-widest uppercase mb-8 text-center text-sm mt-2 text-slate-300">Command Center</h1>
          
          <button 
            onClick={() => setActiveAdminTab('katalog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-colors ${activeAdminTab === 'katalog' ? 'bg-emerald-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-slate-300 font-semibold'}`}
          >
            <LayoutGrid className="w-5 h-5" /> Katalog Produk
          </button>
          <button 
            onClick={() => setActiveAdminTab('inbox')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-colors ${activeAdminTab === 'inbox' ? 'bg-emerald-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-slate-300 font-semibold'}`}
          >
            <MessageSquare className="w-5 h-5" />
            Inbox Live Chat
            {chatMessages.length > 0 && <span className="ml-auto bg-slate-900 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full">{chatMessages.length}</span>}
          </button>
          <button 
            onClick={() => setActiveAdminTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-colors ${activeAdminTab === 'analytics' ? 'bg-emerald-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-slate-300 font-semibold'}`}
          >
            <Star className="w-5 h-5" />
            AI Analytics
          </button>
          <button 
            onClick={() => setActiveAdminTab('broadcast')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-colors ${activeAdminTab === 'broadcast' ? 'bg-emerald-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-slate-300 font-semibold'}`}
          >
            <Send className="w-5 h-5" />
            Broadcast
          </button>
          <button 
            onClick={() => setActiveAdminTab('affiliate')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-colors ${activeAdminTab === 'affiliate' ? 'bg-emerald-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-slate-300 font-semibold'}`}
          >
            <Users className="w-5 h-5" />
            Affiliate Control
          </button>
          <button 
            onClick={() => setActiveAdminTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-colors ${activeAdminTab === 'coupons' ? 'bg-emerald-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-slate-300 font-semibold'}`}
          >
            <Star className="w-5 h-5" />
            Promo & Kupon
          </button>
          <button 
            onClick={() => setActiveAdminTab('news')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-colors ${activeAdminTab === 'news' ? 'bg-emerald-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-slate-300 font-semibold'}`}
          >
            <Megaphone className="w-5 h-5" />
            Lumina News
          </button>
          
          <button 
            onClick={() => setIsAdminDashboard(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mt-auto hover:bg-slate-800 text-red-400 font-semibold transition-colors"
          >
            <X className="w-5 h-5" /> Keluar Dashboard
          </button>
        </div>

        {/* Admin Content */}
        <div className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full">
            {/* Intelligence Overview Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 relative overflow-hidden text-white shadow-xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4">
                     <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><Bot className="w-5 h-5 text-slate-900" /></div>
                     <h3 className="font-black text-xl uppercase tracking-widest text-emerald-400">AI Daily Narrative</h3>
                   </div>
                   {isLoadingInsight ? (
                     <div className="space-y-3">
                       <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
                       <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                     </div>
                   ) : (
                     <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-slate-300 font-medium text-base italic leading-relaxed"
                      >
                       "{adminDailyInsight}"
                     </motion.p>
                   )}
                 </div>
              </div>
              <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                 <div className="flex justify-between items-center mb-4">
                    <p className="font-black uppercase tracking-widest text-xs text-slate-400">Quick Stats</p>
                    <div className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Realtime</div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <p className="text-slate-500 text-xs font-bold uppercase">Total Revenue</p>
                       <p className="text-xl font-black text-slate-900 leading-none">{formatIDR(allPurchases.length * 150000)}</p>
                    </div>
                    <div className="flex justify-between items-end">
                       <p className="text-slate-500 text-xs font-bold uppercase">Paid Items</p>
                       <p className="text-xl font-black text-slate-900 leading-none">{allPurchases.reduce((acc, p) => acc + p.products.length, 0)}</p>
                    </div>
                 </div>
              </div>
            </div>

          {activeAdminTab === 'katalog' && (
            <div className="animate-in fade-in zoom-in duration-300">
               <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                 <div>
                   <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Manajemen Katalog</h2>
                   <p className="text-slate-500 font-bold uppercase text-xs mt-1 tracking-wider">Tambah & Atur Produk Etalase</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-black text-xl uppercase flex items-center gap-2"><Plus className="text-emerald-500" /> Tambah Produk Baru</h3>
                     <button 
                       type="button"
                       onClick={handleAutoGenerateProduct}
                       disabled={isGeneratingProduct}
                       className="px-3 py-1.5 bg-slate-900 border-2 border-slate-900 text-emerald-400 font-bold uppercase text-[10px] rounded-lg shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all flex items-center gap-1 disabled:opacity-50"
                     >
                       <Bot className="w-4 h-4" /> {isGeneratingProduct ? 'Membuat...' : 'AI Generate'}
                     </button>
                   </div>
                   <form onSubmit={handleAddProduct} className="space-y-4">
                     <div>
                       <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nama Produk</label>
                       <input 
                         type="text" 
                         required
                         value={newProduct.name}
                         onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                         className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium" 
                         placeholder="Contoh: Dompet Kulit Klasik" 
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Harga (Rp)</label>
                       <input 
                         type="number" 
                         required
                         value={newProduct.price}
                         onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                         className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium" 
                         placeholder="Contoh: 150000" 
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kategori</label>
                       <input 
                         type="text" 
                         value={newProduct.category}
                         onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                         className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium" 
                         placeholder="Contoh: Aksesoris" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Stok Real-time</label>
                        <input 
                          type="number" 
                          required
                          value={newProduct.stock}
                          onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium" 
                          placeholder="Contoh: 100" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Upload Gambar Produk (Drag & Drop)</label>
                       <div 
                         {...getProductImgRootProps()}
                         className={`w-full min-h-[120px] rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${newProduct.image ? 'border-none relative p-0 overflow-hidden h-[120px]' : (isProductImgDragActive ? 'border-emerald-500 border-dashed bg-emerald-50' : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 p-6')}`}
                       >
                         <input {...getProductImgInputProps()} />
                         {newProduct.image ? (
                           <>
                             <img src={newProduct.image} className="w-full h-full object-cover" alt="Preview" />
                             <button type="button" onClick={(e) => { e.stopPropagation(); setNewProduct({...newProduct, image: ''}); }} className="absolute top-2 right-2 bg-slate-900 border-2 border-slate-900 text-white rounded-lg p-1 hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" ><X className="w-4 h-4" /></button>
                           </>
                         ) : (
                           <>
                             <Download className={`w-8 h-8 mb-2 ${isProductImgDragActive ? 'text-emerald-500' : 'text-slate-400 rotate-180'}`} />
                             <span className={`text-[10px] font-bold ${isProductImgDragActive ? 'text-emerald-600' : 'text-slate-500'} uppercase text-center tracking-widest`}>Drag & Drop file digital di sini<br/>atau klik untuk memilih</span>
                           </>
                         )}
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Konten Rahasia (Link/License Key)</label>
                       <textarea 
                         required
                         value={newProduct.secretContent}
                         onChange={e => setNewProduct({...newProduct, secretContent: e.target.value})}
                         className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium text-sm min-h-[100px]" 
                         placeholder="Link Google Drive, Kode Lisensi, dll..." 
                       ></textarea>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">*Hanya diberikan otomatis ke pembeli yang sudah lunas.</p>
                     </div>

                     <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={newProduct.isPremiumOnly}
                            onChange={e => setNewProduct({...newProduct, isPremiumOnly: e.target.checked})}
                            className="w-5 h-5 accent-emerald-500 rounded border-2 border-slate-300"
                          />
                          <div>
                            <span className="block text-sm font-black text-emerald-900 uppercase">Khusus VIP Member</span>
                            <span className="text-[10px] uppercase font-bold text-emerald-700">Akses hanya untuk pelanggan dengan langganan VIP</span>
                          </div>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer border-t-2 border-emerald-200 pt-4">
                          <input 
                            type="checkbox"
                            checked={newProduct.dynamicPricing}
                            onChange={e => setNewProduct({...newProduct, dynamicPricing: e.target.checked})}
                            className="w-5 h-5 accent-emerald-500 rounded border-2 border-slate-300"
                          />
                          <div>
                            <span className="block text-sm font-black text-emerald-900 uppercase">Dynamic FOMO Pricing</span>
                            <span className="text-[10px] uppercase font-bold text-emerald-700">Naikkan harga otomatis berdasarkan jumlah penjualan</span>
                          </div>
                        </label>

                        {newProduct.dynamicPricing && (
                          <div className="grid grid-cols-2 gap-4 pt-2">
                             <div>
                                <label className="block text-xs font-bold uppercase text-emerald-800 mb-1">Kenaikan (Rp)</label>
                                <input 
                                  type="number" 
                                  value={newProduct.priceIncrement}
                                  onChange={e => setNewProduct({...newProduct, priceIncrement: e.target.value})}
                                  className="w-full p-2 rounded-lg border-2 border-emerald-300 outline-none focus:border-slate-900 text-sm"
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-bold uppercase text-emerald-800 mb-1">Tiap Kelipatan Sale</label>
                                <input 
                                  type="number" 
                                  value={newProduct.salesThreshold}
                                  onChange={e => setNewProduct({...newProduct, salesThreshold: e.target.value})}
                                  className="w-full p-2 rounded-lg border-2 border-emerald-300 outline-none focus:border-slate-900 text-sm"
                                />
                             </div>
                          </div>
                        )}
                     </div>

                     <button type="submit" className="w-full pt-4">
                        <div className="w-full py-4 bg-emerald-500 border-2 border-slate-900 rounded-xl font-black text-slate-900 uppercase hover:bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
                           <Briefcase className="w-5 h-5" /> Simpan Ke Etalase
                        </div>
                     </button>
                   </form>
                 </div>
                 
                 <div>
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-xl uppercase text-slate-900 flex items-center gap-2"><ListIcon className="text-slate-500" /> Katalog Saat Ini ({products.length})</h3>
                      {selectedProductIds.length > 0 && (
                        <button 
                          onClick={() => {
                            if (confirm(`Yakin ingin menyembunyikan ${selectedProductIds.length} produk? (Archive)`)) {
                              // [SECURITY MOCK] Engine Hapus Produk - The Archival Method
                              setProducts(products.map(p => selectedProductIds.includes(p.id) ? { ...p, is_deleted: true } : p));
                              setSelectedProductIds([]);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-red-400 hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
                        >
                          Hapus Terpilih ({selectedProductIds.length})
                        </button>
                      )}
                   </div>
                   {products.length === 0 ? (
                     <div className="bg-slate-200 border-2 border-dashed border-slate-400 rounded-3xl p-8 text-center text-slate-500 font-bold uppercase text-sm">
                       Etalase masih kosong. Tambahkan produk pertama Anda.
                     </div>
                   ) : (
                     <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                       {products.map(p => (
                         <label key={p.id} className="flex bg-white p-3 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] gap-4 items-center cursor-pointer hover:bg-slate-50 transition-colors">
                           <input 
                              type="checkbox" 
                              checked={selectedProductIds.includes(p.id)}
                              onChange={(e) => {
                                 if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                 else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                              }}
                              className="w-5 h-5 accent-emerald-500 rounded border-2 border-slate-300 ml-2" 
                           />
                           <img src={p.image} className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" alt={p.name} />
                           <div className="min-w-0">
                             <p className="font-black uppercase tracking-tight text-sm text-slate-900 truncate">{p.name}</p>
                             <p className="text-emerald-600 font-bold text-xs mt-1">{formatIDR(p.price)}</p>
                           </div>
                         </label>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
            </div>
          )}

          {activeAdminTab === 'inbox' && (
            <div className="animate-in fade-in zoom-in duration-300 h-full flex flex-col">
               <div className="border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-end shrink-0">
                 <div>
                   <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Inbox Pelanggan</h2>
                   <p className="text-slate-500 font-bold uppercase text-xs mt-1 tracking-wider">
                     Status Auto-Reply <span className="text-emerald-500 font-black">{chatMode === 'ai' ? 'ON (AI Active)' : 'OFF (Owner Mode)'}</span>
                   </p>
                 </div>
                 {chatMode === 'ai' && (
                   <button 
                    onClick={() => setChatMode('owner')}
                    className="px-4 py-2 bg-amber-400 border-2 border-slate-900 rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
                   >
                     Takeover Chat (Matikan AI)
                   </button>
                 )}
                 {chatMode === 'owner' && (
                   <button 
                    onClick={() => setChatMode('ai')}
                    className="px-4 py-2 bg-emerald-500 border-2 border-slate-900 rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
                   >
                     Nyalakan AI Auto-Reply
                   </button>
                 )}
               </div>

               <div className="flex-1 bg-white border-2 border-slate-900 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col min-h-[500px]">
                 <div className="bg-slate-100 border-b-2 border-slate-900 p-4 font-bold uppercase text-xs text-slate-600 flex justify-between items-center">
                    <span>Sesi Belum Diberi Nama</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> Pelanggan Sedang Online</span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
                   {chatMessages.length === 0 ? (
                     <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold uppercase text-sm">
                        Belum ada pesan masuk.
                     </div>
                   ) : (
                     chatMessages.map(msg => (
                       <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                         <div className={`max-w-[70%] p-3 rounded-2xl border-2 ${
                           msg.sender === 'user' 
                            ? 'bg-white border-slate-200 text-slate-900 rounded-bl-sm' 
                            : msg.sender === 'system'
                            ? 'bg-slate-800 border-slate-900 text-slate-200 rounded-xl max-w-full w-full text-center text-xs mx-auto'
                            : 'bg-emerald-100 border-emerald-900 text-emerald-950 rounded-br-sm'
                         }`}>
                           {msg.sender === 'ai' && <div className="text-[10px] font-black tracking-widest text-emerald-600 uppercase mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> AI Assistant</div>}
                           {msg.sender === 'owner' && <div className="text-[10px] font-black tracking-widest text-emerald-700 uppercase mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> You (Owner)</div>}
                           {msg.sender === 'user' && <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Customer</div>}
                           <p className="text-sm font-medium">{msg.text}</p>
                         </div>
                       </div>
                     ))
                   )}
                   <div ref={adminChatEndRef} />
                 </div>
                 
                 <div className="p-4 bg-white border-t-2 border-slate-900 flex gap-2">
                   <input 
                     type="text" 
                     value={adminChatInput}
                     onChange={e => setAdminChatInput(e.target.value)}
                     onKeyDown={e => handleKeyDown(e, handleAdminSendMessage)}
                     className="flex-1 p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors text-sm font-medium"
                     placeholder="Ketik balasan Anda (Enter untuk kirim)..."
                   />
                   <button 
                    onClick={handleAdminSendMessage}
                    disabled={!adminChatInput.trim()}
                    className="w-12 flex items-center justify-center bg-slate-900 rounded-xl text-white disabled:opacity-50 hover:bg-slate-800 transition-colors"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                 </div>
               </div>
            </div>
          )}

          {activeAdminTab === 'analytics' && (
            <div className="animate-in fade-in zoom-in duration-300">
               <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                 <div>
                   <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">AI Smart Analytics</h2>
                   <p className="text-slate-500 font-bold uppercase text-xs mt-1 tracking-wider">Performa & Prediksi AI</p>
                 </div>
               </div>
               
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-emerald-50 border-2 border-emerald-900 p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
                     <p className="text-[10px] uppercase font-black tracking-widest text-emerald-800 mb-2">Total Pendapatan</p>
                     <p className="text-3xl font-black text-slate-900 mb-1">{formatIDR(allPurchases.reduce((acc, curr) => acc + curr.products.reduce((a, p) => a + p.price, 0), 0))}</p>
                     <p className="text-xs font-bold text-emerald-700 flex items-center gap-1"><ArrowRight className="w-3 h-3 -rotate-45" /> +15% vs AI Prediction</p>
                  </div>
                  <div className="bg-white border-2 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                     <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Monthly Recurring Rev (MRR)</p>
                     <p className="text-3xl font-black text-slate-900 mb-1">{formatIDR(1500000)}</p>
                     <p className="text-xs font-bold text-slate-400">Dari 10 VIP Members</p>
                  </div>
                  <div className="bg-amber-50 border-2 border-amber-900 p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                     <p className="text-[10px] uppercase font-black tracking-widest text-amber-800 mb-2">Life Time Value (LTV)</p>
                     <p className="text-3xl font-black text-slate-900 mb-1">{formatIDR(450000)}</p>
                     <p className="text-xs font-bold text-amber-700 flex items-center gap-1"><ArrowRight className="w-3 h-3 -rotate-45" /> Naik +5% Bulan ini</p>
                  </div>
               </div>

               <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-8 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2"><Star className="text-emerald-400" /> Analisis Sentimen (AI)</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 flex flex-col items-center justify-center -rotate-3">
                         <span className="text-2xl">😊</span>
                         <span className="text-[8px] uppercase font-bold text-slate-300">Positif</span>
                       </div>
                       <div className="flex-1">
                          <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
                             <div className="bg-emerald-500 h-full" style={{width: '85%'}}></div>
                          </div>
                          <p className="text-xs font-medium text-slate-400 mt-2">85% interaksi pelanggan minggu ini menunjukkan sentimen sangat puas dengan produk dan kecepatan akses.</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeAdminTab === 'broadcast' && (
            <div className="animate-in fade-in zoom-in duration-300">
               <div className="border-b-4 border-slate-900 pb-4 mb-8">
                 <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Mass Push Broadcast</h2>
                 <p className="text-slate-500 font-bold uppercase text-xs mt-1 tracking-wider">Kirim Notifikasi ke Semua Member (V5)</p>
               </div>
               
               <div className="bg-white border-2 border-slate-900 p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                 <label className="block text-sm font-black uppercase text-slate-900 mb-2">Pesan Kampanye / Promo Baru</label>
                 <textarea 
                   value={broadcastMessage}
                   onChange={e => setBroadcastMessage(e.target.value)}
                   className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 transition-colors outline-none min-h-[150px] font-medium"
                   placeholder="Tulis pesan promosi untuk member..."
                 />
                 <button 
                   onClick={() => {
                     alert(`Simulasi: Pesan Broadcast berhasil dikirim ke ${allPurchases.length} member!`);
                     setBroadcastMessage('');
                   }}
                   className="mt-4 px-6 py-4 bg-emerald-500 text-slate-900 font-black uppercase tracking-widest rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center gap-2 w-full"
                 >
                   <Send className="w-5 h-5"/> Kirim Massal
                 </button>
               </div>
            </div>
          )}

          {activeAdminTab === 'affiliate' && (
             <div className="animate-in fade-in zoom-in duration-300">
               <div className="border-b-4 border-slate-900 pb-4 mb-8">
                 <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Affiliate Control Center</h2>
                 <p className="text-slate-500 font-bold uppercase text-xs mt-1 tracking-wider">Atur Komisi & Permintaan Penarikan</p>
               </div>

               <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-8">
                 <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2"><CreditCard className="text-emerald-400" /> Pending Payouts</h3>
                 <div className="text-center p-8 bg-slate-800 border border-slate-700 rounded-2xl">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada permintaan penarikan komisi.</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white border-2 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                   <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Default Commission</p>
                   <div className="flex items-center justify-between">
                     <p className="text-3xl font-black text-emerald-600">30%</p>
                     <button className="text-xs uppercase font-bold text-slate-400 underline">Ubah</button>
                   </div>
                 </div>
                 <div className="bg-white border-2 border-slate-900 p-6 rounded-3xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                   <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Total Paid to Affiliates</p>
                   <p className="text-3xl font-black text-slate-900">{formatIDR(150000)}</p>
                 </div>
               </div>
             </div>
          )}

          {activeAdminTab === 'coupons' && (
             <div className="animate-in fade-in zoom-in duration-300">
               <div className="border-b-4 border-slate-900 pb-4 mb-8">
                 <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Kupon Promo V7</h2>
                 <p className="text-slate-500 font-bold uppercase text-xs mt-1 tracking-wider">Dashboard Kupon Diskon Pintar</p>
               </div>

               <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-8">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                   <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2"><CreditCard className="text-emerald-400" /> Manajemen Kupon</h3>
                   <button 
                     onClick={() => setShowCouponForm(!showCouponForm)}
                     className="mt-4 sm:mt-0 flex items-center gap-2 bg-emerald-500 text-slate-900 px-4 py-2 font-bold rounded-xl border border-transparent hover:bg-emerald-400 transition-colors"
                   >
                     {showCouponForm ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {showCouponForm ? 'Tutup Form' : 'Buat Kupon Baru'}
                   </button>
                 </div>

                 {showCouponForm && (
                   <motion.div 
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 space-y-4"
                   >
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Kode Kupon</label>
                         <input 
                           type="text" 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold uppercase placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 text-white"
                           placeholder="CONTOH: NEWMEMBER"
                           value={newCoupon.code}
                           onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Tipe</label>
                         <select 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold shadow-sm focus:outline-none focus:border-emerald-500 text-white"
                           value={newCoupon.type}
                           onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value as any})}
                         >
                           <option value="percentage">Persentase (%)</option>
                           <option value="fixed">Nominal Tetap (Rp)</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Jumlah {newCoupon.type === 'percentage' ? 'Diskon (%)' : 'Potongan (Rp)'}</label>
                         <input 
                           type="number" 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500 text-white"
                           value={newCoupon.amount}
                           onChange={(e) => setNewCoupon({...newCoupon, amount: e.target.value})}
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Min. Pembelian (Rp)</label>
                         <input 
                           type="number" 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500 text-white"
                           value={newCoupon.minPurchase}
                           onChange={(e) => setNewCoupon({...newCoupon, minPurchase: e.target.value})}
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Limit Penggunaan</label>
                         <input 
                           type="number" 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500 text-white"
                           value={newCoupon.maxUse}
                           onChange={(e) => setNewCoupon({...newCoupon, maxUse: e.target.value})}
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Tanggal Expired</label>
                         <input 
                           type="date" 
                           className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-emerald-500 text-white"
                           value={newCoupon.expDate}
                           onChange={(e) => setNewCoupon({...newCoupon, expDate: e.target.value})}
                         />
                       </div>
                     </div>
                     <div className="flex gap-3 pt-2">
                       <button 
                         onClick={handleSaveCoupon}
                         disabled={isSavingCoupon}
                         className="flex-1 bg-emerald-500 text-slate-900 font-black uppercase py-3 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                       >
                         {isSavingCoupon ? 'Menyimpan...' : 'Simpan Kupon'}
                       </button>
                       <button 
                         onClick={() => setShowCouponForm(false)}
                         className="px-6 bg-slate-700 text-white font-black uppercase py-3 rounded-xl hover:bg-slate-600 transition-all"
                       >
                         Batal
                       </button>
                     </div>
                   </motion.div>
                 )}
                 
                 {coupons.length === 0 ? (
                   <div className="text-center p-8 bg-slate-800 border border-slate-700 rounded-2xl">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pb-3">Belum Ada Promosi yang Dirancang.</p>
                      <button 
                         onClick={() => {
                           setCoupons([{
                             id: Date.now(),
                             code: 'LUMINA-GAJIAN',
                             type: 'percentage',
                             amount: 15,
                             minPurchase: 100000,
                             maxUse: 50,
                             currentUse: 0,
                             expDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
                             isActive: true
                           }]);
                           alert('Kupon Demo "LUMINA-GAJIAN" berhasil ditambahkan!');
                         }} 
                         className="bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-slate-600"
                      >Simulasi: Tambah Kupon Dummy</button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-4">
                     {coupons.map(coupon => {
                       const isExpired = new Date(coupon.expDate) < new Date();
                       const isLimitHit = coupon.currentUse >= coupon.maxUse;
                       let statusBadge;
                       if (isExpired) statusBadge = <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-md font-bold uppercase">Kedaluwarsa</span>;
                       else if (isLimitHit) statusBadge = <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-md font-bold uppercase">Limit Habis</span>;
                       else statusBadge = <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-bold uppercase">Aktif</span>;
                       
                       return (
                         <div key={coupon.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                           <div>
                             <div className="flex items-center gap-3 mb-1">
                               <p className="font-black text-lg text-emerald-400 font-mono tracking-widest uppercase">{coupon.code}</p>
                               {statusBadge}
                             </div>
                             <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                               Diskon: {coupon.type === 'percentage' ? `${coupon.amount}%` : formatIDR(coupon.amount)} | Min. Belanja: {formatIDR(coupon.minPurchase)}
                             </p>
                             <p className="text-[10px] text-slate-500 mt-1">Digunakan: {coupon.currentUse}/{coupon.maxUse} &bull; Kedaluwarsa: {coupon.expDate}</p>
                           </div>
                           <div className="flex items-center gap-2">
                              <button className="px-3 py-1.5 bg-slate-700 text-white text-xs font-bold rounded-lg uppercase hover:bg-slate-600">Edit</button>
                              <button className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg uppercase hover:bg-red-500 hover:text-white transition-colors" onClick={() => setCoupons(coupons.filter(c => c.id !== coupon.id))}>Hapus</button>
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 )}
               </div>
             </div>
          )}

          {activeAdminTab === 'news' && (
             <div className="animate-in fade-in zoom-in duration-300">
               <div className="border-b-4 border-slate-900 pb-4 mb-8">
                 <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Lumina Chronicles</h2>
                 <p className="text-slate-500 font-bold uppercase text-xs mt-1 tracking-wider">Berita & Pengumuman Megaphone</p>
               </div>

               <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-8">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                   <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2"><Megaphone className="text-emerald-400" /> Tulis Berita Baru</h3>
                 </div>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold uppercase mb-2 text-slate-300">Judul Berita</label>
                     <input type="text" value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 p-3 rounded-xl focus:border-emerald-500 outline-none font-bold" placeholder="Misal: Update V9.9 The Master Ecosystem" />
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold uppercase mb-2 text-slate-300">Isi (Rich Text HTML)</label>
                     <textarea value={newNews.content_html} onChange={e => setNewNews({...newNews, content_html: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 p-3 rounded-xl focus:border-emerald-500 outline-none font-mono text-sm h-32" placeholder="<p>Konten berita...</p>"></textarea>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold uppercase mb-2 text-slate-300">Tampil Mulai</label>
                       <input type="date" value={newNews.start_date} onChange={e => setNewNews({...newNews, start_date: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 p-3 rounded-xl focus:border-emerald-500 outline-none font-bold [color-scheme:dark]" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase mb-2 text-slate-300">Kedaluwarsa Pada</label>
                       <input type="date" value={newNews.end_date} onChange={e => setNewNews({...newNews, end_date: e.target.value})} className="w-full bg-slate-800 border-2 border-slate-700 p-3 rounded-xl focus:border-emerald-500 outline-none font-bold [color-scheme:dark]" />
                     </div>
                   </div>

                   <div className="flex items-center gap-2 pt-2">
                     <input type="checkbox" id="is_pinned_news" checked={newNews.is_pinned} onChange={e => setNewNews({...newNews, is_pinned: e.target.checked})} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
                     <label htmlFor="is_pinned_news" className="text-sm font-bold uppercase text-amber-400 cursor-pointer flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400" /> Sematkan (Pinned Official)</label>
                   </div>
                   
                   <button 
                     onClick={handlePublishNews}
                     className="mt-4 flex items-center justify-center w-full gap-2 bg-emerald-500 text-slate-900 px-4 py-3 font-black rounded-xl border border-transparent hover:bg-emerald-400 transition-colors uppercase tracking-widest text-sm"
                   >
                     <Send className="w-4 h-4"/> Publish ke Megaphone
                   </button>
                 </div>
               </div>

               <div className="space-y-4">
                 <h3 className="font-black text-lg uppercase text-slate-900 tracking-tight mb-4 border-b-2 border-slate-200 pb-2">Arsip Berita Aktif</h3>
                 {luminaNews.map(news => (
                   <div key={news.id} className="bg-white border-2 border-slate-900 p-4 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex justify-between items-center gap-4">
                     <div className="overflow-hidden">
                       <h4 className="font-black text-sm uppercase truncate text-slate-900">{news.is_pinned && <Star className="inline w-3 h-3 text-amber-500 mr-1" />}{news.title}</h4>
                       <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Durasi: {news.start_date.split('T')[0]} - {news.end_date.split('T')[0]}</p>
                     </div>
                     <button onClick={() => setLuminaNews(luminaNews.filter(n => n.id !== news.id))} className="shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><X className="w-4 h-4" /></button>
                   </div>
                 ))}
                 {luminaNews.length === 0 && <p className="text-xs uppercase font-bold text-slate-400 mt-2">Tidak ada berita.</p>}
               </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  // V8 Renderers
  const renderHomeView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Area 1: Hero Banner Dinamis */}
      <SmartTilt tiltReverse={true} tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.01} glareEnable={true} glareMaxOpacity={0.15} glarePosition="all" transitionSpeed={1500}>
        <section className="bg-slate-900 text-white rounded-3xl text-center relative overflow-hidden border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          {/* Parallax background decorations inside the hero */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          
          <div className="overflow-hidden relative z-10" ref={emblaRef}>
            <div className="flex touch-pan-y">
              
              {/* Slide 1: Original */}
              <div className="flex-[0_0_100%] min-w-0 min-h-[350px] sm:min-h-[400px] p-6 sm:p-10 md:p-20 relative flex flex-col items-center justify-center">
                  <motion.div initial="hidden" animate={activeSlide === 0 ? "visible" : "hidden"} className="max-w-3xl mx-auto flex flex-col items-center relative z-20">
                    <motion.h1 
                      variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12 } } }}
                      className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6 relative text-white drop-shadow-md z-20"
                    >
                      Akselerasi Karya Digital Anda Bersama <span className="text-emerald-400 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-md z-20">Lumina.</span>
                    </motion.h1>
                    
                    {loggedInUser && (
                      <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }} className="mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg text-emerald-100 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 z-20">
                        <span>👋 Halo, {loggedInUser.name.split(' ')[0]}! {loggedInUser.isVIP ? '👑' : ''}</span>
                      </motion.div>
                    )}

                    <motion.p variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="text-slate-200 font-bold max-w-xl mx-auto mb-8 text-xs sm:text-sm md:text-base uppercase tracking-widest drop-shadow z-20">
                      Ekosistem kelas atas untuk produk digital, template, dan perangkat lunak yang mengubah cara Anda bekerja selamanya.
                    </motion.p>
                    <motion.button 
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      onClick={() => setCurrentView('catalog')}
                      className="px-6 py-3 md:px-8 md:py-4 bg-emerald-500 text-slate-900 border-2 border-slate-900 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all inline-flex items-center gap-2 relative z-30"
                    >
                      Masuk Katalog <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
              </div>

              {/* Slide 2: VIP Gold */}
              <div className="flex-[0_0_100%] min-w-0 min-h-[350px] sm:min-h-[400px] p-6 sm:p-10 md:p-20 relative flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 via-amber-900 to-slate-900 overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
                  <motion.div initial="hidden" animate={activeSlide === 1 ? "visible" : "hidden"} className="max-w-3xl mx-auto flex flex-col items-center relative z-20">
                    <motion.div variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }} className="w-16 h-16 md:w-20 md:h-20 bg-amber-400 rounded-full flex items-center justify-center border-4 border-amber-200 mb-6 shadow-[0_0_40px_rgba(251,191,36,0.6)]">
                      <Star className="w-8 h-8 md:w-10 md:h-10 text-white fill-current" />
                    </motion.div>
                    <motion.h1 
                      variants={{ hidden: { opacity: 0, filter: 'blur(10px)', scale: 1.1 }, visible: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 0.6 } } }}
                      className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] z-20"
                    >
                      Akses Galaksi <br/><span className="text-white">Tanpa Batas!</span>
                    </motion.h1>
                    <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-amber-100/90 font-bold max-w-xl mx-auto mb-8 text-xs sm:text-sm md:text-base uppercase tracking-widest leading-relaxed text-center drop-shadow-md z-20">
                      Gratis Semua Tema Khusus VIP, Diskon Emas Spesial, dan Penguasaan Etalase Katalog Premium yang Hanya Diketahui Para Sultan.
                    </motion.p>
                    <motion.button 
                      variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                      onClick={() => setIsMemberModalOpen(true)}
                      className="px-6 py-3 md:px-8 md:py-4 bg-amber-400 text-slate-900 border-2 border-amber-200 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(251,191,36,0.4)] hover:bg-amber-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all inline-flex items-center gap-2 relative z-30"
                    >
                      Tier Sultan <User className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
              </div>

              {/* Slide 3: Ads Promo */}
              <div className="flex-[0_0_100%] min-w-0 min-h-[350px] sm:min-h-[400px] p-6 sm:p-10 md:p-20 relative flex flex-col items-center justify-center bg-emerald-900 overflow-hidden">
                 <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                  <motion.div initial="hidden" animate={activeSlide === 2 ? "visible" : "hidden"} className="max-w-3xl mx-auto flex flex-col items-center relative z-20 w-full">
                    <motion.div variants={{ hidden: { opacity: 0, x: 100, skewX: '-20deg' }, visible: { opacity: 1, x: 0, skewX: '0deg', transition: { type: 'spring', damping: 15 } } }} className="w-full">
                      <div className="inline-block bg-emerald-400 text-emerald-950 font-black uppercase text-[10px] sm:text-xs px-3 sm:px-4 py-1 rounded-full mb-4 shadow-md tracking-widest">
                        Lumina Hot Ads ⚡
                      </div>
                      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6 text-white drop-shadow-md z-20">
                        Bundle Eksklusif <br/><span className="text-emerald-300">Mingguan Lumina.</span>
                      </h1>
                      <p className="text-emerald-50 font-bold max-w-xl mx-auto mb-8 text-xs sm:text-sm md:text-base uppercase tracking-widest drop-shadow-md z-20">
                        Hemat hingga 70% dengan mengklaim bundle kompilasi software dan tools AI terbaru pilihan editor kami!
                      </p>
                      <button 
                        onClick={() => { setCurrentView('catalog'); }}
                        className="px-6 py-3 md:px-8 md:py-4 bg-slate-900 text-emerald-400 border-2 border-emerald-400 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(52,211,153,0.5)] hover:bg-slate-800 hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all inline-flex items-center gap-2 relative z-30"
                      >
                        Sikat Bundle <ShoppingCart className="w-5 h-5" />
                      </button>
                    </motion.div>
                  </motion.div>
              </div>
              
            </div>
          </div>
          
          {/* Progress Indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20" style={{ transform: 'translateZ(20px)' }}>
            {[0, 1, 2].map((idx) => (
              <button 
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-10 bg-white' : 'w-2 bg-white/30'}`}
              />
            ))}
          </div>

        </section>
      </SmartTilt>

      {/* Area 2: L-Points Gamification Check-In */}
      {loggedInUser ? (
        <section className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white border-4 border-emerald-400 shadow-[4px_4px_0px_0px_rgba(52,211,153,1)]">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-2xl uppercase text-slate-900 tracking-tight">Halo {loggedInUser.name.split(' ')[0]}! <span className="text-emerald-600">Poin Anda: {loggedInUser.lPoints || 0} 🪙</span></h3>
              <p className="font-bold text-slate-500 uppercase tracking-widest text-xs mt-1">Kumpulkan poin untuk ditukar dengan diskon spesial.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              if (loggedInUser.lastClaimDate === today) {
                alert('Anda sudah klaim poin hari ini! Kembali lagi besok.');
              } else {
                setBtnStates(prev => ({...prev, claim: true}));
                setTimeout(() => {
                   setLoggedInUser({...loggedInUser, lPoints: (loggedInUser.lPoints || 0) + 10, lastClaimDate: today});
                   setBtnStates(prev => ({...prev, claim: false, claimSuccess: true}));
                   setTimeout(() => setBtnStates(prev => ({...prev, claimSuccess: false})), 2000);
                }, 800);
              }
            }}
            disabled={loggedInUser.lastClaimDate === new Date().toISOString().split('T')[0] || btnStates.claim}
            className="w-full sm:w-auto px-6 py-4 bg-amber-400 text-slate-900 border-2 border-slate-900 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-amber-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:shadow-none disabled:transform-none transition-all flex justify-center items-center gap-2"
          >
            {loggedInUser.lastClaimDate === new Date().toISOString().split('T')[0] ? (
              '✅ Poin Diklaim'
            ) : btnStates.claim ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Mengklaim...</>
            ) : btnStates.claimSuccess ? (
              <><CheckCircle className="w-5 h-5 text-emerald-600" /> Berhasil!</>
            ) : (
              '👉 Klaim Poin Hari Ini!'
            )}
          </button>
        </section>
      ) : (
        <section className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-3xl p-6 sm:p-8 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-300">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="font-black text-lg uppercase text-slate-900 mb-2">Login untuk Klaim L-Points!</h3>
          <p className="font-bold text-slate-500 uppercase tracking-widest text-xs mb-4">Dapatkan diskon dan penawaran eksklusif setiap hari.</p>
          <button onClick={() => setIsMemberModalOpen(true)} className="text-emerald-600 font-black uppercase tracking-widest text-xs hover:text-emerald-500 border-b-2 border-emerald-600 pb-1">Gabung Member Area</button>
        </section>
      )}

      {/* Area 3: Bento Grid "Mengapa Lumina?" */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Tilt tiltReverse={true} tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.05} glareEnable={true} glareMaxOpacity={0.15} glarePosition="all" transitionSpeed={1500} className="w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden group h-full" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-100 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 transform-gpu" style={{ transform: 'translateZ(30px)' }}>
              <div className="w-12 h-12 bg-slate-900 text-yellow-400 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xl uppercase tracking-tighter text-slate-900 mb-2">Akses & Pengiriman Instan</h3>
              <p className="font-bold text-slate-600 text-sm drop-shadow-sm">Pembayaran selesai, produk digital Anda langsung terkirim ke email dalam hitungan detik. Tanpa menunggu.</p>
            </div>
          </div>
        </Tilt>
        <Tilt tiltReverse={true} tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.05} glareEnable={true} glareMaxOpacity={0.15} glarePosition="all" transitionSpeed={1500} className="w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden group h-full" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-100 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 transform-gpu" style={{ transform: 'translateZ(30px)' }}>
              <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xl uppercase tracking-tighter text-slate-900 mb-2">Transaksi 100% Aman Terenkripsi</h3>
              <p className="font-bold text-slate-600 text-sm drop-shadow-sm">Dengan keamanan sistem berlapis, kami menjamin seluruh detail transaksi Anda terlindungi.</p>
            </div>
          </div>
        </Tilt>
        <Tilt tiltReverse={true} tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.05} glareEnable={true} glareMaxOpacity={0.15} glarePosition="all" transitionSpeed={1500} className="w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden group h-full" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-100 rounded-full group-hover:scale-[2] transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 transform-gpu" style={{ transform: 'translateZ(30px)' }}>
              <div className="w-12 h-12 bg-slate-900 text-blue-400 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xl uppercase tracking-tighter text-slate-900 mb-2">Live Chat dengan AI 24/Jam</h3>
              <p className="font-bold text-slate-600 text-sm drop-shadow-sm">Asisten cerdas kami selalu siap membantu Anda menemukan dan memahami setiap produk kapan pun.</p>
            </div>
          </div>
        </Tilt>
      </section>

      {/* Area 4: Preview Komunitas */}
      <SmartTilt tiltReverse={true} tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.01} glareEnable={true} glareMaxOpacity={0.15} glarePosition="all" transitionSpeed={1500} style={{ transformStyle: 'preserve-3d' }}>
        <section className="bg-emerald-900 border-2 border-emerald-950 rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(2,44,34,1)] relative overflow-hidden text-white" style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b-2 border-emerald-800 pb-4 transform-gpu" style={{ transform: 'translateZ(40px)' }}>
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-emerald-300">Live Komunitas Lumina</h2>
              <p className="text-emerald-100 font-bold max-w-xl mt-1 text-xs uppercase tracking-widest">Intip keseruan diskusi pengguna produk kami.</p>
            </div>
            <button onClick={() => setCurrentView('community')} className="shrink-0 text-emerald-900 bg-emerald-400 px-4 py-2 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-emerald-300 transition-colors shadow-md">
              Masuk Forum ➔
            </button>
          </div>
          
          <div className="relative z-10 transform-gpu" style={{ transform: 'translateZ(20px)' }}>
            {communityThreads.length === 0 ? (
              <div className="bg-emerald-800/50 border-2 border-emerald-700/50 rounded-2xl p-8 sm:p-12 text-center backdrop-blur-sm">
                <Users className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-black text-2xl uppercase text-emerald-300 mb-2">Ruang diskusi Lumina terbuka lebar!</h3>
                <p className="font-bold text-emerald-100 mb-6 max-w-md mx-auto text-sm">Jadilah legenda pertama yang menuliskan topik baru minggu ini, Dapatkan Poin Super Eksklusif Anda hari ini!</p>
                <button onClick={() => setCurrentView('community')} className="bg-emerald-500 text-emerald-950 border-2 border-emerald-400 px-6 py-3 rounded-xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  Tulis & Panen Reward!
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communityThreads.slice(0, 4).map(thread => (
                  <div key={thread.id} className="bg-emerald-950 border border-emerald-800 rounded-xl p-4 flex flex-col hover:border-emerald-500 transition-colors cursor-pointer group shadow-sm hover:shadow-emerald-500/20" onClick={() => setCurrentView('community')}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-300 flex items-center justify-center font-black shrink-0 text-xs">
                        {thread.authorName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-emerald-100 text-xs truncate flex items-center gap-1">
                          {thread.authorName} 
                          {thread.isVerifiedBuyer && <ShieldCheck className="w-3 h-3 text-emerald-400" title="Verified Buyer" />}
                        </p>
                        <p className="text-[10px] text-emerald-600">{new Date(thread.timestamp).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    <h4 className="font-black text-sm uppercase text-emerald-300 group-hover:text-amber-300 transition-colors line-clamp-1">{thread.title}</h4>
                    <p className="text-xs text-emerald-100 mt-1 line-clamp-2 opacity-80">{thread.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </SmartTilt>


    </div>
  );

  const renderPublicProfile = () => {
    if (!publicProfileUsername) return null;
    
    // Find if user is a buyer from our product authors or community
    const isVIP = communityThreads.find(t => t.authorName === publicProfileUsername)?.isVIP;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto p-6">
        <button 
          onClick={() => setPublicProfileUsername(null)}
          className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Kembali ke Forum
        </button>

        <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-visible">
           <div className={`h-40 relative rounded-t-[2.2rem] overflow-hidden ${isVIP ? 'vip-banner-gold' : 'bg-slate-200'}`}>
              <div className="absolute -bottom-16 left-10 z-20">
                <div className={`w-32 h-32 rounded-[2rem] border-4 border-slate-900 flex items-center justify-center font-black text-4xl uppercase shadow-[6px_6px_0_0_rgba(15,23,42,1)] ${isVIP ? 'bg-slate-900 text-amber-400' : 'bg-white text-slate-400'}`}>
                  {publicProfileUsername.charAt(0)}
                </div>
              </div>
           </div>
           
           <div className="pt-20 pb-10 px-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-black text-4xl uppercase tracking-tighter text-slate-900">{publicProfileUsername}</h2>
                    {isVIP && <span title="Verified VIP Sultan"><Star className="w-8 h-8 text-amber-500 fill-amber-500 animate-[bounce_2s_infinite]" /></span>}
                  </div>
                  <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">Digital Architect & Lumina Enthusiast</p>
                </div>
                
                <div className="flex gap-4">
                   <button 
                    onClick={() => {
                      const amount = prompt(`Kirim L-Points ke ${publicProfileUsername}:`, "100");
                      if (amount && !isNaN(Number(amount))) {
                        alert(`🎁 Anda mengirim ${amount} L-Points ke ${publicProfileUsername}!`);
                      }
                    }}
                    className="bg-rose-500 text-white border-2 border-slate-900 px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                   >
                     🎁 Beri Gift
                   </button>
                   <button className="bg-white text-slate-900 border-2 border-slate-900 px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                     Follow
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t-4 border-slate-100">
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-900/5 text-center">
                    <span className="block font-black text-3xl text-slate-900">42</span>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Diskusi Dimulai</span>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-900/5 text-center">
                    <span className="block font-black text-3xl text-slate-900">8.2k</span>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Total Upvotes</span>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-900/5 text-center">
                    <span className="block font-black text-3xl text-slate-900">{isVIP ? 'SULTAN' : 'MEMBER'}</span>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">User Rank</span>
                  </div>
              </div>

              <div className="mt-12">
                 <h3 className="font-black text-xl uppercase mb-6 text-slate-900">Recent Activity</h3>
                 <div className="space-y-4">
                    {communityThreads.filter(t => t.authorName === publicProfileUsername).map(t => (
                      <div key={t.id} className="p-4 border-2 border-slate-100 rounded-2xl hover:border-slate-900 transition-colors cursor-pointer">
                        <h4 className="font-bold uppercase text-sm text-slate-800">{t.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(t.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };
  const renderCommunityView = () => (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen border-2 border-slate-900 rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row">
      {/* Forum Sidebar / Header */}
      <div className="w-full md:w-80 bg-slate-900 text-white p-6 md:p-10 shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-slate-900">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-emerald-400">Lumina Hub</h2>
        <p className="text-slate-400 font-bold text-sm mb-6 uppercase tracking-widest leading-relaxed">Ruang diskusi terbuka untuk inspirasi, bantuan, dan ulasan member tercinta.</p>
        
        <button 
           onClick={() => setAudioKeystrokes(!audioKeystrokes)}
           className={`mb-8 w-full py-2 px-3 rounded-lg font-black uppercase text-[10px] tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${audioKeystrokes ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'}`}
        >
           ⌨️ Suara Keyboard: {audioKeystrokes ? 'ON' : 'OFF'}
        </button>

        {loggedInUser ? (
          <div className="bg-slate-800 p-6 rounded-2xl border-2 border-slate-700">
            <h3 className="font-black text-sm uppercase mb-4 text-slate-200">Kirim Postingan Baru</h3>
            <form onSubmit={e => {
              e.preventDefault();
              if(!newThreadTitle || !newThreadContent) return;
              // [SECURITY MOCK] JWT Gateway Validation
              console.log('🛡️ [API GATEWAY] Memverifikasi Payload JWT di Edge Server: Pengecekan Role Claim...');
              // evaluate roles via server truth
              
              const newThread: CommunityThread = {
                id: Date.now().toString(),
                authorName: loggedInUser.name,
                authorEmail: loggedInUser.email,
                isVerifiedBuyer: allPurchases.some(p => p.email.toLowerCase() === loggedInUser.email.toLowerCase()),
                isVIP: loggedInUser.isVIP, // server sets this via decoded jwt
                customBannerClass: loggedInUser.customBannerClass,
                bannerUrl: loggedInUser.bannerUrl,
                category: newThreadCategory,
                title: newThreadTitle,
                content: newThreadContent,
                timestamp: new Date(),
                stars_count: 0,
                replies: []
              };
              setCommunityThreads([newThread, ...communityThreads]);
              setNewThreadTitle('');
              setNewThreadContent('');
              // add reward!
              setLoggedInUser({...loggedInUser, lPoints: (loggedInUser.lPoints || 0) + 10});
              alert('Pesan terkirim! Anda mendapatkan reward +10 L-Points untuk kontribusi di komunitas!');
            }}>
              <select 
                value={newThreadCategory}
                onChange={e => setNewThreadCategory(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 mb-3 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                required
              >
                <option value="Pengumuman">Pengumuman</option>
                <option value="Ide & Saran">Ide & Saran</option>
                <option value="Bantuan Teknis">Bantuan Teknis</option>
                <option value="Pamer Produk">Pamer Produk</option>
              </select>
              <input 
                type="text" 
                placeholder="Judul Diskusi..." 
                required
                value={newThreadTitle}
                onChange={e => setNewThreadTitle(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 mb-3 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="mb-4 bg-white rounded-xl overflow-hidden border-2 border-slate-700 focus-within:border-emerald-500 transition-colors">
                <ReactQuill 
                  theme="snow"
                  placeholder="Apa yang ingin Anda sampaikan?" 
                  value={newThreadContent}
                  onChange={setNewThreadContent}
                  className="text-slate-900 min-h-[120px]"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors">
                Kirim & Dapatkan Poin
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-800 border-2 border-slate-700 p-6 rounded-2xl text-center">
            <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="font-bold text-xs uppercase text-slate-300 mb-4">Login dengan email untuk bergabung dalam diskusi dan mendapatkan L-Points.</p>
            <button onClick={() => setIsMemberModalOpen(true)} className="w-full bg-emerald-500 text-slate-900 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)] transition-colors border border-emerald-400">
              Masuk / Daftar
            </button>
          </div>
        )}

        {/* Weekly Leaderboard */}
        <div className="mt-8 bg-slate-800 p-6 rounded-2xl border-2 border-slate-700">
           <h3 className="font-black text-sm uppercase text-slate-200 mb-4 flex justify-between items-center">
              🏆 Top Sultans
           </h3>
           <div className="space-y-3">
              {[
                { name: 'Darma', role: 'Top Spender', score: '3.2M' },
                { name: 'Sultan_Digital', role: 'Top Contributor', score: '850 Rep' },
                { name: 'Master_UI', role: 'Top Reviewer', score: '12 Reviews' },
              ].map((ldr, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs">
                   <div className="flex items-center gap-2">
                      <span className={`font-black ${i===0?'text-yellow-400':i===1?'text-slate-300':'text-amber-600'}`}>#{i+1}</span>
                      <span className="font-bold text-white max-w-[80px] truncate">{ldr.name}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{ldr.role}</p>
                      <p className="font-black text-emerald-400">{ldr.score}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Trending WordCloud Sidebar Section */}
        <div className="mt-10 pt-10 border-t-2 border-slate-800">
           <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center font-black text-[10px] text-slate-900">HOT</div>
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Trending Topics</h3>
           </div>
           <div className="flex flex-wrap gap-2">
             {['NextJS', 'Tailwind', 'SaaS', 'Hustle', 'PassiveIncome', 'VIP', 'L-Points', 'Template', 'Mobile', 'Vite'].map((word, i) => (
                <motion.span 
                  key={word}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`cursor-default px-2 py-1 rounded-lg font-bold uppercase transition-all hover:scale-110 shadow-sm ${
                    i % 3 === 0 ? 'bg-emerald-500/10 text-emerald-400 text-xs' : 
                    i % 2 === 0 ? 'bg-amber-500/10 text-amber-400 text-[10px]' : 
                    'bg-slate-700 text-slate-400 text-[9px]'
                  }`}
                >
                  #{word}
                </motion.span>
             ))}
           </div>
        </div>
      </div>
      
      {/* Forum Content List or Detail */}
      <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto max-h-[800px]">
        {activeThreadId ? (() => {
          const thread = communityThreads.find(t => t.id === activeThreadId);
          if(!thread) return <div>Thread not found. <button onClick={() => setActiveThreadId(null)}>Back</button></div>;
          const author = getProfileData(thread.authorName);
          const isVIP = author.isVIP || thread.isVIP;
          const displayBanner = author.bannerUrl || thread.bannerUrl;
          const displayAvatar = author.avatar_url;

          return (
            <div className="animate-in slide-in-from-right-8 duration-300">
               <button onClick={() => setActiveThreadId(null)} className="mb-6 font-black uppercase text-xs tracking-widest text-emerald-600 hover:text-emerald-500 flex items-center gap-1"><ArrowRight className="w-4 h-4 rotate-180" /> Kembali ke Forum</button>
               <div className={`rounded-2xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-6 relative overflow-hidden ${isVIP ? author.customBannerClass || thread.customBannerClass || 'vip-banner-gold border-2 border-amber-400' : 'bg-white border-2 border-slate-900'}`}>
                 <div className={`p-6 md:p-8 ${isVIP ? 'bg-black/60 backdrop-blur-md text-white drop-shadow-md' : 'bg-white text-slate-900'} w-full h-full relative z-10`} style={displayBanner ? { backgroundImage: `url(${displayBanner})`, backgroundSize: 'cover' } : {}}>
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                      {thread.category && (
                        <span className={`inline-block mb-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${isVIP ? 'bg-black/40 border-amber-400/50 text-amber-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>{thread.category}</span>
                      )}
                      <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${isVIP ? 'text-white' : 'text-slate-900'}`}>{thread.title}</h3>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <button 
                        onClick={() => setCommunityThreads(threads => threads.map(t => t.id === thread.id ? {...t, stars_count: (t.stars_count || 0) + 1} : t))}
                        className={`shrink-0 flex flex-col items-center gap-1 ${thread.isVIP ? 'text-amber-300 hover:text-white' : 'text-slate-400 hover:text-amber-500'} transition-colors`}
                      >
                        <ArrowRight className="-rotate-90 w-8 h-8" />
                        <span className="text-xs font-black">{thread.stars_count || 0}</span>
                      </button>
                      <button 
                        onClick={() => setCommunityThreads(threads => threads.map(t => t.id === thread.id ? {...t, stars_count: Math.max(0, (t.stars_count || 0) - 1)} : t))}
                        className={`shrink-0 flex flex-col items-center gap-1 ${thread.isVIP ? 'text-slate-400 hover:text-white' : 'text-slate-200 hover:text-red-500'} transition-colors`}
                      >
                        <ArrowRight className="rotate-90 w-6 h-6" />
                      </button>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-white/10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 capitalize shadow-inner ${thread.isVIP ? 'vip-ring bg-slate-900 border-2 border-slate-900 text-yellow-400' : 'bg-slate-100 border-2 border-slate-200 text-slate-400'}`} style={{ backgroundImage: thread.bannerUrl ? `url(${thread.bannerUrl})` : 'none', backgroundSize: 'cover' }}>{thread.authorName.charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-black text-sm uppercase ${thread.isVIP ? 'text-gold-shine' : 'text-slate-900'}`}>{thread.authorName}</p>
                        {thread.isVIP && (
                          <span title="Premium VIP"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-[spin_4s_linear_infinite]" /></span>
                        )}
                        {thread.isVerifiedBuyer && (
                           <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                             <ShieldCheck className="w-3 h-3" /> Verified
                           </span>
                        )}
                      </div>
                      <p className={`text-[11px] font-bold ${thread.isVIP ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(thread.timestamp).toLocaleString()}</p>
                    </div>
                 </div>
                 <div className={`font-medium text-base whitespace-pre-wrap leading-relaxed quill-content ${thread.isVIP ? 'text-slate-100 drop-shadow-md' : 'text-slate-700'}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(thread.content) }}></div>
                 </div>
               </div>

                  {threadSummaries[thread.id] && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`mt-4 mb-6 p-4 rounded-xl border-l-4 ${thread.isVIP ? 'bg-white/10 border-amber-400' : 'bg-emerald-50 border-emerald-500'}`}
                    >
                      <p className={`text-[10px] font-black uppercase mb-1 ${thread.isVIP ? 'text-amber-400' : 'text-emerald-600'}`}>⚡ AI TL;DR (Rangkuman)</p>
                      <p className={`text-sm font-bold italic ${thread.isVIP ? 'text-slate-200' : 'text-slate-700'}`}>"{threadSummaries[thread.id]}"</p>
                    </motion.div>
                  )}

               {/* Replies Area */}
               <h4 className="font-black uppercase text-sm mb-4 border-b-2 border-slate-100 pb-2">Balasan ({thread.replies?.length || 0})</h4>
               <div className="space-y-4 mb-6">
                 {thread.replies?.map(reply => (
                   <div key={reply.id} className={`p-4 rounded-xl relative overflow-hidden ${reply.isVIP ? reply.customBannerClass || 'vip-banner-gold border-2 border-amber-400' : 'bg-slate-50 border border-slate-100'}`}>
                      <div className={`${reply.isVIP ? 'bg-black/60 backdrop-blur-md text-white drop-shadow-md rounded-xl p-4 -m-4' : ''}`}>
                         <div className="flex justify-between items-start mb-2">
                           <div className="flex gap-1 items-center">
                             <UserIntelligenceTooltip username={reply.authorName}>
                              <span className={`font-black text-xs uppercase ${reply.isVIP ? 'text-gold-shine' : 'text-slate-900'}`}>{reply.authorName}</span>
                             </UserIntelligenceTooltip>
                             {reply.isVIP && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                           </div>
                           <span className={`text-[10px] ${reply.isVIP ? 'text-slate-400' : 'text-slate-400'}`}>{new Date(reply.timestamp).toLocaleString()}</span>
                         </div>
                         <div className={`text-sm font-medium quill-content ${reply.isVIP ? 'text-slate-200' : 'text-slate-700'}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(reply.content) }}></div>
                      </div>
                   </div>
                 ))}
               </div>

               {/* Reply Input */}
               {loggedInUser ? (
                 <form onSubmit={e => {
                   e.preventDefault();
                   if(!newReplyContent) return;
                   const reply: ThreadReply = {
                     id: Date.now().toString(),
                     thread_id: thread.id,
                     authorName: loggedInUser.name,
                     isVIP: loggedInUser.isVIP,
                     customBannerClass: loggedInUser.customBannerClass,
                     bannerUrl: loggedInUser.bannerUrl,
                     content: newReplyContent,
                     timestamp: new Date()
                   };
                   setCommunityThreads(threads => threads.map(t => t.id === thread.id ? {...t, replies: [...(t.replies||[]), reply]} : t));
                   setNewReplyContent('');
                 }}>
                   {/* Suggested Replies Area */}
                   <div className="flex flex-wrap gap-2 mb-3 mt-4">
                     {isLoadingSuggestions ? (
                       <div className="flex gap-2">
                          <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-full"></div>
                          <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-full"></div>
                       </div>
                     ) : (
                       suggestedReplies.map((s, idx) => (
                         <button 
                           key={idx}
                           type="button"
                           onClick={() => setNewReplyContent(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + s)}
                           className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-black text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-all hover:bg-emerald-50 shadow-sm uppercase tracking-tight"
                         >
                           + {s}
                         </button>
                       ))
                     )}
                   </div>
                   <div className="mb-2 bg-white rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-emerald-500 transition-colors">
                     <ReactQuill 
                        theme="snow"
                        placeholder="Tulis balasan..." 
                        value={newReplyContent}
                        onChange={setNewReplyContent}
                        className="text-slate-900 min-h-[80px]"
                     />
                   </div>
                   <button type="submit" className="px-4 py-3 bg-emerald-500 text-slate-900 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-colors border-2 border-emerald-400">Kirim Balasan</button>
                 </form>
               ) : (
                 <p className="text-xs font-bold text-slate-400 uppercase text-center mt-4">Silakan login untuk membalas diskusi.</p>
               )}
            </div>
          );
        })() : communityThreads.length === 0 ? (
          <EmptyState type="community" icon={MessageCircle} />
        ) : (
           <div className="space-y-4">
             {communityThreads.sort((a,b) => b.stars_count - a.stars_count || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(thread => {
               const author = getProfileData(thread.authorName);
               const isVIP = author.isVIP || thread.isVIP;
               const displayBanner = author.banner_url || thread.bannerUrl;
               return (
               <div key={thread.id} className={`transition-colors rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer overflow-hidden relative ${isVIP ? author.customBannerClass || thread.customBannerClass || 'vip-banner-gold border-2 border-amber-400' : 'bg-white border-2 border-slate-900'}`} onClick={() => setActiveThreadId(thread.id)}
                  style={displayBanner ? { backgroundImage: `url(${displayBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                 <div className={`p-6 ${displayBanner ? 'bg-black/65 backdrop-blur-md text-white' : (isVIP ? 'bg-black/60 backdrop-blur-md text-white drop-shadow-md' : 'bg-white text-slate-900')} w-full h-full relative z-10`}>
                 <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 capitalize shadow-inner ${isVIP ? 'vip-ring bg-slate-900 border-2 border-slate-900 text-yellow-400' : 'bg-slate-100 border-2 border-slate-200 text-slate-400'}`} style={{ backgroundImage: author.avatar_url ? `url(${author.avatar_url})` : 'none', backgroundSize: 'cover' }}>
                      {thread.authorName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {thread.category && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${isVIP ? 'bg-black/40 border-amber-400/50 text-amber-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>{thread.category}</span>
                        )}
                        <UserIntelligenceTooltip username={thread.authorName}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPublicProfileUsername(thread.authorName); }}
                            className={`font-black uppercase tracking-tight hover:underline ${isVIP ? 'text-gold-shine text-[15px]' : ''}`}
                          >
                            {thread.authorName}
                          </button>
                        </UserIntelligenceTooltip>
                        {isVIP && (
                          <span title="Premium VIP"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-[spin_4s_linear_infinite]" /></span>
                        )}
                        {thread.isVerifiedBuyer ? (
                          <span title="Verified Golden Tick" className="bg-yellow-100 text-yellow-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 border border-yellow-300 shadow-[0_0_5px_rgba(253,224,71,0.5)]">
                            <ShieldCheck className="w-3 h-3 text-yellow-600" /> Sultan Verified
                          </span>
                        ) : (
                           <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-slate-200">
                            Community Member
                          </span>
                        )}
                        <span className={`text-[10px] font-bold ml-auto whitespace-nowrap ${thread.isVIP ? 'text-slate-300' : 'text-slate-400'}`}>
                          {new Date(thread.timestamp).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <h4 className={`font-black text-lg mb-2 uppercase line-clamp-2 ${thread.isVIP ? 'text-white' : 'text-slate-900'}`}>{thread.title}</h4>
                      <div className={`font-medium text-sm whitespace-pre-wrap leading-relaxed line-clamp-3 quill-content ${thread.isVIP ? 'text-slate-200 block drop-shadow-md' : 'text-slate-600'}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(thread.content) }}></div>
                      
                      {loggedInUser && loggedInUser.name !== thread.authorName && (
                        <div className="mt-3 relative z-20">
                           <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                setGiftModal({ isOpen: true, targetUser: thread.authorName });
                             }}
                             className={`text-[9px] font-black uppercase px-2 py-1 rounded bg-rose-500 text-white hover:bg-rose-400 transition-colors flex gap-1 items-center max-w-max shadow-sm`}
                           >
                              🎁 Beri Hadiah L-Points
                           </button>
                        </div>
                      )}
                    </div>
                 </div>
                 <div className={`mt-4 pt-4 flex gap-4 pl-16 border-t-2 ${thread.isVIP ? 'border-white/10' : 'border-slate-100'}`}>
                   <button className={`${thread.isVIP ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-emerald-500'} font-bold text-xs uppercase flex items-center gap-1 transition-colors`}><MessageCircle className="w-4 h-4"/> Reply ({thread.replies?.length || 0})</button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setCommunityThreads(threads => threads.map(t => t.id === thread.id ? {...t, stars_count: (t.stars_count || 0) + 1} : t)); }}
                     className={`${thread.isVIP ? 'text-amber-300 hover:text-amber-100' : 'text-slate-400 hover:text-amber-500'} font-bold text-xs uppercase flex items-center gap-1 transition-colors`}
                   ><ArrowRight className="-rotate-90 w-4 h-4"/> Upvote ({thread.stars_count || 0})</button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setCommunityThreads(threads => threads.map(t => t.id === thread.id ? {...t, stars_count: Math.max(0, (t.stars_count || 0) - 1)} : t)); }}
                     className={`${thread.isVIP ? 'text-slate-300 hover:text-red-400' : 'text-slate-400 hover:text-red-500'} font-bold text-xs uppercase flex items-center gap-1 transition-colors`}
                   ><ArrowRight className="rotate-90 w-4 h-4"/></button>
                 </div>
                 </div>
               </div>
              );
             })}
           </div>
        )}
      </div>
    </div>
  );

  const renderCatalogView = () => (
    <div className="animate-in fade-in duration-500">
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col">
              <div className="relative aspect-square rounded-xl border-2 border-slate-200 mb-4 bg-slate-200 animate-pulse"></div>
              <div className="flex flex-col flex-1">
                <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded animate-pulse w-1/2 mb-6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
          // Jika sudah ada produk
          <section id="koleksi" className="border-2 border-slate-900 bg-slate-100 rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
             <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b-4 border-slate-900 pb-6 gap-4">
              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 uppercase tracking-tighter">Etalase Koleksi Kami</h2>
                <p className="text-slate-600 font-bold max-w-xl mt-2 text-sm uppercase">Dipilih secara khusus untuk gaya hidup modern Anda.</p>
              </div>
              <div className="w-full md:w-auto relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Bot className="w-5 h-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full md:w-72 bg-white border-2 border-slate-900 text-slate-900 text-sm font-bold uppercase rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all placeholder:text-slate-400"
                  placeholder="Cari Template / Buku / Code..."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {isLoadingProducts ? (
                 Array.from({ length: 4 }).map((_, i) => (
                   <div key={`skeleton-${i}`} className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col">
                     <div className="relative aspect-square rounded-xl border-2 border-slate-200 mb-4 bg-slate-200 animate-pulse"></div>
                     <div className="flex flex-col flex-1">
                       <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4 mb-2"></div>
                       <div className="h-6 bg-slate-200 rounded animate-pulse w-1/2 mb-6"></div>
                       <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-full mt-auto"></div>
                     </div>
                   </div>
                 ))
               ) : filteredProducts.length === 0 ? (
                 <div className="col-span-full">
                    <EmptyState type="catalog" icon={ShoppingCart} />
                 </div>
               ) : filteredProducts.map(product => (
                 <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col group cursor-pointer hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] transition-all duration-300"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-900 mb-4 bg-slate-100 group">
                      {product.videoPreview ? (
                         <HoverVideoPreview src={product.videoPreview} poster={product.image} />
                      ) : (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          data-quality="100"
                          data-priority="true"
                        />
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">{product.name}</h3>
                      <div className="mt-2 mb-4">
                        <p className="text-emerald-600 font-black text-lg border-l-4 border-emerald-600 pl-2">{formatIDR(product.currentPrice || product.price)}</p>
                        {product.dynamicPricing && (
                          <div className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                             <span className="animate-pulse">🔥 Naik otomatis dlm {product.salesThreshold! - ((product.salesCount || 0) % product.salesThreshold!)} order</span>
                          </div>
                        )}
                      </div>
                      
                      {product.isPremiumOnly ? (
                        <button 
                          onClick={() => {
                            if (loggedInUser?.isVIP) {
                              startCheckout(product);
                            } else {
                              setIsMemberModalOpen(true);
                              setTimeout(() => alert('Fitur V5: Upgrade ke VIP untuk mendownload produk ini langsung secara gratis!'), 500);
                            }
                          }}
                          className={`mt-auto w-full py-3 text-sm font-bold uppercase tracking-wide border-2 rounded-xl transition-all flex items-center justify-center gap-2 ${loggedInUser?.isVIP ? 'bg-emerald-500 text-slate-900 border-slate-900 hover:bg-emerald-400 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none' : 'bg-slate-100 text-slate-500 border-slate-300 group-hover:border-slate-400 group-hover:text-slate-600'}`}
                        >
                          {loggedInUser?.isVIP ? <><Download className="w-4 h-4"/> Akses VIP</> : <><ShieldCheck className="w-4 h-4" /> Khusus VIP</>}
                        </button>
                      ) : (
                        <div className="flex gap-2 mt-auto">
                          <button 
                            onClick={() => product.demoUrl ? window.open(product.demoUrl, '_blank') : alert('Simulasi: Live Preview Sedang Dimuat...')}
                            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white border-2 border-slate-900 rounded-xl hover:bg-slate-100 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none"
                            title="Live Preview"
                          >
                            <span className="text-xl">👁️</span>
                          </button>
                          <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white border-2 border-slate-900 rounded-xl hover:bg-emerald-50 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none"
                            title="Tambah ke Troli"
                          >
                            <ShoppingCart className="w-5 h-5 text-slate-900" />
                          </button>
                          <MagneticButton 
                            onClick={() => startCheckout(product)}
                            className="flex-1 py-3 text-sm font-bold uppercase tracking-wide text-white bg-slate-900 border-2 border-slate-900 rounded-xl hover:bg-emerald-500 hover:text-slate-900 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none"
                          >
                            Beli Instan
                          </MagneticButton>
                        </div>
                      )}
                    </div>
                 </motion.div>
               ))}
            </div>
          </section>
        ) : (
          // Empty State (V2 Design)
          <section className="bg-white border-2 border-slate-900 rounded-3xl p-10 sm:p-20 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center text-center justify-center relative overflow-hidden min-h-[60vh] animate-in fade-in duration-500">
             <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0f172a 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
             
             <div className="w-24 h-24 bg-slate-100 border-4 border-slate-900 rounded-full flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative z-10">
               <Info className="w-10 h-10 text-slate-900" />
             </div>
             
             <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-6 relative z-10">
               Katalog Sedang<br/>Dipersiapkan.
             </h1>
             
             <p className="text-slate-600 font-bold max-w-md text-sm sm:text-base uppercase tracking-wider relative z-10 mb-10">
               Kami sedang menyusun produk terbaik untuk Anda. Silakan sapa kami melalui live chat untuk informasi lebih lanjut.
             </p>

             <button 
              onClick={() => setIsChatOpen(true)}
              className="px-8 py-4 bg-emerald-500 text-slate-900 border-2 border-slate-900 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all relative z-10 flex items-center gap-3"
             >
               Sapa Kami Sekarang <MessageCircle className="w-5 h-5" />
             </button>
          </section>
        )}
    </div>
  );
  // VIP Theme logic
  const getVipGlowColor = () => {
    if (!loggedInUser || !loggedInUser.isVIP) return 'transparent';
    if (loggedInUser.activeTheme === 'party-mode') return '#f43f5e';
    if (loggedInUser.activeTheme === 'night-synced') return '#3b82f6';
    if (loggedInUser.activeTheme === 'ruby') return '#e11d48';
    if (loggedInUser.activeTheme === 'violet') return '#8b5cf6';
    if (loggedInUser.activeTheme === 'royal-blue') return '#2563eb';
    if (loggedInUser.activeTheme === 'matrix') return '#10b981';
    return '#fcd34d'; // default gold
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Selamat Pagi yang Luar Biasa';
    if (hour < 18) return '🌤️ Selamat Siang yang Luar Biasa';
    return '🌙 Selamat Malam, Waktunya Menginspirasi';
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-8 px-4 sm:px-6 md:px-8 transition-colors duration-1000 bg-slate-50 text-slate-900`}>
      <VIPCursor isVIP={loggedInUser?.isVIP || false} />

      <AnimatePresence>
         {copyPopup && (
            <motion.div
               initial={{ opacity: 0, y: 10, scale: 0.8 }}
               animate={{ opacity: 1, y: -20, scale: 1 }}
               exit={{ opacity: 0, y: -40, scale: 0.8 }}
               className="fixed z-[999999] px-3 py-1.5 bg-slate-900 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-lg border-2 border-emerald-400 shadow-xl pointer-events-none"
               style={{ left: copyPopup.x, top: copyPopup.y - 20, transform: 'translateX(-50%)' }}
            >
               {copyPopup.text}
            </motion.div>
         )}
      </AnimatePresence>
      
      {/* Treasure Coin (Easter Egg) */}
      {!treasureFound && (
         <div 
           className="w-5 h-5 bg-yellow-400 rounded-full fixed bottom-10 right-10 cursor-pointer shadow-[0_0_15px_rgba(250,204,21,0.8)] z-0 animate-pulse border-2 border-yellow-200"
           onClick={() => {
              setTreasureFound(true);
              triggerVibration([50, 100, 50, 100]);
              window.dispatchEvent(new CustomEvent('showCopyPopup', { detail: { x: window.innerWidth - 60, y: window.innerHeight - 60, text: '🪙 TREASURE FOUND! +1000LP' } }));
              if (loggedInUser) setLoggedInUser({ ...loggedInUser, lPoints: (loggedInUser.lPoints || 0) + 1000 });
           }}
           style={{ opacity: 0.1, transition: 'opacity 0.2s' }}
           onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
           onMouseLeave={(e) => e.currentTarget.style.opacity = '0.1'}
         />
      )}

      {/* Birthday Surprise Modal */}
      <AnimatePresence>
        {showBirthdaySurprise && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowBirthdaySurprise(false)}>
              <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 1200} height={typeof window !== 'undefined' ? window.innerHeight : 800} recycle={false} numberOfPieces={800} />
              <motion.div
                 initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                 animate={{ opacity: 1, scale: 1, rotate: 0 }}
                 exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                 className="bg-slate-900 border-4 border-emerald-400 rounded-3xl p-8 max-w-sm text-center shadow-[0_0_50px_rgba(52,211,153,0.5)] text-white"
                 onClick={e => e.stopPropagation()}
              >
                 <div className="text-6xl mb-4">🎂</div>
                 <h2 className="text-3xl font-black uppercase text-emerald-400 mb-2">Selamat Ulang Tahun!</h2>
                 <p className="font-bold text-slate-300 mb-6">AI Lumina mengucapkan selamat ulang tahun yang luar biasa untukmu! Kami menyiapkan hadiah kecil yang hanya berlaku 24 jam.</p>
                 <div className="bg-slate-800 p-4 rounded-xl border-2 border-dashed border-emerald-500 mb-6 font-mono text-xl font-black text-amber-400 tracking-widest">
                    BDAY-VIP-99
                 </div>
                 <MagneticButton onClick={() => {
                    navigator.clipboard.writeText('BDAY-VIP-99');
                    setShowBirthdaySurprise(false);
                    window.dispatchEvent(new CustomEvent('showCopyPopup', { detail: { x: window.innerWidth/2, y: window.innerHeight/2, text: 'Kupon Disalin! 🎉' } }));
                 }} className="w-full bg-emerald-500 text-slate-900 font-black uppercase tracking-widest py-3 rounded-xl hover:bg-emerald-400 transition-colors">
                    Salin & Tutup
                 </MagneticButton>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
      
      {/* Community Gift Modal */}
      <AnimatePresence>
        {giftModal.isOpen && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setGiftModal({...giftModal, isOpen: false})}>
              <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 relative"
                 onClick={e => e.stopPropagation()}
              >
                 <button onClick={() => setGiftModal({...giftModal, isOpen: false})} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="w-6 h-6" />
                 </button>
                 <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-200">
                       <span className="text-3xl">🎁</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Kirim L-Points</h2>
                    <p className="text-sm font-bold text-slate-500 uppercase mt-1">Ke: <span className="text-emerald-600">{giftModal.targetUser}</span></p>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-black uppercase text-slate-900 mb-2">Jumlah Poin</label>
                       <input 
                          type="number"
                          value={giftAmount}
                          onChange={e => setGiftAmount(e.target.value)}
                          className="w-full p-4 rounded-xl border-2 border-slate-200 font-black text-xl text-center outline-none focus:border-emerald-500"
                          placeholder="100"
                       />
                       <p className="text-[10px] font-bold text-slate-400 text-center mt-2 uppercase tracking-wide">Saldo Anda: {loggedInUser?.lPoints || 0} LP</p>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <div>
                          <p className="font-black text-sm uppercase text-slate-900">Kirim sebagai Anonim</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Sembunyikan nama Anda (Lumina Ghost 👻)</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isGiftAnonymous} onChange={e => setIsGiftAnonymous(e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                       </label>
                    </div>

                    <button 
                       onClick={() => {
                          const amount = parseInt(giftAmount);
                          if (!amount || amount <= 0) {
                             alert("Jumlah poin tidak valid.");
                             return;
                          }
                          if (!loggedInUser || (loggedInUser.lPoints || 0) < amount) {
                             alert("L-Points Anda tidak mencukupi!");
                             return;
                          }
                          // Mock logic deduct points & success
                          setLoggedInUser({...loggedInUser, lPoints: (loggedInUser.lPoints || 0) - amount});
                          setGiftModal({...giftModal, isOpen: false});
                          
                          // Vibrate and Confetti via showing a toast
                          triggerVibration([50, 100, 50]);
                          const senderName = isGiftAnonymous ? 'Lumina Ghost 👻' : loggedInUser.name;
                          window.dispatchEvent(new CustomEvent('showCopyPopup', { detail: { x: window.innerWidth/2, y: window.innerHeight/2, text: `🎉 ${senderName} berhasil melempar ${amount} LP ke ${giftModal.targetUser}!` } }));
                       }}
                       className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-emerald-500 hover:text-slate-900 transition-colors shadow-[4px_4px_0px_0px_rgba(20,184,166,0.3)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
                    >
                       Kirim Sekarang
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Grand Modal Winner */}
      <AnimatePresence>
        {showWinnerModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <SmartConfetti width={typeof window !== 'undefined' ? window.innerWidth : 1200} height={typeof window !== 'undefined' ? window.innerHeight : 800} recycle={false} numberOfPieces={500} />
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
               onClick={() => setShowWinnerModal(false)}
            ></motion.div>
            <motion.div 
               initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
               animate={{ scale: 1, opacity: 1, rotate: 0 }}
               exit={{ scale: 0.8, opacity: 0 }}
               transition={{ type: "spring", bounce: 0.5 }}
               className="relative z-10 text-center"
            >
              <div className="w-48 h-48 mx-auto bg-amber-400 rounded-full border-8 border-white shadow-[0_0_100px_rgba(251,191,36,0.8)] flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                <Star className="w-24 h-24 text-white fill-current" />
              </div>
              <motion.h2 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 drop-shadow-lg"
              >
                The Crown Belongs <br/> To You Sekarang!!
              </motion.h2>
              <motion.p 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.5 }}
                 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-amber-300"
              >
                Kupon VIP 99% Anda Telah Aktif!
              </motion.p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promo Announcement Modal */}
      {isPromoModalOpen && promoBanners.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={() => setIsPromoModalOpen(false)}>
           <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-md w-full animate-in zoom-in-95 duration-200 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-300 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
              <button onClick={() => setIsPromoModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg p-2 transition-colors z-10"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-black uppercase text-slate-900 mb-2 tracking-tight pr-8">{promoBanners[0].title}</h3>
              <p className="text-slate-600 font-bold text-sm mb-6 pr-4">{promoBanners[0].content}</p>
              <button onClick={() => setIsPromoModalOpen(false)} className="w-full py-4 bg-emerald-500 text-slate-900 border-2 border-slate-900 font-black uppercase rounded-xl tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Sikat Promonya!</button>
           </div>
        </div>
      )}

      {/* Secret Login Modal */}
      {isSecretLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setIsSecretLoginModalOpen(false)}>
           <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-black uppercase text-slate-900 mb-4 tracking-tight">Akses Admin</h3>
              <form onSubmit={handleSecretPasswordSubmit}>
                 <input 
                   type="password" 
                   required
                   value={secretPasswordInput}
                   onChange={e => setSecretPasswordInput(e.target.value)}
                   className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none font-mono mb-4 text-center tracking-widest"
                   placeholder="••••••••"
                   autoFocus
                 />
                 <div className="flex gap-2">
                    <button type="button" onClick={() => setIsSecretLoginModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold uppercase rounded-xl hover:bg-slate-200">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-slate-900 text-white border-2 border-slate-900 font-bold uppercase rounded-xl hover:bg-emerald-500 hover:text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Masuk</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Navbar with Secret Login */}
      <div className="pt-2 sm:pt-4 z-40 relative px-2 sm:px-0">
        <nav className={`max-w-7xl mx-auto flex justify-between items-center px-3 md:px-4 py-2 sm:py-3 bg-white border-2 rounded-2xl sticky top-2 sm:top-4 z-40 transition-all ${loggedInUser?.isVIP ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]'}`}>
          <div className="flex items-center gap-2 md:gap-4">
             <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer select-none" onClick={(e) => { e.stopPropagation(); handleSecretLogin(); setCurrentView('home'); }}>
               <div className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg flex items-center justify-center ${loggedInUser?.isVIP ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 shadow-inner' : 'bg-slate-900'}`}>
                 <span className="text-white font-bold text-lg sm:text-xl">L</span>
               </div>
               <span className="font-black text-sm sm:text-base md:text-xl tracking-tighter whitespace-nowrap uppercase relative group text-slate-900">
                 Lumina.
               </span>
             </div>
             <div title="Lumina Live Radar" className="hidden lg:flex items-center gap-1.5 bg-slate-900 text-emerald-400 px-3 py-1.5 rounded-full border border-slate-800 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute"></span>
                <span className="text-[10px] font-black tracking-widest pl-2">{liveOnlineUsers} SULTAN ONLINE</span>
             </div>
          </div>

          <div className="hidden md:flex items-center gap-6 font-bold text-sm uppercase tracking-widest text-slate-900">
            <button onClick={() => setCurrentView('catalog')} className={`hover:text-emerald-600 transition-colors ${currentView === 'catalog' ? 'text-emerald-600' : ''}`}>Etalase</button>
            <button onClick={() => setCurrentView('community')} className={`hover:text-emerald-600 transition-colors ${currentView === 'community' ? 'text-emerald-600' : ''}`}>🌐 Forum</button>
            <button onClick={() => setShowNewsDrawer(true)} className="hover:text-emerald-600 transition-colors flex items-center shadow-lg relative bg-amber-50 px-2 py-1 border border-amber-200 rounded-md">
              <Megaphone className="w-4 h-4 text-amber-500 animate-[bounce_2s_infinite]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            <button id="desktop-cart-icon" onClick={() => setIsCartOpen(true)} className="hover:text-emerald-600 transition-colors relative">
               <ShoppingCart className="w-5 h-5" />
               {cartItems.length > 0 && (
                 <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                   {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                 </span>
               )}
            </button>
            <button onClick={() => setIsMailboxOpen(true)} className="hover:text-rose-600 transition-colors relative">
               <Bell className="w-5 h-5" />
               {mailboxMessages.filter(m => !m.is_read).length > 0 && (
                 <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                   {mailboxMessages.filter(m => !m.is_read).length}
                 </span>
               )}
            </button>
            <button onClick={() => setIsTrackOrderOpen(true)} className="bg-slate-100 text-slate-900 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-black text-xs border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 🔍 Lacak/Unduh PesananKu</button>
            <button onClick={() => setIsMemberModalOpen(true)} className="hover:text-emerald-600 transition-colors flex items-center gap-1">Member Area <User className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
            <button onClick={() => setShowNewsDrawer(true)} className="md:hidden relative p-1.5 shrink-0">
              <Megaphone className="w-5 h-5 md:w-6 md:h-6 text-amber-500 animate-[bounce_2s_infinite]" />
              <div className="absolute 0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute 0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            <button id="mobile-cart-icon" onClick={() => setIsCartOpen(true)} className="md:hidden relative p-1.5 shrink-0">
               <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-slate-900" />
               {cartItems.length > 0 && (
                 <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full">
                   {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                 </span>
               )}
            </button>
            <button onClick={() => setIsMailboxOpen(true)} className="md:hidden relative p-1.5 shrink-0">
               <Bell className="w-5 h-5 md:w-6 md:h-6 text-slate-900" />
               {mailboxMessages.filter(m => !m.is_read).length > 0 && (
                 <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full">
                   {mailboxMessages.filter(m => !m.is_read).length}
                 </span>
               )}
            </button>
            <button 
              className="md:hidden hover:text-emerald-600 transition-colors p-1.5 shrink-0"
              onClick={() => setIsMemberModalOpen(true)}
            >
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              className="md:hidden p-1.5 text-slate-900 focus:outline-none shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Lumina News Drawer */}
      <AnimatePresence>
        {showNewsDrawer && (
          <div className="fixed inset-0 z-[100] flex">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowNewsDrawer(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b-4 border-slate-900">
                <h2 className="font-black text-xl uppercase text-slate-900 flex items-center gap-2"><Megaphone className="w-5 h-5 text-emerald-500" /> Lumina News</h2>
                <button onClick={() => setShowNewsDrawer(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-900" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {luminaNews.filter(n => new Date() > new Date(n.start_date) && new Date() < new Date(n.end_date)).map(news => (
                  <div key={news.id} className={`mb-6 bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${news.is_pinned ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                    {news.is_pinned && <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 flex items-center gap-1"><Star className="w-3 h-3 fill-emerald-500" /> Pengumuman Resmi</div>}
                    <h3 className="font-black text-lg text-slate-900 uppercase leading-tight mb-4">{news.title}</h3>
                    <div className="text-sm font-medium text-slate-700 leading-relaxed quill-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content_html) }}></div>
                  </div>
                ))}
                {luminaNews.filter(n => new Date() > new Date(n.start_date) && new Date() < new Date(n.end_date)).length === 0 && (
                  <div className="text-center p-12 text-slate-400 font-bold uppercase text-xs">Belum ada berita terbaru saat ini.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mailbox Drawer */}
      <AnimatePresence>
        {isMailboxOpen && (
          <div className="fixed inset-0 z-[100] flex">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsMailboxOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b-4 border-slate-900">
                <h2 className="font-black text-xl uppercase text-slate-900 flex items-center gap-2"><Mail className="w-5 h-5 text-rose-500" /> Mailbox</h2>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setMailboxMessages(prev => prev.map(m => ({ ...m, is_read: true })))}
                    className="text-[10px] font-bold uppercase text-emerald-600 hover:underline"
                  >
                    Baca Semua
                  </button>
                  <button onClick={() => setIsMailboxOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-900" /></button>
                </div>
              </div>

                              <div className={`p-6 bg-slate-50 flex-1 overflow-y-auto`}>
                                {mailboxMessages.length > 0 ? (
                                  [...mailboxMessages].sort((a,b) => b.created_at.getTime() - a.created_at.getTime()).map(msg => (
                                    <div 
                                      key={msg.id} 
                                      onClick={() => setMailboxMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))}
                                      className={`mb-4 bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] cursor-pointer transition-all hover:translate-x-1 ${!msg.is_read ? 'ring-2 ring-rose-500 ring-offset-2' : 'opacity-80'}`}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{msg.sender_name}</span>
                                        {!msg.is_read && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                                      </div>
                                      <h3 className="font-black text-sm text-slate-900 uppercase leading-tight mb-1">{msg.title}</h3>
                                      <p className="text-xs font-medium text-slate-600 leading-relaxed">{msg.content}</p>
                                      
                                      {msg.gift_type && (
                                        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold">🎁</div>
                                            <div>
                                              <span className="block text-[10px] font-black text-rose-900 uppercase">Hadiah Tersedia</span>
                                              <span className="text-[9px] font-bold text-rose-600 uppercase">{msg.gift_amount} {msg.gift_type === 'l_points' ? 'L-Points' : 'Item'}</span>
                                            </div>
                                          </div>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); claimGift(msg); }}
                                            disabled={msg.is_claimed}
                                            className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase transition-all ${msg.is_claimed ? 'bg-slate-200 text-slate-400' : 'bg-rose-500 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'}`}
                                          >
                                            {msg.is_claimed ? 'Diklaim' : 'Klaim'}
                                          </button>
                                        </div>
                                      )}

                                      <div className="mt-3 flex justify-between items-center">
                                         <span className="text-[9px] font-bold text-slate-400 uppercase">{msg.created_at.toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center p-12 text-slate-400 font-bold uppercase text-xs">Mailbox Anda kosong.</div>
                                )}
                              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flyingItem && (
          <motion.img
            key={flyingItem.id}
            src={flyingItem.imageUrl}
            className="fixed z-[9999] w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-xl"
            initial={{ 
              x: flyingItem.startX - 24, 
              y: flyingItem.startY - 24, 
              opacity: 1, 
              scale: 1 
            }}
            animate={{ 
              x: flyingItem.endX - 24, 
              y: flyingItem.endY - 24, 
              opacity: 0.5, 
              scale: 0.2 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.32, 0.72, 0, 1] 
            }}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsCartOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b-4 border-slate-900">
                <h2 className="font-black text-xl uppercase text-slate-900 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-emerald-500" /> Troli</h2>
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-900" /></button>
                </div>
              </div>

              <div className={`p-6 bg-slate-50 flex-1 overflow-y-auto`}>
                {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="mb-4 bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex gap-4 pr-10 relative">
                       <button onClick={() => removeFromCart(item.product, item.selectedLicenseIndex)} className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"><X className="w-4 h-4" /></button>
                       <img src={item.product.image} className="w-16 h-16 rounded-xl object-cover border border-slate-200" alt={item.product.name} />
                       <div className="flex-1">
                          <h4 className="font-black text-sm uppercase text-slate-900 line-clamp-1">{item.product.name}</h4>
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">{item.product.licenses?.[item.selectedLicenseIndex]?.name || 'Standard'}</p>
                          <div className="flex items-center justify-between">
                             <span className="font-bold text-emerald-600 text-sm">{formatIDR(item.product.licenses?.[item.selectedLicenseIndex]?.price || item.product.currentPrice || item.product.price)}</span>
                             <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                               <button onClick={() => updateCartQuantity(item.product, item.selectedLicenseIndex, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-slate-900 font-bold hover:bg-slate-200">-</button>
                               <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                               <button onClick={() => updateCartQuantity(item.product, item.selectedLicenseIndex, 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-slate-900 font-bold hover:bg-slate-200">+</button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-12 text-slate-400 font-bold uppercase text-xs">Troli kosong seperti dompet pas tanggal tua.</div>
                )}
              </div>
              
              {cartItems.length > 0 && (
                <div className="p-6 bg-white border-t-4 border-slate-900">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-sm font-bold text-slate-600 uppercase">Subtotal</span>
                     <span className="text-xl font-black text-emerald-600">{formatIDR(getCartTotal())}</span>
                  </div>
                  <MagneticButton onClick={checkoutCart} className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,83,45,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" /> Bayar Sekarang
                  </MagneticButton>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsMenuOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-80 bg-white border-r border-slate-200 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <span className="font-black text-xl tracking-tighter uppercase text-slate-900">
                  Lumina.
                </span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-md">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-8">
                {/* Main Menu Group */}
                <div>
                   <h4 className="px-3 mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Discover</h4>
                   <nav className="space-y-1">
                     <button onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${currentView === 'home' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                       <LayoutGrid className="w-4 h-4" /> Home
                     </button>
                     <button onClick={() => { playClick(); setCurrentView('catalog'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${currentView === 'catalog' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                       <Briefcase className="w-4 h-4" /> Etalase Produk
                     </button>
                     <button onClick={() => { setCurrentView('community'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${currentView === 'community' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                       <Users className="w-4 h-4" /> Forum Komunitas
                     </button>
                   </nav>
                </div>

                {/* Rewards / Points Group */}
                <div>
                   <h4 className="px-3 mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Rewards</h4>
                   <nav className="space-y-1">
                     <a 
                       href="/rewards"
                       onClick={(e) => { 
                         e.preventDefault();
                         setIsMenuOpen(false); 
                         alert('Fitur Pindah Page <Link href="/rewards"> Modul Next.js: Membuka L-Point Rewards Center!');
                       }} 
                       className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-900 font-bold text-sm tracking-wide border border-amber-200 shadow-sm transition-transform active:scale-95 cursor-pointer"
                     >
                       <div className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-inner shrink-0">
                         <Star className="w-4 h-4 fill-current" />
                       </div>
                       Penukaran Poin (L-Point)
                     </a>
                   </nav>
                </div>

                {/* User Tools Group */}
                <div>
                   <h4 className="px-3 mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Services</h4>
                   <nav className="space-y-1">
                     <button 
                       onClick={() => { setIsTrackOrderOpen(true); setIsMenuOpen(false); }} 
                       className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                     >
                       <ShieldCheck className="w-4 h-4 text-emerald-500" /> Lacak Pesanan
                     </button>
                   </nav>
                </div>
              </div>

              {/* Sidebar Footer: Greetings Time Component */}
              <div className="mt-auto sticky bottom-0 p-4 border-t border-slate-100 bg-white/80 backdrop-blur-md">
                {loggedInUser ? (
                  <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-100 shadow-sm flex flex-col gap-1">
                    <span className="font-bold text-slate-800 text-xs">{getGreeting()}, {loggedInUser.name.split(' ')[0]}! {loggedInUser.isVIP ? '👑' : ''}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest flex items-center gap-1">
                      🗓️ {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <span className="font-bold text-slate-800 text-xs">{getGreeting()}, Guest!</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest flex items-center gap-1">
                      🗓️ {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3D Spatial Background Parallax Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          style={{ y: bgY1, scale: 1.2 }} 
          className="absolute -inset-[20%] opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
        ></motion.div>
        <motion.div 
          style={{ y: bgY2, scale: 1.2 }} 
          className="absolute -inset-[20%] opacity-50 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
        ></motion.div>
      </div>

      <main className="max-w-7xl mx-auto mt-6 flex flex-col gap-6 relative z-10">
        {publicProfileUsername ? (
          renderPublicProfile()
        ) : (
          <>
            {currentView === 'home' && renderHomeView()}
            {currentView === 'community' && renderCommunityView()}
            {currentView === 'catalog' && renderCatalogView()}
          </>
        )}
      </main>

      {/* TRACK ORDER MODAL */}
      <AnimatePresence>
        {isTrackOrderOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {setIsTrackOrderOpen(false); setTrackedOrderResult(null);}}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border-4 border-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <h3 className="font-black text-lg uppercase tracking-wider flex items-center gap-2">🔍 Lacak/Unduh Pesanan</h3>
                <button onClick={() => {setIsTrackOrderOpen(false); setTrackedOrderResult(null);}} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {!trackedOrderResult ? (
                  <form onSubmit={(e) => {
                     e.preventDefault();
                     // Simulation logic
                     const foundPurchases = allPurchases.filter(p => p.email.toLowerCase() === trackContact.toLowerCase());
                     if (foundPurchases.length > 0) {
                        setTrackedOrderResult(foundPurchases.flatMap(p => p.products));
                     } else {
                        alert("Pesanan tidak ditemukan dengan kontak tersebut. Pastikan Email penulisan benar.");
                     }
                  }}>
                    <p className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest text-center">Gunakan Order ID dan Email Anda untuk memulihkan akses produk yang hilang / salah ketik email penerima.</p>
                    <div className="space-y-4">
                       <div>
                         <label className="block text-xs font-black uppercase text-slate-900 mb-2">Order ID (Misal: LUM-909)</label>
                         <input 
                           type="text" required
                           value={trackOrderId}
                           onChange={e => setTrackOrderId(e.target.value)}
                           className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-mono tracking-widest text-sm" 
                           placeholder="LUM-12345" 
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-black uppercase text-slate-900 mb-2">Kontak (WhatsApp / Email Pembelian)</label>
                         <input 
                           type="text" required
                           value={trackContact}
                           onChange={e => setTrackContact(e.target.value)}
                           className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium text-sm" 
                           placeholder="johndoe@email.com / 0812..." 
                         />
                       </div>
                       <button type="submit" className="w-full mt-2 py-4 bg-emerald-500 text-slate-900 border-2 border-slate-900 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                         Cari Pesanan & Tampilkan Link
                       </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center">
                     <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                     <h4 className="font-black text-xl uppercase mb-2">Pesanan Ditemukan!</h4>
                     <p className="text-xs font-bold text-slate-500 uppercase px-4 mb-6">Tautan unduhan sementara (Valid 2 Jam) dihaslikan khusus untuk IP Anda.</p>
                     
                     <div className="space-y-3">
                       {trackedOrderResult.map((p: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-slate-100 border border-slate-300 p-3 rounded-xl">
                             <div className="text-left max-w-[60%]">
                                <p className="font-bold text-sm uppercase truncate text-slate-900">{p.name}</p>
                             </div>
                             <a href={p.secretContent || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-900 text-white text-xs font-bold uppercase px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                                <Download className="w-3 h-3" /> Unduh
                             </a>
                          </div>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {(checkoutProduct || isCheckingOutCart) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { if (checkoutStep === 'form') { setCheckoutProduct(null); setIsCheckingOutCart(false); } }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border-4 border-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {checkoutStep === 'form' && (
                   <motion.div 
                     key="form"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="flex flex-col max-h-[90vh]"
                   >
                     <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                     <h3 className="font-black text-lg uppercase tracking-wider">Fast Checkout</h3>
                     <button onClick={() => { setCheckoutProduct(null); setIsCheckingOutCart(false); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                       <X className="w-5 h-5" />
                     </button>
                   </div>
                   <div className="p-6 overflow-y-auto">
                     {isCheckingOutCart ? (
                        <div className="flex flex-col gap-2 bg-slate-50 border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                           {cartItems.map((item, idx) => (
                              <div key={idx} className="flex gap-4 items-center border-b border-slate-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                                <img src={item.product.image} className="w-10 h-10 rounded-lg object-cover" />
                                <div className="flex-1">
                                   <p className="font-bold text-xs uppercase text-slate-900 line-clamp-1">{item.product.name} <span className="text-emerald-600">x{item.quantity}</span></p>
                                   <p className="text-[9px] font-black uppercase text-slate-400">{item.product.licenses?.[item.selectedLicenseIndex]?.name || 'Standard'}</p>
                                </div>
                              </div>
                           ))}
                           <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
                              <span className="text-xs font-black uppercase text-slate-500">Cart Total</span>
                              <span className="font-black text-emerald-600 text-lg">{formatIDR(getCartTotal())}</span>
                           </div>
                        </div>
                     ) : checkoutProduct && (
                       <div className="flex gap-4 items-center bg-slate-50 border-2 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden z-0">
                         {/* Ambient Background Glow */}
                         <div className="absolute inset-0 bg-cover bg-center shrink-0 opacity-20 blur-3xl z-[-1] scale-150 saturate-200" style={{ backgroundImage: `url(${checkoutProduct.image})` }} />
                         <img src={checkoutProduct.image} alt={checkoutProduct.name} className="w-16 h-16 rounded-xl border border-slate-200 object-cover shadow-sm bg-white" />
                         <div>
                           <p className="font-black uppercase tracking-tight text-sm text-slate-900 line-clamp-1 drop-shadow-md">{checkoutProduct.name}</p>
                           <p className="text-emerald-600 font-bold text-lg drop-shadow-md">{formatIDR(checkoutProduct.licenses?.[selectedLicenseIndex]?.price || checkoutProduct.currentPrice || checkoutProduct.price)}</p>
                         </div>
                       </div>
                     )}
                     
                     <form onSubmit={processPayment} className="mt-6 space-y-4">
                        {(!isCheckingOutCart && checkoutProduct?.licenses && checkoutProduct.licenses.length > 0) && (
                          <div className="space-y-2">
                             <label className="block text-xs font-black uppercase text-slate-900 mb-2">Pilih Lisensi</label>
                             <div className="grid grid-cols-2 gap-2">
                               {checkoutProduct.licenses.map((lic, idx) => (
                                 <button 
                                   key={idx} 
                                   type="button"
                                   onClick={() => { setSelectedLicenseIndex(idx); setAppliedCoupon(null); /* reset coupon if price changes */ }}
                                   className={`p-3 rounded-xl border-2 text-left transition-all ${selectedLicenseIndex === idx ? 'border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
                                 >
                                   <div className="text-xs font-black uppercase">{lic.name}</div>
                                   <div className={`text-sm font-bold ${selectedLicenseIndex === idx ? 'text-emerald-400' : 'text-slate-900'}`}>{formatIDR(lic.price)}</div>
                                 </button>
                               ))}
                             </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-2 p-3 bg-slate-100 rounded-xl border border-slate-200">
                           <input type="checkbox" id="gifting" className="w-4 h-4 accent-emerald-600" checked={isGifting} onChange={e => setIsGifting(e.target.checked)} />
                           <label htmlFor="gifting" className="font-bold text-xs uppercase text-slate-700 cursor-pointer flex items-center gap-1"><Star className="w-3 h-3 text-emerald-600" /> Beli sebagai Hadiah (Gift)</label>
                        </div>

                        {!isGifting ? (
                          <>
                            <div>
                              <label className="block text-xs font-black uppercase text-slate-900 mb-2">Nama Lengkap</label>
                              <input 
                                type="text" required
                                value={customerInfo.name}
                                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium text-sm" 
                                placeholder="John Doe" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-slate-900 mb-2">Email Pembeli</label>
                              <input 
                                type="email" required
                                value={customerInfo.email}
                                onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                                className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium text-sm" 
                                placeholder="john@example.com" 
                              />
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4 bg-emerald-50 p-4 border border-emerald-200 rounded-xl">
                            <div>
                              <label className="block text-xs font-black uppercase text-emerald-900 mb-2">Email Pembeli Anda (Pembersit)</label>
                              <input 
                                type="email" required
                                value={customerInfo.email}
                                onChange={e => setCustomerInfo({...customerInfo, email: e.target.value, name: e.target.value.split('@')[0]})}
                                className="w-full p-3 rounded-xl border-2 border-emerald-200 outline-none focus:border-emerald-600 transition-colors font-medium text-sm" 
                                placeholder="anda@example.com" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-emerald-900 mb-2">Email Penerima Hadiah</label>
                              <input 
                                type="email" required
                                value={giftInfo.email}
                                onChange={e => setGiftInfo({...giftInfo, email: e.target.value})}
                                className="w-full p-3 rounded-xl border-2 border-emerald-200 outline-none focus:border-emerald-600 transition-colors font-medium text-sm" 
                                placeholder="teman@example.com" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-emerald-900 mb-2">Nama Penerima</label>
                              <input 
                                type="text" required
                                value={giftInfo.name}
                                onChange={e => setGiftInfo({...giftInfo, name: e.target.value})}
                                className="w-full p-3 rounded-xl border-2 border-emerald-200 outline-none focus:border-emerald-600 transition-colors font-medium text-sm" 
                                placeholder="Jane Doe" 
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-emerald-900 mb-2">Pesan Spesial</label>
                              <textarea 
                                value={giftInfo.message}
                                onChange={e => setGiftInfo({...giftInfo, message: e.target.value})}
                                className="w-full p-3 rounded-xl border-2 border-emerald-200 outline-none focus:border-emerald-600 transition-colors font-medium text-sm resize-none h-20" 
                                placeholder="Selamat ulang tahun! Ini gift untukmu..." 
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* V7 Feature: Smart Bundling */}
                        {(!isCheckingOutCart && checkoutProduct) && (() => {
                           const bundles = products.filter(p => p.category === checkoutProduct.category && p.id !== checkoutProduct.id).slice(0, 2);
                           if (bundles.length === 0) return null;
                           const upsellPrice = bundles.reduce((acc, curr) => acc + (curr.currentPrice || curr.price), 0) * 0.8; // 20% bundle discount
                           
                           return (
                             <div className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl relative">
                                <div className="absolute -top-3 left-4 bg-emerald-500 text-slate-900 border-2 border-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                                   <Bot className="w-3 h-3" /> Smart Bundling
                                </div>
                                <label className="flex items-start gap-3 cursor-pointer mt-2">
                                   <input 
                                    type="checkbox" 
                                    className="mt-1 w-5 h-5 accent-emerald-600 cursor-pointer"
                                    checked={acceptUpsell}
                                    onChange={e => setAcceptUpsell(e.target.checked)}
                                  />
                                  <div>
                                     <p className="font-black text-sm uppercase text-slate-900">Tambahkan Semua Bundel Ini?</p>
                                     <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed">
                                       Sering dibeli bersamaan: {bundles.map(b => b.name).join(' & ')}. 
                                       Beli semua hanya dengan tambahan <span className="bg-emerald-200 px-1 text-emerald-900 font-bold">{formatIDR(upsellPrice)}</span> (Hemat 20%!)
                                     </p>
                                  </div>
                                </label>
                             </div>
                           );
                        })()}
                        
                        {/* V7 Feature: Coupon Code */}
                       <div>
                          <label className="block text-xs font-black uppercase text-slate-900 mb-2">Kode Kupon Promo</label>
                          <div className="flex gap-2">
                             <input 
                               type="text"
                               value={couponCode}
                               onChange={e => setCouponCode(e.target.value)}
                               disabled={!!appliedCoupon}
                               className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-mono text-sm uppercase tracking-widest disabled:bg-slate-100 disabled:text-slate-400" 
                               placeholder="LUMINA-GAJIAN" 
                             />
                             {!appliedCoupon ? (
                               <MagneticButton type="button" onClick={handleApplyCoupon} className="whitespace-nowrap px-4 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs border-2 border-slate-900 hover:bg-slate-800 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Apply</MagneticButton>
                             ) : (
                               <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="whitespace-nowrap px-4 py-3 bg-red-500 text-white rounded-xl font-bold uppercase text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-red-400 hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all">Batal</button>
                             )}
                          </div>
                          {appliedCoupon && (
                             <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Kupon berhasil digunakan! Diskon {appliedCoupon.type === 'percentage' ? `${appliedCoupon.amount}%` : formatIDR(appliedCoupon.amount)}
                             </p>
                          )}
                       </div>

                       <div className="pt-4 flex flex-col gap-2 font-black text-lg p-4 bg-slate-100 rounded-2xl border border-slate-200 mt-4 uppercase">
                          {(() => {
                             const basePrice = isCheckingOutCart ? getCartTotal() : (checkoutProduct ? (checkoutProduct.licenses?.[selectedLicenseIndex]?.price || checkoutProduct.currentPrice || checkoutProduct.price) : 0);
                             const bundles = (!isCheckingOutCart && checkoutProduct) ? products.filter(p => p.category === checkoutProduct.category && p.id !== checkoutProduct.id).slice(0, 2) : [];
                             const upsellPrice = bundles.length > 0 ? bundles.reduce((acc, curr) => acc + (curr.currentPrice || curr.price), 0) * 0.8 : 0;
                             let total = basePrice + (acceptUpsell ? upsellPrice : 0);
                             let discount = 0;
                             if (appliedCoupon) {
                               if (appliedCoupon.type === 'percentage') discount = total * (appliedCoupon.amount / 100);
                               else discount = appliedCoupon.amount;
                             }
                             const finalPrice = Math.max(0, total - discount);
                             return (
                               <>
                                 {discount > 0 && (
                                   <div className="flex justify-between text-sm text-slate-500 mb-1 line-through">
                                      <span>Subtotal Asli</span>
                                      <span>{formatIDR(total)}</span>
                                   </div>
                                 )}
                                 <div className="flex justify-between items-end">
                                    <span>Total</span>
                                    <span className="text-emerald-600 text-2xl">{formatIDR(finalPrice)}</span>
                                 </div>
                               </>
                             );
                          })()}
                       </div>

                       <p className="text-center text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1 mt-4">
                         <ShieldCheck className="w-3 h-3" /> Transaksi Aman. Bayar ke Midtrans.
                       </p>

                       <MagneticButton type="submit" className="w-full mt-4 py-4 bg-slate-900 text-emerald-400 border-2 border-slate-900 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
                         <CreditCard className="w-5 h-5" /> Bayar Sekarang
                       </MagneticButton>
                     </form>
                   </div>
                 </motion.div>
              )}

              {checkoutStep === 'processing' && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-12 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-6"></div>
                  <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-900">Memproses...</h3>
                  <p className="text-sm font-bold text-slate-500 uppercase mt-2">Menyelesaikan Pembayaran Anda</p>
                </motion.div>
              )}

              {checkoutStep === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="flex-1 p-8 sm:p-12 pb-24 sm:pb-24 flex flex-col items-center bg-emerald-50 overflow-y-auto"
                >
                  <div className="w-20 h-20 bg-emerald-500 border-4 border-slate-900 rounded-full flex items-center justify-center mb-6 mt-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] shrink-0">
                    <CheckCircle className="w-10 h-10 text-slate-900" />
                  </div>
                  <h3 className="font-black text-3xl uppercase tracking-tighter text-slate-900 mb-2">Sukses!</h3>
                  <p className="text-sm font-bold text-slate-600 uppercase mb-8">Pembayaran Berhasil. Ini Akses Produk Anda.</p>
                  
                  <div className="w-full space-y-4 mb-8">
                    {purchasedItems.map(item => (
                      <div key={item.id} className="bg-white border-2 border-slate-900 p-4 rounded-2xl text-left shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                         <p className="font-black text-xs uppercase text-slate-500 mb-1">{item.name}</p>
                         <div className="bg-slate-100 p-3 rounded-lg border-2 border-dashed border-slate-300 font-medium text-sm break-all font-mono">
                           {item.secretContent}
                         </div>
                         <a href={item.secretContent} target="_blank" rel="noreferrer" className="mt-3 w-full py-2 bg-emerald-500 border-2 border-slate-900 text-slate-900 font-black text-xs uppercase flex justify-center items-center gap-1 rounded-xl hover:bg-emerald-400 transition-colors">
                           <Download className="w-4 h-4" /> Buka Akses / Download
                         </a>
                      </div>
                    ))}
                  </div>

                  {/* V5 Feature: Auto Affiliate Link */}
                  <div className="w-full bg-slate-900 text-white p-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-4 text-left relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full blur-[40px] opacity-20 pointer-events-none"></div>
                     <h4 className="font-black text-sm uppercase text-emerald-400 mb-1 flex items-center gap-2"><Users className="w-4 h-4" /> Program Afiliasi Otomatis</h4>
                     <p className="text-[10px] font-bold text-slate-300 uppercase mb-3 leading-relaxed">Anda sekarang afiliator kami! Bagikan link ini, dapatkan komisi 30% dari setiap pembelian yang menggunakan link Anda.</p>
                     <div className="flex items-center gap-2">
                        <div className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg flex-1 overflow-hidden">
                           <p className="text-xs font-mono text-emerald-200 truncate">https://lumina.app/ref/{customerInfo.name.toLowerCase().replace(/\s+/g,'-')}</p>
                        </div>
                        <button 
                           type="button"
                           onClick={() => {
                              navigator.clipboard.writeText(`https://lumina.app/ref/${customerInfo.name.toLowerCase().replace(/\s+/g,'-')}`);
                              alert('Link berhasil disalin!');
                           }}
                           className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-3 py-2 rounded-lg text-[10px] uppercase transition-colors shrink-0"
                        >
                           Copy
                        </button>
                     </div>
                  </div>

                  {/* V6 Feature: Digital Vault Magic Link */}
                  <div className="w-full bg-white p-4 rounded-2xl border-2 border-slate-300 mb-10 text-left flex items-start gap-4">
                     <div className="w-10 h-10 bg-slate-900 border-2 border-slate-900 rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                        <Briefcase className="w-5 h-5 text-emerald-400" />
                     </div>
                     <div>
                       <h4 className="font-black text-sm uppercase text-slate-900 mb-1">Digital Vault Anda Aktif!</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                         Kami telah mengirimkan <b className="text-emerald-600">Magic Link</b> ke <b className="text-slate-900">{customerInfo.email}</b>. 
                         Jika berganti perangkat, Anda tidak perlu daftar ulang. Cukup klik Magic Link dari email tersebut untuk membuka Digital Vault pribadi Anda secara permanen.
                       </p>
                     </div>
                  </div>

                  <button 
                    onClick={() => { setCheckoutProduct(null); setIsCheckingOutCart(false); }} 
                    className="w-full py-4 bg-slate-900 justify-center text-white rounded-xl font-black uppercase text-sm border-2 border-slate-900 hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center gap-2 mb-4 mt-auto"
                  >
                    <CheckCircle className="w-5 h-5" /> Selesai
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Resi dan link akses juga dikirim ke {customerInfo.email}</p>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEMBER AREA DRAWER */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex flex-col justify-end p-0 sm:p-4"
            onClick={() => setIsMemberModalOpen(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-4xl mx-auto flex flex-col h-[85vh] sm:h-[80vh] relative overflow-hidden rounded-t-3xl sm:rounded-3xl"
              style={loggedInUser?.isVIP ? { '--vip-glow-color': getVipGlowColor() } as React.CSSProperties : {}}
              onClick={(e) => e.stopPropagation()}
            >
              {loggedInUser?.isVIP ? (
                 <div className="absolute inset-[-50%] animate-[spin_4s_linear_infinite] z-0 opacity-50" style={{ backgroundImage: 'conic-gradient(from 90deg, transparent 0%, var(--vip-glow-color) 50%, transparent 100%)' }}></div>
              ) : null}
              
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-t-3xl sm:rounded-[1.4rem] flex flex-col w-full h-full overflow-hidden relative z-10 shadow-2xl border-t-2 border-slate-900 sm:border-2 m-0 sm:m-[2px]">
              <div className="bg-slate-900/95 dark:bg-black/95 text-white p-5 flex justify-between items-center shrink-0 border-b-2 border-slate-800">
                <h3 className="font-black text-lg uppercase tracking-wider flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-400 text-slate-900 flex items-center justify-center rounded-lg uppercase font-black text-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">L</div> LUMINA EXECUTIVE
                </h3>
                <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!loggedInUser ? (
                 <div className="flex-1 p-6 sm:p-12 flex flex-col items-center overflow-y-auto">
                   {memberStep === 'login' && (
                     <div className="w-full max-w-sm text-center my-auto py-8">
                       <div className="w-20 h-20 bg-slate-100 border-4 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                         <Star className="w-8 h-8 text-slate-900" />
                       </div>
                       <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-900 mb-2">Login Tanpa Password</h3>
                       <p className="text-sm font-bold text-slate-500 mb-8 uppercase tracking-wider">Masukkan email yang digunakan saat transaksi untuk memuat riwayat produk Anda.</p>
                       
                       <form onSubmit={handleMemberLogin} className="space-y-4 text-left">
                         <div>
                           <label className="block text-xs font-black uppercase text-slate-900 mb-2 text-center">Email Anda</label>
                           <input 
                             type="email" required
                             value={memberEmailInput}
                             onChange={e => setMemberEmailInput(e.target.value)}
                             className="w-full p-4 rounded-xl border-2 border-slate-200 outline-none focus:border-slate-900 transition-colors font-medium text-center text-sm" 
                             placeholder="john@example.com" 
                           />
                         </div>
                         <button type="submit" className="w-full py-4 bg-emerald-500 border-2 border-slate-900 text-slate-900 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                           Kirim Magic Link
                         </button>
                       </form>
                     </div>
                   )}
                   {memberStep === 'magic-sent' && (
                     <div className="w-full max-w-sm text-center animate-in fade-in duration-300 my-auto py-8">
                       <div className="w-20 h-20 bg-emerald-100 border-4 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Send className="w-8 h-8 text-emerald-600" />
                       </div>
                       <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-900 mb-2">Cek Inbox Anda</h3>
                       <p className="text-sm font-bold text-slate-500 mb-8 uppercase tracking-wider">Magic Link sedang dikirimkan ke <span className="text-slate-900">{memberEmailInput}</span>.</p>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
                         <div className="h-full bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]" style={{width: '100%'}}></div>
                       </div>
                       <p className="text-xs text-slate-400 mt-4">(Simulasi: Otomatis login dalam 2 detik...)</p>
                     </div>
                   )}
                 </div>
              ) : (
                 <div className="flex-1 flex flex-col overflow-hidden relative">
                   {/* Member Top Nav with Premium Glassmorphism */}
                   <div className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-white/20 dark:border-white/10 p-4 sm:p-6 shrink-0 flex flex-col relative overflow-hidden z-0">
                     {/* Dynamic Background Banner */}
                     {loggedInUser.bannerUrl ? (
                        <div className="absolute inset-0 z-[-1] opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${loggedInUser.bannerUrl})` }}></div>
                     ) : (
                        <div className={`absolute inset-0 z-[-1] opacity-20 ${loggedInUser.customBannerClass || 'bg-slate-400'} mix-blend-overlay`}></div>
                     )}
                     
                     <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10 w-full justify-between items-start">
                       <div className="flex items-center gap-4 flex-1 w-full relative">
                          <div className={`w-16 h-16 bg-emerald-500 text-slate-900 font-black text-2xl rounded-full flex items-center justify-center shrink-0 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${loggedInUser.isVIP ? 'vip-ring shadow-[0_0_15px_rgba(251,191,36,1)] ring-4 ring-amber-400/50' : ''}`} style={{ backgroundImage: loggedInUser.avatarUrl ? `url(${loggedInUser.avatarUrl})` : 'none', backgroundSize: 'cover' }}>
                             {!loggedInUser.avatarUrl && loggedInUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                             <div className="flex items-center gap-2">
                                <p className={`font-black text-xl uppercase truncate ${loggedInUser.isVIP ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300 drop-shadow-sm' : 'text-slate-900 dark:text-white'}`}>{loggedInUser.name}</p>
                                {loggedInUser.isVIP && (
                                   <div className="bg-gradient-to-r from-amber-400 to-amber-300 text-amber-950 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm shrink-0 flex items-center gap-1 border border-amber-200">
                                     <Star className="w-3 h-3 fill-current" /> VIP
                                   </div>
                                )}
                             </div>
                             <div className="flex items-center gap-2 mt-0.5 mb-1">
                               <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">{loggedInUser.email}</p>
                             </div>
                             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 opacity-80 flex items-center gap-1">
                               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span> Active: {loggedInUser.last_login ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(loggedInUser.last_login)) : 'Now'}
                             </p>
                          </div>
                       </div>

                       <div className="flex items-center gap-2 mt-3 sm:mt-0 flex-wrap sm:flex-col sm:items-end w-full sm:w-auto">
                             {!loggedInUser.isVIP && (
                                <button 
                                  onClick={() => {
                                    alert('Modul Langganan berjalan: Simulasi redirect ke payment gateway.');
                                    setLoggedInUser({...loggedInUser, isVIP: true});
                                    setShowWinnerModal(true);
                                    setTimeout(() => setShowWinnerModal(false), 8000);
                                  }}
                                  className="inline-flex items-center px-4 py-2 sm:px-3 sm:py-1.5 bg-amber-400 text-amber-950 text-[10px] font-black uppercase rounded-lg border-b-2 border-amber-600 hover:bg-amber-300 transition-colors shadow-[2px_2px_0px_0px_rgba(217,119,6,1)] shrink-0 gap-1 active:border-b-0 active:translate-y-[2px]"
                                >
                                  <Star className="w-3 h-3" /> Upgrade VIP
                                </button>
                             )}

                             {/* Activity Status Selector */}
                             <div className="relative inline-block shrink-0 flex-1 sm:flex-none">
                               <select 
                                 value={loggedInUser.current_status || 'Free Time'}
                                 onChange={(e) => setLoggedInUser({...loggedInUser, current_status: e.target.value})}
                                 className="w-full appearance-none bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase rounded-lg px-3 py-2 sm:py-1.5 pr-6 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer shadow-sm transition-colors"
                               >
                                 <option value="Sedang Bekerja">🟢 Sedang Bekerja</option>
                                 <option value="Sedang Sibuk">🔴 Sedang Sibuk</option>
                                 <option value="Free Time">🔵 Free Time</option>
                                 <option value="AFK">🌙 AFK</option>
                               </select>
                               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                 <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                               </div>
                             </div>
                       </div>
                     </div>
                   </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 p-4 sm:p-6 bg-transparent overflow-y-auto pb-48 relative">
                      <div className="absolute -bottom-10 -right-10 text-[250px] font-black text-slate-900 opacity-[0.02] pointer-events-none select-none z-0 leading-none">L</div>

                      {/* Gamification Stats: Level & XP */}
                      <div className="relative z-10 mb-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-white/5 shadow-sm flex flex-col gap-3">
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Kasta Lumina</p>
                               <p className={`font-black text-lg tracking-tight ${loggedInUser.level === 'Lumina God' ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-600 drop-shadow-sm' : 'text-slate-900 dark:text-white'}`}>{loggedInUser.level || 'Novice'}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Profile Views</p>
                               <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">👀 {loggedInUser.profileViews || 0}</p>
                            </div>
                         </div>
                         <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${Math.min((loggedInUser.xp || 0) / 1000 * 100, 100)}%` }}></div>
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-right text-slate-400 dark:text-slate-500">{loggedInUser.xp || 0} / 1000 XP</p>
                      </div>

                      {/* Menu Bento Grid */}
                      <nav className="grid grid-cols-4 gap-2 sm:gap-3 relative z-10 mb-6">
                        <button 
                          onClick={() => setActiveMemberTab('purchases')}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border outline-none ${activeMemberTab === 'purchases' ? 'bg-slate-900 border-slate-900 dark:bg-emerald-500 dark:border-emerald-500 text-emerald-400 dark:text-slate-900 shadow-md scale-[0.98]' : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/80 active:scale-95 shadow-sm'}`}
                        >
                          <ListIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                          <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest">Riwayat</span>
                        </button>
                        <button 
                          onClick={() => setActiveMemberTab('coupons')}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border outline-none ${activeMemberTab === 'coupons' ? 'bg-slate-900 border-slate-900 dark:bg-amber-400 dark:border-amber-400 text-amber-400 dark:text-slate-900 shadow-md scale-[0.98]' : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/80 active:scale-95 shadow-sm'}`}
                        >
                          <TicketIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                          <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest">Kupon</span>
                        </button>
                        <button 
                          onClick={() => setActiveMemberTab('affiliate')}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border outline-none ${activeMemberTab === 'affiliate' ? 'bg-slate-900 border-slate-900 dark:bg-blue-400 dark:border-blue-400 text-blue-400 dark:text-slate-900 shadow-md scale-[0.98]' : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/80 active:scale-95 shadow-sm'}`}
                        >
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                          <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest">Afiliasi</span>
                        </button>
                        <button 
                          onClick={() => setActiveMemberTab('settings')}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border outline-none ${activeMemberTab === 'settings' ? 'bg-slate-900 border-slate-900 dark:bg-slate-100 dark:border-slate-100 text-white dark:text-slate-900 shadow-md scale-[0.98]' : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/80 active:scale-95 shadow-sm'}`}
                        >
                          <Settings className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                          <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest">Pengaturan</span>
                        </button>
                      </nav>

                      {/* Content Area within Scrollable Bounds */}
                     {activeMemberTab === 'purchases' && (
                       <div className="animate-in fade-in duration-300">
                         <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6 border-b-4 border-slate-900 dark:border-white/20 pb-4">Akses Produk Saya</h2>
                         
                         {allPurchases.filter(p => p.email.toLowerCase() === loggedInUser.email.toLowerCase()).length === 0 ? (
                           <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
                             <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                             <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Belum ada pembelian.</p>
                             <button onClick={() => setIsMemberModalOpen(false)} className="mt-6 font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest text-xs underline">Jelajahi Etalase</button>
                           </div>
                         ) : (
                           <div className="space-y-6">
                             {allPurchases.filter(p => p.email.toLowerCase() === loggedInUser.email.toLowerCase()).map((record, i) => (
                               <div key={i} className="border-2 border-slate-900 p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden bg-white">
                                  <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-4">
                                     <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Order ID: #{Math.random().toString().substr(2,6)}</p>
                                        <p className="text-xs font-bold text-slate-900 mt-1">{record.date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                     </div>
                                     <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-lg border-2 border-emerald-900">
                                       Lunas & Aktif
                                     </div>
                                  </div>
                                  <div className="space-y-4">
                                    {record.products.map(item => (
                                      <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                         <p className="font-black text-sm uppercase text-slate-900 mb-2">{item.name}</p>
                                         <div className="p-3 bg-white border-2 border-dashed border-slate-300 rounded-lg font-mono text-xs break-all selection:bg-emerald-200">
                                           {item.secretContent}
                                         </div>
                                         <button onClick={() => {
                                           // [SECURITY MOCK] Proteksi File Download Inspect Elements
                                            if (item.isPremiumOnly && !loggedInUser?.isVIP) {
                                               alert("HTTP 403 Forbidden. Status Kasta Anda Tidak Mencukupi Untuk Resource Ini. JWT Token Server Menolak Akses!");
                                               return;
                                            }
                                            window.open(item.secretContent, '_blank');
                                         }} className="mt-3 inline-flex px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-500 hover:text-slate-900 transition-colors gap-2 items-center">
                                           <Download className="w-3 h-3" /> Download / Buka Akses
                                         </button>
                                      </div>
                                    ))}
                                  </div>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     )}

                     {activeMemberTab === 'affiliate' && (
                       <div className="animate-in fade-in duration-300">
                         <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6 border-b-4 border-slate-900 dark:border-white/20 pb-4">Program Afiliasi</h2>
                         <div className="bg-emerald-50 border-2 border-emerald-900 p-6 sm:p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-center mb-8 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-emerald-200/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none"></div>
                           <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full border-2 border-slate-900 flex items-center justify-center -rotate-12 uppercase font-black text-[10px] text-emerald-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">💎</div>
                           <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter mb-2 relative z-10">Dapatkan 30% Auto-Cuan!</h3>
                           <p className="text-sm font-bold text-emerald-800 mb-6 max-w-sm mx-auto uppercase tracking-wide relative z-10">Raih komisi instan untuk setiap penjualan yang menggunakan link eksklusif Lumina Anda.</p>
                           
                           <div className="bg-white p-2 rounded-xl border-2 border-emerald-900 flex items-center justify-between mx-auto max-w-md shadow-inner relative z-10">
                               <p className="font-mono text-xs text-slate-500 px-2 truncate flex-1 text-left">https://lumina.app/ref/{loggedInUser.name.toLowerCase().replace(/\s+/g,'-')}</p>
                               <button 
                                 onClick={() => {
                                   navigator.clipboard.writeText(`https://lumina.app/ref/${loggedInUser.name.toLowerCase().replace(/\s+/g,'-')}`);
                                   alert('Link berhasil disalin!');
                                 }}
                                 className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg font-black uppercase text-[10px] hover:bg-emerald-400 transition-colors border-2 border-transparent"
                               >
                                 Copy Link
                               </button>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all rounded-2xl text-center flex flex-col justify-center cursor-default">
                               <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatIDR(loggedInUser.affiliateEarnings || 0)}</p>
                               <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-widest">Saldo Tersedia (MRR)</p>
                            </div>
                            <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all rounded-2xl text-center flex flex-col justify-center cursor-default">
                               <p className="text-3xl font-black text-slate-900 tracking-tighter">{loggedInUser.totalReferrals || 0}</p>
                               <p className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-widest">Total Referral Sukses</p>
                            </div>
                         </div>
                         
                         <div className="bg-slate-100 p-6 rounded-2xl border-2 border-slate-200 text-center">
                            <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">Payout & Store Credit</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                               <button 
                                 onClick={() => alert('Simulasi: Saldo diubah menjadi Voucher Diskon untuk checkout selanjutnya.')}
                                 className="px-6 py-3 bg-slate-900 flex-1 justify-center flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest border-2 border-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
                               >
                                 <CreditCard className="w-4 h-4" /> Ubah ke Store Credit
                               </button>
                               <button 
                                 onClick={() => alert('Simulasi: Request payout ke rekening berhasil dikirim ke Admin.')}
                                 className="px-6 py-3 bg-white flex-1 justify-center flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest border-2 border-slate-900 rounded-xl hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
                               >
                                 <Send className="w-4 h-4" /> Tarik ke e-Wallet
                               </button>
                            </div>
                         </div>
                       </div>
                     )}

                     {activeMemberTab === 'coupons' && (
                       <div className="animate-in fade-in duration-300">
                         <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6 border-b-4 border-slate-900 dark:border-white/20 pb-4">L-Market & Kupon</h2>
                         
                         {/* L-Market Section */}
                         <div className="mb-10">
                           <div className="flex justify-between items-center mb-4">
                             <h3 className="font-black text-lg uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><ShoppingCart className="text-amber-500 w-5 h-5"/> L-Market Poin Khusus</h3>
                             <div className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-black text-xs border-2 border-amber-300">
                               Saldo: {loggedInUser?.lPoints || 0} LP
                             </div>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             {/* Item 1 */}
                             <div className="bg-white border-2 border-slate-900 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center text-center">
                               <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-3">
                                 <TicketIcon className="text-rose-500 w-6 h-6" />
                               </div>
                               <h4 className="font-black text-sm uppercase text-slate-900 mb-1">Diskon VIP (90%)</h4>
                               <p className="font-bold text-[10px] text-slate-500 mb-4 line-clamp-2">Kupon khusus potongan harga produk VIP di katalog.</p>
                               <button 
                                 onClick={() => alert('Voucher Diskon berhasil di-redeem! (Simulasi)')}
                                 className="mt-auto w-full bg-slate-900 text-white font-black text-xs uppercase py-2 rounded-lg hover:bg-slate-800"
                               >
                                 Redeem (5.000 LP)
                               </button>
                             </div>
                             {/* Item 2 */}
                             <div className="bg-white border-2 border-slate-900 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center text-center">
                               <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                                 <Star className="text-amber-500 w-6 h-6" />
                               </div>
                               <h4 className="font-black text-sm uppercase text-slate-900 mb-1">Banner "Hellfire"</h4>
                               <p className="font-bold text-[10px] text-slate-500 mb-4 line-clamp-2">Unlock banner kosmetik eksklusif dengan efek api.</p>
                               <button 
                                 onClick={() => alert('Banner Hellfire terbuka! (Simulasi)')}
                                 className="mt-auto w-full bg-slate-900 text-white font-black text-xs uppercase py-2 rounded-lg hover:bg-slate-800"
                               >
                                 Redeem (10.000 LP)
                               </button>
                             </div>
                             {/* Item 3 */}
                             <div className="bg-white border-2 border-slate-900 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center text-center">
                               <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                 <Volume2 className="text-emerald-500 w-6 h-6" />
                               </div>
                               <h4 className="font-black text-sm uppercase text-slate-900 mb-1">Custom BGM</h4>
                               <p className="font-bold text-[10px] text-slate-500 mb-4 line-clamp-2">Ganti musik profil Anda sesuai selera.</p>
                               <button 
                                 onClick={() => alert('Unlock BGM Custom berhasil! (Simulasi)')}
                                 className="mt-auto w-full bg-slate-900 text-white font-black text-xs uppercase py-2 rounded-lg hover:bg-slate-800"
                               >
                                 Redeem (15.000 LP)
                               </button>
                             </div>
                           </div>
                         </div>

                         {/* Active Coupons Section */}
                         <h3 className="font-black text-lg uppercase tracking-tight text-slate-900 dark:text-white mb-4 flex items-center gap-2"><CreditCard className="text-emerald-500 w-5 h-5"/> Kupon Aktif</h3>
                         {loggedInUser.isVIP ? (
                           <div className="bg-amber-50 border-2 border-amber-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] flex flex-col sm:flex-row gap-6 items-center">
                              <div className="w-16 h-16 bg-white border-4 border-amber-500 rounded-full flex items-center justify-center shrink-0">
                                <TicketIcon className="w-8 h-8 text-amber-500" />
                              </div>
                              <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-black text-xl text-slate-900 uppercase">Kupon VIP Instan (Seluruh Produk)</h3>
                                <p className="font-bold text-sm text-slate-600 mt-1">Gunakan kode di bawah ini pada saat checkout untuk diskon 99%.</p>
                                <div className="mt-4 inline-block text-left">
                                   <ScratchCard code="VIP-ELITE-99" />
                                </div>
                              </div>
                           </div>
                         ) : (
                           <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
                             <TicketIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                             <h3 className="font-black text-xl text-slate-900 uppercase">Belum Ada Kupon</h3>
                             <p className="font-bold text-slate-500 text-sm mt-2 max-w-sm mx-auto mb-6">Upgrade ke VIP atau beli di L-Market untuk mendapatkan kupon.</p>
                           </div>
                         )}
                       </div>
                     )}

                     {activeMemberTab === 'settings' && (
                       <div className="animate-in fade-in duration-300">
                         <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2 border-b-4 border-slate-900 dark:border-white/20 pb-4">Pengaturan & Preferensi</h2>
                        
                        <div className="space-y-8 mt-6 mb-8">
                            {/* Audio & Visual Options */}
                            <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
                                <h3 className="font-black text-lg uppercase text-slate-900 mb-4 flex items-center gap-2 relative z-10"><Volume2 className="w-5 h-5 text-emerald-500" /> Sonic Branding & Audio</h3>
                                <p className="text-sm font-bold text-slate-600 mb-4 relative z-10">Lumina Chill BGM (No Mute). Sesuaikan volume sesuai kenyamanan Anda.</p>
                                
                                <div className="space-y-4 relative z-10">
                                  <div>
                                    <label className="block text-xs font-black uppercase text-slate-900 mb-4 flex justify-between">Volume Musik <span>{Math.round(bgmVolume * 100)}%</span></label>
                                    <input 
                                      type="range" 
                                      min="0" max="100" 
                                      value={bgmVolume * 100}
                                      onChange={(e) => setBgmVolume(parseInt(e.target.value) / 100)}
                                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                                    />
                                  </div>
                                </div>
                            </div>
                        </div>

                         {loggedInUser.isVIP ? (
                           <div className="space-y-8 mt-6">
                             {/* Styling Kosmetik Akun */}
                             <div className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
                                <h3 className="font-black text-lg uppercase text-slate-900 mb-4 flex items-center gap-2 relative z-10"><Star className="w-5 h-5 text-amber-500" /> Profil Mewah (Sampul & Avatar)</h3>
                                <p className="text-sm font-bold text-slate-600 mb-4 relative z-10">Ubah Sampul belakang Profil Anda agar semakin mendominasi layar.</p>
                                
                                <div className="space-y-4 relative z-10">
                                  <div>
                                    <label className="block text-xs font-black uppercase text-slate-900 mb-2">Pilih Template Banner Profil</label>
                                    <div className="grid grid-cols-3 gap-2">
                                      {/* Normal Banners */}
                                      <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'bg-emerald-100', bannerUrl: ''})} className="h-16 rounded-lg bg-emerald-100 border-2 border-slate-200 hover:border-slate-900"></button>
                                      <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'bg-sky-100', bannerUrl: ''})} className="h-16 rounded-lg bg-sky-100 border-2 border-slate-200 hover:border-slate-900"></button>
                                      <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'bg-rose-100', bannerUrl: ''})} className="h-16 rounded-lg bg-rose-100 border-2 border-slate-200 hover:border-slate-900"></button>

                                      {/* VIP Banners */}
                                      {loggedInUser.isVIP && (
                                        <>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-unicorn', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-unicorn border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded">Unicorn</span></button>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-liquid', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-liquid border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded">Liquid Aurora</span></button>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-matrix', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-matrix border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded">Matrix Rain</span></button>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-starfield', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-starfield border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded">Starfield</span></button>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-synthwave', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-synthwave border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded z-10">Synthwave</span></button>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-plasma', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-plasma border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded">Plasma</span></button>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-gold', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-gold border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded z-10">Golden</span></button>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-holographic', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-holographic border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded">Hologram</span></button>
                                          <button onClick={() => setLoggedInUser({...loggedInUser, customBannerClass: 'vip-banner-fire', bannerUrl: ''})} className="h-20 rounded-xl vip-banner-fire border-2 border-amber-400 hover:border-amber-600 relative overflow-hidden"><span className="absolute bottom-1 right-1 text-[8px] font-black text-white bg-black/50 px-1 rounded">Hellfire</span></button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-black uppercase text-slate-900 mb-2 mt-4">Username</label>
                                    <div className="flex bg-slate-50 border-2 border-slate-200 rounded-xl focus-within:border-emerald-500 overflow-hidden outline-none">
                                      <input 
                                        type="text" 
                                        value={loggedInUser.name}
                                        onChange={e => {
                                          const newName = e.target.value;
                                          setLoggedInUser({...loggedInUser, name: newName});
                                          // Cascade to community threads
                                          setCommunityThreads(threads => threads.map(t => {
                                            const updatedThread = t.authorEmail === loggedInUser.email ? {...t, authorName: newName} : t;
                                            const updatedReplies = t.replies.map(r => r.authorName === loggedInUser.name ? {...r, authorName: newName} : r);
                                            return {...updatedThread, replies: updatedReplies};
                                          }));
                                        }}
                                        className="w-full p-3 font-black text-sm bg-transparent outline-none" 
                                      />
                                      <div className="p-3 flex items-center justify-center bg-slate-100 text-slate-500"><Plus className="w-4 h-4 rotate-45" /></div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-black uppercase text-slate-900 mb-2 mt-4">Avatar Profile</label>
                                    <AvatarDropzone onDrop={(url) => setLoggedInUser({...loggedInUser, avatarUrl: url})} />
                                  </div>
                                </div>
                             </div>

                             {/* Engine of Themes */}
                             <div className="bg-slate-900 border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-white">
                                <h3 className="font-black text-lg uppercase text-emerald-400 mb-4 flex items-center gap-2"><Sun className="w-5 h-5" /> Mode Kosmik</h3>
                                <p className="text-sm font-bold text-slate-400 mb-6">Pilih spektrum antarmuka eksklusif yang hanya tersedia untuk Anggota VIP.</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                   <button 
                                     onClick={() => handleSetTheme('default')}
                                     className={`p-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest transition-all ${loggedInUser.activeTheme === 'default' || !loggedInUser.activeTheme ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500'}`}
                                   >
                                     Klasik
                                   </button>
                                   <button 
                                     onClick={() => handleSetTheme('night-synced')}
                                     className={`p-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest transition-all ${loggedInUser.activeTheme === 'night-synced' ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500'}`}
                                   >
                                     <Moon className="w-4 h-4 mx-auto mb-1 inline" /> Dynamic Time
                                   </button>
                                   <button 
                                     onClick={() => handleSetTheme('party-mode')}
                                     className={`p-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest transition-all ${loggedInUser.activeTheme === 'party-mode' ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500'}`}
                                   >
                                     <Star className="w-4 h-4 mx-auto mb-1 inline" /> Party Glow
                                   </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-wider leading-relaxed">Dynamic Time = Siang ke Langit Malam Starry Galaxy (via Jam OS Anda) <br/> Party Glow = RGB breathing gradient (Hue Rotation 15 detik)</p>
                                
                                <div className="mt-8 border-t-2 border-slate-700 pt-6">
                                  <h4 className="font-black text-sm uppercase text-emerald-400 mb-4 px-2"><Edit3 className="w-5 h-5 inline mr-1" /> Tipografi VIP</h4>
                                  <p className="text-sm font-bold text-slate-400 mb-4 px-2">Ubah font seluruh aplikasi untuk pengalaman visual yang personal.</p>
                                  <div className="bg-slate-800 border-2 border-slate-700 p-2 rounded-xl focus-within:border-emerald-500 transition-colors mx-2 mb-8">
                                   <select 
                                     className="w-full bg-transparent outline-none text-slate-200 font-bold p-2 cursor-pointer"
                                     value={loggedInUser.activeFont || 'Inter'}
                                     onChange={(e) => setLoggedInUser({...loggedInUser, activeFont: e.target.value as any})}
                                   >
                                     <option value="Inter" className="bg-slate-800">Inter (Sleek & Modern)</option>
                                     <option value="Playfair Display" className="bg-slate-800">Playfair Display (Editorial Klasik)</option>
                                     <option value="JetBrains Mono" className="bg-slate-800">JetBrains Mono (Hacker/Cyber)</option>
                                     <option value="Plus Jakarta Sans" className="bg-slate-800">Plus Jakarta Sans (Friendly & Tech)</option>
                                   </select>
                                  </div>
                                  <h4 className="font-black text-sm uppercase mb-4 px-2 text-emerald-400">Koleksi Warna Sultan (Solid Modes)</h4>
                                  <div className="flex gap-4 px-2">
                                     <button onClick={() => handleSetTheme('ruby')} className={`w-12 h-12 rounded-full bg-rose-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${loggedInUser.activeTheme === 'ruby' ? 'ring-4 ring-offset-2 ring-rose-500' : ''}`} title="Ruby"></button>
                                     <button onClick={() => handleSetTheme('violet')} className={`w-12 h-12 rounded-full bg-violet-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${loggedInUser.activeTheme === 'violet' ? 'ring-4 ring-offset-2 ring-violet-500' : ''}`} title="Violet"></button>
                                     <button onClick={() => handleSetTheme('royal-blue')} className={`w-12 h-12 rounded-full bg-blue-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${loggedInUser.activeTheme === 'royal-blue' ? 'ring-4 ring-offset-2 ring-blue-600' : ''}`} title="Royal Blue"></button>
                                     <button onClick={() => handleSetTheme('matrix')} className={`w-12 h-12 rounded-full bg-emerald-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${loggedInUser.activeTheme === 'matrix' ? 'ring-4 ring-offset-2 ring-emerald-500' : ''}`} title="Matrix (Hijau)"></button>
                                  </div>
                                </div>
                             </div>
                           </div>
                         ) : (
                           <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 mt-6 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-[50px] opacity-20 pointer-events-none group-hover:scale-150 transition-transform"></div>
                             <Star className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                             <h3 className="font-black text-2xl text-slate-900 uppercase">Konten Eksklusif VIP</h3>
                             <p className="font-bold text-slate-500 text-sm mt-2 max-w-sm mx-auto mb-6">Akses kemampuan untuk Custom Profile Banner, Animated Gold Ring Avatar, Gradient Names & Exclusive Live Themes.</p>
                             <button 
                               onClick={() => {
                                 alert('Modul Langganan berjalan: Simulasi redirect ke payment gateway.');
                                 setLoggedInUser({...loggedInUser, isVIP: true});
                                 setShowWinnerModal(true);
                                 setTimeout(() => setShowWinnerModal(false), 8000);
                               }}
                               className="px-6 py-3 bg-slate-900 text-amber-400 font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 border-2 border-amber-400 shadow-[4px_4px_0px_0px_rgba(251,191,36,0.5)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                             >
                               Buka Kunci (Rp 150rb/bln)
                             </button>
                           </div>
                         )}
                       </div>
                     )}

                     {/* Logout Button (Moved to Bottom) */}
                     <div className="mt-8 mb-4">
                       <button onClick={handleLogout} className="w-full py-3 text-red-500 border-2 border-red-500/50 rounded-xl font-black uppercase text-sm hover:bg-red-500/10 hover:border-red-500 hover:text-red-600 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2">
                         <X className="w-5 h-5"/> Keluar
                       </button>
                     </div>
                   </div>
                   {/* Sticky Selesai Button */}
                   <div className="w-full bg-slate-50 border-t-2 border-slate-200 p-4 pb-28 sm:pb-6 mt-auto z-20 shrink-0">
                     <button onClick={() => setIsMemberModalOpen(false)} className="w-full py-4 bg-emerald-500 text-slate-900 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex justify-center items-center gap-2 border-2 border-slate-900">
                       <CheckCircle className="w-5 h-5"/> SELESAI
                     </button>
                   </div>
                 </div>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="mt-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-4">
          <div className="text-slate-900 text-center sm:text-left mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} Lumina. Hak Cipta Dilindungi.
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Secured</span>
          </div>
        </div>
      </footer>

      {/* LIVE CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-4 w-[340px] sm:w-[380px] h-[500px] max-h-[80vh] flex flex-col origin-bottom-right"
            >
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                    {chatMode === 'ai' ? <Bot className="w-5 h-5 text-slate-900" /> : <Briefcase className="w-5 h-5 text-slate-900" />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">{chatMode === 'ai' ? 'Lumina AI' : 'Owner Lumina'}</h3>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{chatMode === 'ai' ? 'Auto Responding' : 'Live Chat'}</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                     <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-slate-400" />
                     </div>
                     <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-[200px]">Halo! Ada yang bisa kami bantu hari ini?</p>
                  </div>
                ) : (
                  <>
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         {msg.sender === 'system' ? (
                           <div className="bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-full uppercase font-bold tracking-widest mx-auto my-2">
                             {msg.text}
                           </div>
                         ) : (
                           <div className={`max-w-[80%] p-3 rounded-2xl border-2 ${
                              msg.sender === 'user' 
                                ? 'bg-slate-900 border-slate-900 text-white rounded-br-sm' 
                                : 'bg-white border-slate-200 text-slate-800 rounded-bl-sm'
                            }`}>
                              <p className="text-sm font-medium">{msg.text}</p>
                           </div>
                         )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                         <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 rounded-bl-sm flex gap-1 items-center">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                         </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 bg-white border-t-2 border-slate-200">
                {chatMode === 'ai' && (
                  <button 
                    onClick={requestOwner}
                    className="w-full mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 text-center"
                  >
                    Ingin bicara dengan Admin/Owner?
                  </button>
                )}
                {chatBlockMessage ? (
                  <div className="bg-slate-200 text-slate-500 text-xs font-bold uppercase text-center p-3 rounded-xl border border-slate-300">
                    {chatBlockMessage}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, handleUserSendMessage)}
                      placeholder="Ketik pesan..."
                      className="flex-1 bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-slate-900 text-sm font-medium transition-colors"
                    />
                    <button 
                      onClick={handleUserSendMessage}
                      disabled={!chatInput.trim() || isTyping}
                      className="w-10 h-10 bg-emerald-500 border-2 border-slate-900 text-slate-900 rounded-xl flex flex-shrink-0 items-center justify-center hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-slate-900 border-2 border-slate-900 text-white rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 transition-all relative overflow-hidden group"
          aria-label="Toggle Chat"
        >
          {isChatOpen ? <X className="w-7 h-7 relative z-10" /> : <MessageCircle className="w-7 h-7 relative z-10" />}
          {!isChatOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full z-20"></span>
          )}
        </button>
      </div>

    </div>
  );
}
