import { useState, useEffect } from "react";
import heroImage from "./assets/ev-hero.png";
import "./App.css";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import {
  getStoredToken,
  getStoredUserRole,
  getCurrentUser,
  isOwner,
  isEVUser,
} from "./services/authService";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ResetPassword from "./Pages/ResetPassword";
import UserDashboard from "./Pages/UserDashboard";
import OwnerLayout from "./components/owner/OwnerLayout";
import OwnerDashboard from "./Pages/OwnerDashboard";
import OwnerStations from "./Pages/OwnerStations";
import AddStation from "./Pages/AddStation";
import OwnerStationDetails from "./Pages/OwnerStationDetails";
import EditStation from "./Pages/EditStation";
import ManageChargers from "./Pages/ManageChargers";
import OwnerChargers from "./Pages/OwnerChargers";
import OwnerBookings from "./Pages/OwnerBookings";
import OwnerBookingDetails from "./Pages/OwnerBookingDetails";
import OwnerCustomers from "./Pages/OwnerCustomers";
import OwnerCustomerDetails from "./Pages/OwnerCustomerDetails";
import OwnerReviews from "./Pages/OwnerReviews";
import OwnerAnalytics from "./Pages/OwnerAnalytics";
import OwnerSettings from "./Pages/OwnerSettings";
import OwnerHelpSupport from "./Pages/OwnerHelpSupport";
import FindStations from "./Pages/FindStations";
import StationDetails from "./Pages/StationDetails";
import BookCharging from "./Pages/BookCharging";
import BookingConfirmation from "./Pages/BookingConfirmation";
import BookingSuccess from "./Pages/BookingSuccess";
import MyBookings from "./Pages/MyBookings";
import BookingDetails from "./Pages/BookingDetails";
import ChargingHistory from "./Pages/ChargingHistory";
import FavouriteStations from "./Pages/FavouriteStations";
import Settings from "./Pages/Settings";
import HelpSupport from "./Pages/HelpSupport";
import UserMobileNav from "./components/UserMobileNav";

/**
 * Role-Based Route Guard:
 * - Directs unauthenticated users to /login.
 * - Prevents EV Users from accessing Owner Portal routes (redirects to /user/dashboard).
 * - Prevents Station Owners from accessing private EV User routes (redirects to /owner/dashboard).
 */
