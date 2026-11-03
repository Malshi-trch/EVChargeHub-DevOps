import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import OwnerHeader from "../components/owner/OwnerHeader";
import "./OwnerBookings.css";
import {
  getBookings,
  saveBookings,
} from "../data/bookingsData";

import {
  getOwnerStations,
  saveOwnerStations,
  syncStationAvailability,
} from "../data/ownerStationsData";
import {
  BoltIcon,
  CalendarIcon,
  TrendingUpIcon,
  SearchIcon,
  CheckIcon,
  ClockIcon,
  TrashIcon,
} from "../components/Icons";

export default function OwnerBookings() {
  const [stations, setStations] = useState(() => getOwnerStations());
  const [bookings, setBookings] = useState(() => getBookings(stations));

  // Tabs: 'All' | 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled'
  const [activeTab, setActiveTab] = useState("All");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const [toastMessage, setToastMessage] = useState("");

  // Confirmation Modal for Cancellation
  const [cancelModalTarget, setCancelModalTarget] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Only display bookings relevant to this owner's stations
  const ownerBookings = useMemo(() => {
    if (!stations || stations.length === 0) return bookings;
    const ownerStationIds = new Set(stations.map((st) => String(st.id)));
    const ownerStationNames = new Set(
      stations.map((st) => st.name.toLowerCase().trim())
    );
    return bookings.filter((b) => {
      if (b.stationId && ownerStationIds.has(String(b.stationId))) return true;
      if (b.stationName && ownerStationNames.has(b.stationName.toLowerCase().trim())) return true;
      return false;
    });
  }, [stations, bookings]);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // -------------------------------------------------------------
  // KPI CALCULATIONS
  // -------------------------------------------------------------
  const kpis = useMemo(() => {
    const todayBookingsList = ownerBookings.filter(
      (b) => b.bookingDate === todayStr || b.date?.day === "Today"
    );
    const todayCount = todayBookingsList.length;
    const pendingCount = ownerBookings.filter((b) => b.status === "Pending").length;
    const confirmedCount = ownerBookings.filter((b) => b.status === "Confirmed").length;
    const activeCount = ownerBookings.filter((b) => b.status === "Active").length;
    const completedTodayCount = ownerBookings.filter(
      (b) =>
        b.status === "Completed" &&
        (b.bookingDate === todayStr || b.date?.day === "Today" || (b.completedAt && b.completedAt.startsWith(todayStr)))
    ).length;

    const todayRevenue = todayBookingsList
      .filter((b) => b.status === "Completed" || b.status === "Active")
      .reduce((sum, b) => sum + (b.estimatedPrice || 0), 0);

    return {
      todayCount,
      pendingCount,
      confirmedCount,
      activeCount,
      completedTodayCount,
      todayRevenue,
      allCount: ownerBookings.length,
      completedCount: ownerBookings.filter((b) => b.status === "Completed").length,
      cancelledCount: ownerBookings.filter((b) => b.status === "Cancelled").length,
    };
  }, [ownerBookings, todayStr]);

  // -------------------------------------------------------------
  // FILTERED BOOKINGS
  // -------------------------------------------------------------
  const filteredBookings = useMemo(() => {
    return ownerBookings.filter((b) => {
      // Tab filter
      if (activeTab !== "All" && b.status !== activeTab) {
        return false;
      }

      // Search query
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesId = (b.bookingId || "").toLowerCase().includes(q);
        const matchesCustomer = (b.customerName || "").toLowerCase().includes(q);
        const matchesStation = (b.stationName || "").toLowerCase().includes(q);
        const matchesCharger = (b.chargerId || "").toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesStation && !matchesCharger) {
          return false;
        }
      }

      // Station filter
      if (stationFilter !== "All" && String(b.stationId) !== String(stationFilter)) {
        return false;
      }

      // Date filter
      if (dateFilter === "Today") {
        const isToday = b.bookingDate === todayStr || b.date?.day === "Today";
        if (!isToday) return false;
      } else if (dateFilter === "Upcoming") {
        const isUpcoming = b.status === "Confirmed" || b.status === "Pending";
        if (!isUpcoming) return false;
      }

      return true;
    });
  }, [ownerBookings, activeTab, searchQuery, stationFilter, dateFilter, todayStr]);

  const resetFilters = () => {
    setSearchQuery("");
    setStationFilter("All");
    setDateFilter("All");
    setActiveTab("All");
  };

  // Helper to persist updated bookings list
  const updateBookingsState = (updatedList, toastText) => {
    setBookings(updatedList);
    saveBookings(updatedList);
    if (toastText) showToast(toastText);
  };

  // Helper to persist updated stations list (with synced availability)
  const updateStationsState = (updatedStationsList) => {
    setStations(updatedStationsList);
    saveOwnerStations(updatedStationsList);
  };

  // -------------------------------------------------------------
  // ACTION: CONFIRM BOOKING (Pending -> Confirmed)
  // -------------------------------------------------------------
  const handleConfirmBooking = (bookingId) => {
    const updated = bookings.map((b) => {
      if (b.bookingId === bookingId) {
        return {
          ...b,
          status: "Confirmed",
          confirmedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    updateBookingsState(updated, `Booking ${bookingId} confirmed successfully!`);
  };

  // -------------------------------------------------------------
  // ACTION: START CHARGING SESSION (Confirmed -> Active)
  // With hardware safety validation
  // -------------------------------------------------------------
  const handleStartSession = (targetBooking) => {
    // 1. Verify target station and charger
    const targetStation = stations.find((st) => String(st.id) === String(targetBooking.stationId));
    if (!targetStation) {
      showToast("⚠️ Could not locate station hardware for this booking.");
      return;
    }

    const chargers = targetStation.individualChargers || [];
    const targetCharger = chargers.find((c) => c.id === targetBooking.chargerId);

    // 2. Validate charger hardware state
    if (targetCharger) {
      if (targetCharger.status === "Maintenance") {
        showToast(`⚠️ Cannot start session: Charger ${targetCharger.id} is currently under Maintenance.`);
        return;
      }
      if (targetCharger.status === "Offline") {
        showToast(`⚠️ Cannot start session: Charger ${targetCharger.id} is Offline.`);
        return;
      }
      if (targetCharger.status === "In Use") {
        showToast(`⚠️ Cannot start session: Charger ${targetCharger.id} is already In Use.`);
        return;
      }
    }

    // 3. Mark booking as Active
    const updatedBookings = bookings.map((b) => {
      if (b.bookingId === targetBooking.bookingId) {
        return {
          ...b,
          status: "Active",
          startedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    // 4. Synchronize charger to "In Use"
    if (targetCharger) {
      const updatedChargers = chargers.map((c) =>
        c.id === targetCharger.id
          ? { ...c, status: "In Use", lastUpdated: "Just now" }
          : c
      );
      const updatedStation = syncStationAvailability({
        ...targetStation,
        individualChargers: updatedChargers,
      });

      const updatedStations = stations.map((st) =>
        String(st.id) === String(updatedStation.id) ? updatedStation : st
      );
      updateStationsState(updatedStations);
    }

    updateBookingsState(
      updatedBookings,
      `Session for ${targetBooking.bookingId} started! Charger ${targetBooking.chargerId} is now In Use.`
    );
  };

  // -------------------------------------------------------------
  // ACTION: COMPLETE CHARGING SESSION (Active -> Completed)
  // Returns charger to Available
  // -------------------------------------------------------------
  const handleCompleteSession = (targetBooking) => {
    // 1. Mark booking as Completed
    const updatedBookings = bookings.map((b) => {
      if (b.bookingId === targetBooking.bookingId) {
        return {
          ...b,
          status: "Completed",
          completedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    // 2. Return charger to "Available" if currently In Use
    const targetStation = stations.find((st) => String(st.id) === String(targetBooking.stationId));
    if (targetStation) {
      const chargers = targetStation.individualChargers || [];
      const updatedChargers = chargers.map((c) => {
        if (c.id === targetBooking.chargerId && c.status === "In Use") {
          return { ...c, status: "Available", lastUpdated: "Just now" };
        }
        return c;
      });

      const updatedStation = syncStationAvailability({
        ...targetStation,
        individualChargers: updatedChargers,
      });

      const updatedStations = stations.map((st) =>
        String(st.id) === String(updatedStation.id) ? updatedStation : st
      );
      updateStationsState(updatedStations);
    }

    updateBookingsState(
      updatedBookings,
      `Charging session for ${targetBooking.bookingId} completed! Charger ${targetBooking.chargerId} is now Available.`
    );
  };

  // -------------------------------------------------------------
  // ACTION: CANCEL BOOKING
  // -------------------------------------------------------------
  const handleConfirmCancelBooking = () => {
    if (!cancelModalTarget) return;

    const bookingId = cancelModalTarget.bookingId;
    const wasActive = cancelModalTarget.status === "Active";

    // 1. Mark booking Cancelled
    const updatedBookings = bookings.map((b) => {
      if (b.bookingId === bookingId) {
        return {
          ...b,
          status: "Cancelled",
          cancelledAt: new Date().toISOString(),
        };
      }
      return b;
    });

    // 2. If it was active, release charger safely back to Available
    if (wasActive) {
      const targetStation = stations.find((st) => String(st.id) === String(cancelModalTarget.stationId));
      if (targetStation) {
        const chargers = targetStation.individualChargers || [];
        const updatedChargers = chargers.map((c) => {
          if (c.id === cancelModalTarget.chargerId && c.status === "In Use") {
            return { ...c, status: "Available", lastUpdated: "Just now" };
          }
          return c;
        });

        const updatedStation = syncStationAvailability({
          ...targetStation,
          individualChargers: updatedChargers,
        });

        const updatedStations = stations.map((st) =>
          String(st.id) === String(updatedStation.id) ? updatedStation : st
        );
        updateStationsState(updatedStations);
      }
    }

    updateBookingsState(updatedBookings, `Booking ${bookingId} has been cancelled.`);
    setCancelModalTarget(null);
  };

  return (
    <div className="owner-bookings-view">
      <OwnerHeader
        title="Booking Management"
        subtitle="Manage customer reservations and charging sessions across your EV charging network."
      />

      {/* MAIN CONTENT AREA */}
      <div className="owner-main">
        {toastMessage && (
          <div className="owner-toast-banner" role="status">
            <span>{toastMessage}</span>
          </div>
        )}


        {/* ===================================================
            KPI SUMMARY CARDS (5 CARDS)
        ==================================================== */}
        <section className="bookings-kpi-grid">
          {/* Card 1: Today's Bookings */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Today's Bookings</span>
              <div className="kpi-icon-wrapper blue">
                <CalendarIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.todayCount}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge neutral">Scheduled</span>
              <small>Today's slots</small>
            </div>
          </div>

          {/* Card 2: Pending */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Pending</span>
              <div className="kpi-icon-wrapper amber">
                <ClockIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.pendingCount}</strong>
            <div className="kpi-footer">
              <span className="kpi-breakdown">{kpis.pendingCount} Awaiting Action</span>
              <small>Needs confirmation</small>
            </div>
          </div>

          {/* Card 3: Active Sessions */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Active Sessions</span>
              <div className="kpi-icon-wrapper green">
                <BoltIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.activeCount}</strong>
            <div className="kpi-footer">
              <span className="kpi-trend positive">● Live Dispensing</span>
              <small>Currently charging</small>
            </div>
          </div>

          {/* Card 4: Completed Today */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Completed Today</span>
              <div className="kpi-icon-wrapper cyan">
                <CheckIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.completedTodayCount}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge blue">{kpis.completedCount} Total All-Time</span>
              <small>Fulfilled sessions</small>
            </div>
          </div>

          {/* Card 5: Today's Revenue */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Today's Revenue</span>
              <div className="kpi-icon-wrapper emerald">
                <TrendingUpIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">
              LKR {kpis.todayRevenue.toLocaleString()}
            </strong>
            <div className="kpi-footer">
              <span className="kpi-trend positive">Earned Today</span>
              <small>Booked value</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            STATUS TABS
        ==================================================== */}
        <section className="bookings-tabs-bar">
          {[
            { id: "All", label: "All", count: kpis.allCount },
            { id: "Pending", label: "Pending", count: kpis.pendingCount },
            { id: "Confirmed", label: "Confirmed", count: kpis.confirmedCount },
            { id: "Active", label: "Active", count: kpis.activeCount },
            { id: "Completed", label: "Completed", count: kpis.completedCount },
            { id: "Cancelled", label: "Cancelled", count: kpis.cancelledCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`booking-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="tab-count-badge">{tab.count}</span>
            </button>
          ))}
        </section>

        {/* ===================================================
            SEARCH AND FILTERS TOOLBAR
        ==================================================== */}
        <section className="bookings-filter-toolbar">
          <div className="filter-search-box">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search by booking ID, customer or station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search bookings"
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
            <div className="filter-select-wrapper">
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

            {/* Date Filter */}
            <div className="filter-select-wrapper">
              <label htmlFor="date-filter-select">Date:</label>
              <select
                id="date-filter-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today Only</option>
                <option value="Upcoming">Upcoming (Pending/Confirmed)</option>
              </select>
            </div>

            {(searchQuery ||
              stationFilter !== "All" ||
              dateFilter !== "All" ||
              activeTab !== "All") && (
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
            BOOKINGS LIST / TABLE
        ==================================================== */}
        {ownerBookings.length === 0 ? (
          <div className="bookings-empty-state">
            <div className="empty-icon-wrap">
              <CalendarIcon size={44} />
            </div>
            <h3>No bookings yet</h3>
            <p>
              No customer bookings have been received for your charging
              stations yet.
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bookings-empty-state">
            <div className="empty-icon-wrap">
              <SearchIcon size={40} />
            </div>
            <h3>No bookings match these filters</h3>
            <p>
              Try adjusting your search criteria, selected tab, or station filter.
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
          <div className="bookings-table-card">
            <div className="table-responsive">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Station</th>
                    <th>Charger & Port</th>
                    <th>Date & Time</th>
                    <th>Est. Cost</th>
                    <th>Status</th>
                    <th className="th-action">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => {
                    const statusClass =
                      b.status === "Pending"
                        ? "status-pending"
                        : b.status === "Confirmed"
                        ? "status-confirmed"
                        : b.status === "Active"
                        ? "status-active"
                        : b.status === "Completed"
                        ? "status-completed"
                        : "status-cancelled";

                    return (
                      <tr key={b.bookingId}>
                        {/* BOOKING ID */}
                        <td>
                          <span className="table-booking-id">{b.bookingId}</span>
                        </td>

                        {/* CUSTOMER */}
                        <td>
                          <div className="customer-cell">
                            <strong>{b.customerName}</strong>
                            <small>{b.customerEmail || "Not provided"}</small>
                            <span className="customer-vehicle-tag">
                              {b.vehicleName}
                            </span>
                          </div>
                        </td>

                        {/* STATION */}
                        <td>
                          <div className="station-cell">
                            <Link
                              to={`/owner/stations/${b.stationId}`}
                              className="station-link"
                            >
                              {b.stationName}
                            </Link>
                          </div>
                        </td>

                        {/* CHARGER */}
                        <td>
                          <div className="charger-cell">
                            <span className="charger-badge">
                              {b.chargerId}
                            </span>
                            <small>
                              {b.connectorType} • {b.chargingPower} kW
                            </small>
                          </div>
                        </td>

                        {/* DATE & TIME */}
                        <td>
                          <div className="datetime-cell">
                            <strong>{b.bookingDate}</strong>
                            <small>
                              {b.startTime} ({b.duration})
                            </small>
                          </div>
                        </td>

                        {/* COST */}
                        <td>
                          <span className="cost-tag">
                            LKR {b.estimatedPrice?.toLocaleString()}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td>
                          <span className={`booking-status-badge ${statusClass}`}>
                            <span className="status-dot"></span>
                            <span>{b.status}</span>
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="th-action">
                          <div className="action-buttons-group">
                            {/* PENDING ACTIONS */}
                            {b.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  className="action-btn confirm"
                                  onClick={() => handleConfirmBooking(b.bookingId)}
                                  title="Confirm booking"
                                >
                                  <CheckIcon size={13} />
                                  <span>Confirm</span>
                                </button>
                                <button
                                  type="button"
                                  className="action-btn cancel"
                                  onClick={() => setCancelModalTarget(b)}
                                  title="Reject booking"
                                >
                                  <TrashIcon size={13} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {/* CONFIRMED ACTIONS */}
                            {b.status === "Confirmed" && (
                              <>
                                <button
                                  type="button"
                                  className="action-btn start"
                                  onClick={() => handleStartSession(b)}
                                  title="Start charging session"
                                >
                                  <BoltIcon size={13} />
                                  <span>Start Session</span>
                                </button>
                                <button
                                  type="button"
                                  className="action-btn cancel"
                                  onClick={() => setCancelModalTarget(b)}
                                  title="Cancel reservation"
                                >
                                  <span>Cancel</span>
                                </button>
                              </>
                            )}

                            {/* ACTIVE ACTIONS */}
                            {b.status === "Active" && (
                              <button
                                type="button"
                                className="action-btn complete"
                                onClick={() => handleCompleteSession(b)}
                                title="Complete charging session"
                              >
                                <CheckIcon size={13} />
                                <span>Complete</span>
                              </button>
                            )}

                            {/* DETAILS LINK */}
                            <Link
                              to={`/owner/bookings/${b.bookingId}`}
                              className="action-btn details"
                              title="View full booking & telemetry details"
                            >
                              <span>Details</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="mobile-bookings-cards-view">
              {filteredBookings.map((b) => {
                const statusClass =
                  b.status === "Pending"
                    ? "status-pending"
                    : b.status === "Confirmed"
                    ? "status-confirmed"
                    : b.status === "Active"
                    ? "status-active"
                    : b.status === "Completed"
                    ? "status-completed"
                    : "status-cancelled";

                return (
                  <div className="mobile-booking-card" key={b.bookingId}>
                    <div className="card-top">
                      <span className="table-booking-id">{b.bookingId}</span>
                      <span className={`booking-status-badge ${statusClass}`}>
                        <span className="status-dot"></span>
                        <span>{b.status}</span>
                      </span>
                    </div>

                    <div className="card-customer-row">
                      <strong>{b.customerName}</strong>
                      <small>{b.vehicleName}</small>
                    </div>

                    <div className="card-detail-item">
                      <small>Station:</small>
                      <span>{b.stationName}</span>
                    </div>

                    <div className="card-detail-item">
                      <small>Charger:</small>
                      <span>
                        {b.chargerId} ({b.connectorType} • {b.chargingPower} kW)
                      </span>
                    </div>

                    <div className="card-detail-item">
                      <small>Schedule:</small>
                      <span>
                        {b.bookingDate} at {b.startTime}
                      </span>
                    </div>

                    <div className="card-cost-row">
                      <small>Total Cost:</small>
                      <strong>LKR {b.estimatedPrice?.toLocaleString()}</strong>
                    </div>

                    <div className="card-actions-row">
                      {b.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            className="action-btn confirm"
                            onClick={() => handleConfirmBooking(b.bookingId)}
                          >
                            <CheckIcon size={13} />
                            <span>Confirm</span>
                          </button>
                          <button
                            type="button"
                            className="action-btn cancel"
                            onClick={() => setCancelModalTarget(b)}
                          >
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {b.status === "Confirmed" && (
                        <>
                          <button
                            type="button"
                            className="action-btn start"
                            onClick={() => handleStartSession(b)}
                          >
                            <BoltIcon size={13} />
                            <span>Start Session</span>
                          </button>
                          <button
                            type="button"
                            className="action-btn cancel"
                            onClick={() => setCancelModalTarget(b)}
                          >
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {b.status === "Active" && (
                        <button
                          type="button"
                          className="action-btn complete"
                          onClick={() => handleCompleteSession(b)}
                        >
                          <CheckIcon size={13} />
                          <span>Complete Session</span>
                        </button>
                      )}

                      <Link
                        to={`/owner/bookings/${b.bookingId}`}
                        className="action-btn details"
                      >
                        <span>Details</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>


      {/* ===================================================
          CONFIRM CANCELLATION MODAL
      ==================================================== */}
      {cancelModalTarget && (
        <div
          className="modal-backdrop"
          onClick={() => setCancelModalTarget(null)}
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
            <h3>Cancel booking {cancelModalTarget.bookingId}?</h3>
            <p>
              This will cancel the reservation for{" "}
              <strong>{cancelModalTarget.customerName}</strong> at{" "}
              <strong>{cancelModalTarget.stationName}</strong>. If an active session
              was in progress, the assigned charger will be returned to Available.
            </p>

            <div className="delete-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setCancelModalTarget(null)}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="confirm-remove-btn"
                onClick={handleConfirmCancelBooking}
              >
                <TrashIcon size={16} />
                <span>Cancel Booking</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
