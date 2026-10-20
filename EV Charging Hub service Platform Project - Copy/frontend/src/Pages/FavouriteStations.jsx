import { useState } from "react";
import { Link } from "react-router-dom";
import "./FavouriteStations.css";

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
  ArrowRightIcon,
} from "../components/Icons";

function FavouriteStations() {
  const [favourites, setFavourites] = useState(() => {
    return JSON.parse(
      localStorage.getItem("evFavouriteStations") || "[]"
    );
  });

  const removeFavourite = (stationId) => {
  const updatedFavourites = favourites.filter(
    (station) => station.id !== stationId
  );

  setFavourites(updatedFavourites);

  localStorage.setItem(
    "evFavouriteStations",
    JSON.stringify(updatedFavourites)
  );
  };


  return (
    <div className="fav-dashboard">

      {/* SIDEBAR */}

      <aside className="fav-sidebar">

        <Link to="/" className="fav-logo">
          <div className="fav-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="fav-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>

        <div className="fav-menu">

          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="fav-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/user/stations"
            className="fav-menu-item"
          >
            <LocationIcon />
            <span>Find Stations</span>
          </Link>

          <Link
            to="/user/bookings"
            className="fav-menu-item"
          >
            <CalendarIcon />
            <span>My Bookings</span>
          </Link>

          <Link
            to="/user/history"
            className="fav-menu-item"
          >
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link
            to="/user/favourites"
            className="fav-menu-item active"
          >
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>

          <p className="fav-menu-section">
            ACCOUNT
          </p>

          <Link
            to="/user/settings"
            className="fav-menu-item"
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link
            to="/user/help"
            className="fav-menu-item"
          >
            <HelpIcon />
            <span>Help & Support</span>
          </Link>

        </div>

        <div className="fav-profile">

          <div className="fav-avatar">
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

      <main className="fav-main">

        <header className="fav-header">

          <div>
            <span className="fav-eyebrow">
              SAVED LOCATIONS
            </span>

            <h1>Favourite Stations</h1>

            <p>
              Quickly access the charging stations
              you use most.
            </p>
          </div>

          <div className="fav-header-actions">

            <button
              className="fav-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>

            <Link
              to="/login"
              className="fav-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>

          </div>

        </header>


        {/* SUMMARY */}

        <section className="fav-summary">

          <div>

            <div className="fav-summary-icon">
              <HeartIcon size={22} />
            </div>

            <div>
              <span>Saved Stations</span>

              <strong>
                {favourites.length}
              </strong>

              <small>
                Favourite charging locations
              </small>
            </div>

          </div>

          <Link to="/user/stations">
            + Find More Stations
          </Link>

        </section>


        {/* CONTENT */}

        <section className="fav-panel">

          <div className="fav-panel-header">

            <div>
              <h2>Your Favourite Stations</h2>

              <p>
                Your saved charging locations in one place.
              </p>
            </div>

          </div>


          {favourites.length === 0 ? (

            <div className="fav-empty">

              <div className="fav-empty-icon">
                <HeartIcon size={31} />
              </div>

              <h3>No favourite stations yet</h3>

              <p>
                Save charging stations you like and
                they will appear here for quick access.
              </p>

              <Link to="/user/stations">
                Find Charging Stations
                <ArrowRightIcon size={15} />
              </Link>

            </div>

          ) : (

            <div className="fav-grid">

              {favourites.map((station) => (

                <article
                  className="fav-station-card"
                  key={station.id}
                >

                  <div className="fav-station-image">

                    <img
                      src={station.image}
                      alt={station.name}
                    />

                    <button
                      className="fav-heart-button"
                      onClick={() => removeFavourite(station.id)}
                      title="Remove from favourites"
                      aria-label={`Remove ${station.name} from favourites`}
                    >
                      <HeartIcon size={17} />
                    </button>

                    <span
                      className={`fav-source ${
                        station.sourceType === "PUBLIC"
                          ? "public"
                          : ""
                      }`}
                    >
                      {station.sourceType === "PUBLIC"
                        ? "Public Station"
                        : "EVChargeHub"}
                    </span>

                  </div>


                  <div className="fav-station-content">

                    <div className="fav-rating-row">

                      <span>
                        ★ {station.rating || "4.8"}
                      </span>

                      {station.reviews && (
                        <small>
                          {station.reviews} reviews
                        </small>
                      )}

                    </div>

                    <h3>
                      {station.name}
                    </h3>

                    <p className="fav-address">
                      <LocationIcon size={13} />
                      {station.address}
                    </p>


                    <div className="fav-station-info">

                      {station.power && (
                        <div>
                          <BoltIcon size={15} />

                          <span>
                            <small>Power</small>
                            <strong>
                              {String(station.power).includes("kW") ? station.power : `${station.power} kW`}
                            </strong>
                          </span>
                        </div>
                      )}

                      {station.connector && (
                        <div>
                          <PlugIcon size={15} />

                          <span>
                            <small>Connector</small>
                            <strong>
                              {station.connector}
                            </strong>
                          </span>
                        </div>
                      )}

                      {station.distance && (
                        <div>
                          <LocationIcon size={15} />

                          <span>
                            <small>Distance</small>
                            <strong>
                              {station.distance}
                            </strong>
                          </span>
                        </div>
                      )}

                    </div>


                    <div className="fav-card-footer">

                      {station.sourceType ===
                        "EVCHARGEHUB" && (
                        <span className="fav-bookable">
                          <i></i>
                          Booking Available
                        </span>
                      )}

                      {station.sourceType ===
                        "PUBLIC" && (
                        <span className="fav-public-info">
                          External Station
                        </span>
                      )}


                      <Link
                        to={`/user/stations/${station.id}`}
                      >
                        View Details
                        <ArrowRightIcon size={13} />
                      </Link>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default FavouriteStations;