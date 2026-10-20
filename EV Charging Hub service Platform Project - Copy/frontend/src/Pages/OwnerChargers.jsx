import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./OwnerChargers.css";
import { getOwnerStations } from "../data/ownerStationsData";
import OwnerHeader from "../components/owner/OwnerHeader";
import {
  PlugIcon,
  SearchIcon,
  InfoIcon,
  BoltIcon,
} from "../components/Icons";

export default function OwnerChargers() {
  const [stations] = useState(() => getOwnerStations());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [connectorFilter, setConnectorFilter] = useState("All");

  // Flatten all individual chargers with station metadata
  const allNetworkChargers = useMemo(() => {
    const list = [];
    stations.forEach((st) => {
      const chList = st.individualChargers || [];
      chList.forEach((c) => {
        list.push({
          ...c,
          stationId: st.id,
          stationName: st.name,
          stationCity: st.city,
        });
      });
    });
    return list;
  }, [stations]);

  // Network-wide KPIs
  const networkKpis = useMemo(() => {
    const total = allNetworkChargers.length;
    const available = allNetworkChargers.filter((c) => c.status === "Available").length;
    const inUse = allNetworkChargers.filter((c) => c.status === "In Use").length;
    const maintenance = allNetworkChargers.filter((c) => c.status === "Maintenance").length;
    const offline = allNetworkChargers.filter((c) => c.status === "Offline").length;
    const offlineOrMaint = maintenance + offline;
    return { total, available, inUse, maintenance, offline, offlineOrMaint };
  }, [allNetworkChargers]);

  // Filtered network chargers
  const filteredChargers = useMemo(() => {
    return allNetworkChargers.filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.stationName.toLowerCase().includes(q) ||
        c.connectorType.toLowerCase().includes(q);

      const matchesStation =
        stationFilter === "All" || String(c.stationId) === String(stationFilter);

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;

      const matchesConnector =
        connectorFilter === "All" || c.connectorType === connectorFilter;

      return matchesSearch && matchesStation && matchesStatus && matchesConnector;
    });
  }, [allNetworkChargers, searchQuery, stationFilter, statusFilter, connectorFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setStationFilter("All");
    setStatusFilter("All");
    setConnectorFilter("All");
  };

  return (
    <div className="owner-chargers-page">
      <OwnerHeader
        title="Network Charging Points"
        subtitle="Centralized overview of all charging points across your station portfolio in Sri Lanka."
      />

        {/* ===================================================
            NETWORK KPI SUMMARY
        ==================================================== */}
        <section className="chargers-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Total Points</span>
              <div className="kpi-icon-wrapper blue">
                <PlugIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{networkKpis.total}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge neutral">{stations.length} Stations</span>
              <small>Network footprint</small>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Available Now</span>
              <div className="kpi-icon-wrapper green">
                <BoltIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{networkKpis.available}</strong>
            <div className="kpi-footer">
              <span className="kpi-trend positive">
                {networkKpis.total > 0
                  ? `${Math.round((networkKpis.available / networkKpis.total) * 100)}% Online`
                  : "0%"}
              </span>
              <small>Ready for drivers</small>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">In Use</span>
              <div className="kpi-icon-wrapper cyan">
                <PlugIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{networkKpis.inUse}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge blue">Active Sessions</span>
              <small>Delivering energy</small>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Offline / Maintenance</span>
              <div className="kpi-icon-wrapper amber">
                <InfoIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{networkKpis.offlineOrMaint}</strong>
            <div className="kpi-footer">
              <span className="kpi-breakdown">
                {networkKpis.maintenance} Maint · {networkKpis.offline} Off
              </span>
              <small>Needs attention</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            FILTER TOOLBAR
        ==================================================== */}
        <section className="chargers-filter-toolbar">
          <div className="filter-search-box">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search chargers by ID, name, or station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search chargers across network"
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
            {/* Station Filter */}
            <div className="connector-select-wrapper">
              <label htmlFor="station-filter-select">Station:</label>
              <select
                id="station-filter-select"
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All">All Stations ({stations.length})</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="status-filter-pills">
              {["All", "Available", "In Use", "Maintenance", "Offline"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`filter-pill ${statusFilter === s ? "active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Connector Filter */}
            <div className="connector-select-wrapper">
              <label htmlFor="connector-overview-filter">Connector:</label>
              <select
                id="connector-overview-filter"
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
              stationFilter !== "All" ||
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
            NETWORK CHARGERS TABLE / CARDS
        ==================================================== */}
        {filteredChargers.length === 0 ? (
          <div className="chargers-empty-state">
            <div className="empty-icon-wrap">
              <SearchIcon size={40} />
            </div>
            <h3>No charging points found</h3>
            <p>Try adjusting your search query or station and status filters.</p>
            <button
              type="button"
              className="reset-filters-btn"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="network-table-card">
            <div className="table-responsive">
              <table className="network-chargers-table">
                <thead>
                  <tr>
                    <th>Charger ID</th>
                    <th>Bay Name</th>
                    <th>Station Location</th>
                    <th>Connector</th>
                    <th>Power</th>
                    <th>Status</th>
                    <th>Rate</th>
                    <th className="th-action">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChargers.map((c) => {
                    const statusClass =
                      c.status === "Available"
                        ? "status-available"
                        : c.status === "In Use"
                        ? "status-in-use"
                        : c.status === "Maintenance"
                        ? "status-maintenance"
                        : "status-offline";

                    return (
                      <tr key={`${c.stationId}-${c.id}`}>
                        <td>
                          <span className="table-charger-id">{c.id}</span>
                        </td>
                        <td>
                          <strong>{c.name}</strong>
                        </td>
                        <td>
                          <div className="table-station-info">
                            <Link
                              to={`/owner/stations/${c.stationId}`}
                              className="station-table-link"
                            >
                              {c.stationName}
                            </Link>
                            <small>{c.stationCity}</small>
                          </div>
                        </td>
                        <td>
                          <span className="connector-tag">{c.connectorType}</span>
                        </td>
                        <td>
                          <span className="power-tag">
                            {typeof c.power === "number" ? `${c.power} kW` : c.power}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            <span className="status-dot"></span>
                            <span>{c.status}</span>
                          </span>
                        </td>
                        <td>
                          <span className="price-tag">LKR {c.pricePerKwh} / kWh</span>
                        </td>
                        <td className="th-action">
                          <Link
                            to={`/owner/stations/${c.stationId}/chargers`}
                            className="manage-station-btn"
                          >
                            <span>Manage Hub</span>
                            <PlugIcon size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
