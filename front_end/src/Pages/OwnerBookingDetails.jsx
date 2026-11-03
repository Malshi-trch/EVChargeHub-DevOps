import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import "./OwnerBookingDetails.css";
import {
  getBookings,
  saveBookings,
} from "../data/bookingsData";
import {
  getOwnerStations,
  saveOwnerStations,
  syncStationAvailability,
} from "../data/ownerStationsData";
import OwnerHeader from "../components/owner/OwnerHeader";
import {
  CalendarIcon,
  PlugIcon,
  ArrowLeftIcon,
  CheckIcon,
  TrashIcon,
  BoltIcon,
} from "../components/Icons";

export default function OwnerBookingDetails() {
  const { bookingId } = useParams();

  const [stations, setStations] = useState(() => getOwnerStations());
  const [bookings, setBookings] = useState(() => getBookings(stations));

  const [toastMessage, setToastMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Find target booking
  const booking = useMemo(() => {
    return bookings.find((b) => b.bookingId === bookingId);
  }, [bookings, bookingId]);

  // Find target station
  const station = useMemo(() => {
    if (!booking) return null;
    return stations.find((st) => String(st.id) === String(booking.stationId));
  }, [stations, booking]);

  // Find target charger
  const charger = useMemo(() => {
    if (!station || !booking) return null;
    return (station.individualChargers || []).find((c) => c.id === booking.chargerId);
  }, [station, booking]);

  const updateBookingsState = (updatedList, toastText) => {
    setBookings(updatedList);
    saveBookings(updatedList);
    if (toastText) showToast(toastText);
  };

  const updateStationsState = (updatedStationsList) => {
    setStations(updatedStationsList);
    saveOwnerStations(updatedStationsList);
  };

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------
  const handleConfirm = () => {
    if (!booking) return;
    const updated = bookings.map((b) =>
      b.bookingId === bookingId
        ? { ...b, status: "Confirmed", confirmedAt: new Date().toISOString() }
        : b
    );
    updateBookingsState(updated, `Booking ${bookingId} confirmed!`);
  };

  const handleStartSession = () => {
    if (!booking) return;

    // Check charger hardware status
    if (charger) {
      if (charger.status === "Maintenance") {
        showToast(`⚠️ Charger ${charger.id} is under Maintenance. Cannot start session.`);
        return;
      }
      if (charger.status === "Offline") {
        showToast(`⚠️ Charger ${charger.id} is Offline. Cannot start session.`);
        return;
      }
      if (charger.status === "In Use") {
        showToast(`⚠️ Charger ${charger.id} is already In Use.`);
        return;
      }
    }

    // Update booking status
    const updatedBookings = bookings.map((b) =>
      b.bookingId === bookingId
        ? { ...b, status: "Active", startedAt: new Date().toISOString() }
        : b
    );

    // Update charger status to In Use
    if (station && charger) {
      const updatedChargers = (station.individualChargers || []).map((c) =>
        c.id === charger.id ? { ...c, status: "In Use", lastUpdated: "Just now" } : c
      );
      const updatedStation = syncStationAvailability({
        ...station,
        individualChargers: updatedChargers,
      });
      const updatedStations = stations.map((st) =>
        String(st.id) === String(updatedStation.id) ? updatedStation : st
      );
      updateStationsState(updatedStations);
    }

    updateBookingsState(
      updatedBookings,
      `Session for ${bookingId} is now Active! Charger ${booking.chargerId} set to In Use.`
    );
  };

  const handleCompleteSession = () => {
    if (!booking) return;

    // Update booking status
    const updatedBookings = bookings.map((b) =>
      b.bookingId === bookingId
        ? { ...b, status: "Completed", completedAt: new Date().toISOString() }
        : b
    );

    // Release charger back to Available
    if (station && charger && charger.status === "In Use") {
      const updatedChargers = (station.individualChargers || []).map((c) =>
        c.id === charger.id ? { ...c, status: "Available", lastUpdated: "Just now" } : c
      );
      const updatedStation = syncStationAvailability({
        ...station,
        individualChargers: updatedChargers,
      });
      const updatedStations = stations.map((st) =>
        String(st.id) === String(updatedStation.id) ? updatedStation : st
      );
      updateStationsState(updatedStations);
    }

    updateBookingsState(
      updatedBookings,
      `Charging session ${bookingId} marked as Completed! Charger released to Available.`
    );
  };

  const handleCancelBooking = () => {
    if (!booking) return;

    const wasActive = booking.status === "Active";

    const updatedBookings = bookings.map((b) =>
      b.bookingId === bookingId
        ? { ...b, status: "Cancelled", cancelledAt: new Date().toISOString() }
        : b
    );

    if (wasActive && station && charger && charger.status === "In Use") {
      const updatedChargers = (station.individualChargers || []).map((c) =>
        c.id === charger.id ? { ...c, status: "Available", lastUpdated: "Just now" } : c
      );
      const updatedStation = syncStationAvailability({
        ...station,
        individualChargers: updatedChargers,
      });
      const updatedStations = stations.map((st) =>
        String(st.id) === String(updatedStation.id) ? updatedStation : st
      );
      updateStationsState(updatedStations);
    }

    updateBookingsState(updatedBookings, `Booking ${bookingId} has been cancelled.`);
    setShowCancelModal(false);
  };

  // NOT FOUND FALLBACK
  // Not found
  if (!booking) {
    return (
      <div className="owner-booking-details-page">
        <OwnerHeader
          title="Booking Not Found"
          subtitle="The requested booking could not be found."
          breadcrumbs={[
            { label: "Bookings", to: "/owner/bookings" },
            { label: "Not Found" },
          ]}
        />
        <div className="details-not-found-card">
          <div className="not-found-icon">
            <CalendarIcon size={40} />
          </div>
          <h2>Booking Not Found</h2>
          <p>
            The booking record #{bookingId} could not be located in your
            system. It may have been removed or the ID is incorrect.
          </p>
          <Link to="/owner/bookings" className="back-to-stations-btn">
            <ArrowLeftIcon size={16} />
            <span>Back to Bookings</span>
          </Link>
        </div>
      </div>
    );
  }

  const statusClass =
    booking.status === "Pending"
      ? "status-pending"
      : booking.status === "Confirmed"
      ? "status-confirmed"
      : booking.status === "Active"
      ? "status-active"
      : booking.status === "Completed"
      ? "status-completed"
      : "status-cancelled";

  return (
    <div className="owner-booking-details-page">
      <OwnerHeader
        title={`Booking #${booking.bookingId}`}
        subtitle={`Reservation details for ${booking.customerName} at ${booking.stationName || "Charging Station"}.`}
        breadcrumbs={[
          { label: "Bookings", to: "/owner/bookings" },
          { label: booking.bookingId },
        ]}
      />

      {toastMessage && (
        <div className="owner-toast-banner" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR / BACK LINK */}
      <div className="booking-details-top-bar">
        <Link to="/owner/bookings" className="back-link">
          <ArrowLeftIcon size={16} />
          <span>Back to All Bookings</span>
        </Link>
      </div>

        {/* HEADER HERO */}
        <header className="booking-details-header-card">
          <div className="header-card-left">
            <div className="id-and-status">
              <span className="large-booking-id">{booking.bookingId}</span>
              <span className={`booking-status-badge ${statusClass}`}>
                <span className="status-dot"></span>
                <span>{booking.status}</span>
              </span>
            </div>
            <h1>{booking.customerName}</h1>
            <p className="sub-vehicle">
              Driving: <strong>{booking.vehicleName}</strong>
            </p>
          </div>

          <div className="header-card-actions">
            {booking.status === "Pending" && (
              <>
                <button
                  type="button"
                  className="primary-action-btn confirm"
                  onClick={handleConfirm}
                >
                  <CheckIcon size={16} />
                  <span>Confirm Booking</span>
                </button>
                <button
                  type="button"
                  className="danger-action-btn"
                  onClick={() => setShowCancelModal(true)}
                >
                  <TrashIcon size={16} />
                  <span>Reject</span>
                </button>
              </>
            )}

            {booking.status === "Confirmed" && (
              <>
                <button
                  type="button"
                  className="primary-action-btn start"
                  onClick={handleStartSession}
                >
                  <BoltIcon size={16} />
                  <span>Start Charging Session</span>
                </button>
                <button
                  type="button"
                  className="danger-action-btn"
                  onClick={() => setShowCancelModal(true)}
                >
                  <span>Cancel Booking</span>
                </button>
              </>
            )}

            {booking.status === "Active" && (
              <>
                <button
                  type="button"
                  className="primary-action-btn complete"
                  onClick={handleCompleteSession}
                >
                  <CheckIcon size={16} />
                  <span>Complete Session</span>
                </button>
                <button
                  type="button"
                  className="danger-action-btn"
                  onClick={() => setShowCancelModal(true)}
                >
                  <span>Abort Session</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* 2-COLUMN DETAILS GRID */}
        <div className="booking-info-grid">
          {/* COLUMN 1: Customer & Hardware */}
          <div className="info-column">
            {/* Customer Card */}
            <div className="info-section-card">
              <h3>Customer Information</h3>
              <div className="info-rows-list">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <strong className="info-val">{booking.customerName}</strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Email Address</span>
                  <span className="info-val">{booking.customerEmail || "Not provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact Phone</span>
                  <span className="info-val">{booking.customerPhone || "Not provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Vehicle Registered</span>
                  <span className="info-val">{booking.vehicleName}</span>
                </div>
              </div>
            </div>

            {/* Station & Hardware Card */}
            <div className="info-section-card">
              <div className="card-title-with-link">
                <h3>Station & Charger Point</h3>
                <Link
                  to={`/owner/stations/${booking.stationId}/chargers`}
                  className="card-header-link"
                >
                  <span>Manage Chargers</span>
                  <PlugIcon size={14} />
                </Link>
              </div>

              <div className="info-rows-list">
                <div className="info-row">
                  <span className="info-label">Station Hub</span>
                  <Link
                    to={`/owner/stations/${booking.stationId}`}
                    className="station-link"
                  >
                    {booking.stationName}
                  </Link>
                </div>
                <div className="info-row">
                  <span className="info-label">Assigned Bay</span>
                  <strong className="info-val">
                    {booking.chargerId} ({booking.chargerName})
                  </strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Connector Standard</span>
                  <span className="connector-pill">{booking.connectorType}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Max Power Delivery</span>
                  <span className="power-pill">{booking.chargingPower} kW</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Hardware Status</span>
                  <span className="info-val">
                    {charger ? (
                      <span className="charger-live-indicator">
                        ● {charger.status}
                      </span>
                    ) : (
                      "Hardware In Service"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Reservation & Lifecycle Timestamps */}
          <div className="info-column">
            {/* Reservation Card */}
            <div className="info-section-card">
              <h3>Reservation Details</h3>
              <div className="info-rows-list">
                <div className="info-row">
                  <span className="info-label">Booking Date</span>
                  <strong className="info-val">{booking.bookingDate}</strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Time Window</span>
                  <span className="info-val">
                    {booking.startTime} ({booking.duration})
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Energy Estimate</span>
                  <span className="info-val">
                    {booking.estimatedEnergy} kWh
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Unit Rate</span>
                  <span className="info-val">
                    LKR {booking.pricePerKwh} / kWh
                  </span>
                </div>
                <div className="info-row total-highlight">
                  <span className="info-label">Estimated Total</span>
                  <strong className="total-price-val">
                    LKR {booking.estimatedPrice?.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Lifecycle Timeline Card */}
            <div className="info-section-card">
              <h3>Session Lifecycle Timestamps</h3>
              <div className="timeline-list">
                <div className="timeline-item">
                  <div className="timeline-bullet done"></div>
                  <div className="timeline-content">
                    <strong>Reservation Created</strong>
                    <small>
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleString()
                        : "Recorded"}
                    </small>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    booking.confirmedAt ||
                    booking.status === "Confirmed" ||
                    booking.status === "Active" ||
                    booking.status === "Completed"
                      ? "active"
                      : ""
                  }`}
                >
                  <div
                    className={`timeline-bullet ${
                      booking.confirmedAt ||
                      booking.status === "Confirmed" ||
                      booking.status === "Active" ||
                      booking.status === "Completed"
                        ? "done"
                        : "pending"
                    }`}
                  ></div>
                  <div className="timeline-content">
                    <strong>Booking Confirmed</strong>
                    <small>
                      {booking.confirmedAt
                        ? new Date(booking.confirmedAt).toLocaleString()
                        : booking.status === "Confirmed"
                        ? "Confirmed by Owner"
                        : "Awaiting confirmation"}
                    </small>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    booking.startedAt ||
                    booking.status === "Active" ||
                    booking.status === "Completed"
                      ? "active"
                      : ""
                  }`}
                >
                  <div
                    className={`timeline-bullet ${
                      booking.startedAt ||
                      booking.status === "Active" ||
                      booking.status === "Completed"
                        ? "done"
                        : "pending"
                    }`}
                  ></div>
                  <div className="timeline-content">
                    <strong>Charging Session Started</strong>
                    <small>
                      {booking.startedAt
                        ? new Date(booking.startedAt).toLocaleString()
                        : booking.status === "Active"
                        ? "Session Active"
                        : "Pending vehicle arrival"}
                    </small>
                  </div>
                </div>

                <div
                  className={`timeline-item ${
                    booking.completedAt || booking.status === "Completed"
                      ? "active"
                      : ""
                  }`}
                >
                  <div
                    className={`timeline-bullet ${
                      booking.completedAt || booking.status === "Completed"
                        ? "done"
                        : "pending"
                    }`}
                  ></div>
                  <div className="timeline-content">
                    <strong>Session Completed</strong>
                    <small>
                      {booking.completedAt
                        ? new Date(booking.completedAt).toLocaleString()
                        : booking.status === "Completed"
                        ? "Completed"
                        : "Session not yet finished"}
                    </small>
                  </div>
                </div>

                {booking.status === "Cancelled" && (
                  <div className="timeline-item cancelled">
                    <div className="timeline-bullet cancelled"></div>
                    <div className="timeline-content">
                      <strong className="red-val">Booking Cancelled</strong>
                      <small>
                        {booking.cancelledAt
                          ? new Date(booking.cancelledAt).toLocaleString()
                          : "Cancelled"}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* CONFIRM CANCELLATION MODAL */}
      {showCancelModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCancelModal(false)}
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
            <h3>Cancel reservation {booking.bookingId}?</h3>
            <p>
              Are you sure you want to cancel the reservation for{" "}
              <strong>{booking.customerName}</strong>? The user will be notified
              and the assigned charger will be returned to Available.
            </p>

            <div className="delete-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="confirm-remove-btn"
                onClick={handleCancelBooking}
              >
                <TrashIcon size={16} />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
