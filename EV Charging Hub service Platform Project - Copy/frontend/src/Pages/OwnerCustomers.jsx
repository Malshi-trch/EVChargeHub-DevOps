import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import OwnerHeader from "../components/owner/OwnerHeader";
import "./OwnerCustomers.css";

import {
  UsersIcon,
  SearchIcon,
  StarIcon,
  TrendingUpIcon,
  BoltIcon,
  CheckIcon,
} from "../components/Icons";
import { getOwnerStations } from "../data/ownerStationsData";
import {
  getOwnerCustomers,
  formatCustomerDate,
} from "../data/bookingsData";

export default function OwnerCustomers() {
  const [stations] = useState(() => getOwnerStations());
  const customers = useMemo(() => getOwnerCustomers(stations), [stations]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("All");
  const [stationFilter, setStationFilter] = useState("All");

  // Calculate KPIs dynamically from derived owner customers
  const kpis = useMemo(() => {
    const total = customers.length;
    // Active Customer: customer with a Pending, Confirmed or Active booking
    const active = customers.filter((c) => c.isActiveCustomer).length;
    // Returning Customer: customer with more than 1 booking
    const returning = customers.filter((c) => c.isReturning).length;
    // Total Completed Sessions across all owner customers
    const completedSessions = customers.reduce(
      (sum, c) => sum + (c.completedSessions || 0),
      0
    );
    // Total Customer Revenue from completed sessions
    const totalRevenue = customers.reduce(
      (sum, c) => sum + (c.totalSpent || 0),
      0
    );

    return {
      total,
      active,
      returning,
      completedSessions,
      totalRevenue,
    };
  }, [customers]);

  // Filter customers based on search query, type, and station
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Search across name, email, phone safely
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const nameMatch = (c.name || "").toLowerCase().includes(q);
        const emailMatch = (c.email || "").toLowerCase().includes(q);
        const phoneMatch = (c.phone || "").toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch) {
          return false;
        }
      }

      // Customer type filter
      if (customerTypeFilter === "New" && c.customerType !== "New Customer") {
        return false;
      }
      if (customerTypeFilter === "Returning" && c.customerType !== "Returning Customer") {
        return false;
      }
      if (customerTypeFilter === "Active" && !c.isActiveCustomer) {
        return false;
      }

      // Station filter
      if (stationFilter !== "All") {
        const targetStationId = Number(stationFilter);
        const hasUsedStation = (c.stationsUsed || []).some(
          (stId) => Number(stId) === targetStationId
        );
        if (!hasUsedStation) {
          return false;
        }
      }

      return true;
    });
  }, [customers, searchQuery, customerTypeFilter, stationFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setCustomerTypeFilter("All");
    setStationFilter("All");
  };

  // Helper to extract customer initials for avatar
  const getInitials = (name) => {
    if (!name) return "EV";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="owner-customers-view">
      <OwnerHeader
        title="Customers"
        subtitle="View EV drivers who use your charging network and understand their charging activity."
      />

      {/* ===================================================
          KPI CARDS (DYNAMICALLY CALCULATED)
      ==================================================== */}
        <section className="customers-kpi-grid">
          {/* Card 1: Total Customers */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Total Customers</span>
              <div className="kpi-icon-wrapper blue">
                <UsersIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.total}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge blue">Registered Drivers</span>
              <small>Across network</small>
            </div>
          </div>

          {/* Card 2: Active Customers */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Active Customers</span>
              <div className="kpi-icon-wrapper green">
                <BoltIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.active}</strong>
            <div className="kpi-footer">
              <span className="kpi-trend positive">● Ongoing & Scheduled</span>
              <small>Active sessions</small>
            </div>
          </div>

          {/* Card 3: Returning Customers */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Returning Customers</span>
              <div className="kpi-icon-wrapper amber">
                <StarIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.returning}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge amber">Repeat EV Drivers</span>
              <small>&gt; 1 booking</small>
            </div>
          </div>

          {/* Card 4: Total Completed Sessions */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Total Completed Sessions</span>
              <div className="kpi-icon-wrapper cyan">
                <CheckIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">{kpis.completedSessions}</strong>
            <div className="kpi-footer">
              <span className="kpi-badge cyan">Fulfilled</span>
              <small>Charged to 100%</small>
            </div>
          </div>

          {/* Card 5: Customer Revenue */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Customer Revenue</span>
              <div className="kpi-icon-wrapper emerald">
                <TrendingUpIcon size={20} />
              </div>
            </div>
            <strong className="kpi-value">
              LKR {kpis.totalRevenue.toLocaleString()}
            </strong>
            <div className="kpi-footer">
              <span className="kpi-trend positive">From Completed</span>
              <small>Actual spend</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            SEARCH & FILTERS TOOLBAR
        ==================================================== */}
        <section className="customers-filter-toolbar">
          <div className="filter-search-box">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search customers by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search customers"
            />
            {searchQuery && (
              <button
                type="button"
                className="filter-clear-input-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-controls-row">
            {/* Filter: Customer Type */}
            <div className="filter-select-wrapper">
              <label htmlFor="customer-type-select">Customer Type:</label>
              <select
                id="customer-type-select"
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
              >
                <option value="All">All Customers</option>
                <option value="New">New</option>
                <option value="Returning">Returning</option>
                <option value="Active">Active</option>
              </select>
            </div>

            {/* Filter: Station */}
            <div className="filter-select-wrapper">
              <label htmlFor="customer-station-select">Station:</label>
              <select
                id="customer-station-select"
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
              >
                <option value="All">All Stations</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(searchQuery || customerTypeFilter !== "All" || stationFilter !== "All") && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            )}

            <div className="filter-counter">
              <span>
                Showing <strong>{filteredCustomers.length}</strong> of{" "}
                <strong>{customers.length}</strong> customers
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            CUSTOMER LIST (DESKTOP TABLE & MOBILE CARDS)
        ==================================================== */}
        {customers.length === 0 ? (
          /* Zero customers initial empty state */
          <div className="customers-empty-state">
            <div className="empty-icon-circle">
              <UsersIcon size={40} />
            </div>
            <h2>No customers yet</h2>
            <p>
              Customers will appear here after they make bookings at your
              charging stations.
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          /* Filter zero results empty state */
          <div className="customers-empty-state">
            <div className="empty-icon-circle">
              <SearchIcon size={36} />
            </div>
            <h2>No matching customers found</h2>
            <p>
              We couldn't find any customers matching your current search or
              filters.
            </p>
            <button
              type="button"
              className="btn-reset-filters-empty"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="customers-table-card">
              <div className="customers-table-wrapper">
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Total Bookings</th>
                      <th>Completed Sessions</th>
                      <th>Total Spent</th>
                      <th>Last Visit</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>

                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.customerId}>
                      {/* Customer column with avatar */}
                      <td>
                        <div className="customer-name-cell">
                          <div className="customer-avatar-badge">
                            {getInitials(c.name)}
                          </div>
                          <div className="customer-name-info">
                            <strong className="customer-name">{c.name}</strong>
                            <small className="customer-id-tag">
                              ID: {c.customerId}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Contact column */}
                      <td>
                        <div className="customer-contact-cell">
                          <span className="contact-email">
                            {c.email || "Not provided"}
                          </span>
                          <span className="contact-phone">
                            {c.phone || "Not provided"}
                          </span>
                        </div>
                      </td>

                      {/* Total Bookings */}
                      <td>
                        <span className="numeric-stat-badge">
                          {c.totalBookings}
                        </span>
                      </td>

                      {/* Completed Sessions */}
                      <td>
                        <span className="numeric-stat-badge completed">
                          {c.completedSessions}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td>
                        <strong className="customer-spent-amount">
                          LKR {c.totalSpent.toLocaleString()}
                        </strong>
                      </td>

                      {/* Last Visit */}
                      <td>
                        <span className="customer-last-visit">
                          {formatCustomerDate(c.lastVisit)}
                        </span>
                      </td>

                      {/* Status / Type Badge */}
                      <td>
                        <div className="customer-badge-cluster">
                          <span
                            className={`customer-type-badge ${
                              c.isReturning ? "returning" : "new"
                            }`}
                          >
                            {c.customerType}
                          </span>
                          {c.hasActiveSession && (
                            <span className="customer-active-session-badge">
                              ● Active Session
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <Link
                          to={`/owner/customers/${c.customerId}`}
                          className="btn-view-customer-profile"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


            {/* Mobile Stacked Cards View */}
            <div className="customers-mobile-cards">
              {filteredCustomers.map((c) => (
                <div key={c.customerId} className="customer-mobile-card">
                  <div className="card-top-row">
                    <div className="customer-avatar-badge">
                      {getInitials(c.name)}
                    </div>
                    <div className="card-title-info">
                      <strong className="customer-name">{c.name}</strong>
                      <div className="customer-badge-cluster">
                        <span
                          className={`customer-type-badge ${
                            c.isReturning ? "returning" : "new"
                          }`}
                        >
                          {c.customerType}
                        </span>
                        {c.hasActiveSession && (
                          <span className="customer-active-session-badge">
                            ● Active Session
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-contact-row">
                    <div className="contact-item">
                      <small>Email</small>
                      <span>{c.email || "Not provided"}</span>
                    </div>
                    <div className="contact-item">
                      <small>Phone</small>
                      <span>{c.phone || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="card-stats-grid">
                    <div className="stat-box">
                      <small>Bookings</small>
                      <strong>{c.totalBookings}</strong>
                    </div>
                    <div className="stat-box">
                      <small>Completed</small>
                      <strong>{c.completedSessions}</strong>
                    </div>
                    <div className="stat-box">
                      <small>Total Spent</small>
                      <strong>LKR {c.totalSpent.toLocaleString()}</strong>
                    </div>
                    <div className="stat-box">
                      <small>Last Visit</small>
                      <span>{formatCustomerDate(c.lastVisit)}</span>
                    </div>
                  </div>

                  <div className="card-actions-row">
                    <Link
                      to={`/owner/customers/${c.customerId}`}
                      className="btn-view-customer-profile mobile-full"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
    </div>
  );
}

