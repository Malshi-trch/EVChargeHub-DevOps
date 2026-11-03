import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./BookingDetails.css";

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
  CarIcon,
  ArrowRightIcon,
} from "../components/Icons";


function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const bookings = JSON.parse(
    localStorage.getItem("evBookings") || "[]"
  );

  const booking = bookings.find(
    (item) => item.bookingId === bookingId
  );


  /* ================================
     BOOKING NOT FOUND
  ================================= */

  if (!booking) {
    return (
      <div className="booking-details-not-found">
        <div>
          <BoltIcon size={38} />

          <h2>Booking not found</h2>

          <p>
            We couldn't find this reservation. It may have been
            removed or the booking ID is incorrect.
          </p>

          <Link to="/user/bookings">
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }


  /* ================================
     BOOKING DATA
  ================================= */

  const {
    station,
    charger,
    date,
    time,
    vehicle,
    estimatedEnergy,
    estimatedPrice,
    status,
  } = booking;


  /* ================================
     CANCEL BOOKING
  ================================= */

  const cancelBooking = () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    const updatedBookings = bookings.map((item) =>
      item.bookingId === bookingId
        ? {
            ...item,
            status: "Cancelled",
          }
        : item
    );

    localStorage.setItem(
      "evBookings",
      JSON.stringify(updatedBookings)
    );

    navigate("/user/bookings");
  };





  return (
    <div className="booking-details-dashboard">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="booking-details-sidebar">

        <Link to="/" className="bd-logo">
          <div className="bd-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="bd-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>


        <div className="bd-menu">

          <p>MAIN MENU</p>


          {/* DASHBOARD */}

          <Link
            to="/user/dashboard"
            className="bd-menu-item"
          >
            <HomeIcon />

            <span>Dashboard</span>
          </Link>


          {/* FIND STATIONS */}

          <Link
            to="/user/stations"
            className="bd-menu-item"
          >
            <LocationIcon />

            <span>Find Stations</span>
          </Link>


          {/* MY BOOKINGS */}

          <Link
            to="/user/bookings"
            className="bd-menu-item active"
          >
            <CalendarIcon />

            <span>My Bookings</span>
          </Link>


          {/* CHARGING HISTORY */}

          <Link
            to="/user/history"
            className="bd-menu-item"
          >
            <ClockIcon />

            <span>Charging History</span>
          </Link>


          {/* FAVOURITES */}

          <Link
            to="/user/favourites"
            className="bd-menu-item"
          >
            <HeartIcon />

            <span>Favourite Stations</span>
          </Link>


          <p className="bd-menu-section">
            ACCOUNT
          </p>


          {/* SETTINGS */}

          <a
            href="#"
            className="bd-menu-item"
          >
            <SettingsIcon />

            <span>Settings</span>
          </a>


          {/* HELP */}

          <a
            href="#"
            className="bd-menu-item"
          >
            <HelpIcon />

            <span>Help & Support</span>
          </a>

        </div>


        {/* PROFILE */}

        <div className="bd-profile">

          <div className="bd-avatar">
            H
          </div>

          <div>
            <strong>Hareen</strong>

            <span>EV User</span>
          </div>

          <i>⋮</i>

        </div>

      </aside>


      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="booking-details-main">


        {/* HEADER */}

        <header className="bd-header">

          <div>

            <Link
              to="/user/bookings"
              className="bd-back"
            >
              ← Back to My Bookings
            </Link>

            <h1>Booking Details</h1>

            <p>
              View your charging reservation information.
            </p>

          </div>


          <div className="bd-header-actions">

            <button
              className="bd-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />

              <span></span>
            </button>


            <Link
              to="/login"
              className="bd-logout"
            >
              <LogoutIcon size={17} />

              Logout
            </Link>

          </div>

        </header>


        {/* =================================
            BOOKING HERO
        ================================= */}

        <section className="bd-booking-hero">

          <div>

            <span className="bd-eyebrow">
              RESERVATION
            </span>


            <div className="bd-booking-title">

              <h2>{bookingId}</h2>


              <span
                className={`bd-status ${
                  status === "Cancelled"
                    ? "cancelled"
                    : status === "Completed"
                    ? "completed"
                    : ""
                }`}
              >
                <i></i>

                {status}
              </span>

            </div>


            <p>
              Your EV charging reservation at{" "}

              <strong>
                {station.name}
              </strong>
            </p>

          </div>


          <div className="bd-hero-icon">
            <BoltIcon size={28} />
          </div>

        </section>


        {/* =================================
            CONTENT
        ================================= */}

        <section className="bd-content">


          {/* ===============================
              LEFT SIDE
          =============================== */}

          <div className="bd-left">


            {/* STATION DETAILS */}

            <div className="bd-card">

              <div className="bd-section-title">

                <div>
                  <LocationIcon size={19} />
                </div>

                <span>
                  <small>
                    CHARGING LOCATION
                  </small>

                  <strong>
                    Station Details
                  </strong>
                </span>

              </div>


              <div className="bd-station">

                <img
                  src={station.image}
                  alt={station.name}
                />


                <div className="bd-station-info">

                  <span className="bd-verified">
                    ✓ EVChargeHub Verified
                  </span>


                  <h3>
                    {station.name}
                  </h3>


                  <p>
                    <LocationIcon size={13} />

                    {station.address}
                  </p>


                  <Link
                    to={`/user/stations/${station.id}`}
                    className="bd-view-station"
                  >
                    View Station

                    <ArrowRightIcon size={13} />
                  </Link>

                </div>

              </div>

            </div>


            {/* ===============================
                DATE AND TIME
            =============================== */}

            <div className="bd-card">

              <div className="bd-section-title">

                <div>
                  <CalendarIcon size={19} />
                </div>

                <span>
                  <small>
                    RESERVATION DETAILS
                  </small>

                  <strong>
                    Date & Time
                  </strong>
                </span>

              </div>


              <div className="bd-info-grid">


                {/* DATE */}

                <div className="bd-info-box">

                  <div>
                    <CalendarIcon size={20} />
                  </div>

                  <span>
                    <small>
                      Booking Date
                    </small>

                    <strong>
                      {date.date} {date.month}
                    </strong>

                    <p>
                      {date.day}
                    </p>
                  </span>

                </div>


                {/* TIME */}

                <div className="bd-info-box">

                  <div>
                    <ClockIcon size={20} />
                  </div>

                  <span>
                    <small>
                      Start Time
                    </small>

                    <strong>
                      {time}
                    </strong>

                    <p>
                      Reserved charging slot
                    </p>
                  </span>

                </div>

              </div>

            </div>


            {/* ===============================
                CHARGER AND VEHICLE
            =============================== */}

            <div className="bd-card">

              <div className="bd-section-title">

                <div>
                  <PlugIcon size={19} />
                </div>

                <span>
                  <small>
                    CHARGING INFORMATION
                  </small>

                  <strong>
                    Charger & Vehicle
                  </strong>
                </span>

              </div>


              <div className="bd-info-grid">


                {/* CHARGER */}

                <div className="bd-info-box">

                  <div>
                    <PlugIcon size={20} />
                  </div>

                  <span>

                    <small>
                      Selected Charger
                    </small>

                    <strong>
                      {charger.name}
                    </strong>

                    <p>
                      {charger.connector} ·{" "}
                      {charger.power} kW
                    </p>

                  </span>

                </div>


                {/* VEHICLE */}

                <div className="bd-info-box">

                  <div>
                    <CarIcon size={20} />
                  </div>

                  <span>

                    <small>
                      Vehicle
                    </small>

                    <strong>
                      {vehicle.name}
                    </strong>

                    <p>
                      {vehicle.plate}
                    </p>

                  </span>

                </div>

              </div>

            </div>


            {/* ===============================
                CONFIRMED MESSAGE
            =============================== */}

            {status === "Confirmed" && (

              <div className="bd-arrival-card">

                <div className="bd-arrival-icon">
                  <ClockIcon size={19} />
                </div>

                <div>

                  <strong>
                    Remember your booking time
                  </strong>

                  <p>
                    Please arrive at the charging station
                    close to your selected reservation time.
                  </p>

                </div>

              </div>

            )}


            {/* ===============================
                CANCELLED MESSAGE
            =============================== */}

            {status === "Cancelled" && (

              <div className="bd-cancelled-message">

                <div>
                  !
                </div>

                <span>

                  <strong>
                    This booking has been cancelled
                  </strong>

                  <p>
                    This reservation is no longer active.
                    You can create a new booking at any time.
                  </p>

                </span>

              </div>

            )}


            {/* ===============================
                COMPLETED MESSAGE
            =============================== */}

            {status === "Completed" && (

              <div className="bd-arrival-card">

                <div className="bd-arrival-icon">
                  <BoltIcon size={19} />
                </div>

                <div>

                  <strong>
                    Charging session completed
                  </strong>

                  <p>
                    This charging reservation has been
                    successfully completed and added to
                    your charging history.
                  </p>

                </div>

              </div>

            )}

          </div>


          {/* ===============================
              RIGHT SIDE SUMMARY
          =============================== */}

          <aside className="bd-summary">


            <div className="bd-summary-heading">

              <div>
                <BoltIcon size={22} />
              </div>

              <span>
                BOOKING SUMMARY
              </span>

              <h2>
                Payment Estimate
              </h2>

              <p>
                Final charging cost depends on actual
                energy consumed.
              </p>

            </div>


            {/* SUMMARY DETAILS */}

            <div className="bd-summary-items">

              <div>
                <span>
                  Booking ID
                </span>

                <strong>
                  {bookingId}
                </strong>
              </div>


              <div>
                <span>
                  Charger
                </span>

                <strong>
                  {charger.name}
                </strong>
              </div>


              <div>
                <span>
                  Connector
                </span>

                <strong>
                  {charger.connector}
                </strong>
              </div>


              <div>
                <span>
                  Power
                </span>

                <strong>
                  {charger.power} kW
                </strong>
              </div>


              <div>
                <span>
                  Estimated Energy
                </span>

                <strong>
                  {estimatedEnergy} kWh
                </strong>
              </div>


              <div>
                <span>
                  Price per kWh
                </span>

                <strong>
                  LKR {station.pricePerKwh}
                </strong>
              </div>

            </div>


            {/* TOTAL */}

            <div className="bd-total">

              <div>

                <span>
                  Estimated Total
                </span>

                <small>
                  Actual amount may vary
                </small>

              </div>

              <strong>
                <small>
                  LKR
                </small>

                {Number(
                  estimatedPrice
                ).toLocaleString()}
              </strong>

            </div>


            {/* ===============================
                CONFIRMED ACTIONS
            =============================== */}

            {status === "Confirmed" && (
              <>
                <button
                  className="bd-cancel-button"
                  onClick={cancelBooking}
                >
                  Cancel Booking
                </button>
              </>
            )}

            {status === "Active" && (
              <div className="bd-active-session-note" style={{ padding: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", fontSize: "13px", color: "#065f46", textAlign: "center", marginBottom: "12px" }}>
                <span style={{ fontWeight: "700" }}>● Charging Session in Progress</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#047857" }}>
                  Session is managed by the station operator. Your session will complete upon vehicle unplug.
                </p>
              </div>
            )}


            {/* ===============================
                CANCELLED ACTION
            =============================== */}

            {status === "Cancelled" && (

              <Link
                to={`/user/stations/${station.id}`}
                className="bd-book-again"
              >
                Book Again

                <ArrowRightIcon size={15} />
              </Link>

            )}


            {/* ===============================
                COMPLETED ACTION
            =============================== */}

            {status === "Completed" && (

              <Link
                to="/user/history"
                className="bd-book-again"
              >
                View Charging History

                <ArrowRightIcon size={15} />
              </Link>

            )}


            {/* BACK BUTTON */}

            <Link
              to="/user/bookings"
              className="bd-back-bookings"
            >
              Back to My Bookings
            </Link>


            {/* SECURE MESSAGE */}

            <div className="bd-secure">

              <span>
                ✓
              </span>

              <p>

                <strong>
                  Reservation secured
                </strong>

                Your booking information is saved in
                EVChargeHub.

              </p>

            </div>

          </aside>

        </section>

      </main>

    </div>
  );
}


export default BookingDetails;