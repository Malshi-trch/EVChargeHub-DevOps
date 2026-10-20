import { useState, useMemo } from "react";
import "./OwnerAnalytics.css";
import OwnerHeader from "../components/owner/OwnerHeader";
import {
  BuildingIcon,
  TrendingUpIcon,
  DownloadIcon,
  ZapIcon,
  CheckIcon,
  InfoIcon,
  UsersIcon,
  StarIcon,
  PrinterIcon,
  RefreshCwIcon,
} from "../components/Icons";
import { getOwnerStations } from "../data/ownerStationsData";
import {
  getAnalyticsSummary,
  getTimelineTrends,
  getBookingStatusDistribution,
  getStationPerformanceMetrics,
  getCurrentChargerStatus,
  getCustomerAnalytics,
  getReviewAnalytics,
  getNetworkSummary,
  exportAnalyticsToCSV,
  formatLKR,
} from "../data/analyticsData";

export default function OwnerAnalytics() {
  const [dateRange, setDateRange] = useState("7d");
  const [stationFilter, setStationFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [sortField, setSortField] = useState("revenue");
  const [sortAsc, setSortAsc] = useState(false);

  const stations = useMemo(() => getOwnerStations(), []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // KPI Summary strictly derived from real operational bookings
  const summary = useMemo(() => {
    return getAnalyticsSummary(dateRange, stationFilter);
  }, [dateRange, stationFilter]);

  // Timeline Trends (continuous daily, weekly or monthly buckets)
  const timeline = useMemo(() => {
    return getTimelineTrends(dateRange, stationFilter);
  }, [dateRange, stationFilter]);

  // Booking Status Distribution (Completed, Active, Confirmed, Pending, Cancelled)
  const statusDistribution = useMemo(() => {
    return getBookingStatusDistribution(dateRange, stationFilter);
  }, [dateRange, stationFilter]);

  // Hardware status (Available, In Use, Maintenance, Offline)
  const chargerStatus = useMemo(() => {
    return getCurrentChargerStatus(stationFilter);
  }, [stationFilter]);

  // Station Performance & Ranking
  const stationMetrics = useMemo(() => {
    return getStationPerformanceMetrics(dateRange);
  }, [dateRange]);

  // Filter & Sort Station Performance Table
  const sortedStationMetrics = useMemo(() => {
    let list = stationFilter === "All"
      ? [...stationMetrics]
      : stationMetrics.filter((st) => String(st.id) === String(stationFilter));

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [stationMetrics, stationFilter, sortField, sortAsc]);

  // Derived network utilization rate
  const networkUtilization = useMemo(() => {
    if (!chargerStatus || chargerStatus.total === 0) return 0;
    const occupiedOrMaint = chargerStatus.inUse + chargerStatus.maintenance;
    return Math.round((occupiedOrMaint / chargerStatus.total) * 100);
  }, [chargerStatus]);

  // Customer Analytics & Reviews
  const customerAnalytics = useMemo(() => {
    return getCustomerAnalytics(stationFilter);
  }, [stationFilter]);

  const reviewAnalytics = useMemo(() => {
    return getReviewAnalytics(stationFilter);
  }, [stationFilter]);

  const networkSummary = useMemo(() => {
    return getNetworkSummary();
  }, []);

  const isFiltered = dateRange !== "7d" || stationFilter !== "All";

  const handleResetFilters = () => {
    setDateRange("7d");
    setStationFilter("All");
    showToast("Filters reset to default (Last 7 Days, All Stations).");
  };

  const handleExportCSV = () => {
    try {
      exportAnalyticsToCSV(dateRange, stationFilter, summary, stationMetrics);
      showToast("Analytics report CSV exported successfully!");
    } catch (e) {
      console.error("Export error:", e);
      showToast("Export failed. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // SVG Chart Calculations: Revenue Trend (Smooth Area & Line)
  const revenueChartData = useMemo(() => {
    if (!timeline || timeline.length === 0) return null;
    const maxRev = Math.max(...timeline.map((t) => t.revenue), 1000);
    const height = 220;
    const width = 800;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    const points = timeline.map((item, idx) => {
      const x = paddingLeft + (idx / Math.max(timeline.length - 1, 1)) * graphWidth;
      const y = height - paddingBottom - (item.revenue / maxRev) * graphHeight;
      return { x, y, ...item };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : "";

    return { points, pathD, areaD, maxRev, height, width, paddingLeft, paddingBottom, graphHeight };
  }, [timeline]);

  // SVG Chart Calculations: Sessions Volume Bar Chart
  const sessionChartData = useMemo(() => {
    if (!timeline || timeline.length === 0) return null;
    const maxSessions = Math.max(...timeline.map((t) => t.sessions), 5);
    const height = 220;
    const width = 800;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;
    const slotWidth = graphWidth / timeline.length;
    const barWidth = Math.max(10, Math.min(32, slotWidth * 0.6));

    const bars = timeline.map((item, idx) => {
      const x = paddingLeft + idx * slotWidth + (slotWidth - barWidth) / 2;
      const barHeight = (item.sessions / maxSessions) * graphHeight;
      const y = height - paddingBottom - barHeight;
      return { x, y, width: barWidth, height: barHeight, ...item };
    });

    return { bars, maxSessions, height, width, paddingLeft, paddingBottom, graphHeight };
  }, [timeline]);

  // Donut SVG Calculations for Booking Status
  const donutData = useMemo(() => {
    const total = statusDistribution.reduce((acc, s) => acc + s.count, 0);
    if (total === 0) return null;

    let cumulativeAngle = 0;
    const radius = 55;
    const cx = 70;
    const cy = 70;

    const slices = statusDistribution.map((item) => {
      const angle = (item.count / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData =
        angle >= 360
          ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        ...item,
        pathData,
      };
    });

    return { slices, total, cx, cy };
  }, [statusDistribution]);

  // Selected station name helper
  const selectedStationName = useMemo(() => {
    if (stationFilter === "All") return "All Stations";
    const match = stations.find((s) => String(s.id) === String(stationFilter));
    return match ? match.name : "Selected Station";
  }, [stations, stationFilter]);

  return (
    <div className="owner-analytics-page">
      {/* =========================================================
          A. FULL-WIDTH PAGE HEADER WITH CONTROLS
      ========================================================== */}
      <OwnerHeader
        title="Analytics & Reports"
        subtitle="Track revenue, charging activity, and operational performance across your EV charging network."
        actions={
          <div className="analytics-header-controls">
            {/* Time Period Selector */}
            <div className="analytics-header-select-box">
              <label htmlFor="analytics-header-period" className="header-control-label">Period:</label>
              <select
                id="analytics-header-period"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="header-control-select"
                aria-label="Filter time period"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Station Filter Dropdown */}
            <div className="analytics-header-select-box">
              <label htmlFor="analytics-header-station" className="header-control-label">Station:</label>
              <select
                id="analytics-header-station"
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="header-control-select"
                aria-label="Filter by station"
              >
                <option value="All">All Stations ({stations.length})</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              className="analytics-btn-export"
              onClick={handleExportCSV}
              title="Download CSV analytics report"
            >
              <DownloadIcon size={15} />
              <span>Export CSV</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              className="analytics-btn-print"
              onClick={handlePrint}
              title="Print analytics report or save as PDF"
            >
              <PrinterIcon size={15} />
              <span>Print</span>
            </button>
          </div>
        }
      />

      {/* =========================================================
          MAIN BODY WRAPPER (STANDARDIZED VERTICAL FLOW)
      ========================================================== */}
      <main className="owner-analytics-main">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="analytics-toast-banner" role="status">
            <span className="toast-dot" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Active Filter Filterbar / Reset */}
        {isFiltered && (
          <div className="analytics-active-filter-bar">
            <div className="filter-summary-chips">
              <span className="filter-chip">
                Period: <strong>{dateRange === "7d" ? "Last 7 Days" : dateRange === "30d" ? "Last 30 Days" : dateRange === "90d" ? "Last 90 Days" : "All Time"}</strong>
              </span>
              <span className="filter-chip">
                Station: <strong>{selectedStationName}</strong>
              </span>
            </div>
            <button
              type="button"
              className="btn-clear-analytics-filters"
              onClick={handleResetFilters}
            >
              <RefreshCwIcon size={13} />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {/* =========================================================
            B. RESPONSIVE KPI CARDS GRID (REAL CALCULATIONS)
        ========================================================== */}
        <section className="analytics-kpi-grid">
          {/* Card 1: Total Realized Revenue */}
          <div className="analytics-kpi-card highlight-emerald">
            <div className="kpi-card-header">
              <span className="kpi-label">Total Revenue</span>
              <div className="kpi-icon-pill emerald">
                <span className="kpi-currency-badge">LKR</span>
              </div>
            </div>
            <div className="kpi-value-block">
              <strong className="kpi-value">{summary.formattedRevenue}</strong>
            </div>
            <div className="kpi-footer">
              <span className="kpi-pill emerald">Realized Revenue</span>
              {summary.revenueChange !== null && (
                <span
                  className={`kpi-trend ${
                    summary.revenueChange >= 0 ? "positive" : "negative"
                  }`}
                >
                  {summary.revenueChange >= 0 ? "↑" : "↓"} {Math.abs(summary.revenueChange)}% vs prev
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Completed Charging Sessions */}
          <div className="analytics-kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Completed Sessions</span>
              <div className="kpi-icon-pill green">
                <CheckIcon size={18} />
              </div>
            </div>
            <div className="kpi-value-block">
              <strong className="kpi-value">{summary.completedSessions}</strong>
              <span className="kpi-unit">charges</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-pill green">Delivered</span>
              {summary.sessionsChange !== null && (
                <span
                  className={`kpi-trend ${
                    summary.sessionsChange >= 0 ? "positive" : "negative"
                  }`}
                >
                  {summary.sessionsChange >= 0 ? "↑" : "↓"} {Math.abs(summary.sessionsChange)}% vs prev
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Energy Delivered */}
          <div className="analytics-kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Energy Delivered</span>
              <div className="kpi-icon-pill blue">
                <ZapIcon size={18} />
              </div>
            </div>
            <div className="kpi-value-block">
              <strong className="kpi-value">{summary.formattedEnergy}</strong>
            </div>
            <div className="kpi-footer">
              <span className="kpi-pill blue">Electricity Dispensed</span>
              <span className="kpi-context">From verified meters</span>
            </div>
          </div>

          {/* Card 4: Average Revenue per Session */}
          <div className="analytics-kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Avg Revenue / Session</span>
              <div className="kpi-icon-pill amber">
                <TrendingUpIcon size={18} />
              </div>
            </div>
            <div className="kpi-value-block">
              <strong className="kpi-value">{summary.formattedAverageSession}</strong>
            </div>
            <div className="kpi-footer">
              <span className="kpi-pill amber">Per Session</span>
              {summary.averageSessionChange !== null && (
                <span
                  className={`kpi-trend ${
                    summary.averageSessionChange >= 0 ? "positive" : "negative"
                  }`}
                >
                  {summary.averageSessionChange >= 0 ? "↑" : "↓"} {Math.abs(summary.averageSessionChange)}% vs prev
                </span>
              )}
            </div>
          </div>

          {/* Card 5: Charger Utilization Rate */}
          <div className="analytics-kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-label">Charger Utilization</span>
              <div className="kpi-icon-pill purple">
                <BuildingIcon size={18} />
              </div>
            </div>
            <div className="kpi-value-block">
              <strong className="kpi-value">{networkUtilization}%</strong>
              <span className="kpi-unit">active bays</span>
            </div>
            <div className="kpi-footer">
              <span className="kpi-pill purple">Hardware Activity</span>
              <span className="kpi-context">{chargerStatus.inUse} of {chargerStatus.total} charging</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            C. REVENUE ANALYTICS (LARGE SVG AREA CHART)
        ========================================================== */}
        <section className="analytics-chart-section">
          <div className="analytics-card chart-large-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Revenue Analytics & Trend</h2>
                <p className="chart-sub">
                  Realized revenue (LKR) over selected period for {selectedStationName}
                </p>
              </div>
              <div className="chart-header-metrics">
                <div className="metric-badge">
                  <span>Period Total:</span>
                  <strong>{summary.formattedRevenue}</strong>
                </div>
                <div className="metric-badge secondary">
                  <span>Completed Charges:</span>
                  <strong>{summary.completedSessions}</strong>
                </div>
              </div>
            </div>

            {summary.totalRevenue === 0 ? (
              <div className="chart-empty-state">
                <div className="empty-icon-circle">
                  <TrendingUpIcon size={32} />
                </div>
                <h3>No revenue records in this period</h3>
                <p>
                  Revenue will update in real-time as drivers complete paid charging sessions at your stations.
                </p>
              </div>
            ) : revenueChartData ? (
              <div className="svg-chart-container">
                <svg
                  viewBox={`0 0 ${revenueChartData.width} ${revenueChartData.height}`}
                  className="trend-svg"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = revenueChartData.height - revenueChartData.paddingBottom - pct * revenueChartData.graphHeight;
                    const val = Math.round(pct * revenueChartData.maxRev);
                    return (
                      <g key={i}>
                        <line
                          x1={revenueChartData.paddingLeft}
                          y1={y}
                          x2={revenueChartData.width - 30}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={revenueChartData.paddingLeft - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="svg-axis-text"
                        >
                          {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill */}
                  <path d={revenueChartData.areaD} fill="url(#revenueGradient)" />

                  {/* Line stroke */}
                  <path
                    d={revenueChartData.pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive points */}
                  {revenueChartData.points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint?.dateKey === p.dateKey ? 7 : 4.5}
                      fill={p.revenue > 0 ? "#059669" : "#cbd5e1"}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="chart-interactive-dot"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </svg>

                {/* X-axis date labels */}
                <div className="chart-xaxis-labels">
                  {timeline.filter((_, i) => i === 0 || i === Math.floor(timeline.length / 2) || i === timeline.length - 1).map((item, idx) => (
                    <span key={idx} className="axis-label-item">
                      {item.label}
                    </span>
                  ))}
                </div>

                {/* Floating interactive tooltip */}
                {hoveredPoint && (
                  <div
                    className="chart-floating-tooltip"
                    style={{
                      left: `${(hoveredPoint.x / revenueChartData.width) * 100}%`,
                    }}
                  >
                    <div className="tooltip-header">{hoveredPoint.label}</div>
                    <div className="tooltip-value">{formatLKR(hoveredPoint.revenue)}</div>
                    <div className="tooltip-sub">
                      {hoveredPoint.sessions} sessions • {hoveredPoint.energy.toFixed(1)} kWh
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {/* =========================================================
            D. CHARGING PERFORMANCE (SESSIONS BAR CHART + HARDWARE & STATUS)
        ========================================================== */}
        <section className="analytics-split-grid">
          {/* SESSIONS TREND BAR CHART */}
          <div className="analytics-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Charging Sessions Trend</h2>
                <p className="chart-sub">Daily completed charging session volume</p>
              </div>
              <span className="sessions-count-pill">
                {summary.completedSessions} Completed
              </span>
            </div>

            {summary.completedSessions === 0 ? (
              <div className="chart-empty-state">
                <div className="empty-icon-circle">
                  <CheckIcon size={28} />
                </div>
                <h3>No session activity recorded</h3>
                <p>Charging sessions will display here as drivers use your stations.</p>
              </div>
            ) : sessionChartData ? (
              <div className="svg-chart-container">
                <svg
                  viewBox={`0 0 ${sessionChartData.width} ${sessionChartData.height}`}
                  className="trend-svg"
                  preserveAspectRatio="none"
                >
                  {/* Gridlines */}
                  {[0, 0.5, 1].map((pct, i) => {
                    const y = sessionChartData.height - sessionChartData.paddingBottom - pct * sessionChartData.graphHeight;
                    const val = Math.round(pct * sessionChartData.maxSessions);
                    return (
                      <g key={i}>
                        <line
                          x1={sessionChartData.paddingLeft}
                          y1={y}
                          x2={sessionChartData.width - 30}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={sessionChartData.paddingLeft - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="svg-axis-text"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {sessionChartData.bars.map((bar, idx) => (
                    <rect
                      key={idx}
                      x={bar.x}
                      y={bar.sessions > 0 ? bar.y : sessionChartData.height - sessionChartData.paddingBottom - 4}
                      width={bar.width}
                      height={bar.sessions > 0 ? bar.height : 4}
                      rx="4"
                      fill={bar.sessions > 0 ? "#2563eb" : "#e2e8f0"}
                      className="chart-bar"
                      onMouseEnter={() => setHoveredBar(bar)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  ))}
                </svg>

                <div className="chart-xaxis-labels">
                  {timeline.filter((_, i) => i === 0 || i === Math.floor(timeline.length / 2) || i === timeline.length - 1).map((item, idx) => (
                    <span key={idx} className="axis-label-item">
                      {item.label}
                    </span>
                  ))}
                </div>

                {hoveredBar && (
                  <div
                    className="chart-floating-tooltip"
                    style={{
                      left: `${(hoveredBar.x / sessionChartData.width) * 100}%`,
                    }}
                  >
                    <div className="tooltip-header">{hoveredBar.label}</div>
                    <div className="tooltip-value">{hoveredBar.sessions} Sessions</div>
                    <div className="tooltip-sub">{hoveredBar.energy.toFixed(1)} kWh dispensed</div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* CURRENT CHARGER STATUS & AVAILABILITY */}
          <div className="analytics-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Current Charger Status</h2>
                <p className="chart-sub">
                  Live operational availability across {chargerStatus.total} charging points
                </p>
              </div>
              <span className="live-status-pill">
                <span className="pulse-dot-green" />
                Live Status
              </span>
            </div>

            <div className="charger-status-body">
              {/* Hardware Count Boxes */}
              <div className="hardware-boxes-row">
                <div className="hw-box available">
                  <span className="hw-count">{chargerStatus.available}</span>
                  <span className="hw-name">Available</span>
                  <small className="hw-pct">{chargerStatus.availablePct}%</small>
                </div>
                <div className="hw-box in-use">
                  <span className="hw-count">{chargerStatus.inUse}</span>
                  <span className="hw-name">In Use</span>
                  <small className="hw-pct">{chargerStatus.inUsePct}%</small>
                </div>
                <div className="hw-box maintenance">
                  <span className="hw-count">{chargerStatus.maintenance}</span>
                  <span className="hw-name">Maintenance</span>
                  <small className="hw-pct">{chargerStatus.maintenancePct}%</small>
                </div>
                <div className="hw-box offline">
                  <span className="hw-count">{chargerStatus.offline}</span>
                  <span className="hw-name">Offline</span>
                  <small className="hw-pct">{chargerStatus.offlinePct}%</small>
                </div>
              </div>

              {/* Stacked Multi-Segment Bar */}
              <div className="hardware-stacked-track">
                <div
                  className="bar-seg available"
                  style={{ width: `${chargerStatus.availablePct}%` }}
                  title={`Available: ${chargerStatus.available}`}
                />
                <div
                  className="bar-seg in-use"
                  style={{ width: `${chargerStatus.inUsePct}%` }}
                  title={`In Use: ${chargerStatus.inUse}`}
                />
                <div
                  className="bar-seg maintenance"
                  style={{ width: `${chargerStatus.maintenancePct}%` }}
                  title={`Maintenance: ${chargerStatus.maintenance}`}
                />
                <div
                  className="bar-seg offline"
                  style={{ width: `${chargerStatus.offlinePct}%` }}
                  title={`Offline: ${chargerStatus.offline}`}
                />
              </div>

              {/* Booking Status Distribution with Donut Graphic */}
              <div className="booking-distribution-mini">
                <div className="mini-dist-header">
                  <span className="dist-label">Booking Completion Rate</span>
                  <strong className="dist-rate">{summary.completionRate}%</strong>
                </div>

                <div className="donut-and-bars-row">
                  {donutData && (
                    <div className="donut-chart-box">
                      <svg viewBox="0 0 140 140" className="donut-svg-graphic">
                        {donutData.slices.map((slice, i) => (
                          <path
                            key={i}
                            d={slice.pathData}
                            fill={slice.color}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                        ))}
                        <circle cx={donutData.cx} cy={donutData.cy} r="34" fill="#ffffff" />
                      </svg>
                      <div className="donut-center-metric">
                        <strong>{donutData.total}</strong>
                        <small>Bookings</small>
                      </div>
                    </div>
                  )}

                  <div className="bars-and-tags-col">
                    <div className="status-progress-track">
                      {statusDistribution.map((item) => (
                        <div
                          key={item.status}
                          className="status-seg"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                          title={`${item.label}: ${item.count} (${item.percentage}%)`}
                        />
                      ))}
                    </div>
                    <div className="status-legend-tags">
                      {statusDistribution.map((item) => (
                        <div key={item.status} className="legend-tag-item">
                          <span className="legend-dot" style={{ backgroundColor: item.color }} />
                          <span>{item.label} ({item.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            E. STATION PERFORMANCE COMPARISON & RANKING TABLE
        ========================================================== */}
        <section className="analytics-card station-table-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Station Performance Comparison</h2>
              <p className="chart-sub">
                Comprehensive operational comparison across {stations.length} charging stations
              </p>
            </div>
            <span className="table-count-badge">
              {sortedStationMetrics.length} Stations Listed
            </span>
          </div>

          <div className="station-table-responsive">
            <table className="station-comparison-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("rank")} className="sortable-th">
                    Rank {sortField === "rank" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("name")} className="sortable-th">
                    Station Name {sortField === "name" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("revenue")} className="sortable-th num-col">
                    Revenue (LKR) {sortField === "revenue" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("completedSessions")} className="sortable-th num-col">
                    Completed Sessions {sortField === "completedSessions" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("energy")} className="sortable-th num-col">
                    Energy Delivered {sortField === "energy" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("utilizationRate")} className="sortable-th num-col">
                    Charger Availability {sortField === "utilizationRate" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("rating")} className="sortable-th num-col">
                    Customer Rating {sortField === "rating" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStationMetrics.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <span className={`rank-pill rank-${st.rank}`}>
                        #{st.rank}
                      </span>
                    </td>
                    <td>
                      <div className="station-row-info">
                        {st.image && (
                          <img
                            src={st.image}
                            alt={st.name}
                            className="station-row-avatar"
                          />
                        )}
                        <div className="station-row-details">
                          <strong className="station-name-text">{st.name}</strong>
                          <span className="station-addr-text">{st.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="num-col">
                      <strong className="table-revenue-text">{st.formattedRevenue}</strong>
                    </td>
                    <td className="num-col">
                      <span className="table-sessions-text">{st.completedSessions}</span>
                      <small className="table-sub-label"> sessions</small>
                    </td>
                    <td className="num-col">
                      <span className="table-energy-text">{st.energy.toLocaleString("en-US")}</span>
                      <small className="table-sub-label"> kWh</small>
                    </td>
                    <td className="num-col">
                      <div className="table-charger-cell">
                        <span>{st.availableChargers} / {st.totalChargers} Available</span>
                        <div className="mini-bar-track">
                          <div
                            className="mini-bar-fill"
                            style={{
                              width: `${st.totalChargers > 0 ? (st.availableChargers / st.totalChargers) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="num-col">
                      <div className="table-rating-cell">
                        <StarIcon size={14} filled={true} className="star-gold" />
                        <strong>{st.rating.toFixed(1)}</strong>
                        <span className="rating-count-label">({st.reviewsCount})</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================================
            CUSTOMER INSIGHTS & DRIVER SATISFACTION
        ========================================================== */}
        <section className="analytics-split-grid">
          {/* Customer Insights */}
          <div className="analytics-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Customer Insights</h2>
                <p className="chart-sub">Derived EV driver retention and engagement</p>
              </div>
              <span className="customer-rate-pill">
                <UsersIcon size={14} />
                <span>{customerAnalytics.returningPercentage}% Returning</span>
              </span>
            </div>

            <div className="customer-insights-grid">
              <div className="insight-box">
                <span className="insight-num">{customerAnalytics.total}</span>
                <span className="insight-name">Total Customers</span>
                <small className="insight-sub">Registered drivers</small>
              </div>
              <div className="insight-box">
                <span className="insight-num">{customerAnalytics.returning}</span>
                <span className="insight-name">Returning Drivers</span>
                <small className="insight-sub">&gt; 1 completed session</small>
              </div>
              <div className="insight-box">
                <span className="insight-num">{customerAnalytics.active}</span>
                <span className="insight-name">Active Drivers</span>
                <small className="insight-sub">Recent charging activity</small>
              </div>
              <div className="insight-box">
                <span className="insight-num">{customerAnalytics.newCust}</span>
                <span className="insight-name">New Customers</span>
                <small className="insight-sub">Single session drivers</small>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="analytics-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Driver Satisfaction</h2>
                <p className="chart-sub">Reputation metrics derived from real customer reviews</p>
              </div>
              <span className="metric-badge">
                <StarIcon size={14} filled={true} className="star-gold" />
                <span>{reviewAnalytics.overallRating} / 5.0</span>
              </span>
            </div>

            <div className="driver-sat-body">
              <div className="sat-score-column">
                <strong className="sat-huge-score">{reviewAnalytics.overallRating}</strong>
                <div className="sat-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon
                      key={s}
                      size={16}
                      filled={s <= Math.round(reviewAnalytics.overallRating)}
                      className={s <= Math.round(reviewAnalytics.overallRating) ? "star-gold" : "star-empty"}
                    />
                  ))}
                </div>
                <small className="sat-label-text">Average Rating</small>
              </div>

              <div className="sat-metrics-list">
                <div className="sat-metric-row">
                  <span className="sat-row-label">Published Reviews:</span>
                  <strong className="sat-row-val">{reviewAnalytics.totalReviews}</strong>
                </div>
                <div className="sat-metric-row">
                  <span className="sat-row-label">5-Star Satisfaction:</span>
                  <strong className="sat-row-val">{reviewAnalytics.fiveStarPercentage}%</strong>
                </div>
                <div className="sat-metric-row">
                  <span className="sat-row-label">Owner Response Rate:</span>
                  <strong className="sat-row-val">{reviewAnalytics.responseRate}%</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Network Infrastructure Summary */}
        <section className="network-summary-banner">
          <div className="summary-banner-left">
            <div className="banner-icon-circle">
              <BuildingIcon size={20} />
            </div>
            <div>
              <strong className="banner-title">Owner Network Infrastructure</strong>
              <small className="banner-sub">Verified operational assets across network</small>
            </div>
          </div>
          <div className="summary-pills-row">
            <div className="summary-pill">
              <strong>{networkSummary.stationsCount}</strong>
              <span>Stations</span>
            </div>
            <div className="summary-pill">
              <strong>{networkSummary.chargersCount}</strong>
              <span>Chargers</span>
            </div>
            <div className="summary-pill">
              <strong>{networkSummary.customersCount}</strong>
              <span>Customers</span>
            </div>
            <div className="summary-pill">
              <strong>{networkSummary.reviewsCount}</strong>
              <span>Reviews</span>
            </div>
            <div className="summary-pill highlight">
              <strong>{networkSummary.completedSessions}</strong>
              <span>Completed Sessions</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            F. REPORT GENERATION & EXPORT
        ========================================================== */}
        <section className="analytics-card reports-summary-card">
          <div className="reports-card-content">
            <div className="reports-text-cluster">
              <div className="reports-icon-badge">
                <DownloadIcon size={22} />
              </div>
              <div>
                <h3 className="reports-title">Operational & Revenue Reports</h3>
                <p className="reports-desc">
                  Download verifiable analytics reports for financial audits, power distribution planning, or tax reporting.
                </p>
                <div className="reports-meta-chips">
                  <span className="meta-chip">Scope: <strong>{selectedStationName}</strong></span>
                  <span className="meta-chip">Period: <strong>{dateRange}</strong></span>
                  <span className="meta-chip">Total Realized: <strong>{summary.formattedRevenue}</strong></span>
                </div>
              </div>
            </div>

            <div className="reports-action-buttons">
              <button
                type="button"
                className="btn-export-csv-large"
                onClick={handleExportCSV}
              >
                <DownloadIcon size={16} />
                <span>Download CSV Report</span>
              </button>
              <button
                type="button"
                className="btn-print-report"
                onClick={handlePrint}
              >
                <PrinterIcon size={16} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          <div className="reports-footer-note">
            <InfoIcon size={14} />
            <span>
              Realized revenue and electricity deliveries are strictly calculated from completed bookings and verified charging session transactions.
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
