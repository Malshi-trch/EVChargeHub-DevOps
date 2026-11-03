import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import OwnerHeader from "../components/owner/OwnerHeader";
import {
  SearchIcon,
  HelpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  RouteIcon,
  PlugIcon,
  CalendarIcon,
  TrendingUpIcon,
  SettingsIcon,
  BuildingIcon,
  UsersIcon,
  CheckIcon,
} from "../components/Icons";
import "./OwnerHelpSupport.css";

const CATEGORIES = [
  { id: "all", label: "All Topics", icon: HelpIcon },
  { id: "getting-started", label: "Getting Started", icon: BuildingIcon },
  { id: "stations", label: "Managing Stations", icon: RouteIcon },
  { id: "chargers", label: "Charger Management", icon: PlugIcon },
  { id: "bookings", label: "Booking Management", icon: CalendarIcon },
  { id: "customers-reviews", label: "Customers & Reviews", icon: UsersIcon },
  { id: "analytics", label: "Analytics & Reports", icon: TrendingUpIcon },
  { id: "account", label: "Account & Settings", icon: SettingsIcon },
];

const FAQS = [
  {
    id: "faq-1",
    category: "stations",
    question: "How do I add a charging station?",
    answer:
      "Go to 'My Stations' in the left menu and click the '+ Add Station' button (or navigate to '/owner/stations/add'). Complete the multistep form with station name, address, GPS coordinates, power capacity, operating hours, and connector types. Once submitted, the station is saved to your portfolio in localStorage under 'evOwnerStationsData' and immediately appears across user and owner maps.",
  },
  {
    id: "faq-2",
    category: "stations",
    question: "How can I edit station information?",
    answer:
      "Navigate to 'My Stations', locate the specific hub card, and click 'Manage Station' or 'Edit'. Update details such as pricing per kWh, opening hours, facilities (Wi-Fi, Restrooms, Cafe), or contact phone number. Clicking 'Save Changes' synchronizes the station across the entire platform.",
  },
  {
    id: "faq-3",
    category: "chargers",
    question: "How do I add a new charger?",
    answer:
      "Open 'Chargers' in the sidebar or access station details and click 'Manage Chargers'. Click '+ Add Charger' or use the quick bay creator. Specify the connector type (CCS, Type 2, CHAdeMO), maximum power output in kW, and bay label (e.g. 'Bay 05 - Supercharger'). The new charger automatically registers in the central charging point directory.",
  },
  {
    id: "faq-4",
    category: "chargers",
    question: "How can I change charger availability?",
    answer:
      "In the 'Chargers' page ('/owner/chargers') or the station charger manager, click the status selector for any individual bay. You can toggle between 'Available', 'In Use', 'Maintenance', and 'Offline'. Updating status synchronizes the station's available charger count and instantly reflects on the User booking portal.",
  },
  {
    id: "faq-5",
    category: "bookings",
    question: "How do I confirm a booking?",
    answer:
      "Open 'Bookings' from the sidebar ('/owner/bookings'). Filter by 'Pending' to view drivers awaiting reservation approval. On any pending row, click the green 'Confirm' button. The booking status updates to 'Confirmed' with confirmed timestamp, and the driver is scheduled for that bay.",
  },
  {
    id: "faq-6",
    category: "bookings",
    question: "How do I start a charging session?",
    answer:
      "When the EV driver plugs into the assigned bay, locate their confirmed booking on '/owner/bookings' or booking details and click the blue 'Start Session' button. This transitions the booking status to 'Active' (Charging) and automatically marks the linked charger bay as 'In Use'.",
  },
  {
    id: "faq-7",
    category: "bookings",
    question: "How do I complete a charging session?",
    answer:
      "When the vehicle completes charging, click 'Complete Session' on the active booking. The session transitions to 'Completed', records the finalized kWh delivered, adds the realized revenue to your earnings, and releases the charger bay back to 'Available' for the next driver.",
  },
  {
    id: "faq-8",
    category: "customers-reviews",
    question: "How do I respond to customer reviews?",
    answer:
      "Navigate to 'Reviews' ('/owner/reviews'). Find any review marked 'Awaiting Reply' or any published customer evaluation. Click 'Reply to Review', enter your official owner response in the modal, and submit. Your response displays publicly beneath the review in 'evStationReviews' and updates your owner response rate KPI.",
  },
  {
    id: "faq-9",
    category: "analytics",
    question: "How do I export analytics reports?",
    answer:
      "Visit 'Analytics' ('/owner/analytics') from the sidebar. Choose your time interval (Last 7 Days, Last 30 Days, Last 90 Days, or All Time) and station filter. Click the green 'Export Report' button in the top right to download a CSV summary, or click 'Print' to open the printer-friendly summary view.",
  },
  {
    id: "faq-10",
    category: "account",
    question: "How do I update my owner profile?",
    answer:
      "Go to 'Settings' ('/owner/settings'). In Section A, update your Owner Display Name, email, telephone number, and business organization name. Click 'Save Changes'. Your updated name and role instantly update the persistent sidebar profile card and reports.",
  },
];

