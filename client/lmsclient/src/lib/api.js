// Simple API client for the LMS client
// - Base URL: import.meta.env.VITE_API_URL or fallback
// - Auto attaches Authorization header from localStorage
// - Parses JSON, unwraps { status, data } shapes
// - On 401, clears auth and redirects to /login

const BASE_URL =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "http://localhost:3000/api";

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
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
};
