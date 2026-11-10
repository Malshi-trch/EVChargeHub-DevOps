/**
 * EVChargeHub Centralized Reviews & Ratings Data & Lifecycle Utilities
 * Single Source of Truth for station reviews: localStorage key "evStationReviews"
 */

export const REVIEWS_STORAGE_KEY = "evStationReviews";

export const initialReviews = [
  {
    reviewId: "REV-1001",
    bookingId: "EVH-802104",
    stationId: 2,
    stationName: "Matara City Charging Hub",
    ownerId: "owner_01",
    userId: "usr_04",
    customerName: "Anusha Jayasinghe",
    rating: 5,
    comment:
      "Exceptional 120 kW rapid charging speed! The waiting lounge was spotless with fast Wi-Fi while my MG ZS EV charged to 80% in under 35 minutes.",
    createdAt: "2026-10-05T09:30:00.000Z",
    ownerReply: {
      message:
        "Thank you Anusha! We strive to maintain top-tier ultra-fast chargers and comfortable lounge amenities. Glad you enjoyed the charging experience!",
      repliedAt: "2026-10-05T14:15:00.000Z",
      updatedAt: null,
    },
    status: "Published",
  },
  {
    reviewId: "REV-1002",
    bookingId: "EVH-802102",
    stationId: 1,
    stationName: "University of Ruhuna Charging Station",
    ownerId: "owner_01",
    userId: "usr_02",
    customerName: "Kasun Perera",
    rating: 5,
    comment:
      "Seamless reservation system. Bay 02 supercharger delivered peak 150 kW immediately upon plug-in. Clean facilities and helpful on-site staff.",
    createdAt: "2026-10-04T12:00:00.000Z",
    ownerReply: null,
    status: "Published",
  },
  {
    reviewId: "REV-1003",
    bookingId: "EVH-802101",
    stationId: 1,
    stationName: "University of Ruhuna Charging Station",
    ownerId: "owner_01",
    userId: "usr_01",
    customerName: "Hareen Janith",
    rating: 5,
    comment:
      "Great location right off the expressway corridor. Very clean bays and clear signage for Tesla drivers. Best supercharger hub in the Southern Province.",
    createdAt: "2026-10-03T16:20:00.000Z",
    ownerReply: {
      message:
        "Thank you Hareen! Our strategic expressway location is designed for effortless transit charging. We appreciate your continued support!",
      repliedAt: "2026-10-03T18:00:00.000Z",
      updatedAt: null,
    },
    status: "Published",
  },
  {
    reviewId: "REV-1004",
    bookingId: "EVH-802103",
    stationId: 1,
    stationName: "University of Ruhuna Charging Station",
    ownerId: "owner_01",
    userId: "usr_03",
    customerName: "Nimal Fernando",
    rating: 4,
    comment:
      "Fast charging session for my Hyundai Ioniq 5. Minor suggestion: adding an overhead canopy or shelter over bays for rainy monsoon days would be ideal.",
    createdAt: "2026-10-02T10:45:00.000Z",
    ownerReply: null,
    status: "Published",
  },
  {
    reviewId: "REV-1005",
    bookingId: null,
    stationId: 2,
    stationName: "Matara City Charging Hub",
    ownerId: "owner_01",
    userId: "usr_06",
    customerName: "Thilina Bandara",
    rating: 5,
    comment:
      "Very dependable city hub. Both CCS and CHAdeMO connectors were completely operational with zero waiting time at lunchtime.",
    createdAt: "2026-10-01T15:10:00.000Z",
    ownerReply: {
      message:
        "We appreciate your feedback Thilina! Maintaining 100% uptime on all multi-standard connectors is our core priority for all drivers.",
      repliedAt: "2026-10-01T17:30:00.000Z",
      updatedAt: null,
    },
    status: "Published",
  },
  {
    reviewId: "REV-1006",
    bookingId: "EVH-802105",
    stationId: 3,
    stationName: "Green Charge Matara",
    ownerId: "owner_01",
    userId: "usr_05",
    customerName: "Dilshan Silva",
    rating: 4,
    comment:
      "Convenient AC Type 2 destination charger right next to the beach road. Reliable 22 kW rate for a relaxed afternoon stop in town.",
    createdAt: "2026-09-28T14:00:00.000Z",
    ownerReply: null,
    status: "Published",
  },
  {
    reviewId: "REV-1007",
    bookingId: null,
    stationId: 3,
    stationName: "Green Charge Matara",
    ownerId: "owner_01",
    userId: "usr_07",
    customerName: "Kavindu Wickramasinghe",
    rating: 5,
    comment:
      "Smooth contactless activation and fair tariff per kWh. Perfect for topping up my Nissan Leaf while having coffee at the cafe nearby.",
    createdAt: "2026-09-25T11:15:00.000Z",
    ownerReply: {
      message:
        "Thank you Kavindu! We aim to make green destination charging as seamless and enjoyable as possible. Glad you liked the partner cafe!",
      repliedAt: "2026-09-25T13:40:00.000Z",
      updatedAt: null,
    },
    status: "Published",
  },
  {
    reviewId: "REV-1008",
    bookingId: null,
    stationId: 2,
    stationName: "Matara City Charging Hub",
    ownerId: "owner_01",
    userId: "usr_08",
    customerName: "Saman Kumara",
    rating: 3,
    comment:
      "Charging itself was quick and dependable, but one parking bay had slightly tight maneuvering clearance for larger electric SUVs.",
    createdAt: "2026-09-20T17:30:00.000Z",
    ownerReply: null,
    status: "Published",
  },
];

