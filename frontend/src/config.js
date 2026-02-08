export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export function api(path) {
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
