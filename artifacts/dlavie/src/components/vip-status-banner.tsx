import { useEffect, useState } from "react";
import {
  createSupabaseBrowserClient,
  hasSupabaseBrowserEnv,
} from "@/lib/supabase-client";
import type { Profile } from "@/lib/types";

export function VipStatusBanner() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv()) return;

    const supabase = createSupabaseBrowserClient();
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const token = data.session?.access_token;
        if (!token) return;
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setProfile(json.profile);
      })
      .catch(() => setProfile(null));
  }, []);

  const active = profile?.is_vip;
  return (
    <section className="dlavie-edge-flow relative mx-auto mt-8 max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#fff6cc]/90 via-white/84 to-[#f4d77a]/74 p-7 shadow-[0_30px_90px_rgba(140,106,18,.16)] ring-1 ring-amber-900/10 backdrop-blur-xl md:p-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-amber-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-12 h-52 w-52 rounded-full bg-[#dfff4f]/35 blur-3xl" />
      <div className="dlavie-diamond pointer-events-none absolute right-7 top-7 grid h-12 w-12 place-items-center rounded-2xl bg-white/65 text-2xl shadow-[0_14px_45px_rgba(180,124,28,.22)] ring-1 ring-amber-900/10">
        ◇
      </div>
      <p className="font-black uppercase tracking-[0.3em] text-amber-700">
        {active ? "DLAVIE PREMIUM ACTIVE" : "DLAVIE PREMIUM"}
      </p>
      <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950">
        {active ? "Premium Mode Aktif" : "Unlock Gold Premium Mode"}
      </h2>
      <p className="mt-3 max-w-2xl font-semibold leading-7 text-slate-600">
        {active
          ? "Kamu mendapat akses benefit premium, booster D-Points, dan tema eksklusif."
          : "Buka Premium Center untuk melihat status, reward, booster D-Points, dan benefit akun DLAVIE."}
      </p>
      <a
        className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 font-black text-[#ffe58a] shadow-[0_16px_35px_rgba(140,106,18,.18)] transition hover:-translate-y-1"
        href="/premium"
      >
        Buka Premium Center
      </a>
    </section>
  );
}
