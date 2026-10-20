/**
 * EVChargeHub Centralized Bookings Data & Lifecycle Utilities
 * Shared between User Portal and Station Owner Portal
 * Single Source of Truth: localStorage key "evBookings"
 */

export const BOOKINGS_STORAGE_KEY = "evBookings";

// Helper for today's date formatted as YYYY-MM-DD
const getTodayDateString = () => new Date().toISOString().split("T")[0];

export const initialBookings = [
  {
    bookingId: "EVH-802101",
    userId: "usr_01",
    customerName: "Hareen Janith",
    customerEmail: "hareen.janith@example.com",
    customerPhone: "+94 77 123 4567",
    stationId: 1,
    ownerId: "owner_01",
    stationName: "University of Ruhuna Charging Station",
    chargerId: "CP-001",
    chargerName: "Bay 01 - Supercharger",
    connectorType: "CCS",
    chargingPower: 150,
    bookingDate: getTodayDateString(),
    startTime: "10:30 AM",
    duration: "45 mins",
    vehicleName: "Tesla Model 3",
    pricePerKwh: 85,
    estimatedEnergy: 42,
    estimatedPrice: 3570,
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    confirmedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    station: {
      id: 1,
      name: "University of Ruhuna Charging Station",
      address: "Hapugala, Galle, Sri Lanka",
      pricePerKwh: 85,
    },
    charger: {
      id: "CP-001",
      name: "Bay 01 - Supercharger",
      connector: "CCS",
      power: 150,
      status: "Available",
    },
    vehicle: {
      id: 1,
      name: "Tesla Model 3",
      connector: "CCS",
    },
    date: {
      value: getTodayDateString(),
      day: "Today",
    },
    time: "10:30 AM",
  },
  {
    bookingId: "EVH-802102",
    userId: "usr_02",
    customerName: "Kasun Perera",
    customerEmail: "kasun.perera@example.com",
    customerPhone: "+94 71 987 6543",
    stationId: 1,
    ownerId: "owner_01",
    stationName: "University of Ruhuna Charging Station",
    chargerId: "CP-002",
    chargerName: "Bay 02 - Supercharger",
    connectorType: "CCS",
    chargingPower: 150,
    bookingDate: getTodayDateString(),
    startTime: "11:45 AM",
    duration: "30 mins",
    vehicleName: "BYD Atto 3",
    pricePerKwh: 85,
    estimatedEnergy: 35,
    estimatedPrice: 2975,
    status: "Confirmed",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    confirmedAt: new Date(Date.now() - 5400000).toISOString(),
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    station: {
      id: 1,
      name: "University of Ruhuna Charging Station",
      address: "Hapugala, Galle, Sri Lanka",
      pricePerKwh: 85,
    },
    charger: {
      id: "CP-002",
      name: "Bay 02 - Supercharger",
      connector: "CCS",
      power: 150,
      status: "Available",
    },
    vehicle: {
      id: 2,
      name: "BYD Atto 3",
      connector: "CCS",
    },
    date: {
      value: getTodayDateString(),
      day: "Today",
    },
    time: "11:45 AM",
  },
  {
    bookingId: "EVH-802103",
    userId: "usr_03",
    customerName: "Nimal Fernando",
    customerEmail: "nimal.fernando@example.com",
    customerPhone: "+94 76 555 4321",
    stationId: 1,
    ownerId: "owner_01",
    stationName: "University of Ruhuna Charging Station",
    chargerId: "CP-004",
    chargerName: "Bay 04 - Supercharger",
    connectorType: "CCS",
    chargingPower: 150,
    bookingDate: getTodayDateString(),
    startTime: "09:15 AM",
    duration: "60 mins",
    vehicleName: "Hyundai Ioniq 5",
    pricePerKwh: 85,
    estimatedEnergy: 50,
    estimatedPrice: 4250,
    status: "Active",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    confirmedAt: new Date(Date.now() - 9000000).toISOString(),
    startedAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    completedAt: null,
    cancelledAt: null,
    station: {
      id: 1,
      name: "University of Ruhuna Charging Station",
      address: "Hapugala, Galle, Sri Lanka",
      pricePerKwh: 85,
    },
    charger: {
      id: "CP-004",
      name: "Bay 04 - Supercharger",
      connector: "CCS",
      power: 150,
      status: "In Use",
    },
    vehicle: {
      id: 3,
      name: "Hyundai Ioniq 5",
      connector: "CCS",
    },
    date: {
      value: getTodayDateString(),
      day: "Today",
    },
    time: "09:15 AM",
  },
  {
    bookingId: "EVH-802104",
    userId: "usr_04",
    customerName: "Anusha Jayasinghe",
    customerEmail: "anusha.j@example.com",
    customerPhone: "+94 70 234 5678",
    stationId: 2,
    ownerId: "owner_01",
    stationName: "Matara City Charging Hub",
    chargerId: "CP-201",
    chargerName: "Bay 01 - Ultra Fast",
    connectorType: "CCS",
    chargingPower: 120,
    bookingDate: getTodayDateString(),
    startTime: "08:00 AM",
    duration: "45 mins",
    vehicleName: "MG ZS EV",
    pricePerKwh: 90,
    estimatedEnergy: 40,
    estimatedPrice: 3600,
    status: "Completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    confirmedAt: new Date(Date.now() - 80000000).toISOString(),
    startedAt: new Date(Date.now() - 14400000).toISOString(),
    completedAt: new Date(Date.now() - 10800000).toISOString(),
    cancelledAt: null,
    station: {
      id: 2,
      name: "Matara City Charging Hub",
      address: "Matara City Centre, Matara, Sri Lanka",
      pricePerKwh: 90,
    },
    charger: {
      id: "CP-201",
      name: "Bay 01 - Ultra Fast",
      connector: "CCS",
      power: 120,
      status: "Available",
    },
    vehicle: {
      id: 4,
      name: "MG ZS EV",
      connector: "CCS",
    },
    date: {
      value: getTodayDateString(),
      day: "Today",
    },
    time: "08:00 AM",
  },
  {
    bookingId: "EVH-802105",
    userId: "usr_05",
    customerName: "Dilshan Silva",
    customerEmail: "dilshan.silva@example.com",
    customerPhone: "+94 72 444 3322",
    stationId: 3,
    ownerId: "owner_01",
    stationName: "Green Charge Matara",
    chargerId: "CP-303",
    chargerName: "Bay 03 - Green AC",
    connectorType: "Type 2",
    chargingPower: 22,
    bookingDate: getTodayDateString(),
    startTime: "01:30 PM",
    duration: "60 mins",
    vehicleName: "Nissan Leaf",
    pricePerKwh: 80,
    estimatedEnergy: 20,
    estimatedPrice: 1600,
    status: "Cancelled",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    confirmedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: new Date(Date.now() - 7200000).toISOString(),
    station: {
      id: 3,
      name: "Green Charge Matara",
      address: "Nupe Junction, Matara, Sri Lanka",
      pricePerKwh: 80,
    },
    charger: {
      id: "CP-303",
      name: "Bay 03 - Green AC",
      connector: "Type 2",
      power: 22,
      status: "Available",
    },
    vehicle: {
      id: 5,
      name: "Nissan Leaf",
      connector: "Type 2",
    },
    date: {
      value: getTodayDateString(),
      day: "Today",
    },
    time: "01:30 PM",
  },
];

