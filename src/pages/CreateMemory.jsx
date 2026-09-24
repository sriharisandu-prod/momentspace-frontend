import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  Tag,
  Globe2,
  Lock,
  Sparkles,
  Video,
  X,
  Plus,
  CheckCircle2,
} from "lucide-react";

import "./CreateMemory.css";

import { useNavigate } from "react-router-dom";

import { createPost } from "../services/postService";

export default function CreateMemory() {
  const navigate = useNavigate();

  // =========================
  // Form State
  // =========================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("Travel");

  const [location, setLocation] =
    useState("");

  const [visibility, setVisibility] =
    useState("Public");

  // Multiple photos/videos
  const [media, setMedia] =
    useState([]);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isPublishing, setIsPublishing] =
    useState(false);

  // =========================
  // Constants
  // =========================

  const MAX_FILES = 10;

  const MAX_IMAGE_SIZE =
    10 * 1024 * 1024;

  const MAX_VIDEO_SIZE =
    100 * 1024 * 1024;

  // =========================
  // Handle Media Selection
  // =========================

  const handleMedia = (event) => {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    setError("");

    // Maximum number of files
    if (
      media.length +
        selectedFiles.length >
      MAX_FILES
    ) {
      setError(
        `You can upload maximum ${MAX_FILES} photos/videos.`
      );

      event.target.value = "";

      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      const isImage =
        file.type.startsWith(
          "image/"
        );

      const isVideo =
        file.type.startsWith(
          "video/"
        );

      if (!isImage && !isVideo) {
        setError(
          `${file.name} is not a supported image or video.`
        );

        continue;
      }

      if (
        isImage &&
        file.size > MAX_IMAGE_SIZE
      ) {
        setError(
          `${file.name} is larger than 10 MB.`
        );

        continue;
      }

      if (
        isVideo &&
        file.size > MAX_VIDEO_SIZE
      ) {
        setError(
          `${file.name} is larger than 100 MB.`
        );

        continue;
      }

      validFiles.push({
        file: file,

        url: URL.createObjectURL(
          file
        ),

        type: isVideo
          ? "video"
          : "image",
      });
    }

    if (
      validFiles.length > 0
    ) {
      setMedia(
        (previousMedia) => [
          ...previousMedia,
          ...validFiles,
        ]
      );
    }

    event.target.value = "";
  };

  // =========================
  // Remove Media
  // =========================

  const removeMedia = (index) => {
    setMedia(
      (previousMedia) => {
        const item =
          previousMedia[index];

        if (item?.url) {
          URL.revokeObjectURL(
            item.url
          );
        }

        return previousMedia.filter(
          (_, currentIndex) =>
            currentIndex !== index
        );
      }
    );
  };

  // =========================
  // Cleanup Object URLs
  // =========================

  useEffect(() => {
    return () => {
      media.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(
            item.url
          );
        }
      });
    };
  }, []);

  // =========================
  // Publish Memory
  // =========================

  const handlePublish = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    // =========================
    // Validation
    // =========================

    if (!title.trim()) {
      setError(
        "Please enter a memory title."
      );

      return;
    }

    if (!description.trim()) {
      setError(
        "Please enter a description."
      );

      return;
    }

    if (!location.trim()) {
      setError(
        "Please enter a location."
      );

      return;
    }

    if (media.length === 0) {
      setError(
        "Please add at least one photo or video."
      );

      return;
    }

    // =========================
    // Category Mapping
    // =========================

    const categoryMap = {
      Travel: "TRAVEL",
      Family: "MEMORY",
      Friends: "MEMORY",
      Food: "MEMORY",
      Nature: "MEMORY",
      Wedding: "WEDDING",
      Birthday: "BIRTHDAY",
      Events: "FUNCTION",
      Other: "MEMORY",
    };

    const backendCategory =
      categoryMap[category] ||
      "MEMORY";

    // =========================
    // Visibility Mapping
    // =========================

    const backendVisibility =
      visibility === "Private"
        ? "PRIVATE"
        : "PUBLIC";

    // =========================
    // Start Publishing
    // =========================

    setIsPublishing(true);

    try {
      const files = media.map(
        (item) => item.file
      );

      // =========================
      // Send to Spring Boot
      // =========================

      const createdPost =
        await createPost({
          title: title.trim(),

          description:
            description.trim(),

          category:
            backendCategory,

          location:
            location.trim(),

          visibility:
            backendVisibility,

          files,
        });

      console.log(
        "Memory published successfully:",
        createdPost
      );

      // =========================
      // Success Message
      // =========================

      setSuccessMessage(
        "Your memory has been published successfully!"
      );

      // =========================
      // Release Preview URLs
      // =========================

      media.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(
            item.url
          );
        }
      });

      // =========================
      // Navigate Home
      // =========================

      setTimeout(() => {
        navigate("/");
      }, 1800);

    } catch (err) {
      console.error(
        "Failed to publish memory:",
        err
      );

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message;

      setError(
        typeof backendMessage ===
          "string"
          ? backendMessage
          : "Unable to publish memory. Please try again."
      );

      setIsPublishing(false);
    }
  };

  // =========================
  // Render
  // =========================

  return (
    <div className="page-container">

      {/* =========================
          Back Button
      ========================= */}

      <button
        className="back-button"
        onClick={() => navigate(-1)}
        type="button"
      >
        <ArrowLeft size={18} />

        Back
      </button>

      {/* =========================
          Header
      ========================= */}

      <div className="create-header">

        <div>

          <div className="eyebrow">

            <Sparkles size={15} />

            CREATE MEMORY

          </div>

          <h1>
            Create a new memory
          </h1>

          <p>
            Turn a special moment into
            something you'll remember forever.
          </p>

        </div>

      </div>

      {/* =========================
          Main Layout
      ========================= */}

      <form
        className="create-layout"
        onSubmit={handlePublish}
      >

        {/* =========================
            Left Form Card
        ========================= */}

        <section className="create-card card">

          {/* Title */}

          <div className="form-group">

            <label htmlFor="memory-title">
              Memory title
            </label>

            <input
              id="memory-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Give your memory a beautiful title..."
              disabled={isPublishing}
            />

          </div>

          {/* Description */}

          <div className="form-group">

            <label htmlFor="memory-description">
              Description
            </label>

            <textarea
              id="memory-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Tell the story behind this moment..."
              rows="6"
              disabled={isPublishing}
            />

          </div>

          {/* Category + Location */}

          <div className="form-row">

            {/* Category */}

            <div className="form-group">

              <label htmlFor="memory-category">

                <Tag size={16} />

                Category

              </label>

              <select
                id="memory-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                disabled={isPublishing}
              >

                <option value="Travel">
                  Travel
                </option>

                <option value="Family">
                  Family
                </option>

                <option value="Friends">
                  Friends
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Nature">
                  Nature
                </option>

                <option value="Wedding">
                  Wedding
                </option>

                <option value="Birthday">
                  Birthday
                </option>

                <option value="Events">
                  Events
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {/* Location */}

            <div className="form-group">

              <label htmlFor="memory-location">

                <MapPin size={16} />

                Location

              </label>

              <input
                id="memory-location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder="Where did it happen?"
                disabled={isPublishing}
              />

            </div>

          </div>

          {/* =========================
              Visibility
          ========================= */}

          <div className="form-group">

            <label>
              Visibility
            </label>

            <div className="visibility-options">

              {/* Public */}

              <button
                type="button"
                className={
                  visibility === "Public"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setVisibility(
                    "Public"
                  )
                }
                disabled={isPublishing}
              >

                <Globe2 size={18} />

                <span>

                  <strong>
                    Public
                  </strong>

                  <small>
                    Anyone can see this memory
                  </small>

                </span>

              </button>

              {/* Private */}

              <button
                type="button"
                className={
                  visibility === "Private"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setVisibility(
                    "Private"
                  )
                }
                disabled={isPublishing}
              >

                <Lock size={18} />

                <span>

                  <strong>
                    Private
                  </strong>

                  <small>
                    Only you can see this memory
                  </small>

                </span>

              </button>

            </div>

          </div>

          {/* =========================
              Error Message
          ========================= */}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* =========================
              Form Actions
          ========================= */}

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/")
              }
              disabled={isPublishing}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isPublishing}
            >

              {isPublishing ? (
                <>
                  <span className="loading-spinner" />

                  Publishing...
                </>
              ) : (
                "Publish Memory"
              )}

            </button>

          </div>

        </section>

        {/* =========================
            Right Media Card
        ========================= */}

        <section className="upload-card card">

          {/* Upload Header */}

          <div className="upload-header">

            <ImageIcon size={20} />

            <div>

              <h3>
                Add photos & videos
              </h3>

              <p>
                Share all the moments from
                your memory.
              </p>

            </div>

          </div>

          {/* =========================
              Upload Area
          ========================= */}

          <label
            className="image-upload"
          >

            <div className="upload-icon">

              <Plus size={28} />

            </div>

            <strong>
              Add photos & videos
            </strong>

            <span>
              JPG, PNG, WEBP, MP4, MOV
              <br />
              Select multiple files
            </span>

            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMedia}
              hidden
              disabled={isPublishing}
            />

          </label>

          {/* =========================
              Media Counter
          ========================= */}

          {media.length > 0 && (
            <div className="media-count">

              {media.length}{" "}

              {media.length === 1
                ? "item"
                : "items"}{" "}

              selected

            </div>
          )}

          {/* =========================
              Media Preview
          ========================= */}

          {media.length > 0 && (

            <div className="media-preview-grid">

              {media.map(
                (item, index) => (

                  <div
                    className="media-preview"
                    key={`${item.file.name}-${index}`}
                  >

                    {/* Image */}

                    {item.type ===
                      "image" && (
                      <img
                        src={item.url}
                        alt={`Memory ${
                          index + 1
                        }`}
                      />
                    )}

                    {/* Video */}

                    {item.type ===
                      "video" && (
                      <video
                        src={item.url}
                        controls
                      />
                    )}

                    {/* Media Type */}

                    <div className="media-type">

                      {item.type ===
                      "video" ? (
                        <Video
                          size={14}
                        />
                      ) : (
                        <ImageIcon
                          size={14}
                        />
                      )}

                    </div>

                    {/* Remove */}

                    <button
                      type="button"
                      className="remove-media"
                      onClick={() =>
                        removeMedia(
                          index
                        )
                      }
                      aria-label="Remove media"
                      disabled={isPublishing}
                    >
                      <X size={16} />
                    </button>

                  </div>

                )
              )}

            </div>

          )}

          {/* =========================
              Empty Media Message
          ========================= */}

          {media.length === 0 && (
            <div className="empty-media-message">

              <ImageIcon size={15} />

              No photos or videos selected yet.

            </div>
          )}

          {/* =========================
              Upload Information
          ========================= */}

          <div className="upload-info">

            <span>
              Maximum {MAX_FILES} files
            </span>

            <span>
              Images up to 10MB
            </span>

            <span>
              Videos up to 100MB
            </span>

          </div>

        </section>

      </form>

      {/* =========================
          Success Notification
      ========================= */}

      {successMessage && (
        <div
          className="publish-success"
          role="status"
          aria-live="polite"
        >

          <div className="publish-success-icon">

            <CheckCircle2
              size={24}
            />

          </div>

          <div className="publish-success-content">

            <strong>
              Published!
            </strong>

            <span>
              {successMessage}
            </span>

          </div>

          <button
            type="button"
            className="publish-success-close"
            onClick={() =>
              setSuccessMessage("")
            }
            aria-label="Close notification"
          >
            <X size={17} />
          </button>

        </div>
      )}

    </div>
  );
}