import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import OwnerHeader from "../components/owner/OwnerHeader";
import {
  getCurrentUser,
  updateProfile,
  changeLoginEmail,
  changePassword,
  logoutOtherDevices,
  logout,
} from "../services/authService";
import {
  saveOwnerProfile,
  getOwnerProfile,
} from "../data/ownerProfileData";
import {
  UserIcon,
  ShieldIcon,
  BellIcon,
  SettingsIcon,
  CheckIcon,
  LockIcon,
  AlertCircleIcon,
  ClockIcon,
} from "../components/Icons";
import "./OwnerSettings.css";

/**
 * Resizes and compresses an uploaded profile photo using HTML5 Canvas
 * keeping it around ~40-60KB for instant loading and safe storage.
 */
function compressProfileImage(file, maxDimension = 320, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Selected file must be an image (PNG, JPG, JPEG, WEBP)."));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image file."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function OwnerSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // Active Tab from query param (profile | security | notifications | preferences)
  const activeTab = searchParams.get("tab") || "profile";

  // Global feedback notification
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', message: string }

  // -------------------------------------------------------------
  // TAB 1: PROFILE INFORMATION STATE
  // -------------------------------------------------------------
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    role: "CPO Administrator",
    businessName: "",
    businessAddress: "",
    profilePicture: null,
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // -------------------------------------------------------------
  // TAB 2A: CHANGE LOGIN EMAIL STATE
  // -------------------------------------------------------------
  const [currentLoginEmail, setCurrentLoginEmail] = useState("");
  const [newLoginEmail, setNewLoginEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailErrors, setEmailErrors] = useState({});
  const [isEmailChanging, setIsEmailChanging] = useState(false);

  // -------------------------------------------------------------
  // TAB 2B: CHANGE PASSWORD STATE
  // -------------------------------------------------------------
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    logoutOtherDevices: true,
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  // -------------------------------------------------------------
  // TAB 2C: ACCOUNT SECURITY & SESSIONS
  // -------------------------------------------------------------
  const [securityMeta, setSecurityMeta] = useState({
    lastLoginAt: null,
    passwordChangedAt: null,
    sessions: [],
  });
  const [showLogoutOthersModal, setShowLogoutOthersModal] = useState(false);
  const [isLoggingOutOthers, setIsLoggingOutOthers] = useState(false);

  // -------------------------------------------------------------
  // TAB 3 & 4: NOTIFICATIONS & ACCOUNT PREFERENCES
  // -------------------------------------------------------------
  const [preferences, setPreferences] = useState({
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
  });
  const [prefsDirty, setPrefsDirty] = useState(false);

  // Update URL query param on tab switch
  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
    setFeedback(null);
  };

  // Load user data on mount
  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((user) => {
        if (!isMounted) return;
        const local = getOwnerProfile();
        const initial = {
          displayName: user.fullName || local.displayName,
          email: user.email || local.email,
          phone: user.phone || local.phone,
          role: user.role || local.role || "CPO Administrator",
          businessName: user.companyName || local.businessName,
          businessAddress: user.businessAddress || local.businessAddress,
          profilePicture: user.profilePicture || local.profilePicture || null,
        };
        setProfileData(initial);
        setOriginalProfile(initial);
        setCurrentLoginEmail(user.email || local.email);

        setSecurityMeta({
          lastLoginAt: user.lastLoginAt || local.lastLoginAt,
          passwordChangedAt: user.passwordChangedAt || local.passwordChangedAt,
          sessions: user.sessions || [],
        });

        setPreferences({
          language: local.language || "English (US)",
          timezone: local.timezone || "Asia/Colombo (UTC+05:30)",
          defaultPeriod: local.defaultPeriod || "7d",
          currency: local.currency || "LKR",
          notifications: local.notifications || {
            newBooking: true,
            cancellations: true,
            chargerOffline: true,
            reviews: true,
          },
        });
      })
      .catch((err) => {
        console.warn("Could not load initial user settings:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for external profile updates
  useEffect(() => {
    const handleUpdate = () => {
      const fresh = getOwnerProfile();
      setProfileData((prev) => ({
        ...prev,
        displayName: fresh.displayName,
        phone: fresh.phone,
        businessName: fresh.businessName,
        businessAddress: fresh.businessAddress,
        profilePicture: fresh.profilePicture,
      }));
    };
    window.addEventListener("evOwnerProfileUpdated", handleUpdate);
    return () => window.removeEventListener("evOwnerProfileUpdated", handleUpdate);
  }, []);

  const showToast = (message, type = "success") => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // -------------------------------------------------------------
  // TAB 1 ACTIONS: PROFILE INFORMATION
  // -------------------------------------------------------------
  const isProfileDirty = useMemo(() => {
    if (!originalProfile) return false;
    return (
      profileData.displayName !== originalProfile.displayName ||
      profileData.phone !== originalProfile.phone ||
      profileData.businessName !== originalProfile.businessName ||
      profileData.businessAddress !== originalProfile.businessAddress ||
      profileData.profilePicture !== originalProfile.profilePicture
    );
  }, [profileData, originalProfile]);

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Selected image must be under 5MB in size.", "error");
      return;
    }

    try {
      const compressedDataUrl = await compressProfileImage(file, 320, 0.8);
      setProfileData((prev) => ({ ...prev, profilePicture: compressedDataUrl }));
      showToast("Profile photo loaded! Click 'Save Changes' to update across portal.", "info");
    } catch (err) {
      showToast(err.message || "Failed to process photo.", "error");
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfileData((prev) => ({ ...prev, profilePicture: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("Profile photo removed. Initials will be used for your avatar.", "info");
  };

  const validateProfileForm = () => {
    const errs = {};
    if (!profileData.displayName || !profileData.displayName.trim()) {
      errs.displayName = "Full display name is required.";
    }
    if (!profileData.phone || !profileData.phone.trim()) {
      errs.phone = "Contact phone number is required.";
    } else {
      const cleanPhone = profileData.phone.replace(/[\s\-()]/g, "");
      if (!/^(?:\+94|0)[0-9]{9,10}$/.test(cleanPhone)) {
        errs.phone = "Enter a valid Sri Lankan phone number (e.g. +94 77 123 4567).";
      }
    }
    if (!profileData.businessName || !profileData.businessName.trim()) {
      errs.businessName = "Company or Organization name is required.";
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      showToast("Please correct the highlighted fields before saving.", "error");
      return;
    }

    setIsProfileSaving(true);
    try {
      await updateProfile({
        fullName: profileData.displayName,
        phone: profileData.phone,
        companyName: profileData.businessName,
        businessAddress: profileData.businessAddress,
        profilePicture: profileData.profilePicture,
      });

      setOriginalProfile({ ...profileData });
      setIsProfileSaving(false);
      showToast("Profile information saved successfully! Sidebar and header updated.", "success");
    } catch (err) {
      setIsProfileSaving(false);
      showToast(err.message || "Failed to save profile changes.", "error");
    }
  };

  const handleCancelProfile = () => {
    if (originalProfile) {
      setProfileData({ ...originalProfile });
      setProfileErrors({});
      showToast("Unsaved profile changes reverted.", "info");
    }
  };

  // -------------------------------------------------------------
  // TAB 2A ACTIONS: CHANGE LOGIN EMAIL
  // -------------------------------------------------------------
  const validateEmailForm = () => {
    const errs = {};
    if (!newLoginEmail || !newLoginEmail.trim()) {
      errs.newEmail = "New email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLoginEmail.trim())) {
      errs.newEmail = "Please enter a valid email address.";
    } else if (newLoginEmail.trim().toLowerCase() === currentLoginEmail.toLowerCase()) {
      errs.newEmail = "New email must be different from your current login email.";
    }

    if (!emailCurrentPassword) {
      errs.currentPassword = "Your current password is required for security verification.";
    }
    setEmailErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangeEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmailForm()) return;

    setIsEmailChanging(true);
    setEmailErrors({});

    try {
      const res = await changeLoginEmail(newLoginEmail.trim(), emailCurrentPassword);
      setCurrentLoginEmail(newLoginEmail.trim().toLowerCase());
      setNewLoginEmail("");
      setEmailCurrentPassword("");
      setIsEmailChanging(false);
      showToast(res.message || "Login email updated successfully!", "success");
    } catch (err) {
      setIsEmailChanging(false);
      setEmailErrors({ server: err.message || "Failed to update login email." });
    }
  };

  const handleCancelEmail = () => {
    setNewLoginEmail("");
    setEmailCurrentPassword("");
    setEmailErrors({});
  };

  // -------------------------------------------------------------
  // TAB 2B ACTIONS: CHANGE PASSWORD
  // -------------------------------------------------------------
  const passwordRequirements = useMemo(() => {
    const pw = passwordState.newPassword;
    return {
      length: pw.length >= 12,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
      notCurrent: pw && pw !== passwordState.currentPassword,
    };
  }, [passwordState.newPassword, passwordState.currentPassword]);

  const passwordStrengthScore = useMemo(() => {
    const pw = passwordState.newPassword;
    if (!pw) return 0;
    let score = 0;
    if (passwordRequirements.length) score += 2;
    if (pw.length >= 16) score += 1;
    if (passwordRequirements.upper) score += 1;
    if (passwordRequirements.lower) score += 1;
    if (passwordRequirements.number) score += 1;
    if (passwordRequirements.special) score += 1;
    return score;
  }, [passwordRequirements, passwordState.newPassword]);

  const passwordStrengthLabel = useMemo(() => {
    if (!passwordState.newPassword) return { text: "None", level: "none" };
    if (passwordStrengthScore <= 3) return { text: "Weak", level: "weak" };
    if (passwordStrengthScore <= 5) return { text: "Fair", level: "fair" };
    if (passwordStrengthScore === 6) return { text: "Good", level: "good" };
    return { text: "Strong", level: "strong" };
  }, [passwordStrengthScore, passwordState.newPassword]);

  const passwordsMatch = useMemo(() => {
    if (!passwordState.confirmPassword) return null;
    return passwordState.newPassword === passwordState.confirmPassword;
  }, [passwordState.newPassword, passwordState.confirmPassword]);

  const validatePasswordForm = () => {
    const errs = {};
    if (!passwordState.currentPassword) {
      errs.currentPassword = "Enter your current password.";
    }

    if (!passwordRequirements.length) {
      errs.newPassword = "New password must be at least 12 characters.";
    } else if (
      !passwordRequirements.upper ||
      !passwordRequirements.lower ||
      !passwordRequirements.number ||
      !passwordRequirements.special
    ) {
      errs.newPassword = "New password does not meet complexity criteria.";
    } else if (passwordState.newPassword === passwordState.currentPassword) {
      errs.newPassword = "New password cannot be identical to your current password.";
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      errs.confirmPassword = "New password and confirmation do not match.";
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsPasswordChanging(true);
    setPasswordErrors({});

    try {
      const res = await changePassword({
        currentPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword,
        confirmPassword: passwordState.confirmPassword,
        logoutOtherDevices: passwordState.logoutOtherDevices,
      });

      setPasswordState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        logoutOtherDevices: true,
      });
      setIsPasswordChanging(false);

      if (res.user?.passwordChangedAt) {
        setSecurityMeta((prev) => ({
          ...prev,
          passwordChangedAt: res.user.passwordChangedAt,
          sessions: res.user.sessions || prev.sessions,
        }));
      }

      showToast(
        "Password changed successfully! PBKDF2 encryption credentials updated.",
        "success"
      );
    } catch (err) {
      setIsPasswordChanging(false);
      setPasswordErrors({ server: err.message || "Failed to change password." });
    }
  };

  const handleCancelPassword = () => {
    setPasswordState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      logoutOtherDevices: true,
    });
    setPasswordErrors({});
  };

  // -------------------------------------------------------------
  // TAB 2C ACTIONS: LOGOUT FROM OTHER DEVICES
  // -------------------------------------------------------------
  const handleLogoutOtherDevices = async () => {
    setIsLoggingOutOthers(true);
    try {
      const res = await logoutOtherDevices();
      setSecurityMeta((prev) => ({
        ...prev,
        sessions: res.sessions || [],
      }));
      setShowLogoutOthersModal(false);
      setIsLoggingOutOthers(false);
      showToast("Signed out of all other devices successfully.", "success");
    } catch (err) {
      setIsLoggingOutOthers(false);
      showToast(err.message || "Failed to terminate other sessions.", "error");
    }
  };

  const handleAccountLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  // -------------------------------------------------------------
  // TAB 3 & 4 ACTIONS: PREFERENCES
  // -------------------------------------------------------------
  const handlePrefNotificationToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
    setPrefsDirty(true);
  };

  const handlePrefChange = (field, val) => {
    setPreferences((prev) => ({ ...prev, [field]: val }));
    setPrefsDirty(true);
  };

  const handleSavePreferences = () => {
    const current = getOwnerProfile();
    const updated = {
      ...current,
      language: preferences.language,
      timezone: preferences.timezone,
      defaultPeriod: preferences.defaultPeriod,
      currency: preferences.currency,
      notifications: preferences.notifications,
    };
    saveOwnerProfile(updated);
    setPrefsDirty(false);
    showToast("Preferences saved successfully!", "success");
  };

  const handleResetPreferences = () => {
    const local = getOwnerProfile();
    setPreferences({
      language: local.language || "English (US)",
      timezone: local.timezone || "Asia/Colombo (UTC+05:30)",
      defaultPeriod: local.defaultPeriod || "7d",
      currency: local.currency || "LKR",
      notifications: local.notifications || {
        newBooking: true,
        cancellations: true,
        chargerOffline: true,
        reviews: true,
      },
    });
    setPrefsDirty(false);
    showToast("Preferences reverted.", "info");
  };

  // Compute initials for avatar fallback
  const initials = (profileData.displayName || "Station Owner")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SO";

  // Formatter for timestamps
  const formatTimestamp = (iso) => {
    if (!iso) return "Not recorded yet";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="owner-settings-page-v2">
      {/* HEADER WITH BREADCRUMBS */}
      <OwnerHeader
        title="Owner Account & Security"
        subtitle="Manage your profile information, secure login credentials, session devices, and preferences."
        breadcrumbs={[
          { label: "Dashboard", to: "/owner/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div className="settings-main-container">
        {/* INLINE GLOBAL FEEDBACK BANNER */}
        {feedback && (
          <div className={`settings-alert-banner ${feedback.type}`} role="status">
            <span className="alert-icon">
              {feedback.type === "success" && "✓"}
              {feedback.type === "error" && "✕"}
              {feedback.type === "info" && "ℹ"}
            </span>
            <p>{feedback.message}</p>
          </div>
        )}

        {/* TABS NAVIGATION BAR */}
        <div className="settings-tabs-nav" role="tablist">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => handleTabChange("profile")}
            role="tab"
            aria-selected={activeTab === "profile"}
          >
            <UserIcon size={17} />
            <span>My Profile</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => handleTabChange("security")}
            role="tab"
            aria-selected={activeTab === "security"}
          >
            <ShieldIcon size={17} />
            <span>Login & Security</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => handleTabChange("notifications")}
            role="tab"
            aria-selected={activeTab === "notifications"}
          >
            <BellIcon size={17} />
            <span>Notification Preferences</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => handleTabChange("preferences")}
            role="tab"
            aria-selected={activeTab === "preferences"}
          >
            <SettingsIcon size={17} />
            <span>Account Preferences</span>
          </button>
        </div>

        {/* =========================================================
            TAB 1: MY PROFILE
        ========================================================== */}
        {activeTab === "profile" && (
          <div className="settings-tab-content">
            <form onSubmit={handleSaveProfile} className="profile-form-layout">
              {/* PROFILE HERO CARD WITH AVATAR UPLOAD */}
              <div className="settings-card profile-hero-card">
                <div className="profile-hero-inner">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-preview">
                      {profileData.profilePicture ? (
                        <img
                          src={profileData.profilePicture}
                          alt={profileData.displayName || "Owner"}
                          className="profile-avatar-image"
                        />
                      ) : (
                        <div className="profile-avatar-initials">{initials}</div>
                      )}
                    </div>
                  </div>

                  <div className="profile-hero-text">
                    <div className="profile-hero-title-row">
                      <h3>{profileData.displayName || "Station Owner"}</h3>
                      <span className="profile-role-tag">{profileData.role || "CPO Administrator"}</span>
                    </div>
                    <p className="profile-hero-company">
                      {profileData.businessName || "EV Charging Operator"}
                    </p>

                    <div className="profile-photo-actions">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        style={{ display: "none" }}
                        onChange={handleProfilePictureUpload}
                      />
                      <button
                        type="button"
                        className="btn-upload-photo"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload New Photo
                      </button>

                      {profileData.profilePicture && (
                        <button
                          type="button"
                          className="btn-remove-photo"
                          onClick={handleRemoveProfilePicture}
                        >
                          Remove Photo
                        </button>
                      )}

                      <span className="photo-hint-text">
                        Max 5MB (JPG, PNG, WEBP). Automatically optimized for high resolution.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROFILE FIELDS CARD */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="card-header-icon green">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h2>Personal & Organization Details</h2>
                    <p>Details displayed on your station receipts, owner portal sidebar, and reports.</p>
                  </div>
                </div>

                <div className="settings-grid-2col">
                  {/* FULL NAME */}
                  <div className="settings-form-group">
                    <label htmlFor="displayName">
                      Full Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => handleProfileChange("displayName", e.target.value)}
                      placeholder="e.g. Kasun Perera"
                      className={profileErrors.displayName ? "has-error" : ""}
                    />
                    {profileErrors.displayName && (
                      <span className="field-error-msg">{profileErrors.displayName}</span>
                    )}
                  </div>

                  {/* CONTACT PHONE */}
                  <div className="settings-form-group">
                    <label htmlFor="phone">
                      Contact Phone Number <span className="required-star">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      className={profileErrors.phone ? "has-error" : ""}
                    />
                    {profileErrors.phone && (
                      <span className="field-error-msg">{profileErrors.phone}</span>
                    )}
                  </div>

                  {/* CONTACT EMAIL */}
                  <div className="settings-form-group">
                    <label htmlFor="contactEmail">
                      Contact Email
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      value={profileData.email}
                      readOnly
                      disabled
                      className="input-disabled"
                      title="To change your login email address, use the Login & Security tab."
                    />
                    <small className="field-hint">
                      To change your account login credentials, navigate to the{" "}
                      <button
                        type="button"
                        className="link-inline-btn"
                        onClick={() => handleTabChange("security")}
                      >
                        Login & Security
                      </button>{" "}
                      tab.
                    </small>
                  </div>

                  {/* ROLE / DESIGNATION */}
                  <div className="settings-form-group">
                    <label htmlFor="role">Role / Designation</label>
                    <input
                      id="role"
                      type="text"
                      value={profileData.role}
                      readOnly
                      disabled
                      className="input-disabled"
                    />
                    <small className="field-hint">Role governed by EVChargeHub organization permissions.</small>
                  </div>

                  {/* COMPANY / BUSINESS NAME */}
                  <div className="settings-form-group full-width">
                    <label htmlFor="businessName">
                      Company / Organization Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      value={profileData.businessName}
                      onChange={(e) => handleProfileChange("businessName", e.target.value)}
                      placeholder="e.g. EcoCharge Lanka Holdings"
                      className={profileErrors.businessName ? "has-error" : ""}
                    />
                    {profileErrors.businessName && (
                      <span className="field-error-msg">{profileErrors.businessName}</span>
                    )}
                  </div>

                  {/* BUSINESS ADDRESS */}
                  <div className="settings-form-group full-width">
                    <label htmlFor="businessAddress">Business Address</label>
                    <textarea
                      id="businessAddress"
                      rows={2}
                      value={profileData.businessAddress}
                      onChange={(e) => handleProfileChange("businessAddress", e.target.value)}
                      placeholder="e.g. No. 45, Galle Road, Colombo 03, Sri Lanka"
                    />
                  </div>
                </div>

                {/* PROFILE ACTIONS */}
                <div className="settings-actions-footer">
                  <div className="dirty-indicator-box">
                    {isProfileDirty && <span className="dirty-dot">● You have unsaved profile changes</span>}
                  </div>
                  <div className="action-buttons-group">
                    <button
                      type="button"
                      className="settings-btn-secondary"
                      onClick={handleCancelProfile}
                      disabled={!isProfileDirty}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="settings-btn-primary"
                      disabled={isProfileSaving}
                    >
                      <CheckIcon size={16} />
                      <span>{isProfileSaving ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================
            TAB 2: LOGIN & SECURITY
        ========================================================== */}
        {activeTab === "security" && (
          <div className="settings-tab-content">
            {/* SUB-SECTION 1: CHANGE LOGIN EMAIL */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="card-header-icon blue">
                  <ShieldIcon size={20} />
                </div>
                <div>
                  <h2>Change Login Email</h2>
                  <p>Update the primary email address used to sign in to your EVChargeHub owner portal.</p>
                </div>
              </div>

              {emailErrors.server && (
                <div className="settings-card-alert error">
                  <AlertCircleIcon size={18} />
                  <span>{emailErrors.server}</span>
                </div>
              )}

              <form onSubmit={handleChangeEmailSubmit} className="settings-subform">
                <div className="settings-grid-2col">
                  {/* CURRENT LOGIN EMAIL */}
                  <div className="settings-form-group">
                    <label>Current Login Email</label>
                    <input
                      type="email"
                      value={currentLoginEmail}
                      readOnly
                      disabled
                      className="input-disabled"
                    />
                  </div>

                  {/* NEW EMAIL */}
                  <div className="settings-form-group">
                    <label htmlFor="newLoginEmail">
                      New Email Address <span className="required-star">*</span>
                    </label>
                    <input
                      id="newLoginEmail"
                      type="email"
                      value={newLoginEmail}
                      onChange={(e) => {
                        setNewLoginEmail(e.target.value);
                        if (emailErrors.newEmail) setEmailErrors((p) => ({ ...p, newEmail: null }));
                      }}
                      placeholder="e.g. new.owner@evchargehub.lk"
                      className={emailErrors.newEmail ? "has-error" : ""}
                    />
                    {emailErrors.newEmail && (
                      <span className="field-error-msg">{emailErrors.newEmail}</span>
                    )}
                  </div>

                  {/* CURRENT PASSWORD FOR VERIFICATION */}
                  <div className="settings-form-group full-width">
                    <label htmlFor="emailCurrentPassword">
                      Current Password (for security verification) <span className="required-star">*</span>
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        id="emailCurrentPassword"
                        type={showEmailPassword ? "text" : "password"}
                        value={emailCurrentPassword}
                        onChange={(e) => {
                          setEmailCurrentPassword(e.target.value);
                          if (emailErrors.currentPassword) {
                            setEmailErrors((p) => ({ ...p, currentPassword: null }));
                          }
                        }}
                        placeholder="Enter your current password to authorize email change"
                        className={emailErrors.currentPassword ? "has-error" : ""}
                      />
                      <button
                        type="button"
                        className="btn-toggle-pw"
                        onClick={() => setShowEmailPassword((prev) => !prev)}
                        aria-label="Toggle password visibility"
                      >
                        {showEmailPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {emailErrors.currentPassword && (
                      <span className="field-error-msg">{emailErrors.currentPassword}</span>
                    )}
                  </div>
                </div>

                <div className="settings-subform-actions">
                  <button
                    type="button"
                    className="settings-btn-secondary"
                    onClick={handleCancelEmail}
                    disabled={isEmailChanging || (!newLoginEmail && !emailCurrentPassword)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="settings-btn-primary"
                    disabled={isEmailChanging || !newLoginEmail || !emailCurrentPassword}
                  >
                    <span>{isEmailChanging ? "Verifying..." : "Change Email"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SUB-SECTION 2: CHANGE PASSWORD */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="card-header-icon green">
                  <LockIcon size={20} />
                </div>
                <div>
                  <h2>Change Password</h2>
                  <p>Protect your account with a cryptographically secure, high-entropy password.</p>
                </div>
              </div>

              {passwordErrors.server && (
                <div className="settings-card-alert error">
                  <AlertCircleIcon size={18} />
                  <span>{passwordErrors.server}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="settings-subform">
                {/* CURRENT PASSWORD */}
                <div className="settings-form-group">
                  <label htmlFor="currentPassword">
                    Current Password <span className="required-star">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordState.currentPassword}
                      onChange={(e) => {
                        setPasswordState((prev) => ({ ...prev, currentPassword: e.target.value }));
                        if (passwordErrors.currentPassword) {
                          setPasswordErrors((p) => ({ ...p, currentPassword: null }));
                        }
                      }}
                      placeholder="Enter your current password"
                      className={passwordErrors.currentPassword ? "has-error" : ""}
                    />
                    <button
                      type="button"
                      className="btn-toggle-pw"
                      onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                    >
                      {showPasswords.current ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <span className="field-error-msg">{passwordErrors.currentPassword}</span>
                  )}
                </div>

                {/* NEW PASSWORD */}
                <div className="settings-form-group">
                  <label htmlFor="newPassword">
                    New Password <span className="required-star">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordState.newPassword}
                      onChange={(e) => {
                        setPasswordState((prev) => ({ ...prev, newPassword: e.target.value }));
                        if (passwordErrors.newPassword) {
                          setPasswordErrors((p) => ({ ...p, newPassword: null }));
                        }
                      }}
                      placeholder="Minimum 12 characters with upper, lower, numbers, symbol"
                      className={passwordErrors.newPassword ? "has-error" : ""}
                    />
                    <button
                      type="button"
                      className="btn-toggle-pw"
                      onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                    >
                      {showPasswords.new ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <span className="field-error-msg">{passwordErrors.newPassword}</span>
                  )}

                  {/* PASSWORD STRENGTH METER */}
                  {passwordState.newPassword && (
                    <div className="password-strength-container">
                      <div className="strength-header">
                        <span>Password Strength:</span>
                        <strong className={`strength-label ${passwordStrengthLabel.level}`}>
                          {passwordStrengthLabel.text}
                        </strong>
                      </div>
                      <div className="strength-track">
                        <div className={`strength-bar ${passwordStrengthLabel.level}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* CONFIRM NEW PASSWORD */}
                <div className="settings-form-group">
                  <label htmlFor="confirmPassword">
                    Confirm New Password <span className="required-star">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordState.confirmPassword}
                      onChange={(e) => {
                        setPasswordState((prev) => ({ ...prev, confirmPassword: e.target.value }));
                        if (passwordErrors.confirmPassword) {
                          setPasswordErrors((p) => ({ ...p, confirmPassword: null }));
                        }
                      }}
                      placeholder="Re-enter your new password"
                      className={passwordErrors.confirmPassword ? "has-error" : ""}
                    />
                    <button
                      type="button"
                      className="btn-toggle-pw"
                      onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                    >
                      {showPasswords.confirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passwordsMatch === false && (
                    <span className="field-error-msg">Passwords do not match.</span>
                  )}
                  {passwordsMatch === true && passwordState.confirmPassword && (
                    <span className="field-success-msg">✓ Passwords match</span>
                  )}
                  {passwordErrors.confirmPassword && (
                    <span className="field-error-msg">{passwordErrors.confirmPassword}</span>
                  )}
                </div>

                {/* LIVE PASSWORD REQUIREMENTS CHECKLIST */}
                <div className="password-checklist-card">
                  <h4>Password Requirements:</h4>
                  <ul className="pw-checklist">
                    <li className={passwordRequirements.length ? "met" : ""}>
                      <span className="chk-icon">{passwordRequirements.length ? "✓" : "○"}</span>
                      <span>At least 12 characters long</span>
                    </li>
                    <li className={passwordRequirements.upper ? "met" : ""}>
                      <span className="chk-icon">{passwordRequirements.upper ? "✓" : "○"}</span>
                      <span>At least one uppercase letter (A-Z)</span>
                    </li>
                    <li className={passwordRequirements.lower ? "met" : ""}>
                      <span className="chk-icon">{passwordRequirements.lower ? "✓" : "○"}</span>
                      <span>At least one lowercase letter (a-z)</span>
                    </li>
                    <li className={passwordRequirements.number ? "met" : ""}>
                      <span className="chk-icon">{passwordRequirements.number ? "✓" : "○"}</span>
                      <span>At least one number (0-9)</span>
                    </li>
                    <li className={passwordRequirements.special ? "met" : ""}>
                      <span className="chk-icon">{passwordRequirements.special ? "✓" : "○"}</span>
                      <span>At least one special character (!@#$%...)</span>
                    </li>
                    <li className={passwordRequirements.notCurrent ? "met" : ""}>
                      <span className="chk-icon">{passwordRequirements.notCurrent ? "✓" : "○"}</span>
                      <span>Cannot be identical to current password</span>
                    </li>
                  </ul>
                </div>

                {/* OPTION: LOGOUT OTHER DEVICES */}
                <div className="session-invalidation-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={passwordState.logoutOtherDevices}
                      onChange={(e) =>
                        setPasswordState((prev) => ({
                          ...prev,
                          logoutOtherDevices: e.target.checked,
                        }))
                      }
                    />
                    <span>Sign out of all other active browser sessions across other devices</span>
                  </label>
                </div>

                <div className="settings-subform-actions">
                  <button
                    type="button"
                    className="settings-btn-secondary"
                    onClick={handleCancelPassword}
                    disabled={isPasswordChanging}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="settings-btn-primary"
                    disabled={
                      isPasswordChanging ||
                      !passwordRequirements.length ||
                      !passwordRequirements.upper ||
                      !passwordRequirements.lower ||
                      !passwordRequirements.number ||
                      !passwordRequirements.special ||
                      passwordsMatch !== true
                    }
                  >
                    <span>{isPasswordChanging ? "Updating Password..." : "Update Password"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SUB-SECTION 3: ACCOUNT SECURITY & ACTIVE SESSIONS */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="card-header-icon amber">
                  <ClockIcon size={20} />
                </div>
                <div>
                  <h2>Account Security & Active Sessions</h2>
                  <p>Real-time security telemetry, authentication cryptography, and session management.</p>
                </div>
              </div>

              {/* SECURITY SUMMARY METRICS */}
              <div className="security-telemetry-grid">
                <div className="telemetry-box">
                  <span className="telemetry-label">Account Email</span>
                  <strong className="telemetry-value">{currentLoginEmail || "owner@evchargehub.lk"}</strong>
                  <span className="telemetry-badge active">Verified</span>
                </div>

                <div className="telemetry-box">
                  <span className="telemetry-label">Last Login Timestamp</span>
                  <strong className="telemetry-value">{formatTimestamp(securityMeta.lastLoginAt)}</strong>
                  <span className="telemetry-hint">From authenticated browser</span>
                </div>

                <div className="telemetry-box">
                  <span className="telemetry-label">Password Last Changed</span>
                  <strong className="telemetry-value">{formatTimestamp(securityMeta.passwordChangedAt)}</strong>
                  <span className="telemetry-hint">PBKDF2-SHA512 Encrypted</span>
                </div>

                <div className="telemetry-box">
                  <span className="telemetry-label">Encryption Standard</span>
                  <strong className="telemetry-value">PBKDF2 (100k Iterations)</strong>
                  <span className="telemetry-badge active">NIST & OWASP Compliant</span>
                </div>
              </div>

              {/* ACTIVE SESSIONS LIST */}
              <div className="active-sessions-section">
                <div className="sessions-header-row">
                  <div>
                    <h3>Active Login Sessions</h3>
                    <p>Devices currently authenticated to your EVChargeHub owner account.</p>
                  </div>

                  <div className="sessions-actions-group">
                    <button
                      type="button"
                      className="btn-logout-others"
                      onClick={() => setShowLogoutOthersModal(true)}
                    >
                      Logout from Other Devices
                    </button>
                    <button
                      type="button"
                      className="btn-logout-account"
                      onClick={handleAccountLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                <div className="sessions-table-wrapper">
                  <table className="sessions-table">
                    <thead>
                      <tr>
                        <th>Device & Browser</th>
                        <th>IP Address</th>
                        <th>Session Started</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityMeta.sessions && securityMeta.sessions.length > 0 ? (
                        securityMeta.sessions.map((sess, idx) => (
                          <tr key={sess.sessionId || idx}>
                            <td>
                              <div className="session-device-cell">
                                <span className="device-icon">💻</span>
                                <div>
                                  <strong>
                                    {sess.userAgent?.includes("Chrome")
                                      ? "Google Chrome"
                                      : sess.userAgent?.includes("Firefox")
                                      ? "Mozilla Firefox"
                                      : sess.userAgent?.includes("Safari")
                                      ? "Apple Safari"
                                      : "Web Browser"}
                                  </strong>
                                  <small>{sess.userAgent?.slice(0, 48)}...</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="ip-badge">{sess.ip || "127.0.0.1"}</span>
                            </td>
                            <td>{formatTimestamp(sess.createdAt)}</td>
                            <td>
                              {sess.isCurrent ? (
                                <span className="session-status-badge current">Current Device</span>
                              ) : (
                                <span className="session-status-badge active">Active</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="empty-sessions-td">
                            1 active session on current device.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: NOTIFICATION PREFERENCES
        ========================================================== */}
        {activeTab === "notifications" && (
          <div className="settings-tab-content">
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="card-header-icon amber">
                  <BellIcon size={20} />
                </div>
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Configure which network events trigger immediate dashboard banners and alerts.</p>
                </div>
              </div>

              <div className="notification-toggles-list">
                <div className="notification-toggle-row">
                  <div className="toggle-text">
                    <strong>New Booking Reservations</strong>
                    <p>Receive notifications when an EV driver reserves a slot at one of your charging bays.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.newBooking ?? true}
                      onChange={() => handlePrefNotificationToggle("newBooking")}
                    />
                    <span className="slider round" />
                  </label>
                </div>

                <div className="notification-toggle-row">
                  <div className="toggle-text">
                    <strong>Booking Cancellations</strong>
                    <p>Alert immediately if a driver cancels an upcoming reservation or slot.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.cancellations ?? true}
                      onChange={() => handlePrefNotificationToggle("cancellations")}
                    />
                    <span className="slider round" />
                  </label>
                </div>

                <div className="notification-toggle-row">
                  <div className="toggle-text">
                    <strong>Charger Offline & Maintenance Alerts</strong>
                    <p>Send urgent alerts if a bay disconnects, trips, or enters Maintenance mode.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.chargerOffline ?? true}
                      onChange={() => handlePrefNotificationToggle("chargerOffline")}
                    />
                    <span className="slider round" />
                  </label>
                </div>

                <div className="notification-toggle-row">
                  <div className="toggle-text">
                    <strong>Customer Reviews & Ratings</strong>
                    <p>Alert when drivers post feedback or 1-star to 5-star ratings for your network.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.reviews ?? true}
                      onChange={() => handlePrefNotificationToggle("reviews")}
                    />
                    <span className="slider round" />
                  </label>
                </div>
              </div>

              <div className="settings-actions-footer">
                <div className="dirty-indicator-box">
                  {prefsDirty && <span className="dirty-dot">● Unsaved preference changes</span>}
                </div>
                <div className="action-buttons-group">
                  <button
                    type="button"
                    className="settings-btn-secondary"
                    onClick={handleResetPreferences}
                    disabled={!prefsDirty}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="settings-btn-primary"
                    onClick={handleSavePreferences}
                    disabled={!prefsDirty}
                  >
                    <CheckIcon size={16} />
                    <span>Save Notification Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: ACCOUNT PREFERENCES
        ========================================================== */}
        {activeTab === "preferences" && (
          <div className="settings-tab-content">
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="card-header-icon blue">
                  <SettingsIcon size={20} />
                </div>
                <div>
                  <h2>Regional & Formatting Preferences</h2>
                  <p>Customize time zone alignment, language, currency, and default analytics intervals.</p>
                </div>
              </div>

              <div className="settings-grid-2col">
                <div className="settings-form-group">
                  <label htmlFor="languageSelect">Preferred Portal Language</label>
                  <select
                    id="languageSelect"
                    value={preferences.language}
                    onChange={(e) => handlePrefChange("language", e.target.value)}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Sinhala (සිංහල)">Sinhala (සිංහල)</option>
                    <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                  </select>
                  <small className="field-hint">Primary language used for station receipts and portal labels.</small>
                </div>

                <div className="settings-form-group">
                  <label htmlFor="timezoneSelect">System Time Zone</label>
                  <select
                    id="timezoneSelect"
                    value={preferences.timezone}
                    onChange={(e) => handlePrefChange("timezone", e.target.value)}
                  >
                    <option value="Asia/Colombo (UTC+05:30)">Asia/Colombo (UTC+05:30)</option>
                    <option value="UTC (UTC+00:00)">UTC (UTC+00:00)</option>
                    <option value="Asia/Kolkata (UTC+05:30)">Asia/Kolkata (UTC+05:30)</option>
                  </select>
                  <small className="field-hint">All booking time slots align to Sri Lanka Standard Time.</small>
                </div>

                <div className="settings-form-group">
                  <label htmlFor="defaultPeriodSelect">Default Analytics Period</label>
                  <select
                    id="defaultPeriodSelect"
                    value={preferences.defaultPeriod}
                    onChange={(e) => handlePrefChange("defaultPeriod", e.target.value)}
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="all">All Time</option>
                  </select>
                  <small className="field-hint">Default time interval loaded when viewing Analytics & Reports.</small>
                </div>

                <div className="settings-form-group">
                  <label htmlFor="currencyDisplay">Currency Denomination</label>
                  <input
                    id="currencyDisplay"
                    type="text"
                    value="LKR (Sri Lankan Rupee)"
                    readOnly
                    disabled
                    className="input-disabled"
                  />
                  <small className="field-hint">All charging tariffs and session revenues are denominated in LKR.</small>
                </div>
              </div>

              <div className="settings-actions-footer">
                <div className="dirty-indicator-box">
                  {prefsDirty && <span className="dirty-dot">● Unsaved preference changes</span>}
                </div>
                <div className="action-buttons-group">
                  <button
                    type="button"
                    className="settings-btn-secondary"
                    onClick={handleResetPreferences}
                    disabled={!prefsDirty}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="settings-btn-primary"
                    onClick={handleSavePreferences}
                    disabled={!prefsDirty}
                  >
                    <CheckIcon size={16} />
                    <span>Save Account Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL: LOGOUT OTHER DEVICES */}
      {showLogoutOthersModal && (
        <div
          className="settings-modal-backdrop"
          onClick={() => setShowLogoutOthersModal(false)}
        >
          <div
            className="settings-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-icon red">
                <LockIcon size={22} />
              </div>
              <div>
                <h3>Logout from Other Devices?</h3>
                <p>This will immediately invalidate all other active sessions across browsers and devices.</p>
              </div>
            </div>

            <p className="modal-warning-text">
              You will remain signed in on this current browser session. Any other logged-in phones, tablets, or computers will be prompted to re-enter credentials.
            </p>

            <div className="modal-actions-row">
              <button
                type="button"
                className="settings-btn-secondary"
                onClick={() => setShowLogoutOthersModal(false)}
                disabled={isLoggingOutOthers}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleLogoutOtherDevices}
                disabled={isLoggingOutOthers}
              >
                {isLoggingOutOthers ? "Terminating..." : "Confirm & Logout Others"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
