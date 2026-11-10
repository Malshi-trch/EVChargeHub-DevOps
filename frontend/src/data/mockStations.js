import ruhunaImage from "../assets/station-ruhuna.jpg";
import mataraImage from "../assets/station-matara.jpg";
import southernImage from "../assets/station-southern.jpg";

export const initialStations = [
  {
    id: 1,
    name: "University of Ruhuna Charging Station",
    address: "Hapugala, Galle, Sri Lanka",
    distance: "2.4 km",
    distanceValue: 2.4,
    power: "150 kW",
    powerValue: 150,
    connector: "CCS",
    available: 6,
    total: 8,
    rating: 4.8,
    reviews: 124,
    image: ruhunaImage,
    position: [5.9381, 80.5761],
    sourceType: "EVCHARGEHUB",
    price: "LKR 85",
    pricePerKwh: 85,
    priceUnit: "/ kWh",
    openingHours: "Open 24 Hours",
    description:
      "A modern EV charging station providing reliable fast charging facilities for EV drivers around Galle and the University of Ruhuna area.",
    chargers: [
      {
        id: 1,
        name: "Charger 01",
        connector: "CCS",
        power: 150,
        status: "Available",
      },
      {
        id: 2,
        name: "Charger 02",
        connector: "CCS",
        power: 150,
        status: "Available",
      },
      {
        id: 3,
        name: "Charger 03",
        connector: "Type 2",
        power: 22,
        status: "In Use",
      },
    ],
    facilities: [
      "Parking",
      "Restrooms",
      "Wi-Fi",
      "Cafe Nearby",
      "24/7 Access",
      "Security",
    ],
  },
  {
    id: 2,
    name: "Matara City Charging Hub",
    address: "Matara City Centre, Matara, Sri Lanka",
    distance: "4.1 km",
    distanceValue: 4.1,
    power: "120 kW",
    powerValue: 120,
    connector: "CCS",
    available: 3,
    total: 6,
    rating: 4.6,
    reviews: 89,
    image: mataraImage,
    position: [5.9549, 80.555],
    sourceType: "EVCHARGEHUB",
    price: "LKR 80",
    pricePerKwh: 80,
    priceUnit: "/ kWh",
    openingHours: "Open 24 Hours",
    description:
      "A convenient city charging hub offering fast and standard EV charging facilities for drivers travelling through Matara.",
    chargers: [
      {
        id: 1,
        name: "Charger 01",
        connector: "CCS",
        power: 120,
        status: "Available",
      },
      {
        id: 2,
        name: "Charger 02",
        connector: "CCS",
        power: 120,
        status: "In Use",
      },
      {
        id: 3,
        name: "Charger 03",
        connector: "Type 2",
        power: 22,
        status: "Available",
      },
    ],
    facilities: [
      "Parking",
      "Restrooms",
      "Food Nearby",
      "Security",
      "24/7 Access",
    ],
  },
  {
    id: 3,
    name: "Southern EV Charging Point",
    address: "Matara Road, Southern Province, Sri Lanka",
    distance: "6.8 km",
    distanceValue: 6.8,
    power: "60 kW",
    powerValue: 60,
    connector: "Type 2",
    available: null,
    total: null,
    rating: 4.3,
    reviews: 47,
    image: southernImage,
    position: [5.9475, 80.535],
    sourceType: "PUBLIC",
    price: "External",
    pricePerKwh: 0,
    priceUnit: "provider",
    openingHours: "Check Provider",
    description:
      "A public EV charging location. Basic station information is available through EVChargeHub, but online booking is not supported.",
    chargers: [
      {
        id: 1,
        name: "Public Charger",
        connector: "Type 2",
        power: 60,
        status: "Unknown",
      },
    ],
    facilities: ["Public Location", "Parking"],
  },
  {
    id: 4,
    name: "Green Charge Matara",
    address: "Nupe Junction, Matara, Sri Lanka",
    distance: "7.2 km",
    distanceValue: 7.2,
    power: "80 kW",
    powerValue: 80,
    connector: "CCS",
    available: 2,
    total: 4,
    rating: 4.7,
    reviews: 63,
    image: mataraImage,
    position: [5.958, 80.548],
    sourceType: "EVCHARGEHUB",
    price: "LKR 75",
    pricePerKwh: 75,
    priceUnit: "/ kWh",
    openingHours: "6:00 AM - 11:00 PM",
    description:
      "A compact EVChargeHub station providing convenient fast charging facilities around the Nupe and Matara area.",
    chargers: [
      {
        id: 1,
        name: "Charger 01",
        connector: "CCS",
        power: 80,
        status: "Available",
      },
      {
        id: 2,
        name: "Charger 02",
        connector: "CCS",
        power: 80,
        status: "Available",
      },
    ],
    facilities: ["Parking", "Cafe Nearby", "Security"],
  },
];

