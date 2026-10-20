import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./StationDetails.css";

import { getFindStationsList } from "../data/mockStations";

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
  RouteIcon,
  ArrowRightIcon,
} from "../components/Icons";


/* =========================================================
   LEAFLET MARKER FIX
========================================================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});


/* =========================================================
   PAGE
========================================================= */

function StationDetails() {
  const { stationId } = useParams();

  const stations = getFindStationsList();

  const station =
    stations.find(
      (item) => String(item.id) === String(stationId)
    ) || stations[0];

  const isBookable =
    station.sourceType === "EVCHARGEHUB";
    const [isFavourite, setIsFavourite] = useState(() => {
  const savedFavourites = JSON.parse(
    localStorage.getItem("evFavouriteStations") || "[]"
  );

  return savedFavourites.some(
    (item) => item.id === Number(stationId)
  );
});


const toggleFavourite = () => {
  const savedFavourites = JSON.parse(
    localStorage.getItem("evFavouriteStations") || "[]"
  );

  const alreadyFavourite = savedFavourites.some(
    (item) => item.id === station.id
  );

  let updatedFavourites;

  if (alreadyFavourite) {
    updatedFavourites = savedFavourites.filter(
      (item) => item.id !== station.id
    );

    setIsFavourite(false);
  } else {
    const favouriteStation = {
      id: station.id,
      name: station.name,
      address: station.address,
      image: station.image,
      rating: station.rating,
      reviews: station.reviews,
      sourceType: station.sourceType,

      power:
        station.chargers?.[0]?.power || "",

      connector:
        station.chargers?.[0]?.connector || "",

      distance: station.distance || "",
    };

    updatedFavourites = [
      ...savedFavourites,
      favouriteStation,
    ];

    setIsFavourite(true);
  }

  localStorage.setItem(
    "evFavouriteStations",
    JSON.stringify(updatedFavourites)
  );
};

  return (
    <div className="details-dashboard">

      {/* ===================================================
          SIDEBAR
      ==================================================== */}

      <aside className="details-sidebar">

        <Link to="/" className="details-logo">

          <div className="details-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="details-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>

        </Link>


        <div className="details-menu">

          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="details-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>


          <Link
            to="/user/stations"
            className="details-menu-item active"
          >
            <LocationIcon />
            <span>Find Stations</span>
          </Link>


          <Link to="/user/bookings" className="details-menu-item">
            <CalendarIcon />
            <span>My Bookings</span>
          </Link>

          <Link to="/user/history" className="details-menu-item">
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link to="/user/favourites" className="details-menu-item">
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>

          <p className="details-menu-section">
            ACCOUNT
          </p>

          <Link
            to="/user/settings"
            className="details-menu-item"
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link to="/user/help" className="details-menu-item">
            <HelpIcon />
            <span>Help & Support</span>
          </Link>

        </div>


        <div className="details-profile">

          <div className="details-profile-avatar">
            H
          </div>

          <div className="details-profile-info">
            <strong>Hareen</strong>
            <span>EV User</span>
          </div>

          <span className="details-profile-more">
            ⋮
          </span>

        </div>

      </aside>


      {/* ===================================================
          MAIN
      ==================================================== */}

      <main className="details-main">

        {/* HEADER */}

        <header className="details-header">

          <div className="details-breadcrumb-area">

            <Link to="/user/stations">
              ← Back to Stations
            </Link>

            <div className="details-breadcrumb">
              Find Stations
              <span>/</span>
              Station Details
            </div>

          </div>


          <div className="details-header-actions">

            <button
              className="details-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>


            <Link
              to="/login"
              className="details-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>

          </div>

        </header>


        {/* =================================================
            HERO / STATION INTRO
        ================================================== */}

        <section className="station-details-hero">

          <div className="station-details-image">

            <img
              src={station.image}
              alt={station.name}
            />

            <div className="station-image-overlay"></div>


            <div className="hero-station-badges">

              {isBookable ? (
                <span className="verified-station-badge">
                  ✓ EVChargeHub Verified
                </span>
              ) : (
                <span className="external-station-badge">
                  Public Station
                </span>
              )}

              {isBookable &&
                station.available > 0 && (
                  <span className="hero-available-badge">
                    ● Available Now
                  </span>
                )}

            </div>


            <button
              className={`hero-favourite-button ${isFavourite ? "active" : ""}`}
              onClick={toggleFavourite}
              aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
              style={{
                color: isFavourite ? "#ef4444" : "#ffffff",
                backgroundColor: isFavourite ? "rgba(239, 68, 68, 0.25)" : "rgba(0,0,0,0.5)",
                borderColor: isFavourite ? "#ef4444" : "rgba(255,255,255,0.2)"
              }}
            >
              <HeartIcon size={18} fill={isFavourite ? "#ef4444" : "none"} />
            </button>

          </div>


          <div className="station-details-summary">

            <div className="station-summary-top">

              <div>
                <span className="station-category">
                  EV CHARGING STATION
                </span>

                <h1>{station.name}</h1>

                <div className="station-location-line">
                  <LocationIcon size={15} />
                  <span>{station.address}</span>
                </div>
              </div>


              <div className="details-rating">

                <div>
                  <span>★</span>
                  <strong>{station.rating}</strong>
                </div>

                <small>
                  {station.reviews} reviews
                </small>

              </div>

            </div>


            <p className="station-description">
              {station.description}
            </p>


            <div className="station-summary-stats">

              <div>
                <div className="summary-stat-icon">
                  <RouteIcon size={19} />
                </div>

                <span>
                  <small>Distance</small>
                  <strong>
                    {station.distance}
                  </strong>
                </span>
              </div>


              <div>
                <div className="summary-stat-icon">
                  <ClockIcon size={19} />
                </div>

                <span>
                  <small>Opening Hours</small>
                  <strong>
                    {station.openingHours}
                  </strong>
                </span>
              </div>


              <div>
                <div className="summary-stat-icon">
                  <BoltIcon size={19} />
                </div>

                <span>
                  <small>Charging Price</small>

                  <strong>
                    {station.price}
                    <em>
                      {" "}
                      {station.priceUnit}
                    </em>
                  </strong>
                </span>
              </div>

            </div>


            {isBookable ? (

              <div className="hero-availability">

                <div>

                  <span>
                    Charger Availability
                  </span>

                  <strong>
                    {station.available} /{" "}
                    {station.total} available
                  </strong>

                </div>


                <div className="hero-availability-bar">

                  <div
                    style={{
                      width: `${
                        (station.available /
                          station.total) *
                        100
                      }%`,
                    }}
                  ></div>

                </div>

              </div>

            ) : (

              <div className="public-booking-notice">
                This is a public charging location.
                Booking through EVChargeHub is not
                available.
              </div>

            )}

          </div>

        </section>


        {/* =================================================
            CONTENT GRID
        ================================================== */}

        <section className="details-content-grid">

          {/* ===============================================
              LEFT SIDE
          ================================================ */}

          <div className="details-left-column">

            {/* CHARGERS */}

            <div className="details-card">

              <div className="details-card-heading">

                <div>
                  <h2>Available Chargers</h2>

                  <p>
                    Choose a charger that suits
                    your vehicle.
                  </p>
                </div>


                {isBookable && (
                  <span className="charger-count">
                    {station.available} available
                  </span>
                )}

              </div>


              <div className="charger-list">

                {(station.chargers || []).map(
                  (charger) => (

                    <div
                      className="charger-item"
                      key={charger.id}
                    >

                      <div className="charger-icon">
                        <PlugIcon size={20} />
                      </div>


                      <div className="charger-name">

                        <strong>
                          {charger.name}
                        </strong>

                        <span>
                          {charger.connector}
                        </span>

                      </div>


                      <div className="charger-power">

                        <small>Max Power</small>

                        <strong>
                          {typeof charger.power === "number" ? `${charger.power} kW` : charger.power}
                        </strong>

                      </div>


                      <span
                        className={`charger-status ${
                          charger.status ===
                          "Available"
                            ? "available"
                            : charger.status ===
                              "In Use"
                            ? "in-use"
                            : "unknown"
                        }`}
                      >
                        ● {charger.status}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* FACILITIES */}

            <div className="details-card">

              <div className="details-card-heading">

                <div>
                  <h2>Station Facilities</h2>

                  <p>
                    Facilities available at this
                    charging location.
                  </p>
                </div>

              </div>


              <div className="facility-grid">

                {(station.facilities || []).map(
                  (facility) => (

                    <div
                      className="facility-item"
                      key={facility}
                    >

                      <span>✓</span>

                      <strong>
                        {facility}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* REVIEWS */}

            <div className="details-card">

              <div className="details-card-heading">

                <div>
                  <h2>Ratings & Reviews</h2>

                  <p>
                    What EV drivers say about this
                    station.
                  </p>
                </div>

                <button className="all-reviews-button">
                  View All Reviews
                </button>

              </div>


              <div className="review-summary">

                <div className="review-score">

                  <strong>
                    {station.rating}
                  </strong>

                  <div>
                    ★★★★★
                  </div>

                  <span>
                    Based on {station.reviews} reviews
                  </span>

                </div>


                <div className="review-bars">

                  <div>
                    <span>5</span>
                    <div>
                      <i style={{ width: "82%" }}></i>
                    </div>
                    <small>82%</small>
                  </div>

                  <div>
                    <span>4</span>
                    <div>
                      <i style={{ width: "12%" }}></i>
                    </div>
                    <small>12%</small>
                  </div>

                  <div>
                    <span>3</span>
                    <div>
                      <i style={{ width: "4%" }}></i>
                    </div>
                    <small>4%</small>
                  </div>

                  <div>
                    <span>2</span>
                    <div>
                      <i style={{ width: "1%" }}></i>
                    </div>
                    <small>1%</small>
                  </div>

                  <div>
                    <span>1</span>
                    <div>
                      <i style={{ width: "1%" }}></i>
                    </div>
                    <small>1%</small>
                  </div>

                </div>

              </div>


              <div className="sample-review">

                <div className="review-user">

                  <div className="review-avatar">
                    AD
                  </div>

                  <div>
                    <strong>
                      Amal D.
                    </strong>

                    <span>
                      ★★★★★
                    </span>
                  </div>

                  <small>
                    2 days ago
                  </small>

                </div>


                <p>
                  Great charging experience. The
                  station was easy to find and the
                  charger worked smoothly.
                </p>

              </div>

            </div>

          </div>


          {/* ===============================================
              RIGHT SIDE
          ================================================ */}

          <div className="details-right-column">

            {/* BOOKING CARD */}

            <div className="booking-summary-card">

              <div className="booking-card-icon">
                <BoltIcon size={24} />
              </div>


              {isBookable ? (

                <>
                  <span className="booking-small-title">
                    READY TO CHARGE?
                  </span>

                  <h2>
                    Reserve your charging slot
                  </h2>

                  <p>
                    Book your charger in advance
                    and avoid waiting at the
                    station.
                  </p>


                  <div className="booking-price-row">

                    <span>Charging from</span>

                    <strong>
                      {station.price}
                      <small>
                        {station.priceUnit}
                      </small>
                    </strong>

                  </div>


                  <div className="booking-availability-row">

                    <span>
                      <i></i>
                      Available now
                    </span>

                    <strong>
                      {station.available} chargers
                    </strong>

                  </div>


                    <Link
                        to={`/user/stations/${station.id}/book`}
                        className="main-book-button"
                        >
                        Book Charging Slot
                        <ArrowRightIcon size={17} />
                    </Link>


                  <small className="booking-note">
                    No payment required until your
                    booking is confirmed.
                  </small>
                </>

              ) : (

                <>
                  <span className="booking-small-title">
                    PUBLIC STATION
                  </span>

                  <h2>
                    External charging location
                  </h2>

                  <p>
                    This station is listed for
                    information purposes. Online
                    booking is not available through
                    EVChargeHub.
                  </p>


                  <Link
                    to="/user/stations"
                    className="find-another-station"
                  >
                    Find Bookable Stations
                    <ArrowRightIcon size={16} />
                  </Link>
                </>

              )}

            </div>


            {/* MAP */}

            <div className="details-map-card">

              <div className="details-map-heading">

                <div>
                  <h3>Station Location</h3>

                  <p>
                    {station.address}
                  </p>
                </div>


                <span>
                  {station.distance}
                </span>

              </div>


              <div className="station-details-map">

                <MapContainer
                  key={station.id}
                  center={station.position}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="details-leaflet-map"
                >

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  <Marker
                    position={station.position}
                  >

                    <Popup>
                      <strong>
                        {station.name}
                      </strong>

                      <br />

                      {station.address}
                    </Popup>

                  </Marker>

                </MapContainer>

              </div>


              <button className="directions-button">
                <RouteIcon size={16} />
                Get Directions
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default StationDetails;