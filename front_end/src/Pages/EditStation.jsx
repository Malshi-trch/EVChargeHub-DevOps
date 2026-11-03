import { useState, useMemo, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./AddStation.css"; // Reuse existing clean AddStation form design & tokens
import ruhunaImage from "../assets/station-ruhuna.jpg";
import mataraImage from "../assets/station-matara.jpg";
import southernImage from "../assets/station-southern.jpg";
import OwnerHeader from "../components/owner/OwnerHeader";

import {
  BuildingIcon,
  ClockIcon,
  PlugIcon,
  LocationIcon,
  PlusIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  TrashIcon,
  CheckIcon,
  UploadIcon,
  StarIcon,
} from "../components/Icons";

import {
  initialOwnerStations,
  OWNER_STATIONS_STORAGE_KEY,
  syncStationAvailability,
} from "../data/ownerStationsData";

/* =========================================================
   LEAFLET MARKER ICON FIX
========================================================= */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* =========================================================
   LEAFLET HELPER COMPONENTS
========================================================= */
function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([
        parseFloat(e.latlng.lat.toFixed(5)),
        parseFloat(e.latlng.lng.toFixed(5)),
      ]);
    },
  });

  return position && position[0] && position[1] ? (
    <Marker position={position}>
      <Popup>
        <strong>Selected Location</strong>
        <br />
        {position[0]}, {position[1]}
      </Popup>
    </Marker>
  ) : null;
}

function MapRecenter({ position }) {
  const map = useMap();
  if (
    position &&
    !isNaN(position[0]) &&
    !isNaN(position[1]) &&
    position[0] !== 0 &&
    position[1] !== 0
  ) {
    map.flyTo(position, 14, { duration: 0.8 });
  }
  return null;
}

const FACILITY_OPTIONS = [
  "Restroom",
  "Parking",
  "Wi-Fi",
  "Cafe",
  "Restaurant",
  "Waiting Area",
  "Security",
  "Wheelchair Accessible",
  "Shopping",
  "24/7 Support",
];

const PRESET_IMAGES = [
  { id: "ruhuna", label: "Ultra-Fast DC Hub", src: ruhunaImage },
  { id: "matara", label: "City Multi-Standard Hub", src: mataraImage },
  { id: "southern", label: "Solar Fast Charging Hub", src: southernImage },
];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_WEEKLY_HOURS = {
  Monday: { open: true, from: "06:00", to: "22:00" },
  Tuesday: { open: true, from: "06:00", to: "22:00" },
  Wednesday: { open: true, from: "06:00", to: "22:00" },
  Thursday: { open: true, from: "06:00", to: "22:00" },
  Friday: { open: true, from: "06:00", to: "22:00" },
  Saturday: { open: true, from: "07:00", to: "23:00" },
  Sunday: { open: true, from: "07:00", to: "23:00" },
};

