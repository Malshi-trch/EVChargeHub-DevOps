/**
 * Centralized API Client for EVChargeHub.
 * Connects React Vite frontend to the Spring Boot backend REST APIs (http://localhost:8080).
 * Handles token injection, 401 session expiration, 403 authorization failures, and error normalization.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

const AUTH_TOKEN_KEY = "evAuthToken";
const AUTH_ROLE_KEY = "evUserRole";
const AUTH_USER_KEY = "evCurrentUser";

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getStoredUserRole() {
  return localStorage.getItem(AUTH_ROLE_KEY) || "";
}

export function setStoredUserRole(role) {
  if (role) {
    localStorage.setItem(AUTH_ROLE_KEY, role);
  } else {
    localStorage.removeItem(AUTH_ROLE_KEY);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem("evUserProfile");
}

/**
 * Normalizes Spring Boot error responses into clean, user-friendly messages.
 */
function extractErrorMessage(data, status) {
  if (!data) {
    if (status === 401) return "Session expired or invalid credentials. Please log in.";
    if (status === 403) return "Access denied. You do not have permission to perform this action.";
    if (status === 404) return "Requested resource was not found.";
    if (status >= 500) return "Server error occurred. Please try again later.";
    return `Request failed with status ${status}`;
  }

  if (typeof data === "string") return data;
  if (data.message && typeof data.message === "string") return data.message;
  if (data.error && typeof data.error === "string") return data.error;
  if (data.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).filter(Boolean);
    if (messages.length > 0) return messages.join(". ");
  }

  return `Request failed (status ${status})`;
}

/**
 * Core HTTP Request function
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getStoredToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Also include X-User-Id header if user is cached (for controller fallbacks)
  const cachedUser = getStoredUser();
  if (cachedUser && cachedUser.id && !headers["X-User-Id"]) {
    headers["X-User-Id"] = String(cachedUser.id);
  }

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    console.error("Network communication error with backend:", netErr);
    throw new Error("Unable to connect to the backend server. Please verify the service is running on " + API_BASE_URL, { cause: netErr });
  }

  // Handle 401 Unauthorized (Expired or Invalid JWT)
  if (response.status === 401) {
    clearAuthStorage();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ev:session_expired"));
    }
    const errData = await response.json().catch(() => null);
    const msg = extractErrorMessage(errData, 401);
    throw new Error(msg);
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    const errData = await response.json().catch(() => null);
    const msg = extractErrorMessage(errData, 403);
    throw new Error(msg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = extractErrorMessage(responseData, response.status);
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
}

export const api = {
  get: (endpoint, headers = {}) => apiRequest(endpoint, { method: "GET", headers }),
  post: (endpoint, data, headers = {}) =>
    apiRequest(endpoint, { method: "POST", body: JSON.stringify(data), headers }),
  put: (endpoint, data, headers = {}) =>
    apiRequest(endpoint, { method: "PUT", body: JSON.stringify(data), headers }),
  patch: (endpoint, data, headers = {}) =>
    apiRequest(endpoint, { method: "PATCH", body: JSON.stringify(data), headers }),
  delete: (endpoint, headers = {}) => apiRequest(endpoint, { method: "DELETE", headers }),
  BASE_URL: API_BASE_URL,
};

export default api;

