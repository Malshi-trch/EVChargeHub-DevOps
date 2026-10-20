import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ChargingHistory.css";

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

function ChargingHistory() {
  const [bookings] = useState(() => {
    return JSON.parse(
      localStorage.getItem("evBookings") || "[]"
    );
  });
  const [searchTerm, setSearchTerm] = useState("");

  const completedBookings = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === "Completed")
      .filter((booking) => {
        const search = searchTerm.toLowerCase();

        return (
          booking.station.name
            .toLowerCase()
            .includes(search) ||
          booking.bookingId
            .toLowerCase()
            .includes(search) ||
          booking.vehicle.name
            .toLowerCase()
            .includes(search)
        );
      });
  }, [bookings, searchTerm]);

  const totalEnergy = completedBookings.reduce(
    (total, booking) =>
      total + Number(booking.estimatedEnergy || 0),
    0
  );

  const totalSpent = completedBookings.reduce(
    (total, booking) =>
      total + Number(booking.estimatedPrice || 0),
    0
  );

  return (
    <div className="history-dashboard">

      {/* SIDEBAR */}

      <aside className="history-sidebar">

        <Link to="/" className="history-logo">
          <div className="history-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="history-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>


        <div className="history-menu">

          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="history-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/user/stations"
            className="history-menu-item"
          >
            <LocationIcon />
            <span>Find Stations</span>
          </Link>

          <Link
            to="/user/bookings"
            className="history-menu-item"
          >
            <CalendarIcon />
            <span>My Bookings</span>
          </Link>

          <Link
            to="/user/history"
            className="history-menu-item active"
          >
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link
            to="/user/favourites"
            className="history-menu-item"
          >
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>


          <p className="history-menu-section">
            ACCOUNT
          </p>

          <Link
            to="/user/settings"
            className="history-menu-item"
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link
            to="/user/help"
            className="history-menu-item"
          >
            <HelpIcon />
            <span>Help & Support</span>
          </Link> 

        </div>


        <div className="history-profile">

          <div className="history-avatar">
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

      <main className="history-main">

        {/* HEADER */}

        <header className="history-header">

          <div>
            <span className="history-eyebrow">
              CHARGING ACTIVITY
            </span>

            <h1>Charging History</h1>

            <p>
              View your previous EV charging sessions
              and usage summary.
            </p>
          </div>


          <div className="history-header-actions">

            <button
              className="history-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>

            <Link
              to="/login"
              className="history-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>

          </div>

        </header>


        {/* SUMMARY */}

        <section className="history-stats">

          <div className="history-stat-card">

            <div className="history-stat-icon">
              <BoltIcon size={21} />
            </div>

            <div>
              <span>Total Sessions</span>

              <strong>
                {completedBookings.length}
              </strong>

              <small>
                Completed charging sessions
              </small>
            </div>

          </div>


          <div className="history-stat-card">

            <div className="history-stat-icon">
              <PlugIcon size={21} />
            </div>

            <div>
              <span>Total Energy</span>

              <strong>
                {totalEnergy}
                <small> kWh</small>
              </strong>

              <small>
                Estimated energy charged
              </small>
            </div>

          </div>


          <div className="history-stat-card">

            <div className="history-stat-icon">
              <CalendarIcon size={21} />
            </div>

            <div>
              <span>Total Spent</span>

              <strong>
                <small>LKR </small>
                {totalSpent.toLocaleString()}
              </strong>

              <small>
                Estimated charging cost
              </small>
            </div>

          </div>

        </section>


        {/* HISTORY PANEL */}

        <section className="history-panel">

          <div className="history-panel-top">

            <div>
              <h2>Charging Sessions</h2>

              <p>
                Your completed charging activity.
              </p>
            </div>


            <div className="history-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search station, booking ID..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

          </div>


          {/* LIST */}

          <div className="history-list">

            {completedBookings.length === 0 ? (

              <div className="history-empty">

                <div>
                  <BoltIcon size={30} />
                </div>

                <h3>No charging history yet</h3>

                <p>
                  Your completed charging sessions
                  will appear here.
                </p>

                <Link to="/user/stations">
                  Find Charging Station
                  <ArrowRightIcon size={15} />
                </Link>

              </div>

            ) : (

              completedBookings.map((booking) => (

                <article
                  className="history-session-card"
                  key={booking.bookingId}
                >

                  {/* IMAGE */}

                  <div className="history-image">

                    <img
                      src={booking.station.image}
                      alt={booking.station.name}
                    />

                    <span>
                      ✓ Completed
                    </span>

                  </div>


                  {/* CONTENT */}

                  <div className="history-session-content">

                    <div className="history-session-heading">

                      <div>

                        <span>
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


                      <div className="history-session-price">

                        <small>
                          Estimated Cost
                        </small>

                        <strong>
                          LKR{" "}
                          {booking.estimatedPrice.toLocaleString()}
                        </strong>

                      </div>

                    </div>


                    {/* DETAILS */}

                    <div className="history-session-details">

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
                          <small>Energy</small>

                          <strong>
                            {booking.estimatedEnergy} kWh
                          </strong>
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

                    <div className="history-session-footer">

                      <div>
                        <span>
                          {booking.charger.connector}
                        </span>

                        <span>
                          {booking.charger.power} kW
                        </span>

                        <span>
                          {booking.vehicle.plate}
                        </span>
                      </div>


                      <Link
                        to={`/user/bookings/${booking.bookingId}`}
                      >
                        View Session Details
                        <ArrowRightIcon size={13} />
                      </Link>

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

export default ChargingHistory;