function EditStation() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Load all stations from consistent storage key
  const [stations, setStations] = useState(() => {
    try {
      const saved = localStorage.getItem(OWNER_STATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialOwnerStations;
    } catch {
      return initialOwnerStations;
    }
  });

  const [toastMessage, setToastMessage] = useState("");

  // Target station to edit
  const existingStation = useMemo(() => {
    return stations.find((st) => String(st.id) === String(stationId));
  }, [stations, stationId]);

  // Form State initialized directly from target station
  const [basic, setBasic] = useState(() => ({
    name: existingStation?.name || "",
    description: existingStation?.description || "",
    status: existingStation?.status || "Active",
    stationType:
      existingStation?.stationType || "Public Charging Station",
    contactPerson: existingStation?.contactPerson || "",
    contactPhone: existingStation?.contactPhone || "",
    contactEmail: existingStation?.contactEmail || "",
  }));

  const [location, setLocation] = useState(() => ({
    address: existingStation?.address || "",
    city: existingStation?.city || "Galle",
    district: existingStation?.district || "Galle",
    province: existingStation?.province || "Southern Province",
    postalCode: existingStation?.postalCode || "80000",
    latitude: parseFloat(
      existingStation?.latitude ||
        (existingStation?.position && existingStation.position[0]) ||
        6.0535
    ),
    longitude: parseFloat(
      existingStation?.longitude ||
        (existingStation?.position && existingStation.position[1]) ||
        80.221
    ),
  }));

  const [isOpen24Hours, setIsOpen24Hours] = useState(() => {
    return (
      existingStation?.isOpen24Hours ??
      (existingStation?.openingHours === "Open 24 Hours")
    );
  });

  const [weeklyHours, setWeeklyHours] = useState(() => {
    return existingStation?.weeklyHours || DEFAULT_WEEKLY_HOURS;
  });

  const [chargers, setChargers] = useState(() => {
    if (existingStation?.chargers && existingStation.chargers.length > 0) {
      return existingStation.chargers.map((c, idx) => ({
        id: c.id || idx + 1,
        connectorType: c.connectorType || "CCS",
        power: String(c.power || "150").replace(/[^0-9]/g, ""),
        points: String(c.totalPoints || c.points || "2"),
      }));
    }
    const pwr = String(existingStation?.maxPower || "150").replace(
      /[^0-9]/g,
      ""
    );
    return [
      {
        id: 1,
        connectorType: "CCS",
        power: pwr || "150",
        points: String(existingStation?.totalChargers || "4"),
      },
    ];
  });

  const [pricing, setPricing] = useState(() => ({
    pricePerKwh: String(
      existingStation?.pricing?.pricePerKwh ||
        existingStation?.pricePerKwh ||
        "85"
    ),
    sessionFee: String(
      existingStation?.pricing?.sessionFee ||
        existingStation?.sessionFee ||
        "0"
    ),
    parkingFee: String(
      existingStation?.pricing?.parkingFee ||
        existingStation?.parkingFee ||
        ""
    ),
    bookingEnabled: existingStation?.bookingEnabled ?? true,
    maxBookingDuration: existingStation?.maxBookingDuration || "60 mins",
    cancellationPolicy:
      existingStation?.cancellationPolicy ||
      "Free cancellation up to 15 minutes before scheduled session",
    bookingInstructions: existingStation?.bookingInstructions || "",
  }));

  const [facilities, setFacilities] = useState(() => {
    return existingStation?.facilities && existingStation.facilities.length > 0
      ? existingStation.facilities
      : ["Restroom", "Parking", "Wi-Fi"];
  });

  const [selectedImage, setSelectedImage] = useState(() => {
    return existingStation?.image || ruhunaImage;
  });
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [customImageActive, setCustomImageActive] = useState(false);

  const [errors, setErrors] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const toggleFacility = (facilityName) => {
    setFacilities((prev) =>
      prev.includes(facilityName)
        ? prev.filter((f) => f !== facilityName)
        : [...prev, facilityName]
    );
  };

  const handleAddChargerConfig = () => {
    const nextId =
      chargers.length > 0 ? Math.max(...chargers.map((c) => c.id)) + 1 : 1;
    setChargers([
      ...chargers,
      { id: nextId, connectorType: "CCS", power: "120", points: "2" },
    ]);
  };

  const handleRemoveChargerConfig = (idToRemove) => {
    if (chargers.length <= 1) {
      showToast("At least one charger configuration is required.");
      return;
    }
    setChargers(chargers.filter((c) => c.id !== idToRemove));
  };

  const handleChargerChange = (id, field, value) => {
    setChargers(
      chargers.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleDayToggle = (day) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], open: !prev[day].open },
    }));
  };

  const handleDayTimeChange = (day, field, val) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: val },
    }));
  };

  const handleApplyMondayToAll = () => {
    const mondaySettings = weeklyHours.Monday;
    const updated = {};
    DAYS_OF_WEEK.forEach((day) => {
      updated[day] = { ...mondaySettings };
    });
    setWeeklyHours(updated);
    showToast("Monday hours applied to all 7 days.");
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      setUploadedPreview(result);
      setSelectedImage(result);
      setCustomImageActive(true);
      showToast("New image selected successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomImage = () => {
    setUploadedPreview(null);
    setSelectedImage(existingStation?.image || ruhunaImage);
    setCustomImageActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Computed live metrics for Preview
  const totalChargingPoints = useMemo(() => {
    return chargers.reduce((sum, c) => sum + (parseInt(c.points, 10) || 0), 0);
  }, [chargers]);

  const uniqueConnectors = useMemo(() => {
    return Array.from(new Set(chargers.map((c) => c.connectorType)));
  }, [chargers]);

  const maxChargingPower = useMemo(() => {
    const powers = chargers.map((c) => parseInt(c.power, 10) || 0);
    return powers.length > 0 ? Math.max(...powers) : 0;
  }, [chargers]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!basic.name.trim()) {
      newErrors.name = "Station Name is required.";
    }

    if (!basic.description.trim()) {
      newErrors.description = "Station Description is required.";
    } else if (basic.description.trim().length < 15) {
      newErrors.description =
        "Please provide a more descriptive summary (at least 15 characters).";
    }

    if (!location.address.trim()) {
      newErrors.address = "Street address is required.";
    }

    if (!location.city.trim()) {
      newErrors.city = "City is required.";
    }

    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = "Valid latitude between -90 and 90 is required.";
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = "Valid longitude between -180 and 180 is required.";
    }

    if (chargers.length === 0) {
      newErrors.chargers = "At least one charger configuration is required.";
    } else {
      chargers.forEach((c, idx) => {
        const pwr = parseInt(c.power, 10);
        const pts = parseInt(c.points, 10);
        if (isNaN(pwr) || pwr <= 0) {
          newErrors[`charger_power_${c.id}`] =
            `Configuration #${idx + 1} power must be greater than 0.`;
        }
        if (isNaN(pts) || pts <= 0) {
          newErrors[`charger_points_${c.id}`] =
            `Configuration #${idx + 1} points must be at least 1.`;
        }
      });
    }

    const price = parseFloat(pricing.pricePerKwh);
    if (isNaN(price) || price < 0) {
      newErrors.pricePerKwh = "Price per kWh must be a positive number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SAVE CHANGES (UPDATE EXISTING RECORD - NO DUPLICATES)
  const handleSaveChanges = (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      showToast("Please correct highlighted errors before saving.");
      const firstErrorEl = document.querySelector(".input-error-msg");
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    let safeImage = selectedImage;
    if (customImageActive && uploadedPreview) {
      if (uploadedPreview.length > 200000) {
        safeImage = existingStation?.image || ruhunaImage;
      }
    }

    const finalChargersCount = totalChargingPoints || 4;
    const finalAvailable =
      basic.status === "Draft" || basic.status === "Inactive"
        ? 0
        : Math.max(1, Math.floor(finalChargersCount * 0.75));

    // Construct drop-in updated station preserving immutable fields
    const updatedStationRecord = {
      ...existingStation, // Preserves id, ownerId, sourceType, createdAt, rating, reviews, todayBookings, todayRevenue
      name: basic.name.trim(),
      description: basic.description.trim(),
      status: basic.status,
      stationType: basic.stationType,
      address: location.address.trim(),
      city: location.city.trim(),
      district: location.district.trim(),
      province: location.province.trim(),
      postalCode: location.postalCode.trim(),
      latitude: parseFloat(location.latitude) || 6.0535,
      longitude: parseFloat(location.longitude) || 80.221,
      position: [
        parseFloat(location.latitude) || 6.0535,
        parseFloat(location.longitude) || 80.221,
      ],
      image: safeImage,
      contactPerson: basic.contactPerson?.trim() || existingStation?.contactPerson || "",
      contactPhone: basic.contactPhone?.trim() || existingStation?.contactPhone || "",
      contactEmail: basic.contactEmail?.trim() || existingStation?.contactEmail || "",
      totalChargers: finalChargersCount,
      availableChargers: finalAvailable,
      connectorTypes:
        uniqueConnectors.length > 0 ? uniqueConnectors : ["CCS", "Type 2"],
      maxPower: `${maxChargingPower || 150} kW`,
      openingHours: isOpen24Hours
        ? "Open 24 Hours"
        : `${weeklyHours.Monday.from} - ${weeklyHours.Monday.to}`,
      isOpen24Hours,
      weeklyHours,
      chargers: chargers.map((c, i) => ({
        id: i + 1,
        connectorType: c.connectorType,
        power: `${c.power} kW`,
        totalPoints: parseInt(c.points, 10) || 1,
        availablePoints: parseInt(c.points, 10) || 1,
      })),
      pricing: {
        pricePerKwh: parseFloat(pricing.pricePerKwh) || 85,
        sessionFee: parseFloat(pricing.sessionFee) || 0,
        parkingFee: parseFloat(pricing.parkingFee) || 0,
      },
      price: `LKR ${pricing.pricePerKwh || 85}`,
      pricePerKwh: parseFloat(pricing.pricePerKwh) || 85,
      sessionFee: parseFloat(pricing.sessionFee) || 0,
      parkingFee: parseFloat(pricing.parkingFee) || 0,
      bookingEnabled: pricing.bookingEnabled,
      maxBookingDuration: pricing.maxBookingDuration,
      cancellationPolicy: pricing.cancellationPolicy,
      bookingInstructions: pricing.bookingInstructions?.trim() || "",
      facilities: facilities.length > 0 ? facilities : ["Restroom", "Parking"],
      updatedAt: new Date().toISOString(),
    };

    const syncedRecord = syncStationAvailability(updatedStationRecord);

    // Replace the station in collection: stations.map(...)
    const updatedStationsList = stations.map((st) =>
      String(st.id) === String(stationId) ? syncedRecord : st
    );

    setStations(updatedStationsList);
    try {
      localStorage.setItem(
        OWNER_STATIONS_STORAGE_KEY,
        JSON.stringify(updatedStationsList)
      );
    } catch (err) {
      console.error("Error updating station in localStorage:", err);
    }

    // Navigate to Station Details page
    navigate(`/owner/stations/${stationId}`);
  };

  // Station Not Found Guard
  if (!existingStation) {
    return (
      <div className="owner-edit-station-page">
        <OwnerHeader
          title="Station Not Found"
          subtitle="The requested charging station could not be found."
          breadcrumbs={[
            { label: "My Stations", to: "/owner/stations" },
            { label: "Not Found" },
          ]}
        />
        <div className="details-not-found-card">
          <div className="not-found-icon">
            <BuildingIcon size={40} />
          </div>
          <h2>Station Not Found</h2>
          <p>
            The station you are attempting to edit (ID #{stationId}) could not
            be located in your portfolio.
          </p>
          <Link to="/owner/stations" className="back-to-stations-btn">
            <ArrowLeftIcon size={16} />
            <span>Back to My Stations</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-edit-station-page">
      <OwnerHeader
        title={`Edit Station: ${existingStation.name}`}
        subtitle="Update operational information, charging hardware capacity, pricing and facilities."
        breadcrumbs={[
          { label: "My Stations", to: "/owner/stations" },
          { label: existingStation.name, to: `/owner/stations/${stationId}` },
          { label: "Edit" },
        ]}
      />

      {toastMessage && (
        <div className="owner-toast" role="status">
          <span>✓</span>
          <p>{toastMessage}</p>
        </div>
      )}

      <div className="add-station-top-nav">
        <Link
          to={`/owner/stations/${stationId}`}
          className="back-link"
        >
          <ArrowLeftIcon size={16} />
          <span>Back to Station Details</span>
        </Link>
      </div>

      {/* TWO-COLUMN LAYOUT: EDIT FORM + LIVE PREVIEW */}
      <div className="add-station-layout">
          <form
            className="add-station-form"
            onSubmit={handleSaveChanges}
            noValidate
          >
            {/* 1. BASIC INFORMATION */}
            <section className="form-card-section" id="section-basic">
              <div className="section-card-header">
                <div className="section-icon green">
                  <BuildingIcon size={20} />
                </div>
                <div>
                  <h2>1. Basic Information</h2>
                  <p>Edit station identity, public name, and operating status.</p>
                </div>
              </div>

              <div className="section-card-body">
                <div className="form-group">
                  <label htmlFor="edit-station-name">
                    Station Name <span className="req-star">*</span>
                  </label>
                  <input
                    id="edit-station-name"
                    type="text"
                    value={basic.name}
                    onChange={(e) => {
                      setBasic({ ...basic, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    className={errors.name ? "input-invalid" : ""}
                  />
                  {errors.name && (
                    <span className="input-error-msg">{errors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-station-desc">
                    Station Description <span className="req-star">*</span>
                  </label>
                  <textarea
                    id="edit-station-desc"
                    rows="3"
                    value={basic.description}
                    onChange={(e) => {
                      setBasic({ ...basic, description: e.target.value });
                      if (errors.description)
                        setErrors({ ...errors, description: null });
                    }}
                    className={errors.description ? "input-invalid" : ""}
                  />
                  {errors.description && (
                    <span className="input-error-msg">
                      {errors.description}
                    </span>
                  )}
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="edit-station-status">Operational Status</label>
                    <select
                      id="edit-station-status"
                      value={basic.status}
                      onChange={(e) =>
                        setBasic({ ...basic, status: e.target.value })
                      }
                    >
                      <option value="Active">Active (Accepting Bookings)</option>
                      <option value="Inactive">Inactive (Offline)</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-station-type">Station Type</label>
                    <select
                      id="edit-station-type"
                      value={basic.stationType}
                      onChange={(e) =>
                        setBasic({ ...basic, stationType: e.target.value })
                      }
                    >
                      <option value="Public Charging Station">
                        Public Charging Station
                      </option>
                      <option value="Commercial Charging Hub">
                        Commercial Charging Hub
                      </option>
                      <option value="Workplace / Institution">
                        Workplace / Institution
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. LOCATION */}
            <section className="form-card-section" id="section-location">
              <div className="section-card-header">
                <div className="section-icon emerald">
                  <LocationIcon size={20} />
                </div>
                <div>
                  <h2>2. Location & Coordinates</h2>
                  <p>Update physical address and pin location on map.</p>
                </div>
              </div>

              <div className="section-card-body">
                <div className="form-group">
                  <label htmlFor="edit-station-address">
                    Street Address <span className="req-star">*</span>
                  </label>
                  <input
                    id="edit-station-address"
                    type="text"
                    value={location.address}
                    onChange={(e) => {
                      setLocation({ ...location, address: e.target.value });
                      if (errors.address)
                        setErrors({ ...errors, address: null });
                    }}
                    className={errors.address ? "input-invalid" : ""}
                  />
                  {errors.address && (
                    <span className="input-error-msg">{errors.address}</span>
                  )}
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label htmlFor="edit-station-city">
                      City <span className="req-star">*</span>
                    </label>
                    <input
                      id="edit-station-city"
                      type="text"
                      value={location.city}
                      onChange={(e) => {
                        setLocation({ ...location, city: e.target.value });
                        if (errors.city) setErrors({ ...errors, city: null });
                      }}
                      className={errors.city ? "input-invalid" : ""}
                    />
                    {errors.city && (
                      <span className="input-error-msg">{errors.city}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-station-district">District</label>
                    <select
                      id="edit-station-district"
                      value={location.district}
                      onChange={(e) =>
                        setLocation({ ...location, district: e.target.value })
                      }
                    >
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Hambantota">Hambantota</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-station-postal">Postal Code</label>
                    <input
                      id="edit-station-postal"
                      type="text"
                      value={location.postalCode}
                      onChange={(e) =>
                        setLocation({ ...location, postalCode: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* INTERACTIVE LEAFLET MAP PICKER */}
                <div className="form-group map-section-group">
                  <div className="map-picker-header">
                    <div>
                      <label>Interactive Map Pin Location</label>
                      <span className="map-hint">
                        Click on map to reposition coordinates.
                      </span>
                    </div>
                  </div>

                  <div className="map-container-box">
                    <MapContainer
                      center={[location.latitude, location.longitude]}
                      zoom={14}
                      scrollWheelZoom={false}
                      className="add-station-leaflet-map"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker
                        position={[location.latitude, location.longitude]}
                        onPositionChange={([newLat, newLng]) => {
                          setLocation((prev) => ({
                            ...prev,
                            latitude: newLat,
                            longitude: newLng,
                          }));
                        }}
                      />
                      <MapRecenter
                        position={[location.latitude, location.longitude]}
                      />
                    </MapContainer>
                  </div>

                  <div className="form-grid-2 coordinates-grid">
                    <div className="form-group">
                      <label htmlFor="edit-lat">
                        Latitude <span className="req-star">*</span>
                      </label>
                      <input
                        id="edit-lat"
                        type="number"
                        step="0.0001"
                        value={location.latitude}
                        onChange={(e) =>
                          setLocation({
                            ...location,
                            latitude: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-lng">
                        Longitude <span className="req-star">*</span>
                      </label>
                      <input
                        id="edit-lng"
                        type="number"
                        step="0.0001"
                        value={location.longitude}
                        onChange={(e) =>
                          setLocation({
                            ...location,
                            longitude: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. OPERATING HOURS */}
            <section className="form-card-section" id="section-hours">
              <div className="section-card-header">
                <div className="section-icon amber">
                  <ClockIcon size={20} />
                </div>
                <div>
                  <h2>3. Operating Hours</h2>
                  <p>Configure public access schedule.</p>
                </div>
              </div>

              <div className="section-card-body">
                <div className="switch-toggle-card">
                  <div className="switch-text">
                    <strong>Open 24 Hours / 7 Days</strong>
                    <span>Continuous driver access day and night</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isOpen24Hours}
                      onChange={(e) => setIsOpen24Hours(e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {!isOpen24Hours && (
                  <div className="weekly-schedule-wrap">
                    <div className="weekly-schedule-header">
                      <strong>Custom Weekly Timetable</strong>
                      <button
                        type="button"
                        className="preset-link-btn"
                        onClick={handleApplyMondayToAll}
                      >
                        Apply Monday to All Days
                      </button>
                    </div>

                    <div className="weekly-days-table">
                      {DAYS_OF_WEEK.map((day) => {
                        const daySchedule = weeklyHours[day] || {
                          open: true,
                          from: "06:00",
                          to: "22:00",
                        };
                        return (
                          <div
                            key={day}
                            className={`day-row ${
                              daySchedule.open ? "open" : "closed"
                            }`}
                          >
                            <div className="day-name-col">
                              <label className="checkbox-wrap">
                                <input
                                  type="checkbox"
                                  checked={daySchedule.open}
                                  onChange={() => handleDayToggle(day)}
                                />
                                <span className="day-title">{day}</span>
                              </label>
                            </div>

                            <div className="day-status-col">
                              <span
                                className={`day-status-pill ${
                                  daySchedule.open ? "open" : "closed"
                                }`}
                              >
                                {daySchedule.open ? "Open" : "Closed"}
                              </span>
                            </div>

                            <div className="day-times-col">
                              {daySchedule.open ? (
                                <div className="time-inputs-pair">
                                  <input
                                    type="time"
                                    value={daySchedule.from}
                                    onChange={(e) =>
                                      handleDayTimeChange(
                                        day,
                                        "from",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <span>to</span>
                                  <input
                                    type="time"
                                    value={daySchedule.to}
                                    onChange={(e) =>
                                      handleDayTimeChange(
                                        day,
                                        "to",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              ) : (
                                <span className="closed-label">
                                  Station Closed
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 4. CHARGING CONFIGURATION */}
            <section className="form-card-section" id="section-chargers">
              <div className="section-card-header">
                <div className="section-icon blue">
                  <PlugIcon size={20} />
                </div>
                <div>
                  <h2>4. Charging Configuration</h2>
                  <p>Adjust charging hardware specs and connector bay counts.</p>
                </div>
              </div>

              <div className="section-card-body">
                <div className="chargers-config-list">
                  {chargers.map((cfg, index) => (
                    <div className="charger-config-card" key={cfg.id}>
                      <div className="charger-config-head">
                        <span className="charger-badge">
                          Configuration #{index + 1}
                        </span>
                        {chargers.length > 1 && (
                          <button
                            type="button"
                            className="remove-charger-btn"
                            onClick={() => handleRemoveChargerConfig(cfg.id)}
                            title="Remove this configuration"
                          >
                            <TrashIcon size={15} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="form-grid-3 charger-inputs-grid">
                        <div className="form-group">
                          <label>Connector Type</label>
                          <select
                            value={cfg.connectorType}
                            onChange={(e) =>
                              handleChargerChange(
                                cfg.id,
                                "connectorType",
                                e.target.value
                              )
                            }
                          >
                            <option value="CCS">CCS (Combined Charging System)</option>
                            <option value="Type 2">Type 2 (Mennekes AC)</option>
                            <option value="CHAdeMO">CHAdeMO (DC Fast)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Power Output (kW)</label>
                          <select
                            value={cfg.power}
                            onChange={(e) =>
                              handleChargerChange(cfg.id, "power", e.target.value)
                            }
                          >
                            <option value="350">350 kW (HPC Ultra-Fast)</option>
                            <option value="150">150 kW (Ultra-Fast DC)</option>
                            <option value="120">120 kW (Fast DC)</option>
                            <option value="60">60 kW (Standard DC)</option>
                            <option value="22">22 kW (AC Fast Charger)</option>
                            <option value="11">11 kW (Standard AC)</option>
                            <option value="7">7 kW (Slow AC)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Charging Points</label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={cfg.points}
                            onChange={(e) =>
                              handleChargerChange(
                                cfg.id,
                                "points",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="add-charger-row">
                  <button
                    type="button"
                    className="add-charger-btn"
                    onClick={handleAddChargerConfig}
                  >
                    <PlusIcon size={16} />
                    <span>+ Add Charger Type</span>
                  </button>

                  <div className="summary-pills-row">
                    <span className="summary-pill">
                      Total Points: <strong>{totalChargingPoints}</strong>
                    </span>
                    <span className="summary-pill">
                      Max Output: <strong>{maxChargingPower} kW</strong>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. PRICING */}
            <section className="form-card-section" id="section-pricing">
              <div className="section-card-header">
                <div className="section-icon green">
                  <CreditCardIcon size={20} />
                </div>
                <div>
                  <h2>5. Pricing</h2>
                  <p>Update energy tariff and optional session fee in LKR.</p>
                </div>
              </div>

              <div className="section-card-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="edit-price-kwh">
                      Price per kWh (LKR) <span className="req-star">*</span>
                    </label>
                    <div className="currency-input-wrap">
                      <span className="currency-prefix">LKR</span>
                      <input
                        id="edit-price-kwh"
                        type="number"
                        min="1"
                        step="1"
                        value={pricing.pricePerKwh}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            pricePerKwh: e.target.value,
                          })
                        }
                      />
                    </div>
                    {errors.pricePerKwh && (
                      <span className="input-error-msg">
                        {errors.pricePerKwh}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-session-fee">
                      Session Base Fee (LKR, Optional)
                    </label>
                    <div className="currency-input-wrap">
                      <span className="currency-prefix">LKR</span>
                      <input
                        id="edit-session-fee"
                        type="number"
                        min="0"
                        step="1"
                        value={pricing.sessionFee}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            sessionFee: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. FACILITIES */}
            <section className="form-card-section" id="section-facilities">
              <div className="section-card-header">
                <div className="section-icon purple">
                  <StarIcon size={20} />
                </div>
                <div>
                  <h2>6. Facilities & Amenities</h2>
                  <p>Select on-site conveniences provided for drivers.</p>
                </div>
              </div>

              <div className="section-card-body">
                <div className="facilities-chips-grid">
                  {FACILITY_OPTIONS.map((facility) => {
                    const isSelected = facilities.includes(facility);
                    return (
                      <button
                        type="button"
                        key={facility}
                        className={`facility-chip ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => toggleFacility(facility)}
                        aria-pressed={isSelected}
                      >
                        <span className="chip-indicator">
                          {isSelected && <CheckIcon size={13} />}
                        </span>
                        <span>{facility}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 7. STATION PHOTOS */}
            <section className="form-card-section" id="section-images">
              <div className="section-card-header">
                <div className="section-icon teal">
                  <UploadIcon size={20} />
                </div>
                <div>
                  <h2>7. Station Photos</h2>
                  <p>Choose preset photo or upload a replacement.</p>
                </div>
              </div>

              <div className="section-card-body">
                <div className="preset-photos-wrap">
                  <label className="block-label">Select Station Photo</label>
                  <div className="preset-photos-grid">
                    {PRESET_IMAGES.map((preset) => {
                      const isChosen =
                        !customImageActive && selectedImage === preset.src;
                      return (
                        <div
                          key={preset.id}
                          className={`preset-photo-card ${
                            isChosen ? "chosen" : ""
                          }`}
                          onClick={() => {
                            setSelectedImage(preset.src);
                            setCustomImageActive(false);
                            setUploadedPreview(null);
                          }}
                        >
                          <img src={preset.src} alt={preset.label} />
                          <div className="preset-label-bar">
                            <span>{preset.label}</span>
                            {isChosen && <CheckIcon size={14} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="or-divider">
                  <span>OR UPLOAD REPLACEMENT PHOTO</span>
                </div>

                <div className="upload-dropzone-box">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageFileChange}
                  />

                  {customImageActive && uploadedPreview ? (
                    <div className="uploaded-preview-wrap">
                      <img src={uploadedPreview} alt="Uploaded Hub Preview" />
                      <div className="preview-overlay">
                        <span>Custom Photo Active</span>
                        <button
                          type="button"
                          className="remove-img-btn"
                          onClick={handleRemoveCustomImage}
                        >
                          <TrashIcon size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="dropzone-clickable"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="dropzone-icon">
                        <UploadIcon size={28} />
                      </div>
                      <strong>Upload Replacement Image</strong>
                      <p>Click to browse image files from your computer</p>
                      <small>PNG, JPG, or WEBP</small>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 8. FORM ACTIONS */}
            <div className="form-submit-footer">
              <Link
                to={`/owner/stations/${stationId}`}
                className="form-cancel-btn"
              >
                Cancel
              </Link>

              <button type="submit" className="submit-station-btn">
                <CheckIcon size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>

          {/* RIGHT COLUMN: LIVE STATION PREVIEW */}
          <aside className="add-station-preview-col">
            <div className="sticky-preview-card">
              <div className="preview-card-top-badge">
                <span className="live-pulse"></span>
                <span>LIVE PREVIEW</span>
              </div>

              <div className="preview-media">
                <img
                  src={selectedImage}
                  alt={basic.name || "Station Preview"}
                />
                <span
                  className={`preview-status-pill ${basic.status.toLowerCase()}`}
                >
                  {basic.status}
                </span>
                <span className="preview-power-pill">
                  ⚡ {maxChargingPower || 150} kW Max
                </span>
              </div>

              <div className="preview-content">
                <h3 className="preview-title">
                  {basic.name || "Your Charging Station"}
                </h3>

                <p className="preview-location">
                  <LocationIcon size={14} />
                  <span>
                    {location.city || "City"},{" "}
                    {location.district || "District"},{" "}
                    {location.province || "Province"}
                  </span>
                </p>

                <div className="preview-stats-grid">
                  <div className="p-stat">
                    <small>Total Points</small>
                    <strong>{totalChargingPoints || 0} Ports</strong>
                  </div>

                  <div className="p-stat">
                    <small>Energy Tariff</small>
                    <strong className="green-val">
                      LKR {pricing.pricePerKwh || "85"}
                    </strong>
                  </div>

                  <div className="p-stat">
                    <small>Connectors</small>
                    <strong>
                      {uniqueConnectors.length > 0
                        ? uniqueConnectors.join(", ")
                        : "CCS, Type 2"}
                    </strong>
                  </div>

                  <div className="p-stat">
                    <small>Access</small>
                    <strong>
                      {isOpen24Hours ? "Open 24 Hours" : "Weekly Schedule"}
                    </strong>
                  </div>
                </div>

                <div className="preview-facilities-section">
                  <small>Selected Amenities ({facilities.length}):</small>
                  <div className="preview-amenities-tags">
                    {facilities.slice(0, 5).map((fac) => (
                      <span key={fac} className="amenity-tag">
                        {fac}
                      </span>
                    ))}
                    {facilities.length > 5 && (
                      <span className="amenity-tag more">
                        +{facilities.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="preview-driver-notice">
                  <span>
                    Saving changes will update Station ID #{stationId} across
                    your owner dashboard and stations portfolio.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
    </div>
  );
}

export default EditStation;
