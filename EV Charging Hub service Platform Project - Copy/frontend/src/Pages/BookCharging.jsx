import { useMemo, useState } from "react";
import {
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import "./BookCharging.css";
import { getFindStationsList } from "../data/mockStations";

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

/* =========================================================
   DATE OPTIONS
========================================================= */

function createDateOptions() {
  const dates = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    dates.push({
      value: date.toISOString().split("T")[0],

      day:
        i === 0
          ? "Today"
          : date.toLocaleDateString("en-US", {
              weekday: "short",
            }),

      date: date.getDate(),

      month: date.toLocaleDateString("en-US", {
        month: "short",
      }),
    });
  }

  return dates;
}

/* =========================================================
   PAGE
========================================================= */

function BookCharging() {
  const { stationId } = useParams();
  const navigate = useNavigate();

  const stations = getFindStationsList();
  const station =
    stations.find(
      (item) => String(item.id) === String(stationId)
    ) || stations[0];

  const dateOptions = useMemo(
    () => createDateOptions(),
    []
  );

  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:30 AM",
    "01:00 PM",
    "02:30 PM",
    "04:00 PM",
    "05:30 PM",
  ];

  const vehicles = [
    {
      id: 1,
      name: "Tesla Model 3",
      connector: "CCS",
      plate: "CAR-4521",
    },
    {
      id: 2,
      name: "Nissan Leaf",
      connector: "Type 2",
      plate: "EV-1024",
    },
  ];


  const availableChargers =
    (station.chargers || []).filter(
      (charger) =>
        charger.status === "Available"
    );


  const [selectedCharger, setSelectedCharger] =
    useState(
      availableChargers.length > 0
        ? availableChargers[0]
        : null
    );

  const [selectedDate, setSelectedDate] =
    useState(dateOptions[0]);

  const [selectedTime, setSelectedTime] =
    useState("");

  const [selectedVehicle, setSelectedVehicle] =
    useState(vehicles[0]);

  const [estimatedEnergy, setEstimatedEnergy] =
    useState(30);


  const estimatedPrice =
    estimatedEnergy * (station.pricePerKwh || 80);


  const bookingReady =
    selectedCharger &&
    selectedDate &&
    selectedTime &&
    selectedVehicle;


  return (
    <div className="booking-dashboard">

      {/* ===================================================
          SIDEBAR
      ==================================================== */}

      <aside className="booking-sidebar">

        <Link to="/" className="booking-logo">

          <div className="booking-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="booking-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>

        </Link>


        <div className="booking-menu">

          <p>MAIN MENU</p>


          <Link
            to="/user/dashboard"
            className="booking-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>


          <Link
            to="/user/stations"
            className="booking-menu-item active"
          >
            <LocationIcon />
            <span>Find Stations</span>
          </Link>


          <Link to="/user/bookings" className="booking-menu-item">
            <CalendarIcon />
            <span>My Bookings</span>
          </Link>

          <Link to="/user/history" className="booking-menu-item">
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link to="/user/favourites" className="booking-menu-item">
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>

          <p className="booking-menu-section">
            ACCOUNT
          </p>

          <Link to="/user/settings" className="booking-menu-item">
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link to="/user/help" className="booking-menu-item">
            <HelpIcon />
            <span>Help & Support</span>
          </Link>

        </div>


        <div className="booking-profile">

          <div className="booking-profile-avatar">
            H
          </div>

          <div className="booking-profile-info">
            <strong>Hareen</strong>
            <span>EV User</span>
          </div>

          <span className="booking-profile-more">
            ⋮
          </span>

        </div>

      </aside>


      {/* ===================================================
          MAIN
      ==================================================== */}

      <main className="booking-main">

        {/* HEADER */}

        <header className="booking-header">

          <div>

            <Link
              to={`/user/stations/${station.id}`}
              className="booking-back"
            >
              ← Back to Station
            </Link>

            <h1>Book Charging Slot</h1>

            <p>
              Reserve your charger in just a few
              simple steps.
            </p>

          </div>


          <div className="booking-header-actions">

            <button
              className="booking-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>


            <Link
              to="/login"
              className="booking-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>

          </div>

        </header>


        {/* =================================================
            PROGRESS
        ================================================== */}

        <section className="booking-progress">

          <div className="progress-item completed">

            <div>✓</div>

            <span>
              <strong>Station</strong>
              <small>Selected</small>
            </span>

          </div>


          <div className="progress-line active"></div>


          <div className="progress-item active">

            <div>2</div>

            <span>
              <strong>Booking</strong>
              <small>Select your slot</small>
            </span>

          </div>


          <div className="progress-line"></div>


          <div className="progress-item">

            <div>3</div>

            <span>
              <strong>Confirmation</strong>
              <small>Review & confirm</small>
            </span>

          </div>

        </section>


        {/* =================================================
            PAGE GRID
        ================================================== */}

        <section className="booking-content-grid">

          {/* ===============================================
              LEFT SIDE
          ================================================ */}

          <div className="booking-left-column">

            {/* STATION */}

            <div className="booking-station-card">

              <img
                src={station.image}
                alt={station.name}
              />


              <div className="booking-station-info">

                <span>
                  ✓ EVChargeHub Verified
                </span>

                <h2>{station.name}</h2>

                <p>
                  <LocationIcon size={13} />
                  {station.address}
                </p>


                <div>
                  <strong>
                    ★ {station.rating}
                  </strong>

                  <small>
                    LKR {station.pricePerKwh} / kWh
                  </small>
                </div>

              </div>

            </div>


            {/* =============================================
                STEP 1 - CHARGER
            ============================================== */}

            <div className="booking-section-card">

              <div className="booking-section-heading">

                <div className="booking-step-number">
                  1
                </div>

                <div>
                  <h2>Select Charger</h2>

                  <p>
                    Choose an available charger
                    for your vehicle.
                  </p>
                </div>

              </div>


              <div className="charger-selection-grid">

                {station.chargers.map(
                  (charger) => {

                    const isSelected =
                      selectedCharger?.id ===
                      charger.id;

                    const unavailable =
                      charger.status !==
                      "Available";

                    return (
                      <button
                        key={charger.id}
                        type="button"
                        disabled={unavailable}
                        className={`select-charger-card ${
                          isSelected
                            ? "selected"
                            : ""
                        } ${
                          unavailable
                            ? "disabled"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedCharger(
                            charger
                          )
                        }
                      >

                        <div className="select-charger-top">

                          <div className="select-charger-icon">
                            <PlugIcon size={19} />
                          </div>

                          <span
                            className={`charger-state ${
                              unavailable
                                ? "busy"
                                : ""
                            }`}
                          >
                            ● {charger.status}
                          </span>

                        </div>


                        <strong>
                          {charger.name}
                        </strong>


                        <div className="select-charger-details">

                          <span>
                            {charger.connector}
                          </span>

                          <span>
                            {charger.power} kW
                          </span>

                        </div>


                        {isSelected && (
                          <div className="selected-check">
                            ✓
                          </div>
                        )}

                      </button>
                    );
                  }
                )}

              </div>

            </div>


            {/* =============================================
                STEP 2 - DATE
            ============================================== */}

            <div className="booking-section-card">

              <div className="booking-section-heading">

                <div className="booking-step-number">
                  2
                </div>

                <div>
                  <h2>Select Date</h2>

                  <p>
                    Choose the day you want to
                    charge your vehicle.
                  </p>
                </div>

              </div>


              <div className="booking-date-grid">

                {dateOptions.map((date) => {

                  const isSelected =
                    selectedDate.value ===
                    date.value;

                  return (
                    <button
                      type="button"
                      key={date.value}
                      className={`booking-date-card ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime("");
                      }}
                    >

                      <small>{date.day}</small>

                      <strong>{date.date}</strong>

                      <span>{date.month}</span>

                      {isSelected && (
                        <i>✓</i>
                      )}

                    </button>
                  );
                })}

              </div>

            </div>


            {/* =============================================
                STEP 3 - TIME
            ============================================== */}

            <div className="booking-section-card">

              <div className="booking-section-heading">

                <div className="booking-step-number">
                  3
                </div>

                <div>
                  <h2>Select Time</h2>

                  <p>
                    Available slots for your
                    selected date.
                  </p>
                </div>

              </div>


              <div className="time-slot-grid">

                {timeSlots.map((time) => (

                  <button
                    type="button"
                    key={time}
                    className={
                      selectedTime === time
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedTime(time)
                    }
                  >
                    <ClockIcon size={14} />

                    {time}
                  </button>

                ))}

              </div>

            </div>


            {/* =============================================
                STEP 4 - VEHICLE
            ============================================== */}

            <div className="booking-section-card">

              <div className="booking-section-heading">

                <div className="booking-step-number">
                  4
                </div>

                <div>
                  <h2>Select Vehicle</h2>

                  <p>
                    Choose the EV you will bring
                    to the station.
                  </p>
                </div>

              </div>


              <div className="vehicle-selection-list">

                {vehicles.map((vehicle) => {

                  const selected =
                    selectedVehicle.id ===
                    vehicle.id;

                  return (
                    <button
                      type="button"
                      key={vehicle.id}
                      className={`vehicle-selection-card ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedVehicle(
                          vehicle
                        )
                      }
                    >

                      <div className="vehicle-selection-icon">
                        <CarIcon size={22} />
                      </div>


                      <div className="vehicle-selection-info">

                        <strong>
                          {vehicle.name}
                        </strong>

                        <span>
                          {vehicle.plate} ·{" "}
                          {vehicle.connector}
                        </span>

                      </div>


                      <div className="vehicle-radio">
                        {selected && <span></span>}
                      </div>

                    </button>
                  );
                })}

              </div>

            </div>


            {/* =============================================
                ENERGY
            ============================================== */}

            <div className="booking-section-card">

              <div className="booking-section-heading">

                <div className="booking-step-number">
                  5
                </div>

                <div>
                  <h2>Estimated Energy</h2>

                  <p>
                    Select approximately how much
                    energy you expect to charge.
                  </p>
                </div>

              </div>


              <div className="energy-selector">

                <div className="energy-value">

                  <strong>
                    {estimatedEnergy}
                  </strong>

                  <span>kWh</span>

                </div>


                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={estimatedEnergy}
                  onChange={(event) =>
                    setEstimatedEnergy(
                      Number(
                        event.target.value
                      )
                    )
                  }
                />


                <div className="energy-range-labels">

                  <span>10 kWh</span>
                  <span>80 kWh</span>

                </div>

              </div>

            </div>

          </div>


          {/* ===============================================
              RIGHT - SUMMARY
          ================================================ */}

          <aside className="booking-summary">

            <div className="booking-summary-header">

              <div className="summary-lightning">
                <BoltIcon size={21} />
              </div>

              <div>
                <span>YOUR BOOKING</span>
                <h2>Booking Summary</h2>
              </div>

            </div>


            <div className="booking-summary-station">

              <img
                src={station.image}
                alt={station.name}
              />

              <div>
                <strong>
                  {station.name}
                </strong>

                <span>
                  <LocationIcon size={11} />
                  {station.address}
                </span>
              </div>

            </div>


            <div className="summary-information">

              <div>

                <span>
                  <PlugIcon size={15} />
                  Charger
                </span>

                <strong>
                  {selectedCharger
                    ? `${selectedCharger.name} · ${selectedCharger.power} kW`
                    : "Not selected"}
                </strong>

              </div>


              <div>

                <span>
                  <CalendarIcon size={15} />
                  Date
                </span>

                <strong>
                  {selectedDate
                    ? `${selectedDate.date} ${selectedDate.month}`
                    : "Not selected"}
                </strong>

              </div>


              <div>

                <span>
                  <ClockIcon size={15} />
                  Time
                </span>

                <strong>
                  {selectedTime ||
                    "Select a time"}
                </strong>

              </div>


              <div>

                <span>
                  <CarIcon size={15} />
                  Vehicle
                </span>

                <strong>
                  {selectedVehicle.name}
                </strong>

              </div>

            </div>


            <div className="summary-energy">

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


            <div className="booking-total">

              <div>

                <span>
                  Estimated Total
                </span>

                <small>
                  Final amount depends on actual
                  energy consumed.
                </small>

              </div>


              <strong>
                <small>LKR</small>

                {estimatedPrice.toLocaleString()}
              </strong>

            </div>


            {!selectedTime && (
              <div className="summary-warning">
                <ClockIcon size={14} />

                Please select an available time
                slot to continue.
              </div>
            )}


            <button
                className="continue-booking-button"
                disabled={!bookingReady}
                onClick={() => {
                    navigate(
                    `/user/stations/${station.id}/book/confirm`,
                    {
                        state: {
                        station: {
                            id: station.id,
                            name: station.name,
                            address: station.address,
                            image: station.image,
                            pricePerKwh: station.pricePerKwh,
                        },

                        charger: selectedCharger,
                        date: selectedDate,
                        time: selectedTime,
                        vehicle: selectedVehicle,
                        estimatedEnergy,
                        estimatedPrice,
                        },
                    }
                    );
                }}
                >
                Continue to Confirmation
                <ArrowRightIcon size={17} />
            </button>

            <div className="secure-booking-note">

              <span>✓</span>

              <p>
                <strong>
                  Secure booking
                </strong>

                Your charging slot will only be
                reserved after confirmation.
              </p>

            </div>

          </aside>

        </section>

      </main>

    </div>
  );
}

export default BookCharging;