/*
 * Both are baked in at build time. next.config.ts refuses a production build
 * without them, so the localhost fallbacks only ever apply in development.
 * The backend URL includes /api; trailing slashes are dropped.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api").replace(/\/+$/, "");
export const STOREFRONT_URL = (process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000").replace(/\/+$/, "");

const TOKEN_KEY = "smrithi.admin.token";

/**
 * ponytail: the JWT lives in localStorage and every call sends it as a bearer
 * token. Move to an httpOnly cookie + a route-handler proxy if this admin is
 * ever exposed to more than its single trusted operator.
 */
export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: { path?: (string | number)[]; message: string }[],
  ) {
    super(message);
  }

  /** "items.0.tint: Use a #rrggbb colour" lines the forms can show verbatim. */
  get fieldMessages(): string[] {
    return (this.details ?? []).map((d) => (d.path?.length ? `${d.path.join(".")}: ${d.message}` : d.message));
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isForm = init.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { "content-type": "application/json" }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  }).catch(() => {
    // fetch only rejects when no response came back: offline, the API asleep or down, or CORS.
    throw new ApiError(0, "Can't reach the server. Check your connection and try again in a moment.");
  });

  if (res.status === 401 && typeof window !== "undefined") {
    setToken(null);
    // A full reload clears every cached draft belonging to the expired session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
  }

  const payload = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, payload?.error ?? `Request failed (${res.status})`, payload?.details);
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