/**
 * Normalizes any booking record to ensure consistent fields for both User and Owner views.
 * Preserves all existing properties to guarantee 100% backward compatibility.
 */
export function normalizeBooking(booking, ownerStations = []) {
  if (!booking) return booking;

  // Resolve station details
  const rawStation = booking.station || {};
  let resolvedStationId = booking.stationId || rawStation.id;

  // If stationId missing, try matching station name with ownerStations
  if (!resolvedStationId && ownerStations.length > 0) {
    const sName = (booking.stationName || rawStation.name || "").toLowerCase();
    const matched = ownerStations.find((st) => st.name.toLowerCase() === sName);
    if (matched) resolvedStationId = matched.id;
  }

  const resolvedStationName =
    booking.stationName || rawStation.name || "Charging Station";

  // Resolve charger details
  const rawCharger = booking.charger || {};
  const resolvedChargerId = booking.chargerId || rawCharger.id || "CP-001";
  const resolvedChargerName =
    booking.chargerName || rawCharger.name || "Charger 01";
  const resolvedConnector =
    booking.connectorType ||
    rawCharger.connectorType ||
    rawCharger.connector ||
    "CCS";
  const resolvedPower =
    booking.chargingPower ||
    (typeof rawCharger.power === "string"
      ? parseInt(rawCharger.power.replace(/[^\d]/g, ""), 10)
      : rawCharger.power) ||
    150;

  // Resolve customer details
  const resolvedCustomer =
    booking.customerName || booking.customer || "EV Driver";
  const resolvedEmail = booking.customerEmail || null;
  const resolvedPhone = booking.customerPhone || null;

  // Normalize date
  let resolvedDate = booking.bookingDate;
  if (!resolvedDate) {
    if (booking.date && typeof booking.date === "object") {
      resolvedDate = booking.date.value || getTodayDateString();
    } else if (typeof booking.date === "string") {
      resolvedDate = booking.date === "Today" ? getTodayDateString() : booking.date;
    } else {
      resolvedDate = getTodayDateString();
    }
  }

  // Normalize time
  const resolvedTime = booking.startTime || booking.time || "10:00 AM";

  // Normalize lifecycle status
  let resolvedStatus = booking.status || "Pending";
  if (resolvedStatus === "Upcoming") resolvedStatus = "Confirmed";
  if (resolvedStatus === "Charging") resolvedStatus = "Active";

  const priceVal =
    booking.estimatedPrice !== undefined
      ? booking.estimatedPrice
      : typeof booking.price === "string"
      ? parseInt(booking.price.replace(/[^\d]/g, ""), 10) || 3500
      : booking.price || 3500;

  return {
    ...booking,
    bookingId: booking.bookingId || booking.id || "EVH-000000",
    userId: booking.userId || "usr_guest",
    customerName: resolvedCustomer,
    customerEmail: resolvedEmail,
    customerPhone: resolvedPhone,
    stationId: resolvedStationId,
    ownerId: booking.ownerId || "owner_01",
    stationName: resolvedStationName,
    chargerId: resolvedChargerId,
    chargerName: resolvedChargerName,
    connectorType: resolvedConnector,
    chargingPower: resolvedPower,
    bookingDate: resolvedDate,
    startTime: resolvedTime,
    duration: booking.duration || "45 mins",
    vehicleName: booking.vehicleName || booking.vehicle?.name || "EV Vehicle",
    pricePerKwh: booking.pricePerKwh || rawStation.pricePerKwh || 85,
    estimatedEnergy: booking.estimatedEnergy || 40,
    estimatedPrice: priceVal,
    status: resolvedStatus,
    createdAt: booking.createdAt || new Date().toISOString(),
    confirmedAt: booking.confirmedAt || null,
    startedAt: booking.startedAt || null,
    completedAt: booking.completedAt || null,
    cancelledAt: booking.cancelledAt || null,
    // Preserve nested structures for existing user pages
    station: {
      ...rawStation,
      id: resolvedStationId,
      name: resolvedStationName,
    },
    charger: {
      ...rawCharger,
      id: resolvedChargerId,
      name: resolvedChargerName,
      connector: resolvedConnector,
      power: resolvedPower,
    },
    vehicle: {
      ...(booking.vehicle && typeof booking.vehicle === "object"
        ? booking.vehicle
        : {}),
      name: booking.vehicleName || booking.vehicle?.name || "EV Vehicle",
    },
    date:
      booking.date && typeof booking.date === "object"
        ? booking.date
        : { value: resolvedDate, day: "Today" },
    time: resolvedTime,
  };
}

