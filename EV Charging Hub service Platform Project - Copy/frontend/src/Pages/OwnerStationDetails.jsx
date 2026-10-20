import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./OwnerStationDetails.css";
import ruhunaImage from "../assets/station-ruhuna.jpg";
import OwnerHeader from "../components/owner/OwnerHeader";

import {
  BuildingIcon,
  ClockIcon,
  PlugIcon,
  LocationIcon,
  ArrowLeftIcon,
  CheckIcon,
  InfoIcon,
  EditIcon,
  BoltIcon,
  CalendarIcon,
  CreditCardIcon,
  StarIcon,
} from "../components/Icons";

import {
  OWNER_STATIONS_STORAGE_KEY,
  getOwnerStations,
} from "../data/ownerStationsData";

/* =========================================================
   LEAFLET MARKER ICON FIX
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

function OwnerStationDetails() {
  const { stationId } = useParams();

  const [stations, setStations] = useState(() => getOwnerStations());
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Find target station safely by String(id)
  const station = useMemo(() => {
    return stations.find((st) => String(st.id) === String(stationId));
  }, [stations, stationId]);

  // Persist updated stations helper
  const updateStationsData = (newStationsList) => {
    setStations(newStationsList);
    try {
      localStorage.setItem(
        OWNER_STATIONS_STORAGE_KEY,
        JSON.stringify(newStationsList)
      );
    } catch {
      // ignore
    }
  };

  // Quick Status Toggle on Details Page
  const handleToggleStatus = () => {
    if (!station) return;
    const nextStatus = station.status === "Active" ? "Inactive" : "Active";
    const updated = stations.map((st) => {
      if (String(st.id) === String(stationId)) {
        return {
          ...st,
          status: nextStatus,
          availableChargers:
            nextStatus === "Active"
              ? Math.max(1, Math.floor(st.totalChargers * 0.75))
              : 0,
        };
      }
      return st;
    });
    updateStationsData(updated);
    showToast(`Status updated to "${nextStatus}".`);
  };

  // Quick Status Dropdown Handler
  const handleChangeStatus = (newStatus) => {
    if (!station) return;
    const updated = stations.map((st) => {
      if (String(st.id) === String(stationId)) {
        return {
          ...st,
          status: newStatus,
          availableChargers:
            newStatus === "Active"
              ? Math.max(1, Math.floor(st.totalChargers * 0.75))
              : 0,
        };
      }
      return st;
    });
    updateStationsData(updated);
    showToast(`Station status set to "${newStatus}".`);
  };

  // Station Not Found State
  if (!station) {
    return (
      <div className="owner-station-details-page">
        <OwnerHeader
          title="Station Not Found"
          subtitle="The requested charging station could not be found."
          breadcrumbs={[
            { label: "My Stations", to: "/owner/stations" },
            { label: "Not Found" },
          ]}
        />
        <div className="details-not-found-card">
          <div className="not-found-icon">
            <BuildingIcon size={40} />
          </div>
          <h2>Station Not Found</h2>
          <p>
            The requested charging station with ID #{stationId} could not be
            found in your portfolio. It may have been removed or the URL is
            incorrect.
          </p>
          <Link to="/owner/stations" className="back-to-stations-btn">
            <ArrowLeftIcon size={16} />
            <span>Back to My Stations</span>
          </Link>
        </div>
      </div>
    );
  }

  // Determine badge style
  const statusClass =
    station.status === "Active"
      ? "status-active"
      : station.status === "Maintenance"
      ? "status-maintenance"
      : station.status === "Draft"
      ? "status-draft"
      : "status-inactive";

  // Normalize chargers list
  const chargersList =
    station.chargers && station.chargers.length > 0
      ? station.chargers
      : [
          {
            id: 1,
            connectorType: "CCS",
            power: station.maxPower || "150 kW",
            totalPoints: station.totalChargers || 4,
            availablePoints: station.availableChargers || 3,
          },
        ];

  // Coordinates
  const lat = parseFloat(station.latitude || (station.position && station.position[0]) || 6.0535);
  const lng = parseFloat(station.longitude || (station.position && station.position[1]) || 80.221);

  return (
    <div className="owner-station-details-page">
      <OwnerHeader
        title={station.name}
        subtitle={station.address}
        breadcrumbs={[
          { label: "My Stations", to: "/owner/stations" },
          { label: station.name },
        ]}
        action={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              to={`/owner/stations/${station.id}/edit`}
              className="owner-secondary-btn"
            >
              <EditIcon size={16} />
              <span>Edit Station</span>
            </Link>
            <Link
              to={`/owner/stations/${station.id}/chargers`}
              className="owner-primary-btn"
            >
              <PlugIcon size={16} />
              <span>Manage Chargers</span>
            </Link>
          </div>
        }
      />

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="owner-toast" role="status">
          <span>✓</span>
          <p>{toastMessage}</p>
        </div>
      )}

      {/* TOP NAVIGATION / STATUS CONTROL */}
      <div className="details-top-nav">
        <Link to="/owner/stations" className="back-link">
          <ArrowLeftIcon size={16} />
          <span>Back to My Stations</span>
        </Link>

        <div className="details-quick-status-control">
          <label htmlFor="station-detail-status">Status:</label>
          <select
            id="station-detail-status"
            value={station.status}
            onChange={(e) => handleChangeStatus(e.target.value)}
            className={`details-status-select ${statusClass}`}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

        {/* ===================================================
            MANAGEMENT STAT CARDS (4 CARDS)
        ==================================================== */}
        <section className="details-stats-grid">
          {/* Card 1: Total Chargers */}
          <div className="details-stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Total Chargers</span>
              <div className="stat-icon-wrapper green">
                <PlugIcon size={20} />
              </div>
            </div>
            <strong className="stat-value">{station.totalChargers || 0}</strong>
            <div className="stat-footer">
              <span className="stat-badge green">Total Bays</span>
              <small>Combined equipment</small>
            </div>
          </div>

          {/* Card 2: Available Chargers */}
          <div className="details-stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Available Now</span>
              <div className="stat-icon-wrapper emerald">
                <BoltIcon size={20} />
              </div>
            </div>
            <strong className="stat-value">
              {station.availableChargers || 0}
            </strong>
            <div className="stat-footer">
              <span className="stat-trend positive">
                {station.status === "Active"
                  ? `${Math.round(
                      ((station.availableChargers || 0) /
                        (station.totalChargers || 1)) *
                        100
                    )}% Ready`
                  : "Hub Offline"}
              </span>
              <small>Ready for drivers</small>
            </div>
          </div>

          {/* Card 3: Today's Bookings */}
          <div className="details-stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Today's Bookings</span>
              <div className="stat-icon-wrapper blue">
                <CalendarIcon size={20} />
              </div>
            </div>
            <strong className="stat-value">
              {station.todayBookings ?? 14}
            </strong>
            <div className="stat-footer">
              <span className="stat-badge green">Reserved</span>
              <small>Sessions booked today</small>
            </div>
          </div>

          {/* Card 4: Today's Revenue */}
          <div className="details-stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Today's Revenue</span>
              <div className="stat-icon-wrapper amber">
                <CreditCardIcon size={20} />
              </div>
            </div>
            <strong className="stat-value green-val">
              {station.todayRevenue || "LKR 48,500"}
            </strong>
            <div className="stat-footer">
              <span className="stat-trend positive">Settled</span>
              <small>Earned across all bays</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            TWO-COLUMN OPERATIONAL WORKSPACE
        ==================================================== */}
        <div className="details-content-layout">
          {/* LEFT COLUMN: MAIN STATION OPERATIONAL DETAILS */}
          <div className="details-main-col">
            {/* HERO OVERVIEW CARD */}
            <article className="details-section-card hero-overview-card">
              <div className="hero-overview-media">
                <img
                  src={station.image || ruhunaImage}
                  alt={station.name}
                  className="hero-overview-img"
                />
                <div className="hero-overlay-tags">
                  <span className={`details-badge-pill ${statusClass}`}>
                    {station.status}
                  </span>
                  <span className="power-pill">
                    ⚡ {station.maxPower || "150 kW"} Max Power
                  </span>
                  <span className="source-pill">Verified Hub</span>
                </div>
              </div>

              <div className="hero-overview-body">
                <div className="overview-title-row">
                  <div>
                    <h2>Station Profile & Classification</h2>
                    <span className="type-badge">
                      {station.stationType || "Public Charging Station"}
                    </span>
                  </div>

                  <div className="overview-rating-badge">
                    <StarIcon size={16} />
                    <strong>{station.rating || 5.0}</strong>
                    <small>({station.reviews || 0} reviews)</small>
                  </div>
                </div>

                <p className="overview-description">
                  {station.description ||
                    "A modern EV charging station providing reliable fast charging facilities for EV drivers."}
                </p>

                <div className="overview-spec-pills">
                  <div className="spec-pill-item">
                    <small>Network Source</small>
                    <strong>EVCHARGEHUB Verified</strong>
                  </div>
                  <div className="spec-pill-item">
                    <small>Connector Standards</small>
                    <strong>
                      {Array.isArray(station.connectorTypes)
                        ? station.connectorTypes.join(", ")
                        : station.connectorTypes || "CCS, Type 2"}
                    </strong>
                  </div>
                  <div className="spec-pill-item">
                    <small>Operating Status</small>
                    <strong>
                      {station.isOpen24Hours ||
                      station.openingHours === "Open 24 Hours"
                        ? "Open 24 Hours"
                        : station.openingHours || "Standard Schedule"}
                    </strong>
                  </div>
                </div>
              </div>
            </article>

            {/* CHARGER CONFIGURATIONS LIST */}
            <section className="details-section-card">
              <div className="card-head-with-action">
                <div>
                  <h3>Charger Equipment Overview</h3>
                  <p>
                    Installed charging point hardware, connectors, and power output.
                  </p>
                </div>
                <Link
                  to={`/owner/stations/${station.id}/chargers`}
                  className="section-action-link"
                >
                  <PlugIcon size={15} />
                  <span>Manage Chargers</span>
                </Link>
              </div>

              <div className="chargers-management-grid">
                {chargersList.map((charger, idx) => (
                  <div className="charger-unit-card" key={charger.id || idx}>
                    <div className="charger-unit-head">
                      <div className="connector-type-badge">
                        <PlugIcon size={16} />
                        <strong>{charger.connectorType || "CCS"}</strong>
                      </div>
                      <span className="power-tag">
                        {charger.power.includes("kW")
                          ? charger.power
                          : `${charger.power} kW`}
                      </span>
                    </div>

                    <div className="charger-unit-stats">
                      <div className="unit-stat">
                        <small>Total Ports</small>
                        <strong>{charger.totalPoints || 1} Points</strong>
                      </div>
                      <div className="unit-stat">
                        <small>Available Now</small>
                        <strong className="green-val">
                          {station.status === "Active"
                            ? charger.availablePoints || charger.totalPoints || 1
                            : 0}{" "}
                          Ready
                        </strong>
                      </div>
                    </div>

                    <div className="charger-unit-footer">
                      <span className="status-indicator-dot online"></span>
                      <span>Hardware In Service</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* OPERATING HOURS TIMETABLE */}
            <section className="details-section-card">
              <div className="card-head-with-action">
                <div>
                  <h3>Operating Hours & Public Availability</h3>
                  <p>Schedule when EV drivers can reserve and utilize chargers.</p>
                </div>
              </div>

              {station.isOpen24Hours ||
              station.openingHours === "Open 24 Hours" ? (
                <div className="twentyfour-hours-banner">
                  <div className="banner-icon">
                    <ClockIcon size={24} />
                  </div>
                  <div>
                    <strong>Open 24 Hours, 7 Days a Week</strong>
                    <p>
                      This location offers unrestricted 24/7 access to all EV
                      drivers with automated bay lighting and security cameras.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="weekly-hours-table">
                  {station.weeklyHours ? (
                    Object.entries(station.weeklyHours).map(([day, sched]) => (
                      <div
                        className={`weekly-day-row ${
                          sched.open ? "open" : "closed"
                        }`}
                        key={day}
                      >
                        <span className="day-name">{day}</span>
                        <span
                          className={`day-badge ${
                            sched.open ? "open" : "closed"
                          }`}
                        >
                          {sched.open ? "Open" : "Closed"}
                        </span>
                        <span className="day-time-slot">
                          {sched.open
                            ? `${sched.from} - ${sched.to}`
                            : "Unavailable"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="simple-hours-row">
                      <span>Schedule:</span>
                      <strong>{station.openingHours || "06:00 AM - 10:00 PM"}</strong>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* FACILITIES & AMENITIES */}
            <section className="details-section-card">
              <div className="card-head-with-action">
                <div>
                  <h3>On-Site Facilities & Amenities</h3>
                  <p>Conveniences provided for drivers during charging sessions.</p>
                </div>
              </div>

              {station.facilities && station.facilities.length > 0 ? (
                <div className="details-facilities-chips">
                  {station.facilities.map((facility) => (
                    <div className="details-facility-pill" key={facility}>
                      <span className="facility-check">
                        <CheckIcon size={13} />
                      </span>
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-facilities-msg">
                  No specific facilities have been listed for this station.
                </p>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: OPERATIONAL SIDEBAR (PRICING, MAP, RECENT ACTIVITY) */}
          <aside className="details-side-col">
            {/* PRICING CARD */}
            <div className="details-side-card pricing-card">
              <div className="side-card-head">
                <div className="side-card-icon green">
                  <CreditCardIcon size={18} />
                </div>
                <div>
                  <h4>Charging Tariff & Fees</h4>
                  <span>Driver billing rates</span>
                </div>
              </div>

              <div className="pricing-rows-list">
                <div className="pricing-metric-box">
                  <small>Price per kWh</small>
                  <strong className="price-big">
                    LKR{" "}
                    {station.pricing?.pricePerKwh ||
                      station.pricePerKwh ||
                      "85"}
                  </strong>
                  <span>Billed dynamically per energy consumed</span>
                </div>

                <div className="pricing-metric-box">
                  <small>Base Session Fee</small>
                  <strong>
                    {station.pricing?.sessionFee && station.pricing.sessionFee > 0
                      ? `LKR ${station.pricing.sessionFee}`
                      : "No session fee"}
                  </strong>
                  <span>Fixed platform access charge per plug-in</span>
                </div>

                <div className="pricing-metric-box">
                  <small>Parking Tariff</small>
                  <strong>
                    {station.pricing?.parkingFee || station.parkingFee
                      ? `LKR ${station.pricing?.parkingFee || station.parkingFee}`
                      : "Free Parking"}
                  </strong>
                  <span>On-site driver parking during charging</span>
                </div>
              </div>

              <div className="pricing-alert-box">
                <InfoIcon size={15} />
                <span>
                  Pricing is automatically converted and displayed to EV drivers
                  before booking authorization.
                </span>
              </div>
            </div>

            {/* OPERATOR & CONTACT CARD */}
            <div className="details-side-card contact-card">
              <div className="side-card-head">
                <div className="side-card-icon blue">
                  <BuildingIcon size={18} />
                </div>
                <div>
                  <h4>Operator & Contact</h4>
                  <span>Authorized contact point</span>
                </div>
              </div>
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748B", fontWeight: "600", width: "70px" }}>Contact:</span>
                  <strong>{station.contactPerson || "Kasun Perera"}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748B", fontWeight: "600", width: "70px" }}>Phone:</span>
                  <a href={`tel:${station.contactPhone || "+94771234567"}`} style={{ color: "#059669", textDecoration: "none", fontWeight: "600" }}>
                    {station.contactPhone || "+94 77 123 4567"}
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748B", fontWeight: "600", width: "70px" }}>Email:</span>
                  <a href={`mailto:${station.contactEmail || "support@evchargehub.lk"}`} style={{ color: "#059669", textDecoration: "none" }}>
                    {station.contactEmail || "support@evchargehub.lk"}
                  </a>
                </div>
                {station.cancellationPolicy && (
                  <div style={{ marginTop: "6px", paddingTop: "8px", borderTop: "1px solid #F1F5F9", fontSize: "12px", color: "#64748B" }}>
                    <strong style={{ display: "block", color: "#1E293B", marginBottom: "2px" }}>Cancellation Policy:</strong>
                    {station.cancellationPolicy}
                  </div>
                )}
              </div>
            </div>

            {/* LOCATION & LEAFLET MAP CARD */}
            <div className="details-side-card location-map-card">
              <div className="side-card-head">
                <div className="side-card-icon emerald">
                  <LocationIcon size={18} />
                </div>
                <div>
                  <h4>Physical Location</h4>
                  <span>Geographic map position</span>
                </div>
              </div>

              <div className="details-map-frame">
                <MapContainer
                  center={[lat, lng]}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="details-leaflet-map"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>
                      <strong>{station.name}</strong>
                      <br />
                      {station.address}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="location-details-meta">
                <div className="loc-meta-item">
                  <small>Address</small>
                  <strong>{station.address}</strong>
                </div>
                <div className="loc-meta-row-2">
                  <div className="loc-meta-item">
                    <small>City</small>
                    <strong>{station.city || "Galle"}</strong>
                  </div>
                  <div className="loc-meta-item">
                    <small>District</small>
                    <strong>{station.district || "Galle"}</strong>
                  </div>
                </div>
                <div className="loc-meta-row-2">
                  <div className="loc-meta-item">
                    <small>Province</small>
                    <strong>{station.province || "Southern Province"}</strong>
                  </div>
                  <div className="loc-meta-item">
                    <small>Coordinates</small>
                    <strong>
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT OPERATIONAL ACTIVITY */}
            <div className="details-side-card activity-card">
              <div className="side-card-head">
                <div className="side-card-icon blue">
                  <ClockIcon size={18} />
                </div>
                <div>
                  <h4>Recent Operational Events</h4>
                  <span>Live activity log</span>
                </div>
              </div>

              <ul className="activity-timeline">
                <li className="activity-item">
                  <span className="activity-dot green"></span>
                  <div className="activity-content">
                    <strong>New Reservation Confirmed</strong>
                    <p>BYD Atto 3 reserved Bay #2 (CCS 150 kW)</p>
                    <small>15 minutes ago</small>
                  </div>
                </li>
                <li className="activity-item">
                  <span className="activity-dot blue"></span>
                  <div className="activity-content">
                    <strong>Charging Session Completed</strong>
                    <p>Tesla Model 3 delivered 44.2 kWh (LKR 3,757)</p>
                    <small>45 minutes ago</small>
                  </div>
                </li>
                <li className="activity-item">
                  <span className="activity-dot amber"></span>
                  <div className="activity-content">
                    <strong>Telemetry Status Ping</strong>
                    <p>Hardware controllers synced with EVChargeHub server</p>
                    <small>Today, 08:00 AM</small>
                  </div>
                </li>
              </ul>
            </div>

            {/* QUICK ACTIONS CARD */}
            <div className="details-side-card quick-actions-card">
              <h4>Station Management Actions</h4>
              <div className="side-actions-buttons">
                <Link
                  to={`/owner/stations/${station.id}/edit`}
                  className="side-action-btn edit-full"
                >
                  <EditIcon size={15} />
                  <span>Edit Station Information</span>
                </Link>

                <button
                  type="button"
                  className={`side-action-btn toggle-status ${
                    station.status === "Active" ? "deactivate" : "activate"
                  }`}
                  onClick={handleToggleStatus}
                >
                  <span>
                    {station.status === "Active" ? "Pause Station" : "Activate Hub"}
                  </span>
                </button>
              </div>
            </div>
          </aside>
        </div>
    </div>
  );
}

export default OwnerStationDetails;
