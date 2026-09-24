import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Camera,
  Bell,
  Lock,
  Shield,
  Mail,
  CalendarDays,
  Clock3,
  CheckCircle2,
  Save,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";

import api from "../services/axios";
import { useAuth } from "../contexts/AuthContext";

import "./Settings.css";

const Settings = () => {
  const { user, updateUser } = useAuth();

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // LOAD USER
  // =========================================================

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    const userId = Number(user?.id);

    if (!Number.isFinite(userId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get(`/api/users/${userId}`);

      const data = response.data;

      setProfile(data);

      setUsername(data?.username || "");
      setEmail(data?.email || "");

      if (data?.profilePhotoUrl) {
        setPreviewPhoto(data.profilePhotoUrl);
      } else {
        setPreviewPhoto("");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to load your account information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PHOTO SELECT
  // =========================================================

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Profile photo must be smaller than 5 MB.");

      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a JPG, PNG or WEBP image.");

      event.target.value = "";
      return;
    }

    setSelectedPhoto(file);

    const objectUrl = URL.createObjectURL(file);

    setPreviewPhoto(objectUrl);
  };

  // =========================================================
  // REMOVE SELECTED PHOTO
  // =========================================================

  const handleRemoveSelectedPhoto = () => {
    setSelectedPhoto(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (profile?.profilePhotoUrl) {
      setPreviewPhoto(profile.profilePhotoUrl);
    } else {
      setPreviewPhoto("");
    }
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const userId = Number(user?.id);

    if (!Number.isFinite(userId)) {
      setErrorMessage("Unable to identify the logged-in user.");
      return;
    }

    if (!username.trim()) {
      setErrorMessage("Username cannot be empty.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Email address cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      /*
       * Backend expects multipart/form-data.
       */
      const formData = new FormData();

      formData.append("username", username.trim());
      formData.append("email", email.trim());

      if (selectedPhoto) {
        formData.append("profileImage", selectedPhoto);
      }

      const response = await api.put(
        `/api/users/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedProfile = response.data;

      setProfile(updatedProfile);

      setUsername(updatedProfile?.username || "");
      setEmail(updatedProfile?.email || "");

      if (updatedProfile?.profilePhotoUrl) {
        setPreviewPhoto(updatedProfile.profilePhotoUrl);
      }

      setSelectedPhoto(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      /*
       * Update AuthContext so Navbar + Sidebar
       * immediately show the new information.
       */
      if (updateUser) {
        updateUser({
          id: updatedProfile?.id,
          username: updatedProfile?.username,
          email: updatedProfile?.email,
          profilePhotoUrl:
            updatedProfile?.profilePhotoUrl || null,
        });
      }

      setSuccessMessage(
        "Your profile has been updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error?.response?.data || error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // =========================================================
  // INITIAL
  // =========================================================

  const getInitial = () => {
    const name =
      username ||
      profile?.username ||
      user?.username ||
      "U";

    return String(name).charAt(0).toUpperCase();
  };

  // =========================================================
  // TABS
  // =========================================================

  const tabs = [
    {
      id: "profile",
      icon: User,
      title: "Profile",
      description: "Personal information",
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      description: "Notification preferences",
    },
    {
      id: "password",
      icon: Lock,
      title: "Password",
      description: "Change your password",
    },
    {
      id: "privacy",
      icon: Shield,
      title: "Privacy",
      description: "Manage your privacy",
    },
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="settings-loading-spinner" />
          <span>Loading your settings...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="settings-page">
      <div className="settings-container">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="settings-page-header">
          <div>
            <span className="settings-eyebrow">
              ACCOUNT SETTINGS
            </span>

            <h1>Settings</h1>

            <p>
              Manage your profile and account preferences.
            </p>
          </div>

          <div className="settings-header-icon">
            <Shield size={26} />
          </div>
        </div>

        {/* =====================================================
            ALERTS
        ===================================================== */}

        {successMessage && (
          <div className="settings-alert settings-success">
            <CheckCircle2 size={19} />

            <span>{successMessage}</span>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="settings-alert settings-error">
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            TABS
        ===================================================== */}

        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                className={`settings-tab ${
                  activeTab === tab.id
                    ? "active"
                    : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="settings-tab-icon">
                  <Icon size={18} />
                </span>

                <span className="settings-tab-text">
                  <strong>{tab.title}</strong>
                  <small>{tab.description}</small>
                </span>
              </button>
            );
          })}
        </div>

        {/* =====================================================
            PROFILE TAB
        ===================================================== */}

        {activeTab === "profile" && (
          <div className="settings-content">

            {/* =================================================
                PROFILE PHOTO CARD
            ================================================= */}

            <section className="settings-card profile-photo-card">

              <div className="settings-card-heading">
                <div className="settings-heading-icon">
                  <Camera size={20} />
                </div>

                <div>
                  <h2>Profile photo</h2>

                  <p>
                    Choose a photo that represents you.
                  </p>
                </div>
              </div>

              <div className="profile-photo-layout">

                {/* PHOTO */}

                <div className="profile-photo-wrapper">
                  {previewPhoto ? (
                    <img
                      src={previewPhoto}
                      alt={
                        profile?.username ||
                        username ||
                        "Profile"
                      }
                      className="profile-photo"
                    />
                  ) : (
                    <div className="profile-photo-placeholder">
                      <span>{getInitial()}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="profile-camera-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <Camera size={17} />
                  </button>
                </div>

                {/* PHOTO INFORMATION */}

                <div className="profile-photo-info">

                  <div className="profile-photo-user">
                    <h3>
                      {profile?.username ||
                        username ||
                        user?.username ||
                        "User"}
                    </h3>

                    <span>
                      {profile?.email ||
                        email ||
                        user?.email ||
                        ""}
                    </span>
                  </div>

                  <div className="photo-format-list">
                    <span>
                      <ImageIcon size={15} />
                      JPG, PNG or WEBP
                    </span>

                    <span>
                      <CheckCircle2 size={15} />
                      Maximum size 5 MB
                    </span>
                  </div>

                  <div className="photo-buttons">

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      <Upload size={16} />
                      Change photo
                    </button>

                    {selectedPhoto && (
                      <button
                        type="button"
                        className="remove-photo-button"
                        onClick={
                          handleRemoveSelectedPhoto
                        }
                      >
                        <X size={15} />
                        Cancel
                      </button>
                    )}

                  </div>

                  {selectedPhoto && (
                    <div className="selected-photo-name">
                      <ImageIcon size={14} />

                      <span>
                        {selectedPhoto.name}
                      </span>
                    </div>
                  )}

                </div>

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                hidden
              />
            </section>

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <form
              className="settings-card"
              onSubmit={handleSaveProfile}
            >
              <div className="settings-card-heading">
                <div className="settings-heading-icon">
                  <User size={20} />
                </div>

                <div>
                  <h2>Personal information</h2>

                  <p>
                    This information is displayed on your profile.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">

                {/* USERNAME */}

                <div className="settings-field">
                  <label htmlFor="username">
                    Username
                  </label>

                  <div className="settings-input-wrapper">
                    <User size={18} />

                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(
                          event.target.value
                        )
                      }
                      placeholder="Enter username"
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div className="settings-field">
                  <label htmlFor="email">
                    Email address
                  </label>

                  <div className="settings-input-wrapper">
                    <Mail size={18} />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

              </div>

              <div className="settings-form-footer">
                <div className="form-save-hint">
                  <Shield size={15} />

                  <span>
                    Your information is securely stored.
                  </span>
                </div>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <section className="settings-card">

              <div className="settings-card-heading">
                <div className="settings-heading-icon">
                  <Shield size={20} />
                </div>

                <div>
                  <h2>Account information</h2>

                  <p>
                    Information associated with your MemoriesHub
                    account.
                  </p>
                </div>
              </div>

              <div className="account-info-grid">

                <div className="account-info-item">
                  <div className="account-info-icon">
                    <Shield size={17} />
                  </div>

                  <div>
                    <span>Account ID</span>

                    <strong>
                      #{profile?.id || user?.id || "—"}
                    </strong>
                  </div>
                </div>

                <div className="account-info-item">
                  <div className="account-info-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <span>Member since</span>

                    <strong>
                      {formatDate(
                        profile?.createdAt
                      )}
                    </strong>
                  </div>
                </div>

                <div className="account-info-item">
                  <div className="account-info-icon">
                    <Clock3 size={17} />
                  </div>

                  <div>
                    <span>Last updated</span>

                    <strong>
                      {formatDate(
                        profile?.updatedAt
                      )}
                    </strong>
                  </div>
                </div>

                <div className="account-info-item">
                  <div className="account-info-icon account-active-icon">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <span>Account status</span>

                    <strong className="account-active">
                      Active
                    </strong>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* =====================================================
            NOTIFICATIONS
        ===================================================== */}

        {activeTab === "notifications" && (
          <div className="settings-placeholder">

            <div className="placeholder-icon">
              <Bell size={28} />
            </div>

            <h2>Notification preferences</h2>

            <p>
              Manage how MemoriesHub keeps you updated about
              likes, comments, followers and other activity.
            </p>

            <div className="preference-list">

              <div className="preference-row">
                <div>
                  <strong>Likes and comments</strong>
                  <span>
                    Activity on your memories
                  </span>
                </div>

                <div className="toggle active">
                  <span />
                </div>
              </div>

              <div className="preference-row">
                <div>
                  <strong>New followers</strong>
                  <span>
                    When someone follows you
                  </span>
                </div>

                <div className="toggle active">
                  <span />
                </div>
              </div>

              <div className="preference-row">
                <div>
                  <strong>Messages</strong>
                  <span>
                    New direct messages
                  </span>
                </div>

                <div className="toggle active">
                  <span />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            PASSWORD
        ===================================================== */}

        {activeTab === "password" && (
          <div className="settings-placeholder">

            <div className="placeholder-icon">
              <Lock size={28} />
            </div>

            <h2>Password & security</h2>

            <p>
              Keep your MemoriesHub account secure by managing
              your password and security preferences.
            </p>

            <div className="security-info">
              <Shield size={21} />

              <div>
                <strong>Your account is protected</strong>

                <span>
                  Your login uses secure authentication.
                </span>
              </div>
            </div>

          </div>
        )}

        {/* =====================================================
            PRIVACY
        ===================================================== */}

        {activeTab === "privacy" && (
          <div className="settings-placeholder">

            <div className="placeholder-icon">
              <Shield size={28} />
            </div>

            <h2>Privacy</h2>

            <p>
              Manage your MemoriesHub privacy and account
              visibility preferences.
            </p>

            <div className="privacy-card">
              <div className="privacy-card-icon">
                <User size={19} />
              </div>

              <div>
                <strong>Profile visibility</strong>

                <span>
                  Your profile information is available through
                  your MemoriesHub profile.
                </span>
              </div>

              <span className="privacy-status">
                Active
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;