/**
 * Loads all bookings from localStorage key "evBookings".
 * Seeds with initial demo bookings if empty.
 */
export function getBookings(ownerStations = []) {
  let list;
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not parse evBookings:", e);
  }

  // Seed if empty
  if (!Array.isArray(list) || list.length === 0) {
    list = initialBookings;
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Could not seed evBookings:", e);
    }
  }

  return list.map((b) => normalizeBooking(b, ownerStations));
}

/**
 * Persists bookings array back to localStorage key "evBookings".
 */
export function saveBookings(bookingsList) {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookingsList));
  } catch (e) {
    console.error("Failed to save bookings to localStorage:", e);
  }
}

/**
 * Returns only bookings belonging to stations in the owner's portfolio.
 */
export function getOwnerBookings(ownerStations = []) {
  const all = getBookings(ownerStations);
  if (!ownerStations || ownerStations.length === 0) return all;

  const ownerStationIds = new Set(ownerStations.map((st) => String(st.id)));
  const ownerStationNames = new Set(
    ownerStations.map((st) => st.name.toLowerCase().trim())
  );

  return all.filter((b) => {
    if (b.stationId && ownerStationIds.has(String(b.stationId))) {
      return true;
    }
    if (b.stationName && ownerStationNames.has(b.stationName.toLowerCase().trim())) {
      return true;
    }
    return false;
  });
}