export default function OwnerHelpSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqIds, setOpenFaqIds] = useState(new Set(["faq-1"]));

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    category: "Technical Issue",
    subject: "",
    description: "",
  });
  const [contactFeedback, setContactFeedback] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.description.trim()) {
      setContactFeedback({
        type: "error",
        message: "Please fill in all required fields before submitting your support request.",
      });
      return;
    }

    // Save as local draft with clear explanation
    try {
      const drafts = JSON.parse(localStorage.getItem("evSupportDrafts") || "[]");
      drafts.push({
        ...contactForm,
        id: `draft_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: "Local Draft (Frontend Prototype)",
      });
      localStorage.setItem("evSupportDrafts", JSON.stringify(drafts));
    } catch {
      // ignore
    }

    setContactFeedback({
      type: "success",
      message:
        "Your inquiry draft has been saved locally. Because this is a frontend prototype, real ticket dispatch will activate once the backend support gateway is connected.",
    });

    setContactForm({
      name: "",
      email: "",
      category: "Technical Issue",
      subject: "",
      description: "",
    });

    setTimeout(() => setContactFeedback(null), 7000);
  };

  return (
    <div className="owner-help-page">
      <OwnerHeader
        title="Help & Support"
        subtitle="Find answers, learn how to manage your charging network, and get assistance."
      />

      <div className="owner-page-body">
        {/* SECTION A: HELP SEARCH BAR */}
        <section className="help-search-section">
          <div className="help-search-inner">
            <span className="help-search-badge">⚡ Knowledge Base</span>
            <h2>How can we help your charging operations today?</h2>
            <div className="help-search-input-box">
              <SearchIcon size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles and frequently asked questions..."
                aria-label="Search help topics"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* SECTION B: HELP CATEGORIES */}
        <section className="help-categories-section">
          <div className="section-title-row">
            <h3>Browse by Topic</h3>
            <span className="results-count">
              Showing {filteredFaqs.length} article{filteredFaqs.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="help-categories-grid">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`help-category-card ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <div className="category-icon-wrapper">
                    <IconComp size={20} />
                  </div>
                  <span className="category-title">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION C: FREQUENTLY ASKED QUESTIONS ACCORDION */}
        <section className="help-faqs-section">
          <div className="section-title-row">
            <h3>Frequently Asked Questions</h3>
            {selectedCategory !== "all" && (
              <button
                type="button"
                className="clear-cat-filter"
                onClick={() => setSelectedCategory("all")}
              >
                Clear Topic Filter
              </button>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="help-empty-state">
              <HelpIcon size={36} />
              <h4>No matching help articles found</h4>
              <p>Try searching for different terms or reset your selected category.</p>
              <button
                type="button"
                className="owner-btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Reset Search & Categories
              </button>
            </div>
          ) : (
            <div className="faq-accordions-list">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqIds.has(faq.id);
                return (
                  <div key={faq.id} className={`faq-item-card ${isOpen ? "open" : ""}`}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">{faq.question}</span>
                      <span className="faq-chevron-icon">
                        {isOpen ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="faq-answer-content">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION D: QUICK ACTION GUIDES */}
        <section className="help-quick-guides-section">
          <h3>Quick Navigation Shortcuts</h3>
          <p className="quick-guides-subtitle">
            Direct shortcuts to key owner operational management interfaces.
          </p>

          <div className="quick-guides-grid">
            <Link to="/owner/stations/add" className="quick-guide-card">
              <div className="quick-guide-icon green">
                <RouteIcon size={20} />
              </div>
              <div className="quick-guide-info">
                <strong>Add Station</strong>
                <span>Register a new charging hub</span>
              </div>
            </Link>

            <Link to="/owner/chargers" className="quick-guide-card">
              <div className="quick-guide-icon blue">
                <PlugIcon size={20} />
              </div>
              <div className="quick-guide-info">
                <strong>Manage Chargers</strong>
                <span>Set bay availability & rates</span>
              </div>
            </Link>

            <Link to="/owner/bookings" className="quick-guide-card">
              <div className="quick-guide-icon amber">
                <CalendarIcon size={20} />
              </div>
              <div className="quick-guide-info">
                <strong>View Bookings</strong>
                <span>Track slots & charging sessions</span>
              </div>
            </Link>

            <Link to="/owner/analytics" className="quick-guide-card">
              <div className="quick-guide-icon purple">
                <TrendingUpIcon size={20} />
              </div>
              <div className="quick-guide-info">
                <strong>View Analytics</strong>
                <span>Export revenue & usage metrics</span>
              </div>
            </Link>

            <Link to="/owner/settings" className="quick-guide-card">
              <div className="quick-guide-icon teal">
                <SettingsIcon size={20} />
              </div>
              <div className="quick-guide-info">
                <strong>Open Settings</strong>
                <span>Configure profile & alerts</span>
              </div>
            </Link>
          </div>
        </section>

        {/* SECTION E: CONTACT SUPPORT FORM */}
        <section className="help-contact-section">
          <div className="contact-card-header">
            <h3>Contact Network Support</h3>
            <p>
              Submit an operational inquiry or hardware assistance request.
            </p>
          </div>

          <div className="contact-prototype-notice">
            <span className="prototype-icon">ℹ</span>
            <div>
              <strong>Frontend Prototype Support Form</strong>
              <p>
                Inquiries are saved as local drafts. In production deployment, tickets are routed directly to the CPO 24/7 Operations Desk.
              </p>
            </div>
          </div>

          {contactFeedback && (
            <div className={`contact-feedback-box ${contactFeedback.type}`}>
              <span>{contactFeedback.type === "success" ? "✓" : "⚠"}</span>
              <p>{contactFeedback.message}</p>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="contact-form-grid">
            <div className="contact-form-field">
              <label htmlFor="supportName">
                Your Name <span className="req">*</span>
              </label>
              <input
                id="supportName"
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Station Owner / Manager"
                required
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="supportEmail">
                Email Address <span className="req">*</span>
              </label>
              <input
                id="supportEmail"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="owner@evchargehub.lk"
                required
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="supportCategory">
                Issue Category <span className="req">*</span>
              </label>
              <select
                id="supportCategory"
                value={contactForm.category}
                onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
              >
                <option value="Technical Issue">Technical / Portal Issue</option>
                <option value="Booking Dispute">Booking / Driver Dispute</option>
                <option value="Charger Hardware">Charger Bay Hardware Fault</option>
                <option value="Billing">Billing & Tariff Rate Inquiry</option>
                <option value="Other">Other Operational Question</option>
              </select>
            </div>

            <div className="contact-form-field">
              <label htmlFor="supportSubject">
                Subject <span className="req">*</span>
              </label>
              <input
                id="supportSubject"
                type="text"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="Brief summary of inquiry"
                required
              />
            </div>

            <div className="contact-form-field full-width">
              <label htmlFor="supportDescription">
                Description / Problem Details <span className="req">*</span>
              </label>
              <textarea
                id="supportDescription"
                rows={4}
                value={contactForm.description}
                onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                placeholder="Please describe the issue, affected station/charger ID, or question..."
                required
              />
            </div>

            <div className="contact-submit-row full-width">
              <button type="submit" className="owner-btn-primary">
                <CheckIcon size={16} />
                <span>Save Support Inquiry Draft</span>
              </button>
            </div>
          </form>
        </section>

        {/* SECTION F: APPLICATION INFORMATION */}
        <section className="help-app-info-section">
          <div className="app-info-badge">
            <span className="app-bolt">⚡</span>
            <div>
              <strong>EVChargeHub</strong>
              <small>Station Owner Portal &bull; Frontend Prototype</small>
            </div>
          </div>
          <p className="app-info-note">
            Built with React & Vite. All state, bookings, stations, reviews, and analytics persist locally in browser storage.
          </p>
        </section>
      </div>
    </div>
  );
}