function ProtectedRoute({ children, requiredRole }) {
  const token = getStoredToken();
  const role = getStoredUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "owner") {
    if (!isOwner(role)) {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  if (requiredRole === "user") {
    if (!isEVUser(role)) {
      return <Navigate to="/owner/dashboard" replace />;
    }
  }

  return children;
}

function App() {
  const location = useLocation();
  const isUserArea = location.pathname.startsWith("/user");

  useEffect(() => {
    // If a session token exists, verify and restore latest state from backend
    if (getStoredToken()) {
      getCurrentUser().catch((err) => console.warn("Session check error:", err));
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* AUTOMATIC REDIRECT FOR ROLE PORTALS */}
        <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />

        {/* OWNER PORTAL (STRICTLY GUARDED FOR STATION_OWNER) */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="stations" element={<OwnerStations />} />
          <Route path="stations/add" element={<AddStation />} />
          <Route path="stations/new" element={<AddStation />} />
          <Route path="stations/:stationId" element={<OwnerStationDetails />} />
          <Route path="stations/:stationId/edit" element={<EditStation />} />
          <Route path="stations/:stationId/chargers" element={<ManageChargers />} />
          <Route path="chargers" element={<OwnerChargers />} />
          <Route path="bookings" element={<OwnerBookings />} />
          <Route path="bookings/:bookingId" element={<OwnerBookingDetails />} />
          <Route path="customers" element={<OwnerCustomers />} />
          <Route path="customers/:customerId" element={<OwnerCustomerDetails />} />
          <Route path="reviews" element={<OwnerReviews />} />
          <Route path="analytics" element={<OwnerAnalytics />} />
          <Route path="settings" element={<OwnerSettings />} />
          <Route path="help" element={<OwnerHelpSupport />} />
        </Route>

        {/* PRIVATE EV USER ROUTES (STRICTLY GUARDED FOR EV_USER) */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/bookings"
          element={
            <ProtectedRoute requiredRole="user">
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/bookings/:bookingId"
          element={
            <ProtectedRoute requiredRole="user">
              <BookingDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/bookings/:bookingId/success"
          element={
            <ProtectedRoute requiredRole="user">
              <BookingSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/stations/:stationId/book"
          element={
            <ProtectedRoute requiredRole="user">
              <BookCharging />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/stations/:stationId/book/confirm"
          element={
            <ProtectedRoute requiredRole="user">
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/history"
          element={
            <ProtectedRoute requiredRole="user">
              <ChargingHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/favourites"
          element={
            <ProtectedRoute requiredRole="user">
              <FavouriteStations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/settings"
          element={
            <ProtectedRoute requiredRole="user">
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* PUBLIC DISCOVERY & HELP ROUTES */}
        <Route path="/user/stations" element={<FindStations />} />
        <Route path="/user/stations/:stationId" element={<StationDetails />} />
        <Route path="/user/help" element={<HelpSupport />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {isUserArea && <UserMobileNav />}
    </>
  );
}

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const station = {
    name: "University of Ruhuna Charging Station",
    distance: 2.4,
    available: 6,
    total: 8,
    power: 150,
  };

  return (
    <div className="home-page">
      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="logo" style={{ textDecoration: "none" }}>
          <span className="logo-bolt">⚡</span>
          <span>EVChargeHub</span>
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link className="active" to="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/user/stations" onClick={() => setMobileMenuOpen(false)}>
            Stations
          </Link>
          <Link to="/user/help" onClick={() => setMobileMenuOpen(false)}>
            About & Help
          </Link>
          <Link to="/login" className="login-btn" onClick={() => setMobileMenuOpen(false)}>
            Login
          </Link>
        </div>

        <button
          className="mobile-menu-toggle nav-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="hero">
        {/* LEFT COLUMN: HERO CONTENT */}
        <section className="hero-left">
          {/* BADGE */}
          <div className="hero-badge">
            <span className="hero-badge-bolt">⚡</span>
            <span>Smart EV Charging Platform</span>
          </div>

          {/* MAIN HEADING */}
          <h1 className="hero-title">
            <span className="hero-title-dark">Find. Book. Charge.</span>
            <span className="hero-title-green">
              Your EV Journey
              <br />
              Made Simple.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="hero-description">
            Discover nearby EV charging stations, check real-time availability, and reserve
            your charging slot in seconds.
          </p>

          {/* ACTION BUTTONS */}
          <div className="hero-buttons">
            <Link to="/user/stations" className="hero-btn-primary">
              <span>Find Charging Stations</span>
              <span className="hero-btn-arrow">→</span>
            </Link>

            <Link to="/user/stations" className="hero-btn-secondary">
              Explore Stations
            </Link>
          </div>

          {/* STATISTICS ROW */}
          <div className="hero-stats">
            {/* Stat 1: Charging Stations */}
            <div className="hero-stat-card">
              <div className="hero-stat-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="3" width="10" height="18" rx="1" />
                  <path d="M7 7h4" />
                  <path d="M7 11h4" />
                  <path d="M14 8h2l2 3v6a2 2 0 0 0 2 2" />
                  <path d="M18 11h2" />
                  <path d="M7 21v-4h4v4" />
                </svg>
              </div>
              <div className="hero-stat-content">
                <strong>100+</strong>
                <span>Charging Stations</span>
              </div>
            </div>

            <div className="hero-stat-separator" />

            {/* Stat 2: Islandwide Network */}
            <div className="hero-stat-card">
              <div className="hero-stat-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <div className="hero-stat-content">
                <strong>Islandwide</strong>
                <span>Network</span>
              </div>
            </div>

            <div className="hero-stat-separator" />

            {/* Stat 3: Real-Time Availability */}
            <div className="hero-stat-card">
              <div className="hero-stat-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div className="hero-stat-content">
                <strong>Real-Time</strong>
                <span>Availability</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: HERO IMAGE & FLOATING STATION CARD */}
        <section className="hero-right">
          <div className="hero-visual-wrapper">
            <div className="green-circle circle-one" />
            <div className="green-circle circle-two" />

            {/* FLOATING NEAREST STATION CARD */}
            <Link
              to="/user/stations/1"
              className="station-card-link"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="station-card">
                <div className="card-top">
                  {/* LOCATION ICON */}
                  <div className="location-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M12 2C7.8 2 4.5 5.3 4.5 9.5C4.5 15 12 22 12 22C12 22 19.5 15 19.5 9.5C19.5 5.3 16.2 2 12 2Z" />
                      <circle cx="12" cy="9.5" r="2.5" fill="#e4f7eb" />
                    </svg>
                  </div>

                  <div className="station-info">
                    <span className="small-text">Nearest Station</span>
                    <h2>{station.distance} km away</h2>
                    <p>{station.name}</p>
                  </div>

                  <div
                    className={
                      station.available > 0 ? "status available" : "status unavailable"
                    }
                  >
                    <span className="status-dot" />
                    {station.available > 0 ? "Available" : "Full"}
                  </div>
                </div>

                <div className="divider" />

                <div className="card-bottom">
                  {/* CHARGERS AVAILABLE */}
                  <div className="card-stat">
                    <div className="card-stat-icon">
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="4" y="3" width="10" height="18" rx="1" />
                        <path d="M7 7h4" />
                        <path d="M7 11h4" />
                        <path d="M14 8h2l2 3v6a2 2 0 0 0 2 2" />
                        <path d="M18 11h2" />
                        <path d="M7 21v-4h4v4" />
                      </svg>
                    </div>

                    <div>
                      <strong>
                        {station.available} / {station.total}
                      </strong>
                      <span>Chargers Available</span>
                    </div>
                  </div>

                  <div className="card-vertical-line" />

                  {/* FAST CHARGING */}
                  <div className="card-stat">
                    <div className="card-stat-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M13.2 2L5.8 13H11L9.8 22L18.2 10H13Z" />
                      </svg>
                    </div>

                    <div>
                      <strong>{station.power} kW</strong>
                      <span>Fast Charging</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* EV HERO IMAGE */}
            <img
              src={heroImage}
              alt="Electric car charging at clean energy station"
              className="hero-image"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0d1117",
      color: "#e6edf3",
      padding: "24px",
      textAlign: "center"
    }}>
      <div style={{
        fontSize: "48px",
        marginBottom: "16px"
      }}>⚡ 404</div>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "12px", color: "#22c55e" }}>
        Page Not Found
      </h1>
      <p style={{ color: "#8b949e", maxWidth: "420px", marginBottom: "28px", lineHeight: "1.6" }}>
        The route you are looking for doesn't exist or has moved. Let's get you back on the right road.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/" style={{
          backgroundColor: "#16a34a",
          color: "#ffffff",
          padding: "10px 20px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600"
        }}>
          Return Home
        </Link>
        <Link to="/user/dashboard" style={{
          backgroundColor: "#21262d",
          color: "#e6edf3",
          border: "1px solid #30363d",
          padding: "10px 20px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600"
        }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default App;