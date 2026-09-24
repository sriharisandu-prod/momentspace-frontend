import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Mail,
  CalendarDays,
  Image as ImageIcon,
  MapPin,
  Play,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

import { getUserById } from "../services/userService";
import { getAllPosts } from "../services/postService";

import {
  followUser,
  unfollowUser,
  checkFollowing,
  getFollowersCount,
  getFollowingCount,
  getFollowers,
  getFollowing,
} from "../services/followService";

import "./PublicProfile.css";

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FOLLOWERS / FOLLOWING POPUP
  // ==========================================

  const [connectionType, setConnectionType] = useState(null);

  const [connectionUsers, setConnectionUsers] = useState([]);

  const [connectionLoading, setConnectionLoading] = useState(false);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    if (!userId) {
      return;
    }

    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const numericUserId = Number(userId);

      if (!numericUserId) {
        throw new Error("Invalid user profile");
      }

      // ========================================
      // USER
      // ========================================

      const userData = await getUserById(numericUserId);

      setProfileUser(userData);

      // ========================================
      // POSTS
      // ========================================

      const allPosts = await getAllPosts();

      if (Array.isArray(allPosts)) {
        const userPosts = allPosts
          .filter(
            (post) =>
              Number(post?.userId) === numericUserId
          )
          .sort((a, b) => {
            const dateA = new Date(
              a?.createdAt || 0
            ).getTime();

            const dateB = new Date(
              b?.createdAt || 0
            ).getTime();

            return dateB - dateA;
          });

        setPosts(userPosts);
      } else {
        setPosts([]);
      }

      // ========================================
      // FOLLOW COUNTS
      // ========================================

      const [followers, following] = await Promise.all([
        getFollowersCount(numericUserId),
        getFollowingCount(numericUserId),
      ]);

      setFollowersCount(Number(followers) || 0);
      setFollowingCount(Number(following) || 0);

      // ========================================
      // FOLLOWING STATUS
      // ========================================

      if (
        user?.id &&
        Number(user.id) !== numericUserId
      ) {
        try {
          const status = await checkFollowing(
            Number(user.id),
            numericUserId
          );

          setIsFollowing(Boolean(status));
        } catch (followError) {
          console.error(
            "Failed to check following status:",
            followError
          );

          setIsFollowing(false);
        }
      } else {
        setIsFollowing(false);
      }
    } catch (err) {
      console.error(
        "Failed to load public profile:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load this profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FOLLOW / UNFOLLOW
  // ==========================================

  const handleFollowToggle = async () => {
    if (!user?.id || !profileUser?.id) {
      return;
    }

    if (
      Number(user.id) ===
      Number(profileUser.id)
    ) {
      return;
    }

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await unfollowUser(
          Number(user.id),
          Number(profileUser.id)
        );

        setIsFollowing(false);

        setFollowersCount((previous) =>
          Math.max(0, previous - 1)
        );
      } else {
        await followUser(
          Number(user.id),
          Number(profileUser.id)
        );

        setIsFollowing(true);

        setFollowersCount(
          (previous) => previous + 1
        );
      }
    } catch (err) {
      console.error(
        "Failed to update follow status:",
        err
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // ==========================================
  // OPEN FOLLOWERS / FOLLOWING POPUP
  // ==========================================

  const openConnections = async (type) => {
    const numericUserId = Number(userId);

    if (!numericUserId) {
      console.error(
        "Invalid profile user ID:",
        userId
      );
      return;
    }

    console.log(
      "Opening connections:",
      type
    );

    console.log(
      "Profile user ID:",
      numericUserId
    );

    setConnectionType(type);
    setConnectionUsers([]);
    setConnectionLoading(true);

    try {
      let response = [];

      if (type === "followers") {
        response = await getFollowers(
          numericUserId
        );
      } else if (type === "following") {
        response = await getFollowing(
          numericUserId
        );
      }

      console.log(
        `${type} response:`,
        response
      );

      /*
       * followService normally returns response.data.
       * This also safely handles a wrapped response.
       */

      const users = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      console.log(
        `${type} users:`,
        users
      );

      setConnectionUsers(users);
    } catch (err) {
      console.error(
        `Failed to load ${type}:`,
        err
      );

      setConnectionUsers([]);
    } finally {
      setConnectionLoading(false);
    }
  };

  // ==========================================
  // CLOSE POPUP
  // ==========================================

  const closeConnections = () => {
    setConnectionType(null);
    setConnectionUsers([]);
    setConnectionLoading(false);
  };

  // ==========================================
  // MEDIA HELPERS
  // ==========================================

  const getFirstMedia = (post) => {
    const mediaList =
      post?.mediaList ||
      post?.media ||
      post?.medias ||
      [];

    if (
      !Array.isArray(mediaList) ||
      mediaList.length === 0
    ) {
      return null;
    }

    return mediaList[0];
  };

  const getMediaUrl = (media) => {
    if (!media) {
      return "";
    }

    return (
      media.mediaUrl ||
      media.url ||
      media.fileUrl ||
      media.cloudinaryUrl ||
      ""
    );
  };

  const getMediaType = (media) => {
    if (!media) {
      return "IMAGE";
    }

    return String(
      media.mediaType ||
        media.type ||
        "IMAGE"
    ).toUpperCase();
  };

  // ==========================================
  // MEMBER SINCE
  // ==========================================

  const formatMemberSince = (date) => {
    if (!date) {
      return "Member since";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Member since";
    }

    return `Member since ${parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    )}`;
  };

  // ==========================================
  // INITIAL
  // ==========================================

  const getInitial = (username) => {
    if (!username) {
      return "U";
    }

    return username
      .charAt(0)
      .toUpperCase();
  };

  // ==========================================
  // MEMORY CLICK
  // ==========================================

  const handleMemoryClick = (post) => {
    if (post?.id) {
      navigate(
        `/home?post=${post.id}`
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="public-profile-page">
        <div className="public-profile-loading">
          <div className="public-profile-loading-card">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !profileUser) {
    return (
      <div className="public-profile-page">
        <div className="public-profile-error">

          <button
            type="button"
            className="public-profile-back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="public-profile-error-card">

            <div className="public-profile-error-icon">
              !
            </div>

            <h2>
              Profile unavailable
            </h2>

            <p>
              {error ||
                "Unable to load this profile."}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="public-profile-retry-button"
            >
              Try again
            </button>

          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile =
    user?.id &&
    Number(user.id) ===
      Number(profileUser.id);

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="public-profile-page">

      <div className="public-profile-container">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="public-profile-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* ======================================
            PROFILE CARD
        ====================================== */}

        <section className="public-profile-card">

          <div className="public-profile-main">

            {/* PROFILE PHOTO */}

            <div className="public-profile-avatar">

              {profileUser.profilePhotoUrl ? (
                <img
                  src={
                    profileUser.profilePhotoUrl
                  }
                  alt={
                    profileUser.username ||
                    "Profile"
                  }
                />
              ) : (
                <span>
                  {getInitial(
                    profileUser.username
                  )}
                </span>
              )}

            </div>

            {/* USER INFORMATION */}

            <div className="public-profile-information">

              <div className="public-profile-name-row">

                <h1>
                  {profileUser.username}
                </h1>

                {!isOwnProfile && (
                  <button
                    type="button"
                    className={`public-profile-follow-button ${
                      isFollowing
                        ? "following"
                        : ""
                    }`}
                    onClick={
                      handleFollowToggle
                    }
                    disabled={
                      followLoading
                    }
                  >

                    {isFollowing ? (
                      <>
                        <UserCheck
                          size={17}
                        />

                        {followLoading
                          ? "Updating..."
                          : "Following"}
                      </>
                    ) : (
                      <>
                        <UserPlus
                          size={17}
                        />

                        {followLoading
                          ? "Updating..."
                          : "Follow"}
                      </>
                    )}

                  </button>
                )}

              </div>

              <div className="public-profile-details">

                <div className="public-profile-detail">

                  <Mail size={16} />

                  <span>
                    {profileUser.email ||
                      "Email not available"}
                  </span>

                </div>

                <div className="public-profile-detail">

                  <CalendarDays
                    size={16}
                  />

                  <span>
                    {formatMemberSince(
                      profileUser.createdAt
                    )}
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* ====================================
              STATS
          ==================================== */}

          <div className="public-profile-stats">

            {/* MEMORIES */}

            <div className="public-profile-stat">

              <strong>
                {posts.length}
              </strong>

              <span>
                Memories
              </span>

            </div>

            {/* FOLLOWERS */}

            <button
              type="button"
              className="public-profile-stat public-profile-stat-button"
              onClick={() => {
                console.log(
                  "Followers clicked"
                );

                openConnections(
                  "followers"
                );
              }}
            >

              <strong>
                {followersCount}
              </strong>

              <span>
                Followers
              </span>

            </button>

            {/* FOLLOWING */}

            <button
              type="button"
              className="public-profile-stat public-profile-stat-button"
              onClick={() => {
                console.log(
                  "Following clicked"
                );

                openConnections(
                  "following"
                );
              }}
            >

              <strong>
                {followingCount}
              </strong>

              <span>
                Following
              </span>

            </button>

          </div>

        </section>

        {/* ======================================
            MEMORIES
        ====================================== */}

        <section className="public-profile-memories-section">

          <div className="public-profile-memories-heading">

            <ImageIcon size={22} />

            <h2>
              {profileUser.username}'s
              Memories
            </h2>

          </div>

          {posts.length > 0 ? (

            <div className="public-profile-memory-grid">

              {posts.map((post) => {

                const media =
                  getFirstMedia(post);

                const mediaUrl =
                  getMediaUrl(media);

                const mediaType =
                  getMediaType(media);

                return (
                  <article
                    key={post.id}
                    className="public-profile-memory-card"
                    onClick={() =>
                      handleMemoryClick(
                        post
                      )
                    }
                  >

                    <div className="public-profile-memory-media">

                      {mediaUrl ? (

                        mediaType ===
                        "VIDEO" ? (

                          <video
                            src={mediaUrl}
                            className="public-profile-memory-media-content"
                            muted
                            controls
                            preload="metadata"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          />

                        ) : (

                          <img
                            src={mediaUrl}
                            alt={
                              post.description ||
                              "Memory"
                            }
                            className="public-profile-memory-media-content"
                            loading="lazy"
                            onError={(event) => {

                              event.currentTarget.style.display =
                                "none";

                              const fallback =
                                event.currentTarget
                                  .parentElement
                                  ?.querySelector(
                                    ".public-profile-memory-fallback"
                                  );

                              if (fallback) {
                                fallback.style.display =
                                  "flex";
                              }

                            }}
                          />

                        )

                      ) : null}

                      <div
                        className="public-profile-memory-fallback"
                        style={{
                          display:
                            mediaUrl
                              ? "none"
                              : "flex",
                        }}
                      >

                        <ImageIcon
                          size={38}
                        />

                        <span>
                          No image
                        </span>

                      </div>

                      {mediaUrl &&
                        mediaType ===
                          "VIDEO" && (

                          <div className="public-profile-video-badge">

                            <Play
                              size={13}
                              fill="currentColor"
                            />

                            Video

                          </div>

                        )}

                    </div>

                    <div className="public-profile-memory-content">

                      {post.location && (

                        <div className="public-profile-memory-location">

                          <MapPin
                            size={14}
                          />

                          <span>
                            {
                              post.location
                            }
                          </span>

                        </div>

                      )}

                      {post.description && (

                        <h3>
                          {
                            post.description
                          }
                        </h3>

                      )}

                      {post.category && (

                        <span className="public-profile-memory-category">
                          {
                            post.category
                          }
                        </span>

                      )}

                    </div>

                  </article>
                );
              })}

            </div>

          ) : (

            <div className="public-profile-empty-memories">

              <div className="public-profile-empty-icon">

                <ImageIcon
                  size={30}
                />

              </div>

              <h3>
                No memories yet
              </h3>

              <p>
                {profileUser.username}{" "}
                hasn't shared any
                memories yet.
              </p>

            </div>

          )}

        </section>

      </div>

      {/* ==========================================
          FOLLOWERS / FOLLOWING POPUP
      ========================================== */}

      {connectionType && (

        <div
          className="connections-modal-overlay"
          onClick={closeConnections}
        >

          <div
            className="connections-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="connections-modal-header">

              <h2>
                {connectionType ===
                "followers"
                  ? "Followers"
                  : "Following"}
              </h2>

              <button
                type="button"
                className="connections-modal-close"
                onClick={
                  closeConnections
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* BODY */}

            <div className="connections-modal-body">

              {connectionLoading ? (

                <div className="connections-loading">
                  Loading...
                </div>

              ) : connectionUsers.length >
                0 ? (

                connectionUsers.map(
                  (connectionUser) => (

                    <button
                      type="button"
                      key={
                        connectionUser.id
                      }
                      className="connection-user-row"
                      onClick={() => {

                        closeConnections();

                        navigate(
                          `/profile/${connectionUser.id}`
                        );

                      }}
                    >

                      {/* PHOTO */}

                      <div className="connection-user-avatar">

                        {connectionUser.profilePhotoUrl ? (

                          <img
                            src={
                              connectionUser.profilePhotoUrl
                            }
                            alt={
                              connectionUser.username ||
                              "User"
                            }
                          />

                        ) : (

                          <span>
                            {connectionUser.username
                              ?.charAt(
                                0
                              )
                              .toUpperCase() ||
                              "U"}
                          </span>

                        )}

                      </div>

                      {/* USERNAME */}

                      <div className="connection-user-info">

                        <strong>
                          {
                            connectionUser.username
                          }
                        </strong>

                        {connectionUser.email && (
                          <span>
                            {
                              connectionUser.email
                            }
                          </span>
                        )}

                      </div>

                    </button>

                  )
                )

              ) : (

                <div className="connections-empty">

                  <p>
                    {connectionType ===
                    "followers"
                      ? "No followers yet."
                      : "Not following anyone yet."}
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default PublicProfile;