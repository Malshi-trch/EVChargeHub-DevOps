/**
 * EVChargeHub Centralized Analytics & Revenue Reporting Module
 * Strictly DERIVED from operational sources of truth:
 * - evBookings (src/data/bookingsData.js)
 * - evOwnerStationsData (src/data/ownerStationsData.js)
 * - evStationReviews (src/data/reviewsData.js)
 * 
 * FRONTEND ONLY - NEVER creates independent evAnalytics/evRevenue stores.
 */

import { getOwnerBookings, getOwnerCustomers } from "./bookingsData";
import { getOwnerStations } from "./ownerStationsData";
import { getReviews, getOwnerReviews, calculateStationAggregate } from "./reviewsData";

const MS_PER_DAY = 86400000;

/**
 * Format any number into standard LKR currency string
 * e.g. 126450 -> "LKR 126,450"
 */
export function formatLKR(amount) {
  const num = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return `LKR ${num.toLocaleString("en-US")}`;
}

/**
 * Parses timestamp safely from booking fields
 */
export function getBookingTimestamp(booking) {
  if (!booking) return Date.now();
  const dateStr = booking.completedAt || booking.bookingDate || booking.createdAt;
  if (!dateStr) return Date.now();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

/**
 * Checks if a timestamp falls within the current date range
 */
export function isWithinDateRange(timestamp, rangeKey) {
  if (rangeKey === "all") return true;
  const days = rangeKey === "7d" ? 7 : rangeKey === "30d" ? 30 : rangeKey === "90d" ? 90 : 7;
  const now = Date.now();
  const cutoff = now - days * MS_PER_DAY;
  return timestamp >= cutoff;
}

/**
 * Checks if a timestamp falls within the previous equivalent comparison period
 */
export function isWithinPreviousDateRange(timestamp, rangeKey) {
  if (rangeKey === "all") return false;
  const days = rangeKey === "7d" ? 7 : rangeKey === "30d" ? 30 : rangeKey === "90d" ? 90 : 7;
  const now = Date.now();
  const cutoffCurrent = now - days * MS_PER_DAY;
  const cutoffPrevious = now - (days * 2) * MS_PER_DAY;
  return timestamp >= cutoffPrevious && timestamp < cutoffCurrent;
}

/**
 * Filters bookings by station and date range
 */
export function getFilteredBookings(allOwnerBookings, rangeKey = "7d", stationId = "All") {
  return allOwnerBookings.filter((b) => {
    // Station Filter
    if (stationId !== "All") {
      if (String(b.stationId) !== String(stationId)) {
        return false;
      }
    }
    // Date Range Filter
    const ts = getBookingTimestamp(b);
    return isWithinDateRange(ts, rangeKey);
  });
}

/**
 * Computes main KPI summary from derived operational data
 */
export function getAnalyticsSummary(rangeKey = "7d", stationId = "All") {
  const stations = getOwnerStations();
  const allOwnerBookings = getOwnerBookings(stations);

  // Current period bookings
  const currentBookings = getFilteredBookings(allOwnerBookings, rangeKey, stationId);

  // Previous period bookings (for trend comparison)
  const previousBookings = allOwnerBookings.filter((b) => {
    if (stationId !== "All" && String(b.stationId) !== String(stationId)) {
      return false;
    }
    const ts = getBookingTimestamp(b);
    return isWithinPreviousDateRange(ts, rangeKey);
  });

  // REALIZED REVENUE: strictly from Completed bookings
  const completedCurrent = currentBookings.filter((b) => b.status === "Completed");
  const totalRevenue = completedCurrent.reduce((sum, b) => {
    const val = typeof b.estimatedPrice === "number" ? b.estimatedPrice : Number(b.price) || 0;
    return sum + val;
  }, 0);

  const completedPrevious = previousBookings.filter((b) => b.status === "Completed");
  const previousRevenue = completedPrevious.reduce((sum, b) => {
    const val = typeof b.estimatedPrice === "number" ? b.estimatedPrice : Number(b.price) || 0;
    return sum + val;
  }, 0);

  // COMPLETED SESSIONS
  const completedSessions = completedCurrent.length;
  const previousSessions = completedPrevious.length;

  // ENERGY DELIVERED
  const energyDeliveries = completedCurrent.filter(
    (b) => typeof b.estimatedEnergy === "number" && b.estimatedEnergy > 0
  );
  const totalEnergy = energyDeliveries.reduce(
    (sum, b) => sum + (Number(b.estimatedEnergy) || 0),
    0
  );
  const hasEnergyData = energyDeliveries.length > 0;

  // AVERAGE SESSION VALUE
  const averageSessionValue =
    completedSessions > 0 ? Math.round(totalRevenue / completedSessions) : 0;
  const previousAvgSession =
    previousSessions > 0 ? Math.round(previousRevenue / previousSessions) : 0;

  // ACTIVE CUSTOMERS (from owner customer derivation)
  const customers = getOwnerCustomers(stations);
  const filteredCustomers = stationId === "All"
    ? customers
    : customers.filter((c) => c.stationsUsed.includes(Number(stationId)) || c.stationsUsed.includes(String(stationId)));

  const activeCustomersCount = filteredCustomers.filter((c) => c.isActiveCustomer).length;

  // COMPLETION RATE: Completed / (Completed + Cancelled)
  const cancelledCurrent = currentBookings.filter((b) => b.status === "Cancelled").length;
  const totalFinalized = completedSessions + cancelledCurrent;
  const completionRate = totalFinalized > 0 ? Math.round((completedSessions / totalFinalized) * 100) : 100;

  // SAFE PERCENTAGE CHANGES (only when meaningful baseline exists)
  const calcChange = (cur, prev) => {
    if (rangeKey === "all" || !prev || prev === 0) return null;
    const diff = cur - prev;
    return Number(((diff / prev) * 100).toFixed(1));
  };

  return {
    totalRevenue,
    formattedRevenue: formatLKR(totalRevenue),
    revenueChange: calcChange(totalRevenue, previousRevenue),
    completedSessions,
    sessionsChange: calcChange(completedSessions, previousSessions),
    totalEnergy,
    hasEnergyData,
    formattedEnergy: hasEnergyData ? `${totalEnergy.toLocaleString("en-US")} kWh` : "Not available",
    averageSessionValue,
    formattedAverageSession: formatLKR(averageSessionValue),
    averageSessionChange: calcChange(averageSessionValue, previousAvgSession),
    activeCustomersCount,
    totalCustomersCount: filteredCustomers.length,
    completionRate,
    totalBookingsInPeriod: currentBookings.length,
    cancelledSessions: cancelledCurrent,
  };
}

/**
 * Builds time-series trends (Revenue & Sessions)
 * Generates continuous interval buckets according to dateRange
 */
export function getTimelineTrends(rangeKey = "7d", stationId = "All") {
  const stations = getOwnerStations();
  const allOwnerBookings = getOwnerBookings(stations);
  const filteredBookings = getFilteredBookings(allOwnerBookings, rangeKey, stationId);
  const completedBookings = filteredBookings.filter((b) => b.status === "Completed");

  const now = new Date();
  const buckets = [];

  if (rangeKey === "7d") {
    // 7 Daily buckets
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * MS_PER_DAY);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
      buckets.push({ dateKey: dateStr, label, revenue: 0, sessions: 0, energy: 0 });
    }
  } else if (rangeKey === "30d") {
    // 10 3-day buckets or 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * MS_PER_DAY);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      buckets.push({ dateKey: dateStr, label, revenue: 0, sessions: 0, energy: 0 });
    }
  } else if (rangeKey === "90d") {
    // 12 Weekly buckets
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * MS_PER_DAY);
      const dateStr = d.toISOString().split("T")[0];
      const label = `W${12 - i} (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
      buckets.push({ dateKey: dateStr, isWeek: true, weekStart: d.getTime() - 7 * MS_PER_DAY, weekEnd: d.getTime(), label, revenue: 0, sessions: 0, energy: 0 });
    }
  } else {
    // All Time: 6 monthly intervals
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      buckets.push({ dateKey: monthStr, isMonth: true, label, revenue: 0, sessions: 0, energy: 0 });
    }
  }

  // Aggregate completed sessions into buckets
  for (const b of completedBookings) {
    const ts = getBookingTimestamp(b);
    const bDate = new Date(ts);
    const bDateStr = bDate.toISOString().split("T")[0];
    const bMonthStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, "0")}`;
    const price = typeof b.estimatedPrice === "number" ? b.estimatedPrice : Number(b.price) || 0;
    const energy = typeof b.estimatedEnergy === "number" ? b.estimatedEnergy : 0;

    for (const bucket of buckets) {
      let matched = false;
      if (bucket.isMonth) {
        if (bucket.dateKey === bMonthStr) matched = true;
      } else if (bucket.isWeek) {
        if (ts >= bucket.weekStart && ts <= bucket.weekEnd) matched = true;
      } else {
        if (bucket.dateKey === bDateStr) matched = true;
      }

      if (matched) {
        bucket.revenue += price;
        bucket.sessions += 1;
        bucket.energy += energy;
        break;
      }
    }
  }

  return buckets;
}

