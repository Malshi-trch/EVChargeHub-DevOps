import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./UserDashboard.css";

import heroImage from "../assets/dashboard-hero.png";
import vehicleImage from "../assets/tesla-model3.png";
import {
  BoltIcon,
  HomeIcon,
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  SettingsIcon,
  HelpIcon,
  SearchIcon,
  BellIcon,
  LogoutIcon,
  PlugIcon,
  RouteIcon,
  ArrowRightIcon,
} from "../components/Icons";
import { initialStations } from "../data/mockStations";
import { logout } from "../services/authService";

// Leaflet default marker fix
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});


function UserDashboard() {
  const savedProfile = JSON.parse(localStorage.getItem("evUserProfile") || "null");
  const savedVehicle = JSON.parse(localStorage.getItem("evVehicleDetails") || "null");
  const savedBookings = JSON.parse(localStorage.getItem("evBookings") || "[]");
  const savedFavourites = JSON.parse(localStorage.getItem("evFavouriteStations") || "[]");

  const user = {
    name: savedProfile?.fullName || "Hareen",
    vehicle: savedVehicle?.vehicleModel || "Tesla Model 3",
    battery: 68,
  };

  const activeBookings = savedBookings.filter((b) => b.status === "Confirmed");
  const activeBookingsCount = activeBookings.length > 0 ? activeBookings.length : 1;
  const activeBookingTime = activeBookings.length > 0 
    ? `${activeBookings[0].date?.day || "Today"}, ${activeBookings[0].time || "2:30 PM"}`
    : "Today, 2:30 PM";

  const completedCount = savedBookings.filter((b) => b.status === "Completed").length;
  const totalSessionsCount = completedCount > 0 ? completedCount : 24;
  const favouritesCount = savedFavourites.length > 0 ? savedFavourites.length : 5;

  const stations = initialStations.slice(0, 3);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const search = searchTerm.trim();

    if (search) {
      navigate(
        `/user/stations?search=${encodeURIComponent(search)}`
      );
    } else {
      navigate("/user/stations");
    }
  };

  const [vehicleMenuOpen, setVehicleMenuOpen] =
  useState(false);

  return (
    <div className="new-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="new-sidebar">

        <Link to="/" className="new-logo">
          <div className="logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>


        <div className="new-menu">

          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="new-menu-item active"
          >
            <HomeIcon />
              <span>Dashboard</span>
          </Link>

          <Link to="/user/stations" className="new-menu-item">
            <LocationIcon />
            <span>Find Stations</span>
          </Link>

          <Link
            to="/user/bookings"
            className="new-menu-item"
          >
            <CalendarIcon />
            <span>My Bookings</span>
          </Link>

          <Link
            to="/user/history"
            className="new-menu-item"
          >
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link
            to="/user/favourites"
            className="new-menu-item"
          >
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>

          <p className="menu-section-title">
            ACCOUNT
          </p>

          <Link
            to="/user/settings"
            className="new-menu-item"
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link
            to="/user/help"
            className="new-menu-item"
          >
            <HelpIcon />
            <span>Help & Support</span>
          </Link>

        </div>


        <div className="new-user-profile">

          <div className="profile-avatar">
            H
          </div>

          <div className="profile-information">
            <strong>{user.name}</strong>
            <span>EV User</span>
          </div>

          <span className="profile-more">
            ⋮
          </span>

        </div>

      </aside>



      {/* ================= MAIN ================= */}

      <main className="new-main">


        {/* HEADER */}

        <header className="new-header">

          <div className="welcome-user">

            <h1>
              Good Morning, {user.name} 👋
            </h1>

            <p>
              Ready to power up your journey?
            </p>

          </div>


          <div className="header-right">

            <form
              className="dashboard-search"
              onSubmit={handleSearch}
            >
              <SearchIcon size={18} />

              <input
                type="text"
                placeholder="Search stations, locations or cities..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </form>

            <button
              className="header-icon-button"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span className="notification-dot"></span>
            </button>

            <button
              type="button"
              className="new-logout"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              style={{ border: "none", cursor: "pointer" }}
            >
              <LogoutIcon size={17} />
              <span>Logout</span>
            </button>

          </div>

        </header>



        {/* ================= HERO ================= */}

        <section className="dashboard-hero">

          <img
            src={heroImage}
            alt="Electric vehicle charging station"
            className="dashboard-hero-image"
          />

          <div className="dashboard-hero-overlay"></div>

          <div className="dashboard-hero-content">

            <span className="hero-small-label">
              SMART EV CHARGING
            </span>

            <h2>
              Find, Book and <span>Charge</span>
            </h2>

            <p>
              Discover EV charging stations near you and check
              real-time availability.
            </p>

            <button
              className="hero-find-button"
              onClick={() => navigate("/user/stations")}
            >
              Find Stations
              <ArrowRightIcon size={17} />
            </button>

          </div>

        </section>


        {/* ================= STATS ================= */}

        <section className="new-stats">

          {/* ACTIVE BOOKING */}
          <div className="new-stat-card">
            <div className="stat-top">
              <div className="new-stat-icon booking-icon">
                <BoltIcon size={22} />
              </div>

              <span className="stat-green-text">Active</span>
            </div>

            <div className="stat-content-row">
              <div>
                <strong className="stat-number">{activeBookingsCount}</strong>
                <p>Active Booking</p>
                <small>{activeBookingTime}</small>
              </div>

              <div className="mini-chart green-chart">
                <svg viewBox="0 0 120 50" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    className="chart-area"
                    d="M0 43 C12 40, 18 34, 28 36 S45 28, 55 30 S70 17, 80 22 S96 8, 120 12 L120 50 L0 50 Z"
                  />

                  <path
                    className="chart-line"
                    d="M0 43 C12 40, 18 34, 28 36 S45 28, 55 30 S70 17, 80 22 S96 8, 120 12"
                  />
                </svg>
              </div>
            </div>
          </div>


          {/* TOTAL SESSIONS */}
          <div className="new-stat-card">
            <div className="stat-top">
              <div className="new-stat-icon sessions-icon">
                <CalendarIcon size={21} />
              </div>

              <span className="positive-change">
                ↗ 12%
              </span>
            </div>

            <div className="stat-content-row">
              <div>
                <strong className="stat-number">{totalSessionsCount}</strong>
                <p>Total Sessions</p>
                <small>This month</small>
              </div>

              <div className="mini-chart blue-chart">
                <svg viewBox="0 0 120 50" preserveAspectRatio="none">
                  <path
                    className="chart-area"
                    d="M0 42 C15 36, 21 39, 32 31 S50 35, 61 24 S78 28, 89 17 S103 21, 120 7 L120 50 L0 50 Z"
                  />

                  <path
                    className="chart-line"
                    d="M0 42 C15 36, 21 39, 32 31 S50 35, 61 24 S78 28, 89 17 S103 21, 120 7"
                  />
                </svg>
              </div>
            </div>
          </div>


          {/* NEARBY STATIONS */}
          <div className="new-stat-card">
            <div className="stat-top">
              <div className="new-stat-icon location-stat-icon">
                <LocationIcon size={21} />
              </div>

              <span className="neutral-change">
                10 km
              </span>
            </div>

            <div className="stat-content-row">
              <div>
                <strong className="stat-number">{stations.length}</strong>
                <p>Nearby Stations</p>
                <small>Around your location</small>
              </div>

              <div className="mini-chart orange-chart">
                <svg viewBox="0 0 120 50" preserveAspectRatio="none">
                  <path
                    className="chart-area"
                    d="M0 40 C12 33, 21 36, 30 27 S47 29, 57 24 S75 31, 86 19 S103 13, 120 15 L120 50 L0 50 Z"
                  />

                  <path
                    className="chart-line"
                    d="M0 40 C12 33, 21 36, 30 27 S47 29, 57 24 S75 31, 86 19 S103 13, 120 15"
                  />
                </svg>
              </div>
            </div>
          </div>


          {/* FAVOURITES */}
          <div className="new-stat-card">
            <div className="stat-top">
              <div className="new-stat-icon favourite-icon">
                <HeartIcon size={21} />
              </div>

              <span className="neutral-change">
                Saved
              </span>
            </div>

            <div className="stat-content-row">
              <div>
                <strong className="stat-number">{favouritesCount}</strong>
                <p>Favourites</p>
                <small>Saved stations</small>
              </div>

              <div className="mini-chart pink-chart">
                <svg viewBox="0 0 120 50" preserveAspectRatio="none">
                  <path
                    className="chart-area"
                    d="M0 41 C14 38, 22 29, 32 33 S49 22, 59 27 S76 16, 87 20 S104 9, 120 11 L120 50 L0 50 Z"
                  />

                  <path
                    className="chart-line"
                    d="M0 41 C14 38, 22 29, 32 33 S49 22, 59 27 S76 16, 87 20 S104 9, 120 11"
                  />
                </svg>
              </div>
            </div>
          </div>

        </section>


        {/* ================= BOTTOM ================= */}

        <section className="dashboard-bottom-grid">


          {/* NEARBY STATIONS */}

          <div className="nearby-panel">

            <div className="dashboard-panel-heading">

              <div>
                <h3>
                  Nearby Charging Stations
                </h3>

                <p>
                  Charging locations around you
                </p>
              </div>


              <button
                onClick={() => navigate("/user/stations")}
              >
                View All →
              </button>

            </div>



            <div className="station-map-layout">


              {/* STATION LIST */}

              <div className="new-station-list">

                {stations.map((station) => (

                  <div
                    className="new-station-card"
                    key={station.id}
                  >

                    <img
                      src={station.image}
                      alt={station.name}
                    />


                    <div className="new-station-info">

                      <div className="station-name-row">

                        <strong>
                          {station.name}
                        </strong>


                        {station.sourceType ===
                        "EVCHARGEHUB" ? (

                          <span className="bookable-badge">
                            ✓ Bookable
                          </span>

                        ) : (

                          <span className="public-badge">
                            Public
                          </span>

                        )}

                      </div>


                      <div className="station-meta">
                        <span className="station-distance">
                          ⌖ {station.distance}
                          <span className="meta-dot">•</span>
                          ⚡ {station.power}
                        </span>

                        <div className="station-rating">
                          <span className="rating-star">★</span>

                          <strong>{station.rating}</strong>

                          <span className="review-count">
                            ({station.reviews} reviews)
                          </span>
                        </div>
                      </div>


                      {station.sourceType ===
                      "EVCHARGEHUB" ? (

                        <div className="station-card-bottom">

                          <span className="available-text">
                            ● {station.available} /{" "}
                            {station.total} Available
                          </span>

                          <button
                            onClick={() =>
                              navigate(
                                `/user/stations/${station.id}/book`
                              )
                            }
                          >
                            Book Now
                          </button>

                        </div>

                      ) : (

                        <div className="station-card-bottom">

                          <span className="public-information">
                            Basic station information
                          </span>

                          <button
                            className="details-button"
                            onClick={() =>
                              navigate(
                                `/user/stations/${station.id}`
                              )
                            }
                          >
                            Details
                          </button>

                        </div>

                      )}

                    </div>

                  </div>

                ))}

              </div>



              {/* REAL MAP */}

              <div className="real-map">

                <MapContainer
                  center={[5.947, 80.56]}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="leaflet-map"
                >

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  {stations.map((station) => (

                    <Marker
                      key={station.id}
                      position={station.position}
                    >

                      <Popup>

                        <div className="map-popup">

                          <strong>
                            {station.name}
                          </strong>

                          <p>
                            {station.power}
                          </p>


                          {station.sourceType ===
                          "EVCHARGEHUB" ? (

                            <>
                              <span className="popup-available">
                                ● {station.available} chargers available
                              </span>

                              <button
                                onClick={() =>
                                  navigate(
                                    `/user/stations/${station.id}/book`
                                  )
                                }
                              >
                                Book Now
                              </button>
                            </>

                          ) : (

                            <span>
                              Public charging location
                              <br />
                              Booking unavailable
                            </span>

                          )}

                        </div>

                      </Popup>

                    </Marker>

                  ))}

                </MapContainer>

              </div>

            </div>

          </div>



          {/* RIGHT COLUMN */}

          <div className="dashboard-right-column">


            {/* VEHICLE */}
            <div className="vehicle-dashboard-card">
              <div className="vehicle-menu-wrapper">
                <button
                  className="vehicle-more-button"
                  onClick={() =>
                    setVehicleMenuOpen(
                      (previous) => !previous
                    )
                  }
                  aria-label="Vehicle options"
                >
                  •••
                </button>

                {vehicleMenuOpen && (
                  <div className="vehicle-options-menu">
                    <button
                      onClick={() =>
                        navigate("/user/settings#vehicle")
                      }
                    >
                      Change Vehicle
                    </button>

                    <button
                      onClick={() =>
                        navigate("/user/settings#vehicle")
                      }
                    >
                      Edit Vehicle Details
                    </button>
                  </div>
                )}
              </div>

              <img
                src={vehicleImage}
                alt={user.vehicle}
                className="dashboard-vehicle-image"
              />

              <div className="vehicle-name">
                <div>
                  <strong>
                    {user.vehicle}
                  </strong>
                  <span>
                    Electric Vehicle
                  </span>
                </div>

                <span className="connected-badge">
                  ● Connected
                </span>
              </div>

              <div className="vehicle-battery-heading">
                <span>
                  Battery Level
                </span>
                <strong>
                  {user.battery}%
                </strong>
              </div>

              <div className="new-battery-bar">
                <div
                  className="new-battery-level"
                  style={{
                    width: `${user.battery}%`,
                  }}
                ></div>
              </div>

              <div className="vehicle-details">
                <div>
                  <span>Range</span>
                  <strong>284 km</strong>
                </div>

                <div>
                  <span>Connector</span>
                  <strong>CCS</strong>
                </div>
              </div>

              <button
                className="manage-vehicle-button"
                onClick={() =>
                  navigate("/user/settings#vehicle")
                }
              >
                Manage Vehicle
              </button>
            </div>

            {/* QUICK ACTIONS */}
            <div className="quick-action-grid">
              <button
                onClick={() => navigate("/user/stations")}
              >
                <RouteIcon size={21} />
                <span>Plan a Route</span>
              </button>

              <button
                onClick={() => navigate("/user/stations")}
              >
                <CalendarIcon size={21} />
                <span>Book a Station</span>
              </button>

              <button
                onClick={() =>
                  navigate("/user/favourites")
                }
              >
                <HeartIcon size={21} />
                <span>Favourites</span>
              </button>

              <button
                onClick={() =>
                  navigate("/user/history")
                }
              >
                <PlugIcon size={21} />
                <span>Charging</span>
              </button>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}

export default UserDashboard;