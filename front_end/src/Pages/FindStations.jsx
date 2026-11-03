import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./FindStations.css";

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
  SearchIcon,
  BellIcon,
  LogoutIcon,
  PlugIcon,
  RouteIcon,
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
   MAP FLY COMPONENT
========================================================= */

function MapFlyTo({ position }) {
  const map = useMap();

  if (position) {
    map.flyTo(position, 15, {
      duration: 1.2,
    });
  }

  return null;
}


/* =========================================================
   PAGE
========================================================= */

function FindStations() {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchTerm(urlSearch);
  }

  const [stationType, setStationType] = useState("ALL");
  const [availability, setAvailability] = useState("ALL");
  const [connectorFilter, setConnectorFilter] = useState("ALL");
  const [fastOnly, setFastOnly] = useState(false);
  const [sortBy, setSortBy] = useState("nearest");
  const [selectedStation, setSelectedStation] = useState(null);
  const navigate = useNavigate();
  
  const [favourites, setFavourites] = useState(() => {
    return JSON.parse(
      localStorage.getItem("evFavouriteStations") || "[]"
    );
  });

  const user = {
    name: "Hareen",
  };

  /* =========================================================
     SEARCH + FILTER
  ========================================================= */

  const allStations = useMemo(() => getFindStationsList(), []);

  const filteredStations = useMemo(() => {
    const list = allStations.filter((station) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        station.name.toLowerCase().includes(searchValue) ||
        station.address.toLowerCase().includes(searchValue) ||
        station.connector.toLowerCase().includes(searchValue);

      const matchesType =
        stationType === "ALL" ||
        station.sourceType === stationType;

      const matchesAvailability =
        availability === "ALL" ||
        (availability === "AVAILABLE" &&
          station.sourceType === "EVCHARGEHUB" &&
          station.available > 0);

      const matchesConnector =
        connectorFilter === "ALL" ||
        station.connector === connectorFilter;

      const matchesFast =
        !fastOnly || (station.powerValue && station.powerValue >= 100);

      return (
        matchesSearch &&
        matchesType &&
        matchesAvailability &&
        matchesConnector &&
        matchesFast
      );
    });

    if (sortBy === "rating") {
      return [...list].sort((a, b) => b.rating - a.rating);
    } else {
      return [...list].sort((a, b) => a.distanceValue - b.distanceValue);
    }
  }, [allStations, searchTerm, stationType, availability, connectorFilter, fastOnly, sortBy]);


  function resetFilters() {
    setSearchTerm("");
    setStationType("ALL");
    setAvailability("ALL");
    setConnectorFilter("ALL");
    setFastOnly(false);
    setSortBy("nearest");
    setSelectedStation(null);
  }

  function toggleFavourite(event, station) {
  event.stopPropagation();

  const alreadyFavourite = favourites.some(
    (item) => item.id === station.id
  );

  let updatedFavourites;

  if (alreadyFavourite) {
    updatedFavourites = favourites.filter(
      (item) => item.id !== station.id
    );
  } else {
    updatedFavourites = [
      ...favourites,
      station,
    ];
  }

  setFavourites(updatedFavourites);

  localStorage.setItem(
    "evFavouriteStations",
    JSON.stringify(updatedFavourites)
  );
  }
  return (
    <div className="find-dashboard">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="find-sidebar">

        <Link to="/" className="find-logo">
          <div className="find-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="find-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>


        <div className="find-menu">

          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="find-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/user/stations"
            className="find-menu-item active"
          >
            <LocationIcon />
            <span>Find Stations</span>
          </Link>

          <Link
            to="/user/bookings"
            className="find-menu-item"
          >
            <CalendarIcon />
            <span>My Bookings</span>
            <small className="find-menu-count">
              1
            </small>
          </Link>

          <Link
            to="/user/history"
            className="find-menu-item"
          >
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link
            to="/user/favourites"
            className="find-menu-item"
          >
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>


          <p className="find-menu-section">
            ACCOUNT
          </p>

          <Link
            to="/user/settings"
            className="find-menu-item"
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link
            to="/user/help"
            className="find-menu-item"
          >
            <HelpIcon />
            <span>Help & Support</span>
          </Link>

        </div>


        <div className="find-profile">

          <div className="find-profile-avatar">
            H
          </div>

          <div className="find-profile-info">
            <strong>{user.name}</strong>
            <span>EV User</span>
          </div>

          <span className="find-profile-more">
            ⋮
          </span>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="find-main">

        {/* HEADER */}

        <header className="find-header">

          <div>
            <h1>Find Charging Stations</h1>

            <p>
              Discover the best EV charging stations
              around you.
            </p>
          </div>


          <div className="find-header-actions">

            <button
              className="find-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>


            <Link
              to="/login"
              className="find-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>

          </div>

        </header>


        {/* =================================================
            SEARCH AREA
        ================================================== */}

        <section className="station-search-hero">

          <div className="station-search-text">

            <span className="station-search-label">
              CHARGE ANYWHERE
            </span>

            <h2>
              Where do you want to
              <span> charge?</span>
            </h2>

            <p>
              Search nearby charging stations,
              check availability and book your
              charging slot.
            </p>

          </div>


          <form
            className="main-station-search"
            onSubmit={(e) => e.preventDefault()}
          >
            <SearchIcon size={20} />

            <input
              type="text"
              placeholder="Search station, city or location..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search charging stations"
            />

            <button type="submit">
              Search
            </button>
          </form>

        </section>


        {/* =================================================
            FILTERS
        ================================================== */}

        <section className="station-filter-bar">

          <div className="filter-left">

            <div className="filter-title">
              <span>Filters</span>

              <small>
                {filteredStations.length} stations found
              </small>
            </div>


            <select
              value={stationType}
              onChange={(event) =>
                setStationType(event.target.value)
              }
            >
              <option value="ALL">
                All Stations
              </option>

              <option value="EVCHARGEHUB">
                EVChargeHub
              </option>

              <option value="PUBLIC">
                Public
              </option>
            </select>


            <select
              value={availability}
              onChange={(event) =>
                setAvailability(event.target.value)
              }
            >
              <option value="ALL">
                Any Availability
              </option>

              <option value="AVAILABLE">
                Available Now
              </option>
            </select>


            <button
              className={`filter-chip ${
                connectorFilter === "CCS" ? "active" : ""
              }`}
              type="button"
              onClick={() =>
                setConnectorFilter(
                  connectorFilter === "CCS" ? "ALL" : "CCS"
                )
              }
            >
              <PlugIcon size={15} />
              CCS
            </button>


            <button
              className={`filter-chip ${
                fastOnly ? "active" : ""
              }`}
              type="button"
              onClick={() => setFastOnly(!fastOnly)}
            >
              <BoltIcon size={15} />
              Fast Charging
            </button>

          </div>


          <button
            className="reset-filter"
            onClick={resetFilters}
          >
            Reset Filters
          </button>

        </section>


        {/* =================================================
            CONTENT
        ================================================== */}

        <section className="find-content-grid">

          {/* STATIONS */}

          <div className="find-stations-panel">

            <div className="find-section-heading">

              <div>
                <h3>Charging Stations</h3>

                <p>
                  Stations matching your search
                </p>
              </div>


              <button
                className="sort-button"
                onClick={() =>
                  setSortBy(
                    sortBy === "nearest" ? "rating" : "nearest"
                  )
                }
              >
                {sortBy === "nearest" ? "Nearest first" : "Top rated"}
              </button>

            </div>


            <div className="find-station-list">

              {filteredStations.length > 0 ? (

                filteredStations.map((station) => (

                  <article
                    key={station.id}
                    className={`find-station-card ${
                      selectedStation?.id === station.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedStation(station)
                    }
                  >

                    <div className="station-image-wrapper">

                      <img
                        src={station.image}
                        alt={station.name}
                      />

                      <button
                        className={`station-favourite ${
                          favourites.some(
                            (item) => item.id === station.id
                          )
                            ? "active"
                            : ""
                        }`}
                        aria-label={
                          favourites.some(
                            (item) => item.id === station.id
                          )
                            ? "Remove from favourites"
                            : "Add to favourites"
                        }
                        onClick={(event) =>
                          toggleFavourite(event, station)
                        }
                      >
                        <HeartIcon size={16} />
                      </button>

                    </div>


                    <div className="station-card-content">

                      <div className="station-card-header">

                        <div>
                          <div className="station-badges">

                            {station.sourceType ===
                            "EVCHARGEHUB" ? (
                              <span className="hub-badge">
                                EVChargeHub
                              </span>
                            ) : (
                              <span className="public-station-badge">
                                Public
                              </span>
                            )}

                            {station.sourceType ===
                              "EVCHARGEHUB" &&
                              station.available > 0 && (
                                <span className="available-badge">
                                  ● Available
                                </span>
                              )}

                          </div>


                          <h4>{station.name}</h4>

                          <div className="station-address">
                            <LocationIcon size={13} />
                            <span>{station.address}</span>
                          </div>

                        </div>


                        <div className="station-rating-box">

                          <div>
                            <span className="rating-star">
                              ★
                            </span>

                            <strong>
                              {station.rating}
                            </strong>
                          </div>

                          <small>
                            {station.reviews} reviews
                          </small>

                        </div>

                      </div>


                      <div className="station-specifications">

                        <div>
                          <RouteIcon size={16} />

                          <span>
                            <small>Distance</small>
                            <strong>
                              {String(station.distance).includes("km") ? station.distance : `${station.distance} km`}
                            </strong>
                          </span>
                        </div>


                        <div>
                          <BoltIcon size={16} />

                          <span>
                            <small>Power</small>
                            <strong>
                              {String(station.power).includes("kW") ? station.power : `${station.power} kW`}
                            </strong>
                          </span>
                        </div>


                        <div>
                          <PlugIcon size={16} />

                          <span>
                            <small>Connector</small>
                            <strong>
                              {station.connector}
                            </strong>
                          </span>
                        </div>

                      </div>


                      <div className="station-card-footer">

                        <div>

                          {station.sourceType ===
                          "EVCHARGEHUB" ? (

                            <>
                              <span className="charger-availability">
                                {station.available} of{" "}
                                {station.total} chargers
                                available
                              </span>

                              <div className="availability-bar">
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
                            </>

                          ) : (

                            <span className="public-info-text">
                              Public charging location
                            </span>

                          )}

                        </div>


                        <div className="station-buttons">

                            <Link
                                to={`/user/stations/${station.id}`}
                                className="details-station-button"
                                onClick={(event) => event.stopPropagation()}
                                >
                                Details
                            </Link>


                          {station.sourceType ===
                            "EVCHARGEHUB" && (

                              <Link
                                to={`/user/stations/${station.id}/book`}
                                className="book-station-button"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                              >
                                Book Now
                              </Link>

                            )}

                        </div>

                      </div>

                    </div>

                  </article>

                ))

              ) : (

                <div className="no-stations">

                  <LocationIcon size={35} />

                  <h3>No stations found</h3>

                  <p>
                    Try changing your search or
                    filters.
                  </p>

                  <button onClick={resetFilters}>
                    Reset Filters
                  </button>

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              MAP
          ================================================== */}

          <div className="find-map-panel">

            <div className="map-panel-header">

              <div>
                <h3>Station Map</h3>

                <p>
                  Select a station to view its location
                </p>
              </div>


              <span className="map-live-badge">
                ● Live Map
              </span>

            </div>


            <div className="find-real-map">

              <MapContainer
                center={[5.947, 80.56]}
                zoom={13}
                scrollWheelZoom={true}
                className="find-leaflet-map"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                {selectedStation && (
                  <MapFlyTo
                    position={selectedStation.position}
                  />
                )}


                {filteredStations.map((station) => (

                  <Marker
                    key={station.id}
                    position={station.position}
                    eventHandlers={{
                      click: () =>
                        setSelectedStation(station),
                    }}
                  >

                    <Popup>

                      <div className="find-map-popup">

                        <strong>
                          {station.name}
                        </strong>

                        <span>
                          ★ {station.rating} ·{" "}
                          {String(station.distance).includes("km") ? station.distance : `${station.distance} km`}
                        </span>

                        <p>
                          ⚡ {String(station.power).includes("kW") ? station.power : `${station.power} kW`} ·{" "}
                          {station.connector}
                        </p>


                        {station.sourceType ===
                        "EVCHARGEHUB" ? (

                          <>
                            <small>
                              {station.available} chargers
                              available
                            </small>

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

                          <small>
                            Public station · Booking
                            unavailable
                          </small>

                        )}

                      </div>

                    </Popup>

                  </Marker>

                ))}

              </MapContainer>

            </div>


            {/* SELECTED STATION MINI CARD */}

            {selectedStation && (

              <div className="selected-station-bar">

                <div className="selected-station-icon">
                  <BoltIcon size={19} />
                </div>

                <div>
                  <small>Selected Station</small>

                  <strong>
                    {selectedStation.name}
                  </strong>
                </div>

                <span>
                  {selectedStation.distance} km
                </span>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default FindStations;