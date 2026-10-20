import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./HelpSupport.css";

import {
  BoltIcon,
  HomeIcon,
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  SettingsIcon,
  HelpIcon,
  SearchIcon,
  BellIcon,
  LogoutIcon,
  PlugIcon,
} from "../components/Icons";

/* =========================================================
   FAQ DATA
========================================================= */

const faqs = [
  {
    id: 1,
    question: "How do I book a charging station?",
    answer:
      "Go to Find Stations, select an EVChargeHub charging station, open the station details and choose an available charging slot. Review the booking information and confirm your reservation.",
  },
  {
    id: 2,
    question: "Can I book a public charging station?",
    answer:
      "Public charging stations can be viewed on EVChargeHub, but booking is only available for stations registered with EVChargeHub.",
  },
  {
    id: 3,
    question: "How can I cancel my booking?",
    answer:
      "Open My Bookings, select the relevant booking and open its details. If the booking can still be cancelled, use the Cancel Booking option.",
  },
  {
    id: 4,
    question:
      "How do I add a station to my favourites?",
    answer:
      "Click the heart icon on a station card or station details page. The station will then appear under Favourite Stations.",
  },
  {
    id: 5,
    question:
      "Why is a charging station showing unavailable?",
    answer:
      "A station may currently have no available charging points or its availability information may not be provided. Public stations may also have limited information compared with EVChargeHub stations.",
  },
  {
    id: 6,
    question:
      "Where can I view my completed charging sessions?",
    answer:
      "Open Charging History from the sidebar to view charging sessions that have been marked as completed.",
  },
  {
    id: 7,
    question:
      "How can I change my vehicle information?",
    answer:
      "Open Settings and update your EV model, connector type and battery capacity. Then select Save Changes.",
  },
  {
    id: 8,
    question:
      "What should I do if a charger is not working?",
    answer:
      "First make sure your connector is compatible with the charger. If the issue continues, stop the charging attempt safely and submit a support request with the station name and a description of the problem.",
  },
];

function generateTicketId() {
  return "SUP-" + Date.now();
}

