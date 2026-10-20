import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import OwnerHeader from "../components/owner/OwnerHeader";
import "./OwnerCustomerDetails.css";

import {
  UsersIcon,
  ArrowLeftIcon,
  CalendarIcon,
  BoltIcon,
  CheckIcon,
  ClockIcon,
  LocationIcon,
  InfoIcon,
} from "../components/Icons";
import { getOwnerStations } from "../data/ownerStationsData";
import {
  getCustomerDetails,
  formatCustomerDate,
} from "../data/bookingsData";

export default function OwnerCustomerDetails() {
  const { customerId } = useParams();

  const stations = useMemo(() => getOwnerStations(), []);
  const customer = useMemo(
    () => getCustomerDetails(customerId, stations),
    [customerId, stations]
  );

  // Derived timeline of actual booking events
  const timelineEvents = useMemo(() => {
    if (!customer || !customer.bookings) return [];
    return customer.bookings.map((b) => {
      let title = "Reservation received";
      let badgeType = "pending";
      if (b.status === "Completed") {
        title = "Charging session completed";
        badgeType = "completed";
      } else if (b.status === "Active") {
        title = "Live charging in progress";
        badgeType = "active";
      } else if (b.status === "Confirmed") {
        title = "Booking slot confirmed";
        badgeType = "confirmed";
      } else if (b.status === "Cancelled") {
        title = "Reservation cancelled";
        badgeType = "cancelled";
      }

      return {
        id: b.bookingId,
        title,
        stationName: b.stationName,
        chargerName: b.chargerName,
        date: formatCustomerDate(b.bookingDate || b.createdAt),
        time: b.startTime,
        status: b.status,
        badgeType,
        energy:
          b.status === "Completed" && b.estimatedEnergy
            ? `${b.estimatedEnergy} kWh`
            : null,
        cost:
          b.status === "Completed"
            ? `LKR ${b.estimatedPrice?.toLocaleString()}`
            : null,
      };
    });
  }, [customer]);

  // Extract customer initials for avatar
  const getInitials = (name) => {
    if (!name) return "EV";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="owner-customer-details-view">
      <OwnerHeader
        title={customer ? customer.name : "Customer Details"}
        subtitle="Operational profile, contact information and charging history across your network."
        breadcrumbs={
          <Link to="/owner/customers" className="back-to-customers-link" style={{ textDecoration: "none", color: "#059669", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeftIcon size={14} />
            <span>Back to Customers</span>
          </Link>
        }
      />

        {/* ===================================================
            CUSTOMER NOT FOUND STATE
        ==================================================== */}
        {!customer ? (
          <div className="customer-not-found-card">
            <div className="not-found-icon-circle">
              <UsersIcon size={44} />
            </div>
            <h2>Customer Not Found</h2>
            <p>
              The requested customer could not be found in your charging
              network.
            </p>
            <Link to="/owner/customers" className="btn-back-to-customers">
              <ArrowLeftIcon size={16} />
              <span>Back to Customers</span>
            </Link>
          </div>
        ) : (
          /* ===================================================
             CUSTOMER PROFILE DETAILS
          ==================================================== */
          <div className="customer-profile-container">
            {/* PROFILE HEADER CARD */}
            <div className="profile-hero-card">
              <div className="hero-left">
                <div className="customer-hero-avatar">
                  {getInitials(customer.name)}
                </div>
                <div className="hero-text-block">
                  <div className="hero-title-row">
                    <h1 className="customer-full-name">{customer.name}</h1>
                    <div className="badge-wrapper">
                      <span
                        className={`customer-type-badge ${
                          customer.isReturning ? "returning" : "new"
                        }`}
                      >
                        {customer.customerType}
                      </span>
                      {customer.hasActiveSession && (
                        <span className="customer-active-badge">
                          ● Active Session
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="customer-contacts-row">
                    <div className="contact-pill">
                      <small>Email:</small>
                      <strong>{customer.email || "Not provided"}</strong>
                    </div>
                    <div className="contact-pill">
                      <small>Phone:</small>
                      <strong>{customer.phone || "Not provided"}</strong>
                    </div>
                    <div className="contact-pill">
                      <small>Customer ID:</small>
                      <strong className="code-text">{customer.customerId}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PROFILE SUMMARY METRICS (8-BOX KPI GRID) */}
            <section className="profile-stats-grid">
              {/* Box 1: Total Bookings */}
              <div className="profile-stat-box">
                <span className="stat-label">Total Bookings</span>
                <strong className="stat-value">{customer.totalBookings}</strong>
                <span className="stat-subtext">All-time reservations</span>
              </div>

              {/* Box 2: Completed Sessions */}
              <div className="profile-stat-box">
                <span className="stat-label">Completed Sessions</span>
                <strong className="stat-value highlight-green">
                  {customer.completedSessions}
                </strong>
                <span className="stat-subtext">Fulfilled charging visits</span>
              </div>

              {/* Box 3: Cancelled Bookings */}
              <div className="profile-stat-box">
                <span className="stat-label">Cancelled Bookings</span>
                <strong className="stat-value highlight-muted">
                  {customer.cancelledBookings}
                </strong>
                <span className="stat-subtext">Zero spend impact</span>
              </div>

              {/* Box 4: Total Spent */}
              <div className="profile-stat-box">
                <span className="stat-label">Total Spent</span>
                <strong className="stat-value highlight-emerald">
                  LKR {customer.totalSpent.toLocaleString()}
                </strong>
                <span className="stat-subtext">From completed sessions</span>
              </div>

              {/* Box 5: Total Energy Charged */}
              <div className="profile-stat-box">
                <span className="stat-label">Total Energy Charged</span>
                <strong className="stat-value highlight-cyan">
                  {customer.hasEnergyData && customer.totalEnergy > 0
                    ? `${customer.totalEnergy} kWh`
                    : "Not available"}
                </strong>
                <span className="stat-subtext">Delivered power</span>
              </div>

              {/* Box 6: First Visit */}
              <div className="profile-stat-box">
                <span className="stat-label">First Visit</span>
                <strong className="stat-value date-val">
                  {formatCustomerDate(customer.firstVisit)}
                </strong>
                <span className="stat-subtext">Initial reservation</span>
              </div>

              {/* Box 7: Last Visit */}
              <div className="profile-stat-box">
                <span className="stat-label">Last Visit</span>
                <strong className="stat-value date-val">
                  {formatCustomerDate(customer.lastVisit)}
                </strong>
                <span className="stat-subtext">Latest activity</span>
              </div>

              {/* Box 8: Most Used Station */}
              <div className="profile-stat-box">
                <span className="stat-label">Most Used Station</span>
                <strong className="stat-value station-val">
                  {customer.favouriteStation
                    ? customer.favouriteStation.name
                    : "None"}
                </strong>
                <span className="stat-subtext">
                  {customer.favouriteStation
                    ? `${customer.favouriteStation.count} ${
                        customer.favouriteStation.count === 1
                          ? "session"
                          : "sessions"
                      }`
                    : "No station visits"}
                </span>
              </div>
            </section>

            {/* TWO-COLUMN DETAILS SECTION */}
            <div className="details-two-columns">
              {/* LEFT / MAIN COLUMN: BOOKING HISTORY TABLE */}
              <div className="history-column">
                <div className="section-card">
                  <div className="section-header">
                    <div className="header-text">
                      <h2>Booking & Session History</h2>
                      <p>
                        All charging reservations and sessions by this customer
                        across your network.
                      </p>
                    </div>
                    <span className="history-count-badge">
                      {customer.bookings.length}{" "}
                      {customer.bookings.length === 1 ? "Record" : "Records"}
                    </span>
                  </div>

                  {/* Desktop Table */}
                  <div className="history-table-wrapper">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Station & Charger</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Energy</th>
                          <th>Cost</th>
                          <th style={{ textAlign: "right" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.bookings.map((b) => (
                          <tr key={b.bookingId}>
                            <td>
                              <span className="table-booking-id">
                                {b.bookingId}
                              </span>
                            </td>
                            <td>
                              <div className="station-cell">
                                <strong>{b.stationName}</strong>
                                <small>{b.chargerName} ({b.connectorType})</small>
                              </div>
                            </td>
                            <td>
                              <div className="datetime-cell">
                                <span>{formatCustomerDate(b.bookingDate || b.createdAt)}</span>
                                <small>{b.startTime}</small>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`booking-status-tag ${b.status.toLowerCase()}`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <span className="energy-val">
                                {b.status === "Completed" && b.estimatedEnergy
                                  ? `${b.estimatedEnergy} kWh`
                                  : "—"}
                              </span>
                            </td>
                            <td>
                              <strong className="cost-val">
                                {b.status === "Completed"
                                  ? `LKR ${b.estimatedPrice?.toLocaleString()}`
                                  : b.status === "Cancelled"
                                  ? "LKR 0"
                                  : `LKR ${b.estimatedPrice?.toLocaleString()} (Est.)`}
                              </strong>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <Link
                                to={`/owner/bookings/${b.bookingId}`}
                                className="btn-view-booking-link"
                              >
                                View Booking
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Booking Cards */}
                  <div className="history-mobile-cards">
                    {customer.bookings.map((b) => (
                      <div key={b.bookingId} className="history-mobile-card">
                        <div className="mobile-card-top">
                          <span className="table-booking-id">{b.bookingId}</span>
                          <span
                            className={`booking-status-tag ${b.status.toLowerCase()}`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className="mobile-card-station">
                          <strong>{b.stationName}</strong>
                          <small>{b.chargerName} · {b.connectorType}</small>
                        </div>
                        <div className="mobile-card-meta">
                          <div>
                            <small>Date & Time</small>
                            <span>
                              {formatCustomerDate(b.bookingDate || b.createdAt)}{" "}
                              {b.startTime}
                            </span>
                          </div>
                          <div>
                            <small>Energy / Cost</small>
                            <strong>
                              {b.status === "Completed"
                                ? `LKR ${b.estimatedPrice?.toLocaleString()}`
                                : b.status === "Cancelled"
                                ? "LKR 0"
                                : `LKR ${b.estimatedPrice?.toLocaleString()}`}
                            </strong>
                          </div>
                        </div>
                        <Link
                          to={`/owner/bookings/${b.bookingId}`}
                          className="btn-view-booking-link mobile-full"
                        >
                          View Booking
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: RECENT ACTIVITY TIMELINE */}
              <div className="timeline-column">
                <div className="section-card">
                  <div className="section-header">
                    <div className="header-text">
                      <h2>Activity Timeline</h2>
                      <p>Chronological milestones</p>
                    </div>
                  </div>

                  <div className="activity-timeline">
                    {timelineEvents.map((evt, idx) => (
                      <div key={evt.id || idx} className="timeline-item">
                        <div className="timeline-marker">
                          <div className={`timeline-dot ${evt.badgeType}`}>
                            {evt.status === "Completed" && <CheckIcon size={12} />}
                            {evt.status === "Active" && <BoltIcon size={12} />}
                            {evt.status === "Confirmed" && <CalendarIcon size={12} />}
                            {evt.status === "Pending" && <ClockIcon size={12} />}
                            {evt.status === "Cancelled" && <span>✕</span>}
                          </div>
                          {idx !== timelineEvents.length - 1 && (
                            <div className="timeline-line" />
                          )}
                        </div>
                        <div className="timeline-content">
                          <strong className="timeline-title">
                            {evt.title}
                          </strong>
                          <p className="timeline-station">
                            <LocationIcon size={12} />
                            <span>{evt.stationName}</span>
                          </p>
                          <div className="timeline-meta">
                            <small>{evt.date} · {evt.time}</small>
                            {evt.energy && (
                              <span className="timeline-energy-badge">
                                {evt.energy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PRIVACY & COMPLIANCE NOTICE */}
            <div className="privacy-notice-box">
              <div className="notice-icon">
                <InfoIcon size={20} />
              </div>
              <div className="notice-text">
                <strong>Privacy-Aware Station Owner View</strong>
                <p>
                  This operational view displays only charging session activity
                  and reservation contact details associated with your charging
                  network. Private credentials, passwords, and payment card details
                  remain strictly protected.
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

