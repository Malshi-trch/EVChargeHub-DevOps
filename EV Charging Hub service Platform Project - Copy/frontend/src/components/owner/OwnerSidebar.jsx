import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BuildingIcon,
  RouteIcon,
  PlugIcon,
  CalendarIcon,
  UsersIcon,
  StarIcon,
  TrendingUpIcon,
  SettingsIcon,
  HelpIcon,
  XIcon,
} from "../Icons";
import { getOwnerProfile } from "../../data/ownerProfileData";

export default function OwnerSidebar({ isMobileOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const [profile, setProfile] = useState(() => getOwnerProfile());

  // Listen to profile updates from Settings page
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

  // Compute initials for avatar (e.g., "Station Owner" -> "SO")
  const initials = (profile.displayName || "Station Owner")
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SO";

  // Determine active item strictly
  const isDashboardActive = currentPath === "/owner/dashboard" || currentPath === "/owner" || currentPath === "/owner/";
  const isStationsActive =
    currentPath.startsWith("/owner/stations") && !currentPath.includes("/chargers");
  const isChargersActive =
    currentPath === "/owner/chargers" || currentPath.includes("/chargers");
  const isBookingsActive = currentPath.startsWith("/owner/bookings");
  const isCustomersActive = currentPath.startsWith("/owner/customers");
  const isReviewsActive = currentPath.startsWith("/owner/reviews");
  const isAnalyticsActive = currentPath.startsWith("/owner/analytics");
  const isSettingsActive = currentPath.startsWith("/owner/settings");
  const isHelpActive = currentPath.startsWith("/owner/help");

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="owner-sidebar-overlay"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside className={`owner-sidebar ${isMobileOpen ? "mobile-open" : ""}`} aria-label="Station Owner Portal Sidebar">
        {/* TOP BRAND HEADER */}
        <div className="owner-sidebar-brand">
          <Link to="/owner/dashboard" className="owner-sidebar-logo" onClick={onClose}>
            <div className="owner-sidebar-logo-icon">⚡</div>
            <div className="owner-sidebar-brand-text">
              <span className="owner-sidebar-brand-title">EVChargeHub</span>
              <span className="owner-sidebar-brand-badge">STATION OWNER</span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="owner-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* SCROLLABLE MENU AREA */}
        <nav className="owner-sidebar-menu">
          <div className="owner-menu-section-label">MAIN MENU</div>

          <Link
            to="/owner/dashboard"
            className={`owner-sidebar-link ${isDashboardActive ? "active" : ""}`}
            onClick={onClose}
          >
            <BuildingIcon size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/owner/stations"
            className={`owner-sidebar-link ${isStationsActive ? "active" : ""}`}
            onClick={onClose}
          >
            <RouteIcon size={18} />
            <span>My Stations</span>
          </Link>

          <Link
            to="/owner/chargers"
            className={`owner-sidebar-link ${isChargersActive ? "active" : ""}`}
            onClick={onClose}
          >
            <PlugIcon size={18} />
            <span>Chargers</span>
          </Link>

          <Link
            to="/owner/bookings"
            className={`owner-sidebar-link ${isBookingsActive ? "active" : ""}`}
            onClick={onClose}
          >
            <CalendarIcon size={18} />
            <span>Bookings</span>
          </Link>

          <Link
            to="/owner/customers"
            className={`owner-sidebar-link ${isCustomersActive ? "active" : ""}`}
            onClick={onClose}
          >
            <UsersIcon size={18} />
            <span>Customers</span>
          </Link>

          <Link
            to="/owner/reviews"
            className={`owner-sidebar-link ${isReviewsActive ? "active" : ""}`}
            onClick={onClose}
          >
            <StarIcon size={18} />
            <span>Reviews</span>
          </Link>

          <Link
            to="/owner/analytics"
            className={`owner-sidebar-link ${isAnalyticsActive ? "active" : ""}`}
            onClick={onClose}
          >
            <TrendingUpIcon size={18} />
            <span>Analytics</span>
          </Link>

          <div className="owner-menu-section-label account-section-label">ACCOUNT</div>

          <Link
            to="/owner/settings"
            className={`owner-sidebar-link ${isSettingsActive ? "active" : ""}`}
            onClick={onClose}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </Link>

          <Link
            to="/owner/help"
            className={`owner-sidebar-link ${isHelpActive ? "active" : ""}`}
            onClick={onClose}
          >
            <HelpIcon size={18} />
            <span>Help & Support</span>
          </Link>
        </nav>

        {/* BOTTOM FIXED PROFILE CARD */}
        <div className="owner-sidebar-footer">
          <Link to="/owner/settings" className="owner-sidebar-profile" onClick={onClose} title="Edit Owner Profile in Settings">
            <div className="owner-sidebar-avatar">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.displayName || "Owner"}
                  className="owner-sidebar-avatar-img"
                />
              ) : (
                initials
              )}
            </div>
            <div className="owner-sidebar-user-meta">
              <span className="owner-sidebar-user-name" title={profile.displayName}>
                {profile.displayName || "Station Owner"}
              </span>
              <span className="owner-sidebar-user-role" title={profile.businessName || profile.role}>
                {profile.role || "CPO Administrator"}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
