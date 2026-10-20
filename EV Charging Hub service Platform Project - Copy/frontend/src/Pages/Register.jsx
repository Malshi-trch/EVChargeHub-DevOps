import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      // Update legacy local storage for offline continuity
      try {
        const existingUsers = JSON.parse(localStorage.getItem("evUsers") || "[]");
        const updatedUsers = [...existingUsers, formData];
        localStorage.setItem("evUsers", JSON.stringify(updatedUsers));
        localStorage.setItem(
          "evUserProfile",
          JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          })
        );
      } catch {
        // Safe to ignore
      }

      navigate("/login", {
        state: { message: "Account created successfully! Please sign in with your credentials." },
      });
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT SIDE */}
      <section className="register-left">

        <Link to="/" className="register-logo">
          <span>⚡</span>
          EVChargeHub
        </Link>

        <div className="register-left-content">

          <div className="register-badge">
            ⚡ Join EVChargeHub
          </div>

          <h1>
            Start Your
            <span>Electric Journey.</span>
          </h1>

          <p>
            Create your account and join a smarter EV charging network.
            Find charging stations or manage your own charging station
            from one platform.
          </p>

          <div className="account-preview">

            <div className="preview-item">
              <div className="preview-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="23"
                  height="23"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                </svg>
              </div>

              <div>
                <strong>EV User</strong>
                <span>
                  Find stations, book chargers and manage your charging.
                </span>
              </div>
            </div>

            <div className="preview-item">
              <div className="preview-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="23"
                  height="23"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="3" width="10" height="18" rx="1" />
                  <path d="M7 7h4" />
                  <path d="M7 11h4" />
                  <path d="M14 8h2l2 3v6a2 2 0 0 0 2 2" />
                </svg>
              </div>

              <div>
                <strong>Station Owner</strong>
                <span>
                  Manage stations, chargers, bookings and availability.
                </span>
              </div>
            </div>

          </div>

        </div>

        <p className="register-left-footer">
          Powering smarter and greener journeys.
        </p>

      </section>


      {/* RIGHT SIDE */}
      <section className="register-right">

        <div className="register-container">

          <div className="register-heading">
            <h2>Create Account</h2>

            <p>
              Enter your details and choose how you want to use EVChargeHub.
            </p>
          </div>


          <form onSubmit={handleSubmit}>

            {/* ACCOUNT TYPE */}

            <div className="register-form-group">
              <label>Account Type</label>

              <div className="role-selector">

                <label
                  className={`role-option ${
                    formData.role === "user" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === "user"}
                    onChange={handleChange}
                  />

                  <div className="role-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
                    </svg>
                  </div>

                  <div>
                    <strong>EV User</strong>
                    <span>Charge my EV</span>
                  </div>

                </label>


                <label
                  className={`role-option ${
                    formData.role === "station_owner"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="station_owner"
                    checked={formData.role === "station_owner"}
                    onChange={handleChange}
                  />

                  <div className="role-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="4" y="3" width="10" height="18" rx="1" />
                      <path d="M7 7h4" />
                      <path d="M7 11h4" />
                      <path d="M14 8h2l2 3v6" />
                    </svg>
                  </div>

                  <div>
                    <strong>Station Owner</strong>
                    <span>Manage stations</span>
                  </div>

                </label>

              </div>
            </div>


            {/* NAME */}

            <div className="register-form-group">
              <label htmlFor="fullName">
                Full Name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>


            {/* EMAIL + PHONE */}

            <div className="register-row">

              <div className="register-form-group">
                <label htmlFor="registerEmail">
                  Email Address
                </label>

                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="register-form-group">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+94 7X XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-row">

              <div className="register-form-group">
                <label htmlFor="registerPassword">
                  Password
                </label>

                <div className="register-password">

                  <input
                    id="registerPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>


              <div className="register-form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            {error && (
              <div className="register-error">
                {error}
              </div>
            )}


            <label className="terms">
              <input type="checkbox" required />

              <span>
                I agree to the Terms & Conditions and Privacy Policy.
              </span>
            </label>


            <button
              type="submit"
              className="create-account-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
              <span>→</span>
            </button>

          </form>


          <div className="register-login-link">
            Already have an account?

            <Link to="/login">
              Sign In
            </Link>
          </div>


          <div className="register-home-link">
            <Link to="/">
              ← Back to Home
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;