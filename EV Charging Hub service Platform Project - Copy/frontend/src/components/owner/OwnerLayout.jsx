import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import OwnerSidebar from "./OwnerSidebar";
import "./OwnerLayout.css";

export default function OwnerLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeSidebar = () => setIsMobileOpen(false);

  return (
    <div className="owner-layout">
      {/* FIXED SIDEBAR (Desktop) / SLIDE-OUT DRAWER (Mobile) */}
      <OwnerSidebar isMobileOpen={isMobileOpen} onClose={closeSidebar} />

      {/* INDEPENDENTLY SCROLLING MAIN CONTENT */}
      <div className="owner-main-container">
        <Outlet context={{ toggleSidebar, isMobileOpen, closeSidebar }} />
      </div>
    </div>
  );
}
