import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authApi";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
      });

      /*
       * Backend returns:
       *
       * {
       *   token,
       *   username,
       *   email
       * }
       */

      login(response);

      navigate("/home");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Invalid email or password.";

      setError(
        typeof message === "string"
          ? message
          : "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-glow login-glow-one"></div>
        <div className="login-glow login-glow-two"></div>
      </div>

      <div className="login-container">
        {/* LEFT BRAND / VISUAL SECTION */}

        <div className="login-visual">
          <div className="visual-content">
            <div className="login-brand">
              <div className="login-brand-icon">M</div>

              <span>MemoriesHub</span>
            </div>

            <div className="visual-main">
              <span className="visual-small-title">
                WELCOME BACK
              </span>

              <h1>
                Your memories
                <br />
                are waiting
                <br />
                <span>for you.</span>
              </h1>

              <p>
                Come back to the moments, people and stories that make
                your journey special.
              </p>

              <div className="floating-memory-card card-one">
                <span className="floating-icon">📸</span>

                <div>
                  <strong>Beautiful moments</strong>
                  <small>Worth remembering</small>
                </div>
              </div>

              <div className="floating-memory-card card-two">
                <span className="floating-icon">♡</span>

                <div>
                  <strong>Shared memories</strong>
                  <small>Made together</small>
                </div>
              </div>
            </div>

            <div className="visual-bottom">
              <span>Capture</span>
              <i>•</i>
              <span>Share</span>
              <i>•</i>
              <span>Remember</span>
            </div>
          </div>
        </div>

        {/* LOGIN FORM */}

        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="mobile-login-brand">
              <div className="login-brand-icon">M</div>
              <span>MemoriesHub</span>
            </div>

            <div className="login-heading">
              <span>WELCOME BACK</span>

              <h2>Sign in</h2>

              <p>
                Enter your details to continue your MemoriesHub journey.
              </p>
            </div>

            {error && (
              <div className="login-error">
                <span className="error-circle">!</span>

                <span>{error}</span>
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >
              <div className="login-input-group">
                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">✉</span>

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="login-input-group">
                <div className="password-label-row">
                  <label htmlFor="login-password">
                    Password
                  </label>
                </div>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">🔒</span>

                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-register-divider">
              <span>New to MemoriesHub?</span>
            </div>

            <Link
              to="/register"
              className="create-account-button"
            >
              Create a new account
            </Link>

            <p className="login-footer">
              Your memories belong to you. Start building your
              collection today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;