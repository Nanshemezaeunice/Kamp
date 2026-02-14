export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
export const ENV = import.meta.env.VITE_ENV || "development";

export function api(path) {
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Enhanced fetch wrapper with error handling and logging
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} fetch response
 */
export async function apiFetch(url, options = {}) {
  const requestInit = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete requestInit.headers["Content-Type"];
  }

  if (ENV === "development") {
    console.log(`[API] ${requestInit.method} ${url}`);
  }

  try {
    const response = await fetch(url, requestInit);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(
        errorData?.message || `API Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response;
  } catch (error) {
    if (ENV === "development") {
      console.error(`[API Error] ${url}:`, error);
    }
    throw error;
  }
