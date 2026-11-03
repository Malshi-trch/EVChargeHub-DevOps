import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  BellIcon,
  LogoutIcon,
  MenuIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
} from "../Icons";
import { getOwnerProfile } from "../../data/ownerProfileData";
import { logout } from "../../services/authService";

export default function OwnerHeader({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  action,
  children,
}) {
  const headerActions = actions || action;
  const outletContext = useOutletContext() || {};
  const { toggleSidebar } = outletContext;
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => getOwnerProfile());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Sync profile dynamically when saved in settings
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setProfile(e.detail);
      } else {
        setProfile(getOwnerProfile());
      }
    };
    window.addEventListener("evOwnerProfileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("evOwnerProfileUpdated", handleProfileUpdate);
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = (profile.displayName || "Station Owner")
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SO";

  return (
    <header className="owner-universal-header">
      {/* LEFT SECTION: Hamburger (mobile/tablet) + Title & Subtitle */}
      <div className="owner-header-left">
        {toggleSidebar && (
          <button
            type="button"
            className="owner-header-hamburger-btn"
            onClick={toggleSidebar}
            aria-label="Toggle navigation drawer"
          >
            <MenuIcon size={22} />
          </button>
        )}

        <div className="owner-header-title-block">
          {breadcrumbs && (
            <div className="owner-header-breadcrumbs">
              {Array.isArray(breadcrumbs) ? (
                breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className="owner-breadcrumb-item">
                    {idx > 0 && <span className="owner-breadcrumb-sep"> / </span>}
                    {crumb.to ? (
                      <Link to={crumb.to} className="owner-breadcrumb-link">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="owner-breadcrumb-current">{crumb.label}</span>
                    )}
                  </span>
                ))
              ) : (
                breadcrumbs
              )}
            </div>
          )}
          <div className="owner-header-title-row">
            <h1>{title}</h1>
            {badge && <span className="owner-header-badge">{badge}</span>}
          </div>
          {subtitle && <p className="owner-header-subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* RIGHT SECTION: Custom Page Actions + Notifications + Profile Menu + Logout */}
      <div className="owner-header-right">
        {headerActions && <div className="owner-header-custom-actions">{headerActions}</div>}
        {children && <div className="owner-header-custom-children">{children}</div>}

        {/* NOTIFICATIONS DROPDOWN */}
        <div className="owner-header-notif-wrapper" ref={notifRef}>
          <button
            type="button"
            className="owner-header-icon-btn owner-header-notif-btn"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Toggle network notifications"
            aria-expanded={showNotifications}
          >
            <BellIcon size={20} />
            <span className="owner-header-notif-dot" />
          </button>

          {showNotifications && (
            <div className="owner-header-notif-dropdown" role="menu">
              <div className="owner-header-notif-header">
                <strong>Network Alerts</strong>
                <span className="owner-header-notif-live-badge">Live System</span>
              </div>
              <ul className="owner-header-notif-list">
                <li className="owner-header-notif-item">
                  <span className="notif-status-dot online" />
                  <div>
                    <strong>All Hubs Operational</strong>
                    <p>Ruhuna, Matara & Galle superchargers online.</p>
                    <small>Real-time telemetry</small>
                  </div>
                </li>
                <li className="owner-header-notif-item">
                  <span className="notif-status-dot info" />
                  <div>
                    <strong>Session Guard Active</strong>
                    <p>PBKDF2 security credentials verified.</p>
                    <small>Security monitor</small>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* PROFILE MENU DROPDOWN */}
        <div className="owner-header-profile-menu-wrapper" ref={profileRef}>
          <button
            type="button"
            className="owner-header-profile-btn"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-label="Toggle owner profile menu"
            aria-expanded={showProfileMenu}
            title={`${profile.displayName || "Station Owner"} - Profile Menu`}
          >
            <div className="header-avatar-circle">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.displayName || "Owner"}
                  className="header-avatar-img"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <span className="header-profile-name">{profile.displayName || "Station Owner"}</span>
            <span className="header-profile-chevron">▾</span>
          </button>

          {showProfileMenu && (
            <div className="owner-header-profile-dropdown" role="menu">
              <div className="profile-dropdown-user-card">
                <div className="dropdown-avatar-circle">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.displayName || "Owner"}
                      className="header-avatar-img"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="dropdown-user-info">
                  <strong>{profile.displayName || "Station Owner"}</strong>
                  <span className="dropdown-role-badge">{profile.role || "CPO Administrator"}</span>
                  <small className="dropdown-email-text">{profile.email || "owner@evchargehub.lk"}</small>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <div className="profile-dropdown-links">
                <Link
                  to="/owner/settings"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/owner/settings?tab=security"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <ShieldIcon size={16} />
                  <span>Login & Security</span>
                </Link>

                <Link
                  to="/owner/settings?tab=notifications"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <BellIcon size={16} />
                  <span>Notification Alerts</span>
                </Link>

                <Link
                  to="/owner/settings?tab=preferences"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <SettingsIcon size={16} />
                  <span>Account Preferences</span>
                </Link>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-dropdown-logout-item"
                onClick={handleLogout}
              >
                <LogoutIcon size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* DIRECT LOGOUT BUTTON */}
        <button
          type="button"
          onClick={handleLogout}
          className="owner-header-logout-btn"
          title="Sign out of owner portal"
        >
          <LogoutIcon size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
