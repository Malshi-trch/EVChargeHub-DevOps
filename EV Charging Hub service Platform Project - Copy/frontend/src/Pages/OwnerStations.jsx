import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./OwnerStations.css";
import OwnerHeader from "../components/owner/OwnerHeader";
import {
  BuildingIcon,
  PlusIcon,
  PlugIcon,
  LocationIcon,
  SearchIcon,
  RouteIcon,
  BoltIcon,
  StarIcon,
  ClockIcon,
} from "../components/Icons";
import {
  OWNER_STATIONS_STORAGE_KEY,
  getOwnerStations,
} from "../data/ownerStationsData";

function OwnerStations() {
  const [stations, setStations] = useState(() => getOwnerStations());

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedStationModal, setSelectedStationModal] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Persist stations to localStorage helper
  const updateStationsData = (newStationsList) => {
    setStations(newStationsList);
    try {
      localStorage.setItem(OWNER_STATIONS_STORAGE_KEY, JSON.stringify(newStationsList));
    } catch {
      // ignore
    }
  };

  // Toggle station status (Active <-> Inactive)
  const handleToggleStatus = (stationId) => {
    const updated = stations.map((st) => {
      if (st.id === stationId) {
        const nextStatus = st.status === "Active" ? "Inactive" : "Active";
        showToast(`"${st.name}" status changed to ${nextStatus}`);
        return {
          ...st,
          status: nextStatus,
          availableChargers: nextStatus === "Active" ? Math.max(1, Math.floor(st.totalChargers * 0.75)) : 0,
        };
      }
      return st;
    });
    updateStationsData(updated);
  };

  // Direct status select
  const handleChangeStatus = (stationId, newStatus) => {
    const updated = stations.map((st) => {
      if (st.id === stationId) {
        showToast(`"${st.name}" status set to ${newStatus}`);
        return {
          ...st,
          status: newStatus,
          availableChargers: newStatus === "Active" ? Math.max(1, Math.floor(st.totalChargers * 0.75)) : 0,
        };
      }
      return st;
    });
    updateStationsData(updated);
  };

  // Summary Metrics
  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.status === "Active").length;
  const totalChargers = stations.reduce((acc, s) => acc + Number(s.totalChargers || 0), 0);
  const availableChargersNow = stations
    .filter((s) => s.status === "Active")
    .reduce((acc, s) => acc + Number(s.availableChargers || 0), 0);

  // Filtered Stations
  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        st.name.toLowerCase().includes(q) ||
        st.address.toLowerCase().includes(q) ||
        st.maxPower.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || st.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stations, searchTerm, statusFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  return (
    <div className="owner-stations-page">
      <OwnerHeader
        title="My Charging Stations"
        subtitle="Manage your charging locations, chargers and station availability."
        action={
          <Link
            to="/owner/stations/new"
            className="owner-primary-btn"
          >
            <PlusIcon size={16} />
            <span>Add New Station</span>
          </Link>
        }
      />

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="owner-toast" role="status">
          <span>✓</span>
          <p>{toastMessage}</p>
        </div>
      )}

      {/* ===================================================
          4 SUMMARY STAT CARDS
      ==================================================== */}
      <section className="owner-stats-grid">
        {/* Card 1: Total Stations */}
          <div className="owner-stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Total Stations</span>
              <div className="stat-icon-wrapper green">
                <BuildingIcon size={20} />
              </div>
            </div>
            <strong className="stat-value">{totalStations}</strong>
            <div className="stat-footer">
              <span className="stat-badge green">Registered</span>
              <small>In your portfolio</small>
            </div>
          </div>

          {/* Card 2: Active Stations */}
          <div className="owner-stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Active Stations</span>
              <div className="stat-icon-wrapper emerald">
                <RouteIcon size={20} />
              </div>
            </div>
            <strong className="stat-value">{activeStations}</strong>
            <div className="stat-footer">
              <span className="stat-trend positive">● {Math.round((activeStations / (totalStations || 1)) * 100)}% Online</span>
              <small>Accepting bookings</small>
            </div>
          </div>

          {/* Card 3: Total Chargers */}
          <div className="owner-stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Total Chargers</span>
              <div className="stat-icon-wrapper blue">
                <PlugIcon size={20} />
              </div>
            </div>
            <strong className="stat-value">{totalChargers}</strong>
            <div className="stat-footer">
              <span className="stat-badge green">Fast DC & AC</span>
              <small>Combined capacity</small>
            </div>
          </div>

          {/* Card 4: Chargers Available Now */}
          <div className="owner-stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Available Now</span>
              <div className="stat-icon-wrapper amber">
                <BoltIcon size={20} />
              </div>
            </div>
            <strong className="stat-value">{availableChargersNow}</strong>
            <div className="stat-footer">
              <span className="stat-trend positive">{totalChargers - availableChargersNow} In Use</span>
              <small>Ready for drivers</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            SEARCH AND FILTERS TOOLBAR
        ==================================================== */}
        <section className="stations-filter-toolbar">
          <div className="filter-search-box">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search stations by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search stations"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-controls">
            <div className="status-filter-pills">
              <button
                type="button"
                className={`filter-pill ${statusFilter === "ALL" ? "active" : ""}`}
                onClick={() => setStatusFilter("ALL")}
              >
                All Stations ({stations.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === "Active" ? "active" : ""}`}
                onClick={() => setStatusFilter("Active")}
              >
                Active ({stations.filter((s) => s.status === "Active").length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === "Inactive" ? "active" : ""}`}
                onClick={() => setStatusFilter("Inactive")}
              >
                Inactive ({stations.filter((s) => s.status === "Inactive").length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === "Maintenance" ? "active" : ""}`}
                onClick={() => setStatusFilter("Maintenance")}
              >
                Maintenance ({stations.filter((s) => s.status === "Maintenance").length})
              </button>
              {stations.some((s) => s.status === "Draft") && (
                <button
                  type="button"
                  className={`filter-pill ${statusFilter === "Draft" ? "active" : ""}`}
                  onClick={() => setStatusFilter("Draft")}
                >
                  Draft ({stations.filter((s) => s.status === "Draft").length})
                </button>
              )}
            </div>

            {(searchTerm || statusFilter !== "ALL") && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            )}
          </div>
        </section>

        {/* ===================================================
            STATION MANAGEMENT CARDS (MAPPING)
        ==================================================== */}
        <section className="stations-section">
          <div className="stations-section-header">
            <h3>
              Your Stations <span>({filteredStations.length})</span>
            </h3>
            <p>Review real-time utilization, manage hardware, and adjust operational status</p>
          </div>

          {filteredStations.length > 0 ? (
            <div className="station-cards-grid">
              {filteredStations.map((station) => {
                const statusClass =
                  station.status === "Active"
                    ? "status-active"
                    : station.status === "Maintenance"
                    ? "status-maintenance"
                    : station.status === "Draft"
                    ? "status-draft"
                    : "status-inactive";

                return (
                  <article className="owner-station-card" key={station.id}>
                    {/* CARD IMAGE & OVERLAY BADGES */}
                    <div className="station-card-media">
                      <img src={station.image} alt={station.name} />
                      <div className="media-overlay-top">
                        <span className={`station-badge-pill ${statusClass}`}>
                          {station.status === "Active" && <span className="pulse-dot"></span>}
                          {station.status}
                        </span>

                        <span className="power-badge">⚡ {station.maxPower}</span>
                      </div>
                    </div>

                    {/* CARD CONTENT */}
                    <div className="station-card-body">
                      <div className="station-card-header-row">
                        <div>
                          <h4 className="station-card-title">{station.name}</h4>
                          <p className="station-card-address">
                            <LocationIcon size={14} />
                            <span>{station.address}</span>
                          </p>
                        </div>

                        <div className="station-rating-badge">
                          <StarIcon size={14} />
                          <strong>{station.rating}</strong>
                          <small>({station.reviews})</small>
                        </div>
                      </div>

                      {/* STATS STRIP */}
                      <div className="station-specs-strip">
                        <div className="spec-item">
                          <small>Chargers</small>
                          <strong>
                            {station.availableChargers} / {station.totalChargers} Avail
                          </strong>
                        </div>
                        <div className="spec-item">
                          <small>Connectors</small>
                          <strong>{station.connectorTypes?.join(", ") || "CCS, Type 2"}</strong>
                        </div>
                        <div className="spec-item">
                          <small>Today's Bookings</small>
                          <strong>{station.todayBookings ?? 12}</strong>
                        </div>
                        <div className="spec-item">
                          <small>Today's Revenue</small>
                          <strong className="green-val">{station.todayRevenue || "LKR 45,000"}</strong>
                        </div>
                      </div>

                      {/* OPERATING HOURS & STATUS TOGGLE */}
                      <div className="station-meta-row">
                        <div className="meta-hours">
                          <ClockIcon size={14} />
                          <span>{station.openingHours || "Open 24 Hours"}</span>
                        </div>

                        {/* STATUS SWITCHER CONTROL */}
                        <div className="station-status-switch">
                          <label htmlFor={`status-select-${station.id}`}>Status:</label>
                          <select
                            id={`status-select-${station.id}`}
                            value={station.status}
                            onChange={(e) => handleChangeStatus(station.id, e.target.value)}
                            className={`status-dropdown ${statusClass}`}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Draft">Draft</option>
                          </select>
                        </div>
                      </div>

                      {/* MANAGEMENT ACTIONS */}
                      <div className="station-card-actions">
                        <Link
                          to={`/owner/stations/${station.id}`}
                          className="card-action-btn view-btn"
                        >
                          View Details
                        </Link>

                        <Link
                          to={`/owner/stations/${station.id}/edit`}
                          className="card-action-btn edit-btn"
                        >
                          Edit
                        </Link>

                        <Link
                          to={`/owner/stations/${station.id}/chargers`}
                          className="card-action-btn chargers-btn"
                        >
                          Manage Chargers
                        </Link>

                        <button
                          type="button"
                          className={`card-action-btn toggle-btn ${station.status === "Active" ? "deactivate" : "activate"}`}
                          onClick={() => handleToggleStatus(station.id)}
                        >
                          {station.status === "Active" ? "Pause Hub" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* ===================================================
               EMPTY STATE
            ==================================================== */
            <div className="owner-empty-state">
              <div className="empty-icon-wrapper">
                <BuildingIcon size={36} />
              </div>
              <h4>No charging stations found</h4>
              <p>
                {searchTerm || statusFilter !== "ALL"
                  ? "No stations match your current search filters. Try resetting your search or filter options."
                  : "Add your first charging station to start accepting EV bookings."}
              </p>
              <div className="empty-actions">
                {searchTerm || statusFilter !== "ALL" ? (
                  <button
                    type="button"
                    className="empty-primary-btn"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                ) : (
                  <Link
                    to="/owner/stations/new"
                    className="empty-primary-btn"
                  >
                    + Add Your First Station
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

      {/* ===================================================
          STATION DETAIL VIEW MODAL
      ==================================================== */}
      {selectedStationModal && (
        <div className="owner-modal-backdrop" role="dialog" aria-modal="true">
          <div className="owner-modal-card station-detail-modal">
            <div className="modal-header">
              <div>
                <h2>{selectedStationModal.name}</h2>
                <p>{selectedStationModal.address}</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedStationModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-body">
              <div className="detail-media-banner">
                <img src={selectedStationModal.image} alt={selectedStationModal.name} />
                <span className={`detail-status-pill ${selectedStationModal.status.toLowerCase()}`}>
                  ● {selectedStationModal.status}
                </span>
              </div>

              <div className="detail-metrics-grid">
                <div className="detail-metric">
                  <small>Max Power</small>
                  <strong>{selectedStationModal.maxPower}</strong>
                </div>
                <div className="detail-metric">
                  <small>Total Chargers</small>
                  <strong>{selectedStationModal.totalChargers} Units</strong>
                </div>
                <div className="detail-metric">
                  <small>Available Now</small>
                  <strong className="green-val">{selectedStationModal.availableChargers} Units</strong>
                </div>
                <div className="detail-metric">
                  <small>Opening Hours</small>
                  <strong>{selectedStationModal.openingHours}</strong>
                </div>
              </div>

              <div className="detail-connectors-box">
                <label>Supported Connectors</label>
                <div className="connector-chips-row">
                  {selectedStationModal.connectorTypes?.map((c) => (
                    <span className="connector-chip" key={c}>
                      <PlugIcon size={14} /> {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-financials-box">
                <div>
                  <small>Today's Bookings</small>
                  <strong>{selectedStationModal.todayBookings ?? 18} Reservations</strong>
                </div>
                <div>
                  <small>Today's Revenue</small>
                  <strong className="green-val">{selectedStationModal.todayRevenue || "LKR 55,000"}</strong>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setSelectedStationModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="modal-submit-btn"
                onClick={() => {
                  handleToggleStatus(selectedStationModal.id);
                  setSelectedStationModal(null);
                }}
              >
                {selectedStationModal.status === "Active" ? "Pause Station" : "Activate Station"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerStations;