/**
 * Computes booking status breakdown for donut chart or status bars
 */
export function getBookingStatusDistribution(rangeKey = "7d", stationId = "All") {
  const stations = getOwnerStations();
  const allOwnerBookings = getOwnerBookings(stations);
  const bookings = getFilteredBookings(allOwnerBookings, rangeKey, stationId);
  const total = bookings.length;

  const counts = {
    Completed: 0,
    Active: 0,
    Confirmed: 0,
    Pending: 0,
    Cancelled: 0,
  };

  for (const b of bookings) {
    const st = b.status || "Pending";
    if (counts[st] !== undefined) {
      counts[st] += 1;
    } else {
      counts.Pending += 1;
    }
  }

  const items = [
    { status: "Completed", label: "Completed", count: counts.Completed, color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
    { status: "Active", label: "Active Session", count: counts.Active, color: "#059669", bg: "rgba(5, 150, 105, 0.15)" },
    { status: "Confirmed", label: "Confirmed", count: counts.Confirmed, color: "#2563eb", bg: "rgba(37, 99, 235, 0.15)" },
    { status: "Pending", label: "Pending", count: counts.Pending, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
    { status: "Cancelled", label: "Cancelled", count: counts.Cancelled, color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
  ];

  return items.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));
}

/**
 * Computes station performance metrics and ranks owner stations
 */
export function getStationPerformanceMetrics(rangeKey = "7d") {
  const stations = getOwnerStations();
  const allOwnerBookings = getOwnerBookings(stations);
  const reviews = getReviews();

  const metrics = stations.map((st) => {
    // Bookings for this station in period
    const stBookings = getFilteredBookings(allOwnerBookings, rangeKey, st.id);
    const completed = stBookings.filter((b) => b.status === "Completed");

    const revenue = completed.reduce((sum, b) => {
      const val = typeof b.estimatedPrice === "number" ? b.estimatedPrice : Number(b.price) || 0;
      return sum + val;
    }, 0);

    const energy = completed.reduce((sum, b) => sum + (Number(b.estimatedEnergy) || 0), 0);

    // Chargers
    const totalChargers = Array.isArray(st.individualChargers)
      ? st.individualChargers.length
      : st.totalChargers || 0;
    const availableChargers = Array.isArray(st.individualChargers)
      ? st.individualChargers.filter((c) => c.status === "Available").length
      : st.availableChargers || 0;

    // Rating from canonical reviews synchronized
    const stReviews = reviews.filter(
      (r) => Number(r.stationId) === Number(st.id) || r.stationName?.toLowerCase() === st.name?.toLowerCase()
    );
    const aggregate = calculateStationAggregate(st, stReviews);

    return {
      id: st.id,
      name: st.name,
      address: st.address || "Sri Lanka",
      image: st.image,
      completedSessions: completed.length,
      revenue,
      formattedRevenue: formatLKR(revenue),
      energy,
      totalChargers,
      availableChargers,
      utilizationRate: totalChargers > 0 ? Math.round(((totalChargers - availableChargers) / totalChargers) * 100) : 0,
      rating: aggregate.rating,
      reviewsCount: aggregate.reviews,
      individualReviews: stReviews.length,
    };
  });

  // Rank by Revenue (descending), then by completed sessions
  metrics.sort((a, b) => {
    if (b.revenue !== a.revenue) return b.revenue - a.revenue;
    return b.completedSessions - a.completedSessions;
  });

  return metrics.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

/**
 * Hardware distribution across owner stations
 * Accurately labeled as "Current Charger Status"
 */
export function getCurrentChargerStatus(stationId = "All") {
  const stations = getOwnerStations();
  const relevantStations = stationId === "All"
    ? stations
    : stations.filter((st) => String(st.id) === String(stationId));

  const allChargers = relevantStations.flatMap((st) => st.individualChargers || []);
  const total = allChargers.length;

  const counts = {
    Available: 0,
    "In Use": 0,
    Maintenance: 0,
    Offline: 0,
  };

  for (const c of allChargers) {
    const st = c.status || "Available";
    if (counts[st] !== undefined) {
      counts[st] += 1;
    } else {
      counts.Available += 1;
    }
  }

  return {
    total,
    available: counts.Available,
    inUse: counts["In Use"],
    maintenance: counts.Maintenance,
    offline: counts.Offline,
    availablePct: total > 0 ? Math.round((counts.Available / total) * 100) : 0,
    inUsePct: total > 0 ? Math.round((counts["In Use"] / total) * 100) : 0,
    maintenancePct: total > 0 ? Math.round((counts.Maintenance / total) * 100) : 0,
    offlinePct: total > 0 ? Math.round((counts.Offline / total) * 100) : 0,
  };
}

/**
 * Derives Customer Insights consistent with OwnerCustomers
 */
export function getCustomerAnalytics(stationId = "All") {
  const stations = getOwnerStations();
  const customers = getOwnerCustomers(stations);

  const filtered = stationId === "All"
    ? customers
    : customers.filter((c) => c.stationsUsed.includes(Number(stationId)) || c.stationsUsed.includes(String(stationId)));

  const total = filtered.length;
  const returning = filtered.filter((c) => c.isReturning).length;
  const active = filtered.filter((c) => c.isActiveCustomer).length;
  const newCust = filtered.filter((c) => !c.isReturning).length;

  return {
    total,
    returning,
    active,
    newCust,
    returningPercentage: total > 0 ? Math.round((returning / total) * 100) : 0,
  };
}

/**
 * Derives Customer Satisfaction from canonical evStationReviews
 */
export function getReviewAnalytics(stationId = "All") {
  const stations = getOwnerStations();
  const ownerReviews = getOwnerReviews(stations);

  const filtered = stationId === "All"
    ? ownerReviews
    : ownerReviews.filter((r) => String(r.stationId) === String(stationId));

  const total = filtered.length;
  if (total === 0) {
    return {
      overallRating: 5.0,
      totalReviews: 0,
      fiveStarPercentage: 100,
      responseRate: 100,
    };
  }

  const sum = filtered.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
  const overallRating = Number((sum / total).toFixed(1));
  const fiveStars = filtered.filter((r) => Math.round(r.rating) === 5).length;
  const fiveStarPercentage = Math.round((fiveStars / total) * 100);

  const replied = filtered.filter((r) => Boolean(r.ownerReply)).length;
  const responseRate = Math.round((replied / total) * 100);

  return {
    overallRating,
    totalReviews: total,
    fiveStarPercentage,
    responseRate,
  };
}

/**
 * Network Summary overview numbers
 */
export function getNetworkSummary() {
  const stations = getOwnerStations();
  const allBookings = getOwnerBookings(stations);
  const reviews = getOwnerReviews(stations);
  const customers = getOwnerCustomers(stations);

  const totalChargers = stations.reduce(
    (acc, st) => acc + (st.individualChargers?.length || st.totalChargers || 0),
    0
  );
  const completedSessions = allBookings.filter((b) => b.status === "Completed").length;

  return {
    stationsCount: stations.length,
    chargersCount: totalChargers,
    customersCount: customers.length,
    reviewsCount: reviews.length,
    completedSessions,
  };
}

/**
 * Generates and triggers download of CSV report
 */
export function exportAnalyticsToCSV(rangeKey, stationId, summary, stationMetrics) {
  const rangeLabels = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    all: "All Time",
  };
  const selectedPeriod = rangeLabels[rangeKey] || rangeKey;
  const selectedStationName = stationId === "All" ? "All Owner Stations" : `Station #${stationId}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  let csv = "EVChargeHub - Station Owner Analytics & Revenue Report\r\n";
  csv += `Exported At,${new Date().toLocaleString("en-US")}\r\n`;
  csv += `Date Range,${selectedPeriod}\r\n`;
  csv += `Station Filter,${selectedStationName}\r\n`;
  csv += `\r\n`;

  // SECTION 1: KEY PERFORMANCE INDICATORS
  csv += `KEY PERFORMANCE INDICATORS\r\n`;
  csv += `Metric,Value\r\n`;
  csv += `Total Realized Revenue,${summary.formattedRevenue}\r\n`;
  csv += `Completed Sessions,${summary.completedSessions}\r\n`;
  csv += `Energy Delivered,${summary.formattedEnergy}\r\n`;
  csv += `Average Session Value,${summary.formattedAverageSession}\r\n`;
  csv += `Active Customers,${summary.activeCustomersCount}\r\n`;
  csv += `Completion Rate,${summary.completionRate}%\r\n`;
  csv += `Total Bookings in Period,${summary.totalBookingsInPeriod}\r\n`;
  csv += `Cancelled Sessions,${summary.cancelledSessions}\r\n`;
  csv += `\r\n`;

  // SECTION 2: STATION PERFORMANCE BREAKDOWN
  csv += `STATION PERFORMANCE BREAKDOWN\r\n`;
  csv += `Rank,Station Name,Completed Sessions,Revenue (LKR),Available Chargers,Total Chargers,Average Rating,Reviews Count\r\n`;
  for (const st of stationMetrics) {
    const cleanName = `"${st.name.replace(/"/g, '""')}"`;
    csv += `${st.rank},${cleanName},${st.completedSessions},${st.revenue},${st.availableChargers},${st.totalChargers},${st.rating},${st.reviewsCount}\r\n`;
  }
  csv += `\r\n`;

  // Trigger download in browser
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `evchargehub-analytics-${rangeKey}-${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
