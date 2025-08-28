// Simple API client for the LMS client
// - Base URL: import.meta.env.VITE_API_URL or fallback
// - Auto attaches Authorization header from localStorage
// - Parses JSON, unwraps { status, data } shapes
// - On 401, clears auth and redirects to /login

function resolveBaseUrl() {
  const hasVite = typeof import.meta !== "undefined" && import.meta.env;
  const raw = hasVite ? import.meta.env.VITE_API_URL : undefined;

  if (raw && typeof raw === "string") {
    // Support comma-separated list for multi-environment setups
    const candidates = raw
      .split(",")
      .map((s) => s.trim().replace(/\/$/, ""))
      .filter(Boolean);

    if (candidates.length === 1) return candidates[0];

    if (typeof window !== "undefined" && window.location) {
      const host = window.location.hostname;
      const match = candidates.find((u) => {
        try {
          const url = new URL(u);
          return url.hostname === host;
        } catch {
          return false;
        }
      });
      return match || candidates[0];
    }
    return candidates[0];
  }
  return "http://localhost:3000/api";
}

const BASE_URL = resolveBaseUrl();

function getToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const token = getToken();
  const url = `${BASE_URL}/${String(path).replace(/^\//, "")}`;

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try to parse JSON safely
  let data;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text().catch(() => null);
  }

  if (res.status === 401) {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch {
      // Ignore errors
    }
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  // Unwrap common API shapes
  if (data && typeof data === "object") {
    if (data.status === "success" && "data" in data) return data.data;
    if ("data" in data) return data.data;
  }
  return data;
}

export const api = {
  baseUrl: BASE_URL,
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body }),
  del: (path, body, options) =>
    request(path, { ...options, method: "DELETE", body }),
};

// Multipart/form-data helpers (do not JSON.stringify and do not set Content-Type)
async function requestForm(path, { method = "POST", headers = {}, formData } = {}) {
  const token = getToken();
  const url = `${BASE_URL}/${String(path).replace(/^\//, "")}`;

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: formData,
  });

  let data;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text().catch(() => null);
  }

  if (res.status === 401) {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch {}
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  if (data && typeof data === "object") {
    if (data.status === "success" && "data" in data) return data.data;
    if ("data" in data) return data.data;
  }
  return data;
}

api.postForm = (path, formData, options) => requestForm(path, { ...options, method: "POST", formData });
api.putForm = (path, formData, options) => requestForm(path, { ...options, method: "PUT", formData });
