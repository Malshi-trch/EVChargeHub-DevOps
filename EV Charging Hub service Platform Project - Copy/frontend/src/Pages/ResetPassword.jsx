import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  verifyResetToken,
  resetPasswordWithToken,
} from "../services/authService";
import {
  LockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "../components/Icons";
import "./ResetPassword.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(() => Boolean(token));
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState(() =>
    token ? "" : "No password reset token was provided in the link. Please request a new reset link."
  );
  const [userEmail, setUserEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    verifyResetToken(token)
      .then((res) => {
        if (!isMounted) return;
        setIsVerifying(false);
        if (res.valid) {
          setTokenValid(true);
          setUserEmail(res.email || "");
        } else {
          setTokenValid(false);
          setTokenError(res.error || "The reset link is invalid or has expired.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsVerifying(false);
        setTokenValid(false);
        setTokenError(err.message || "Failed to verify reset token.");
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Requirements checklist
  const requirements = useMemo(() => {
    return {
      length: newPassword.length >= 12,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    };
  }, [newPassword]);

  // Password strength calculation
  const strengthScore = useMemo(() => {
    let score = 0;
    if (requirements.length) score += 2;
    if (newPassword.length >= 16) score += 1;
    if (requirements.upper) score += 1;
    if (requirements.lower) score += 1;
    if (requirements.number) score += 1;
    if (requirements.special) score += 1;
    return score; // Max 7
  }, [requirements, newPassword.length]);

  const strengthLabel = useMemo(() => {
    if (!newPassword) return { text: "None", level: "none" };
    if (strengthScore <= 3) return { text: "Weak", level: "weak" };
    if (strengthScore <= 5) return { text: "Fair", level: "fair" };
    if (strengthScore === 6) return { text: "Good", level: "good" };
    return { text: "Strong", level: "strong" };
  }, [strengthScore, newPassword]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const canSubmit = useMemo(() => {
    return (
      requirements.length &&
      requirements.upper &&
      requirements.lower &&
      requirements.number &&
      requirements.special &&
      passwordsMatch === true &&
      !isSubmitting
    );
  }, [requirements, passwordsMatch, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!canSubmit) {
      setSubmitError("Please ensure all password criteria are satisfied and passwords match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordWithToken({
        token,
        newPassword,
        confirmPassword,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Password reset successfully. Please sign in with your new password." },
        });
      }, 3000);
    } catch (err) {
      setSubmitError(err.message || "Failed to reset password.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        {/* BRAND HEADER */}
        <div className="reset-brand-header">
          <Link to="/" className="reset-logo">
            <span className="reset-logo-bolt">⚡</span>
            <span>EVChargeHub</span>
          </Link>
          <div className="reset-badge">
            <LockIcon size={13} />
            <span>Account Security</span>
          </div>
        </div>

        {/* LOADING STATE */}
        {isVerifying && (
          <div className="reset-status-block">
            <div className="reset-spinner" />
            <h3>Verifying Reset Token...</h3>
            <p>Validating single-use cryptographic security credentials.</p>
          </div>
        )}

        {/* INVALID / EXPIRED TOKEN STATE */}
        {!isVerifying && !tokenValid && (
          <div className="reset-status-block error">
            <div className="reset-status-icon error">
              <AlertCircleIcon size={32} />
            </div>
            <h2>Reset Link Expired or Invalid</h2>
            <p className="reset-error-text">{tokenError}</p>
            <div className="reset-action-buttons">
              <Link to="/login" className="reset-primary-btn">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {!isVerifying && tokenValid && submitSuccess && (
          <div className="reset-status-block success">
            <div className="reset-status-icon success">
              <CheckCircleIcon size={36} />
            </div>
            <h2>Password Reset Complete!</h2>
            <p>
              Your account security credentials have been updated with PBKDF2 encryption.
              Redirecting you to the sign-in page...
            </p>
            <div className="reset-action-buttons">
              <Link to="/login" className="reset-primary-btn">
                Proceed to Sign In Now
              </Link>
            </div>
          </div>
        )}

        {/* ACTIVE RESET FORM */}
        {!isVerifying && tokenValid && !submitSuccess && (
          <div className="reset-form-container">
            <div className="reset-form-header">
              <h2>Create New Password</h2>
              <p>
                Set a strong, new password for{" "}
                <strong>{userEmail || "your account"}</strong>.
              </p>
            </div>

            {submitError && (
              <div className="reset-error-alert" role="alert">
                <AlertCircleIcon size={18} />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="reset-form">
              {/* NEW PASSWORD */}
              <div className="reset-form-group">
                <label htmlFor="newPassword">
                  New Password <span className="required-star">*</span>
                </label>
                <div className="reset-input-wrapper">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter at least 12 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="reset-eye-btn"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* STRENGTH METER */}
                {newPassword && (
                  <div className="reset-strength-box">
                    <div className="reset-strength-header">
                      <span>Strength:</span>
                      <strong className={`strength-text ${strengthLabel.level}`}>
                        {strengthLabel.text}
                      </strong>
                    </div>
                    <div className="strength-bar-track">
                      <div className={`strength-bar-fill ${strengthLabel.level}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="reset-form-group">
                <label htmlFor="confirmPassword">
                  Confirm New Password <span className="required-star">*</span>
                </label>
                <div className="reset-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="reset-eye-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {passwordsMatch === false && (
                  <span className="reset-inline-error">
                    Passwords do not match.
                  </span>
                )}
                {passwordsMatch === true && confirmPassword && (
                  <span className="reset-inline-success">
                    ✓ Passwords match
                  </span>
                )}
              </div>

              {/* REQUIREMENTS CHECKLIST */}
              <div className="reset-requirements-card">
                <h4>Password Security Requirements:</h4>
                <ul className="requirements-checklist">
                  <li className={requirements.length ? "met" : ""}>
                    <span className="check-bullet">{requirements.length ? "✓" : "○"}</span>
                    <span>At least 12 characters</span>
                  </li>
                  <li className={requirements.upper ? "met" : ""}>
                    <span className="check-bullet">{requirements.upper ? "✓" : "○"}</span>
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </li>
                  <li className={requirements.lower ? "met" : ""}>
                    <span className="check-bullet">{requirements.lower ? "✓" : "○"}</span>
                    <span>At least 1 lowercase letter (a-z)</span>
                  </li>
                  <li className={requirements.number ? "met" : ""}>
                    <span className="check-bullet">{requirements.number ? "✓" : "○"}</span>
                    <span>At least 1 number (0-9)</span>
                  </li>
                  <li className={requirements.special ? "met" : ""}>
                    <span className="check-bullet">{requirements.special ? "✓" : "○"}</span>
                    <span>At least 1 special character (!@#$%...)</span>
                  </li>
                </ul>
              </div>

              {/* ACTION BUTTONS */}
              <div className="reset-form-actions">
                <Link to="/login" className="reset-cancel-btn">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="reset-submit-btn"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
