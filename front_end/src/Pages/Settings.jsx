import { useState } from "react";
import { Link } from "react-router-dom";

import "./Settings.css";

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
  CarIcon,
  PlugIcon,
} from "../components/Icons";

function Settings() {
  /* =========================================================
     LOAD SAVED SETTINGS
  ========================================================= */

  const [profile, setProfile] = useState(() => {
    const savedProfile = JSON.parse(
      localStorage.getItem("evUserProfile") || "null"
    );

    return (
      savedProfile || {
        fullName: "Hareen",
        email: "",
        phone: "",
      }
    );
  });

  const [vehicle, setVehicle] = useState(() => {
    const savedVehicle = JSON.parse(
      localStorage.getItem("evVehicleDetails") || "null"
    );

    return (
      savedVehicle || {
        vehicleModel: "",
        connectorType: "CCS",
        batteryCapacity: "",
      }
    );
  });

  const [preferences, setPreferences] = useState(() => {
    const savedPreferences = JSON.parse(
      localStorage.getItem("evChargingPreferences") || "null"
    );

    return (
      savedPreferences || {
        preferredConnector: "CCS",
        fastCharging: true,
      }
    );
  });

  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = JSON.parse(
      localStorage.getItem("evNotificationSettings") || "null"
    );

    return (
      savedNotifications || {
        bookingReminders: true,
        chargingComplete: true,
        promotions: false,
      }
    );
  });

  const [savedMessage, setSavedMessage] = useState("");

  /* =========================================================
     INPUT HANDLERS
  ========================================================= */

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleVehicleChange = (event) => {
    const { name, value } = event.target;

    setVehicle((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (event) => {
    const { name, value, type, checked } = event.target;

    setPreferences((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;

    setNotifications((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  /* =========================================================
     SAVE SETTINGS
  ========================================================= */

  const saveSettings = (event) => {
    event.preventDefault();

    localStorage.setItem(
      "evUserProfile",
      JSON.stringify(profile)
    );

    localStorage.setItem(
      "evVehicleDetails",
      JSON.stringify(vehicle)
    );

    localStorage.setItem(
      "evChargingPreferences",
      JSON.stringify(preferences)
    );

    localStorage.setItem(
      "evNotificationSettings",
      JSON.stringify(notifications)
    );

    setSavedMessage("Settings saved successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  return (
    <div className="settings-dashboard">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="settings-sidebar">
        <Link to="/" className="settings-logo">
          <div className="settings-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="settings-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>

        <div className="settings-menu">
          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="settings-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/user/stations"
            className="settings-menu-item"
          >
            <LocationIcon />
            <span>Find Stations</span>
          </Link>

          <Link
            to="/user/bookings"
            className="settings-menu-item"
          >
            <CalendarIcon />
            <span>My Bookings</span>
          </Link>

          <Link
            to="/user/history"
            className="settings-menu-item"
          >
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link
            to="/user/favourites"
            className="settings-menu-item"
          >
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>

          <p className="settings-menu-section">
            ACCOUNT
          </p>

          <Link
            to="/user/settings"
            className="settings-menu-item active"
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>

            <Link
                to="/user/help"
                className="settings-menu-item"
         >
            <HelpIcon />
                <span>Help & Support</span>
            </Link>
            
        </div>

        <div className="settings-profile">
          <div className="settings-profile-avatar">
            {profile.fullName
              ? profile.fullName.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="settings-profile-info">
            <strong>
              {profile.fullName || "EV User"}
            </strong>
            <span>EV User</span>
          </div>

          <span className="settings-profile-more">
            ⋮
          </span>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="settings-main">
        {/* HEADER */}

        <header className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>
              Manage your profile, vehicle and charging
              preferences.
            </p>
          </div>

          <div className="settings-header-actions">
            <button
              className="settings-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>

            <Link
              to="/login"
              className="settings-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>
          </div>
        </header>

        {/* =================================================
            SETTINGS HERO
        ================================================== */}

        <section className="settings-hero">
          <div>
            <span className="settings-hero-label">
              PERSONALIZE YOUR EXPERIENCE
            </span>

            <h2>
              Your EV charging,
              <span> your way.</span>
            </h2>

            <p>
              Keep your account, vehicle and charging
              preferences up to date for a smoother
              charging experience.
            </p>
          </div>

          <div className="settings-hero-icon">
            <SettingsIcon size={38} />
          </div>
        </section>

        {/* SUCCESS MESSAGE */}

        {savedMessage && (
          <div className="settings-success">
            <span>✓</span>
            {savedMessage}
          </div>
        )}

        <form
          className="settings-form"
          onSubmit={saveSettings}
        >
          {/* =================================================
              PROFILE SETTINGS
          ================================================== */}

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon">
                <span>U</span>
              </div>

              <div>
                <h3>Profile Information</h3>
                <p>
                  Update your personal account details.
                </p>
              </div>
            </div>

            <div className="settings-profile-summary">
              <div className="settings-big-avatar">
                {profile.fullName
                  ? profile.fullName
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>

              <div>
                <strong>
                  {profile.fullName || "EV User"}
                </strong>
                <span>
                  {profile.email ||
                    "Add your email address"}
                </span>
              </div>
            </div>

            <div className="settings-input-grid">
              <div className="settings-field">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="settings-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="settings-field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              VEHICLE DETAILS
          ================================================== */}

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon">
                <CarIcon size={21} />
              </div>

              <div>
                <h3>EV Details</h3>
                <p>
                  Add your electric vehicle information.
                </p>
              </div>
            </div>

            <div className="settings-input-grid">
              <div className="settings-field">
                <label htmlFor="vehicleModel">
                  Vehicle Model
                </label>

                <input
                  id="vehicleModel"
                  type="text"
                  name="vehicleModel"
                  value={vehicle.vehicleModel}
                  onChange={handleVehicleChange}
                  placeholder="e.g. Tesla Model 3"
                />
              </div>

              <div className="settings-field">
                <label htmlFor="connectorType">
                  Connector Type
                </label>

                <select
                  id="connectorType"
                  name="connectorType"
                  value={vehicle.connectorType}
                  onChange={handleVehicleChange}
                >
                  <option value="CCS">CCS</option>
                  <option value="Type 2">
                    Type 2
                  </option>
                  <option value="CHAdeMO">
                    CHAdeMO
                  </option>
                  <option value="GB/T">GB/T</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="batteryCapacity">
                  Battery Capacity
                </label>

                <div className="settings-input-unit">
                  <input
                    id="batteryCapacity"
                    type="number"
                    min="1"
                    name="batteryCapacity"
                    value={vehicle.batteryCapacity}
                    onChange={handleVehicleChange}
                    placeholder="60"
                  />

                  <span>kWh</span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              CHARGING PREFERENCES
          ================================================== */}

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon">
                <PlugIcon size={21} />
              </div>

              <div>
                <h3>Charging Preferences</h3>
                <p>
                  Customize how EVChargeHub finds
                  charging stations for you.
                </p>
              </div>
            </div>

            <div className="settings-input-grid">
              <div className="settings-field">
                <label htmlFor="preferredConnector">
                  Preferred Connector
                </label>

                <select
                  id="preferredConnector"
                  name="preferredConnector"
                  value={
                    preferences.preferredConnector
                  }
                  onChange={handlePreferenceChange}
                >
                  <option value="CCS">CCS</option>
                  <option value="Type 2">
                    Type 2
                  </option>
                  <option value="CHAdeMO">
                    CHAdeMO
                  </option>
                  <option value="GB/T">GB/T</option>
                  <option value="Any">
                    Any Connector
                  </option>
                </select>
              </div>
            </div>

            <div className="settings-option-row">
              <div>
                <strong>
                  Prefer Fast Charging
                </strong>

                <span>
                  Prioritize high-power charging stations
                  when searching.
                </span>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  name="fastCharging"
                  checked={preferences.fastCharging}
                  onChange={handlePreferenceChange}
                />

                <span className="settings-slider"></span>
              </label>
            </div>
          </section>

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon">
                <BellIcon size={21} />
              </div>

              <div>
                <h3>Notifications</h3>
                <p>
                  Choose which notifications you want to
                  receive.
                </p>
              </div>
            </div>

            <div className="settings-options">
              <div className="settings-option-row">
                <div>
                  <strong>
                    Booking Reminders
                  </strong>

                  <span>
                    Receive reminders before your
                    charging reservation.
                  </span>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    name="bookingReminders"
                    checked={
                      notifications.bookingReminders
                    }
                    onChange={
                      handleNotificationChange
                    }
                  />

                  <span className="settings-slider"></span>
                </label>
              </div>

              <div className="settings-option-row">
                <div>
                  <strong>
                    Charging Complete
                  </strong>

                  <span>
                    Get notified when your charging
                    session is completed.
                  </span>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    name="chargingComplete"
                    checked={
                      notifications.chargingComplete
                    }
                    onChange={
                      handleNotificationChange
                    }
                  />

                  <span className="settings-slider"></span>
                </label>
              </div>

              <div className="settings-option-row">
                <div>
                  <strong>
                    Offers & Updates
                  </strong>

                  <span>
                    Receive EVChargeHub news, offers and
                    service updates.
                  </span>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    name="promotions"
                    checked={
                      notifications.promotions
                    }
                    onChange={
                      handleNotificationChange
                    }
                  />

                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* =================================================
              SECURITY
          ================================================== */}

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon">
                <span>🔒</span>
              </div>

              <div>
                <h3>Security</h3>
                <p>
                  Manage your account security.
                </p>
              </div>
            </div>

            <div className="settings-security-box">
              <div>
                <strong>Password</strong>
                <span>
                  Password management will be connected
                  when authentication is added.
                </span>
              </div>

              <button
                type="button"
                className="change-password-button"
                disabled
              >
                Change Password
              </button>
            </div>
          </section>

          {/* SAVE */}

          <div className="settings-save-area">
            <div>
              <strong>Save your preferences</strong>
              <span>
                Your current frontend settings will be
                stored on this device.
              </span>
            </div>

            <button
              type="submit"
              className="save-settings-button"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Settings;