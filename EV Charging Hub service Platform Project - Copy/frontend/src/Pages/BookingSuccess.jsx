import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./BookingSuccess.css";

import {
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  PlugIcon,
  CarIcon,
  LocationIcon,
  ArrowRightIcon,
} from "../components/Icons";

function BookingSuccess() {
  const { bookingId } = useParams();
  const location = useLocation();

  const booking = useMemo(() => {
    if (location.state) return location.state;
    try {
      const stored = JSON.parse(localStorage.getItem("evBookings") || "[]");
      return stored.find((item) => item.bookingId === bookingId) || null;
    } catch {
      return null;
    }
  }, [location.state, bookingId]);

  if (!booking) {
    return (
      <div className="success-missing">
        <div>
          <BoltIcon size={38} />

          <h2>Booking information unavailable</h2>

          <p>
            This confirmation page requires booking information
            from the reservation process.
          </p>

          <Link to="/user/stations">
            Find Charging Stations
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

  return (
    <div className="booking-success-page">

      <div className="success-background-shape shape-one"></div>
      <div className="success-background-shape shape-two"></div>

      <main className="success-container">

        {/* SUCCESS ICON */}

        <div className="success-icon-wrapper">
          <div className="success-icon-ring">
            <div className="success-icon">
              ✓
            </div>
          </div>
        </div>


        {/* TITLE */}

        <span className="success-label">
          BOOKING CONFIRMED
        </span>

        <h1>Your charging slot is reserved!</h1>

        <p className="success-description">
          Your EV charging reservation has been successfully
          confirmed. Please arrive at the station around your
          selected booking time.
        </p>


        {/* BOOKING ID */}

        <div className="success-booking-id">

          <div>
            <small>BOOKING ID</small>

            <strong>{bookingId}</strong>
          </div>

          <span className="confirmed-status">
            <i></i>
            Confirmed
          </span>

        </div>


        {/* MAIN CARD */}

        <section className="success-booking-card">

          {/* STATION */}

          <div className="success-station">

            <img
              src={station.image}
              alt={station.name}
            />

            <div className="success-station-info">

              <span>
                <BoltIcon size={12} />
                EVChargeHub Station
              </span>

              <h2>{station.name}</h2>

              <p>
                <LocationIcon size={13} />
                {station.address}
              </p>

            </div>

          </div>


          {/* DETAILS */}

          <div className="success-details-grid">

            <div className="success-detail">

              <div className="success-detail-icon">
                <CalendarIcon size={19} />
              </div>

              <div>
                <small>Date</small>

                <strong>
                  {date.date} {date.month}
                </strong>

                <span>{date.day}</span>
              </div>

            </div>


            <div className="success-detail">

              <div className="success-detail-icon">
                <ClockIcon size={19} />
              </div>

              <div>
                <small>Time</small>

                <strong>{time}</strong>

                <span>Reserved slot</span>
              </div>

            </div>


            <div className="success-detail">

              <div className="success-detail-icon">
                <PlugIcon size={19} />
              </div>

              <div>
                <small>Charger</small>

                <strong>{charger.name}</strong>

                <span>
                  {charger.connector} · {charger.power} kW
                </span>
              </div>

            </div>


            <div className="success-detail">

              <div className="success-detail-icon">
                <CarIcon size={19} />
              </div>

              <div>
                <small>Vehicle</small>

                <strong>{vehicle.name}</strong>

                <span>{vehicle.plate}</span>
              </div>

            </div>

          </div>


          {/* PRICE */}

          <div className="success-price-section">

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


            <div className="success-total">

              <span>
                Estimated Total
                <small>
                  Final cost depends on actual energy consumed.
                </small>
              </span>

              <strong>
                <small>LKR</small>
                {estimatedPrice.toLocaleString()}
              </strong>

            </div>

          </div>

        </section>


        {/* INFORMATION */}

        <section className="success-information">

          <div className="success-info-icon">
            <BoltIcon size={18} />
          </div>

          <div>
            <strong>You're all set!</strong>

            <p>
              Your reservation has been confirmed. You can view
              and manage this reservation from My Bookings.
            </p>
          </div>

        </section>


        {/* BUTTONS */}

        <div className="success-actions">

          <Link
            to="/user/bookings"
            className="view-bookings-button"
          >
            View My Bookings
            <ArrowRightIcon size={17} />
          </Link>


          <Link
            to="/user/dashboard"
            className="success-dashboard-button"
          >
            Back to Dashboard
          </Link>

        </div>


        <p className="success-footer-text">
          Booking reference: <strong>{bookingId}</strong>
        </p>

      </main>

    </div>
  );
}

export default BookingSuccess;