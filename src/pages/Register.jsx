import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authApi";
import "./Register.css";



const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        username,
        email,
        password,
      });

      setSuccess("Account created successfully! Redirecting to login...");

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      const message =
        err?.response?.data ||
        err?.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(
        typeof message === "string"
          ? message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-shape auth-shape-one"></div>
        <div className="auth-shape auth-shape-two"></div>
        <div className="auth-shape auth-shape-three"></div>
      </div>

      <div className="auth-container">
        {/* LEFT SIDE */}
        <div className="auth-showcase">
          <div className="showcase-overlay"></div>

          <div className="showcase-content">
            <div className="brand-logo">
              <div className="brand-icon">M</div>
              <span>MemoriesHub</span>
            </div>

            <div className="showcase-text">
              <span className="showcase-tag">YOUR STORIES. YOUR MEMORIES.</span>

              <h1>
                Every moment
                <br />
                deserves a place
                <br />
                to <span>live forever.</span>
              </h1>

              <p>
                Capture your travels, celebrations, friendships and special
                moments. Share them with the people who matter.
              </p>
            </div>

            <div className="memory-preview">
              <div className="preview-image preview-image-one">
                <div className="preview-label">
                  <span>✦</span>
                  Travel Memories
                </div>
              </div>

              <div className="preview-image preview-image-two">
                <div className="preview-label">
                  <span>♡</span>
                  Special Moments
                </div>
              </div>

              <div className="preview-image preview-image-three">
                <div className="preview-label">
                  <span>✦</span>
                  Forever Memories
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="mobile-brand">
              <div className="brand-icon">M</div>
              <span>MemoriesHub</span>
            </div>

            <div className="form-heading">
              <span className="welcome-text">WELCOME TO MEMORIESHUB</span>

              <h2>Create your account</h2>

              <p>
                Start saving and sharing the moments that matter.
              </p>
            </div>

            {error && (
              <div className="auth-message auth-error">
                <span className="message-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-message auth-success">
                <span className="message-icon">✓</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* USERNAME */}
              <div className="input-group">
                <label htmlFor="username">Username</label>

                <div className="input-wrapper">
                  <span className="input-icon">👤</span>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="input-group">
                <label htmlFor="email">Email address</label>

                <div className="input-wrapper">
                  <span className="input-icon">✉</span>

                  <input
                    id="email"
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

              {/* PASSWORD */}
              <div className="input-group">
                <label htmlFor="password">Password</label>

                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm password</label>

                <div className="input-wrapper">
                  <span className="input-icon">🔐</span>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="login-link-button">
              Sign in to MemoriesHub
            </Link>

            <p className="auth-footer">
              By creating an account, you can start building your personal
              collection of memories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;