import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import OwnerHeader from "../components/owner/OwnerHeader";
import {
  getOwnerStations,
  saveOwnerStations,
} from "../data/ownerStationsData";
import {
  getOwnerBookings,
} from "../data/bookingsData";
import { getOwnerProfile } from "../data/ownerProfileData";
import {
  BoltIcon,
  BuildingIcon,
  CalendarIcon,
  CreditCardIcon,
  PlusIcon,
  ClockIcon,
  RouteIcon,
  PlugIcon,
  TrendingUpIcon,
  CarIcon,
  ArrowRightIcon,
  CheckIcon,
} from "../components/Icons";
import "./OwnerDashboard.css";

export default function OwnerDashboard() {
  const [stations, setStations] = useState(() => getOwnerStations());
  const [bookings] = useState(() => getOwnerBookings(stations));
  const [profile, setProfile] = useState(() => getOwnerProfile());

  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setProfile(e.detail);
      } else {
        setProfile(getOwnerProfile());
      }
    };
    window.addEventListener("evOwnerProfileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("evOwnerProfileUpdated", handleProfileUpdate);
  }, []);

  const [showAddChargerModal, setShowAddChargerModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [newCharger, setNewCharger] = useState({
    stationId: "1",
    name: "Charger 05",
    connector: "CCS (Fast DC)",
    power: "150 kW",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Today's bookings strictly matching operational criteria
  const todayBookingsList = useMemo(() => {
    return bookings.filter(
      (b) => b.bookingDate === todayStr || b.date?.day === "Today"
    );
  }, [bookings, todayStr]);

  const todayBookingsCount = todayBookingsList.length;

  // Realized Revenue strictly derived from completed operational bookings
  const completedBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "Completed");
  }, [bookings]);

  const totalRealizedRevenue = useMemo(() => {
    return completedBookings.reduce(
      (sum, b) => sum + (Number(b.estimatedPrice) || 0),
      0
    );
  }, [completedBookings]);

  const todayRevenue = useMemo(() => {
    return todayBookingsList
      .filter((b) => b.status === "Completed" || b.status === "Active")
      .reduce((sum, b) => sum + (Number(b.estimatedPrice) || 0), 0);
  }, [todayBookingsList]);

  // Total and available chargers derived from stations
  const totalChargers = useMemo(() => {
    return stations.reduce((acc, s) => {
      const count = s.individualChargers
        ? s.individualChargers.length
        : Number(s.totalChargers || s.chargers || 0);
      return acc + count;
    }, 0);
  }, [stations]);

  const totalAvailableChargers = useMemo(() => {
    return stations.reduce((acc, s) => {
      if (Array.isArray(s.individualChargers)) {
        return acc + s.individualChargers.filter((c) => c.status === "Available").length;
      }
      return acc + (s.availableChargers ?? Math.max(0, Math.floor(Number(s.chargers || 0) * 0.75)));
    }, 0);
  }, [stations]);

  // Detailed charger status breakdown for Network Health widget
  const chargerStatusCounts = useMemo(() => {
    let available = 0;
    let inUse = 0;
    let maintenance = 0;
    let offline = 0;
    let total = 0;

    stations.forEach((st) => {
      if (Array.isArray(st.individualChargers) && st.individualChargers.length > 0) {
        st.individualChargers.forEach((c) => {
          total++;
          if (c.status === "Available") available++;
          else if (c.status === "In Use") inUse++;
          else if (c.status === "Maintenance") maintenance++;
          else offline++;
        });
      } else {
        const count = Number(st.totalChargers || st.chargers || 4);
        const avail = st.availableChargers ?? Math.max(0, Math.floor(count * 0.75));
        total += count;
        available += avail;
        inUse += Math.max(0, count - avail);
      }
    });

    const safeTotal = total || 1;
    return {
      available,
      inUse,
      maintenance,
      offline,
      total,
      availablePct: Math.round((available / safeTotal) * 100),
      inUsePct: Math.round((inUse / safeTotal) * 100),
      maintenancePct: Math.round((maintenance / safeTotal) * 100),
      offlinePct: Math.round((offline / safeTotal) * 100),
    };
  }, [stations]);

  // Compute 7-day revenue trend from actual bookings
  const weeklyRevenue = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayName = days[d.getDay()];
      const dateString = d.toISOString().split("T")[0];

      // Sum completed bookings for this day
      const dayAmount = completedBookings
        .filter((b) => {
          const bDate = b.completedAt
            ? b.completedAt.split("T")[0]
            : b.bookingDate;
          return bDate === dateString;
        })
        .reduce((sum, b) => sum + (Number(b.estimatedPrice) || 0), 0);

      result.push({
        day: dayName,
        date: dateString,
        amount: dayAmount,
        label: dayAmount > 0 ? `LKR ${(dayAmount / 1000).toFixed(1)}k` : "LKR 0",
      });
    }

    const maxAmount = Math.max(...result.map((r) => r.amount), 5000);
    return result.map((r) => ({
      ...r,
      height: r.amount > 0 ? Math.max(16, Math.round((r.amount / maxAmount) * 100)) : 8,
    }));
  }, [completedBookings]);


  const handleAddCharger = (e) => {
    e.preventDefault();
    const stId = Number(newCharger.stationId);
    const updated = stations.map((st) => {
      if (st.id === stId) {
        const nextId = (st.individualChargers?.length || 0) + 1;
        const newBay = {
          id: `CP-${st.id}-${String(nextId).padStart(3, "0")}`,
          name: newCharger.name || `Bay ${String(nextId).padStart(2, "0")}`,
          connectorType: newCharger.connector.includes("CCS")
            ? "CCS"
            : newCharger.connector.includes("Type 2")
            ? "Type 2"
            : "CHAdeMO",
          power: parseInt(newCharger.power, 10) || 120,
          status: "Available",
          pricePerKwh: st.pricePerKwh || 85,
          lastUpdated: "Just now",
          stationId: st.id,
        };
        const ind = [...(st.individualChargers || []), newBay];
        return {
          ...st,
          chargers: (st.chargers || 0) + 1,
          totalChargers: (st.totalChargers || 0) + 1,
          availableChargers: (st.availableChargers || 0) + 1,
          individualChargers: ind,
        };
      }
      return st;
    });

    setStations(updated);
    saveOwnerStations(updated);

    setShowAddChargerModal(false);
    showToast(`New charger added to station!`);
  };

  return (
    <div className="owner-dashboard-page">
      {/* =========================================================
          REDESIGNED DASHBOARD HEADER
      ========================================================== */}
      <OwnerHeader
        title="Station Operations"
        subtitle={`Welcome back, ${profile.displayName || "Station Owner"} • Here's what's happening across your charging network.`}
        badge="Live Telemetry"
        actions={
          <div className="dash-header-actions">
            <div className="dash-header-status-pill">
              <span className="dash-pulse-dot" />
              <span className="dash-status-text">All 3 Hubs Online</span>
            </div>
            <Link
              to="/owner/stations/new"
              className="dash-header-primary-btn"
            >
              <PlusIcon size={15} />
              <span>Add Station</span>
            </Link>
          </div>
        }
      />

      <div className="owner-dashboard-main">
        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="dash-toast" role="status">
            <span className="dash-toast-icon">✓</span>
            <p>{toastMessage}</p>
          </div>
        )}

        {/* =========================================================
            SECTION 5: COMPLETELY REDESIGNED HERO BANNER
        ========================================================== */}
        <section className="dash-hero-card">
          <div className="dash-hero-content">
            <div className="dash-hero-badge">
              <BoltIcon size={14} />
              <span>Central Charging Network Controller</span>
            </div>

            <h2 className="dash-hero-title">Your Charging Network, At a Glance</h2>
            <p className="dash-hero-description">
              Manage stations, monitor charger availability and keep every charging session running smoothly across Sri Lanka.
            </p>

            <div className="dash-hero-actions">
              <Link to="/owner/stations/new" className="dash-btn-primary">
                <PlusIcon size={16} />
                <span>Add New Station</span>
              </Link>

              <Link to="/owner/stations" className="dash-btn-glass">
                <span>View Network</span>
                <ArrowRightIcon size={15} />
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE EV CHARGING VISUAL TREATMENT */}
          <div className="dash-hero-visual">
            <div className="dash-telemetry-card">
              <div className="telemetry-card-header">
                <div className="telemetry-pill">
                  <span className="telemetry-live-dot" />
                  <span>LIVE GRID STATUS</span>
                </div>
                <span className="telemetry-station-count">{stations.length} Hubs Connected</span>
              </div>

              <div className="telemetry-card-body">
                <div className="telemetry-main-stat">
                  <strong className="telemetry-stat-value">{totalAvailableChargers}</strong>
                  <span className="telemetry-stat-total">/ {totalChargers} Bays</span>
                </div>
                <p className="telemetry-subtext">
                  Available for immediate driver charging ({chargerStatusCounts.availablePct}% online readiness)
                </p>

                <div className="telemetry-progress-track">
                  <div
                    className="telemetry-progress-fill"
                    style={{ width: `${chargerStatusCounts.availablePct}%` }}
                  />
                </div>

                <div className="telemetry-footer-grid">
                  <div className="telemetry-mini-stat">
                    <small>Active Sessions</small>
                    <strong>{bookings.filter((b) => b.status === "Active").length} live</strong>
                  </div>
                  <div className="telemetry-mini-stat">
                    <small>Today's Earned</small>
                    <strong>LKR {todayRevenue.toLocaleString("en-US")}</strong>
                  </div>
                  <div className="telemetry-mini-stat">
                    <small>Grid Stability</small>
                    <strong className="telemetry-green">100% CEB</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 6: REDESIGNED KPI CARDS (4 PREMIUM CARDS)
        ========================================================== */}
        <section className="dash-kpi-grid">
          {/* KPI 1: Total Stations */}
          <div className="dash-kpi-card">
            <div className="kpi-card-top">
              <span className="kpi-label">Total Stations</span>
              <div className="kpi-icon-box green">
                <BuildingIcon size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <strong className="kpi-value">{String(stations.length).padStart(2, "0")}</strong>
              <span className="kpi-badge emerald">100% Active</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-subtext">All hubs operational across Southern & Western hubs</span>
            </div>
          </div>

          {/* KPI 2: Active Chargers / Available Now */}
          <div className="dash-kpi-card">
            <div className="kpi-card-top">
              <span className="kpi-label">Active Chargers</span>
              <div className="kpi-icon-box blue">
                <BoltIcon size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <strong className="kpi-value">{totalChargers}</strong>
              <span className="kpi-badge blue">{totalAvailableChargers} Available</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-subtext">
                {chargerStatusCounts.inUse} in active use • {chargerStatusCounts.maintenance + chargerStatusCounts.offline} attention
              </span>
            </div>
          </div>

          {/* KPI 3: Today's Bookings */}
          <div className="dash-kpi-card">
            <div className="kpi-card-top">
              <span className="kpi-label">Today's Bookings</span>
              <div className="kpi-icon-box amber">
                <CalendarIcon size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <strong className="kpi-value">{todayBookingsCount}</strong>
              <span className="kpi-badge amber">Scheduled</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-subtext">Synced in real time with driver reservations</span>
            </div>
          </div>

          {/* KPI 4: Realized Revenue */}
          <div className="dash-kpi-card">
            <div className="kpi-card-top">
              <span className="kpi-label">Realized Revenue</span>
              <div className="kpi-icon-box purple">
                <CreditCardIcon size={20} />
              </div>
            </div>
            <div className="kpi-value-row">
              <strong className="kpi-value">
                LKR {totalRealizedRevenue.toLocaleString("en-US")}
              </strong>
              <span className="kpi-badge emerald">Delivered</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-subtext">
                Today: LKR {todayRevenue.toLocaleString("en-US")} • Completed sessions
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            ROW 1: REVENUE OVERVIEW (LARGER) + NETWORK HEALTH (SMALLER)
        ========================================================== */}
        <div className="dash-split-row-1">
          {/* REVENUE OVERVIEW */}
          <div className="dash-panel revenue-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title">Revenue Overview</h3>
                <p className="dash-panel-subtitle">Past 7 days realized earnings from completed charges</p>
              </div>
              <div className="dash-panel-header-actions">
                <span className="dash-pill-total">
                  Total LKR {totalRealizedRevenue.toLocaleString("en-US")}
                </span>
                <Link to="/owner/analytics" className="dash-panel-link">
                  Analytics &rarr;
                </Link>
              </div>
            </div>

            {/* PURE CSS BAR CHART */}
            <div className="dash-chart-area">
              <div className="dash-bars-container">
                {weeklyRevenue.map((item) => (
                  <div className="dash-bar-column" key={item.day}>
                    <div className="dash-bar-track">
                      <span className="dash-bar-tooltip">{item.label}</span>
                      <div
                        className="dash-bar-fill"
                        style={{ height: `${item.height}%` }}
                      />
                    </div>
                    <span className="dash-bar-day">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* REVENUE MINI SUMMARY */}
            <div className="dash-revenue-stats-grid">
              <div className="dash-revenue-stat">
                <small>Total Realized Revenue</small>
                <strong>LKR {totalRealizedRevenue.toLocaleString("en-US")}</strong>
              </div>
              <div className="dash-revenue-stat">
                <small>Today's Realized Revenue</small>
                <strong className="emerald-text">
                  LKR {todayRevenue.toLocaleString("en-US")}
                </strong>
              </div>
              <div className="dash-revenue-stat">
                <small>Live Charging Sessions</small>
                <strong>{bookings.filter((b) => b.status === "Active").length} active now</strong>
              </div>
              <div className="dash-revenue-stat">
                <small>Total Network Bookings</small>
                <strong>{bookings.length} reservations</strong>
              </div>
            </div>
          </div>

          {/* NETWORK HEALTH WIDGET */}
          <div className="dash-panel health-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title">Network Health</h3>
                <p className="dash-panel-subtitle">Bay availability & system connectivity</p>
              </div>
              <span className="dash-status-tag online">● 100% Online</span>
            </div>

            {/* STATUS BREAKDOWN BAR */}
            <div className="dash-health-body">
              <div className="dash-health-bar-wrapper">
                <div className="dash-health-bar">
                  <div
                    className="health-bar-segment available"
                    style={{ width: `${chargerStatusCounts.availablePct}%` }}
                    title={`Available: ${chargerStatusCounts.available}`}
                  />
                  <div
                    className="health-bar-segment in-use"
                    style={{ width: `${chargerStatusCounts.inUsePct}%` }}
                    title={`In Use: ${chargerStatusCounts.inUse}`}
                  />
                  <div
                    className="health-bar-segment maintenance"
                    style={{ width: `${chargerStatusCounts.maintenancePct}%` }}
                    title={`Maintenance: ${chargerStatusCounts.maintenance}`}
                  />
                  <div
                    className="health-bar-segment offline"
                    style={{ width: `${chargerStatusCounts.offlinePct}%` }}
                    title={`Offline: ${chargerStatusCounts.offline}`}
                  />
                </div>
              </div>

              {/* STATUS LEGEND GRID */}
              <div className="dash-health-legend">
                <div className="health-legend-item">
                  <span className="legend-dot available" />
                  <div className="legend-info">
                    <strong>{chargerStatusCounts.available}</strong>
                    <span>Available ({chargerStatusCounts.availablePct}%)</span>
                  </div>
                </div>

                <div className="health-legend-item">
                  <span className="legend-dot in-use" />
                  <div className="legend-info">
                    <strong>{chargerStatusCounts.inUse}</strong>
                    <span>In Use ({chargerStatusCounts.inUsePct}%)</span>
                  </div>
                </div>

                <div className="health-legend-item">
                  <span className="legend-dot maintenance" />
                  <div className="legend-info">
                    <strong>{chargerStatusCounts.maintenance}</strong>
                    <span>Maintenance ({chargerStatusCounts.maintenancePct}%)</span>
                  </div>
                </div>

                <div className="health-legend-item">
                  <span className="legend-dot offline" />
                  <div className="legend-info">
                    <strong>{chargerStatusCounts.offline}</strong>
                    <span>Offline ({chargerStatusCounts.offlinePct}%)</span>
                  </div>
                </div>
              </div>

              {/* TELEMETRY ACTIVITY ROWS */}
              <div className="dash-health-items">
                <div className="dash-health-row">
                  <div className="health-row-icon green">
                    <CheckIcon size={16} />
                  </div>
                  <div className="health-row-text">
                    <strong>CEB Power Grid Stable</strong>
                    <span>33kV substations operational with zero active phase faults</span>
                  </div>
                </div>

                <div className="dash-health-row">
                  <div className="health-row-icon blue">
                    <PlugIcon size={16} />
                  </div>
                  <div className="health-row-text">
                    <strong>OCPP 2.0.1 Protocol Sync</strong>
                    <span>All {totalChargers} charging points communicating in real time</span>
                  </div>
                </div>

                <div className="dash-health-row">
                  <div className="health-row-icon amber">
                    <ClockIcon size={16} />
                  </div>
                  <div className="health-row-text">
                    <strong>Peak Window Today</strong>
                    <span>Anticipated 4:00 PM – 7:30 PM (expected 85% occupancy)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            ROW 2: STATION PERFORMANCE (50%) + RECENT BOOKINGS (50%)
        ========================================================== */}
        <div className="dash-split-row-2">
          {/* STATION PERFORMANCE */}
          <div className="dash-panel station-perf-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title">Station Performance</h3>
                <p className="dash-panel-subtitle">Bay availability, booking volume & revenue by hub</p>
              </div>
              <Link to="/owner/stations" className="dash-panel-link">
                View All ({stations.length}) &rarr;
              </Link>
            </div>

            <div className="dash-stations-list">
              {stations.map((st) => {
                const ind = st.individualChargers || [];
                const totalBays = ind.length > 0 ? ind.length : st.totalChargers || st.chargers || 4;
                const availBays = ind.length > 0
                  ? ind.filter((c) => c.status === "Available").length
                  : st.availableChargers ?? Math.max(0, Math.floor(totalBays * 0.75));

                const stBookings = bookings.filter(
                  (b) => String(b.stationId) === String(st.id) || b.stationName === st.name
                );
                const stTodayBookings = stBookings.filter(
                  (b) => b.bookingDate === todayStr || b.date?.day === "Today"
                ).length;
                const stRevenue = stBookings
                  .filter((b) => b.status === "Completed")
                  .reduce((sum, b) => sum + (Number(b.estimatedPrice) || 0), 0);
                const utilization = totalBays > 0 ? Math.round(((totalBays - availBays) / totalBays) * 100) : 40;

                return (
                  <div className="dash-station-card" key={st.id}>
                    <div className="station-card-top">
                      <div className="station-card-identity">
                        <div className="station-icon-chip">
                          <BoltIcon size={18} />
                        </div>
                        <div>
                          <h4 className="station-card-name">{st.name}</h4>
                          <span className="station-card-address">
                            <RouteIcon size={13} />
                            {st.location || st.address || "Sri Lanka"}
                          </span>
                        </div>
                      </div>

                      <div className="station-card-badges">
                        {st.power && <span className="dash-power-tag">⚡ {st.power}</span>}
                        <span className="dash-status-pill active">● Active</span>
                      </div>
                    </div>

                    <div className="station-card-metrics">
                      <div className="st-metric">
                        <small>Bay Availability</small>
                        <strong>{availBays} / {totalBays} Free</strong>
                      </div>
                      <div className="st-metric">
                        <small>Today's Bookings</small>
                        <strong>{stTodayBookings} Slots</strong>
                      </div>
                      <div className="st-metric">
                        <small>Realized Revenue</small>
                        <strong className="emerald-text">
                          LKR {stRevenue.toLocaleString("en-US")}
                        </strong>
                      </div>
                    </div>

                    <div className="station-card-progress">
                      <div className="progress-labels">
                        <span>Live Bay Utilization</span>
                        <strong>{utilization}% Occupied</strong>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.max(6, utilization)}%` }}
                        />
                      </div>
                    </div>

                    <div className="station-card-actions">
                      <Link to={`/owner/stations/${st.id}`} className="station-details-btn">
                        <span>View Station Details</span>
                        <ArrowRightIcon size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECENT BOOKINGS */}
          <div className="dash-panel bookings-panel">
            <div className="dash-panel-header">
              <div>
                <h3 className="dash-panel-title">Recent Bookings</h3>
                <p className="dash-panel-subtitle">Real-time driver reservations across your network</p>
              </div>
              <Link to="/owner/bookings" className="dash-panel-link">
                View All ({bookings.length}) &rarr;
              </Link>
            </div>

            <div className="dash-bookings-table-wrapper">
              <table className="dash-bookings-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Station & Bay</th>
                    <th>Date & Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((bk) => (
                    <tr key={bk.bookingId || bk.id}>
                      <td>
                        <div className="booking-customer-cell">
                          <div className="booking-avatar">
                            {(bk.customerName || bk.customer || "E").charAt(0)}
                          </div>
                          <div>
                            <strong className="booking-customer-name">
                              {bk.customerName || bk.customer || "EV Driver"}
                            </strong>
                            <span className="booking-vehicle">
                              <CarIcon size={12} />
                              {bk.vehicleName || bk.vehicle?.name || "EV"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="booking-station-cell">
                          <strong>{bk.stationName || "Charging Station"}</strong>
                          <small>{bk.chargerName || "Charger"} • {bk.connectorType || "CCS"}</small>
                        </div>
                      </td>
                      <td>
                        <div className="booking-time-cell">
                          <ClockIcon size={13} />
                          <span>{bk.bookingDate || "Today"}, {bk.startTime || bk.time || "10:00 AM"}</span>
                        </div>
                      </td>
                      <td>
                        <strong className="booking-amount">
                          LKR {(bk.estimatedPrice || 0).toLocaleString("en-US")}
                        </strong>
                      </td>
                      <td>
                        <span className={`dash-booking-badge ${bk.status?.toLowerCase()}`}>
                          {bk.status === "Active" && <span className="dash-pulse-dot" />}
                          {bk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =========================================================
            ROW 3: QUICK ACTIONS (4 COMPACT MODERN INTERACTIVE CARDS)
        ========================================================== */}
        <section className="dash-quick-actions-section">
          <div className="quick-actions-header">
            <div>
              <h3 className="quick-actions-title">Quick Actions</h3>
              <p className="quick-actions-subtitle">Direct shortcuts to essential operational tasks</p>
            </div>
          </div>

          <div className="dash-actions-grid">
            <Link
              to="/owner/stations/new"
              className="dash-action-card"
            >
              <div className="action-card-icon green">
                <PlusIcon size={20} />
              </div>
              <div className="action-card-text">
                <strong className="action-card-title">Add Station</strong>
                <span className="action-card-desc">Onboard a new charging hub to your network</span>
              </div>
              <span className="action-card-arrow">&rarr;</span>
            </Link>

            <Link to="/owner/chargers" className="dash-action-card">
              <div className="action-card-icon blue">
                <PlugIcon size={20} />
              </div>
              <div className="action-card-text">
                <strong className="action-card-title">Manage Chargers</strong>
                <span className="action-card-desc">Configure bay rates, power & connector states</span>
              </div>
              <span className="action-card-arrow">&rarr;</span>
            </Link>

            <Link to="/owner/bookings" className="dash-action-card">
              <div className="action-card-icon amber">
                <CalendarIcon size={20} />
              </div>
              <div className="action-card-text">
                <strong className="action-card-title">View Bookings</strong>
                <span className="action-card-desc">Confirm, activate and track driver reservations</span>
              </div>
              <span className="action-card-arrow">&rarr;</span>
            </Link>

            <Link to="/owner/analytics" className="dash-action-card">
              <div className="action-card-icon emerald">
                <TrendingUpIcon size={20} />
              </div>
              <div className="action-card-text">
                <strong className="action-card-title">View Analytics</strong>
                <span className="action-card-desc">Analyze revenue trends, usage & export CSV</span>
              </div>
              <span className="action-card-arrow">&rarr;</span>
            </Link>
          </div>
        </section>
      </div>



      {/* =========================================================
          ADD CHARGER MODAL
      ========================================================== */}
      {showAddChargerModal && (
        <div className="owner-modal-backdrop" role="dialog" aria-modal="true">
          <div className="owner-modal-card">
            <div className="modal-header">
              <div>
                <h2>Add Charger to Station</h2>
                <p>Increase charging capacity at an existing hub.</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddChargerModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCharger}>
              <div className="modal-field">
                <label>Select Station</label>
                <select
                  value={newCharger.stationId}
                  onChange={(e) => setNewCharger({ ...newCharger, stationId: e.target.value })}
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.chargers || st.totalChargers || 4} Chargers)
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <label>Charger Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Charger 05"
                    value={newCharger.name}
                    onChange={(e) => setNewCharger({ ...newCharger, name: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label>Connector Type</label>
                  <select
                    value={newCharger.connector}
                    onChange={(e) => setNewCharger({ ...newCharger, connector: e.target.value })}
                  >
                    <option value="CCS (Fast DC)">CCS (Fast DC)</option>
                    <option value="Type 2 (AC)">Type 2 (AC)</option>
                    <option value="CHAdeMO (DC)">CHAdeMO (DC)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowAddChargerModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  Add Charger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}