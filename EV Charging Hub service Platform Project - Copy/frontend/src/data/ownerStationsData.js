import ruhunaImage from "../assets/station-ruhuna.jpg";
import mataraImage from "../assets/station-matara.jpg";
import southernImage from "../assets/station-southern.jpg";

export const initialOwnerStations = [
  {
    id: 1,
    ownerId: "owner_01",
    name: "University of Ruhuna Charging Station",
    description:
      "A flagship EV charging station providing ultra-fast DC charging facilities for EV drivers around Galle and the Southern expressway corridor.",
    address: "Hapugala, Galle, Sri Lanka",
    city: "Galle",
    district: "Galle",
    province: "Southern Province",
    postalCode: "80000",
    latitude: 6.0792,
    longitude: 80.1912,
    position: [6.0792, 80.1912],
    image: ruhunaImage,
    status: "Active",
    sourceType: "EVCHARGEHUB",
    stationType: "Workplace / Institution",
    totalChargers: 8,
    availableChargers: 6,
    connectorTypes: ["CCS", "Type 2"],
    maxPower: "150 kW",
    openingHours: "Open 24 Hours",
    isOpen24Hours: true,
    rating: 4.8,
    reviews: 124,
    todayBookings: 18,
    todayRevenue: "LKR 68,500",
    chargers: [
      { id: 1, connectorType: "CCS", power: "150 kW", totalPoints: 4, availablePoints: 3 },
      { id: 2, connectorType: "Type 2", power: "22 kW", totalPoints: 4, availablePoints: 3 },
    ],
    individualChargers: [
      { id: "CP-001", name: "Bay 01 - Supercharger", connectorType: "CCS", power: 150, status: "Available", pricePerKwh: 85, lastUpdated: "10 mins ago", stationId: 1 },
      { id: "CP-002", name: "Bay 02 - Supercharger", connectorType: "CCS", power: 150, status: "Available", pricePerKwh: 85, lastUpdated: "25 mins ago", stationId: 1 },
      { id: "CP-003", name: "Bay 03 - Supercharger", connectorType: "CCS", power: 150, status: "Available", pricePerKwh: 85, lastUpdated: "1 hr ago", stationId: 1 },
      { id: "CP-004", name: "Bay 04 - Supercharger", connectorType: "CCS", power: 150, status: "In Use", pricePerKwh: 85, lastUpdated: "5 mins ago", stationId: 1 },
      { id: "CP-005", name: "Bay 05 - AC Standard", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 85, lastUpdated: "15 mins ago", stationId: 1 },
      { id: "CP-006", name: "Bay 06 - AC Standard", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 85, lastUpdated: "40 mins ago", stationId: 1 },
      { id: "CP-007", name: "Bay 07 - AC Standard", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 85, lastUpdated: "2 hrs ago", stationId: 1 },
      { id: "CP-008", name: "Bay 08 - AC Standard", connectorType: "Type 2", power: 22, status: "In Use", pricePerKwh: 85, lastUpdated: "Just now", stationId: 1 },
    ],
    pricing: {
      pricePerKwh: 85,
      sessionFee: 0,
    },
    price: "LKR 85",
    pricePerKwh: 85,
    facilities: ["Restroom", "Parking", "Wi-Fi", "Cafe", "Waiting Area", "Security", "24/7 Support"],
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: 2,
    ownerId: "owner_01",
    name: "Matara City Charging Hub",
    description:
      "Centrally located multi-standard rapid charging hub in Matara City, catering to commercial vehicles, taxis, and long-distance travellers.",
    address: "Matara City Centre, Matara, Sri Lanka",
    city: "Matara",
    district: "Matara",
    province: "Southern Province",
    postalCode: "81000",
    latitude: 5.9485,
    longitude: 80.5353,
    position: [5.9485, 80.5353],
    image: mataraImage,
    status: "Active",
    sourceType: "EVCHARGEHUB",
    stationType: "Commercial Charging Hub",
    totalChargers: 10,
    availableChargers: 8,
    connectorTypes: ["CCS", "Type 2", "CHAdeMO"],
    maxPower: "120 kW",
    openingHours: "Open 24 Hours",
    isOpen24Hours: true,
    rating: 4.6,
    reviews: 89,
    todayBookings: 24,
    todayRevenue: "LKR 94,200",
    chargers: [
      { id: 1, connectorType: "CCS", power: "120 kW", totalPoints: 4, availablePoints: 3 },
      { id: 2, connectorType: "CHAdeMO", power: "60 kW", totalPoints: 2, availablePoints: 2 },
      { id: 3, connectorType: "Type 2", power: "22 kW", totalPoints: 4, availablePoints: 3 },
    ],
    individualChargers: [
      { id: "CP-201", name: "Bay 01 - Ultra Fast", connectorType: "CCS", power: 120, status: "Available", pricePerKwh: 90, lastUpdated: "12 mins ago", stationId: 2 },
      { id: "CP-202", name: "Bay 02 - Ultra Fast", connectorType: "CCS", power: 120, status: "Available", pricePerKwh: 90, lastUpdated: "30 mins ago", stationId: 2 },
      { id: "CP-203", name: "Bay 03 - Ultra Fast", connectorType: "CCS", power: 120, status: "Available", pricePerKwh: 90, lastUpdated: "1 hr ago", stationId: 2 },
      { id: "CP-204", name: "Bay 04 - Ultra Fast", connectorType: "CCS", power: 120, status: "In Use", pricePerKwh: 90, lastUpdated: "8 mins ago", stationId: 2 },
      { id: "CP-205", name: "Bay 05 - Rapid DC", connectorType: "CHAdeMO", power: 60, status: "Available", pricePerKwh: 90, lastUpdated: "20 mins ago", stationId: 2 },
      { id: "CP-206", name: "Bay 06 - Rapid DC", connectorType: "CHAdeMO", power: 60, status: "Available", pricePerKwh: 90, lastUpdated: "45 mins ago", stationId: 2 },
      { id: "CP-207", name: "Bay 07 - City AC", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 90, lastUpdated: "18 mins ago", stationId: 2 },
      { id: "CP-208", name: "Bay 08 - City AC", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 90, lastUpdated: "1 hr ago", stationId: 2 },
      { id: "CP-209", name: "Bay 09 - City AC", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 90, lastUpdated: "2 hrs ago", stationId: 2 },
      { id: "CP-210", name: "Bay 10 - City AC", connectorType: "Type 2", power: 22, status: "Maintenance", pricePerKwh: 90, lastUpdated: "Yesterday", stationId: 2 },
    ],
    pricing: {
      pricePerKwh: 90,
      sessionFee: 100,
    },
    price: "LKR 90",
    pricePerKwh: 90,
    facilities: ["Restroom", "Parking", "Wi-Fi", "Restaurant", "Shopping", "Waiting Area", "Wheelchair Accessible"],
    createdAt: "2026-02-01T09:30:00.000Z",
  },
  {
    id: 3,
    ownerId: "owner_01",
    name: "Green Charge Matara",
    description:
      "Eco-friendly solar-assisted charging facility at Nupe junction with comfortable waiting lounge and EV car-care accessories.",
    address: "Nupe Junction, Matara, Sri Lanka",
    city: "Matara",
    district: "Matara",
    province: "Southern Province",
    postalCode: "81000",
    latitude: 5.9525,
    longitude: 80.524,
    position: [5.9525, 80.524],
    image: southernImage,
    status: "Active",
    sourceType: "EVCHARGEHUB",
    stationType: "Public Charging Station",
    totalChargers: 6,
    availableChargers: 5,
    connectorTypes: ["Type 2", "CCS"],
    maxPower: "60 kW",
    openingHours: "06:00 AM - 11:00 PM",
    isOpen24Hours: false,
    rating: 4.7,
    reviews: 42,
    todayBookings: 9,
    todayRevenue: "LKR 42,750",
    chargers: [
      { id: 1, connectorType: "CCS", power: "60 kW", totalPoints: 2, availablePoints: 2 },
      { id: 2, connectorType: "Type 2", power: "22 kW", totalPoints: 4, availablePoints: 3 },
    ],
    individualChargers: [
      { id: "CP-301", name: "Bay 01 - Solar DC", connectorType: "CCS", power: 60, status: "Available", pricePerKwh: 80, lastUpdated: "14 mins ago", stationId: 3 },
      { id: "CP-302", name: "Bay 02 - Solar DC", connectorType: "CCS", power: 60, status: "Available", pricePerKwh: 80, lastUpdated: "35 mins ago", stationId: 3 },
      { id: "CP-303", name: "Bay 03 - Green AC", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 80, lastUpdated: "22 mins ago", stationId: 3 },
      { id: "CP-304", name: "Bay 04 - Green AC", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 80, lastUpdated: "1 hr ago", stationId: 3 },
      { id: "CP-305", name: "Bay 05 - Green AC", connectorType: "Type 2", power: 22, status: "Available", pricePerKwh: 80, lastUpdated: "3 hrs ago", stationId: 3 },
      { id: "CP-306", name: "Bay 06 - Green AC", connectorType: "Type 2", power: 22, status: "Offline", pricePerKwh: 80, lastUpdated: "2 days ago", stationId: 3 },
    ],
    pricing: {
      pricePerKwh: 80,
      sessionFee: 0,
    },
    price: "LKR 80",
    pricePerKwh: 80,
    facilities: ["Restroom", "Parking", "Wi-Fi", "Cafe", "Security"],
    createdAt: "2026-02-15T11:00:00.000Z",
  },
];

