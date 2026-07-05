// ─────────────────────────────────────────────────────────────────
//  config/api.ts  |  Single source of truth for backend URLs
// ─────────────────────────────────────────────────────────────────
//
//  Every request in this app MUST go through API_BASE_URL below.
//  Never hardcode "http://localhost:5000" (or any other host) in a
//  component, hook, context, or util — import from here instead.
//
//  Set the real backend URL in an environment variable named
//  VITE_API_URL (see .env.example). It must NOT have a trailing
//  slash and must NOT include "/api" — that is appended per-call.
//
//    VITE_API_URL=https://your-backend.up.railway.app
//
// ─────────────────────────────────────────────────────────────────

const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl && import.meta.env.PROD) {
  // Fail loudly in production builds instead of silently calling localhost.
  // eslint-disable-next-line no-console
  console.error(
    '[config/api] VITE_API_URL is not set. Set it in your Netlify (or other) ' +
      'environment variables, e.g. VITE_API_URL=https://your-backend.up.railway.app'
  );
}

/**
 * Base URL of the backend API, with any trailing slash stripped.
 * Falls back to localhost only for local development when the env
 * variable has not been configured.
 */
export const API_BASE_URL: string = (rawApiUrl || 'http://localhost:5000').replace(/\/+$/, '');

/**
 * Build a full API endpoint URL.
 * Usage: apiUrl('/api/products') -> `${API_BASE_URL}/api/products`
 */
export const apiUrl = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

/**
 * Convert a backend-relative asset path (e.g. "/uploads/image.jpg")
 * returned by the database into an absolute URL pointing at the
 * Railway backend. Already-absolute URLs (http/https/data/blob) are
 * returned unchanged.
 */
export const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (/^(https?:)?\/\//i.test(trimmed) || /^(data|blob):/i.test(trimmed)) {
    return trimmed;
  }
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${normalized}`;
};
