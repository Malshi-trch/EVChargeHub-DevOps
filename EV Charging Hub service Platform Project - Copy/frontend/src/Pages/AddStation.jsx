import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

import "./AddStation.css";
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
  ArrowRightIcon,
  TrashIcon,
  CheckIcon,
  CheckCircleIcon,
  UploadIcon,
  StarIcon,
  EditIcon,
  WifiIcon,
  CoffeeIcon,
  CameraIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  ShieldIcon,
  AlertCircleIcon,
} from "../components/Icons";

import {
  getOwnerStations,
  saveOwnerStations,
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
function DraggableLocationMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      onPositionChange([
        parseFloat(e.latlng.lat.toFixed(5)),
        parseFloat(e.latlng.lng.toFixed(5)),
      ]);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onPositionChange([
            parseFloat(lat.toFixed(5)),
            parseFloat(lng.toFixed(5)),
          ]);
        }
      },
    }),
    [onPositionChange]
  );

  return position && position[0] && position[1] ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>
        <div style={{ textAlign: "center", padding: "4px" }}>
          <strong style={{ display: "block", color: "#064E3B", marginBottom: "2px" }}>
            Station GPS Pin
          </strong>
          <span style={{ fontSize: "12px", color: "#475569" }}>
            {position[0]}, {position[1]}
          </span>
          <br />
          <small style={{ color: "#059669", fontWeight: "600", fontSize: "11px" }}>
            ✓ Drag pin to adjust position
          </small>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

function MapFlyRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (
      position &&
      !isNaN(position[0]) &&
      !isNaN(position[1]) &&
      position[0] !== 0 &&
      position[1] !== 0
    ) {
      map.flyTo(position, 13, { duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

/* =========================================================
   CONSTANTS & METADATA
========================================================= */
const FORM_STEPS = [
  { id: 1, title: "Basic Information", subtitle: "Name, type & contact" },
  { id: 2, title: "Location Details", subtitle: "Address & map coordinates" },
  { id: 3, title: "Charger Configuration", subtitle: "Individual bays & hardware" },
  { id: 4, title: "Pricing & Booking", subtitle: "Tariffs, fees & policies" },
  { id: 5, title: "Hours & Facilities", subtitle: "Schedule, amenities & photos" },
  { id: 6, title: "Review & Confirmation", subtitle: "Final inspection & save" },
];

const SRI_LANKA_PROVINCES = [
  "Southern Province",
  "Western Province",
  "Central Province",
  "Northern Province",
  "Eastern Province",
  "North Western Province",
  "North Central Province",
  "Uva Province",
  "Sabaragamuwa Province",
];

const CITY_PRESETS = [
  { name: "Galle", province: "Southern Province", lat: 6.0535, lng: 80.221 },
  { name: "Matara", province: "Southern Province", lat: 5.9485, lng: 80.5353 },
  { name: "Colombo", province: "Western Province", lat: 6.9271, lng: 79.8612 },
  { name: "Kandy", province: "Central Province", lat: 7.2906, lng: 80.6337 },
  { name: "Hambantota", province: "Southern Province", lat: 6.1248, lng: 81.1185 },
  { name: "Jaffna", province: "Northern Province", lat: 9.6615, lng: 80.0255 },
  { name: "Negombo", province: "Western Province", lat: 7.2008, lng: 79.8736 },
  { name: "Kurunegala", province: "North Western Province", lat: 7.4863, lng: 80.3623 },
];

const FACILITY_OPTIONS = [
  { name: "Wi-Fi", icon: WifiIcon, desc: "High-speed wireless internet" },
  { name: "Restrooms", icon: CheckIcon, desc: "Clean public washrooms" },
  { name: "Parking", icon: BuildingIcon, desc: "Dedicated EV parking bays" },
  { name: "Café", icon: CoffeeIcon, desc: "Hot beverages & refreshments" },
  { name: "Waiting Area", icon: ClockIcon, desc: "Air-conditioned driver lounge" },
  { name: "Security", icon: ShieldIcon, desc: "24/7 on-site physical security" },
  { name: "CCTV", icon: CameraIcon, desc: "Continuous surveillance cameras" },
  { name: "Accessibility", icon: CheckIcon, desc: "Wheelchair accessible ramps" },
  { name: "Convenience Store", icon: StarIcon, desc: "Snacks, drinks & essentials" },
];

const PRESET_IMAGES = [
  { id: "ruhuna", label: "Ultra-Fast DC Hub", src: ruhunaImage },
  { id: "matara", label: "Multi-Standard City Hub", src: mataraImage },
  { id: "southern", label: "Solar-Assisted Corridor", src: southernImage },
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
  Saturday: { open: true, from: "06:00", to: "23:00" },
  Sunday: { open: true, from: "06:00", to: "23:00" },
};

/**
 * Compresses an image file using an HTML5 Canvas to keep data URL under 120KB
 * ensuring safe localStorage persistence.
 */
function compressImageFile(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   MAIN COMPONENT: AddStation
========================================================= */
export default function AddStation() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState([1]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStationRecord, setCreatedStationRecord] = useState(null);

  // -------------------------------------------------------------
  // FORM STATE: STEP 1 — BASIC INFORMATION
  // -------------------------------------------------------------
  const [basic, setBasic] = useState({
    name: "",
    description: "",
    stationType: "Public Charging Station", // 'Public Charging Station' | 'Semi-Public' | 'Private Charging Station'
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    status: "Active", // 'Active' | 'Temporarily Closed' | 'Under Maintenance'
  });

  // -------------------------------------------------------------
  // FORM STATE: STEP 2 — LOCATION DETAILS
  // -------------------------------------------------------------
  const [location, setLocation] = useState({
    country: "Sri Lanka",
    province: "Southern Province",
    district: "Galle",
    city: "Galle",
    address: "",
    postalCode: "80000",
    latitude: 6.0535,
    longitude: 80.221,
  });

  // -------------------------------------------------------------
  // FORM STATE: STEP 3 — INDIVIDUAL CHARGERS CONFIGURATION
  // -------------------------------------------------------------
  const [individualChargers, setIndividualChargers] = useState([
    {
      id: "CP-01",
      name: "Bay 01 - Ultra-Fast DC",
      connectorType: "CCS",
      chargingType: "DC",
      power: 150,
      pricePerKwh: 85,
      status: "Available",
    },
    {
      id: "CP-02",
      name: "Bay 02 - Ultra-Fast DC",
      connectorType: "CCS",
      chargingType: "DC",
      power: 150,
      pricePerKwh: 85,
      status: "Available",
    },
    {
      id: "CP-03",
      name: "Bay 03 - AC Fast",
      connectorType: "Type 2",
      chargingType: "AC",
      power: 22,
      pricePerKwh: 80,
      status: "Available",
    },
    {
      id: "CP-04",
      name: "Bay 04 - AC Fast",
      connectorType: "Type 2",
      chargingType: "AC",
      power: 22,
      pricePerKwh: 80,
      status: "Available",
    },
  ]);

  // Modal State for adding/editing individual charger
  const [chargerModalOpen, setChargerModalOpen] = useState(false);
  const [editingChargerIndex, setEditingChargerIndex] = useState(null); // null = add, number = edit
  const [chargerForm, setChargerForm] = useState({
    id: "",
    name: "",
    connectorType: "CCS",
    chargingType: "DC",
    power: 150,
    pricePerKwh: 85,
    status: "Available",
  });
  const [chargerFormErrors, setChargerFormErrors] = useState({});

  // -------------------------------------------------------------
  // FORM STATE: STEP 4 — PRICING AND BOOKING
  // -------------------------------------------------------------
  const [pricing, setPricing] = useState({
    pricePerKwh: "85",
    parkingFee: "",
    sessionFee: "",
    bookingEnabled: true,
    maxBookingDuration: "60 mins",
    cancellationPolicy: "Free cancellation up to 15 minutes before scheduled session",
    bookingInstructions:
      "Arrive 5 minutes before scheduled slot. Drive into designated charging bay. Plug in connector and authenticate via EVChargeHub App.",
  });

  // -------------------------------------------------------------
  // FORM STATE: STEP 5 — OPERATING HOURS AND FACILITIES
  // -------------------------------------------------------------
  const [isOpen24Hours, setIsOpen24Hours] = useState(true);
  const [weeklyHours, setWeeklyHours] = useState(DEFAULT_WEEKLY_HOURS);
  const [facilities, setFacilities] = useState([
    "Wi-Fi",
    "Restrooms",
    "Parking",
    "Security",
  ]);

  // Images state
  const [galleryImages, setGalleryImages] = useState([
    { id: "ruhuna-preset", src: ruhunaImage, label: "Flagship DC Hub", isPrimary: true },
    { id: "matara-preset", src: mataraImage, label: "City Multi-Standard Hub", isPrimary: false },
  ]);
  const [primaryImageSrc, setPrimaryImageSrc] = useState(ruhunaImage);

  // Validation Errors across steps
  const [errors, setErrors] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Helper to change step and track visited steps without cascading renders in an effect
  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    setVisitedSteps((prev) => (prev.includes(stepNumber) ? prev : [...prev, stepNumber]));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if form has dirty modifications
  const isFormDirty = useMemo(() => {
    return (
      basic.name.trim() !== "" ||
      basic.contactPerson.trim() !== "" ||
      location.address.trim() !== "" ||
      individualChargers.length !== 4
    );
  }, [basic, location, individualChargers]);

  // -------------------------------------------------------------
  // DERIVED COMPUTATIONS FOR STEP 3 & REVIEW
  // -------------------------------------------------------------
  const totalChargersCount = individualChargers.length;
  const availableChargersCount = individualChargers.filter(
    (c) => c.status === "Available"
  ).length;
  const uniqueConnectors = useMemo(() => {
    return Array.from(new Set(individualChargers.map((c) => c.connectorType)));
  }, [individualChargers]);
  const peakPowerRating = useMemo(() => {
    const powers = individualChargers.map((c) => Number(c.power) || 0);
    return powers.length > 0 ? Math.max(...powers) : 0;
  }, [individualChargers]);

  // -------------------------------------------------------------
  // STEP VALIDATION LOGIC
  // -------------------------------------------------------------
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!basic.name.trim()) {
        newErrors.name = "Station Name is required.";
      } else if (basic.name.trim().length < 3) {
        newErrors.name = "Station Name must be at least 3 characters.";
      }

      if (!basic.description.trim()) {
        newErrors.description = "Station Description is required.";
      } else if (basic.description.trim().length < 10) {
        newErrors.description =
          "Please enter at least 10 characters describing this hub.";
      }

      if (!basic.contactPerson.trim()) {
        newErrors.contactPerson = "Contact Person name is required.";
      }

      if (!basic.contactPhone.trim()) {
        newErrors.contactPhone = "Contact Phone Number is required.";
      } else {
        // Sri Lankan phone validation (+94 or 07x or standard 9-10 digits)
        const cleanPhone = basic.contactPhone.replace(/[\s\-()]/g, "");
        if (!/^(?:\+94|0)[0-9]{9,10}$/.test(cleanPhone)) {
          newErrors.contactPhone =
            "Enter a valid phone number (e.g. +94 77 123 4567 or 0771234567).";
        }
      }

      if (!basic.contactEmail.trim()) {
        newErrors.contactEmail = "Contact Email is required.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basic.contactEmail.trim())
      ) {
        newErrors.contactEmail = "Enter a valid email address.";
      }
    }

    if (stepNumber === 2) {
      if (!location.address.trim()) {
        newErrors.address = "Full Street Address is required.";
      }
      if (!location.city.trim()) {
        newErrors.city = "City / Town is required.";
      }
      if (!location.province.trim()) {
        newErrors.province = "Province is required.";
      }

      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = "Valid latitude between -90 and 90 is required.";
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = "Valid longitude between -180 and 180 is required.";
      }
    }

    if (stepNumber === 3) {
      if (individualChargers.length === 0) {
        newErrors.chargers = "At least one individual charger bay is required.";
      } else {
        // Check for duplicate charger IDs
        const ids = individualChargers.map((c) => c.id.trim().toUpperCase());
        const duplicates = ids.filter(
          (item, index) => ids.indexOf(item) !== index
        );
        if (duplicates.length > 0) {
          newErrors.chargers = `Duplicate Charger ID found: ${duplicates[0]}. Each charger ID must be unique.`;
        }
      }
    }

    if (stepNumber === 4) {
      const price = parseFloat(pricing.pricePerKwh);
      if (isNaN(price) || price <= 0) {
        newErrors.pricePerKwh = "Default price per kWh must be greater than 0.";
      }

      if (pricing.parkingFee) {
        const park = parseFloat(pricing.parkingFee);
        if (isNaN(park) || park < 0) {
          newErrors.parkingFee = "Parking fee cannot be negative.";
        }
      }

      if (pricing.sessionFee) {
        const sess = parseFloat(pricing.sessionFee);
        if (isNaN(sess) || sess < 0) {
          newErrors.sessionFee = "Session fee cannot be negative.";
        }
      }
    }

    if (stepNumber === 5) {
      if (!primaryImageSrc) {
        newErrors.image = "Please select or upload at least one station image.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step Navigation Handlers
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        goToStep(currentStep + 1);
      }
    } else {
      showToast("Please review and fix the highlighted fields to continue.");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleStepJump = (stepNumber) => {
    // Owners can navigate to any previously visited step or current step
    if (stepNumber <= currentStep || visitedSteps.includes(stepNumber)) {
      goToStep(stepNumber);
    } else {
      // Validate current step before advancing
      if (validateStep(currentStep)) {
        goToStep(stepNumber);
      } else {
        showToast("Please complete the required fields in this step first.");
      }
    }
  };

  // -------------------------------------------------------------
  // STEP 2: CITY PRESET PICKER
  // -------------------------------------------------------------
  const handleSelectCityPreset = (preset) => {
    setLocation((prev) => ({
      ...prev,
      city: preset.name,
      district: preset.name,
      province: preset.province,
      latitude: preset.lat,
      longitude: preset.lng,
    }));
    showToast(`Coordinates updated for ${preset.name}.`);
  };

  // -------------------------------------------------------------
  // STEP 3: INDIVIDUAL CHARGER ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddCharger = () => {
    // Suggest next unique ID
    const nextNum = individualChargers.length + 1;
    const padded = String(nextNum).padStart(2, "0");
    setChargerForm({
      id: `CP-${padded}`,
      name: `Bay ${padded} - Ultra-Fast DC`,
      connectorType: "CCS",
      chargingType: "DC",
      power: 150,
      pricePerKwh: Number(pricing.pricePerKwh) || 85,
      status: "Available",
    });
    setEditingChargerIndex(null);
    setChargerFormErrors({});
    setChargerModalOpen(true);
  };

  const handleOpenEditCharger = (index) => {
    const target = individualChargers[index];
    setChargerForm({ ...target });
    setEditingChargerIndex(index);
    setChargerFormErrors({});
    setChargerModalOpen(true);
  };

  const handleRemoveCharger = (indexToRemove) => {
    if (individualChargers.length <= 1) {
      showToast("At least one charger bay is required.");
      return;
    }
    const removedId = individualChargers[indexToRemove].id;
    setIndividualChargers((prev) =>
      prev.filter((_, idx) => idx !== indexToRemove)
    );
    showToast(`Charger "${removedId}" removed.`);
  };

  const handleSaveChargerModal = () => {
    const newErrors = {};
    const idTrimmed = chargerForm.id.trim().toUpperCase();

    if (!idTrimmed) {
      newErrors.id = "Charger ID is required (e.g. CP-01).";
    } else {
      // Check for duplicate ID against other chargers
      const exists = individualChargers.some((c, idx) => {
        if (editingChargerIndex !== null && idx === editingChargerIndex) {
          return false;
        }
        return c.id.trim().toUpperCase() === idTrimmed;
      });
      if (exists) {
        newErrors.id = `Charger ID "${idTrimmed}" already exists. ID must be unique.`;
      }
    }

    if (!chargerForm.name.trim()) {
      newErrors.name = "Charger Name / Bay Label is required.";
    }

    const pwr = Number(chargerForm.power);
    if (isNaN(pwr) || pwr <= 0) {
      newErrors.power = "Power output must be greater than 0 kW.";
    }

    const price = Number(chargerForm.pricePerKwh);
    if (isNaN(price) || price <= 0) {
      newErrors.pricePerKwh = "Price per kWh must be greater than 0 LKR.";
    }

    if (Object.keys(newErrors).length > 0) {
      setChargerFormErrors(newErrors);
      return;
    }

    const validatedRecord = {
      ...chargerForm,
      id: idTrimmed,
      name: chargerForm.name.trim(),
      power: pwr,
      pricePerKwh: price,
      chargingType:
        chargerForm.connectorType === "Type 2"
          ? "AC"
          : chargerForm.chargingType || "DC",
    };

    if (editingChargerIndex !== null) {
      // Update existing charger
      setIndividualChargers((prev) =>
        prev.map((c, idx) =>
          idx === editingChargerIndex ? validatedRecord : c
        )
      );
      showToast(`Charger "${validatedRecord.id}" updated.`);
    } else {
      // Append new charger
      setIndividualChargers((prev) => [...prev, validatedRecord]);
      showToast(`Charger "${validatedRecord.id}" added.`);
    }

    setChargerModalOpen(false);
  };

  // Quick 4-Bay Standard Hub Template
  const handleApplyPresetChargers = () => {
    setIndividualChargers([
      {
        id: "CP-01",
        name: "Bay 01 - Ultra-Fast DC",
        connectorType: "CCS",
        chargingType: "DC",
        power: 150,
        pricePerKwh: 85,
        status: "Available",
      },
      {
        id: "CP-02",
        name: "Bay 02 - Ultra-Fast DC",
        connectorType: "CCS",
        chargingType: "DC",
        power: 150,
        pricePerKwh: 85,
        status: "Available",
      },
      {
        id: "CP-03",
        name: "Bay 03 - Multi-Standard DC",
        connectorType: "CHAdeMO",
        chargingType: "DC",
        power: 60,
        pricePerKwh: 85,
        status: "Available",
      },
      {
        id: "CP-04",
        name: "Bay 04 - AC Fast Mennekes",
        connectorType: "Type 2",
        chargingType: "AC",
        power: 22,
        pricePerKwh: 80,
        status: "Available",
      },
    ]);
    showToast("Standard 4-bay configuration loaded.");
  };

  // -------------------------------------------------------------
  // STEP 5: SCHEDULE & IMAGE HANDLERS
  // -------------------------------------------------------------
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
    showToast("Monday schedule applied to all 7 days.");
  };

  const toggleFacility = (facilityName) => {
    setFacilities((prev) =>
      prev.includes(facilityName)
        ? prev.filter((f) => f !== facilityName)
        : [...prev, facilityName]
    );
  };

  // Image Upload with Canvas Downsampling
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image file size must be less than 5MB.");
      return;
    }

    try {
      showToast("Processing and optimizing image...");
      const compressedDataUrl = await compressImageFile(file, 800, 0.72);
      const newImgItem = {
        id: `custom-${Date.now()}`,
        src: compressedDataUrl,
        label: file.name.replace(/\.[^/.]+$/, "") || "Custom Station Photo",
        isPrimary: galleryImages.length === 0,
      };

      setGalleryImages((prev) => [newImgItem, ...prev]);
      if (galleryImages.length === 0 || !primaryImageSrc) {
        setPrimaryImageSrc(compressedDataUrl);
      }
      showToast("Photo uploaded and compressed successfully!");
    } catch (err) {
      console.error("Image processing error:", err);
      showToast("Failed to process image. Please try another file.");
    }
  };

  const handleSetPrimaryImage = (src) => {
    setPrimaryImageSrc(src);
    setGalleryImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.src === src,
      }))
    );
    showToast("Primary station photo updated.");
  };

  const handleRemoveImage = (idToRemove) => {
    if (galleryImages.length <= 1) {
      showToast("At least one station photo is recommended.");
      return;
    }
    const remaining = galleryImages.filter((img) => img.id !== idToRemove);
    setGalleryImages(remaining);
    if (!remaining.some((img) => img.src === primaryImageSrc)) {
      setPrimaryImageSrc(remaining[0].src);
    }
    showToast("Photo removed from gallery.");
  };

  // -------------------------------------------------------------
  // SAVE & REGISTER STATION
  // -------------------------------------------------------------
  const handleSaveStation = (isDraft = false) => {
    // If not draft, validate all 5 steps
    if (!isDraft) {
      for (let s = 1; s <= 5; s++) {
        const stepValid = validateStep(s);
        if (!stepValid) {
          goToStep(s);
          showToast(`Please complete required fields in Step ${s}.`);
          return;
        }
      }
    } else {
      // Draft minimal check
      if (!basic.name.trim()) {
        setErrors({ name: "Station Name is required to save as Draft." });
        goToStep(1);
        showToast("Enter at least a Station Name to save as draft.");
        return;
      }
    }

    setIsSaving(true);

    setTimeout(() => {
      const finalStatus = isDraft ? "Draft" : basic.status;
      const finalPrice = parseFloat(pricing.pricePerKwh) || 85;
      const finalSessionFee = pricing.sessionFee ? parseFloat(pricing.sessionFee) : 0;
      const finalParkingFee = pricing.parkingFee ? parseFloat(pricing.parkingFee) : 0;

      const newStationRecord = {
        id: Date.now(),
        ownerId: "owner_01",
        name: basic.name.trim() || "Untitled Charging Hub",
        description:
          basic.description.trim() ||
          "Premium EV charging station providing reliable charging services.",
        status: finalStatus,
        stationType: basic.stationType,
        sourceType: "EVCHARGEHUB", // Canonical verified source

        // Contact Info
        contactPerson: basic.contactPerson.trim() || "Kasun Perera",
        contactPhone: basic.contactPhone.trim() || "+94 77 123 4567",
        contactEmail: basic.contactEmail.trim() || "support@evchargehub.lk",

        // Location Details
        country: "Sri Lanka",
        province: location.province,
        district: location.district,
        city: location.city.trim() || "Galle",
        address:
          location.address.trim() ||
          `${location.city}, ${location.province}, Sri Lanka`,
        postalCode: location.postalCode.trim() || "80000",
        latitude: parseFloat(location.latitude) || 6.0535,
        longitude: parseFloat(location.longitude) || 80.221,
        position: [
          parseFloat(location.latitude) || 6.0535,
          parseFloat(location.longitude) || 80.221,
        ],

        // Individual Chargers
        individualChargers: individualChargers.map((c) => ({
          id: c.id,
          name: c.name,
          connectorType: c.connectorType,
          chargingType: c.chargingType || (c.connectorType === "Type 2" ? "AC" : "DC"),
          power: Number(c.power) || 120,
          pricePerKwh: Number(c.pricePerKwh) || finalPrice,
          status: c.status || "Available",
          stationId: Date.now(),
          lastUpdated: "Just now",
        })),

        // Pricing & Booking Rules
        pricing: {
          pricePerKwh: finalPrice,
          sessionFee: finalSessionFee,
          parkingFee: finalParkingFee,
        },
        price: `LKR ${finalPrice}`,
        pricePerKwh: finalPrice,
        sessionFee: finalSessionFee,
        parkingFee: finalParkingFee,
        bookingEnabled: pricing.bookingEnabled,
        maxBookingDuration: pricing.maxBookingDuration,
        cancellationPolicy: pricing.cancellationPolicy,
        bookingInstructions: pricing.bookingInstructions.trim(),

        // Operating Hours & Facilities
        isOpen24Hours: isOpen24Hours,
        openingHours: isOpen24Hours
          ? "Open 24 Hours"
          : `${weeklyHours.Monday?.from || "06:00"} - ${weeklyHours.Monday?.to || "22:00"}`,
        weeklyHours: weeklyHours,
        facilities: facilities.length > 0 ? facilities : ["Restrooms", "Parking", "Wi-Fi"],

        // Images
        image: primaryImageSrc || ruhunaImage,
        galleryImages: galleryImages.map((g) => ({
          id: g.id,
          src: g.src,
          label: g.label,
          isPrimary: g.src === primaryImageSrc,
        })),

        // Performance & Metadata
        rating: 5.0,
        reviews: 0,
        todayBookings: 0,
        todayRevenue: "LKR 0",
        createdAt: new Date().toISOString(),
      };

      // Synchronize availability counts, connector types, and grouped configs
      const syncedRecord = syncStationAvailability(newStationRecord);

      try {
        const existingStations = getOwnerStations();
        const updatedList = [syncedRecord, ...existingStations];
        saveOwnerStations(updatedList);
      } catch (err) {
        console.error("Failed to save station to localStorage:", err);
      }

      setIsSaving(false);
      setCreatedStationRecord(syncedRecord);
      setShowSuccessModal(true);
    }, 600);
  };

  return (
    <div className="owner-add-station-v2">
      {/* HEADER WITH BREADCRUMBS */}
      <OwnerHeader
        title="Add New Charging Hub"
        subtitle="Complete the registration steps below to onboard and configure a new EV charging location."
        breadcrumbs={[
          { label: "My Stations", to: "/owner/stations" },
          { label: "Add New Station" },
        ]}
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="add-station-toast" role="status">
          <span className="toast-icon">✓</span>
          <p>{toastMessage}</p>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <div className="form-top-bar">
        <button
          type="button"
          className="exit-back-link"
          onClick={() => {
            if (isFormDirty) {
              setShowExitModal(true);
            } else {
              navigate("/owner/stations");
            }
          }}
        >
          <ArrowLeftIcon size={16} />
          <span>Back to My Stations</span>
        </button>

        <div className="top-bar-stats">
          <span className="step-count-badge">
            Step {currentStep} of 6
          </span>
          <span className="step-name-badge">
            {FORM_STEPS[currentStep - 1].title}
          </span>
        </div>
      </div>

      {/* =========================================================
          STEPPER PROGRESS BAR
      ========================================================== */}
      <nav className="stepper-nav-container" aria-label="Registration Progress">
        <ol className="stepper-track">
          {FORM_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isClickable =
              step.id <= currentStep || visitedSteps.includes(step.id);

            return (
              <li
                key={step.id}
                className={`stepper-step-item ${
                  isActive ? "active" : isCompleted ? "completed" : "upcoming"
                } ${isClickable ? "clickable" : ""}`}
                onClick={() => handleStepJump(step.id)}
                aria-current={isActive ? "step" : undefined}
              >
                <div className="step-bubble">
                  {isCompleted ? (
                    <CheckIcon size={14} className="check-svg" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="step-meta">
                  <strong className="step-title">{step.title}</strong>
                  <span className="step-subtitle">{step.subtitle}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* =========================================================
          MULTI-STEP FORM BODY
      ========================================================== */}
      <main className="form-workspace-card">
        {/* =======================================================
            STEP 1: BASIC INFORMATION
        ======================================================== */}
        {currentStep === 1 && (
          <section className="step-pane" id="step-basic-info">
            <div className="pane-header">
              <div className="pane-icon emerald">
                <BuildingIcon size={24} />
              </div>
              <div>
                <h2>Step 1: Basic Station Information</h2>
                <p>
                  Establish the identity, operational classification, and primary
                  station contact details.
                </p>
              </div>
            </div>

            <div className="pane-body">
              {/* STATION NAME */}
              <div className="form-field-group">
                <label htmlFor="station-name-input">
                  Station Name <span className="req-asterisk">*</span>
                </label>
                <input
                  id="station-name-input"
                  type="text"
                  placeholder="e.g. Galle Marine Drive Supercharger Hub"
                  value={basic.name}
                  onChange={(e) => {
                    setBasic({ ...basic, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  className={errors.name ? "input-err" : ""}
                />
                {errors.name && (
                  <span className="field-err-msg">{errors.name}</span>
                )}
                <small className="field-hint">
                  A recognizable name displayed to EV drivers on maps and booking receipts.
                </small>
              </div>

              {/* STATION DESCRIPTION */}
              <div className="form-field-group">
                <label htmlFor="station-desc-input">
                  Station Description <span className="req-asterisk">*</span>
                </label>
                <textarea
                  id="station-desc-input"
                  rows={3}
                  placeholder="Describe your charging location, nearby landmarks, security features, and amenities..."
                  value={basic.description}
                  onChange={(e) => {
                    setBasic({ ...basic, description: e.target.value });
                    if (errors.description)
                      setErrors({ ...errors, description: null });
                  }}
                  className={errors.description ? "input-err" : ""}
                />
                {errors.description && (
                  <span className="field-err-msg">{errors.description}</span>
                )}
              </div>

              {/* STATION TYPE & STATUS GRID */}
              <div className="form-two-col">
                <div className="form-field-group">
                  <label htmlFor="station-type-select">Station Type</label>
                  <select
                    id="station-type-select"
                    value={basic.stationType}
                    onChange={(e) =>
                      setBasic({ ...basic, stationType: e.target.value })
                    }
                  >
                    <option value="Public Charging Station">
                      Public (Open to all EV drivers)
                    </option>
                    <option value="Semi-Public">
                      Semi-Public (Commercial / Hotel / University)
                    </option>
                    <option value="Private Charging Station">
                      Private (Fleet & Private Property only)
                    </option>
                  </select>
                  <small className="field-hint">
                    Public & Semi-Public stations are published on the EV driver map.
                  </small>
                </div>

                <div className="form-field-group">
                  <label htmlFor="station-status-select">Operational Status</label>
                  <select
                    id="station-status-select"
                    value={basic.status}
                    onChange={(e) =>
                      setBasic({ ...basic, status: e.target.value })
                    }
                  >
                    <option value="Active">Active (Accepting Bookings)</option>
                    <option value="Temporarily Closed">Temporarily Closed</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                  <small className="field-hint">
                    Active status enables instant online driver reservations.
                  </small>
                </div>
              </div>

              {/* CONTACT DETAILS SUB-SECTION */}
              <div className="sub-section-divider">
                <h3>Contact & Operator Details</h3>
                <p>Authorized point of contact for driver support and station audits.</p>
              </div>

              <div className="form-three-col">
                <div className="form-field-group">
                  <label htmlFor="contact-person-input">
                    Contact Person <span className="req-asterisk">*</span>
                  </label>
                  <div className="input-with-icon">
                    <UserIcon size={16} className="leading-icon" />
                    <input
                      id="contact-person-input"
                      type="text"
                      placeholder="e.g. Kasun Perera"
                      value={basic.contactPerson}
                      onChange={(e) => {
                        setBasic({ ...basic, contactPerson: e.target.value });
                        if (errors.contactPerson)
                          setErrors({ ...errors, contactPerson: null });
                      }}
                      className={errors.contactPerson ? "input-err" : ""}
                    />
                  </div>
                  {errors.contactPerson && (
                    <span className="field-err-msg">{errors.contactPerson}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-phone-input">
                    Contact Phone Number <span className="req-asterisk">*</span>
                  </label>
                  <div className="input-with-icon">
                    <PhoneIcon size={16} className="leading-icon" />
                    <input
                      id="contact-phone-input"
                      type="tel"
                      placeholder="e.g. +94 77 123 4567"
                      value={basic.contactPhone}
                      onChange={(e) => {
                        setBasic({ ...basic, contactPhone: e.target.value });
                        if (errors.contactPhone)
                          setErrors({ ...errors, contactPhone: null });
                      }}
                      className={errors.contactPhone ? "input-err" : ""}
                    />
                  </div>
                  {errors.contactPhone && (
                    <span className="field-err-msg">{errors.contactPhone}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-email-input">
                    Contact Email <span className="req-asterisk">*</span>
                  </label>
                  <div className="input-with-icon">
                    <MailIcon size={16} className="leading-icon" />
                    <input
                      id="contact-email-input"
                      type="email"
                      placeholder="e.g. support@evchargehub.lk"
                      value={basic.contactEmail}
                      onChange={(e) => {
                        setBasic({ ...basic, contactEmail: e.target.value });
                        if (errors.contactEmail)
                          setErrors({ ...errors, contactEmail: null });
                      }}
                      className={errors.contactEmail ? "input-err" : ""}
                    />
                  </div>
                  {errors.contactEmail && (
                    <span className="field-err-msg">{errors.contactEmail}</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =======================================================
            STEP 2: LOCATION DETAILS & INTERACTIVE LEAFLET MAP
        ======================================================== */}
        {currentStep === 2 && (
          <section className="step-pane" id="step-location">
            <div className="pane-header">
              <div className="pane-icon emerald">
                <LocationIcon size={24} />
              </div>
              <div>
                <h2>Step 2: Location Details & Interactive Map</h2>
                <p>
                  Pin exact GPS coordinates on the interactive map and supply the
                  physical street address.
                </p>
              </div>
            </div>

            <div className="pane-body">
              {/* COUNTRY & PROVINCE */}
              <div className="form-two-col">
                <div className="form-field-group">
                  <label>Country</label>
                  <div className="static-field-badge">
                    <span className="flag-em">🇱🇰</span>
                    <strong>Sri Lanka</strong>
                    <span className="badge-tag">Default Region</span>
                  </div>
                </div>

                <div className="form-field-group">
                  <label htmlFor="province-select">
                    Province <span className="req-asterisk">*</span>
                  </label>
                  <select
                    id="province-select"
                    value={location.province}
                    onChange={(e) =>
                      setLocation({ ...location, province: e.target.value })
                    }
                  >
                    {SRI_LANKA_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CITY & POSTAL CODE */}
              <div className="form-two-col">
                <div className="form-field-group">
                  <label htmlFor="city-input">
                    District / City <span className="req-asterisk">*</span>
                  </label>
                  <input
                    id="city-input"
                    type="text"
                    placeholder="e.g. Galle, Matara, Colombo..."
                    value={location.city}
                    onChange={(e) => {
                      setLocation({
                        ...location,
                        city: e.target.value,
                        district: e.target.value,
                      });
                      if (errors.city) setErrors({ ...errors, city: null });
                    }}
                    className={errors.city ? "input-err" : ""}
                  />
                  {errors.city && (
                    <span className="field-err-msg">{errors.city}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="postal-input">Postal Code</label>
                  <input
                    id="postal-input"
                    type="text"
                    placeholder="e.g. 80000"
                    value={location.postalCode}
                    onChange={(e) =>
                      setLocation({ ...location, postalCode: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* STREET ADDRESS */}
              <div className="form-field-group">
                <label htmlFor="address-input">
                  Full Street Address <span className="req-asterisk">*</span>
                </label>
                <input
                  id="address-input"
                  type="text"
                  placeholder="e.g. Marine Drive, Galle 80000, Sri Lanka"
                  value={location.address}
                  onChange={(e) => {
                    setLocation({ ...location, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: null });
                  }}
                  className={errors.address ? "input-err" : ""}
                />
                {errors.address && (
                  <span className="field-err-msg">{errors.address}</span>
                )}
              </div>

              {/* QUICK CITY PRESETS */}
              <div className="city-presets-strip">
                <span className="presets-label">Quick City Presets:</span>
                <div className="presets-chips">
                  {CITY_PRESETS.map((cp) => (
                    <button
                      key={cp.name}
                      type="button"
                      className={`city-preset-btn ${
                        location.city.toLowerCase() === cp.name.toLowerCase()
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectCityPreset(cp)}
                    >
                      {cp.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* INTERACTIVE LEAFLET MAP */}
              <div className="map-picker-wrapper">
                <div className="map-picker-topbar">
                  <div>
                    <strong>Interactive OpenStreetMap GPS Pinning</strong>
                    <p>
                      Click anywhere on the map or drag the green marker to position your charging bays.
                    </p>
                  </div>
                  <div className="coords-preview-tag">
                    <span>GPS:</span>
                    <strong>
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </strong>
                  </div>
                </div>

                <div className="interactive-leaflet-box">
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="v2-leaflet-map"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <DraggableLocationMarker
                      position={[location.latitude, location.longitude]}
                      onPositionChange={([lat, lng]) => {
                        setLocation((prev) => ({
                          ...prev,
                          latitude: lat,
                          longitude: lng,
                        }));
                        if (errors.latitude || errors.longitude) {
                          setErrors((prev) => ({
                            ...prev,
                            latitude: null,
                            longitude: null,
                          }));
                        }
                      }}
                    />
                    <MapFlyRecenter
                      position={[location.latitude, location.longitude]}
                    />
                  </MapContainer>
                </div>

                {/* MANUAL COORDINATE INPUTS */}
                <div className="form-two-col manual-coords-grid">
                  <div className="form-field-group">
                    <label htmlFor="lat-input">
                      Latitude <span className="req-asterisk">*</span>
                    </label>
                    <input
                      id="lat-input"
                      type="number"
                      step="0.0001"
                      placeholder="e.g. 6.0535"
                      value={location.latitude}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLocation({ ...location, latitude: val });
                        if (errors.latitude)
                          setErrors({ ...errors, latitude: null });
                      }}
                      className={errors.latitude ? "input-err" : ""}
                    />
                    {errors.latitude && (
                      <span className="field-err-msg">{errors.latitude}</span>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="lng-input">
                      Longitude <span className="req-asterisk">*</span>
                    </label>
                    <input
                      id="lng-input"
                      type="number"
                      step="0.0001"
                      placeholder="e.g. 80.2210"
                      value={location.longitude}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setLocation({ ...location, longitude: val });
                        if (errors.longitude)
                          setErrors({ ...errors, longitude: null });
                      }}
                      className={errors.longitude ? "input-err" : ""}
                    />
                    {errors.longitude && (
                      <span className="field-err-msg">{errors.longitude}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =======================================================
            STEP 3: CHARGER CONFIGURATION (INDIVIDUAL CHARGERS)
        ======================================================== */}
        {currentStep === 3 && (
          <section className="step-pane" id="step-chargers-config">
            <div className="pane-header">
              <div className="pane-icon emerald">
                <PlugIcon size={24} />
              </div>
              <div>
                <h2>Step 3: Charger Configuration</h2>
                <p>
                  Add and configure each individual charging point. Total chargers and
                  real-time availability are computed automatically.
                </p>
              </div>
            </div>

            <div className="pane-body">
              {/* CHARGER METRICS SUMMARY STRIP */}
              <div className="chargers-summary-strip">
                <div className="summary-stat-box">
                  <span className="stat-label">Total Chargers</span>
                  <strong className="stat-val">{totalChargersCount} Bays</strong>
                  <small>Auto-derived from bay count</small>
                </div>

                <div className="summary-stat-box">
                  <span className="stat-label">Initial Available</span>
                  <strong className="stat-val emerald-val">
                    {availableChargersCount} Ready
                  </strong>
                  <small>Ready for reservations</small>
                </div>

                <div className="summary-stat-box">
                  <span className="stat-label">Max Power Rating</span>
                  <strong className="stat-val">{peakPowerRating} kW</strong>
                  <small>Peak station capacity</small>
                </div>

                <div className="summary-stat-box">
                  <span className="stat-label">Connector Types</span>
                  <strong className="stat-val">
                    {uniqueConnectors.length > 0
                      ? uniqueConnectors.join(", ")
                      : "None"}
                  </strong>
                  <small>Supported standards</small>
                </div>
              </div>

              {/* ACTION BAR: ADD CHARGER & PRESETS */}
              <div className="chargers-action-bar">
                <div>
                  <h3 className="section-subheading">Configured Charging Equipment</h3>
                  <p className="section-subdesc">
                    Each bay has its own unique ID, connector hardware, power rating, and pricing.
                  </p>
                </div>

                <div className="chargers-btn-group">
                  <button
                    type="button"
                    className="preset-btn-secondary"
                    onClick={handleApplyPresetChargers}
                  >
                    Load 4-Bay Standard Hub
                  </button>

                  <button
                    type="button"
                    className="add-charger-btn-primary"
                    onClick={handleOpenAddCharger}
                  >
                    <PlusIcon size={16} />
                    <span>Add Individual Charger</span>
                  </button>
                </div>
              </div>

              {errors.chargers && (
                <div className="validation-alert-banner">
                  <AlertCircleIcon size={18} />
                  <span>{errors.chargers}</span>
                </div>
              )}

              {/* INDIVIDUAL CHARGERS TABLE */}
              <div className="chargers-table-card">
                <table className="chargers-inventory-table">
                  <thead>
                    <tr>
                      <th>Bay / Charger ID</th>
                      <th>Charger Name</th>
                      <th>Connector</th>
                      <th>Type & Power</th>
                      <th>Tariff (LKR/kWh)</th>
                      <th>Initial Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individualChargers.map((ch, idx) => {
                      const statusClass =
                        ch.status === "Available"
                          ? "status-available"
                          : ch.status === "In Use"
                          ? "status-inuse"
                          : ch.status === "Maintenance"
                          ? "status-maintenance"
                          : "status-offline";

                      return (
                        <tr key={ch.id || idx}>
                          <td>
                            <span className="bay-id-pill">{ch.id}</span>
                          </td>
                          <td>
                            <strong className="bay-name-cell">{ch.name}</strong>
                          </td>
                          <td>
                            <span className="connector-chip-sm">
                              <PlugIcon size={12} />
                              {ch.connectorType}
                            </span>
                          </td>
                          <td>
                            <span className="power-text">
                              <strong>{ch.power} kW</strong> ({ch.chargingType || "DC"})
                            </span>
                          </td>
                          <td>
                            <strong className="tariff-cell">
                              LKR {ch.pricePerKwh}
                            </strong>
                          </td>
                          <td>
                            <span className={`bay-status-badge ${statusClass}`}>
                              ● {ch.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="table-actions-cell">
                              <button
                                type="button"
                                className="table-edit-btn"
                                onClick={() => handleOpenEditCharger(idx)}
                                title="Edit Charger"
                              >
                                <EditIcon size={14} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                className="table-delete-btn"
                                onClick={() => handleRemoveCharger(idx)}
                                title="Remove Charger"
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* =======================================================
            STEP 4: PRICING AND BOOKING
        ======================================================== */}
        {currentStep === 4 && (
          <section className="step-pane" id="step-pricing-booking">
            <div className="pane-header">
              <div className="pane-icon emerald">
                <CreditCardIcon size={24} />
              </div>
              <div>
                <h2>Step 4: Pricing and Booking</h2>
                <p>
                  Define base energy rates, optional driver fees, reservation policies,
                  and driver arrival instructions.
                </p>
              </div>
            </div>

            <div className="pane-body">
              {/* DEFAULT PRICE PER KWH & OPTIONAL FEES */}
              <div className="form-three-col">
                <div className="form-field-group">
                  <label htmlFor="default-price-input">
                    Default Price per kWh (LKR) <span className="req-asterisk">*</span>
                  </label>
                  <div className="currency-input-box">
                    <span className="currency-prefix">LKR</span>
                    <input
                      id="default-price-input"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 85"
                      value={pricing.pricePerKwh}
                      onChange={(e) => {
                        setPricing({ ...pricing, pricePerKwh: e.target.value });
                        if (errors.pricePerKwh)
                          setErrors({ ...errors, pricePerKwh: null });
                      }}
                      className={errors.pricePerKwh ? "input-err" : ""}
                    />
                  </div>
                  {errors.pricePerKwh && (
                    <span className="field-err-msg">{errors.pricePerKwh}</span>
                  )}
                  <small className="field-hint">
                    Standard electricity tariff applied to charging sessions.
                  </small>
                </div>

                <div className="form-field-group">
                  <label htmlFor="parking-fee-input">Optional Parking Fee (LKR)</label>
                  <div className="currency-input-box">
                    <span className="currency-prefix">LKR</span>
                    <input
                      id="parking-fee-input"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (Free parking)"
                      value={pricing.parkingFee}
                      onChange={(e) =>
                        setPricing({ ...pricing, parkingFee: e.target.value })
                      }
                    />
                  </div>
                  <small className="field-hint">
                    Leave empty or 0 if parking is free during charge.
                  </small>
                </div>

                <div className="form-field-group">
                  <label htmlFor="session-fee-input">Optional Session Access Fee (LKR)</label>
                  <div className="currency-input-box">
                    <span className="currency-prefix">LKR</span>
                    <input
                      id="session-fee-input"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0 (No session fee)"
                      value={pricing.sessionFee}
                      onChange={(e) =>
                        setPricing({ ...pricing, sessionFee: e.target.value })
                      }
                    />
                  </div>
                  <small className="field-hint">
                    Fixed platform connection charge per plug-in.
                  </small>
                </div>
              </div>

              {/* BOOKING SETTINGS SUBSECTION */}
              <div className="sub-section-divider">
                <h3>Reservation & Driver Policies</h3>
                <p>Manage slot booking availability, durations, and cancellation rules.</p>
              </div>

              {/* BOOKING TOGGLE */}
              <div className="toggle-card-box">
                <div className="toggle-text-block">
                  <strong>Enable Driver Slot Reservations</strong>
                  <span>
                    Allows drivers to book charging bays in advance via the EVChargeHub driver app.
                  </span>
                </div>
                <label className="toggle-switch-v2">
                  <input
                    type="checkbox"
                    checked={pricing.bookingEnabled}
                    onChange={(e) =>
                      setPricing({ ...pricing, bookingEnabled: e.target.checked })
                    }
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              {/* BOOKING DETAILS GRID */}
              <div className="form-two-col">
                <div className="form-field-group">
                  <label htmlFor="max-duration-select">Maximum Booking Duration</label>
                  <select
                    id="max-duration-select"
                    value={pricing.maxBookingDuration}
                    onChange={(e) =>
                      setPricing({ ...pricing, maxBookingDuration: e.target.value })
                    }
                  >
                    <option value="30 mins">30 Minutes</option>
                    <option value="45 mins">45 Minutes</option>
                    <option value="60 mins">60 Minutes (Standard)</option>
                    <option value="90 mins">90 Minutes</option>
                    <option value="120 mins">120 Minutes (2 Hours)</option>
                    <option value="180 mins">180 Minutes (3 Hours)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label htmlFor="cancellation-policy-select">Cancellation Policy</label>
                  <select
                    id="cancellation-policy-select"
                    value={pricing.cancellationPolicy}
                    onChange={(e) =>
                      setPricing({ ...pricing, cancellationPolicy: e.target.value })
                    }
                  >
                    <option value="Free cancellation up to 15 minutes before scheduled session">
                      Flexible: Free cancellation up to 15 mins before
                    </option>
                    <option value="Free cancellation up to 30 minutes before scheduled session">
                      Standard: Free cancellation up to 30 mins before
                    </option>
                    <option value="Non-refundable once session time commences">
                      Strict: Non-refundable once scheduled slot begins
                    </option>
                  </select>
                </div>
              </div>

              {/* BOOKING INSTRUCTIONS */}
              <div className="form-field-group">
                <label htmlFor="booking-instructions-input">
                  Driver Booking & Arrival Instructions
                </label>
                <textarea
                  id="booking-instructions-input"
                  rows={3}
                  placeholder="e.g. Arrive 5 minutes prior to booking. Security guard will direct to Bay 01-04. Plug in cable and swipe app to activate."
                  value={pricing.bookingInstructions}
                  onChange={(e) =>
                    setPricing({ ...pricing, bookingInstructions: e.target.value })
                  }
                />
                <small className="field-hint">
                  These instructions appear in the driver's reservation confirmation email & ticket.
                </small>
              </div>
            </div>
          </section>
        )}

        {/* =======================================================
            STEP 5: OPERATING HOURS AND FACILITIES
        ======================================================== */}
        {currentStep === 5 && (
          <section className="step-pane" id="step-hours-facilities">
            <div className="pane-header">
              <div className="pane-icon emerald">
                <ClockIcon size={24} />
              </div>
              <div>
                <h2>Step 5: Operating Hours, Facilities & Photos</h2>
                <p>
                  Set your operating timetable, on-site driver conveniences, and upload
                  photographs of your hub.
                </p>
              </div>
            </div>

            <div className="pane-body">
              {/* OPERATING HOURS SECTION */}
              <div className="sub-section-divider">
                <h3>Operating Timetable</h3>
                <p>Define when drivers can physically access and utilize charging hardware.</p>
              </div>

              {/* 24/7 TOGGLE */}
              <div className="toggle-card-box">
                <div className="toggle-text-block">
                  <strong>Open 24 Hours / 7 Days</strong>
                  <span>
                    Continuous non-stop charging service throughout the week (recommended).
                  </span>
                </div>
                <label className="toggle-switch-v2">
                  <input
                    type="checkbox"
                    checked={isOpen24Hours}
                    onChange={(e) => setIsOpen24Hours(e.target.checked)}
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              {/* CUSTOM WEEKLY TIMETABLE */}
              {!isOpen24Hours && (
                <div className="weekly-schedule-box">
                  <div className="weekly-box-header">
                    <strong>Weekly Operating Schedule</strong>
                    <button
                      type="button"
                      className="preset-btn-secondary"
                      onClick={handleApplyMondayToAll}
                    >
                      Apply Monday to All Open Days
                    </button>
                  </div>

                  <div className="weekly-days-list">
                    {DAYS_OF_WEEK.map((day) => {
                      const daySchedule = weeklyHours[day];
                      return (
                        <div
                          key={day}
                          className={`day-row-card ${
                            daySchedule.open ? "open" : "closed"
                          }`}
                        >
                          <div className="day-name-block">
                            <label className="day-checkbox-label">
                              <input
                                type="checkbox"
                                checked={daySchedule.open}
                                onChange={() => handleDayToggle(day)}
                              />
                              <span className="day-name">{day}</span>
                            </label>
                          </div>

                          <div className="day-status-pill-col">
                            <span
                              className={`status-pill-sm ${
                                daySchedule.open ? "open" : "closed"
                              }`}
                            >
                              {daySchedule.open ? "Open" : "Closed"}
                            </span>
                          </div>

                          <div className="day-times-col">
                            {daySchedule.open ? (
                              <div className="time-pair-inputs">
                                <input
                                  type="time"
                                  value={daySchedule.from}
                                  onChange={(e) =>
                                    handleDayTimeChange(day, "from", e.target.value)
                                  }
                                />
                                <span>to</span>
                                <input
                                  type="time"
                                  value={daySchedule.to}
                                  onChange={(e) =>
                                    handleDayTimeChange(day, "to", e.target.value)
                                  }
                                />
                              </div>
                            ) : (
                              <span className="closed-label-text">
                                Station Closed all day
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FACILITIES SECTION */}
              <div className="sub-section-divider">
                <h3>On-Site Facilities & Amenities</h3>
                <p>Highlight available services for drivers during charging wait times.</p>
              </div>

              <div className="facilities-selection-grid">
                {FACILITY_OPTIONS.map((fac) => {
                  const isSelected = facilities.includes(fac.name);
                  const IconComp = fac.icon;
                  return (
                    <div
                      key={fac.name}
                      className={`facility-selection-card ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => toggleFacility(fac.name)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          toggleFacility(fac.name);
                        }
                      }}
                    >
                      <div className="facility-card-icon">
                        <IconComp size={20} />
                      </div>
                      <div className="facility-card-text">
                        <strong>{fac.name}</strong>
                        <span>{fac.desc}</span>
                      </div>
                      <div className="facility-check-circle">
                        {isSelected && <CheckIcon size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STATION IMAGES SECTION */}
              <div className="sub-section-divider">
                <h3>Station Photos & Visual Imagery</h3>
                <p>
                  Upload station photography or select from verified EVChargeHub hub presets.
                </p>
              </div>

              {/* PRESET HUB PHOTOS */}
              <div className="preset-photos-section">
                <span className="preset-section-label">
                  EVChargeHub Verified High-Resolution Photography:
                </span>
                <div className="preset-photos-grid">
                  {PRESET_IMAGES.map((preset) => {
                    const isPrimary = primaryImageSrc === preset.src;
                    return (
                      <div
                        key={preset.id}
                        className={`preset-photo-tile ${isPrimary ? "is-primary" : ""}`}
                        onClick={() => handleSetPrimaryImage(preset.src)}
                      >
                        <img src={preset.src} alt={preset.label} />
                        <div className="preset-photo-overlay">
                          <span>{preset.label}</span>
                          {isPrimary && (
                            <span className="primary-photo-tag">★ Primary</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM PHOTO UPLOAD DROPZONE */}
              <div className="photo-upload-zone">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <div
                  className="upload-dropzone-inner"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="upload-icon-circle">
                    <UploadIcon size={28} />
                  </div>
                  <strong>Upload Custom Station Photo</strong>
                  <p>Click to browse image files (PNG, JPG, or WEBP up to 5MB)</p>
                  <small>
                    Photos are automatically optimized and securely persisted to your local storage.
                  </small>
                </div>
              </div>

              {/* GALLERY MANAGER */}
              {galleryImages.length > 0 && (
                <div className="gallery-manager-strip">
                  <span className="gallery-label">Active Photo Gallery:</span>
                  <div className="gallery-thumbnails">
                    {galleryImages.map((img) => (
                      <div
                        key={img.id}
                        className={`gallery-thumb-item ${
                          primaryImageSrc === img.src ? "primary" : ""
                        }`}
                      >
                        <img src={img.src} alt={img.label} />
                        <div className="thumb-actions-bar">
                          {primaryImageSrc === img.src ? (
                            <span className="primary-pill">Primary</span>
                          ) : (
                            <button
                              type="button"
                              className="make-primary-btn"
                              onClick={() => handleSetPrimaryImage(img.src)}
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            className="remove-thumb-btn"
                            onClick={() => handleRemoveImage(img.id)}
                            title="Remove Photo"
                          >
                            <TrashIcon size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =======================================================
            STEP 6: REVIEW AND CONFIRMATION
        ======================================================== */}
        {currentStep === 6 && (
          <section className="step-pane" id="step-review-confirm">
            <div className="pane-header">
              <div className="pane-icon emerald">
                <CheckCircleIcon size={24} />
              </div>
              <div>
                <h2>Step 6: Review & Final Confirmation</h2>
                <p>
                  Verify all details before publishing this charging hub to your EVChargeHub
                  network. Click "Edit" on any section to make adjustments.
                </p>
              </div>
            </div>

            <div className="pane-body">
              {/* REVIEW CARD 1: BASIC INFORMATION */}
              <div className="review-summary-card">
                <div className="review-card-header">
                  <div className="card-header-left">
                    <BuildingIcon size={20} className="header-icon" />
                    <strong>1. Station Profile & Identity</strong>
                  </div>
                  <button
                    type="button"
                    className="review-edit-btn"
                    onClick={() => handleStepJump(1)}
                  >
                    <EditIcon size={14} />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="review-card-body">
                  <div className="review-grid-3">
                    <div className="review-field">
                      <small>Station Name</small>
                      <strong>{basic.name || "Untitled Station"}</strong>
                    </div>
                    <div className="review-field">
                      <small>Classification</small>
                      <span className="review-badge-type">{basic.stationType}</span>
                    </div>
                    <div className="review-field">
                      <small>Operational Status</small>
                      <span className={`review-badge-status ${basic.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        ● {basic.status}
                      </span>
                    </div>
                  </div>

                  <div className="review-field" style={{ marginTop: "12px" }}>
                    <small>Description</small>
                    <p className="review-text-desc">{basic.description}</p>
                  </div>

                  <div className="review-contact-strip">
                    <div className="contact-item">
                      <UserIcon size={14} />
                      <span>{basic.contactPerson}</span>
                    </div>
                    <div className="contact-item">
                      <PhoneIcon size={14} />
                      <span>{basic.contactPhone}</span>
                    </div>
                    <div className="contact-item">
                      <MailIcon size={14} />
                      <span>{basic.contactEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* REVIEW CARD 2: LOCATION DETAILS */}
              <div className="review-summary-card">
                <div className="review-card-header">
                  <div className="card-header-left">
                    <LocationIcon size={20} className="header-icon" />
                    <strong>2. Geographic Location & Coordinates</strong>
                  </div>
                  <button
                    type="button"
                    className="review-edit-btn"
                    onClick={() => handleStepJump(2)}
                  >
                    <EditIcon size={14} />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="review-card-body">
                  <div className="review-grid-3">
                    <div className="review-field">
                      <small>Street Address</small>
                      <strong>{location.address}</strong>
                    </div>
                    <div className="review-field">
                      <small>City & Province</small>
                      <strong>
                        {location.city}, {location.province}
                      </strong>
                    </div>
                    <div className="review-field">
                      <small>GPS Coordinates</small>
                      <strong className="emerald-val">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </strong>
                    </div>
                  </div>

                  {/* MINI MAP PREVIEW */}
                  <div className="review-mini-map-box">
                    <MapContainer
                      center={[location.latitude, location.longitude]}
                      zoom={14}
                      scrollWheelZoom={false}
                      className="review-mini-map"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[location.latitude, location.longitude]}>
                        <Popup>
                          <strong>{basic.name}</strong>
                          <br />
                          {location.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>

              {/* REVIEW CARD 3: INDIVIDUAL CHARGERS */}
              <div className="review-summary-card">
                <div className="review-card-header">
                  <div className="card-header-left">
                    <PlugIcon size={20} className="header-icon" />
                    <strong>3. Charging Equipment ({individualChargers.length} Bays)</strong>
                  </div>
                  <button
                    type="button"
                    className="review-edit-btn"
                    onClick={() => handleStepJump(3)}
                  >
                    <EditIcon size={14} />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="review-card-body">
                  <div className="review-metrics-pills">
                    <span className="metric-pill">
                      Total Chargers: <strong>{totalChargersCount}</strong>
                    </span>
                    <span className="metric-pill">
                      Available Now: <strong>{availableChargersCount}</strong>
                    </span>
                    <span className="metric-pill">
                      Peak Output: <strong>{peakPowerRating} kW</strong>
                    </span>
                    <span className="metric-pill">
                      Connectors: <strong>{uniqueConnectors.join(", ")}</strong>
                    </span>
                  </div>

                  <table className="review-chargers-table">
                    <thead>
                      <tr>
                        <th>Bay ID</th>
                        <th>Name</th>
                        <th>Connector</th>
                        <th>Type & Power</th>
                        <th>Price/kWh</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {individualChargers.map((ch) => (
                        <tr key={ch.id}>
                          <td>
                            <strong>{ch.id}</strong>
                          </td>
                          <td>{ch.name}</td>
                          <td>{ch.connectorType}</td>
                          <td>
                            {ch.power} kW ({ch.chargingType || "DC"})
                          </td>
                          <td>LKR {ch.pricePerKwh}</td>
                          <td>
                            <span className="bay-status-badge status-available">
                              {ch.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REVIEW CARD 4: PRICING & POLICIES */}
              <div className="review-summary-card">
                <div className="review-card-header">
                  <div className="card-header-left">
                    <CreditCardIcon size={20} className="header-icon" />
                    <strong>4. Tariffs, Fees & Booking Policy</strong>
                  </div>
                  <button
                    type="button"
                    className="review-edit-btn"
                    onClick={() => handleStepJump(4)}
                  >
                    <EditIcon size={14} />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="review-card-body">
                  <div className="review-grid-4">
                    <div className="review-field">
                      <small>Default Tariff</small>
                      <strong className="emerald-val">
                        LKR {pricing.pricePerKwh} / kWh
                      </strong>
                    </div>
                    <div className="review-field">
                      <small>Parking Fee</small>
                      <strong>
                        {pricing.parkingFee ? `LKR ${pricing.parkingFee}` : "Free"}
                      </strong>
                    </div>
                    <div className="review-field">
                      <small>Session Fee</small>
                      <strong>
                        {pricing.sessionFee ? `LKR ${pricing.sessionFee}` : "None"}
                      </strong>
                    </div>
                    <div className="review-field">
                      <small>Online Reservations</small>
                      <strong>
                        {pricing.bookingEnabled ? "Enabled (Live)" : "Disabled"}
                      </strong>
                    </div>
                  </div>

                  <div className="review-grid-2" style={{ marginTop: "12px" }}>
                    <div className="review-field">
                      <small>Max Slot Duration</small>
                      <strong>{pricing.maxBookingDuration}</strong>
                    </div>
                    <div className="review-field">
                      <small>Cancellation Rule</small>
                      <strong>{pricing.cancellationPolicy}</strong>
                    </div>
                  </div>

                  {pricing.bookingInstructions && (
                    <div className="review-field" style={{ marginTop: "12px" }}>
                      <small>Driver Arrival Instructions</small>
                      <p className="review-text-desc">{pricing.bookingInstructions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* REVIEW CARD 5: HOURS, FACILITIES & PHOTOS */}
              <div className="review-summary-card">
                <div className="review-card-header">
                  <div className="card-header-left">
                    <ClockIcon size={20} className="header-icon" />
                    <strong>5. Timetable, Facilities & Primary Photo</strong>
                  </div>
                  <button
                    type="button"
                    className="review-edit-btn"
                    onClick={() => handleStepJump(5)}
                  >
                    <EditIcon size={14} />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="review-card-body">
                  <div className="review-hours-photo-grid">
                    <div>
                      <div className="review-field">
                        <small>Public Timetable</small>
                        <strong>
                          {isOpen24Hours
                            ? "Open 24 Hours / 7 Days a Week"
                            : "Custom Weekly Timetable"}
                        </strong>
                      </div>

                      <div className="review-field" style={{ marginTop: "14px" }}>
                        <small>On-Site Facilities ({facilities.length})</small>
                        <div className="review-facilities-chips">
                          {facilities.map((fac) => (
                            <span key={fac} className="review-fac-chip">
                              ✓ {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="review-primary-photo-box">
                      <small>Selected Primary Photo</small>
                      <img
                        src={primaryImageSrc}
                        alt="Primary Hub Preview"
                        className="review-photo-img"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            BOTTOM NAVIGATION FOOTER (PREVIOUS / NEXT / SAVE)
        ========================================================== */}
        <footer className="form-action-footer">
          <div className="footer-left">
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn-step-prev"
                onClick={handlePrevStep}
              >
                <ArrowLeftIcon size={16} />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-step-cancel"
                onClick={() => {
                  if (isFormDirty) setShowExitModal(true);
                  else navigate("/owner/stations");
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="footer-right">
            <button
              type="button"
              className="btn-save-draft"
              onClick={() => handleSaveStation(true)}
              disabled={isSaving}
            >
              Save as Draft
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                className="btn-step-next"
                onClick={handleNextStep}
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRightIcon size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-submit-station"
                onClick={() => handleSaveStation(false)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-dot" />
                    <span>Registering Hub...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon size={18} />
                    <span>Save & Publish Station</span>
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      </main>

      {/* =========================================================
          MODAL: ADD / EDIT INDIVIDUAL CHARGER
      ========================================================== */}
      {chargerModalOpen && (
        <div
          className="charger-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target.classList.contains("charger-modal-backdrop")) {
              setChargerModalOpen(false);
            }
          }}
        >
          <div className="charger-modal-card">
            <div className="charger-modal-header">
              <div>
                <h3>
                  {editingChargerIndex !== null
                    ? `Edit Charger: ${chargerForm.id}`
                    : "Add Individual Charger Bay"}
                </h3>
                <p>Configure hardware specs, power ratings and connector types.</p>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setChargerModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="charger-modal-body">
              <div className="form-two-col">
                <div className="form-field-group">
                  <label htmlFor="modal-charger-id">
                    Unique Charger ID <span className="req-asterisk">*</span>
                  </label>
                  <input
                    id="modal-charger-id"
                    type="text"
                    placeholder="e.g. CP-01, BAY-01"
                    value={chargerForm.id}
                    onChange={(e) => {
                      setChargerForm({
                        ...chargerForm,
                        id: e.target.value.toUpperCase(),
                      });
                      if (chargerFormErrors.id)
                        setChargerFormErrors({ ...chargerFormErrors, id: null });
                    }}
                    className={chargerFormErrors.id ? "input-err" : ""}
                  />
                  {chargerFormErrors.id && (
                    <span className="field-err-msg">{chargerFormErrors.id}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="modal-charger-name">
                    Charger Label / Name <span className="req-asterisk">*</span>
                  </label>
                  <input
                    id="modal-charger-name"
                    type="text"
                    placeholder="e.g. Bay 01 - Ultra-Fast DC"
                    value={chargerForm.name}
                    onChange={(e) => {
                      setChargerForm({ ...chargerForm, name: e.target.value });
                      if (chargerFormErrors.name)
                        setChargerFormErrors({
                          ...chargerFormErrors,
                          name: null,
                        });
                    }}
                    className={chargerFormErrors.name ? "input-err" : ""}
                  />
                  {chargerFormErrors.name && (
                    <span className="field-err-msg">
                      {chargerFormErrors.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-two-col">
                <div className="form-field-group">
                  <label htmlFor="modal-connector-type">Connector Standard</label>
                  <select
                    id="modal-connector-type"
                    value={chargerForm.connectorType}
                    onChange={(e) => {
                      const newConn = e.target.value;
                      const autoType = newConn === "Type 2" ? "AC" : "DC";
                      const autoPwr =
                        newConn === "Type 2"
                          ? 22
                          : newConn === "CHAdeMO"
                          ? 60
                          : 150;
                      setChargerForm({
                        ...chargerForm,
                        connectorType: newConn,
                        chargingType: autoType,
                        power: autoPwr,
                      });
                    }}
                  >
                    <option value="CCS">CCS (Combined Charging System)</option>
                    <option value="Type 2">Type 2 (Mennekes AC)</option>
                    <option value="CHAdeMO">CHAdeMO (DC Fast)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label htmlFor="modal-charging-type">Charging Type</label>
                  <select
                    id="modal-charging-type"
                    value={chargerForm.chargingType}
                    onChange={(e) =>
                      setChargerForm({
                        ...chargerForm,
                        chargingType: e.target.value,
                      })
                    }
                  >
                    <option value="DC">DC Rapid / Ultra-Fast</option>
                    <option value="AC">AC Standard / Fast</option>
                  </select>
                </div>
              </div>

              <div className="form-three-col">
                <div className="form-field-group">
                  <label htmlFor="modal-power-output">
                    Power Output (kW) <span className="req-asterisk">*</span>
                  </label>
                  <input
                    id="modal-power-output"
                    type="number"
                    min="1"
                    max="500"
                    placeholder="e.g. 150"
                    value={chargerForm.power}
                    onChange={(e) => {
                      setChargerForm({ ...chargerForm, power: e.target.value });
                      if (chargerFormErrors.power)
                        setChargerFormErrors({
                          ...chargerFormErrors,
                          power: null,
                        });
                    }}
                    className={chargerFormErrors.power ? "input-err" : ""}
                  />
                  {chargerFormErrors.power && (
                    <span className="field-err-msg">
                      {chargerFormErrors.power}
                    </span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="modal-price-kwh">
                    Price / kWh (LKR) <span className="req-asterisk">*</span>
                  </label>
                  <input
                    id="modal-price-kwh"
                    type="number"
                    min="1"
                    placeholder="e.g. 85"
                    value={chargerForm.pricePerKwh}
                    onChange={(e) => {
                      setChargerForm({
                        ...chargerForm,
                        pricePerKwh: e.target.value,
                      });
                      if (chargerFormErrors.pricePerKwh)
                        setChargerFormErrors({
                          ...chargerFormErrors,
                          pricePerKwh: null,
                        });
                    }}
                    className={chargerFormErrors.pricePerKwh ? "input-err" : ""}
                  />
                  {chargerFormErrors.pricePerKwh && (
                    <span className="field-err-msg">
                      {chargerFormErrors.pricePerKwh}
                    </span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="modal-charger-status">Initial Status</label>
                  <select
                    id="modal-charger-status"
                    value={chargerForm.status}
                    onChange={(e) =>
                      setChargerForm({ ...chargerForm, status: e.target.value })
                    }
                  >
                    <option value="Available">Available (Online)</option>
                    <option value="In Use">In Use (Charging)</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="charger-modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setChargerModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={handleSaveChargerModal}
              >
                {editingChargerIndex !== null ? "Update Charger" : "Add Charger"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: UNSAVED CHANGES WARNING
      ========================================================== */}
      {showExitModal && (
        <div className="charger-modal-backdrop" role="dialog" aria-modal="true">
          <div className="charger-modal-card alert-modal">
            <div className="alert-modal-content">
              <div className="alert-icon-box">
                <AlertCircleIcon size={32} />
              </div>
              <h3>Discard Unsaved Registration?</h3>
              <p>
                You have unsaved changes in your registration form. If you leave now,
                your current progress will be lost.
              </p>
            </div>
            <div className="charger-modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowExitModal(false)}
              >
                Continue Editing
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={() => navigate("/owner/stations")}
              >
                Discard & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: SUCCESS REGISTRATION CONFIRMATION
      ========================================================== */}
      {showSuccessModal && createdStationRecord && (
        <div className="charger-modal-backdrop" role="dialog" aria-modal="true">
          <div className="charger-modal-card success-modal">
            <div className="success-modal-content">
              <div className="success-icon-box">
                <CheckCircleIcon size={44} />
              </div>
              <h2>Charging Hub Registered Successfully!</h2>
              <p>
                <strong>{createdStationRecord.name}</strong> has been saved and registered
                to your EVChargeHub owner portfolio with{" "}
                <strong>{createdStationRecord.individualChargers?.length || 4} charging bays</strong>.
              </p>

              <div className="success-station-badge-strip">
                <span className="badge-item">
                  📍 {createdStationRecord.city}, {createdStationRecord.province}
                </span>
                <span className="badge-item">
                  ⚡ {createdStationRecord.maxPower}
                </span>
                <span className="badge-item">
                  🔌 {createdStationRecord.totalChargers} Chargers
                </span>
                <span className="badge-item">
                  💰 LKR {createdStationRecord.pricePerKwh}/kWh
                </span>
              </div>
            </div>

            <div className="success-modal-actions">
              <Link
                to={`/owner/stations/${createdStationRecord.id}`}
                className="btn-modal-outline"
              >
                View Station Details
              </Link>
              <Link
                to={`/owner/stations/${createdStationRecord.id}/chargers`}
                className="btn-modal-outline"
              >
                Manage Chargers
              </Link>
              <Link
                to="/owner/stations"
                className="btn-modal-confirm"
              >
                Go to My Stations
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
