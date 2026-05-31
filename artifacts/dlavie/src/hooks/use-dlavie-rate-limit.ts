import { useEffect, useMemo, useState } from "react";

export type DlavieRateState = {
  limit: number;
  used: number;
  remaining: number;
  blocked: boolean;
  resetAt: number;
  loading: boolean;
  recordLocalHit: () => void;
};

const LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;
const KEY = "dlavie-ai-hourly-usage";

function readHits() {
  if (typeof window === "undefined") return [] as number[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.map(Number).filter((time) => now - time < WINDOW_MS);
  } catch {
    return [];
  }
}

function writeHits(hits: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(hits));
}

export function useDlavieRateLimit(remoteUsed = 0, tier = "free"): DlavieRateState {
  const [hits, setHits] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHits(readHits());
    setLoading(false);
  }, []);

  const paid = tier !== "free";
  const used = paid ? Number(remoteUsed || 0) : Math.max(hits.length, remoteUsed || 0);
  const remaining = paid ? Math.max(300 - used, 0) : Math.max(LIMIT - used, 0);
  const resetAt = useMemo(() => {
    if (!hits.length) return Date.now() + WINDOW_MS;
    return Math.min(...hits) + WINDOW_MS;
  }, [hits]);

  return {
    limit: paid ? 300 : LIMIT,
    used,
    remaining,
    blocked: !paid && used >= LIMIT,
    resetAt,
    loading,
    recordLocalHit: () => {
      const next = [...readHits(), Date.now()];
      writeHits(next);
      setHits(next);
    },
  };
}
