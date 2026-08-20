const fallbackBaseUrl =
  typeof window !== "undefined" && import.meta.env.PROD
    ? window.location.origin
    : "";
const rawBaseUrl = import.meta.env.VITE_API_URL ?? fallbackBaseUrl;
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
const AUTH_STORAGE_KEY = "digicon-qms-auth";

type StoredAuthUser = {
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  username?: string;
  fullName?: string;
};

export function buildApiUrl(path: string) {
  if (!path) return API_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

function getSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const sessionId = parsed?.sessionId;
    if (typeof sessionId !== "string" || sessionId.trim().length === 0) {
      return null;
    }
    return sessionId;
  } catch {
    return null;
  }
}

export function getStoredAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const user = parsed?.user;
    if (!user || typeof user !== "object") {
      return null;
    }
    return user as StoredAuthUser;
  } catch {
    return null;
  }
}

export function getCurrentUserName(fallback = "Sistema") {
  const user = getStoredAuthUser();
  const rawName = user?.name || user?.fullName || user?.username;
  if (typeof rawName === "string") {
    const trimmed = rawName.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  if (typeof user?.email === "string") {
    const email = user.email.trim();
    if (email.length > 0) {
      return email.split("@")[0] || fallback;
    }
  }

  return fallback;
}

async function readErrorMessage(response: Response) {
  const text = await response.text();
  if (!text) {
    return response.statusText || "Request failed.";
  }
  try {
    const data = JSON.parse(text);
    return data?.message || data?.error || text;
  } catch {
    return text;
  }
}

export async function requestJson<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Authorization")) {
    const sessionId = getSessionId();
    if (sessionId) {
      headers.set("Authorization", `Bearer ${sessionId}`);
    }
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
