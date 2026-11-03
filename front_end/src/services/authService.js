/**
 * EVChargeHub Client Authentication & Security Service
 * Integrates with /api/auth backend endpoints for PBKDF2 hashed credentials,
 * real session management, profile synchronization, and password reset.
 */

import { saveOwnerProfile, getOwnerProfile } from "../data/ownerProfileData";

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

export function isAuthenticated() {
  return !!getStoredToken();
}

export function isOwner(role) {
  const r = (role || "").toLowerCase();
  return r === "owner" || r === "station_owner" || r === "cpo administrator";
}

export function isEVUser(role) {
  const r = (role || "").toLowerCase();
  return r === "user" || r === "ev_user";
}

/**
 * Returns authorization headers including bearer session token
 */
function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Get currently authenticated user from backend
 */
export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setStoredUserRole(data.user.role);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

        if (isOwner(data.user.role)) {
          syncLocalOwnerProfile(data.user);
        } else {
          localStorage.setItem(
            "evUserProfile",
            JSON.stringify({
              fullName: data.user.fullName,
              email: data.user.email,
              phone: data.user.phone,
              role: data.user.role,
            })
          );
        }
        return data.user;
      }
    } else if (res.status === 401) {
      // Invalidate expired session
      setStoredToken("");
      setStoredUserRole("");
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  } catch (err) {
    console.warn("Could not fetch user from auth backend:", err);
  }

  // If token exists, return cached user representation if available
  const cached = getStoredUser();
  if (cached) {
    return cached;
  }

  return null;
}

/**
 * Sync backend user with legacy local storage for component compatibility
 */
function syncLocalOwnerProfile(backendUser) {
  const current = getOwnerProfile();
  const updated = {
    ...current,
    displayName: backendUser.fullName || current.displayName,
    email: backendUser.email || current.email,
    phone: backendUser.phone || current.phone,
    businessName: backendUser.companyName || current.businessName,
    businessAddress: backendUser.businessAddress || current.businessAddress,
    profilePicture: backendUser.profilePicture || current.profilePicture || null,
    role: backendUser.role || current.role,
    lastLoginAt: backendUser.lastLoginAt,
    passwordChangedAt: backendUser.passwordChangedAt,
  };
  saveOwnerProfile(updated);
}

/**
 * Authenticate credentials via backend
 */
export async function loginUser(identifier, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, email: identifier, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to sign in.");
  }

  if (data.token) {
    setStoredToken(data.token);
  }

  if (data.user) {
    const role = data.user.role || "user";
    setStoredUserRole(role);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

    if (isOwner(role)) {
      syncLocalOwnerProfile(data.user);
    } else {
      localStorage.setItem(
        "evUserProfile",
        JSON.stringify({
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
        })
      );
    }
  }

  return data;
}

/**
 * Register a new user account with persistent role and PBKDF2 hash
 */
export async function registerUser({ fullName, email, phone, password, role }) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, phone, password, role }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create account.");
  }

  return data;
}

/**
 * Update Profile Information (Full name, phone, company, address, picture)
 */
export async function updateProfile(profileData) {
  const res = await fetch("/api/auth/profile", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update profile.");
  }

  if (data.user) {
    syncLocalOwnerProfile(data.user);
  }

  return data;
}

/**
 * Change Login Email with current password verification
 */
export async function changeLoginEmail(newEmail, currentPassword) {
  const res = await fetch("/api/auth/change-email", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ newEmail, currentPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to change login email.");
  }

  if (data.user) {
    syncLocalOwnerProfile(data.user);
  }

  return data;
}

/**
 * Change Account Password with cryptographic verification and requirements
 */
export async function changePassword({
  currentPassword,
  newPassword,
  confirmPassword,
  logoutOtherDevices = true,
}) {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
      logoutOtherDevices,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update password.");
  }

  if (data.user) {
    syncLocalOwnerProfile(data.user);
  }

  return data;
}

/**
 * Request password reset link / single-use token
 */
export async function requestPasswordReset(email) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to request password reset.");
  }

  return data;
}

/**
 * Verify whether reset token is valid and unexpired
 */
export async function verifyResetToken(token) {
  const res = await fetch("/api/auth/verify-reset-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { valid: false, error: data.error || "Invalid or expired reset token." };
  }

  return data;
}

/**
 * Set new password using verified token
 */
export async function resetPasswordWithToken({ token, newPassword, confirmPassword }) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to reset password.");
  }

  return data;
}

/**
 * Get active sessions for the authenticated user
 */
export async function getActiveSessions() {
  const res = await fetch("/api/auth/sessions", {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load active sessions.");
  }

  return await res.json();
}

/**
 * Invalidate all other sessions across devices
 */
export async function logoutOtherDevices() {
  const res = await fetch("/api/auth/sessions/logout-others", {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to terminate other sessions.");
  }

  return data;
}

/**
 * Sign out from current session
 */
export async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } catch (e) {
    console.warn("Logout endpoint error:", e);
  } finally {
    setStoredToken("");
    setStoredUserRole("");
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem("evUserProfile");
  }
}
