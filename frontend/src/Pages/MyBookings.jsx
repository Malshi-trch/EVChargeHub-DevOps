import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MyBookings.css";
import bookingService from "../services/bookingService";

import {
  BoltIcon,
  HomeIcon,
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  SettingsIcon,
  HelpIcon,
  BellIcon,
  LogoutIcon,
  PlugIcon,
  CarIcon,
  ArrowRightIcon,
} from "../components/Icons";

function MyBookings() {
  const [bookings, setBookings] = useState(() => {
    return JSON.parse(
      localStorage.getItem("evBookings") || "[]"
    );
  });
  const [activeTab, setActiveTab] = useState("Upcoming");

  useEffect(() => {
    let isMounted = true;
    async function loadBackendBookings() {
      try {
        const backendList = await bookingService.getMyBookings();
        if (isMounted && Array.isArray(backendList) && backendList.length > 0) {
          const normalized = backendList.map((b) => ({
            id: b.id,
            bookingId: b.bookingId || `EVH-${b.id}`,
            station: {
              id: b.stationId,
              name: b.stationName,
              address: b.stationAddress,
              pricePerKwh: b.pricePerKwh,
            },
            charger: {
              id: b.chargerId,
              name: b.chargerName,
              connector: b.connectorType,
              power: b.chargingPower,
            },
            date: {
              value: b.bookingDate,
              day: b.bookingDate,
            },
            time: b.startTime,
            vehicle: {
              name: b.vehicleName || "My EV",
              connector: b.connectorType,
            },
            estimatedEnergy: b.estimatedEnergy,
            estimatedPrice: b.totalPrice,
            status: b.status === "CONFIRMED" ? "Confirmed" : b.status === "COMPLETED" ? "Completed" : b.status === "CANCELLED" ? "Cancelled" : b.status || "Confirmed",
            createdAt: b.createdAt,
          }));

          setBookings((prev) => {
            const merged = [...normalized];
            const existingIds = new Set(normalized.map((n) => n.bookingId));
            prev.forEach((p) => {
              if (p.bookingId && !existingIds.has(p.bookingId)) {
                merged.push(p);
              }
            });
            localStorage.setItem("evBookings", JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not load bookings from backend:", err.message);
      }
    }

    loadBackendBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  const getBookingCategory = (booking) => {
    if (booking.status === "Cancelled") {
      return "Cancelled";
    }

    if (booking.status === "Completed") {
      return "Completed";
    }

    return "Upcoming";
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      getBookingCategory(booking) === activeTab
  );

  const upcomingCount = bookings.filter(
    (booking) =>
      getBookingCategory(booking) === "Upcoming"
  ).length;

  const completedCount = bookings.filter(
    (booking) =>
      getBookingCategory(booking) === "Completed"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) =>
      getBookingCategory(booking) === "Cancelled"
  ).length;

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    const target = bookings.find((b) => b.bookingId === bookingId || b.id === bookingId);
    if (target && target.id) {
      try {
        await bookingService.cancelBooking(target.id);
      } catch (e) {
        console.warn("Backend cancel error:", e.message);
      }
    }

    const updatedBookings = bookings.map(
      (booking) =>
        booking.bookingId === bookingId || booking.id === bookingId
          ? {
              ...booking,
              status: "Cancelled",
            }
          : booking
    );

    setBookings(updatedBookings);

    localStorage.setItem(
      "evBookings",
      JSON.stringify(updatedBookings)
    );
  };

  return (
    <div className="my-bookings-dashboard">

      {/* SIDEBAR */}

      <aside className="my-bookings-sidebar">

        <Link to="/" className="my-bookings-logo">
          <div className="my-bookings-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="my-bookings-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>


        <div className="my-bookings-menu">

          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="my-bookings-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>

          <Link to="/user/stations" className="my-bookings-menu-item">
            <LocationIcon />
            <span>Find Stations</span>
          </Link>

          <Link
            to="/user/bookings"
            className="my-bookings-menu-item active"
          >
            <CalendarIcon />
            <span>My Bookings</span>

            {upcomingCount > 0 && (
              <small className="my-bookings-menu-count">
                {upcomingCount}
              </small>
            )}
          </Link>

            <Link
                to="/user/history"
                className="my-bookings-menu-item"
            >
                <ClockIcon />
                <span>Charging History</span>
            </Link>

          <Link
            to="/user/favourites"
            className="my-bookings-menu-item"
          >
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>


          <p className="my-bookings-menu-section">
            ACCOUNT
          </p>

          <Link
            to="/user/settings"
            className="my-bookings-menu-item"
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link
            to="/user/help"
            className="my-bookings-menu-item"
          >
            <HelpIcon />
            <span>Help & Support</span>
          </Link>

        </div>


        <div className="my-bookings-profile">

          <div className="my-bookings-avatar">
            H
          </div>

          <div>
            <strong>Hareen</strong>
            <span>EV User</span>
          </div>

          <i>⋮</i>

        </div>

      </aside>


      {/* MAIN */}

      <main className="my-bookings-main">

        {/* HEADER */}

        <header className="my-bookings-header">

          <div>
            <span className="page-eyebrow">
              YOUR RESERVATIONS
            </span>

            <h1>My Bookings</h1>

            <p>
              View and manage your EV charging
              reservations.
            </p>
          </div>


          <div className="my-bookings-header-right">

            <button
              className="bookings-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>

            <Link
              to="/login"
              className="bookings-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>

          </div>

        </header>


        {/* SUMMARY CARDS */}

        <section className="booking-stats">

          <div className="booking-stat-card">

            <div className="booking-stat-icon green">
              <CalendarIcon size={20} />
            </div>

            <div>
              <span>Upcoming</span>
              <strong>{upcomingCount}</strong>
              <small>Active reservations</small>
            </div>

          </div>


          <div className="booking-stat-card">

            <div className="booking-stat-icon blue">
              <BoltIcon size={20} />
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedCount}</strong>
              <small>Charging sessions</small>
            </div>

          </div>


          <div className="booking-stat-card">

            <div className="booking-stat-icon gray">
              <ClockIcon size={20} />
            </div>

            <div>
              <span>Cancelled</span>
              <strong>{cancelledCount}</strong>
              <small>Cancelled bookings</small>
            </div>

          </div>

        </section>


        {/* BOOKINGS CONTAINER */}

        <section className="bookings-panel">

          <div className="bookings-panel-header">

            <div>
              <h2>Charging Reservations</h2>

              <p>
                Manage all your charging bookings
                from one place.
              </p>
            </div>


            <Link
              to="/user/stations"
              className="new-booking-button"
            >
              <span>+</span>
              New Booking
            </Link>

          </div>


          {/* TABS */}

          <div className="booking-tabs">

            {[
              {
                name: "Upcoming",
                count: upcomingCount,
              },
              {
                name: "Completed",
                count: completedCount,
              },
              {
                name: "Cancelled",
                count: cancelledCount,
              },
            ].map((tab) => (

              <button
                key={tab.name}
                className={
                  activeTab === tab.name
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(tab.name)
                }
              >
                {tab.name}

                <span>{tab.count}</span>
              </button>

            ))}

          </div>


          {/* BOOKINGS */}

          <div className="bookings-list">

            {filteredBookings.length === 0 ? (

              <div className="empty-bookings">

                <div className="empty-bookings-icon">
                  <CalendarIcon size={30} />
                </div>

                <h3>
                  No {activeTab.toLowerCase()} bookings
                </h3>

                <p>
                  {activeTab === "Upcoming"
                    ? "You don't have any upcoming charging reservations yet."
                    : `You don't have any ${activeTab.toLowerCase()} bookings.`}
                </p>

                {activeTab === "Upcoming" && (
                  <Link to="/user/stations">
                    Find a Charging Station
                    <ArrowRightIcon size={15} />
                  </Link>
                )}

              </div>

            ) : (

              filteredBookings.map((booking) => (

                <article
                  className="premium-booking-card"
                  key={booking.bookingId}
                >

                  {/* IMAGE */}

                  <div className="booking-station-image">

                    <img
                      src={booking.station.image}
                      alt={booking.station.name}
                    />

                    <span
                      className={`booking-status ${
                        booking.status === "Cancelled"
                          ? "cancelled"
                          : booking.status === "Completed"
                          ? "completed"
                          : ""
                      }`}
                    >
                      <i></i>
                      {booking.status}
                    </span>

                  </div>


                  {/* CONTENT */}

                  <div className="booking-card-content">

                    <div className="booking-card-heading">

                      <div>
                        <span>
                          BOOKING ID ·{" "}
                          {booking.bookingId}
                        </span>

                        <h3>
                          {booking.station.name}
                        </h3>

                        <p>
                          <LocationIcon size={12} />
                          {booking.station.address}
                        </p>
                      </div>

                    </div>


                    {/* INFO */}

                    <div className="booking-info-row">

                      <div>
                        <CalendarIcon size={16} />

                        <span>
                          <small>Date</small>

                          <strong>
                            {booking.date.date}{" "}
                            {booking.date.month}
                          </strong>
                        </span>
                      </div>


                      <div>
                        <ClockIcon size={16} />

                        <span>
                          <small>Time</small>

                          <strong>
                            {booking.time}
                          </strong>
                        </span>
                      </div>


                      <div>
                        <PlugIcon size={16} />

                        <span>
                          <small>Charger</small>

                          <strong>
                            {booking.charger.name}
                          </strong>

                          <em>
                            {booking.charger.power} kW
                          </em>
                        </span>
                      </div>


                      <div>
                        <CarIcon size={16} />

                        <span>
                          <small>Vehicle</small>

                          <strong>
                            {booking.vehicle.name}
                          </strong>
                        </span>
                      </div>

                    </div>


                    {/* FOOTER */}

                    <div className="booking-card-footer">

                      <div className="booking-estimate">

                        <span>
                          Estimated Total
                        </span>

                        <strong>
                          LKR{" "}
                          {booking.estimatedPrice.toLocaleString()}
                        </strong>

                      </div>


                      <div className="booking-actions">

                        {booking.status ===
                          "Confirmed" && (
                          <button
                            className="cancel-booking-button"
                            onClick={() =>
                              cancelBooking(
                                booking.bookingId
                              )
                            }
                          >
                            Cancel Booking
                          </button>
                        )}


                        <Link
                        to={`/user/bookings/${booking.bookingId}`}
                        state={{ booking }}
                        className="booking-details-button"
                        >
                        View Details
                        <ArrowRightIcon size={14} />
                        </Link>

                      </div>

                    </div>

                  </div>

                </article>

              ))

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default MyBookings;