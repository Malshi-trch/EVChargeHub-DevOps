import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import "./ManageChargers.css";
import {
  getOwnerStations,
  saveOwnerStations,
  syncStationAvailability,
} from "../data/ownerStationsData";
import OwnerHeader from "../components/owner/OwnerHeader";
import {
  BuildingIcon,
  PlugIcon,
  ArrowLeftIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  InfoIcon,
  BoltIcon,
} from "../components/Icons";

export default function ManageChargers() {
  const { stationId } = useParams();

  // Load all stations with normalized individual chargers
  const [stations, setStations] = useState(() => getOwnerStations());

  // Find the target station
  const station = useMemo(() => {
    return stations.find((st) => String(st.id) === String(stationId));
  }, [stations, stationId]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [connectorFilter, setConnectorFilter] = useState("All");

  const [toastMessage, setToastMessage] = useState("");

  // Modal State for Add / Edit
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [activeCharger, setActiveCharger] = useState(null);

  // Form State
  const [formValues, setFormValues] = useState({
    id: "",
    name: "",
    connectorType: "CCS",
    power: "150",
    status: "Available",
    pricePerKwh: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Confirmation Modal for Deletion
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Helper to persist updated station
  const persistStationUpdate = (updatedStation, toastText) => {
    const syncedStation = syncStationAvailability(updatedStation);
    const updatedList = stations.map((st) =>
      String(st.id) === String(syncedStation.id) ? syncedStation : st
    );
    setStations(updatedList);
    saveOwnerStations(updatedList);
    if (toastText) showToast(toastText);
  };

  // -------------------------------------------------------------
  // CHARGERS LIST & KPI CALCULATIONS
  // -------------------------------------------------------------
  const allChargers = useMemo(() => {
    return station?.individualChargers || [];
  }, [station]);

  const kpis = useMemo(() => {
    const total = allChargers.length;
    const available = allChargers.filter((c) => c.status === "Available").length;
    const inUse = allChargers.filter((c) => c.status === "In Use").length;
    const maintenance = allChargers.filter((c) => c.status === "Maintenance").length;
    const offline = allChargers.filter((c) => c.status === "Offline").length;
    const offlineOrMaint = maintenance + offline;
    return { total, available, inUse, maintenance, offline, offlineOrMaint };
  }, [allChargers]);

  // Filtered chargers
  const filteredChargers = useMemo(() => {
    return allChargers.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.connectorType.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;

      const matchesConnector =
        connectorFilter === "All" || c.connectorType === connectorFilter;

      return matchesSearch && matchesStatus && matchesConnector;
    });
  }, [allChargers, searchQuery, statusFilter, connectorFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setConnectorFilter("All");
  };

  // -------------------------------------------------------------
  // QUICK STATUS CHANGE
  // -------------------------------------------------------------
  const handleQuickStatusChange = (chargerId, newStatus) => {
    if (!station) return;
    const updatedChargers = station.individualChargers.map((c) =>
      c.id === chargerId
        ? {
            ...c,
            status: newStatus,
            lastUpdated: "Just now",
          }
        : c
    );

    const updatedStation = {
      ...station,
      individualChargers: updatedChargers,
    };

    persistStationUpdate(
      updatedStation,
      `Status for ${chargerId} updated to ${newStatus}`
    );
  };

  // -------------------------------------------------------------
  // ADD CHARGER MODAL HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddModal = () => {
    // Generate suggested unique ID
    let nextNum = allChargers.length + 1;
    let candidateId = `CP-${String(nextNum).padStart(3, "0")}`;
    while (allChargers.some((c) => c.id === candidateId)) {
      nextNum++;
      candidateId = `CP-${String(nextNum).padStart(3, "0")}`;
    }

    setFormValues({
      id: candidateId,
      name: `Bay ${String(nextNum).padStart(2, "0")}`,
      connectorType: "CCS",
      power: "150",
      status: "Available",
      pricePerKwh: String(station?.pricePerKwh || station?.pricing?.pricePerKwh || 85),
    });
    setFormErrors({});
    setModalMode("add");
    setActiveCharger(null);
  };

  // -------------------------------------------------------------
  // EDIT CHARGER MODAL HANDLERS
  // -------------------------------------------------------------
  const handleOpenEditModal = (charger) => {
    setFormValues({
      id: charger.id,
      name: charger.name,
      connectorType: charger.connectorType,
      power: String(charger.power),
      status: charger.status,
      pricePerKwh: String(
        charger.pricePerKwh !== undefined
          ? charger.pricePerKwh
          : station?.pricePerKwh || 85
      ),
    });
    setFormErrors({});
    setActiveCharger(charger);
    setModalMode("edit");
  };

  // -------------------------------------------------------------
  // FORM VALIDATION & SUBMISSION
  // -------------------------------------------------------------
  const validateForm = () => {
    const errors = {};
    const trimmedId = formValues.id.trim();
    const trimmedName = formValues.name.trim();

    if (!trimmedId) {
      errors.id = "Charger ID is required.";
    } else if (
      modalMode === "add" &&
      allChargers.some((c) => c.id.toLowerCase() === trimmedId.toLowerCase())
    ) {
      errors.id = "A charger with this ID already exists in this station.";
    }

    if (!trimmedName) {
      errors.name = "Charger Name is required.";
    }

    const powerNum = parseFloat(formValues.power);
    if (isNaN(powerNum) || powerNum <= 0) {
      errors.power = "Power must be greater than 0 kW.";
    }

    if (formValues.pricePerKwh !== "") {
      const priceNum = parseFloat(formValues.pricePerKwh);
      if (isNaN(priceNum) || priceNum < 0) {
        errors.pricePerKwh = "Price per kWh must be 0 or greater.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const basePrice = station?.pricePerKwh || station?.pricing?.pricePerKwh || 85;
    const finalPrice =
      formValues.pricePerKwh !== ""
        ? parseFloat(formValues.pricePerKwh)
        : basePrice;

    if (modalMode === "add") {
      const newRecord = {
        id: formValues.id.trim(),
        name: formValues.name.trim(),
        connectorType: formValues.connectorType,
        power: parseFloat(formValues.power),
        status: formValues.status,
        pricePerKwh: finalPrice,
        lastUpdated: "Just now",
        stationId: station.id,
      };

      const updatedChargers = [...allChargers, newRecord];
      const updatedStation = {
        ...station,
        individualChargers: updatedChargers,
      };

      persistStationUpdate(
        updatedStation,
        `Charger ${newRecord.id} successfully added!`
      );
    } else if (modalMode === "edit" && activeCharger) {
      const updatedChargers = allChargers.map((c) =>
        c.id === activeCharger.id
          ? {
              ...c,
              name: formValues.name.trim(),
              connectorType: formValues.connectorType,
              power: parseFloat(formValues.power),
              status: formValues.status,
              pricePerKwh: finalPrice,
              lastUpdated: "Just now",
            }
          : c
      );

      const updatedStation = {
        ...station,
        individualChargers: updatedChargers,
      };

      persistStationUpdate(
        updatedStation,
        `Charger ${activeCharger.id} updated successfully!`
      );
    }

    setModalMode(null);
    setActiveCharger(null);
  };

  // -------------------------------------------------------------
  // REMOVE CHARGER HANDLERS
  // -------------------------------------------------------------
  const handleRequestDelete = (charger) => {
    if (charger.status === "In Use") {
      showToast(
        "⚠️ This charger is currently in use. Change its status before removing it."
      );
      return;
    }
    setDeleteTarget(charger);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || !station) return;
    const updatedChargers = allChargers.filter((c) => c.id !== deleteTarget.id);
    const updatedStation = {
      ...station,
      individualChargers: updatedChargers,
    };

    persistStationUpdate(
      updatedStation,
      `Charger ${deleteTarget.id} removed from station.`
    );
    setDeleteTarget(null);
  };

  // -------------------------------------------------------------
  // NOT FOUND FALLBACK
  // -------------------------------------------------------------
  if (!station) {
    return (
      <div className="owner-manage-chargers-page">
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
            The charging station #{stationId} could not be located to manage its
            chargers. It may have been removed or the URL is invalid.
          </p>
          <Link to="/owner/stations" className="back-to-stations-btn">
            <ArrowLeftIcon size={16} />
            <span>Back to My Stations</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-manage-chargers-page">
      <OwnerHeader
        title="Manage Station Chargers"
        subtitle={`Configure and monitor charging points for ${station.name} (${station.city}).`}
        breadcrumbs={[
          { label: "My Stations", to: "/owner/stations" },
          { label: station.name, to: `/owner/stations/${station.id}` },
          { label: "Chargers" },
        ]}
        action={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link to={`/owner/stations/${station.id}`} className="owner-secondary-btn">
              <ArrowLeftIcon size={16} />
              <span>Back to Station</span>
            </Link>
            <button
              type="button"
              className="owner-primary-btn"
              onClick={handleOpenAddModal}
            >
              <PlusIcon size={16} />
              <span>+ Add Charger</span>
            </button>
          </div>
        }
      />

      {toastMessage && (
        <div className="owner-toast-banner" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

        {/* ===================================================
            KPI SUMMARY CARDS (4 CARDS)
        ==================================================== */}
        <section className="chargers-kpi-grid">
          {/* Card 1: Total Chargers */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Total Chargers</span>
              <div className="kpi-icon-wrapper blue">
                <PlugIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.total}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge neutral">Configured Bays</span>
              <small>Station capacity</small>
            </div>
          </div>

          {/* Card 2: Available Now */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Available</span>
              <div className="kpi-icon-wrapper green">
                <BoltIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.available}</strong>
            <div className="kpi-footer">
              <span className="kpi-trend positive">
                {kpis.total > 0
                  ? `${Math.round((kpis.available / kpis.total) * 100)}% Ready`
                  : "0% Ready"}
              </span>
              <small>Ready for drivers</small>
            </div>
          </div>

          {/* Card 3: In Use */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">In Use</span>
              <div className="kpi-icon-wrapper cyan">
                <PlugIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.inUse}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge blue">Active Sessions</span>
              <small>Generating revenue</small>
            </div>
          </div>

          {/* Card 4: Offline / Maintenance */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Offline / Maintenance</span>
              <div className="kpi-icon-wrapper amber">
                <InfoIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.offlineOrMaint}</strong>
            <div className="kpi-footer">
              <span className="kpi-breakdown">
                {kpis.maintenance} Maint · {kpis.offline} Offline
              </span>
              <small>Needs attention</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            SEARCH AND FILTERS TOOLBAR
        ==================================================== */}
        <section className="chargers-filter-toolbar">
          <div className="filter-search-box">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search chargers by ID, name or connector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search chargers"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-controls-group">
            {/* Status Filter Pills */}
            <div className="status-filter-pills">
              {["All", "Available", "In Use", "Maintenance", "Offline"].map(
                (status) => {
                  const count =
                    status === "All"
                      ? allChargers.length
                      : allChargers.filter((c) => c.status === status).length;
                  return (
                    <button
                      key={status}
                      type="button"
                      className={`filter-pill ${
                        statusFilter === status ? "active" : ""
                      }`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status} ({count})
                    </button>
                  );
                }
              )}
            </div>

            {/* Connector Filter */}
            <div className="connector-select-wrapper">
              <label htmlFor="connector-filter-select">Connector:</label>
              <select
                id="connector-filter-select"
                value={connectorFilter}
                onChange={(e) => setConnectorFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All">All Connectors</option>
                <option value="CCS">CCS</option>
                <option value="Type 2">Type 2</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </select>
            </div>

            {(searchQuery ||
              statusFilter !== "All" ||
              connectorFilter !== "All") && (
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
            CHARGER LIST / MANAGEMENT CARDS
        ==================================================== */}
        {allChargers.length === 0 ? (
          <div className="chargers-empty-state">
            <div className="empty-icon-wrap">
              <PlugIcon size={44} />
            </div>
            <h3>No chargers configured</h3>
            <p>
              Add the first charger to start managing this station's charging
              availability and rates.
            </p>
            <button
              type="button"
              className="primary-add-charger-btn"
              onClick={handleOpenAddModal}
            >
              <PlusIcon size={16} />
              <span>+ Add First Charger</span>
            </button>
          </div>
        ) : filteredChargers.length === 0 ? (
          <div className="chargers-empty-state">
            <div className="empty-icon-wrap">
              <SearchIcon size={40} />
            </div>
            <h3>No matching chargers found</h3>
            <p>
              None of the configured charging bays match your current search or
              filter parameters.
            </p>
            <button
              type="button"
              className="reset-filters-btn"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="chargers-grid">
            {filteredChargers.map((charger) => {
              const statusClass =
                charger.status === "Available"
                  ? "status-available"
                  : charger.status === "In Use"
                  ? "status-in-use"
                  : charger.status === "Maintenance"
                  ? "status-maintenance"
                  : "status-offline";

              const priceVal =
                charger.pricePerKwh !== undefined
                  ? charger.pricePerKwh
                  : station.pricePerKwh ||
                    station.pricing?.pricePerKwh ||
                    85;

              return (
                <div className="charger-card" key={charger.id}>
                  {/* CARD HEADER */}
                  <div className="charger-card-header">
                    <div className="charger-id-badge">
                      <PlugIcon size={15} />
                      <strong>{charger.id}</strong>
                    </div>

                    <div className="header-tags">
                      <span className="connector-tag">
                        {charger.connectorType}
                      </span>
                      <span className="power-tag">
                        {typeof charger.power === "number"
                          ? `${charger.power} kW`
                          : charger.power}
                      </span>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="charger-card-body">
                    <h3 className="charger-title">{charger.name}</h3>

                    <div className="charger-meta-row">
                      <div className="meta-item">
                        <small>Current Status</small>
                        <span className={`status-badge ${statusClass}`}>
                          <span className="status-dot"></span>
                          <span>{charger.status}</span>
                        </span>
                      </div>

                      <div className="meta-item">
                        <small>Price per kWh</small>
                        <strong className="price-tag">
                          LKR {priceVal} / kWh
                        </strong>
                      </div>
                    </div>

                    <div className="charger-telemetry-strip">
                      <small>Telemetry:</small>
                      <span>Updated {charger.lastUpdated || "Recently"}</span>
                    </div>
                  </div>

                  {/* QUICK STATUS SELECTOR */}
                  <div className="quick-status-selector">
                    <label htmlFor={`quick-status-${charger.id}`}>
                      Quick Status:
                    </label>
                    <select
                      id={`quick-status-${charger.id}`}
                      value={charger.status}
                      onChange={(e) =>
                        handleQuickStatusChange(charger.id, e.target.value)
                      }
                      className={`quick-status-dropdown ${statusClass}`}
                      aria-label={`Change status for charger ${charger.id}`}
                    >
                      <option value="Available">Available</option>
                      <option value="In Use">In Use</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="charger-card-actions">
                    <button
                      type="button"
                      className="charger-action-btn edit"
                      onClick={() => handleOpenEditModal(charger)}
                      title={`Edit ${charger.id}`}
                    >
                      <EditIcon size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className={`charger-action-btn remove ${
                        charger.status === "In Use" ? "disabled" : ""
                      }`}
                      onClick={() => handleRequestDelete(charger)}
                      title={
                        charger.status === "In Use"
                          ? "This charger is currently in use. Change status before removing."
                          : `Remove ${charger.id}`
                      }
                      disabled={charger.status === "In Use"}
                    >
                      <TrashIcon size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* ===================================================
          ADD / EDIT CHARGER MODAL
      ==================================================== */}
      {modalMode && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setModalMode(null);
            setActiveCharger(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="charger-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <PlugIcon size={20} />
                </div>
                <div>
                  <h3>
                    {modalMode === "add"
                      ? "Add New Charger"
                      : `Edit Charger (${activeCharger?.id})`}
                  </h3>
                  <p>
                    {modalMode === "add"
                      ? "Register a new charging point bay for this station."
                      : "Modify charger configuration and operational parameters."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setModalMode(null);
                  setActiveCharger(null);
                }}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-grid">
                {/* Charger ID */}
                <div className="form-group">
                  <label htmlFor="charger-form-id">
                    Charger ID <span className="req">*</span>
                  </label>
                  <input
                    id="charger-form-id"
                    type="text"
                    value={formValues.id}
                    onChange={(e) =>
                      setFormValues({ ...formValues, id: e.target.value })
                    }
                    placeholder="e.g. CP-009"
                    disabled={modalMode === "edit"}
                    className={formErrors.id ? "input-err" : ""}
                  />
                  {formErrors.id && (
                    <span className="err-msg">{formErrors.id}</span>
                  )}
                  {modalMode === "edit" && (
                    <small className="field-hint">
                      Charger ID is immutable to preserve telemetry logs.
                    </small>
                  )}
                </div>

                {/* Charger Name */}
                <div className="form-group">
                  <label htmlFor="charger-form-name">
                    Charger Name / Bay <span className="req">*</span>
                  </label>
                  <input
                    id="charger-form-name"
                    type="text"
                    value={formValues.name}
                    onChange={(e) =>
                      setFormValues({ ...formValues, name: e.target.value })
                    }
                    placeholder="e.g. Bay 01 - Supercharger"
                    className={formErrors.name ? "input-err" : ""}
                  />
                  {formErrors.name && (
                    <span className="err-msg">{formErrors.name}</span>
                  )}
                </div>

                {/* Connector Type */}
                <div className="form-group">
                  <label htmlFor="charger-form-connector">
                    Connector Type <span className="req">*</span>
                  </label>
                  <select
                    id="charger-form-connector"
                    value={formValues.connectorType}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        connectorType: e.target.value,
                      })
                    }
                  >
                    <option value="CCS">CCS (Combined Charging System)</option>
                    <option value="Type 2">Type 2 (Mennekes AC)</option>
                    <option value="CHAdeMO">CHAdeMO (DC Rapid)</option>
                  </select>
                </div>

                {/* Power (kW) */}
                <div className="form-group">
                  <label htmlFor="charger-form-power">
                    Power Output (kW) <span className="req">*</span>
                  </label>
                  <input
                    id="charger-form-power"
                    type="number"
                    min="1"
                    max="500"
                    value={formValues.power}
                    onChange={(e) =>
                      setFormValues({ ...formValues, power: e.target.value })
                    }
                    placeholder="150"
                    className={formErrors.power ? "input-err" : ""}
                  />
                  {formErrors.power && (
                    <span className="err-msg">{formErrors.power}</span>
                  )}
                </div>

                {/* Status */}
                <div className="form-group">
                  <label htmlFor="charger-form-status">
                    Initial Status <span className="req">*</span>
                  </label>
                  <select
                    id="charger-form-status"
                    value={formValues.status}
                    onChange={(e) =>
                      setFormValues({ ...formValues, status: e.target.value })
                    }
                  >
                    <option value="Available">Available (Ready for drivers)</option>
                    <option value="In Use">In Use (Active charging session)</option>
                    <option value="Maintenance">Maintenance (Scheduled servicing)</option>
                    <option value="Offline">Offline (Decommissioned/Disabled)</option>
                  </select>
                </div>

                {/* Price per kWh */}
                <div className="form-group">
                  <label htmlFor="charger-form-price">
                    Price per kWh (LKR)
                  </label>
                  <input
                    id="charger-form-price"
                    type="number"
                    min="0"
                    step="1"
                    value={formValues.pricePerKwh}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        pricePerKwh: e.target.value,
                      })
                    }
                    placeholder={String(
                      station?.pricePerKwh ||
                        station?.pricing?.pricePerKwh ||
                        85
                    )}
                    className={formErrors.pricePerKwh ? "input-err" : ""}
                  />
                  {formErrors.pricePerKwh && (
                    <span className="err-msg">{formErrors.pricePerKwh}</span>
                  )}
                  <small className="field-hint">
                    Leave blank to inherit station default rate (LKR{" "}
                    {station?.pricePerKwh || 85} / kWh).
                  </small>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => {
                    setModalMode(null);
                    setActiveCharger(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  <CheckIcon size={16} />
                  <span>
                    {modalMode === "add" ? "Add Charger" : "Save Changes"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          CONFIRM DELETE MODAL
      ==================================================== */}
      {deleteTarget && (
        <div
          className="modal-backdrop"
          onClick={() => setDeleteTarget(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="confirm-delete-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-icon-wrap">
              <TrashIcon size={32} />
            </div>
            <h3>Remove Charger {deleteTarget.id}?</h3>
            <p>
              This charger (<strong>{deleteTarget.name}</strong> -{" "}
              {deleteTarget.connectorType}) will be permanently removed from{" "}
              <strong>{station.name}</strong>. Parent station capacity and
              availability counts will be recalculated automatically.
            </p>

            <div className="delete-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-remove-btn"
                onClick={handleConfirmDelete}
              >
                <TrashIcon size={16} />
                <span>Remove Charger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
