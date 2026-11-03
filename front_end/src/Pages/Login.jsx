import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser, requestPasswordReset } from "../services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState(() => localStorage.getItem("evRememberedEmail") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("evRememberedEmail"));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(() => {
    if (location.state?.message) {
      return { text: location.state.message, type: "success" };
    }
    return { text: "", type: "" };
  });

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResult, setForgotResult] = useState(null);
  const [forgotError, setForgotError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!identifier.trim() || !password) {
      setMessage({ text: "Please enter your email or username and password.", type: "error" });
      return;
    }

    if (rememberMe) {
      localStorage.setItem("evRememberedEmail", identifier.trim());
    } else {
      localStorage.removeItem("evRememberedEmail");
    }

    setIsLoading(true);

    try {
      // Authenticate against the secure backend
      const res = await loginUser(identifier.trim(), password);
      // Retrieve the account's stored role strictly from verified backend database
      const verifiedRole = (res.user?.role || "").toLowerCase();

      setMessage({ text: "Signed in successfully! Redirecting...", type: "success" });

      setTimeout(() => {
        if (verifiedRole === "owner" || verifiedRole === "station_owner") {
          navigate("/owner");
        } else {
          navigate("/user");
        }
      }, 350);
    } catch (err) {
      setIsLoading(false);
      setMessage({
        text: err.message || "Invalid email/username or password. Please verify your credentials.",
        type: "error",
      });
    }
  };

  const handleOpenForgotPassword = (e) => {
    e.preventDefault();
    setForgotEmail(identifier && identifier.includes("@") ? identifier.trim() : "");
    setForgotResult(null);
    setForgotError("");
    setShowForgotModal(true);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotResult(null);

    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError("Please enter your account email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const data = await requestPasswordReset(forgotEmail.trim());
      setForgotResult(data);
    } catch (err) {
      setForgotError(err.message || "Could not generate password reset request.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE */}
      <div className="login-left">
        <Link to="/" className="login-logo">
          <span className="login-logo-bolt">⚡</span>
          <span>EVChargeHub</span>
        </Link>

        <div className="login-left-content">
          <div className="login-badge">⚡ Smart EV Charging</div>

          <h1>
            Power Your Journey.
            <span>Charge Smarter.</span>
          </h1>

          <p>
            Find nearby charging stations, check real-time availability,
            reserve your charging slot, and manage your EV journey from one place.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <div className="feature-check">✓</div>
              <div>
                <strong>Find Nearby Stations</strong>
                <span>Discover charging stations around you.</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-check">✓</div>
              <div>
                <strong>Real-Time Availability</strong>
                <span>Know which chargers are available instantly.</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-check">✓</div>
              <div>
                <strong>Easy Reservations</strong>
                <span>Book your charging slot in seconds.</span>
              </div>
            </div>
          </div>
        </div>

        <p className="login-left-footer">Smart charging for a greener journey.</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-container">
          <div className="mobile-logo">
            <span>⚡</span>
            EVChargeHub
          </div>

          <div className="login-heading">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your EVChargeHub account.</p>

            {message.text && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor:
                    message.type === "error"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(34, 197, 94, 0.15)",
                  color: message.type === "error" ? "#f87171" : "#4ade80",
                  border: `1px solid ${
                    message.type === "error"
                      ? "rgba(239, 68, 68, 0.3)"
                      : "rgba(34, 197, 94, 0.3)"
                  }`,
                  textAlign: "left",
                }}
              >
                {message.text}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* EMAIL OR USERNAME */}
            <div className="form-group">
              <label htmlFor="identifier">Email or Username</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Show or hide password"
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 5a15 15 0 0 1-2.1 2.7" />
                      <path d="M6.6 6.6C4.3 8 3 10 3 10s3.5 5 9 5c1 0 2-.2 2.9-.5" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={handleOpenForgotPassword}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#10b981",
                  fontWeight: 600,
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
              <span>→</span>
            </button>
          </form>

          <div className="signup-text">
            Don't have an account? <Link to="/register">Create Account</Link>
          </div>

          <div className="back-home">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div
          className="forgot-modal-overlay"
          onClick={() => setShowForgotModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            className="forgot-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px 32px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              color: "#0f172a",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                🔒 Reset Your Password
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            {!forgotResult ? (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 16px", lineHeight: "1.5" }}>
                  Enter your registered account email. A secure, single-use reset token valid for 15 minutes will be generated.
                </p>

                {forgotError && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecdd3",
                      color: "#b91c1c",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      marginBottom: "14px",
                    }}
                  >
                    {forgotError}
                  </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="forgotEmail"
                    style={{ display: "block", fontSize: "12.5px", fontWeight: "700", marginBottom: "6px" }}
                  >
                    Account Email
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. owner@evchargehub.lk"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={{
                      padding: "9px 16px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#475569",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#059669",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {forgotLoading ? "Requesting..." : "Generate Reset Link"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#065f46",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    marginBottom: "16px",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "4px" }}>
                    ✓ Reset Link Generated Successfully!
                  </strong>
                  <p style={{ margin: 0, fontSize: "12px" }}>{forgotResult.message}</p>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#334155",
                    wordBreak: "break-all",
                    marginBottom: "16px",
                  }}
                >
                  <strong>One-Time Reset URL:</strong>
                  <div style={{ marginTop: "4px", color: "#059669", fontWeight: "600" }}>
                    {window.location.origin}
                    {forgotResult.resetUrl}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `${window.location.origin}${forgotResult.resetUrl}`
                      );
                      alert("Reset link copied to clipboard!");
                    }}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#475569",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      navigate(forgotResult.resetUrl);
                    }}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#059669",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Proceed to Reset Password →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;