function HelpSupport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const [formData, setFormData] = useState({
    category: "Booking Issue",
    subject: "",
    message: "",
  });

  const [successMessage, setSuccessMessage] =
    useState("");

  const userProfile = JSON.parse(
    localStorage.getItem("evUserProfile") || "null"
  );

  const user = {
    name: userProfile?.fullName || "Hareen",
    email: userProfile?.email || "",
  };

  /* =========================================================
     SEARCH FAQ
  ========================================================= */

  const filteredFaqs = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) {
      return faqs;
    }

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(value) ||
        faq.answer.toLowerCase().includes(value)
    );
  }, [searchTerm]);

  /* =========================================================
     FORM
  ========================================================= */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitSupportRequest = (event) => {
    event.preventDefault();

    if (
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      return;
    }

    const savedRequests = JSON.parse(
      localStorage.getItem("evSupportRequests") ||
        "[]"
    );

    const newRequest = {
      id: generateTicketId(),
      userName: user.name,
      userEmail: user.email,
      category: formData.category,
      subject: formData.subject,
      message: formData.message,
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    const updatedRequests = [
      newRequest,
      ...savedRequests,
    ];

    localStorage.setItem(
      "evSupportRequests",
      JSON.stringify(updatedRequests)
    );

    setFormData({
      category: "Booking Issue",
      subject: "",
      message: "",
    });

    setSuccessMessage(
      "Your support request has been submitted."
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  return (
    <div className="help-dashboard">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="help-sidebar">
        <Link to="/" className="help-logo">
          <div className="help-logo-icon">
            <BoltIcon size={25} />
          </div>

          <span className="help-logo-text">
            <span>EV</span>Charge<span>Hub</span>
          </span>
        </Link>

        <div className="help-menu">
          <p>MAIN MENU</p>

          <Link
            to="/user/dashboard"
            className="help-menu-item"
          >
            <HomeIcon />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/user/stations"
            className="help-menu-item"
          >
            <LocationIcon />
            <span>Find Stations</span>
          </Link>

          <Link
            to="/user/bookings"
            className="help-menu-item"
          >
            <CalendarIcon />
            <span>My Bookings</span>
          </Link>

          <Link
            to="/user/history"
            className="help-menu-item"
          >
            <ClockIcon />
            <span>Charging History</span>
          </Link>

          <Link
            to="/user/favourites"
            className="help-menu-item"
          >
            <HeartIcon />
            <span>Favourite Stations</span>
          </Link>

          <p className="help-menu-section">
            ACCOUNT
          </p>

          <Link
            to="/user/settings"
            className="help-menu-item"
          >
            <SettingsIcon />
            <span>Settings</span>
          </Link>

          <Link
            to="/user/help"
            className="help-menu-item active"
          >
            <HelpIcon />
            <span>Help & Support</span>
          </Link>
        </div>

        <div className="help-profile">
          <div className="help-profile-avatar">
            {user.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="help-profile-info">
            <strong>{user.name}</strong>
            <span>EV User</span>
          </div>

          <span className="help-profile-more">
            ⋮
          </span>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="help-main">
        {/* HEADER */}

        <header className="help-header">
          <div>
            <h1>Help & Support</h1>

            <p>
              Find answers and get support whenever you
              need it.
            </p>
          </div>

          <div className="help-header-actions">
            <button
              className="help-notification"
              aria-label="Notifications"
            >
              <BellIcon size={19} />
              <span></span>
            </button>

            <Link
              to="/login"
              className="help-logout"
            >
              <LogoutIcon size={17} />
              Logout
            </Link>
          </div>
        </header>

        {/* =================================================
            HERO
        ================================================== */}

        <section className="help-hero">
          <div className="help-hero-content">
            <span className="help-hero-label">
              EVCHARGEHUB SUPPORT
            </span>

            <h2>
              How can we
              <span> help you?</span>
            </h2>

            <p>
              Search for answers about charging,
              bookings, stations and your EVChargeHub
              account.
            </p>

            <div className="help-search">
              <SearchIcon size={19} />

              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
          </div>

          <div className="help-hero-visual">
            <div className="help-main-icon">
              <HelpIcon size={38} />
            </div>

            <div className="help-small-icon help-small-one">
              <BoltIcon size={18} />
            </div>

            <div className="help-small-icon help-small-two">
              <PlugIcon size={18} />
            </div>
          </div>
        </section>

        {/* =================================================
            QUICK HELP
        ================================================== */}

        <section className="quick-help-section">
          <div className="help-section-heading">
            <div>
              <h3>Quick Help</h3>
              <p>
                Get help with common EVChargeHub tasks.
              </p>
            </div>
          </div>

          <div className="quick-help-grid">
            <Link
              to="/user/stations"
              className="quick-help-card"
            >
              <div className="quick-help-icon">
                <LocationIcon size={21} />
              </div>

              <div>
                <h4>Find a Station</h4>
                <p>
                  Search charging stations and check
                  availability.
                </p>
              </div>

              <span className="quick-help-arrow">
                →
              </span>
            </Link>

            <Link
              to="/user/bookings"
              className="quick-help-card"
            >
              <div className="quick-help-icon">
                <CalendarIcon size={21} />
              </div>

              <div>
                <h4>Manage Bookings</h4>
                <p>
                  View and manage your charging
                  reservations.
                </p>
              </div>

              <span className="quick-help-arrow">
                →
              </span>
            </Link>

            <Link
              to="/user/settings"
              className="quick-help-card"
            >
              <div className="quick-help-icon">
                <SettingsIcon size={21} />
              </div>

              <div>
                <h4>Account Settings</h4>
                <p>
                  Update your profile, EV and charging
                  preferences.
                </p>
              </div>

              <span className="quick-help-arrow">
                →
              </span>
            </Link>
          </div>
        </section>

        {/* =================================================
            FAQ + CONTACT
        ================================================== */}

        <section className="help-content-grid">
          {/* FAQ */}

          <div className="faq-card">
            <div className="help-section-heading">
              <div>
                <span className="help-small-label">
                  KNOWLEDGE BASE
                </span>

                <h3>Frequently Asked Questions</h3>

                <p>
                  Quick answers to common questions.
                </p>
              </div>
            </div>

            <div className="faq-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen =
                    openFaq === faq.id;

                  return (
                    <div
                      className={`faq-item ${
                        isOpen ? "open" : ""
                      }`}
                      key={faq.id}
                    >
                      <button
                        type="button"
                        className="faq-question"
                        onClick={() =>
                          setOpenFaq(
                            isOpen ? null : faq.id
                          )
                        }
                      >
                        <span>
                          {faq.question}
                        </span>

                        <strong>
                          {isOpen ? "−" : "+"}
                        </strong>
                      </button>

                      {isOpen && (
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-help-results">
                  <SearchIcon size={28} />

                  <h4>No results found</h4>

                  <p>
                    Try searching with another keyword.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CONTACT SUPPORT */}

          <div className="contact-support-card">
            <div className="support-card-icon">
              <HelpIcon size={22} />
            </div>

            <span className="help-small-label">
              NEED MORE HELP?
            </span>

            <h3>Contact Support</h3>

            <p className="support-description">
              Can't find the answer you need? Send us
              your issue and our support team can review
              it.
            </p>

            {successMessage && (
              <div className="support-success">
                <span>✓</span>
                {successMessage}
              </div>
            )}

            <form
              className="support-form"
              onSubmit={submitSupportRequest}
            >
              <div className="support-field">
                <label htmlFor="supportCategory">
                  Issue Category
                </label>

                <select
                  id="supportCategory"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                >
                  <option value="Booking Issue">
                    Booking Issue
                  </option>

                  <option value="Charging Issue">
                    Charging Issue
                  </option>

                  <option value="Station Issue">
                    Station Issue
                  </option>

                  <option value="Account Issue">
                    Account Issue
                  </option>

                  <option value="Payment Issue">
                    Payment Issue
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="support-field">
                <label htmlFor="supportSubject">
                  Subject
                </label>

                <input
                  id="supportSubject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder="Briefly describe your issue"
                  required
                />
              </div>

              <div className="support-field">
                <label htmlFor="supportMessage">
                  Message
                </label>

                <textarea
                  id="supportMessage"
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Tell us more about the problem..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="submit-support-button"
              >
                Submit Support Request
              </button>
            </form>
          </div>
        </section>

        {/* =================================================
            CHARGING PROBLEM NOTICE
        ================================================== */}

        <section className="charging-help-banner">
          <div className="charging-help-icon">
            <BoltIcon size={23} />
          </div>

          <div>
            <span>CHARGING PROBLEM?</span>

            <h3>
              Having trouble at a charging station?
            </h3>

            <p>
              Stop the charging attempt safely, check
              the connector compatibility and report
              the station problem through the support
              form above.
            </p>
          </div>

          <Link
            to="/user/stations"
            className="charging-help-button"
          >
            View Stations
          </Link>
        </section>
      </main>
    </div>
  );
}

export default HelpSupport;