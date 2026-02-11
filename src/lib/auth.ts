export interface User {
  id: string;
  email: string;
  name: string;
}

interface JwtPayload {
  exp: number;
  iat: number;
  [key: string]: unknown;
}

// ── In-memory token store ──────────────────────────────────────────
let accessToken: string | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

const TOKEN_KEY = "access_token";

/** Margin (in ms) before actual expiry to trigger a proactive refresh. */
const REFRESH_MARGIN_MS = 60_000; // 1 minute before expiry

// ── Helpers ────────────────────────────────────────────────────────

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

// ── Public API ─────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) {
    accessToken = stored;
  }
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearTokens(): void {
  accessToken = null;
  localStorage.removeItem(TOKEN_KEY);
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

export function isTokenExpired(token?: string | null): boolean {
  const t = token ?? getAccessToken();
  if (!t) return true;
  const payload = decodeJwt(t);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000 - REFRESH_MARGIN_MS;
}

export function scheduleRefresh(onRefresh: () => Promise<string | null>): void {
  if (refreshTimer) clearTimeout(refreshTimer);

  const token = getAccessToken();
  if (!token) return;

  const payload = decodeJwt(token);
  if (!payload?.exp) return;

  const expiresAt = payload.exp * 1000;
  const refreshAt = expiresAt - REFRESH_MARGIN_MS;
  const delay = Math.max(refreshAt - Date.now(), 0);

  refreshTimer = setTimeout(async () => {
    const newToken = await onRefresh();
    if (newToken) {
      setAccessToken(newToken);
      scheduleRefresh(onRefresh);
    } else {
      clearTokens();
    }
  }, delay);
}
