// ============================================================
// API SERVICE — connects frontend to backend
// Place this file at: src/api.js
// ============================================================

const BASE_URL = "http://localhost:5000/api";

// ─── Auth Token Helpers ───────────────────────────────────
export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const removeToken = () => localStorage.removeItem("token");
export const getUser = () => JSON.parse(localStorage.getItem("user") || "null");
export const setUser = (u) => localStorage.setItem("user", JSON.stringify(u));
export const removeUser = () => localStorage.removeItem("user");

// ─── Base Fetch ───────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── Auth ─────────────────────────────────────────────────
export const api = {
  auth: {
    login: (email, password) =>
      request("/auth/login", { method: "POST", body: { email, password } }),
    register: (body) =>
      request("/auth/register", { method: "POST", body }),
  },

  // ─── Rooms ──────────────────────────────────────────────
  rooms: {
    getAll: () => request("/rooms"),
    create: (body) => request("/rooms", { method: "POST", body }),
    update: (id, body) => request(`/rooms/${id}`, { method: "PUT", body }),
    delete: (id) => request(`/rooms/${id}`, { method: "DELETE" }),
  },

  // ─── Students ───────────────────────────────────────────
  students: {
    getAll: () => request("/students"),
    create: (body) => request("/students", { method: "POST", body }),
    update: (id, body) => request(`/students/${id}`, { method: "PUT", body }),
    delete: (id) => request(`/students/${id}`, { method: "DELETE" }),
  },

  // ─── Payments ───────────────────────────────────────────
  payments: {
    getAll: () => request("/payments"),
    create: (body) => request("/payments", { method: "POST", body }),
    update: (id, body) => request(`/payments/${id}`, { method: "PUT", body }),
  },

  // ─── Events ─────────────────────────────────────────────
  events: {
    getAll: () => request("/events"),
    create: (body) => request("/events", { method: "POST", body }),
    update: (id, body) => request(`/events/${id}`, { method: "PUT", body }),
    delete: (id) => request(`/events/${id}`, { method: "DELETE" }),
  },

  // ─── Food ───────────────────────────────────────────────
  food: {
    getMenu: () => request("/food/menu"),
    updateMenu: (body) => request("/food/menu", { method: "POST", body }),
    getSubscriptions: () => request("/food/subscriptions"),
    createSubscription: (body) =>
      request("/food/subscriptions", { method: "POST", body }),
  },

  // ─── Cleaning ───────────────────────────────────────────
  cleaning: {
    getAll: () => request("/cleaning"),
    create: (body) => request("/cleaning", { method: "POST", body }),
    update: (id, body) => request(`/cleaning/${id}`, { method: "PUT", body }),
  },

  // ─── Sports ─────────────────────────────────────────────
  sports: {
    getAll: () => request("/sports"),
    create: (body) => request("/sports", { method: "POST", body }),
    issue: (body) => request("/sports/issue", { method: "POST", body }),
    return: (issueId) =>
      request(`/sports/return/${issueId}`, { method: "POST" }),
  },
};
