import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  SettingsIcon,
} from "./Icons";
import "./UserMobileNav.css";

const navItems = [
  { label: "Dashboard", shortLabel: "Dash", path: "/user/dashboard", icon: HomeIcon },
  { label: "Stations", shortLabel: "Stations", path: "/user/stations", icon: LocationIcon },
  { label: "Bookings", shortLabel: "Bookings", path: "/user/bookings", icon: CalendarIcon },
  { label: "History", shortLabel: "History", path: "/user/history", icon: ClockIcon },
  { label: "Favourites", shortLabel: "Saved", path: "/user/favourites", icon: HeartIcon },
  { label: "Settings", shortLabel: "Settings", path: "/user/settings", icon: SettingsIcon },
];

export default function UserMobileNav() {
  const location = useLocation();

  return (
    <nav className="user-mobile-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`user-mobile-nav-item ${isActive ? "active" : ""}`}
            title={item.label}
          >
            <IconComponent size={19} />
            <span className="nav-label-full">{item.label}</span>
            <span className="nav-label-short">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
