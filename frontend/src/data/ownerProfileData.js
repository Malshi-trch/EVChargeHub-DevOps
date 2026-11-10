/**
 * EVChargeHub Owner Profile & Preferences Management
 * Single source of truth for owner profile: localStorage key "evOwnerProfile"
 * FRONTEND ONLY - Persists locally across sessions.
 */

export const OWNER_PROFILE_STORAGE_KEY = "evOwnerProfile";

export const defaultOwnerProfile = {
  displayName: "Station Owner",
  role: "CPO Administrator",
  email: "owner@evchargehub.lk",
  phone: "+94 77 123 4567",
  businessName: "EcoCharge Lanka Holdings",
  businessAddress: "No. 45, Galle Road, Colombo 03, Sri Lanka",
  language: "English (US)",
  timezone: "Asia/Colombo (UTC+05:30)",
  defaultPeriod: "7d",
  currency: "LKR",
  notifications: {
    newBooking: true,
    cancellations: true,
    chargerOffline: true,
    reviews: true,
  },
  lastUpdated: new Date().toISOString(),
};

/**
 * Loads owner profile from localStorage with fallback to defaultOwnerProfile
 */
export function getOwnerProfile() {
  try {
    const raw = localStorage.getItem(OWNER_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultOwnerProfile,
        ...parsed,
        notifications: {
          ...defaultOwnerProfile.notifications,
          ...(parsed.notifications || {}),
        },
      };
    }
  } catch (e) {
    console.warn("Failed to parse evOwnerProfile from localStorage:", e);
  }
  return { ...defaultOwnerProfile };
}

/**
 * Saves owner profile to localStorage and notifies listeners
 */
export function saveOwnerProfile(updatedProfile) {
  try {
    const merged = {
      ...defaultOwnerProfile,
      ...updatedProfile,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(OWNER_PROFILE_STORAGE_KEY, JSON.stringify(merged));
    
    // Dispatch custom event so the sidebar and other listening components update instantly
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("evOwnerProfileUpdated", { detail: merged })
      );
    }
    return merged;
  } catch (e) {
    console.error("Failed to save owner profile to localStorage:", e);
    return null;
  }
}
