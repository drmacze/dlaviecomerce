import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }

    const lastUserMessage = messages[messages.length - 1]?.text || "";
    
    // Inject Context-Aware Profiling
    let userContextString = "";
    if (userContext && userContext.name) {
      userContextString = `\n[KONTEKS PROFIL PELANGGAN]\nKamu berbicara dengan: ${userContext.name}.\nEmail: ${userContext.email}.\nStatus VIP: ${userContext.is_vip ? 'Ya (Sultan)' : 'Belum VIP'}.\nSaldo L-Points: ${userContext.l_points}.\nBerikan balasan yang sangat personal dan ramah!\n`;
    }

    const prompt = `Anda adalah AI Customer Service pintar untuk toko online "Lumina" yang menjual produk gaya hidup modern premium dan minimalis. 
    Jawab pertanyaan pelanggan dengan ramah, profesional, dan ringkas. Jangan terlalu panjang.
    ${userContextString}
    Pertanyaan pelanggan: ${lastUserMessage}
    
    Balasan Anda:`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    if (error.status === 503 || error.message?.includes("503") || error.message?.includes("UNAVAILABLE")) {
       return res.status(503).json({ error: "AI sedang sibuk karena permintaan tinggi. Silakan coba lagi sebentar lagi." });
    }
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// ZERO-CLICK AI: FORUM SUMMARIZER
app.post("/api/ai-summarize", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.length < 100) return res.json({ summary: null });

    const prompt = `Ringkas teks forum berikut menjadi HANYA 1 kalimat sangat pendek (maks 15 kata) yang informatif dan keren gaya startup lifestyle. Abaikan salam. 
    Teks: ${content}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ summary: response.text.trim() });
  } catch (error) {
    res.json({ summary: null });
  }
});

// ZERO-CLICK AI: SMART SUGGEST REPLY
app.post("/api/ai-suggest-reply", async (req, res) => {
  try {
    const { threadContent } = req.body;
    
    const prompt = `Berdasarkan isi postingan forum ini: "${threadContent}". 
    Berikan 3 pilihan balasan singkat (maks 4 kata per pilihan) yang sopan, seru, atau mendukung. 
    Kembalikan dalam format JSON array of strings saja. Contoh: ["Setuju banget!", "Tutor dong!", "Gokil bener"]`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text || "[]";
    const jsonMatch = text.match(/\[.*\]/);
    res.json({ suggestions: jsonMatch ? JSON.parse(jsonMatch[0]) : ["Sangat informatif!", "Terima kasih!", "Wah keren!"] });
  } catch (error) {
    res.json({ suggestions: ["Bagus banget!", "Thanks infonya!", "Izin bookmark"] });
  }
});

// ZERO-CLICK AI: ADMIN NARRATIVE INSIGHT
app.post("/api/admin-insight", async (req, res) => {
  try {
    const { stats } = req.body; // e.g. { salesToday: 5, activeUsers: 42, pointsClaimed: 120 }
    
    const prompt = `Bertindaklah sebagai Asisten AI Pribadi (Sekretaris Pintar) untuk Owner Lumina. 
    Berikan 1 paragraf singkat (30-40 kata) rangkuman performa hari ini menggunakan bahasa gaul profesional/anak startup Jaksel yang keren. 
    Data hari ini: Penjualan: ${stats.salesToday}, User Aktif: ${stats.activeUsers}, Poin Diklaim: ${stats.pointsClaimed}. 
    Berikan 1 saran spesifik (misal: lempar kupon, update stok).`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ insight: response.text.trim() });
  } catch (error) {
    res.json({ insight: "Sistem AI sedang bermeditasi, Komandan. Laporan manual menyarankan Anda tetap semangat!" });
  }
});

// SIMULASI: DATABASE RPC ATOMIC TRANSACTION
let atomicLock = false;
app.post("/api/handle_point_exchange", (req, res) => {
  const { currentPoints, cost, item } = req.body;
  
  if (atomicLock) {
    return res.status(429).json({ error: "Transaksi sedang diproses. Mohon tunggu..." });
  }
  
  atomicLock = true;
  
  setTimeout(() => { // Simulate processing
    if (currentPoints < cost) {
      atomicLock = false;
      return res.status(400).json({ error: "Saldo L-Points tidak mencukupi, transaksi dibatalkan." });
    }
    
    const newBalance = currentPoints - cost;
    atomicLock = false;
    
    res.json({ 
      success: true, 
      newBalance, 
      message: `Berhasil menukarkan poin untuk ${item}. Sisa saldo: ${newBalance} L-Points` 
    });
  }, 1000); // 1-second atomic transaction lock simulation
});

app.post("/api/generate-product", async (req, res) => {
  try {
    const { promptText } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }

    const aiPrompt = `Hasilkan 1 ide produk digital untuk toko "Lumina". 
    Permintaan spesifik (jika ada): ${promptText || "produk digital premium seperti template, ebook, atau preset minimalis"}.
    Kembalikan HANYA dalam format JSON murni: 
    {
      "name": "Nama Produk Murni",
      "price": 100000,
      "category": "Kategori",
      "image": "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=600&q=80",
      "secretContent": "https://lumina.id/akses-rahasia"
    }`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: aiPrompt,
    });
    
    let text = response.text || "";
    // Clean up markdown code blocks if any
    text = text.replace(/```json/g, "").replace(/```/g, "");
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const productObj = JSON.parse(jsonMatch[0]);
      res.json(productObj);
    } else {
      throw new Error("Invalid output format");
    }
  } catch (error: any) {
    console.error("Generate API error:", error);
    if (error.status === 503 || error.message?.includes("503") || error.message?.includes("UNAVAILABLE")) {
       return res.status(503).json({ error: "AI sedang sibuk karena permintaan tinggi. Silakan coba lagi sebentar lagi." });
    }
    res.status(500).json({ error: "Failed to generate product" });
  }
});

// PART 1: BUG FIXES & SOCIAL ENGINE
// Global memory store for coupons (simulating database for demo)
let dynamicCoupons = [
  { id: 101, code: "LUMINA-GAJIAN", type: "percentage", amount: 50, minPurchase: 100000, expDate: "2026-12-31", isActive: true, maxUse: 1000, currentUse: 42 },
  { id: 102, code: "VIP-ELITE-99", type: "fixed", amount: 99000, minPurchase: 200000, expDate: "2026-12-31", isActive: true, maxUse: 100, currentUse: 12 },
  { id: 103, code: "WELCOME-SULTAN", type: "percentage", amount: 10, minPurchase: 0, expDate: "2026-12-31", isActive: true, maxUse: 5000, currentUse: 110 }
];

app.post("/api/check-coupon", (req, res) => {
  const { code, cartTotal } = req.body;
  const found = dynamicCoupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
  
  if (!found) {
    return res.status(404).json({ error: "Kupon tidak ditemukan atau sudah tidak aktif." });
  }

  // Check Expiry
  if (new Date(found.expDate) < new Date()) {
    return res.status(400).json({ error: "Kupon sudah kedaluwarsa!" });
  }

  // Check Limit
  if (found.currentUse >= found.maxUse) {
    return res.status(400).json({ error: "Limit penggunaan kupon sudah habis." });
  }

  if (cartTotal < found.minPurchase) {
    return res.status(400).json({ error: `Minimal pembelian Rp ${found.minPurchase.toLocaleString()} diperlukan.` });
  }

  res.json({ coupon: found });
});

app.post("/api/add-coupon", (req, res) => {
  const { code, type, amount, minPurchase, maxUse, expDate } = req.body;
  
  if (!code || !type || amount === undefined) {
    return res.status(400).json({ error: "Data kupon tidak lengkap." });
  }

  const newCoupon = {
    id: Date.now(),
    code: code.toUpperCase(),
    type,
    amount: Number(amount),
    minPurchase: Number(minPurchase) || 0,
    maxUse: Number(maxUse) || 100,
    expDate: expDate || "2026-12-31",
    isActive: true,
    currentUse: 0
  };

  dynamicCoupons.push(newCoupon);
  console.log(`[COUPON] Added: ${newCoupon.code}`);
  res.json({ success: true, coupon: newCoupon });
});

app.post("/api/gifting", (req, res) => {
  const { senderEmail, receiverUsername, giftType, giftAmount, giftItem } = req.body;
  // Simulate transactional gifting
  console.log(`[GIFT] ${senderEmail} sent ${giftType === 'l_points' ? giftAmount + ' L-Points' : giftItem} to ${receiverUsername}`);
  res.json({ 
    success: true, 
    message: `Gift berupa ${giftType === 'l_points' ? giftAmount + ' L-Points' : giftItem} berhasil dikirim ke ${receiverUsername}!` 
  });
});

app.get("/api/mailbox/:email", (req, res) => {
  // Simulated mailbox fetch
  res.json({
    messages: [
      {
        id: 'msg_' + Date.now(),
        sender_name: 'Admin Lumina',
        title: 'Welcome Back!',
        content: 'Halo Sultan! Kami baru saja menambahkan 500 L-Points ke akun Anda sebagai hadiah loyalitas.',
        is_read: false,
        created_at: new Date()
      }
    ]
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
