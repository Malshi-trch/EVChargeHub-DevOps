import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./BookingConfirmation.css";

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

function BookingConfirmation() {
  const { stationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state;

  /* If user directly opens confirmation URL */
  if (!booking) {
    return (
      <div className="confirmation-missing">
        <div>
          <BoltIcon size={35} />

          <h2>Booking details not found</h2>

          <p>
            Please select your charging slot before
            continuing to confirmation.
          </p>

          <Link to={`/user/stations/${stationId}/book`}>
            Back to Booking
          </Link>
        </div>
      </div>
    );
  }

  const {
    station,
    charger,
    date,
    time,
    vehicle,
    estimatedEnergy,
    estimatedPrice,
  } = booking;

  function confirmBooking() {
  const bookingId =
    "EVH-" +
    Math.floor(100000 + Math.random() * 900000);

  const confirmedBooking = {
    ...booking,
    bookingId,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  };

  const existingBookings = JSON.parse(
    localStorage.getItem("evBookings") || "[]"
  );

  localStorage.setItem(
    "evBookings",
    JSON.stringify([
      confirmedBooking,
      ...existingBookings,
    ])
  );

  navigate(
    `/user/bookings/${bookingId}/success`,
    {
      state: confirmedBooking,
    }
  );
}

  return (
    <div className="confirmation-dashboard">

      {/* SIDEBAR */}

      <aside className="confirmation-sidebar">

        <Link to="/" className="confirmation-logo">
          <div className="confirmation-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="confirmation-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>


        <div className="confirmation-menu">

          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="confirmation-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/user/stations"
            className="confirmation-menu-item active"
          >
            <LocationIcon />
            <span>Find Stations</span>
          </Link>

          <Link to="/user/bookings" className="confirmation-menu-item">
            <CalendarIcon />
            <span>My Bookings</span>
          </Link>

          <Link to="/user/history" className="confirmation-menu-item">
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link to="/user/favourites" className="confirmation-menu-item">
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>

          <p className="confirmation-menu-section">
            ACCOUNT
          </p>

          <Link to="/user/settings" className="confirmation-menu-item">
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link to="/user/help" className="confirmation-menu-item">
            <HelpIcon />
            <span>Help & Support</span>
          </Link>

        </div>


        <div className="confirmation-profile">

          <div className="confirmation-profile-avatar">
            H
          </div>

          <div className="confirmation-profile-info">
            <strong>Hareen</strong>
            <span>EV User</span>
          </div>

          <span className="confirmation-profile-more">
            ⋮
          </span>

        </div>

      </aside>


      {/* MAIN */}

      <main className="confirmation-main">

        {/* HEADER */}

        <header className="confirmation-header">

          <div>
            <Link
              to={`/user/stations/${stationId}/book`}
              className="confirmation-back"
            >
              ← Back to Booking
            </Link>

            <h1>Review Your Booking</h1>

            <p>
              Please check your charging details before
              confirming the reservation.
            </p>
          </div>


          <div className="confirmation-header-actions">

            <button
              className="confirmation-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>

            <Link
              to="/login"
              className="confirmation-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>

          </div>

        </header>


        {/* PROGRESS */}

        <section className="confirmation-progress">

          <div className="confirmation-progress-item completed">
            <div>✓</div>

            <span>
              <strong>Station</strong>
              <small>Selected</small>
            </span>
          </div>


          <div className="confirmation-progress-line active"></div>


          <div className="confirmation-progress-item completed">
            <div>✓</div>

            <span>
              <strong>Booking</strong>
              <small>Completed</small>
            </span>
          </div>


          <div className="confirmation-progress-line active"></div>


          <div className="confirmation-progress-item active">
            <div>3</div>

            <span>
              <strong>Confirmation</strong>
              <small>Review & confirm</small>
            </span>
          </div>

        </section>


        {/* CONTENT */}

        <section className="confirmation-content">

          <div className="confirmation-left">

            {/* STATION */}

            <div className="confirmation-card">

              <div className="confirmation-title">

                <div className="confirmation-title-icon">
                  <LocationIcon size={19} />
                </div>

                <div>
                  <span>SELECTED STATION</span>
                  <h2>Charging Location</h2>
                </div>

              </div>


              <div className="confirmation-station">

                <img
                  src={station.image}
                  alt={station.name}
                />

                <div>
                  <span className="confirmed-verified">
                    ✓ EVChargeHub Verified
                  </span>

                  <h3>{station.name}</h3>

                  <p>
                    <LocationIcon size={13} />
                    {station.address}
                  </p>
                </div>

              </div>

            </div>


            {/* BOOKING DETAILS */}

            <div className="confirmation-card">

              <div className="confirmation-title">

                <div className="confirmation-title-icon">
                  <CalendarIcon size={19} />
                </div>

                <div>
                  <span>RESERVATION</span>
                  <h2>Booking Details</h2>
                </div>

              </div>


              <div className="confirmation-details-grid">

                <div>
                  <div className="confirmation-detail-icon">
                    <PlugIcon size={19} />
                  </div>

                  <span>
                    <small>Charger</small>

                    <strong>
                      {charger.name}
                    </strong>

                    <em>
                      {charger.connector} ·{" "}
                      {charger.power} kW
                    </em>
                  </span>
                </div>


                <div>
                  <div className="confirmation-detail-icon">
                    <CalendarIcon size={19} />
                  </div>

                  <span>
                    <small>Date</small>

                    <strong>
                      {date.day}
                    </strong>

                    <em>
                      {date.date} {date.month}
                    </em>
                  </span>
                </div>


                <div>
                  <div className="confirmation-detail-icon">
                    <ClockIcon size={19} />
                  </div>

                  <span>
                    <small>Start Time</small>

                    <strong>{time}</strong>

                    <em>Reserved slot</em>
                  </span>
                </div>


                <div>
                  <div className="confirmation-detail-icon">
                    <CarIcon size={19} />
                  </div>

                  <span>
                    <small>Vehicle</small>

                    <strong>
                      {vehicle.name}
                    </strong>

                    <em>
                      {vehicle.plate}
                    </em>
                  </span>
                </div>

              </div>

            </div>


            {/* IMPORTANT INFORMATION */}

            <div className="confirmation-card">

              <div className="confirmation-title">

                <div className="confirmation-title-icon">
                  <BoltIcon size={19} />
                </div>

                <div>
                  <span>BEFORE YOU CONFIRM</span>
                  <h2>Booking Information</h2>
                </div>

              </div>


              <div className="booking-information-list">

                <div>
                  <span>✓</span>

                  <p>
                    Please arrive at the station close
                    to your selected booking time.
                  </p>
                </div>

                <div>
                  <span>✓</span>

                  <p>
                    The final charging cost will depend
                    on the actual energy consumed.
                  </p>
                </div>

                <div>
                  <span>✓</span>

                  <p>
                    Make sure your selected connector
                    is compatible with your vehicle.
                  </p>
                </div>

                <div>
                  <span>✓</span>

                  <p>
                    Your reservation will appear under
                    My Bookings after confirmation.
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* RIGHT SUMMARY */}

          <aside className="final-summary-card">

            <div className="final-summary-top">

              <div className="final-summary-bolt">
                <BoltIcon size={23} />
              </div>

              <span>FINAL REVIEW</span>

              <h2>Booking Summary</h2>

              <p>
                Review your reservation before
                confirming.
              </p>

            </div>


            <div className="final-summary-items">

              <div>
                <span>Station</span>

                <strong>
                  {station.name}
                </strong>
              </div>


              <div>
                <span>Charger</span>

                <strong>
                  {charger.name}
                </strong>
              </div>


              <div>
                <span>Connector</span>

                <strong>
                  {charger.connector}
                </strong>
              </div>


              <div>
                <span>Date</span>

                <strong>
                  {date.date} {date.month}
                </strong>
              </div>


              <div>
                <span>Time</span>

                <strong>{time}</strong>
              </div>


              <div>
                <span>Vehicle</span>

                <strong>
                  {vehicle.name}
                </strong>
              </div>

            </div>


            <div className="final-energy-box">

              <div>
                <span>Estimated Energy</span>

                <strong>
                  {estimatedEnergy} kWh
                </strong>
              </div>

              <div>
                <span>Price per kWh</span>

                <strong>
                  LKR {station.pricePerKwh}
                </strong>
              </div>

            </div>


            <div className="final-total">

              <div>
                <span>Estimated Total</span>

                <small>
                  Actual cost may vary depending
                  on energy consumed.
                </small>
              </div>

              <strong>
                <small>LKR</small>

                {estimatedPrice.toLocaleString()}
              </strong>

            </div>


            <button
              className="confirm-booking-button"
              onClick={confirmBooking}
            >
              Confirm Booking
              <ArrowRightIcon size={17} />
            </button>


            <Link
              to={`/user/stations/${stationId}/book`}
              className="edit-booking-button"
            >
              Edit Booking
            </Link>


            <div className="confirmation-secure">

              <span>✓</span>

              <p>
                <strong>Secure reservation</strong>
                Your booking details will be confirmed
                after you continue.
              </p>

            </div>

          </aside>

        </section>

      </main>

    </div>
  );
}

export default BookingConfirmation;