export const OWNER_STATIONS_STORAGE_KEY = "evOwnerStationsData";

/**
 * Normalizes station individual chargers from grouped configurations or demo data.
 * Safe migration strategy:
 * 1. If station already has individualChargers with valid entries, it reuses them directly.
 * 2. If individualChargers does not exist, it deterministically generates individual bay records
 *    from station.chargers (grouped configs) or from station.totalChargers.
 * 3. Never duplicates records across page loads.
 */
export function ensureStationIndividualChargers(station) {
  if (!station) return station;

  // If already normalized and non-empty, return station as-is
  if (Array.isArray(station.individualChargers) && station.individualChargers.length > 0) {
    return station;
  }

  const generated = [];
  const basePrice = station.pricePerKwh || station.pricing?.pricePerKwh || 85;
  let counter = 1;

  if (Array.isArray(station.chargers) && station.chargers.length > 0) {
    station.chargers.forEach((grp) => {
      const conn = grp.connectorType || "CCS";
      const pwr = typeof grp.power === "string"
        ? parseInt(grp.power.replace(/[^\d]/g, ""), 10) || 120
        : (grp.power || 120);
      const totalPts = grp.totalPoints || 1;
      const availPts = grp.availablePoints !== undefined ? grp.availablePoints : totalPts;

      for (let i = 0; i < totalPts; i++) {
        const isAvail = i < availPts;
        const status = isAvail ? "Available" : (i === totalPts - 1 && totalPts > 1 ? "In Use" : "Maintenance");
        const paddedId = String(counter).padStart(3, "0");
        const prefix = station.id ? `CP-${station.id}-` : "CP-";

        generated.push({
          id: `${prefix}${paddedId}`,
          name: `Bay ${String(counter).padStart(2, "0")} (${conn})`,
          connectorType: conn,
          power: pwr,
          status: status,
          pricePerKwh: basePrice,
          lastUpdated: "Recently",
          stationId: station.id,
        });
        counter++;
      }
    });
  } else {
    // Fallback if no grouped chargers exist
    const total = station.totalChargers || 4;
    const avail = station.availableChargers !== undefined ? station.availableChargers : total;
    const pwr = typeof station.maxPower === "string"
      ? parseInt(station.maxPower.replace(/[^\d]/g, ""), 10) || 120
      : (station.maxPower || 120);

    for (let i = 0; i < total; i++) {
      const isAvail = i < avail;
      const status = isAvail ? "Available" : "In Use";
      const paddedId = String(counter).padStart(3, "0");
      const prefix = station.id ? `CP-${station.id}-` : "CP-";

      generated.push({
        id: `${prefix}${paddedId}`,
        name: `Bay ${String(counter).padStart(2, "0")}`,
        connectorType: "CCS",
        power: pwr,
        status: status,
        pricePerKwh: basePrice,
        lastUpdated: "Recently",
        stationId: station.id,
      });
      counter++;
    }
  }

  return {
    ...station,
    individualChargers: generated,
  };
}