import { getOwnerStations } from "./ownerStationsData";

/**
 * Returns user-discoverable charging stations:
 * Merges active & published owner stations with initial platform stations.
 * Private stations and draft stations are strictly excluded.
 */
export function getFindStationsList() {
  let ownerStations;
  try {
    ownerStations = getOwnerStations();
  } catch (e) {
    console.warn("Could not load owner stations for user discovery:", e);
    return initialStations;
  }

  // Published stations rule: status must be 'Active' AND stationType cannot be 'Private' or 'Private Charging Station'
  const publishedOwnerStations = ownerStations
    .filter(
      (st) =>
        st.status === "Active" &&
        st.stationType !== "Private" &&
        st.stationType !== "Private Charging Station"
    )
    .map((st) => {
      const pwrNumber =
        typeof st.maxPower === "string"
          ? parseInt(st.maxPower.replace(/[^0-9]/g, ""), 10) || 120
          : st.maxPower || 120;

      const connList =
        Array.isArray(st.connectorTypes) && st.connectorTypes.length > 0
          ? st.connectorTypes
          : ["CCS"];
      const primaryConn = connList[0] || "CCS";

      const avail =
        st.availableChargers !== undefined
          ? st.availableChargers
          : st.individualChargers
          ? st.individualChargers.filter((c) => c.status === "Available").length
          : 4;

      const total =
        st.totalChargers !== undefined
          ? st.totalChargers
          : st.individualChargers
          ? st.individualChargers.length
          : 4;

      return {
        id: st.id,
        name: st.name,
        address: st.address,
        distance: "2.8 km",
        distanceValue: 2.8,
        power: `${pwrNumber} kW`,
        powerValue: pwrNumber,
        connector: primaryConn,
        connectorTypes: connList,
        available: avail,
        total: total,
        rating: st.rating || 5.0,
        reviews: st.reviews || 0,
        image: st.image || ruhunaImage,
        position: st.position || [
          st.latitude || 6.0535,
          st.longitude || 80.221,
        ],
        sourceType: "EVCHARGEHUB",
        price: st.price || `LKR ${st.pricePerKwh || 85}`,
        pricePerKwh: st.pricePerKwh || 85,
        priceUnit: "/ kWh",
        openingHours:
          st.openingHours ||
          (st.isOpen24Hours ? "Open 24 Hours" : "Standard Schedule"),
        description:
          st.description ||
          "Fast charging station registered on the EVChargeHub network.",
        chargers:
          st.individualChargers?.map((c, i) => ({
            id: i + 1,
            name: c.name || `Charger 0${i + 1}`,
            connector: c.connectorType || "CCS",
            power: c.power || pwrNumber,
            status: c.status || "Available",
          })) ||
          st.chargers ||
          [],
        facilities:
          st.facilities || ["Parking", "Restrooms", "Wi-Fi"],
      };
    });

  const ownerIds = new Set(publishedOwnerStations.map((s) => Number(s.id)));
  const remainingInitial = initialStations.filter(
    (s) => !ownerIds.has(Number(s.id))
  );

  return [...publishedOwnerStations, ...remainingInitial];
}