/**
 * Formats a date string into readable "Mon DD, YYYY" format.
 */
export function formatCustomerDate(dateStr) {
  if (!dateStr) return "Not available";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * DERIVED CUSTOMER CONCEPT
 * Single source of truth: evBookings -> owner-relevant bookings -> grouped customers.
 * Does NOT create a separate evCustomers store.
 */
export function getOwnerCustomers(ownerStations = []) {
  const bookings = getOwnerBookings(ownerStations);
  if (!bookings || bookings.length === 0) return [];

  const groups = [];

  for (const b of bookings) {
    const rawUserId =
      b.userId && b.userId !== "usr_guest" ? String(b.userId).trim() : null;
    const rawEmail =
      b.customerEmail &&
      typeof b.customerEmail === "string" &&
      b.customerEmail.includes("@")
        ? b.customerEmail.trim().toLowerCase()
        : null;
    const rawPhone =
      b.customerPhone &&
      typeof b.customerPhone === "string" &&
      b.customerPhone.trim()
        ? b.customerPhone.trim()
        : null;
    const cleanPhoneDigits = rawPhone ? rawPhone.replace(/\D/g, "") : null;
    const rawName = (b.customerName || b.customer || "").trim();

    // Match against existing groups
    let match = null;
    for (const g of groups) {
      if (rawUserId && g.userId && g.userId === rawUserId) {
        match = g;
        break;
      }
      if (rawEmail && g.email && g.email.toLowerCase() === rawEmail) {
        match = g;
        break;
      }
      if (
        cleanPhoneDigits &&
        cleanPhoneDigits.length >= 7 &&
        g.cleanPhone &&
        g.cleanPhone === cleanPhoneDigits
      ) {
        match = g;
        break;
      }
    }

    if (match) {
      match.bookings.push(b);
      if (!match.userId && rawUserId) match.userId = rawUserId;
      if (!match.email && rawEmail) match.email = rawEmail;
      if (!match.phone && rawPhone) {
        match.phone = rawPhone;
        match.cleanPhone = cleanPhoneDigits;
      }
      if ((!match.name || match.name === "EV Driver") && rawName) {
        match.name = rawName;
      }
    } else {
      let cId;
      if (rawUserId) {
        cId = rawUserId;
      } else if (rawEmail) {
        cId = rawEmail.replace(/[^a-z0-9_-]/g, "_");
      } else if (cleanPhoneDigits && cleanPhoneDigits.length >= 7) {
        cId = `cust_phone_${cleanPhoneDigits}`;
      } else if (rawName) {
        cId = `cust_legacy_${rawName.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`;
      } else {
        cId = `cust_${b.bookingId || Math.random().toString(36).slice(2, 8)}`;
      }

      groups.push({
        customerId: cId,
        userId: rawUserId,
        email: rawEmail,
        phone: rawPhone,
        cleanPhone: cleanPhoneDigits,
        name: rawName || "EV Driver",
        bookings: [b],
      });
    }
  }

  // Derive full profiles for each customer
  const customers = groups.map((g) => {
    // Sort bookings descending by activity date
    const sortedBookings = [...g.bookings].sort((a, b) => {
      const timeA = new Date(
        a.completedAt || a.startedAt || a.confirmedAt || a.bookingDate || a.createdAt || 0
      ).getTime();
      const timeB = new Date(
        b.completedAt || b.startedAt || b.confirmedAt || b.bookingDate || b.createdAt || 0
      ).getTime();
      return timeB - timeA;
    });

    const totalBookings = sortedBookings.length;
    const completedBookings = sortedBookings.filter((b) => b.status === "Completed");
    const completedSessions = completedBookings.length;
    const activeBookings = sortedBookings.filter((b) => b.status === "Active").length;
    const pendingBookings = sortedBookings.filter((b) => b.status === "Pending").length;
    const confirmedBookings = sortedBookings.filter((b) => b.status === "Confirmed").length;
    const cancelledBookings = sortedBookings.filter((b) => b.status === "Cancelled").length;

    // Total spent: strictly from completed sessions
    const totalSpent = completedBookings.reduce((sum, b) => {
      const price =
        typeof b.estimatedPrice === "number"
          ? b.estimatedPrice
          : Number(b.price) || 0;
      return sum + price;
    }, 0);

    // Total energy: strictly from completed sessions
    const completedWithEnergy = completedBookings.filter(
      (b) => typeof b.estimatedEnergy === "number" && b.estimatedEnergy > 0
    );
    const totalEnergy = completedWithEnergy.reduce(
      (sum, b) => sum + (Number(b.estimatedEnergy) || 0),
      0
    );
    const hasEnergyData = completedWithEnergy.length > 0;

    // First and last visit
    const earliestBooking = [...sortedBookings].sort((a, b) => {
      const timeA = new Date(a.bookingDate || a.createdAt || 0).getTime();
      const timeB = new Date(b.bookingDate || b.createdAt || 0).getTime();
      return timeA - timeB;
    })[0];
    const latestBooking = sortedBookings[0];

    // Most used / favourite station
    const stationCounts = {};
    const stationIdMap = {};
    for (const b of sortedBookings) {
      const sName = b.stationName || "Unknown Station";
      stationCounts[sName] = (stationCounts[sName] || 0) + 1;
      if (b.stationId) stationIdMap[sName] = b.stationId;
    }
    let favouriteStation = null;
    let maxCount = 0;
    for (const [sName, count] of Object.entries(stationCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favouriteStation = {
          name: sName,
          count,
          stationId: stationIdMap[sName] || null,
        };
      }
    }

    // Active customer: customer with a Pending, Confirmed or Active booking
    const isActiveCustomer =
      pendingBookings > 0 || confirmedBookings > 0 || activeBookings > 0;
    const hasActiveSession = activeBookings > 0;
    const isReturning = totalBookings > 1;

    // Customer Type badge: Returning Customer vs New Customer
    const customerType = isReturning ? "Returning Customer" : "New Customer";

    // Unique stations used
    const stationsUsed = [
      ...new Set(sortedBookings.map((b) => b.stationId).filter(Boolean)),
    ];

    return {
      customerId: g.customerId,
      userId: g.userId,
      name: g.name,
      email: g.email || null,
      phone: g.phone || null,
      totalBookings,
      completedSessions,
      activeBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalSpent,
      totalEnergy,
      hasEnergyData,
      firstVisit: earliestBooking?.bookingDate || earliestBooking?.createdAt || null,
      lastVisit: latestBooking?.bookingDate || latestBooking?.createdAt || null,
      lastBookingStatus: latestBooking?.status || "Unknown",
      favouriteStation,
      isActiveCustomer,
      hasActiveSession,
      isReturning,
      customerType,
      stationsUsed,
      bookings: sortedBookings,
    };
  });

  // Sort customers descending by total bookings, then by latest visit
  return customers.sort((a, b) => {
    if (b.totalBookings !== a.totalBookings) {
      return b.totalBookings - a.totalBookings;
    }
    const timeA = new Date(a.lastVisit || 0).getTime();
    const timeB = new Date(b.lastVisit || 0).getTime();
    return timeB - timeA;
  });
}

/**
 * Retrieves derived profile for an individual customer by customerId.
 */
export function getCustomerDetails(customerId, ownerStations = []) {
  if (!customerId) return null;
  const customers = getOwnerCustomers(ownerStations);
  const targetId = String(customerId).trim().toLowerCase();

  return (
    customers.find(
      (c) =>
        String(c.customerId).toLowerCase() === targetId ||
        (c.userId && String(c.userId).toLowerCase() === targetId) ||
        (c.email && c.email.toLowerCase() === targetId)
    ) || null
  );
}

/**
 * Returns all bookings for a specific customer in owner's portfolio.
 */
export function getCustomerBookings(customerId, ownerStations = []) {
  const customer = getCustomerDetails(customerId, ownerStations);
  return customer ? customer.bookings : [];
}

/**
 * Returns aggregate metrics for an individual customer.
 */
export function getCustomerStats(customerId, ownerStations = []) {
  const customer = getCustomerDetails(customerId, ownerStations);
  if (!customer) return null;
  return {
    totalBookings: customer.totalBookings,
    completedSessions: customer.completedSessions,
    activeBookings: customer.activeBookings,
    cancelledBookings: customer.cancelledBookings,
    totalSpent: customer.totalSpent,
    totalEnergy: customer.totalEnergy,
    hasEnergyData: customer.hasEnergyData,
    favouriteStation: customer.favouriteStation,
    isReturning: customer.isReturning,
    isActiveCustomer: customer.isActiveCustomer,
  };
}