/**
 * Synchronizes parent station availability counts and grouped configs
 * based on the individualChargers array.
 */
export function syncStationAvailability(station) {
  if (!station || !Array.isArray(station.individualChargers)) {
    return station;
  }

  const individual = station.individualChargers;
  const total = individual.length;
  const available = individual.filter((c) => c.status === "Available").length;

  // Group individual chargers by connectorType to keep station.chargers in sync
  const groupMap = {};
  individual.forEach((c) => {
    const key = c.connectorType || "CCS";
    if (!groupMap[key]) {
      groupMap[key] = {
        connectorType: key,
        power: `${c.power} kW`,
        totalPoints: 0,
        availablePoints: 0,
      };
    }
    groupMap[key].totalPoints += 1;
    if (c.status === "Available") {
      groupMap[key].availablePoints += 1;
    }
  });

  const updatedChargers = Object.values(groupMap).map((g, idx) => ({
    id: idx + 1,
    ...g,
  }));

  const uniqueConnectors = [...new Set(individual.map((c) => c.connectorType).filter(Boolean))];

  return {
    ...station,
    totalChargers: total,
    availableChargers: available,
    connectorTypes: uniqueConnectors.length > 0 ? uniqueConnectors : station.connectorTypes,
    chargers: updatedChargers.length > 0 ? updatedChargers : station.chargers,
  };
}

/**
 * Loads owner stations from localStorage, ensuring all stations are normalized
 * with individual charger records.
 */
export function getOwnerStations() {
  let stations;
  try {
    const stored = localStorage.getItem(OWNER_STATIONS_STORAGE_KEY);
    stations = stored ? JSON.parse(stored) : initialOwnerStations;
  } catch {
    stations = initialOwnerStations;
  }

  // Ensure every station has individualChargers normalized
  let mutated = false;
  const normalized = stations.map((st) => {
    if (!st.individualChargers || st.individualChargers.length === 0) {
      mutated = true;
      return ensureStationIndividualChargers(st);
    }
    return st;
  });

  if (mutated) {
    try {
      localStorage.setItem(OWNER_STATIONS_STORAGE_KEY, JSON.stringify(normalized));
    } catch (e) {
      console.warn("Could not persist normalized stations:", e);
    }
  }

  return normalized;
}

export function saveOwnerStations(stations) {
  try {
    localStorage.setItem(OWNER_STATIONS_STORAGE_KEY, JSON.stringify(stations));
  } catch (e) {
    console.error("Failed to save owner stations:", e);
  }
}