/**
 * Loads all canonical reviews from localStorage.
 * Seeds deterministically with initialReviews if empty.
 */
export function getReviews() {
  let list;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not parse evStationReviews:", e);
  }

  // Seed if empty
  if (!Array.isArray(list) || list.length === 0) {
    list = initialReviews;
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Could not seed evStationReviews:", e);
    }
  }

  return list;
}

/**
 * Persists reviews back to localStorage key "evStationReviews".
 */
export function saveReviews(reviewsList) {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviewsList));
  } catch (e) {
    console.error("Failed to save reviews to localStorage:", e);
  }
}

/**
 * Returns only reviews belonging to stations in the owner's portfolio.
 */
export function getOwnerReviews(ownerStations = []) {
  const all = getReviews();
  if (!ownerStations || ownerStations.length === 0) return all;

  const ownerStationIds = new Set(ownerStations.map((st) => String(st.id)));
  const ownerStationNames = new Set(
    ownerStations.map((st) => st.name.toLowerCase().trim())
  );

  return all.filter((r) => {
    if (r.stationId && ownerStationIds.has(String(r.stationId))) {
      return true;
    }
    if (r.stationName && ownerStationNames.has(r.stationName.toLowerCase().trim())) {
      return true;
    }
    return false;
  });
}

/**
 * Formats a review timestamp into readable "MMM D, YYYY" format.
 */
export function formatReviewDate(dateStr) {
  if (!dateStr) return "Recent";
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
 * Calculates rating distribution and average rating for a set of reviews.
 */
export function calculateRatingDistribution(reviews = []) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    counts[star] = (counts[star] || 0) + 1;
    sum += Number(r.rating) || 5;
  }

  const total = reviews.length;
  const percentages = {};
  for (let s = 1; s <= 5; s++) {
    percentages[s] = total > 0 ? Math.round((counts[s] / total) * 100) : 0;
  }

  const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;

  return {
    total,
    averageRating,
    counts,
    percentages,
  };
}

/**
 * Adds an owner reply to a review and persists it to localStorage.
 */
export function addOwnerReply(reviewId, message) {
  const cleanMessage = (message || "").trim();
  if (!cleanMessage) return null;

  const allReviews = getReviews();
  const now = new Date().toISOString();
  let updatedReview = null;

  const updatedList = allReviews.map((r) => {
    if (r.reviewId === reviewId) {
      updatedReview = {
        ...r,
        ownerReply: {
          message: cleanMessage,
          repliedAt: now,
          updatedAt: null,
        },
      };
      return updatedReview;
    }
    return r;
  });

  saveReviews(updatedList);
  return { updatedReview, allReviews: updatedList };
}

/**
 * Updates an existing owner reply on a review and persists to localStorage.
 */
export function updateOwnerReply(reviewId, updatedMessage) {
  const cleanMessage = (updatedMessage || "").trim();
  if (!cleanMessage) return null;

  const allReviews = getReviews();
  const now = new Date().toISOString();
  let updatedReview = null;

  const updatedList = allReviews.map((r) => {
    if (r.reviewId === reviewId) {
      const existingReply = r.ownerReply || {};
      updatedReview = {
        ...r,
        ownerReply: {
          message: cleanMessage,
          repliedAt: existingReply.repliedAt || now,
          updatedAt: now,
        },
      };
      return updatedReview;
    }
    return r;
  });

  saveReviews(updatedList);
  return { updatedReview, allReviews: updatedList };
}

/**
 * LEGACY AGGREGATE RATING SAFETY & SYNCHRONIZATION
 * Combines existing baseline aggregate data with canonical individual reviews
 * to prevent abrupt drops from realistic metrics (e.g., 4.8 / 124 reviews down to 4.5 / 3 reviews).
 */
export function calculateStationAggregate(station, individualStationReviews = []) {
  if (!station) return { rating: 5.0, reviews: 0 };

  const baselineReviews =
    station.baselineReviews !== undefined
      ? station.baselineReviews
      : typeof station.reviews === "number" && station.reviews > 0
      ? station.reviews
      : 0;

  const baselineRating =
    station.baselineRating !== undefined
      ? station.baselineRating
      : typeof station.rating === "number" && station.rating > 0
      ? station.rating
      : 5.0;

  const reviewCount = individualStationReviews.length;

  // If no individual reviews exist, retain baseline
  if (reviewCount === 0) {
    return {
      rating: baselineRating,
      reviews: baselineReviews,
      baselineReviews,
      baselineRating,
    };
  }

  // If baseline is 0 (new station), calculate strictly from reviews
  if (baselineReviews === 0) {
    const sum = individualStationReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = Number((sum / reviewCount).toFixed(1));
    return {
      rating: avg,
      reviews: reviewCount,
      baselineReviews: 0,
      baselineRating: 0,
    };
  }

  // Combine baseline aggregate with individual reviews
  const reviewsSum = individualStationReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
  const totalScore = baselineRating * baselineReviews + reviewsSum;
  const totalReviews = baselineReviews + reviewCount;
  const weightedRating = Number((totalScore / totalReviews).toFixed(1));

  return {
    rating: weightedRating,
    reviews: totalReviews,
    baselineReviews,
    baselineRating,
  };
}
