import { supabase } from "./supabase";

const domain = process.env.EXPO_PUBLIC_DOMAIN;

export function apiBase() {
  if (domain) return `https://${domain}/api`;
  return "/api";
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${apiBase()}${path}`, { ...options, headers });
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // @ts-ignore
    throw new Error(err?.error || `API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const rupiah = (value = 0) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
